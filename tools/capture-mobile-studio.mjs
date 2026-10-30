import puppeteer from 'puppeteer-core';

async function captureMobileStudio() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  // Standard modern mobile phone viewport (iPhone 13/14/15 size)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot initial studio state on mobile (e.g. with modal if open)
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/37_mobile_studio_initial.png' });

  // Close garment dialog if open
  await page.evaluate(() => {
    document.querySelectorAll('dialog').forEach(d => {
      d.close?.();
      d.removeAttribute('open');
    });
  });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot studio main view on mobile
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/38_mobile_studio_canvas_view.png' });

  // Check layout dimensions
  const layoutMetrics = await page.evaluate(() => {
    const header = document.querySelector('header');
    const canvas = document.querySelector('canvas');
    const bottomBar = document.querySelector('.fixed.bottom-0') || document.querySelector('footer') || document.querySelector('.bottom-bar');
    const sidePanels = Array.from(document.querySelectorAll('aside, .sidebar, div[class*="w-"]')).map(el => ({
      tag: el.tagName,
      className: el.className.slice(0, 80),
      rect: el.getBoundingClientRect()
    })).filter(e => e.rect.width > 100);

    return {
      windowSize: { w: window.innerWidth, h: window.innerHeight },
      headerRect: header?.getBoundingClientRect(),
      canvasRect: canvas?.getBoundingClientRect(),
      sidePanelsCount: sidePanels.length
    };
  });
  console.log('Layout metrics:', JSON.stringify(layoutMetrics, null, 2));

  // Click tabs on mobile to see editing options: Diseño, Colores, Text, Logo
  const tabs = ['tab-pill-design', 'tab-pill-colors', 'tab-pill-text', 'tab-pill-logo'];
  for (const tabId of tabs) {
    const clicked = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) { el.click(); return true; }
      return false;
    }, tabId);
    if (clicked) {
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: `C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/39_mobile_tab_${tabId}.png` });
    }
  }

  await browser.close();
}

captureMobileStudio().catch(console.error);
