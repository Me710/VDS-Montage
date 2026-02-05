// Template definitions for both "Pensée du Jour" and "Pensée de Saint"
const templates = {
    jour: [
        {
            id: 'jour-1',
            name: 'Minimaliste Élégant',
            icon: 'fa-circle',
            style: 'minimalist',
            defaultBg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop',
            frameStyle: 'circular',
            frameColor: '#d4af37',
            overlayGradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(105, 105, 105, 0.3))',
            titleFont: 'Playfair Display',
            titleSize: 48,
            quoteFont: 'Inter',
            quoteSize: 32,
            authorFont: 'Inter',
            authorSize: 24
        },
        {
            id: 'jour-2',
            name: 'Géométrique Moderne',
            icon: 'fa-square',
            style: 'geometric',
            defaultBg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1024&h=1024&fit=crop',
            frameStyle: 'geometric',
            frameColor: '#d4af37',
            overlayGradient: 'linear-gradient(180deg, rgba(30, 30, 30, 0.7), rgba(60, 60, 60, 0.5))',
            titleFont: 'Inter',
            titleSize: 44,
            quoteFont: 'Inter',
            quoteSize: 30,
            authorFont: 'Inter',
            authorSize: 22
        },
        {
            id: 'jour-3',
            name: 'Artistique Lumineux',
            icon: 'fa-star',
            style: 'artistic',
            defaultBg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1024&h=1024&fit=crop',
            frameStyle: 'elegant',
            frameColor: '#d4af37',
            overlayGradient: 'radial-gradient(circle, rgba(212, 175, 55, 0.15), rgba(0, 51, 102, 0.4))',
            titleFont: 'Playfair Display',
            titleSize: 46,
            quoteFont: 'Inter',
            quoteSize: 31,
            authorFont: 'Playfair Display',
            authorSize: 23
        }
    ],
    saint: [
        {
            id: 'saint-1',
            name: 'Spirituel Sophistiqué',
            icon: 'fa-cross',
            style: 'spiritual',
            defaultBg: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=1024&h=1024&fit=crop',
            frameStyle: 'ornate',
            frameColor: '#d4af37',
            overlayGradient: 'linear-gradient(180deg, rgba(25, 25, 112, 0.6), rgba(0, 0, 0, 0.5))',
            titleFont: 'Playfair Display',
            titleSize: 50,
            quoteFont: 'Inter',
            quoteSize: 32,
            authorFont: 'Playfair Display',
            authorSize: 26
        },
        {
            id: 'saint-2',
            name: 'Contemporain Sacré',
            icon: 'fa-church',
            style: 'contemporary',
            defaultBg: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1024&h=1024&fit=crop',
            frameStyle: 'geometric-sacred',
            frameColor: '#d4af37',
            overlayGradient: 'linear-gradient(135deg, rgba(0, 0, 128, 0.5), rgba(25, 25, 25, 0.6))',
            titleFont: 'Inter',
            titleSize: 46,
            quoteFont: 'Inter',
            quoteSize: 30,
            authorFont: 'Inter',
            authorSize: 24
        },
        {
            id: 'saint-3',
            name: 'Raffiné Céleste',
            icon: 'fa-cloud',
            style: 'celestial',
            defaultBg: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1024&h=1024&fit=crop',
            frameStyle: 'elegant',
            frameColor: '#d4af37',
            overlayGradient: 'linear-gradient(160deg, rgba(75, 0, 130, 0.5), rgba(30, 144, 255, 0.4))',
            titleFont: 'Playfair Display',
            titleSize: 48,
            quoteFont: 'Inter',
            quoteSize: 31,
            authorFont: 'Playfair Display',
            authorSize: 25
        }
    ]
};

// Current state
let currentState = {
    type: 'jour',
    templateIndex: 0,
    title: 'Pensée du Jour',
    quote: 'La vie est ce que nous en faisons. Les voyages sont les voyageurs. Ce que nous voyons n\'est pas ce que nous voyons mais ce que nous sommes.',
    author: '',
    backgroundImage: null,
    frameColor: '#d4af37',
    textColor: '#ffffff',
    overlayColor: '#000000',
    overlayOpacity: 50
};

// Get current template
function getCurrentTemplate() {
    return templates[currentState.type][currentState.templateIndex];
}

// Initialize template selector
function initTemplateSelector() {
    const container = document.getElementById('templateSelector');
    renderTemplates();
}

// Render templates based on current type
function renderTemplates() {
    const container = document.getElementById('templateSelector');
    const currentTemplates = templates[currentState.type];
    
    container.innerHTML = currentTemplates.map((template, index) => `
        <button class="template-btn ${index === currentState.templateIndex ? 'active' : ''}" 
                data-index="${index}">
            <i class="fas ${template.icon}"></i>
            <span>${template.name}</span>
        </button>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentState.templateIndex = parseInt(btn.dataset.index);
            renderTemplates();
            updateCanvas();
        });
    });
}

// Export current state and template functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { templates, currentState, getCurrentTemplate };
}