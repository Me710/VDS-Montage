// Canvas rendering engine
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// Image cache
const imageCache = {};

// Load image with caching
function loadImage(url) {
    return new Promise((resolve, reject) => {
        if (imageCache[url]) {
            resolve(imageCache[url]);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imageCache[url] = img;
            resolve(img);
        };
        img.onerror = reject;
        img.src = url;
    });
}

// Update canvas with current state
async function updateCanvas() {
    const template = getCurrentTemplate();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get background image URL
    const bgUrl = currentState.backgroundImage || template.defaultBg;

    try {
        // Load and draw background image
        const bgImage = await loadImage(bgUrl);
        
        // Draw background (cover fit)
        const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
        const x = (canvas.width - bgImage.width * scale) / 2;
        const y = (canvas.height - bgImage.height * scale) / 2;
        ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);

        // Draw overlay
        drawOverlay(template);

        // Draw frame
        drawFrame(template);

        // Draw text content
        drawTextContent(template);

        // Draw VDS logo
        drawLogo();

    } catch (error) {
        console.error('Error updating canvas:', error);
        // Draw fallback gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#3498db');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Draw overlay
function drawOverlay(template) {
    const opacity = currentState.overlayOpacity / 100;
    
    // Parse overlay color
    const r = parseInt(currentState.overlayColor.substr(1, 2), 16);
    const g = parseInt(currentState.overlayColor.substr(3, 2), 16);
    const b = parseInt(currentState.overlayColor.substr(5, 2), 16);
    
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw frame based on template style
function drawFrame(template) {
    ctx.strokeStyle = currentState.frameColor;
    ctx.lineWidth = 8;

    if (template.frameStyle === 'circular') {
        // Circular frame
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 400, 0, Math.PI * 2);
        ctx.stroke();
        
        // Additional decorative circles
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 420, 0, Math.PI * 2);
        ctx.stroke();

    } else if (template.frameStyle === 'geometric') {
        // Geometric borders
        const margin = 60;
        ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);
        
        // Corner decorations
        const cornerSize = 40;
        ctx.lineWidth = 6;
        drawCornerDecoration(margin, margin, cornerSize);
        drawCornerDecoration(canvas.width - margin, margin, cornerSize, true);
        drawCornerDecoration(margin, canvas.height - margin, cornerSize, false, true);
        drawCornerDecoration(canvas.width - margin, canvas.height - margin, cornerSize, true, true);

    } else if (template.frameStyle === 'ornate') {
        // Ornate frame with decorative elements
        const margin = 50;
        ctx.lineWidth = 10;
        ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);
        
        ctx.lineWidth = 4;
        ctx.strokeRect(margin + 20, margin + 20, canvas.width - (margin + 20) * 2, canvas.height - (margin + 20) * 2);
        
        // Draw decorative corners
        drawOrnateCorners(margin);

    } else if (template.frameStyle === 'geometric-sacred') {
        // Sacred geometry patterns
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx.lineWidth = 6;
        
        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 380);
        ctx.lineTo(centerX + 380, centerY);
        ctx.lineTo(centerX, centerY + 380);
        ctx.lineTo(centerX - 380, centerY);
        ctx.closePath();
        ctx.stroke();

    } else {
        // Default elegant frame
        const margin = 70;
        ctx.lineWidth = 6;
        ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);
        
        // Inner accent line
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.strokeRect(margin + 15, margin + 15, canvas.width - (margin + 15) * 2, canvas.height - (margin + 15) * 2);
        ctx.globalAlpha = 1.0;
    }
}

// Draw corner decoration
function drawCornerDecoration(x, y, size, flipH = false, flipV = false) {
    ctx.save();
    ctx.translate(x, y);
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);
    
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();
    
    ctx.restore();
}

// Draw ornate corners
function drawOrnateCorners(margin) {
    const cornerPositions = [
        { x: margin, y: margin },
        { x: canvas.width - margin, y: margin },
        { x: margin, y: canvas.height - margin },
        { x: canvas.width - margin, y: canvas.height - margin }
    ];

    cornerPositions.forEach(pos => {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        
        ctx.fillStyle = currentState.frameColor;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// Draw text content
function drawTextContent(template) {
    ctx.fillStyle = currentState.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw title
    ctx.font = `${template.titleSize}px '${template.titleFont}', serif`;
    ctx.fillText(currentState.title, centerX, 200);

    // Draw decorative line under title
    ctx.fillStyle = currentState.frameColor;
    ctx.fillRect(centerX - 100, 240, 200, 3);

    // Draw quote (with text wrapping)
    ctx.fillStyle = currentState.textColor;
    ctx.font = `${template.quoteSize}px '${template.quoteFont}', sans-serif`;
    wrapText(ctx, currentState.quote, centerX, centerY, 700, template.quoteSize * 1.4);

    // Draw author
    if (currentState.author) {
        ctx.font = `italic ${template.authorSize}px '${template.authorFont}', serif`;
        ctx.fillText(`— ${currentState.author}`, centerX, canvas.height - 200);
    }
}

// Word wrap utility
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = context.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    // Draw centered lines
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
        context.fillText(line.trim(), x, startY + (index * lineHeight));
    });
}

// Draw VDS logo
function drawLogo() {
    ctx.save();
    
    const logoX = canvas.width - 100;
    const logoY = canvas.height - 80;
    
    // Logo background circle
    ctx.fillStyle = currentState.frameColor;
    ctx.beginPath();
    ctx.arc(logoX, logoY, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Logo text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VDS', logoX, logoY);
    
    ctx.restore();
}

// Export canvas as PNG
function exportCanvas() {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `${currentState.type}-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateCanvas, exportCanvas };
}