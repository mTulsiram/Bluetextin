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
