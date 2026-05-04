import sharp from "sharp";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dir, "../public/og-image.png");

// 1200x630 — standard OG size
const W = 1200;
const H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Main background gradient: near-black with slight warm tone -->
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d0d0d"/>
      <stop offset="100%" stop-color="#111010"/>
    </linearGradient>

    <!-- Orange glow blob top-right -->
    <radialGradient id="glow1" cx="85%" cy="15%" r="40%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </radialGradient>

    <!-- Orange glow blob bottom-left -->
    <radialGradient id="glow2" cx="0%" cy="100%" r="50%" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0"/>
    </radialGradient>

    <!-- Subtle grid pattern -->
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ffffff" stroke-width="0.4" opacity="0.06"/>
    </pattern>

    <!-- Orange horizontal line gradient -->
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0"/>
      <stop offset="30%" stop-color="#f97316" stop-opacity="1"/>
      <stop offset="70%" stop-color="#f97316" stop-opacity="1"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Grid texture -->
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <!-- Glow blobs -->
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- Left accent bar -->
  <rect x="80" y="160" width="3" height="300" fill="#f97316" opacity="0.9" rx="2"/>

  <!-- Orange divider line (above tagline) -->
  <rect x="0" y="418" width="${W}" height="1" fill="url(#lineGrad)"/>

  <!-- KURAIANTO — main wordmark -->
  <text
    x="115"
    y="320"
    font-family="'Helvetica Neue', Arial, 'Liberation Sans', sans-serif"
    font-size="128"
    font-weight="900"
    letter-spacing="-4"
    fill="#ffffff"
  >KURAIANTO</text>

  <!-- Orange dot after wordmark -->
  <circle cx="1128" cy="278" r="10" fill="#f97316"/>

  <!-- Subtitle -->
  <text
    x="115"
    y="390"
    font-family="'Helvetica Neue', Arial, 'Liberation Sans', sans-serif"
    font-size="26"
    font-weight="400"
    letter-spacing="2"
    fill="#a3a3a3"
  >Web Design · SEO · Digital Marketing</text>

  <!-- Bottom row: tagline left, domain right -->
  <text
    x="115"
    y="490"
    font-family="'Helvetica Neue', Arial, 'Liberation Sans', sans-serif"
    font-size="20"
    font-weight="600"
    letter-spacing="0.5"
    fill="#f97316"
  >Free demo before you decide. No contracts.</text>

  <text
    x="${W - 80}"
    y="490"
    font-family="'Helvetica Neue', Arial, 'Liberation Sans', sans-serif"
    font-size="18"
    font-weight="400"
    letter-spacing="1"
    text-anchor="end"
    fill="#525252"
  >kuraianto.com</text>

  <!-- Top-right: "Digital Agency" label -->
  <text
    x="${W - 80}"
    y="80"
    font-family="'Helvetica Neue', Arial, 'Liberation Sans', sans-serif"
    font-size="13"
    font-weight="700"
    letter-spacing="3"
    text-anchor="end"
    fill="#f97316"
    opacity="0.7"
  >DIGITAL AGENCY</text>

  <!-- Corner accents: top-left bracket -->
  <path d="M 60 60 L 60 40 L 80 40" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  <!-- Corner accents: bottom-right bracket -->
  <path d="M ${W - 60} ${H - 60} L ${W - 60} ${H - 40} L ${W - 80} ${H - 40}" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
</svg>`;

const png = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(outPath, png);
console.log(`✓ Created ${outPath} (${(png.length / 1024).toFixed(1)} kB)`);
