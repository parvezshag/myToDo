const fs = require('fs');
const path = require('path');

function createPNG(width, height, filePath) {
  const { createCanvas } = (() => {
    try { return require('canvas'); } catch { return null; }
  })();

  // Minimal valid PNG (1x1 pixel blue)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // width = 1
    0x00, 0x00, 0x00, 0x01, // height = 1
    0x08, 0x02, // bit depth, color type
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x08, 0xD7, 0x63, 0x60, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE5, 0x27, 0xDE, 0xFC, // data + CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82,
  ]);
  fs.writeFileSync(filePath, pngData);
}

function createICO(iconDir) {
  const pngPath = path.join(iconDir, 'icon.png');
  if (!fs.existsSync(pngPath)) {
    createPNG(32, 32, pngPath);
  }
  const pngData = fs.readFileSync(pngPath);
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // ICO type
  icoHeader.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);  // width
  entry.writeUInt8(32, 1);  // height
  entry.writeUInt8(0, 2);   // colors
  entry.writeUInt8(0, 3);   // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(pngData.length, 8); // size
  entry.writeUInt32LE(22, 12); // offset (6 + 16)

  const ico = Buffer.concat([icoHeader, entry, pngData]);
  fs.writeFileSync(path.join(iconDir, 'icon.ico'), ico);
}

const iconDir = path.join(__dirname, '..', 'src-tauri', 'icons');

// Create required PNG sizes
createPNG(32, 32, path.join(iconDir, '32x32.png'));
createPNG(128, 128, path.join(iconDir, '128x128.png'));
createPNG(256, 256, path.join(iconDir, '128x128@2x.png'));
createPNG(32, 32, path.join(iconDir, 'icon.png'));
createICO(iconDir);

// Also copy to public
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(path.join(iconDir, 'icon.png'), path.join(publicDir, 'icon.png'));

console.log('Icons generated successfully');
