/* Generates PWA icons & screenshots using sharp.
   Usage: node scripts/real-generate-icons.js source.png
*/
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';

const src = process.argv[2] || 'public/logo.png';
const iconDir = 'public/icons';
const screenDir = 'public/screenshots';
if (!existsSync(iconDir)) mkdirSync(iconDir, { recursive: true });
if (!existsSync(screenDir)) mkdirSync(screenDir, { recursive: true });

const iconSizes = [192, 256, 384, 512];

async function run() {
  for (const size of iconSizes) {
    await sharp(src)
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, `icon-${size}.png`));
    // maskable variant: extend with transparent padding to preserve safe area
    await sharp(src)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(iconDir, `icon-${size}-maskable.png`));
  }
  // Basic dummy screenshots (solid color) – replace with real captures
  const wide = Buffer.from(
    '<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="800" fill="#0f172a"/><text x="50%" y="50%" font-size="64" fill="#fff" text-anchor="middle" dominant-baseline="middle">Dashboard</text></svg>'
  );
  await sharp(wide).png().toFile(path.join(screenDir, 'wide-1.png'));
  const mobile = Buffer.from(
    '<svg width="540" height="960" xmlns="http://www.w3.org/2000/svg"><rect width="540" height="960" fill="#0f172a"/><text x="50%" y="50%" font-size="48" fill="#fff" text-anchor="middle" dominant-baseline="middle">Lesson</text></svg>'
  );
  await sharp(mobile).png().toFile(path.join(screenDir, 'mobile-1.png'));
  console.log('Icons & placeholder screenshots generated.');
}

run().catch(e => { console.error(e); process.exit(1); });
