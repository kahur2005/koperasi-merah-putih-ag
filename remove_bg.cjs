const { Jimp } = require('jimp');

async function removeBackground() {
  try {
    const image = await Jimp.read('C:\\Users\\plotsloee\\.gemini\\antigravity\\brain\\2ab676dd-9489-43d0-8762-8c15701312e2\\media__1783495705373.png');
    
    // Convert near-white to transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If pixel is white or very close to white
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // Alpha
      }
    });
    
    await image.write('d:\\!!! GITHUB\\koperasi-merah-putih-ag\\public\\assets\\images\\icon_gas.png');
    console.log('Background removed and saved!');
  } catch (err) {
    console.error(err);
  }
}

removeBackground();
