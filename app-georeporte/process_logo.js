const Jimp = require('jimp');
const path = require('path');

async function processImage() {
    const inputPath = path.join(__dirname, 'bien.png');
    const outputPath = path.join(__dirname, 'www', 'logo.png');
    const assetsIconPath = path.join(__dirname, 'assets', 'icon.png');
    
    console.log('Reading image...', inputPath);
    const image = await Jimp.read(inputPath);
    
    let minX = image.bitmap.width;
    let maxX = 0;
    let minY = image.bitmap.height;
    let maxY = 0;
    
    // Scan pixels to replace white with transparent and calculate bounding box
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        
        // If pixel is very close to white, make it transparent
        if (r > 245 && g > 245 && b > 245) {
            this.bitmap.data[idx + 3] = 0; // Set Alpha to 0 (Transparent)
        } else {
            // Keep track of bounding box of non-transparent elements
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    });
    
    console.log(`Bounding box identified: X=[${minX} to ${maxX}], Y=[${minY} to ${maxY}]`);
    
    // Add some padding around the cropped bounding box
    const padding = 20;
    let cropX = Math.max(0, minX - padding);
    let cropY = Math.max(0, minY - padding);
    let cropW = Math.min(image.bitmap.width - cropX, (maxX - minX) + padding * 2);
    let cropH = Math.min(image.bitmap.height - cropY, (maxY - minY) + padding * 2);
    
    console.log(`Cropping logo to: X=${cropX}, Y=${cropY}, W=${cropW}, H=${cropH}`);
    image.crop(cropX, cropY, cropW, cropH);
    
    // Make the cropped image transparent background again just to be safe
    // Save to logo.png in www
    await image.writeAsync(outputPath);
    console.log('Successfully saved cropped, transparent logo to www/logo.png!');
    
    // Save to assets/icon.png
    await image.writeAsync(assetsIconPath);
    console.log('Successfully saved cropped, transparent icon to assets/icon.png!');
}

processImage().catch(err => {
    console.error('Error processing image:', err);
});
