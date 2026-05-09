/**
 * tool-runtime.js
 * =============================================================
 * Client-side runtime for individual tool pages.
 *
 * Responsibilities:
 * - Read data-tool-id from page DOM
 * - Load tools.json and resolve metadata
 * - Inject title, meta description, og:image, etc.
 * - Handle "coming-soon" state fallback
 * - Provide window.currentTool for tool pages to access their metadata
 *
 * Usage:
 * <html data-tool-id="bmi-calculator">
 *   <head>
 *     <script src="assets/js/tool-runtime.js"></script>
 *   </head>
 * </html>
 * =============================================================
 */

(function () {
  "use strict";

  // Global catalog (will be populated from tools.json)
  let toolsCatalog = null;
  window.currentTool = null;

  /**
   * Load tools.json from assets/data/
   */
  async function loadToolsCatalog() {
    try {
      const response = await fetch("/assets/data/tools.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      toolsCatalog = Array.isArray(data?.tools)
        ? data.tools
        : Array.isArray(data)
        ? data
        : [];
      return toolsCatalog;
    } catch (error) {
      console.error("[tool-runtime] Failed to load tools.json:", error);
      return null;
    }
  }

  /**
   * Find tool metadata by id
   */
  function findTool(toolId) {
    if (!toolsCatalog) return null;
    return toolsCatalog.find((tool) => tool.id === toolId);
  }

  /**
   * Update page <title> and meta tags with tool metadata
   */
  function injectMetadata(tool) {
    const name = tool?.name || tool?.title || "Untitled Tool";
    const description = tool?.description || "";
    const slug = tool?.slug || tool?.path || "";

    // Update <title>
    document.title = `${name} - Bluetext.in`;

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Update or create og:title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", name);

    // Update or create og:description
    let ogDesc = document.querySelector(
      'meta[property="og:description"]'
    );
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", description);

    // Update or create canonical link
    let canonical = document.querySelector("link[rel=canonical]");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    if (slug) {
      const canonicalUrl = slug.startsWith("http")
        ? slug
        : `${window.location.origin}/${slug.replace(/^\/+/, "")}`;
      canonical.setAttribute("href", canonicalUrl);
    }

    // Store in window for page script access
    window.currentTool = tool;

    // Log for debugging
    console.log(`[tool-runtime] Injected metadata for: ${name}`);
  }

  /**
   * Handle coming-soon state
   */
  function handleComingSoon(tool) {
    if (tool.status !== "coming-soon") return;

    console.log(`[tool-runtime] Tool "${tool.name}" is coming soon`);

    // Add coming-soon class to body for CSS targeting
    document.documentElement.setAttribute("data-tool-status", "coming-soon");

    // Optionally show a banner
    const banner = document.querySelector("[data-coming-soon-banner]");
    if (banner) {
      banner.style.display = "block";
    }
  }

  /**
   * Initialize: read data-tool-id and inject metadata
   */
  async function initialize() {
    const toolId = document.documentElement.getAttribute("data-tool-id");

    if (!toolId) {
      console.warn(
        "[tool-runtime] No data-tool-id attribute found on <html>"
      );
      return;
    }

    // Load catalog
    await loadToolsCatalog();

    // Find tool
    const tool = findTool(toolId);
    if (!tool) {
      console.error(`[tool-runtime] Tool not found in catalog: ${toolId}`);
      return;
    }

    // Inject metadata
    injectMetadata(tool);

    // Handle coming-soon state
    handleComingSoon(tool);
  }

  // Run on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
