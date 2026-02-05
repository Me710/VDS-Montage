// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize components
    initTemplateSelector();
    initGallery();
    initImageUpload();
    initEventListeners();
    
    // Initial canvas render
    updateCanvas();
}

// Initialize all event listeners
function initEventListeners() {
    // Type selector buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            if (type !== currentState.type) {
                // Update state
                currentState.type = type;
                currentState.templateIndex = 0;
                
                // Update title based on type
                currentState.title = type === 'jour' ? 'Pensée du Jour' : 'Pensée de Saint';
                document.getElementById('titleInput').value = currentState.title;
                
                // Update UI
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Re-render templates and gallery
                renderTemplates();
                renderGallery();
                
                // Reset background to template default
                currentState.backgroundImage = null;
                
                // Update canvas
                updateCanvas();
            }
        });
    });

    // Title input
    const titleInput = document.getElementById('titleInput');
    titleInput.addEventListener('input', (e) => {
        currentState.title = e.target.value;
        updateCanvas();
    });

    // Quote input
    const quoteInput = document.getElementById('quoteInput');
    const charCount = document.getElementById('charCount');
    
    quoteInput.addEventListener('input', (e) => {
        currentState.quote = e.target.value;
        charCount.textContent = e.target.value.length;
        updateCanvas();
    });
    
    // Initialize char count
    charCount.textContent = quoteInput.value.length;
    currentState.quote = quoteInput.value;

    // Author input
    const authorInput = document.getElementById('authorInput');
    authorInput.addEventListener('input', (e) => {
        currentState.author = e.target.value;
        updateCanvas();
    });

    // Overlay opacity slider
    const overlayOpacity = document.getElementById('overlayOpacity');
    const opacityValue = document.getElementById('opacityValue');
    
    overlayOpacity.addEventListener('input', (e) => {
        currentState.overlayOpacity = parseInt(e.target.value);
        opacityValue.textContent = `${e.target.value}%`;
        updateCanvas();
    });

    // Frame color picker
    const frameColor = document.getElementById('frameColor');
    const frameColorText = document.getElementById('frameColorText');
    
    frameColor.addEventListener('input', (e) => {
        currentState.frameColor = e.target.value;
        frameColorText.value = e.target.value;
        updateCanvas();
    });
    
    frameColorText.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            currentState.frameColor = e.target.value;
            frameColor.value = e.target.value;
            updateCanvas();
        }
    });

    // Text color picker
    const textColor = document.getElementById('textColor');
    const textColorText = document.getElementById('textColorText');
    
    textColor.addEventListener('input', (e) => {
        currentState.textColor = e.target.value;
        textColorText.value = e.target.value;
        updateCanvas();
    });
    
    textColorText.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            currentState.textColor = e.target.value;
            textColor.value = e.target.value;
            updateCanvas();
        }
    });

    // Overlay color picker
    const overlayColor = document.getElementById('overlayColor');
    const overlayColorText = document.getElementById('overlayColorText');
    
    overlayColor.addEventListener('input', (e) => {
        currentState.overlayColor = e.target.value;
        overlayColorText.value = e.target.value;
        updateCanvas();
    });
    
    overlayColorText.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            currentState.overlayColor = e.target.value;
            overlayColor.value = e.target.value;
            updateCanvas();
        }
    });

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', () => {
        showLoading();
        
        // Delay to show loading animation
        setTimeout(() => {
            exportCanvas();
            hideLoading();
            showNotification('Image téléchargée avec succès !', 'success');
        }, 500);
    });
}

// Show loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateCanvas();
    }, 250);
});

// Prevent canvas context menu
canvas.addEventListener('contextmenu', (e) => e.preventDefault());