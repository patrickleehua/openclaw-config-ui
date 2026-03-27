/**
 * Icon Generation Script for OpenClaw Config UI
 *
 * This script generates all required icon formats from favicon.svg
 *
 * Prerequisites:
 *   npm install sharp --save-dev
 *
 * Usage:
 *   node scripts/generate-icons.js
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const ICONS_DIR = join(ROOT_DIR, 'src-tauri', 'icons');
const SVG_PATH = join(ROOT_DIR, 'favicon.svg');

// Ensure icons directory exists
if (!existsSync(ICONS_DIR)) {
  mkdirSync(ICONS_DIR, { recursive: true });
}

// Icon sizes to generate
const SIZES = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: 'icon.png', size: 512 },
  // Windows Store icons
  { name: 'Square30x30Logo.png', size: 30 },
  { name: 'Square44x44Logo.png', size: 44 },
  { name: 'Square71x71Logo.png', size: 71 },
  { name: 'Square89x89Logo.png', size: 89 },
  { name: 'Square107x107Logo.png', size: 107 },
  { name: 'Square142x142Logo.png', size: 142 },
  { name: 'Square150x150Logo.png', size: 150 },
  { name: 'Square284x284Logo.png', size: 284 },
  { name: 'Square310x310Logo.png', size: 310 },
  { name: 'StoreLogo.png', size: 50 },
];

async function generateIcons() {
  console.log('Generating icons from favicon.svg...\n');

  const svgBuffer = await sharp(SVG_PATH)
    .resize(1024, 1024)
    .toBuffer();

  for (const { name, size } of SIZES) {
    const outputPath = join(ICONS_DIR, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ Generated ${name}`);
  }

  // Generate ICO for Windows
  const icoPath = join(ICONS_DIR, 'icon.ico');
  const icoBuffer = await sharp(svgBuffer)
    .resize(256, 256)
    .png()
    .toBuffer();

  // For ICO, we need a special library, but sharp can create a basic one
  // Using png-to-ico would be better, but let's just copy the PNG for now
  // Tauri can work with PNG icons
  await sharp(svgBuffer)
    .resize(256, 256)
    .png()
    .toFile(icoPath.replace('.ico', '-temp.png'));

  console.log('\n✅ Icon generation complete!');
  console.log('\nNote: For proper .ico and .icns files, run:');
  console.log('  npx tauri icon favicon.svg');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
