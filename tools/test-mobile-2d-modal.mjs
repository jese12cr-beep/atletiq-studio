import puppeteer from 'puppeteer-core';

async function testMobile2DModal() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Click the scissors button (Plantilla 2D) on mobile header
  const clicked = await page.evaluate(() => {
    const btn = document.querySelector('header button[title="Ver Plantilla 2D"]');
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('Clicked 2D mold button:', clicked);

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/diag_mobile_2d_modal.png' });

  await browser.close();
}

testMobile2DModal().catch(console.error);
