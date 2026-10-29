import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runTest() {
  console.log('Launching Edge headless...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  const network404s = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' || text.includes('Error cargando') || text.includes('Error decodificando')) {
      errors.push(`[${msg.type()}] ${text}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`[PAGE_ERROR] ${err.message}`);
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      network404s.push(`${resp.status()} ${resp.url()}`);
    }
  });

  console.log('1. Testing Landing Page (http://localhost:5173/)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/26_owayo_home_landing.png' });

  console.log('2. Navigating to Studio (http://localhost:5173/#studio)...');
  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/27_studio_workspace_loaded.png' });

  // Check 3D canvas
  const canvasExists = await page.evaluate(() => {
    const cvs = document.querySelector('canvas');
    return cvs ? { w: cvs.width, h: cvs.height } : null;
  });
  console.log('3D Canvas check:', canvasExists);

  // Close garment menu if open, and open 2D production mold modal
  console.log('3. Opening 2D Production Mold Modal...');
  await page.evaluate(() => {
    // If garment menu is open, close it or click a product
    const closeBtn = document.querySelector('dialog button[title="Cerrar modal"]') || document.querySelector('button[aria-label="Cerrar"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click on "Plantilla 2D" / "Exportar Molde 2D" button
  const clicked2D = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b2d = btns.find(b => b.textContent.includes('Plantilla 2D') || b.textContent.includes('Molde') || b.textContent.includes('Producción') || b.textContent.includes('Aplanado'));
    if (b2d) {
      b2d.click();
      return b2d.textContent.trim();
    }
    return null;
  });
  console.log('Clicked 2D button:', clicked2D);

  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/28_production_mold_2d_rendered.png' });

  console.log('\n--- RESULTS ---');
  console.log('Errors:', errors);
  console.log('404s:', network404s);

  await browser.close();
}

runTest().catch(console.error);
