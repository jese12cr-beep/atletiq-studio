import puppeteer from 'puppeteer-core';

async function runMobileTest() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // 1. Mobile Home
  console.log('Navigating to mobile home...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/40_mobile_home_hero.png' });

  // 2. Mobile Studio
  console.log('Navigating to mobile studio...');
  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/41_mobile_studio_initial.png' });

  // 3. Test Fullscreen 3D toggle
  console.log('Testing "Ver 3D" toggle...');
  const toggled = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ver 3D'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  if (toggled) {
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/42_mobile_studio_fullscreen3d.png' });

    // Toggle back to Edit mode
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Editar'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
  }

  // 4. Test each tab in Edit mode
  const tabs = [
    { id: 'tab-pill-colors', name: '43_mobile_tab_colors.png' },
    { id: 'tab-pill-text', name: '44_mobile_tab_text.png' },
    { id: 'tab-pill-logo', name: '45_mobile_tab_logo.png' },
  ];

  for (const t of tabs) {
    console.log(`Clicking ${t.id}...`);
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) el.click();
    }, t.id);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: `C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/${t.name}` });
  }

  await browser.close();
  console.log('All mobile tests completed successfully!');
}

runMobileTest().catch(console.error);
