/**
 * Convert key images to WebP format for better performance.
 * Run: node scripts/convert-to-webp.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const QUALITY = 85;

const images = [
    // Hero carousel
    'assets/images/hero/benjamin-davies-mqN-EV9rNlY-unsplash.jpg',
    'assets/images/hero/tim-marshall-hIHh4E4_OGA-unsplash.png',
    'assets/images/hero/galen-crout-fItRJ7AHak8-unsplash.jpg',
    'assets/images/hero/kalisa-veer-gRx74OSJTG8-unsplash.jpg',
    'assets/images/hero/live-kaiah-uvCAKs9CSVs-unsplash.jpg',
    'assets/images/hero/paul-pastourmatzis-nhFcSmJtAeo-unsplash.jpg',
    'assets/images/hero/x-N4QTBfNQ8Nk-unsplash.jpg',
    // Experience cards
    'assets/images/keub-rafting.png',
    'assets/images/keub-ski.png',
    'assets/images/keub-beach.png',
    // Topographic background
    'assets/images/tetons-topo.png',
];

async function convertToWebP(inputPath) {
    const fullPath = path.join(ROOT, inputPath);
    const ext = path.extname(inputPath);
    const webpPath = fullPath.replace(ext, '.webp');

    if (!fs.existsSync(fullPath)) {
        console.warn(`Skipping (not found): ${inputPath}`);
        return;
    }

    try {
        await sharp(fullPath)
            .webp({ quality: QUALITY })
            .toFile(webpPath);
        const inputSize = fs.statSync(fullPath).size;
        const outputSize = fs.statSync(webpPath).size;
        const savings = Math.round((1 - outputSize / inputSize) * 100);
        console.log(`✓ ${path.basename(inputPath)} → ${path.basename(webpPath)} (${savings}% smaller)`);
    } catch (err) {
        console.error(`✗ ${inputPath}:`, err.message);
    }
}

async function main() {
    console.log('Converting images to WebP...\n');
    for (const img of images) {
        await convertToWebP(img);
    }
    console.log('\nDone.');
}

main().catch(console.error);
