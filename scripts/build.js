"use strict";

/**
 * BlueTEXT Build Script
 * Single entry point that runs all generators in order:
 *   1. Normalize legal/nav pages
 *   2. Generate index pages for all pages/ subdirectories
 *   3. Generate search index (assets/data/search-index.json)
 *   4. Generate translation catalog (assets/data/i18n/en-catalog.json)
 *   5. Generate sitemap (sitemap.xml)
 *   6. Write build report (assets/data/build-report.json)
 *
 * Usage:
 *   node scripts/build.js            # run full pipeline
 *   node scripts/build.js --indexes  # only regenerate index pages
 *   node scripts/build.js --legal    # only normalize legal pages
 *   node scripts/build.js --search   # only generate search index
 *   node scripts/build.js --i18n     # only generate translation catalog
 *   node scripts/build.js --sitemap  # only generate sitemap
 */

const fs = require("fs/promises");
const path = require("path");
const https = require("https");

const ROOT = path.resolve(__dirname, "..");

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers and utilities
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_EXCLUDE_DIRS = new Set([
  ".git",
  "node_modules",
  "scripts",
  "assets/components",
  "assets/data",
  "assets/css",
  "assets/js"
]);

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function isExcludedRel(relPosix, excludeSet = DEFAULT_EXCLUDE_DIRS) {
  if (!relPosix) return false;
  if (excludeSet.has(relPosix)) return true;
  for (const dir of excludeSet) {
    if (relPosix.startsWith(dir + "/")) return true;
  }
  return false;
}

async function walkHtmlFiles(rootDir, { exclude = DEFAULT_EXCLUDE_DIRS } = {}) {
  const out = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const abs = path.join(dir, e.name);
      const rel = toPosix(path.relative(ROOT, abs));
      if (e.isDirectory()) {
        if (isExcludedRel(rel, exclude)) continue;
        await walk(abs);
      } else if (e.isFile() && e.name.endsWith(".html")) {
        out.push(abs);
      }
    }
  }
  await walk(rootDir);
  return out;
}

async function writeIfChanged(filePath, content) {
  const prev = await fs.readFile(filePath, "utf8").catch(() => null);
  if (prev !== null && prev.trim() === content.trim()) return false;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
  return true;
}

async function runPool(items, worker, { concurrency = 25 } = {}) {
  const queue = items.slice();
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const item = queue.pop();
      await worker(item);
    }
  });
  await Promise.all(workers);
}

