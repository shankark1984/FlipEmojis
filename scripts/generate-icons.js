import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPngBuffer(width, height, r, g, b, emojiChar = '🃏') {
  // Simple solid color PNG with basic center drawing or gradient
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        const bit = (byte ^ crc) & 1;
        crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
        byte >>>= 1;
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lengthBuf = Buffer.alloc(4);
    lengthBuf.writeUInt32BE(data.length, 0);

    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);

    return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
  }

  // IHDR chunk: width (4), height (4), bit depth (1), color type (6 = RGBA), compression (0), filter (0), interlace (0)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with scanline filter 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep vibrant indigo to violet gradient background
      const gradRatio = (x + y) / (width + height);
      let pr = Math.round(15 + gradRatio * 45); // #0f172a to purple
      let pg = Math.round(23 + gradRatio * 25);
      let pb = Math.round(42 + gradRatio * 85);
      let pa = 255;

      // Inner card badge
      if (dist < radius) {
        pr = Math.min(255, pr + 160);
        pg = Math.min(255, pg + 100);
        pb = Math.min(255, pb + 10);
      }

      rawData[px] = pr;
      rawData[px + 1] = pg;
      rawData[px + 2] = pb;
      rawData[px + 3] = pa;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
const wellKnownDir = path.resolve('public/.well-known');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(wellKnownDir)) fs.mkdirSync(wellKnownDir, { recursive: true });

// Create SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#431407"/>
    </linearGradient>
    <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <!-- Card 1 -->
  <g transform="translate(140, 110) rotate(-12)" filter="url(#shadow)">
    <rect width="160" height="230" rx="24" fill="#1e293b" stroke="#f59e0b" stroke-width="8"/>
    <text x="80" y="145" font-size="96" text-anchor="middle" dominant-baseline="central">🦊</text>
  </g>
  <!-- Card 2 -->
  <g transform="translate(230, 140) rotate(8)" filter="url(#shadow)">
    <rect width="160" height="230" rx="24" fill="#312e81" stroke="#38bdf8" stroke-width="8"/>
    <text x="80" y="145" font-size="96" text-anchor="middle" dominant-baseline="central">⚡</text>
  </g>
  <!-- Sparkles -->
  <circle cx="100" cy="90" r="12" fill="#fbbf24"/>
  <circle cx="410" cy="110" r="8" fill="#38bdf8"/>
  <circle cx="390" cy="400" r="14" fill="#ec4899"/>
  <!-- Brand text -->
  <text x="256" y="445" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" fill="#f8fafc" text-anchor="middle" letter-spacing="2">FLIP EMOJIS</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon, 'utf8');

// Generate PNG icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPngBuffer(192, 192, 245, 158, 11));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPngBuffer(512, 512, 245, 158, 11));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPngBuffer(512, 512, 245, 158, 11));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPngBuffer(180, 180, 245, 158, 11));

// Digital Asset Links for Google Play Store TWA
const assetLinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.flipemojis.game",
      sha256_cert_fingerprints: [
        "14:6D:E9:7D:0F:52:AB:FC:21:48:65:29:43:7E:11:43:2F:B0:98:90:98:02:44:A2:4B:9B:6C:54:E5:A9:C3:57"
      ]
    }
  }
];
fs.writeFileSync(path.join(wellKnownDir, 'assetlinks.json'), JSON.stringify(assetLinks, null, 2), 'utf8');

console.log('PWA assets generated successfully in /public');
