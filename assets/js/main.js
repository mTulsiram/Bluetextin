document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Inject Header and Footer ---
    // CORRECTED: The URLs now point to the '/components/' directory.
    const components = [
        { id: 'header-placeholder', url: '/components/header.html' },
        { id: 'footer-placeholder', url: '/components/footer.html' }
    ];

    components.forEach(comp => {
        const placeholder = document.getElementById(comp.id);
        if (placeholder) {
            fetch(comp.url)
                .then(response => {
                    if (!response.ok) {
                        // This error will now correctly show "Failed to fetch /components/header.html" if the path is wrong.
                        throw new Error(`Failed to fetch ${comp.url}`);
                    }
                    return response.text();
                })
                .then(html => {
                    placeholder.innerHTML = html;
                    if (comp.id === 'header-placeholder') {
                        initHeaderInteractions();
                    }
                })
                .catch(err => console.error(`Error loading component:`, err));
        }
    });

    // --- Part 2: Generate Category Grid (This part remains the same) ---
    const allCategories = [
        { name: "AI Utilities", slug: "ai-utilities" },
        { name: "Audio & Video", slug: "audio-video" },
        { name: "Calculators", slug: "calculators" },
        { name: "Color & Design", slug: "color-design" },
        { name: "Developer Tools", slug: "developer" },
        { name: "Network Tools", slug: "domain-network" },
        { name: "Encoding Tools", slug: "encoding" },
        { name: "File Tools", slug: "file-data" },
        { name: "Image Tools", slug: "image" },
        { name: "PDF Converters", slug: "pdf" },
        { name: "Programming", slug: "programming" },
        { name: "SEO Tools", slug: "seo" },
        { name: "Social Media", slug: "social-media" },
        { name: "Text Tools", slug: "text" },
        { name: "Unit Converters", slug: "unit-converters" },
        { name: "YouTube Tools", slug: "youtube" }
    ];

    const grid = document.getElementById('categoryGrid');
    if (grid) {
        allCategories.forEach(cat => {
            const card = document.createElement('a');
            card.className = 'category-card';
            card.href = `/tools/${cat.slug}/`;
            card.innerHTML = `<div>${cat.name}</div>`;
            grid.appendChild(card);
        });
    }
});

function initHeaderInteractions() {
    console.log("Header loaded and ready for interactive scripts.");
}


document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Inject Header and Footer ---
    const components = [
        { id: 'header-placeholder', url: '/components/header.html' },
        { id: 'footer-placeholder', url: '/components/footer.html' }
    ];

    components.forEach(comp => {
        const placeholder = document.getElementById(comp.id);
        if (placeholder) {
            fetch(comp.url)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to fetch ${comp.url}`);
                    return response.text();
                })
                .then(html => {
                    placeholder.innerHTML = html;
                    if (comp.id === 'header-placeholder') initHeaderInteractions();
                })
                .catch(err => console.error(`Error loading component:`, err));
        }
    });

    // --- Part 2: Generate Homepage Category Grid ---
    const grid = document.getElementById('categoryGrid');
    if (grid) {
        const homepageCategories = [
            { name: "AI Utilities", slug: "ai-utilities" },
            { name: "Audio & Video", slug: "audio-video" },
            { name: "Calculators", slug: "calculators" },
            { name: "Color & Design", slug: "color-design" },
            { name: "Developer Tools", slug: "developer" },
            { name: "Network Tools", slug: "domain-network" },
            { name: "Encoding Tools", slug: "encoding" },
            { name: "File Tools", slug: "file-data" },
            { name: "Image Tools", slug: "image" },
            { name: "PDF Converters", slug: "pdf" },
            { name: "Programming", slug: "programming" },
            { name: "SEO Tools", slug: "seo" },
            { name: "Social Media", slug: "social-media" },
            { name: "Text Tools", slug: "text" },
            { name: "Unit Converters", slug: "unit-converters" },
            { name: "YouTube Tools", slug: "youtube" }
        ];
        homepageCategories.forEach(cat => {
            const card = document.createElement('a');
            card.className = 'category-card';
            card.href = `/tools/${cat.slug}/`;
            card.innerHTML = `<div>${cat.name}</div>`;
            grid.appendChild(card);
        });
    }

    // --- NEW: Part 3: Generate "All Tools" Master Directory ---
    const masterDirectory = document.getElementById('masterDirectory');
    if (masterDirectory) {
        renderDirectory(masterDirectory);
    }
});

// Placeholder for header-specific scripts
function initHeaderInteractions() {
    console.log("Header loaded and ready for interactive scripts.");
}

// NEW: This function builds the master tool list on the all-tools.html page
function renderDirectory(container) {
    // This is a temporary data object. In Phase 9, this will come from navigation.json
    const masterTools = {
        "Image Tools": ["Image Resizer", "PNG to JPG Converter", "Image Compressor", "Crop Image"],
        "PDF Converters": ["Merge PDF", "Split PDF", "PDF to Word", "Compress PDF"],
        "Text Tools": ["Word Count", "Remove Line Breaks", "Text Case Converter"],
        "Developer Tools": ["JSON Formatter", "URL Encoder / Decoder", "Base64 Encoder"],
        "AI Utilities": ["AI Content Detector", "AI Story Generator", "AI Image Generator"],
        "Audio & Video": ["MP3 Cutter", "Video to GIF Converter"],
        "Calculators": ["Percentage Calculator", "Age Calculator"],
        "Color & Design": ["Color Picker", "Hex to RGB Converter"],
        "Network Tools": ["What is My IP", "Ping Test"],
        "Encoding Tools": ["MD5 Generator", "SHA-256 Generator"],
        "File Tools": ["CSV to JSON Converter", "XML Viewer"],
        "Programming": ["Code Formatter", "Regex Tester"],
        "SEO Tools": ["Meta Tag Generator", "SERP Simulator"],
        "Social Media": ["Hashtag Generator", "Twitter Card Preview"],
        "Unit Converters": ["Length Converter", "Weight Converter"],
        "YouTube Tools": ["YouTube Thumbnail Downloader", "Video Ideas Generator"]
    };

    // Generate a URL-friendly slug from a tool name
    const createToolSlug = (name) => name.toLowerCase().replace(/ /g, '-').replace(/\//g, 'or');

    for (const [category, tools] of Object.entries(masterTools)) {
        const categorySlug = createToolSlug(category);
        const section = document.createElement('div');
        section.className = 'silo-box';

        const toolLinks = tools.map(name => {
            const toolSlug = createToolSlug(name);
            // Example link: /tools/image-tools/image-resizer.html (will be 404 for now)
            const toolUrl = `/tools/${categorySlug}/${toolSlug}.html`;
            return `<li><a href="${toolUrl}">${name}</a></li>`;
        }).join("");

        section.innerHTML = `<h3>${category}</h3><ul>${toolLinks}</ul>`;
        container.appendChild(section);
    }
}

