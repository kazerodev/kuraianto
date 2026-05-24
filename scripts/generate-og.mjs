import sharp from "sharp";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dir, "../public/og-image.png");
const logoPath = join(__dir, "../public/logo-kuraianto.jpg");

const W = 1200;
const H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d0d0d"/>
      <stop offset="100%" stop-color="#0f0e0e"/>
    </linearGradient>
    <radialGradient id="glow1" cx="88%" cy="10%" r="45%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="5%" cy="95%" r="45%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0"/>
      <stop offset="25%" stop-color="#f97316" stop-opacity="1"/>
      <stop offset="75%" stop-color="#f97316" stop-opacity="1"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="logoClip">
      <circle cx="76" cy="72" r="44"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Ambient glows -->
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- Logo placeholder circle (filled by composite step) -->
  <circle cx="76" cy="72" r="44" fill="#1a1a1a"/>

  <!-- Logo area label: "DIGITAL AGENCY" top right -->
  <text
    x="${W - 80}" y="80"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="12" font-weight="700" letter-spacing="3.5"
    text-anchor="end" fill="#f97316" opacity="0.65"
  >DIGITAL AGENCY</text>

  <!-- Left accent bar -->
  <rect x="80" y="176" width="3" height="260" fill="#f97316" opacity="0.85" rx="1.5"/>

  <!-- Main wordmark -->
  <text
    x="112" y="316"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="122" font-weight="900" letter-spacing="-3"
    fill="#ffffff"
  >KURAIANTO</text>

  <!-- Orange dot -->
  <circle cx="1118" cy="276" r="9" fill="#f97316"/>

  <!-- Subtitle -->
  <text
    x="112" y="383"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="24" font-weight="400" letter-spacing="2"
    fill="#737373"
  >Web Design · SEO · Digital Marketing</text>

  <!-- Divider line -->
  <rect x="0" y="430" width="${W}" height="1" fill="url(#lineGrad)"/>

  <!-- Tagline -->
  <text
    x="112" y="492"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="19" font-weight="600" letter-spacing="0.3"
    fill="#f97316"
  >Free demo before you decide. No contracts.</text>

  <!-- Domain -->
  <text
    x="${W - 80}" y="492"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="17" font-weight="400" letter-spacing="1"
    text-anchor="end" fill="#404040"
  >kuraianto.com</text>

  <!-- Corner accent: top-left -->
  <path d="M 52 50 L 52 36 L 66 36" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
  <!-- Corner accent: bottom-right -->
  <path d="M ${W-52} ${H-50} L ${W-52} ${H-36} L ${W-66} ${H-36}" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
</svg>`;

// Step 1: render SVG to PNG buffer
const base = await sharp(Buffer.from(svg)).png().toBuffer();

// Step 2: resize logo to 88x88, make circular
const logoCircle = await sharp(logoPath)
  .resize(88, 88, { fit: "cover" })
  .png()
  .toBuffer();

// Step 3: composite logo onto base at top-left (cx=76, cy=72, so top-left = 76-44=32, 72-44=28)
const final = await sharp(base)
  .composite([{ input: logoCircle, left: 32, top: 28, blend: "over" }])
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(outPath, final);
console.log(`✓ Created ${outPath} (${(final.length / 1024).toFixed(1)} kB)`);
