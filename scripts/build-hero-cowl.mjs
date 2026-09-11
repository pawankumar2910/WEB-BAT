import sharp from "sharp";
import { writeFileSync } from "node:fs";

/* Builds hero-cowl.{png,webp} from the REAL hero-face image via offline
   edge-detection instead of AI generation (no API needed, zero cost, and
   pixel-perfect alignment is guaranteed since it's derived from the exact
   same source pixels). Produces a glowing violet/cyan wireframe read of
   the same portrait -- "the model before it's rendered" -- which the
   cursor mask (a CSS mask, not this image's alpha) resolves into the real
   photo underneath. The cowl itself is fully opaque; only the CSS mask
   punches the hole, so no alpha channel is needed here.

   hero-face.png carries real alpha transparency; edge-detection math run
   directly on an RGBA source scrambles the alpha channel too (transparent
   areas erase to near-zero everywhere except at the alpha boundary, which
   renders as a white halo in any viewer). Flattening onto solid black
   FIRST -- before greyscale/convolve -- avoids that entirely. */

const SRC = "./public/assets/hero-face.png";
const OUT_PNG = "./public/assets/hero-cowl.png";
const OUT_WEBP = "./public/assets/hero-cowl.webp";

const flat = sharp(SRC).flatten({ background: "#000000" });

async function edgeMap() {
  return flat
    .clone()
    .greyscale()
    .blur(1.6)
    .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
    .normalise()
    .linear(2.3, 0)
    .toBuffer();
}

const sharpEdges = await edgeMap();
const wideGlow = await sharp(await edgeMap()).blur(18).linear(2.2, 0).toBuffer();

const tintedSharp = await sharp(sharpEdges).tint({ r: 196, g: 175, b: 255 }).toBuffer();
const tintedGlow = await sharp(wideGlow)
  .tint({ r: 34, g: 211, b: 238 })
  .modulate({ brightness: 1.3 })
  .toBuffer();

const result = await sharp(tintedGlow)
  .composite([{ input: tintedSharp, blend: "lighten" }])
  .flatten({ background: "#050505" })
  .png()
  .toBuffer();

writeFileSync(OUT_PNG, result);
await sharp(result).webp({ quality: 92 }).toFile(OUT_WEBP);

const meta = await sharp(result).metadata();
console.log("wrote", OUT_PNG, "and", OUT_WEBP, `(${meta.width}x${meta.height})`);
