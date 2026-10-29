import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testUrl(targetUrl, screenshotName) {
  console.log(`\n=== TESTING ${targetUrl} ===`);
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
    if (msg.type() === 'error' || text.includes('Error') || text.includes('Uncaught')) {
      errors.push(`[${msg.type()}] ${text}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`[PAGE_ERROR] ${err.message}\n${err.stack}`);
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      network404s.push(`${resp.status()} ${resp.url()}`);
    }
  });

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 25000 });
  } catch (e) {
    console.error('Goto error/timeout:', e.message);
  }

  await new Promise(r => setTimeout(r, 3000));

  const screenshotPath = `C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/${screenshotName}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot saved to ${screenshotPath}`);

  console.log(`Errors count: ${errors.length}`);
  errors.forEach(e => console.log('  ERR:', e));

  console.log(`HTTP >= 400 count: ${network404s.length}`);
  network404s.forEach(n => console.log('  404:', n));

  // Check 3D canvas element
  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      hasCanvas: !!canvas,
      width: canvas?.width,
      height: canvas?.height,
      parentClass: canvas?.parentElement?.className
    };
  });
  console.log('Canvas info:', canvasInfo);

  await browser.close();
}

async function run() {
  await testUrl('http://localhost:5173/', 'diag_local_home');
  await testUrl('http://localhost:5173/#studio', 'diag_local_studio');
  await testUrl('https://jese12cr-beep.github.io/ATLETIQ-STUDIO/', 'diag_gh_home');
  await testUrl('https://jese12cr-beep.github.io/ATLETIQ-STUDIO/#studio', 'diag_gh_studio');
}

run().catch(console.error);
