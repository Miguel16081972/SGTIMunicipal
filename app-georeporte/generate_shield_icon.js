const Jimp = require('jimp');
const path = require('path');

async function processImage() {
    const inputPath = path.join(__dirname, 'bien.png');
    const assetsIconPath = path.join(__dirname, 'assets', 'icon.png');
    
    console.log('Reading image...', inputPath);
    const image = await Jimp.read(inputPath);
    
    let minX = image.bitmap.width;
    let maxX = 0;
    let minY = image.bitmap.height;
    let maxY = 0;
    
    // 1. Scan and replace white background with transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        
        if (r > 245 && g > 245 && b > 245) {
            this.bitmap.data[idx + 3] = 0;
        } else {
            // Focus on the top shield part only (before SGTI text at Y=1020)
            if (y < 1020) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    });
    
    // 2. Crop shield precisely
    let cropX = minX;
    let cropY = minY;
    let cropW = maxX - minX;
    let cropH = maxY - minY;
    image.crop(cropX, cropY, cropW, cropH);
    
    // 3. Create a 1024x1024 transparent target canvas
    // Using Jimp constructor with width, height, and color (transparent)
    const finalIcon = new Jimp(1024, 1024, 0x00000000);
    
    // 4. Resize shield to fit exactly inside the 60% safe zone of the circular icon
    // Height is the largest dimension, so we set H=600px and let W auto-scale
    image.resize(Jimp.AUTO, 580);
    
    // 5. Composite centered on the canvas
    const offsetX = Math.floor((1024 - image.bitmap.width) / 2);
    const offsetY = Math.floor((1024 - image.bitmap.height) / 2);
    finalIcon.composite(image, offsetX, offsetY);
    
    // 6. Write final transparent icon
    await finalIcon.writeAsync(assetsIconPath);
    console.log(`Successfully generated perfect-scale transparent icon! Shield size: ${image.bitmap.width}x${image.bitmap.height}`);
}

processImage().catch(err => {
    console.error('Error processing image:', err);
});
