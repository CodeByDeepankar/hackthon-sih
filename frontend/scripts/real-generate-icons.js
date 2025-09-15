#!/usr/bin/env node
/*
	Generate PWA icons from a source logo using sharp.
	Usage:
		node scripts/real-generate-icons.js              # uses public/logo.png
		node scripts/real-generate-icons.js ./path/to/source.png
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

async function ensureDir(p) {
	await fs.promises.mkdir(p, { recursive: true });
}

async function main() {
	const inputArg = process.argv[2];
	const defaultLogo = path.join(PUBLIC_DIR, 'logo.png');
	const inputPath = inputArg ? path.resolve(process.cwd(), inputArg) : defaultLogo;

	try {
		await fs.promises.access(inputPath, fs.constants.R_OK);
	} catch {
		console.error(`Source logo not found at ${inputPath}. Provide a path or place a logo at public/logo.png`);
		process.exit(1);
	}

	await ensureDir(ICONS_DIR);

	// If a custom input was provided and differs from public/logo.png, copy it as the new logo
	if (path.resolve(inputPath) !== path.resolve(defaultLogo)) {
		await fs.promises.copyFile(inputPath, defaultLogo);
		console.log(`Updated ${defaultLogo} from ${inputPath}`);
	}

	const sizes = [192, 256, 384, 512];

	// Helper to generate maskable by padding transparent area to 1.2x for safe zones
	async function generateIcon(size) {
		const baseOut = path.join(ICONS_DIR, `icon-${size}.png`);
		const maskableOut = path.join(ICONS_DIR, `icon-${size}-maskable.png`);

		// Standard icon (contain to preserve aspect ratio)
		await sharp(defaultLogo)
			.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
			.png()
			.toFile(baseOut);

		// Maskable icon: draw into a larger canvas to provide safe area, then resize back to requested size
		const canvasSize = Math.round(size * 1.2);
		const buffer = await sharp({
			create: {
				width: canvasSize,
				height: canvasSize,
				channels: 4,
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			}
		})
			.png()
			.toBuffer();

		const logoBuf = await sharp(defaultLogo)
			.resize(Math.round(size * 0.9), Math.round(size * 0.9), { fit: 'contain' })
			.png()
			.toBuffer();

		const composite = await sharp(buffer)
			.composite([{ input: logoBuf, gravity: 'center' }])
			.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
			.png()
			.toBuffer();

		await fs.promises.writeFile(maskableOut, composite);

		console.log(`Generated ${path.basename(baseOut)} and ${path.basename(maskableOut)}`);
	}

		for (const s of sizes) {
			await generateIcon(s);
		}

	console.log('PWA icon generation complete.');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