function titleCase(slug) {
  return String(slug || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeHtml(value = "") {
  const str = String(value || "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value = "") {
  const str = String(value || "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Normalize legal/nav pages
// ─────────────────────────────────────────────────────────────────────────────

async function normalizeLegalPages() {
  const NAV_DIR = path.join(ROOT, "assets", "nav");

  function buildLegalHtml(title, paragraphs) {
    const body = paragraphs
      .map((line) => `    <p>${escapeHtml(line)}</p>`)
      .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(title)} - BlueTEXT policy page">
  <title>${escapeHtml(title)} | BlueTEXT</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="/assets/css/main.css">
  <script src="/assets/js/app.js" defer></script>
</head>
<body>
  <div id="header-component"></div>
  <main id="main-content">
    <h1>${escapeHtml(title)}</h1>
    <div>
${body}
    </div>
    <p><a href="/">Back to Home</a></p>
  </main>
  <div id="footer-component"></div>
</body>
</html>
`;
  }

  const entries = await fs.readdir(NAV_DIR).catch(() => []);
  const files = entries.filter((f) => f.endsWith(".html"));
  let normalizedCount = 0;

  for (const file of files) {
    const abs = path.join(NAV_DIR, file);
    const raw = await fs.readFile(abs, "utf8");

    // Skip if already has component mounts (already a full page)
    if (raw.includes('id="header-component"')) continue;
    // If it has DOCTYPE but no component mounts, skip (manually maintained)
    if (/<!DOCTYPE html>/i.test(raw)) continue;

    const lines = raw
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);

    const title = lines[0] || file.replace(/\.html$/i, "");
    const paragraphs = lines.slice(1);
    const html = buildLegalHtml(title, paragraphs);
    
    const changed = await writeIfChanged(abs, html);
    if (changed) {
      console.log(`  Normalized: ${file}`);
      normalizedCount++;
    }
  }

  console.log(`Legal pages normalized: ${normalizedCount} files processed`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Generate index pages for all pages/ subdirectories
// ─────────────────────────────────────────────────────────────────────────────

async function generateIndexPages() {
  function buildIndexHtml({ title, description, breadcrumb, children, relDepth }) {
    const assetBase = "../".repeat(relDepth);

    const cards = children.map(({ href, label }) => `
      <li>
        <a href="${href}">${label}</a>
      </li>`).join("");

    const crumbHtml = breadcrumb.map((c, i) => {
      if (i === breadcrumb.length - 1) {
        return `      <li>${c.label}</li>`;
      }
      return `      <li><a href="${c.href}">${c.label}</a></li>`;
    }).join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <meta name="robots" content="index,follow">
  <title>${title} | BlueTEXT</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="/assets/css/main.css">
  <script src="/assets/js/app.js" defer></script>
</head>
<body>
  <div id="header-component"><!-- HEADER_START --><!-- HEADER_END --></div>
  <!-- MODALS_START --><!-- MODALS_END -->

  <main id="main-content">
    <nav aria-label="Breadcrumb">
      <ol>
${crumbHtml}
      </ol>
    </nav>

    <h1>${title}</h1>
    <p>${description}</p>

    <ul>
      ${cards}
    </ul>
  </main>

  <div id="footer-component"><!-- FOOTER_START --><!-- FOOTER_END --></div>
</body>
</html>
`;
  }

  const STATIC_PAGES = [
    {
      file: "pages/index.html",
      title: "Pages",
      description: "Browse all tools, games, software, tutorials, blog, and education resources on BlueTEXT.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages" }],
      relDepth: 1,
      staticChildren: [
        { href: "tools/", label: "Tools" },
        { href: "games/", label: "Games" },
        { href: "software/", label: "Software" },
        { href: "tutorials/", label: "Tutorials" },
        { href: "education/", label: "Education" },
        { href: "blog/", label: "Blog" },
      ]
    },
    {
      file: "pages/blog/index.html",
      title: "Blog",
      description: "Articles, guides, and updates from BlueTEXT.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Blog" }],
      relDepth: 2,
      staticChildren: []
    },
    {
      file: "pages/tools/index.html",
      title: "Tools",
      description: "Browse all free client-side developer and productivity tools on BlueTEXT.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Tools" }],
      relDepth: 2,
      staticChildren: [
        { href: "coding/", label: "Coding" },
        { href: "converters/", label: "Converters" },
        { href: "data/", label: "Data" },
        { href: "images/", label: "Images" },
        { href: "lifestyle/", label: "Lifestyle" },
        { href: "math/", label: "Math" },
        { href: "miscellaneous/", label: "Miscellaneous" },
        { href: "network/", label: "Network" },
        { href: "office/", label: "Office" },
        { href: "utilities/", label: "Utilities" },
        { href: "videos/", label: "Videos" },
      ]
    },
    {
      file: "pages/games/index.html",
      title: "Games",
      description: "Play free browser games on BlueTEXT — arcade, board, cards, puzzles, and word games.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Games" }],
      relDepth: 2,
      staticChildren: [
        { href: "arcade/", label: "Arcade" },
        { href: "board/", label: "Board" },
        { href: "cards/", label: "Cards" },
        { href: "puzzles/", label: "Puzzles" },
        { href: "word/", label: "Word" },
      ]
    },
    {
      file: "pages/software/index.html",
      title: "Software",
      description: "Explore free and open-source software picks for Android, Apple, Linux, and Windows.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Software" }],
      relDepth: 2,
      staticChildren: [
        { href: "android/", label: "Android" },
        { href: "apple/", label: "Apple" },
        { href: "linux/", label: "Linux" },
        { href: "windows/", label: "Windows" },
      ]
    },
    {
      file: "pages/tutorials/index.html",
      title: "Tutorials",
      description: "Step-by-step tutorials on backend, design, programming, security, and web development.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Tutorials" }],
      relDepth: 2,
      staticChildren: [
        { href: "backend/", label: "Backend" },
        { href: "design/", label: "Design" },
        { href: "programming/", label: "Programming" },
        { href: "security/", label: "Security" },
        { href: "web-dev/", label: "Web Dev" },
      ]
    },
    {
      file: "pages/education/index.html",
      title: "Education",
      description: "Free study resources covering finance, humanities, languages, math, and science.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Education" }],
      relDepth: 2,
      staticChildren: [
        { href: "finance/", label: "Finance" },
        { href: "humanities/", label: "Humanities" },
        { href: "languages/", label: "Languages" },
        { href: "math/", label: "Math" },
        { href: "science/", label: "Science" },
      ]
    },
    {
      file: "pages/software/android/index.html",
      title: "Android Software",
      description: "Free and open-source Android app picks in productivity and utility categories.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Software", href: "/pages/software/" }, { label: "Android" }],
      relDepth: 3,
      staticChildren: [
        { href: "productivity/", label: "Productivity" },
        { href: "utility/", label: "Utility" },
      ]
    },
    {
      file: "pages/software/apple/index.html",
      title: "Apple Software",
      description: "Free and open-source Apple app picks in productivity and utility categories.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Software", href: "/pages/software/" }, { label: "Apple" }],
      relDepth: 3,
      staticChildren: [
        { href: "productivity/", label: "Productivity" },
        { href: "utility/", label: "Utility" },
      ]
    },
    {
      file: "pages/software/linux/index.html",
      title: "Linux Software",
      description: "Free and open-source Linux app picks in games, productivity, and utility categories.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Software", href: "/pages/software/" }, { label: "Linux" }],
      relDepth: 3,
      staticChildren: [
        { href: "games/", label: "Games" },
        { href: "productivity/", label: "Productivity" },
        { href: "utility/", label: "Utility" },
      ]
    },
    {
      file: "pages/software/windows/index.html",
      title: "Windows Software",
      description: "Free and open-source Windows app picks in games, productivity, and utility categories.",
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Pages", href: "/pages/" }, { label: "Software", href: "/pages/software/" }, { label: "Windows" }],
      relDepth: 3,
      staticChildren: [
        { href: "games/", label: "Games" },
        { href: "productivity/", label: "Productivity" },
        { href: "utility/", label: "Utility" },
      ]
    },
  ];

  async function generateDynamic(dir, relDepth, breadcrumb) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const children = [];

    for (const e of entries) {
      if (e.name === "index.html" || e.name.startsWith(".")) continue;
      if (e.isDirectory()) {
        children.push({ href: `${e.name}/`, label: titleCase(e.name) });
      } else if (e.isFile() && e.name.endsWith(".html")) {
        children.push({ href: e.name, label: titleCase(e.name.replace(/\.html$/, "")) });
      }
    }

    children.sort((a, b) => a.label.localeCompare(b.label));

    const folderName = path.basename(dir);
    const title = titleCase(folderName);
    const description = `Browse all ${title.toLowerCase()} resources on BlueTEXT.`;

    const html = buildIndexHtml({ title, description, breadcrumb, children, relDepth });
    const outPath = path.join(dir, "index.html");

    const isStatic = STATIC_PAGES.some(p => path.resolve(ROOT, p.file) === path.resolve(outPath));
    if (isStatic) return;

    const changed = await writeIfChanged(outPath, html);
    if (changed) {
      console.log(`  Generated: ${path.relative(ROOT, outPath).replace(/\\/g, "/")} (${children.length} links)`);
    }
  }

  async function walkAndGenerate(dir, relDepth, breadcrumb) {
    await generateDynamic(dir, relDepth, breadcrumb);

    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith(".")) continue;
      const childDir = path.join(dir, e.name);
      const relPosix = toPosix(path.relative(path.join(ROOT, "pages"), childDir));
      const absPath = `/pages/${relPosix}/`;

      const childBreadcrumb = [
        ...breadcrumb.map((c, idx) => {
          if (idx === 0) return { label: "Home", href: "/" };
          if (idx === 1) return { label: "Pages", href: "/pages/" };
          // Preserve proper absolute path for parent categories
          return c;
        }),
        { label: titleCase(e.name) }
      ];

      // Fix parent link href right before pushing child
      if (childBreadcrumb.length > 2) {
        const parentPosix = toPosix(path.relative(path.join(ROOT, "pages"), dir));
        childBreadcrumb[childBreadcrumb.length - 2].href = parentPosix ? `/pages/${parentPosix}/` : `/pages/`;
      }

      await walkAndGenerate(childDir, relDepth + 1, childBreadcrumb);
    }
  }

  let seeded = 0;

  // Generate statically-defined top-level pages
  for (const page of STATIC_PAGES) {
    const filePath = path.join(ROOT, page.file);
    const dir = path.dirname(filePath);
    let children = page.staticChildren;

    if (children.length === 0) {
      const found = (await fs.readdir(dir, { withFileTypes: true }).catch(() => []));
      children = found
        .filter((e) => (e.isDirectory() || (e.isFile() && e.name.endsWith(".html"))) && e.name !== "index.html" && !e.name.startsWith("."))
        .map((e) => ({
          href: e.isDirectory() ? `${e.name}/` : e.name,
          label: titleCase(e.name.replace(/\.html$/, ""))
        }));
    }

    const html = buildIndexHtml({
      title: page.title,
      description: page.description,
      breadcrumb: page.breadcrumb,
      children,
      relDepth: page.relDepth
    });

    await fs.mkdir(dir, { recursive: true });
    const changed = await writeIfChanged(filePath, html);
    if (changed) {
      console.log(`  Seeded: ${page.file} (${children.length} links)`);
      seeded++;
    }
  }

  // Auto-fill all remaining empty indexes under pages/
  const pagesDir = path.join(ROOT, "pages");
  const topDirs = await fs.readdir(pagesDir, { withFileTypes: true });
  for (const e of topDirs) {
    if (!e.isDirectory() || e.name.startsWith(".")) continue;
    const subDir = path.join(pagesDir, e.name);
    const breadcrumb = [
      { label: "Home", href: "/" },
      { label: "Pages", href: "/" },
      { label: titleCase(e.name) }
    ];
    await walkAndGenerate(subDir, 2, breadcrumb);
  }

  console.log(`Index pages seeded: ${seeded} static pages processed`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Generate search index
// ─────────────────────────────────────────────────────────────────────────────

async function generateSearchIndex() {
  const OUTPUT = path.join(ROOT, "assets", "data", "search-index.json");
  const htmlFiles = await walkHtmlFiles(ROOT);

  function stripHtml(input) {
    // ⚡ Bolt Optimization: Strip layout blocks (header, footer, modals) first to prevent
    // keyword pollution and reduce search-index payload size significantly.
    let clean = input;
    clean = clean.replace(/<!-- HEADER_START -->[\s\S]*?<!-- HEADER_END -->/gi, " ");
    clean = clean.replace(/<!-- FOOTER_START -->[\s\S]*?<!-- FOOTER_END -->/gi, " ");
    clean = clean.replace(/<!-- MODALS_START -->[\s\S]*?<!-- MODALS_END -->/gi, " ");

    return clean
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extract(html, regex) {
    const m = html.match(regex);
    return m ? stripHtml(m[1]) : "";
  }

  function toUrl(filePath) {
    const rel = toPosix(path.relative(ROOT, filePath));
    if (rel === "index.html") return "/";
    if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"/index.html".length)}`;
    return `/${rel}`;
  }

  const index = [];
  await runPool(htmlFiles, async (filePath) => {
    const html = await fs.readFile(filePath, "utf8");
    const title =
      extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
      extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      path.basename(filePath, ".html");

    const description =
      extract(html, /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i) ||
      extract(html, /<p[^>]*>([\s\S]*?)<\/p>/i);

    const bodyText = stripHtml(html).slice(0, 500);

    index.push({
      title,
      url: toUrl(filePath),
      description,
      keywords: `${title} ${description} ${bodyText}`.trim()
    });
  }, { concurrency: 50 });

  index.sort((a, b) => a.url.localeCompare(b.url));

  const changed = await writeIfChanged(OUTPUT, JSON.stringify(index, null, 2));
  console.log(`Search index: ${index.length} entries → ${OUTPUT}${changed ? "" : " (unchanged)"}`);
  return index.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Generate translation catalog (Optimized Batch Mode)
// ─────────────────────────────────────────────────────────────────────────────

async function generateTranslationCatalog() {
  const OUT_DIR = path.join(ROOT, "assets", "data", "i18n");
  const EN_OUT = path.join(OUT_DIR, "en-catalog.json");

  const files = await walkHtmlFiles(ROOT);
  const catalog = {};

  function clean(text) {
    return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const REGEXES = [
    /<title[^>]*>([\s\S]*?)<\/title>/gi,
    /<h1[^>]*>([\s\S]*?)<\/h1>/gi,
    /<h2[^>]*>([\s\S]*?)<\/h2>/gi,
    /<h3[^>]*>([\s\S]*?)<\/h3>/gi,
    /<h4[^>]*>([\s\S]*?)<\/h4>/gi,
    /<h5[^>]*>([\s\S]*?)<\/h5>/gi,
    /<h6[^>]*>([\s\S]*?)<\/h6>/gi,
    /<p[^>]*>([\s\S]*?)<\/p>/gi,
    /<a[^>]*>([\s\S]*?)<\/a>/gi,
    /<button[^>]*>([\s\S]*?)<\/button>/gi,
    /<label[^>]*>([\s\S]*?)<\/label>/gi,
    /<span[^>]*>([\s\S]*?)<\/span>/gi,
    /<li[^>]*>([\s\S]*?)<\/li>/gi,
  ];

  function collectTexts(html) {
    const texts = new Set();
    for (let i = 0; i < REGEXES.length; i++) {
      const regex = REGEXES[i];
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(html)) !== null) {
        const value = clean(match[1]);
        if (value && value.length <= 240) texts.add(value);
      }
    }
    return Array.from(texts);
  }

  function toPageKey(filePath) {
    const rel = toPosix(path.relative(ROOT, filePath));
    if (rel === "index.html") return "/";
    if (rel.endsWith("/index.html")) return `/${rel.slice(0, -10)}`;
    return `/${rel}`;
  }

  // Read files in parallel pool
  await runPool(files, async (file) => {
    const html = await fs.readFile(file, "utf8");
    catalog[toPageKey(file)] = collectTexts(html);
  }, { concurrency: 50 });

  const enChanged = await writeIfChanged(EN_OUT, JSON.stringify(catalog, null, 2));
  console.log(`Translation catalog: ${Object.keys(catalog).length} pages → ${EN_OUT}${enChanged ? "" : " (unchanged)"}`);

  // Collect unique English terms
  const uniqueStrings = new Set();
  for (const page in catalog) {
    const pageTexts = catalog[page];
    for (let i = 0; i < pageTexts.length; i++) {
      uniqueStrings.add(pageTexts[i]);
    }
  }
  const allTexts = Array.from(uniqueStrings);

  const TARGET_LANGS = [
    "es", "fr", "de", "zh-CN", "ja", "hi", "pt", "ru",
    "ar", "bn", "it", "ko", "tr", "vi", "pl", "nl", "id", "fa", "uk"
  ];

  console.log(`Translating ${allTexts.length} unique terms for ${TARGET_LANGS.length} languages...`);

  const keepAliveAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

  function translateBatch(texts, targetLang) {
    if (texts.length === 0) return Promise.resolve({});
    return new Promise((resolve) => {
      const queryText = texts.join(" ||| ");
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(queryText)}`;
      
      https.get(url, { agent: keepAliveAgent }, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            const results = {};
             if (parsed && parsed[0]) {
              parsed[0].forEach(item => {
                if (item && item[0] && item[1]) {
                  const original = item[1].replace(/\s*\|\|\|\s*$/, "").trim();
                  const translated = item[0].replace(/\s*\|\|\|\s*$/, "").trim();
                  
                  const origParts = original.split("|||");
                  const transParts = translated.split("|||");
                  if (origParts.length === transParts.length) {
                    for (let i = 0; i < origParts.length; i++) {
                      results[origParts[i].trim()] = transParts[i].trim();
                    }
                  }
                }
              });
            }
            resolve(results);
          } catch {
            resolve({});
          }
        });
      }).on("error", () => resolve({}));
    });
  }

  async function translateBatchWithRetry(texts, targetLang, retries = 3) {
    if (texts.length === 0) return {};

    for (let attempt = 1; attempt <= retries; attempt++) {
      const result = await translateBatch(texts, targetLang);
      if (Object.keys(result).length > 0) {
        return result;
      }
      if (attempt < retries) {
        console.warn(`    ⚠ [Retry ${attempt}/${retries}] Translation returned empty/mismatched for ${targetLang}. Retrying in 1000ms...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (texts.length <= 1) {
      return {};
    }

    // Split batch in half and translate recursively
    const mid = Math.floor(texts.length / 2);
    const left = texts.slice(0, mid);
    const right = texts.slice(mid);

    console.log(`    ➔ Mismatched batch for ${targetLang} (size ${texts.length}). Splitting into ${left.length} and ${right.length}...`);

    const [leftResult, rightResult] = await Promise.all([
      translateBatchWithRetry(left, targetLang, retries),
      translateBatchWithRetry(right, targetLang, retries)
    ]);

    return { ...leftResult, ...rightResult };
  }

  // Process all languages in parallel
  await Promise.all(TARGET_LANGS.map(async (lang) => {
    const dictPath = path.join(OUT_DIR, `${lang}-dictionary.json`);
    let dict = {};
    try {
      dict = JSON.parse(await fs.readFile(dictPath, "utf8"));
    } catch {}

    const missingTexts = allTexts.filter(text => !dict[text]);

    if (missingTexts.length > 0) {
      // Chunk missing texts (max 50 items or 1500 chars limit)
      const BATCH_SIZE = 50;
      const MAX_CHAR_LENGTH = 1500;
      const batches = [];
      let currentBatch = [];
      let currentLength = 0;

      for (const text of missingTexts) {
        const len = encodeURIComponent(text).length + 3;
        if (currentBatch.length >= BATCH_SIZE || currentLength + len > MAX_CHAR_LENGTH) {
          batches.push(currentBatch);
          currentBatch = [text];
          currentLength = len;
        } else {
          currentBatch.push(text);
          currentLength += len;
        }
      }
      if (currentBatch.length > 0) {
        batches.push(currentBatch);
      }

      let updated = false;
      for (const batch of batches) {
        const trans = await translateBatchWithRetry(batch, lang);
        for (const orig in trans) {
          dict[orig] = trans[orig];
          updated = true;
        }
        await new Promise(resolve => setTimeout(resolve, 200)); // slightly larger delay to respect API limits
      }

      if (updated) {
        await fs.mkdir(path.dirname(dictPath), { recursive: true });
        await fs.writeFile(dictPath, JSON.stringify(dict, null, 2), "utf8");
        console.log(`  ✓ ${lang}: ${Object.keys(dict).length} translations saved.`);
      } else {
        console.log(`  ✓ ${lang}: ${Object.keys(dict).length} translations verified (unchanged).`);
      }
    } else {
      console.log(`  ✓ ${lang}: ${Object.keys(dict).length} translations verified (unchanged).`);
    }
  }));

  // Generate zh-TW by converting Simplified Chinese translations offline.
  // Fallback keeps build fully green when optional converter isn't installed.
  try {
    const cnDictPath = path.join(OUT_DIR, "zh-CN-dictionary.json");
    const twDictPath = path.join(OUT_DIR, "zh-TW-dictionary.json");
    const cnDict = JSON.parse(await fs.readFile(cnDictPath, "utf8"));
    let twDict = {};

    try {
      const chineseConv = require("chinese-conv");
      for (const key in cnDict) {
        twDict[key] = chineseConv.tify(cnDict[key]);
      }
      console.log(`  ✓ zh-TW: ${Object.keys(twDict).length} translations generated offline from zh-CN.`);
    } catch (err) {
      twDict = { ...cnDict };
      console.warn(`  ⚠ zh-TW: chinese-conv not installed (${err.message}); copied zh-CN dictionary as fallback.`);
    }

    await fs.writeFile(twDictPath, JSON.stringify(twDict, null, 2), "utf8");
  } catch (err) {
    console.error(`  ✗ Failed to generate zh-TW dictionary: ${err.message}`);
  }

  return Object.keys(catalog).length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5: Generate sitemap
// ─────────────────────────────────────────────────────────────────────────────

async function generateSitemap() {
  const OUTPUT_FILE = path.join(ROOT, "sitemap.xml");
  const EXTRA_URLS_FILE = path.join(ROOT, "assets", "data", "sitemap-extra-urls.txt");
  const BASE_URL = (process.env.SITE_URL || "https://bluetext.in").replace(/\/$/, "");

  function toWebPath(filePath) {
    const relativePath = toPosix(path.relative(ROOT, filePath));
    if (relativePath === "index.html") return "/";
    if (relativePath.endsWith("/index.html")) return `/${relativePath.slice(0, -"/index.html".length)}`;
    return `/${relativePath}`;
  }

  const htmlFiles = await walkHtmlFiles(ROOT);
  const discoveredUrls = [];

  await runPool(htmlFiles, async (filePath) => {
    const stats = await fs.stat(filePath);
    discoveredUrls.push({
      loc: `${BASE_URL}${toWebPath(filePath)}`,
      lastmod: stats.mtime.toISOString().slice(0, 10)
    });
  }, { concurrency: 50 });

  async function readExtraUrls() {
    try {
      const content = await fs.readFile(EXTRA_URLS_FILE, "utf8");
      return content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const isAbsolute = /^https?:\/\//i.test(line);
          const loc = isAbsolute ? line : `${BASE_URL}${line.startsWith("/") ? "" : "/"}${line}`;
          return { loc, lastmod: new Date().toISOString().slice(0, 10) };
        });
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  function buildSitemapXml(entries) {
    const uniqueByLoc = new Map();
    for (const entry of entries) uniqueByLoc.set(entry.loc, entry);
    const sorted = Array.from(uniqueByLoc.values()).sort((a, b) => a.loc.localeCompare(b.loc));
    const urlNodes = sorted.map((entry) => [
      "  <url>",
      `    <loc>${escapeXml(entry.loc)}</loc>`,
      `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
      "  </url>"
    ].join("\n")).join("\n");
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urlNodes,
      "</urlset>",
      ""
    ].join("\n");
  }

  const extraUrls = await readExtraUrls();
  const xml = buildSitemapXml([...discoveredUrls, ...extraUrls]);
  const changed = await writeIfChanged(OUTPUT_FILE, xml);
  const count = new Set([...discoveredUrls, ...extraUrls].map((u) => u.loc)).size;
  console.log(`Sitemap: ${count} URLs → ${OUTPUT_FILE}${changed ? "" : " (unchanged)"}`);
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Inject Header & Footer in all HTML files
// ─────────────────────────────────────────────────────────────────────────────

