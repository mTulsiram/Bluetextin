const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

async function walkAndClean(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkAndClean(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      let content = await fs.readFile(fullPath, "utf8");
      
      // Remove external CDN script tags
      const cleaned = content.replace(/<script\s+src=["']https?:\/\/cdn\.jsdelivr\.net[^"']*["'][^>]*><\/script>/gi, "");
      
      if (cleaned !== content) {
        await fs.writeFile(fullPath, cleaned, "utf8");
        console.log(`Cleaned CDN from: ${path.relative(ROOT, fullPath)}`);
      }
    }
  }
}

async function main() {
  console.log("Cleaning all external CDN script tags across project...");
  await walkAndClean(ROOT);
  console.log("Done.");
}

main().catch(console.error);
