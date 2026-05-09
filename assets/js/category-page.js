function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getToolName(tool) {
  return tool?.name || tool?.title || "Untitled Tool";
}

function getToolPath(tool) {
  return tool?.slug || tool?.path || "";
}

function toTitleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function labelFromSlug(slug) {
  const labels = {
    ai: "AI",
    seo: "SEO",
    pdf: "PDF",
    "api-tools": "API Tools",
    "date-time": "Date & Time",
    "crop-resize": "Crop & Resize",
    "merge-split": "Merge & Split",
  };

  const key = normalize(slug);
  if (labels[key]) {
    return labels[key];
  }

  return toTitleCase(String(slug || "").replace(/-/g, " "));
}

function buildSectionTitle(categorySlug, subcategoryLabel) {
  const category = normalize(categorySlug);
  switch (category) {
    case "calculators":
      return `${subcategoryLabel} Calculators`;
    case "converters":
      return `${subcategoryLabel} Converters`;
    case "pdf":
      return `${subcategoryLabel} PDF Tools`;
    case "images":
      return `${subcategoryLabel} Image Tools`;
    case "text":
      return `${subcategoryLabel} Text Tools`;
    case "developer":
      return `${subcategoryLabel} Developer Tools`;
    case "files":
      return `${subcategoryLabel} File Tools`;
    case "ai":
      return `${subcategoryLabel} AI Tools`;
    case "media":
      return `${subcategoryLabel} Media Tools`;
    case "seo":
      return `${subcategoryLabel} SEO Tools`;
    default:
      return `${subcategoryLabel} Tools`;
  }
}

function updateSubcategoryCopy(pageRoot, categoryTools) {
  const pathPrefix = normalize(pageRoot.dataset.pathPrefix);
  if (!pathPrefix) {
    return;
  }

  const parts = pathPrefix.replace(/^\/+|\/+$/g, "").split("/");
  if (parts.length < 3) {
    return;
  }

  const categorySlug = parts[1];
  const subcategorySlug = parts[2];
  const categoryLabel = labelFromSlug(categorySlug);
  const subcategoryLabel = labelFromSlug(subcategorySlug);
  const sectionTitle = buildSectionTitle(categorySlug, subcategoryLabel);

  const readyCount = categoryTools.filter((tool) => tool.status !== "coming-soon").length;
  const comingSoonCount = categoryTools.length - readyCount;

  let summary;
  if (categoryTools.length === 0) {
    summary = `This ${subcategoryLabel.toLowerCase()} section is being prepared for ${categoryLabel.toLowerCase()} workflows.`;
  } else if (comingSoonCount === 0) {
    summary = `Explore ${readyCount} ready ${subcategoryLabel.toLowerCase()} tool${readyCount === 1 ? "" : "s"} in ${categoryLabel.toLowerCase()}.`;
  } else {
    summary = `Explore ${readyCount} ready and ${comingSoonCount} upcoming ${subcategoryLabel.toLowerCase()} tool${categoryTools.length === 1 ? "" : "s"} in ${categoryLabel.toLowerCase()}.`;
  }

  const heading = pageRoot.querySelector("h1");
  if (heading) {
    heading.textContent = sectionTitle;
  }

  if (heading && heading.nextElementSibling && heading.nextElementSibling.tagName === "P") {
    heading.nextElementSibling.textContent = summary;
  }

  const searchLabel = pageRoot.querySelector('label[for="category-tool-search"]');
  if (searchLabel) {
    searchLabel.textContent = `Search ${subcategoryLabel.toLowerCase()} tools`;
  }

  const searchInput = pageRoot.querySelector("#category-tool-search");
  if (searchInput) {
    searchInput.placeholder = `Search ${subcategoryLabel.toLowerCase()} tools in this section`;
  }

  const titleNode = document.querySelector("title");
  if (titleNode) {
    titleNode.textContent = `${sectionTitle} | Bluetext.in`;
  }

  const descriptionNode = document.querySelector('meta[name="description"]');
  if (descriptionNode) {
    descriptionNode.setAttribute("content", summary);
  }
}

function makeCard(tool) {
  const toolName = getToolName(tool);
  const toolPath = getToolPath(tool);

  if (tool.status === "coming-soon") {
    return `
      <article class="card">
        <h3>${toolName}</h3>
        <p>${tool.description}</p>
        <span class="badge badge--soon">Coming Soon</span>
      </article>
    `;
  }

  return `
    <article class="card">
      <h3><a href="/${toolPath.replace(/^\/+/, "")}">${toolName}</a></h3>
      <p>${tool.description}</p>
    </article>
  `;
}

function pickTools(allTools, pageRoot) {
  const categoryId = pageRoot.dataset.categoryId;
  const pathPrefix = normalize(pageRoot.dataset.pathPrefix);

  return allTools
    .filter((tool) => tool.category === categoryId)
    .filter((tool) => {
      if (!pathPrefix) {
        return true;
      }

      return normalize(getToolPath(tool)).startsWith(pathPrefix);
    })
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "ready" ? -1 : 1;
      }

      return getToolName(left).localeCompare(getToolName(right));
    });
}

async function initCategoryPage() {
  const pageRoot = document.querySelector("[data-category-id]");
  const list = document.querySelector("#category-tools-grid, #tools-grid");
  const searchInput = document.querySelector("#category-tool-search");
  const emptyMessage = pageRoot ? pageRoot.dataset.emptyMessage : "";

  if (!pageRoot || !list) {
    return;
  }

  const response = await fetch("/assets/data/tools.json");
  if (!response.ok) {
    throw new Error("Could not load tools catalog.");
  }

  const data = await response.json();
  const allTools = Array.isArray(data.tools) ? data.tools : [];
  const categoryTools = pickTools(allTools, pageRoot);

  updateSubcategoryCopy(pageRoot, categoryTools);

  function render(query) {
    const q = normalize(query);
    const filtered = q
      ? categoryTools.filter((tool) => {
          const haystack = [getToolName(tool), tool.description, ...(tool.tags || [])]
            .map(normalize)
            .join(" ");
          return haystack.includes(q);
        })
      : categoryTools;

    if (filtered.length === 0) {
      list.innerHTML = `<p class="empty-state">${
        q ? "No tools matched this search." : emptyMessage || "No tools are available in this section yet."
      }</p>`;
      return;
    }

    list.innerHTML = filtered.map(makeCard).join("");
  }

  render("");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      render(searchInput.value);
    });
  }
}

initCategoryPage().catch((error) => {
  console.error(error);
  const list = document.querySelector("#category-tools-grid");
  if (list) {
    list.innerHTML = '<p class="empty-state">Tools are temporarily unavailable.</p>';
  }
});