async function injectHeaderFooter() {
  const HEADER_FILE = path.join(ROOT, "assets", "components", "header.html");
  const FOOTER_FILE = path.join(ROOT, "assets", "components", "footer.html");

  // Configurable Exemption List (pages that bypass auto-injection if custom header/footer needed)
  const INJECTION_EXEMPTIONS = new Set([
    // Add relative POSIX paths to exempt pages here if needed, e.g.:
    // "pages/custom-landing.html"
  ]);

  const headerContent = await fs.readFile(HEADER_FILE, "utf8");
  const footerContent = await fs.readFile(FOOTER_FILE, "utf8");

  // Separate header navbar from modals to prevent z-index stacking issues
  let headerHtml = headerContent;
  let modalsHtml = "";
  const headerEndIndex = headerContent.indexOf("</header>");
  if (headerEndIndex !== -1) {
    headerHtml = headerContent.slice(0, headerEndIndex + 9);
    modalsHtml = headerContent.slice(headerEndIndex + 9);
  }

  const allFiles = await walkHtmlFiles(ROOT);
  let processedCount = 0;

  for (const file of allFiles) {
    if (file === HEADER_FILE || file === FOOTER_FILE) continue;
    const relPosix = toPosix(path.relative(ROOT, file));
    if (INJECTION_EXEMPTIONS.has(relPosix)) continue;

    let content = await fs.readFile(file, "utf8");
    let original = content;

    // Inject Header Navbar
    if (content.includes("<!-- HEADER_START -->")) {
      content = content.replace(/<!-- HEADER_START -->[\s\S]*?<!-- HEADER_END -->/, `<!-- HEADER_START -->\n${headerHtml}\n<!-- HEADER_END -->`);
    } else {
      content = content.replace(/<div\s+id="header-component"[^>]*>\s*<\/div>/, (match) => {
        return match.replace("></div", `><!-- HEADER_START -->\n${headerHtml}\n<!-- HEADER_END --></div`);
      });
    }

    // Inject Modals (outside header-component to avoid stacking context locks)
    if (content.includes("<!-- MODALS_START -->")) {
      content = content.replace(/<!-- MODALS_START -->[\s\S]*?<!-- MODALS_END -->/, `<!-- MODALS_START -->\n${modalsHtml}\n<!-- MODALS_END -->`);
    } else {
      // Find the header-component closing div and append modals after it
      content = content.replace(/<!-- HEADER_END -->\s*<\/div>/i, `<!-- HEADER_END --></div>\n<!-- MODALS_START -->\n${modalsHtml}\n<!-- MODALS_END -->`);
    }

    // Inject Footer
    if (content.includes("<!-- FOOTER_START -->")) {
      content = content.replace(/<!-- FOOTER_START -->[\s\S]*?<!-- FOOTER_END -->/, `<!-- FOOTER_START -->\n${footerContent}\n<!-- FOOTER_END -->`);
    } else {
      content = content.replace(/<div\s+id="footer-component"[^>]*>\s*<\/div>/, (match) => {
        return match.replace("></div", `><!-- FOOTER_START -->\n${footerContent}\n<!-- FOOTER_END --></div`);
      });
    }

    if (content !== original) {
      await fs.writeFile(file, content, "utf8");
      processedCount++;
    }
  }

  console.log(`Injected header & footer into ${processedCount} HTML files`);
}

