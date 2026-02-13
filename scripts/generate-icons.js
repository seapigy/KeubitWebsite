/**
 * Generate favicon and app icons from KeubIt.png
 * Makes black background transparent, outputs optimized sizes
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets/images/KeubIt.png');
const OUT_DIR = path.join(ROOT, 'assets/icons');

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function makeTransparent(inputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const threshold = 40;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < threshold && data[i + 1] < threshold && data[i + 2] < threshold) {
      data[i + 3] = 0;
    }
  }
  return sharp(Buffer.from(data), { raw: info });
}

async function generateIcons() {
  if (!fs.existsSync(SRC)) {
    throw new Error(`Source image not found: ${SRC}`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const transparent = await makeTransparent(SRC);
  const buffers = {};

  for (const { name, size } of SIZES) {
    const outPath = path.join(OUT_DIR, name);
    await transparent
      .clone()
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ ${name}`);
    if (name.endsWith('.png')) buffers[name] = await fs.promises.readFile(outPath);
  }

  // Create favicon.ico (16 and 32)
  try {
    const toIco = require('to-ico');
    const icon16 = await fs.promises.readFile(path.join(OUT_DIR, 'favicon-16x16.png'));
    const icon32 = await fs.promises.readFile(path.join(OUT_DIR, 'favicon-32x32.png'));
    const ico = await toIco([icon16, icon32]);
    await fs.promises.writeFile(path.join(OUT_DIR, 'favicon.ico'), ico);
    console.log('✓ favicon.ico');
  } catch (e) {
    console.warn('to-ico not installed, copying favicon-32x32 as fallback');
    fs.copyFileSync(path.join(OUT_DIR, 'favicon-32x32.png'), path.join(OUT_DIR, 'favicon.ico'));
  }

  console.log('\nDone.');
}

generateIcons().catch(console.error);
