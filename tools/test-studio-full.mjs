import puppeteer from 'puppeteer-core';

async function testFull() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Navigating to http://localhost:5173/#studio');
  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // The garment menu modal should be open initially
  const isGarmentModalOpen = await page.evaluate(() => {
    const dialog = document.querySelector('dialog[open]');
    return !!dialog && dialog.textContent.includes('Catálogo Caballero');
  });
  console.log('Is garment modal open initially?', isGarmentModalOpen);

  // Click on "Camiseta Fútbol F3 Basic" in the modal
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const f3Btn = buttons.find(b => b.textContent.includes('Camiseta Fútbol F3'));
    if (f3Btn) f3Btn.click();
    else {
      // or close modal
      const closeBtn = document.querySelector('dialog[open] button[title="Cerrar modal"]');
      if (closeBtn) closeBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/30_studio_f3_3d_loaded.png' });
  console.log('Saved 30_studio_f3_3d_loaded.png');

  // Now click "#btn-open-production-mold"
  console.log('2. Opening 2D production mold modal...');
  await page.click('#btn-open-production-mold');
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/31_production_mold_2d_open.png' });
  console.log('Saved 31_production_mold_2d_open.png');

  // Verify the SVG in the modal
  const moldInfo = await page.evaluate(() => {
    const modal = document.querySelector('dialog[open]');
    const svg = modal?.querySelector('svg');
    return {
      hasModal: !!modal,
      modalText: modal?.querySelector('h3')?.textContent || modal?.querySelector('h2')?.textContent,
      hasSvg: !!svg,
      svgViewBox: svg?.getAttribute('viewBox'),
      imagesCount: svg?.querySelectorAll('image')?.length || 0,
      pathsCount: svg?.querySelectorAll('path')?.length || 0,
      textElements: Array.from(svg?.querySelectorAll('text') || []).map(t => t.textContent.trim()).filter(Boolean)
    };
  });
  console.log('2D Mold Info in DOM:', moldInfo);

  await browser.close();
}

testFull().catch(console.error);
