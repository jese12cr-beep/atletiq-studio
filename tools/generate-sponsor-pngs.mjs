import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ONEDRIVE_SPONSORS_DIR = 'C:\\Users\\crja_\\OneDrive\\Documentos\\PROYECTO ATLETICQ\\sponsors';
const PUBLIC_SPONSORS_DIR = path.resolve('public/assets/sponsors');

fs.mkdirSync(ONEDRIVE_SPONSORS_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_SPONSORS_DIR, { recursive: true });

const SPONSORS = [
  'caliente',
  'dhl',
  'cemex',
  'cruz_azul',
  'codere',
  'soriana',
  'roshfrans',
  'fortaleza',
  'rolcar',
  'pedigree',
  'canels',
  'betcris',
  'fly_emirates',
  'spotify',
  'etihad',
  'telekom',
  'qatar_airways',
  'standard_chartered',
  'betsson',
  'jeep',
  '1and1',
  'riyadh_air',
];

async function generateAll() {
  console.log('Launching Edge via Puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 2 });

  // Read the sponsorLogosEngine source to evaluate in browser
  const engineCode = fs.readFileSync('src/engine/compositor/sponsorLogosEngine.js', 'utf8');

  // Strip export keyword for script evaluation
  const scriptContent = engineCode.replace(/export function drawSponsorLogoMm/g, 'window.drawSponsorLogoMm = function');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { margin: 0; background: transparent; }
          canvas { display: block; }
        </style>
      </head>
      <body>
        <canvas id="c" width="1200" height="400"></canvas>
        <script>
          ${scriptContent}

          window.renderSponsor = function(sponsorId, isWhiteTint) {
            const canvas = document.getElementById('c');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            // Center in 1200x400
            ctx.translate(canvas.width / 2, canvas.height / 2);
            // Scale mm to canvas pixels: ~2.8 px/mm
            const scale = 2.4;
            ctx.scale(scale, scale);

            const tint = isWhiteTint ? '#FFFFFF' : null;
            window.drawSponsorLogoMm(ctx, sponsorId, 420, 120, tint);
            ctx.restore();

            return canvas.toDataURL('image/png');
          };
        </script>
      </body>
    </html>
  `;

  await page.setContent(html);

  for (const sponsorId of SPONSORS) {
    // Generate full-color authentic version
    const colorDataUrl = await page.evaluate((id) => window.renderSponsor(id, false), sponsorId);
    const colorBuf = Buffer.from(colorDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');

    // Generate white / monochrome alternate
    const whiteDataUrl = await page.evaluate((id) => window.renderSponsor(id, true), sponsorId);
    const whiteBuf = Buffer.from(whiteDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');

    // Save to public assets
    fs.writeFileSync(path.join(PUBLIC_SPONSORS_DIR, `${sponsorId}.png`), colorBuf);
    fs.writeFileSync(path.join(PUBLIC_SPONSORS_DIR, `${sponsorId}_white.png`), whiteBuf);

    // Save to user OneDrive
    fs.writeFileSync(path.join(ONEDRIVE_SPONSORS_DIR, `sponsor_${sponsorId}.png`), colorBuf);
    fs.writeFileSync(path.join(ONEDRIVE_SPONSORS_DIR, `sponsor_${sponsorId}_white.png`), whiteBuf);

    console.log(`Saved sponsor: ${sponsorId} (color & white)`);
  }

  await browser.close();
  console.log('ALL 22 SPONSORS RENDERED AND SAVED SUCCESSFULLY!');
}

generateAll().catch((err) => {
  console.error('Error generating sponsors:', err);
  process.exit(1);
});
