import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { darkTokens, lightTokens } from "../src/index.ts";

const root = new URL("../../../", import.meta.url);
const path = (name: string) => fileURLToPath(new URL(name, root));
const source = path("packages/ui-tokens/assets/Rakazo.icon/Assets/orange-bot.png");

// Match the Icon Composer portrait: the character sits 90 points below center.
const portrait = await sharp(source).resize(1024, 1024).png().toBuffer();
async function framed(background: string) {
  return sharp({ create: { width: 1024, height: 1114, channels: 4, background } })
    .composite([{ input: portrait, top: 90, left: 0 }])
    .extract({ left: 0, top: 0, width: 1024, height: 1024 })
    .png()
    .toBuffer();
}
const mask = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" rx="200" fill="white"/></svg>',
);
async function roundedCorners(input: Buffer) {
  return sharp(input)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}
const square = await framed(darkTokens.background);
const rounded = await roundedCorners(square);

async function png(input: Buffer, name: string, size: number) {
  await sharp(input).resize(size, size).png().toFile(path(name));
}

// PNG frames in ICO are supported by modern Windows and browser favicon loaders.
async function ico(input: Buffer, name: string, sizes: number[]) {
  const frames = await Promise.all(sizes.map((size) => sharp(input).resize(size).png().toBuffer()));
  const header = Buffer.alloc(6 + frames.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach((frame, index) => {
    const entry = 6 + index * 16;
    const size = sizes[index] ?? 0;
    header[entry] = header[entry + 1] = size === 256 ? 0 : size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(frame.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += frame.length;
  });
  await writeFile(path(name), Buffer.concat([header, ...frames]));
}

for (const app of ["web", "www"]) {
  const publicDir = `apps/${app}/public`;
  await png(rounded, `${publicDir}/favicon-16x16.png`, 16);
  await png(rounded, `${publicDir}/favicon-32x32.png`, 32);
  await png(rounded, `${publicDir}/favicon.png`, 128);
  await png(square, `${publicDir}/apple-touch-icon.png`, 180);
  await png(square, `${publicDir}/icon-192.png`, 192);
  await png(square, `${publicDir}/icon-512.png`, 512);
  await ico(rounded, `${publicDir}/favicon.ico`, [16, 32, 48]);
}
await mkdir(path("apps/www/public/brand"), { recursive: true });
await png(rounded, "apps/www/public/brand/rakazo-mark.png", 256);
// The site header shows the mark at 36px; 72px covers 2x screens.
await sharp(rounded)
  .resize(72, 72)
  .webp({ quality: 90 })
  .toFile(path("apps/www/public/brand/rakazo-mark-72.webp"));
await png(rounded, "apps/mobile/assets/favicon.png", 128);
await png(square, "apps/desktop/assets/icon.png", 1024);
await ico(rounded, "apps/desktop/assets/icon.ico", [16, 32, 48, 64, 128, 256]);

// Development launches replace the Dock icon with one that carries the same DEV label as the app.
const DEV_BADGE = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="288" height="160">' +
    `<rect x="5" y="5" width="278" height="150" rx="24" fill="${lightTokens.background}" stroke="${lightTokens.warning}" stroke-width="10"/>` +
    '<text x="144" y="112" text-anchor="middle" font-family="sans-serif" ' +
    `font-weight="700" font-size="86" fill="${lightTokens.foreground}">DEV</text></svg>`,
);
const DEV_BADGE_INSET = 56;
/** Draws the DEV badge over the icon tile's bottom-right corner, clear of its rounded edge. */
async function devIcon(input: string, name: string) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let right = 0;
  let bottom = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if ((data[(y * info.width + x) * 4 + 3] ?? 0) > 8) {
        if (x > right) right = x;
        if (y > bottom) bottom = y;
      }
    }
  }
  await sharp(input)
    .composite([
      {
        input: DEV_BADGE,
        left: right - DEV_BADGE_INSET - 288,
        top: bottom - DEV_BADGE_INSET - 160,
      },
    ])
    .png()
    .toFile(path(name));
}
await devIcon(path("apps/desktop/assets/icon-macos.png"), "apps/desktop/assets/icon-macos-dev.png");
await devIcon(path("apps/desktop/assets/icon.png"), "apps/desktop/assets/icon-dev.png");

// The splash shows the character alone, with no plate, so it sits on either splash colour.
// Keep the existing transparent padding so its visual size stays stable.
await sharp(await roundedCorners(await framed("transparent")))
  .resize(620, 620)
  .extend({ top: 202, bottom: 202, left: 202, right: 202, background: "transparent" })
  .png()
  .toFile(path("apps/mobile/assets/splash-icon.png"));

// Android notification icons must be white alpha silhouettes, with transparent eyes.
const silhouette = await sharp(path("apps/mobile/assets/monochrome-icon.png"))
  .resize(72, 72)
  .extractChannel("alpha")
  .toBuffer();
await sharp({ create: { width: 72, height: 72, channels: 3, background: "white" } })
  .joinChannel(silhouette)
  .png()
  .toFile(path("apps/mobile/assets/notification-icon.png"));
