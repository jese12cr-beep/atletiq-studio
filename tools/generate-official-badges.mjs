import fs from 'fs';
import path from 'path';

const outDir = 'public/assets/badges';
const cloudDir = 'C:/Users/crja_/OneDrive/Documentos/PROYECTO ATLETICQ/badges';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(cloudDir)) fs.mkdirSync(cloudDir, { recursive: true });

// 1. Liga MX Official Badge
const ligamxOfficial = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="lgbg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <linearGradient id="lgring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#006847"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ce1126"/>
    </linearGradient>
  </defs>
  <circle cx="250" cy="250" r="240" fill="url(#lgbg)" stroke="url(#lgring)" stroke-width="16"/>
  <circle cx="250" cy="250" r="215" fill="none" stroke="#0f172a" stroke-width="4" stroke-dasharray="6 4"/>
  <path d="M250,75 L360,135 L360,265 C360,340 250,410 250,410 C250,410 140,340 140,265 L140,135 Z" fill="#006847" stroke="#ffffff" stroke-width="8"/>
  <path d="M250,90 L345,145 L345,260 C345,325 250,388 250,388 C250,388 155,325 155,260 L155,145 Z" fill="#ce1126"/>
  <path d="M250,105 L330,155 L330,255 C330,310 250,366 250,366 C250,366 170,310 170,255 L170,155 Z" fill="#ffffff"/>
  <circle cx="250" cy="225" r="48" fill="#0f172a" stroke="#ffffff" stroke-width="4"/>
  <polygon points="250,195 275,213 265,243 235,243 225,213" fill="#ffffff"/>
  <text x="250" y="325" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="36" fill="#006847" letter-spacing="2">LIGA BBVA</text>
  <text x="250" y="358" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="30" fill="#ce1126" letter-spacing="4">MX</text>
</svg>`;

// 2. Liga MX Campeon Gold Badge
const ligamxChampion = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="goldbg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="40%" stop-color="#fde047"/>
      <stop offset="80%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </radialGradient>
  </defs>
  <circle cx="250" cy="250" r="240" fill="url(#goldbg)" stroke="#fbbf24" stroke-width="14"/>
  <circle cx="250" cy="250" r="215" fill="none" stroke="#ffffff" stroke-width="6"/>
  <polygon points="250,75 270,130 328,130 282,166 298,220 250,188 202,220 218,166 172,130 230,130" fill="#ffffff" stroke="#78350f" stroke-width="4"/>
  <text x="250" y="290" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="48" fill="#ffffff" stroke="#78350f" stroke-width="6" letter-spacing="3">CAMPEÓN</text>
  <text x="250" y="345" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="38" fill="#ffffff" letter-spacing="2">LIGA MX</text>
  <text x="250" y="395" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="24" fill="#fef3c7" letter-spacing="6">OFICIAL</text>
</svg>`;

// 3. UCL Starball Badge
const stars = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => `
  <polygon points="250,150 258,172 282,172 263,186 270,208 250,195 230,208 237,186 218,172 242,172" transform="rotate(${deg} 250 250)"/>
`).join('');

const uclStarball = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="uclbg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="70%" stop-color="#0a101d"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <circle cx="250" cy="250" r="240" fill="url(#uclbg)" stroke="#94a3b8" stroke-width="10"/>
  <circle cx="250" cy="250" r="222" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <g fill="#ffffff" stroke="#0a101d" stroke-width="2">
    ${stars}
  </g>
  <circle cx="250" cy="250" r="38" fill="#ffffff" stroke="#020617" stroke-width="3"/>
  <text x="250" y="258" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="20" fill="#020617">UCL</text>
</svg>`;

// 4. UCL Foundation Badge
const uclFoundation = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="fndbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#082f49"/>
    </linearGradient>
  </defs>
  <circle cx="250" cy="250" r="240" fill="url(#fndbg)" stroke="#38bdf8" stroke-width="10"/>
  <circle cx="250" cy="250" r="220" fill="none" stroke="#ffffff" stroke-width="4"/>
  <text x="250" y="180" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="42" fill="#ffffff" letter-spacing="4">UEFA</text>
  <text x="250" y="250" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="36" fill="#38bdf8" letter-spacing="2">FOUNDATION</text>
  <text x="250" y="310" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="24" fill="#ffffff" letter-spacing="6">for children</text>
  <path d="M170,360 Q250,390 330,360" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
</svg>`;

fs.writeFileSync(path.join(outDir, 'badge_ligamx_official.svg'), ligamxOfficial);
fs.writeFileSync(path.join(cloudDir, 'badge_ligamx_official.svg'), ligamxOfficial);

fs.writeFileSync(path.join(outDir, 'badge_ligamx_champion.svg'), ligamxChampion);
fs.writeFileSync(path.join(cloudDir, 'badge_ligamx_champion.svg'), ligamxChampion);

fs.writeFileSync(path.join(outDir, 'badge_ucl_starball.svg'), uclStarball);
fs.writeFileSync(path.join(cloudDir, 'badge_ucl_starball.svg'), uclStarball);

fs.writeFileSync(path.join(outDir, 'badge_ucl_foundation.svg'), uclFoundation);
fs.writeFileSync(path.join(cloudDir, 'badge_ucl_foundation.svg'), uclFoundation);

console.log('Generated 4 official sleeve badges successfully!');
