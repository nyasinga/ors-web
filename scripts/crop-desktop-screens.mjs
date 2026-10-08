#!/usr/bin/env node
/**
 * Crop the LEFT desktop region from each UX Screens 2 PNG
 * (full exports are desktop + phone mockup side-by-side).
 *
 * Usage (from ors-web): npm run design:crop
 * Output: ../design/desktop/*.png
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const srcDir = path.join(root, "UX Screens 2");
const outDir = path.join(root, "design", "desktop");

/** Fraction of full width that is desktop (phone starts ~x=998 on 1536px assets). */
const DESKTOP_RATIO = 998 / 1536;

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Missing dependency: sharp. Run: npm install -D sharp");
    process.exit(1);
  }

  if (!fs.existsSync(srcDir)) {
    console.error("Source folder not found:", srcDir);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const files = fs
    .readdirSync(srcDir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();

  if (files.length === 0) {
    console.error("No PNG files in", srcDir);
    process.exit(1);
  }

  console.log(`Cropping ${files.length} screens → ${outDir}`);
  console.log(`Desktop width ratio: ${(DESKTOP_RATIO * 100).toFixed(1)}%\n`);

  for (const file of files) {
    const input = path.join(srcDir, file);
    const output = path.join(outDir, file);
    const meta = await sharp(input).metadata();
    const w = meta.width ?? 1536;
    const h = meta.height ?? 1024;
    const cropW = Math.round(w * DESKTOP_RATIO);

    await sharp(input)
      .extract({ left: 0, top: 0, width: cropW, height: h })
      .png()
      .toFile(output);

    console.log(`✓ ${file}  (${w}×${h} → ${cropW}×${h})`);
  }

  console.log(`\nDone. Attach files from design/desktop/ when prompting.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
