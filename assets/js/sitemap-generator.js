/**
 * sitemap-generator.js
 * =============================================================
 * Generate sitemap.xml from tools.json (client-side utility)
 *
 * Usage (Node.js / Deno):
 *   import SitemapGenerator from './sitemap-generator.js';
 *   const generator = new SitemapGenerator('https://bluetext.in');
 *   const xml = await generator.generate();
 *
 * Or use in browser with build script to generate at build time.
 * =============================================================
 */

class SitemapGenerator {
  constructor(domain = "https://bluetext.in") {
    this.domain = domain;
    this.entries = [];
  }

  /**
   * Fetch and parse JSON data
   */
  async fetchData(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      return null;
    }
  }

  /**
   * Add a URL entry to sitemap
   */
  addEntry(path, { lastmod = null, changefreq = "weekly", priority = "0.7" } = {}) {
    this.entries.push({
      loc: `${this.domain}/${path}`.replace(/\/+/g, "/"),
      lastmod: lastmod || new Date().toISOString().split("T")[0],
      changefreq,
      priority,
    });
  }

  /**
   * Load static pages
   */
  addStaticPages() {
    const staticPages = [
      { path: "index.html", priority: "1.0", changefreq: "daily" },
      { path: "nav/about.html", priority: "0.8", changefreq: "monthly" },
      { path: "nav/contact.html", priority: "0.7", changefreq: "monthly" },
      { path: "nav/privacy.html", priority: "0.6", changefreq: "yearly" },
      { path: "nav/terms.html", priority: "0.6", changefreq: "yearly" },
      { path: "tools-platform/all-tools.html", priority: "0.9", changefreq: "weekly" },
      { path: "404.html", priority: "0.3", changefreq: "monthly" },
    ];

    staticPages.forEach((page) => {
      this.addEntry(page.path, {
        changefreq: page.changefreq,
        priority: page.priority,
      });
    });
  }

  /**
   * Load category pages from navigation.json
   */
  async addCategoryPages() {
    const navData = await this.fetchData("assets/data/navigation.json");
    if (!navData || !navData.categories) return;

    navData.categories.forEach((cat) => {
      const catPath = cat.path
        .replace("tools/", "categories/")
        .replace("/index.html", ".html");

      this.addEntry(catPath, {
        changefreq: "weekly",
        priority: "0.8",
      });
    });
  }

  /**
   * Load ready tool pages from tools.json
   */
  async addToolPages() {
    const toolsData = await this.fetchData("assets/data/tools.json");
    if (!toolsData || !toolsData.tools) return;

    toolsData.tools
      .filter((tool) => tool.status === "ready")
      .forEach((tool) => {
        const priority = tool.featured ? "0.9" : "0.7";
        this.addEntry(tool.slug, {
          changefreq: "monthly",
          priority,
        });
      });
  }

  /**
   * Generate sitemap XML string
   */
  generateXml() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    this.entries.forEach((entry) => {
      xml += `  <url>\n`;
      xml += `    <loc>${this.escapeXml(entry.loc)}</loc>\n`;
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += "</urlset>\n";
    return xml;
  }

  /**
   * Escape XML special characters
   */
  escapeXml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Generate complete sitemap
   */
  async generate() {
    this.addStaticPages();
    await this.addCategoryPages();
    await this.addToolPages();

    return this.generateXml();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalEntries: this.entries.length,
      staticPages: this.entries.filter((e) =>
        ["index.html", "nav/", "tools-platform/", "404.html"].some((p) =>
          e.loc.includes(p)
        )
      ).length,
      categoryPages: this.entries.filter((e) => e.loc.includes("categories/"))
        .length,
      toolPages: this.entries.filter(
        (e) =>
          e.loc.includes("tools/") && !e.loc.includes("tools-platform/")
      ).length,
    };
  }
}

// Export for Node.js / Deno
if (typeof module !== "undefined" && module.exports) {
  module.exports = SitemapGenerator;
}
