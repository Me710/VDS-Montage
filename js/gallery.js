// Gallery of predefined images
const galleryImages = {
    jour: [
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop',
            name: 'Montagne au Lever',
            category: 'nature'
        },
        {
            url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1024&h=1024&fit=crop',
            name: 'Océan Doré',
            category: 'nature'
        },
        {
            url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1024&h=1024&fit=crop',
            name: 'Forêt Lumineuse',
            category: 'nature'
        },
        {
            url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1024&h=1024&fit=crop',
            name: 'Lac Paisible',
            category: 'nature'
        },
        {
            url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1024&h=1024&fit=crop',
            name: 'Route Inspirante',
            category: 'nature'
        },
        {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop&sat=-100',
            name: 'Horizon Zen',
            category: 'nature'
        },
        {
            url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1024&h=1024&fit=crop',
            name: 'Ciel Étoilé',
            category: 'nature'
        },
        {
            url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1024&h=1024&fit=crop',
            name: 'Prairie Dorée',
            category: 'nature'
        }
    ],
    saint: [
        {
            url: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=1024&h=1024&fit=crop',
            name: 'Cathédrale Divine',
            category: 'spiritual'
        },
        {
            url: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1024&h=1024&fit=crop',
            name: 'Monastère Ancien',
            category: 'spiritual'
        },
        {
            url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1024&h=1024&fit=crop',
            name: 'Nuages Célestes',
            category: 'spiritual'
        },
        {
            url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1024&h=1024&fit=crop',
            name: 'Lumière Divine',
            category: 'spiritual'
        },
        {
            url: 'https://images.unsplash.com/photo-1504551591408-94a57e84ff1e?w=1024&h=1024&fit=crop',
            name: 'Vitraux Sacrés',
            category: 'spiritual'
        },
        {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=1024&fit=crop',
            name: 'Cloître Paisible',
            category: 'spiritual'
        },
        {
            url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=1024&h=1024&fit=crop',
            name: 'Ciel Mystique',
            category: 'spiritual'
        },
        {
            url: 'https://images.unsplash.com/photo-1445810694374-0a94739e4a03?w=1024&h=1024&fit=crop',
            name: 'Chapelle Lumineuse',
            category: 'spiritual'
        }
    ]
};

// Initialize gallery
function initGallery() {
    renderGallery();
}

// Render gallery based on current type
function renderGallery() {
    const container = document.getElementById('imageGallery');
    const currentImages = galleryImages[currentState.type];
    
    container.innerHTML = currentImages.map((image, index) => `
        <div class="gallery-item ${currentState.backgroundImage === image.url ? 'active' : ''}" 
             data-url="${image.url}">
            <img src="${image.url}" alt="${image.name}" loading="lazy">
            <div class="gallery-item-overlay">
                <span>${image.name}</span>
            </div>
        </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            currentState.backgroundImage = item.dataset.url;
            renderGallery();
            updateCanvas();
        });
    });
}

// Handle image upload
function initImageUpload() {
    const uploadInput = document.getElementById('imageUpload');
    
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentState.backgroundImage = event.target.result;
                renderGallery();
                updateCanvas();
            };
            reader.readAsDataURL(file);
        }
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { galleryImages, initGallery, renderGallery, initImageUpload };
}