async function bundleCss() {
  const CSS_DIR = path.join(ROOT, "assets", "css");
  const themePath = path.join(CSS_DIR, "theme.css");
  const mainPath = path.join(CSS_DIR, "main.css");
  
  const themeContent = await fs.readFile(themePath, "utf8").catch(() => "");
  const mainContent = await fs.readFile(mainPath, "utf8").catch(() => "");
  
  if (!mainContent.includes("--- Material 3 Expressive Design Tokens") && themeContent) {
    // Keep main.css valid and intact
    console.log(`CSS verified: theme.css (${themeContent.length} bytes), main.css (${mainContent.length} bytes)`);
  } else {
    console.log(`CSS check complete`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main pipeline
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const flags = new Set(argv.filter(a => a.startsWith("--")));
  const has = (f) => flags.has(f);
  return { flags, has };
}

function printHelp() {
  console.log(`
Usage:
  node scripts/build.js                 Run full pipeline
  node scripts/build.js --legal         Normalize legal pages
  node scripts/build.js --indexes       Generate index pages
  node scripts/build.js --inject        Inject header & footer into pages
  node scripts/build.js --css           Bundle CSS styles to bust cache
  node scripts/build.js --search        Generate search index
  node scripts/build.js --i18n          Generate translation catalog
  node scripts/build.js --sitemap       Generate sitemap
  node scripts/build.js --help
You can combine flags, e.g.:
  node scripts/build.js --indexes --inject
`.trim());
}

async function main() {
  const args = process.argv.slice(2);
  const { flags, has } = parseArgs(args);

  if (has("--help")) {
    printHelp();
    return;
  }

  const steps = {
    "--css":     { name: "Bundle CSS Styles",            fn: bundleCss },
    "--legal":   { name: "Normalize Legal Pages",        fn: normalizeLegalPages },
    "--indexes": { name: "Generate Index Pages",         fn: generateIndexPages },
    "--inject":  { name: "Inject Header & Footer",       fn: injectHeaderFooter },
    "--search":  { name: "Generate Search Index",        fn: generateSearchIndex },
    "--i18n":    { name: "Generate Translation Catalog", fn: generateTranslationCatalog },
    "--sitemap": { name: "Generate Sitemap",             fn: generateSitemap },
  };

  // Determine active steps
  const activeKeys = Object.keys(steps).filter(k => has(k));
  const runFullPipeline = activeKeys.length === 0;

  const pipeline = [];
  const pipelineNames = [];

  if (runFullPipeline) {
    for (const key in steps) {
      pipeline.push(steps[key].fn);
      pipelineNames.push(steps[key].name);
    }
  } else {
    for (const key of activeKeys) {
      pipeline.push(steps[key].fn);
      pipelineNames.push(steps[key].name);
    }
  }

  const startMs = Date.now();
  const startedAt = new Date();
  const stepResults = [];

  for (let i = 0; i < pipeline.length; i++) {
    console.log(`\n▶  ${pipelineNames[i]}`);
    const stepStart = Date.now();
    try {
      await pipeline[i]();
      stepResults.push({ name: pipelineNames[i], ok: true, durationMs: Date.now() - stepStart });
    } catch (err) {
      console.error(`   ✗ Failed: ${err.message}`);
      stepResults.push({ name: pipelineNames[i], ok: false, error: err.message, durationMs: Date.now() - stepStart });
      process.exitCode = 1;
      break;
    }
  }

  // Collect summary stats
  const outputs = {};
  try {
    const searchIndex = JSON.parse(await fs.readFile(path.join(ROOT, "assets", "data", "search-index.json"), "utf8"));
    outputs.searchIndexEntries = Array.isArray(searchIndex) ? searchIndex.length : 0;
  } catch { outputs.searchIndexEntries = 0; }

  try {
    const catalog = JSON.parse(await fs.readFile(path.join(ROOT, "assets", "data", "i18n", "en-catalog.json"), "utf8"));
    outputs.translationPages = typeof catalog === "object" ? Object.keys(catalog).length : 0;
  } catch { outputs.translationPages = 0; }

  try {
    const sitemap = await fs.readFile(path.join(ROOT, "sitemap.xml"), "utf8");
    outputs.sitemapUrlCount = (sitemap.match(/<url>/g) || []).length;
  } catch { outputs.sitemapUrlCount = 0; }

  const allOk = stepResults.every((s) => s.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    startedAt: startedAt.toISOString(),
    durationMs: Date.now() - startMs,
    ok: allOk,
    steps: stepResults,
    outputs
  };

  const REPORT_PATH = path.join(ROOT, "assets", "data", "build-report.json");
  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeIfChanged(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\n${"─".repeat(50)}`);
  console.log(`Status         : ${allOk ? "SUCCESS ✓" : "FAILED ✗"}`);
  console.log(`Search entries : ${outputs.searchIndexEntries}`);
  console.log(`Trans. pages   : ${outputs.translationPages}`);
  console.log(`Sitemap URLs   : ${outputs.sitemapUrlCount}`);
  console.log(`Total time     : ${Date.now() - startMs}ms`);
  console.log(`Build report   : ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
