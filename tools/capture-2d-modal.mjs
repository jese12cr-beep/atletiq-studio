import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Close garment menu dialog if open
  await page.evaluate(() => {
    const dialogClose = document.querySelector('dialog[open] button[title="Cerrar modal"]');
    if (dialogClose) dialogClose.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click #btn-open-production-mold
  await page.click('#btn-open-production-mold');
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/29_plantilla_2d_modal_open.png' });
  console.log('Saved 29_plantilla_2d_modal_open.png');

  // Check if svg elements exist in the modal
  const svgPieces = await page.evaluate(() => {
    const svg = document.querySelector('svg[viewBox="0 0 3543.31 3401.57"]');
    if (!svg) return { hasSvg: false };
    const images = svg.querySelectorAll('image');
    const paths = svg.querySelectorAll('path');
    return {
      hasSvg: true,
      imagesCount: images.length,
      pathsCount: paths.length,
    };
  });
  console.log('SVG Pieces rendered:', svgPieces);

  await browser.close();
}

run().catch(console.error);
