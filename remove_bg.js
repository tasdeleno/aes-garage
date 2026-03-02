const Jimp = require('jimp');

async function removeWhiteBg() {
    const imagePath = 'C:/Users/X/.gemini/antigravity/brain/8e58fc64-8fc6-48b5-b2f3-a6c788f7cfe4/red_bmw_e36_topdown_1772489145573.png';
    const outputPath = 'c:/Users/X/Desktop/aes_garage/frontend/src/assets/car-topdown.png';

    try {
        const fs = require('fs');
        if (!fs.existsSync('c:/Users/X/Desktop/aes_garage/frontend/src/assets')) {
            fs.mkdirSync('c:/Users/X/Desktop/aes_garage/frontend/src/assets', { recursive: true });
        }

        const image = await Jimp.read(imagePath);

        // We are going to make pure white transparent
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            // If the pixel is very close to white
            if (red > 240 && green > 240 && blue > 240) {
                // Set alpha to 0 (transparent)
                this.bitmap.data[idx + 3] = 0;
            }
        });

        // Make the car face "right" (assuming typical orientation, we may need to adjust rotation in CSS)
        // The top-down generated image might be facing left or right. We can rotate it via CSS.

        await image.writeAsync(outputPath);
        console.log('Background removed and saved to', outputPath);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

removeWhiteBg();
