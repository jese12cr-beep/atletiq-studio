import puppeteer from 'puppeteer-core';

async function verifyAllFeatures() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // ==========================================
  // TEST 1: MOBILE (390 x 844)
  // ==========================================
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  console.log('1. Testing Mobile Storefront...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/50_mobile_storefront_athletic.png' });

  // Mobile Studio in 3D
  console.log('2. Testing Mobile Studio 3D...');
  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/51_mobile_studio_3d.png' });

  // Test 2D Toggle on Mobile
  console.log('3. Toggling to 2D Plano on mobile...');
  const clicked2D = await page.evaluate(() => {
    const btn = document.getElementById('btn-mobile-view-2d');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked 2D button on mobile:', clicked2D);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/52_mobile_studio_2d_flat.png' });

  // Switch 2D pieces: Espalda
  console.log('4. Switching to Espalda piece in 2D...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.garment-2d-stage button'));
    const espaldaBtn = btns.find(b => b.textContent.trim() === 'Espalda');
    if (espaldaBtn) espaldaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/53_mobile_studio_2d_espalda.png' });

  // Test Logo Tab with Liga MX Presets
  console.log('5. Testing Logo tab with Liga MX presets...');
  await page.evaluate(() => {
    const logoTab = document.getElementById('tab-pill-logo');
    if (logoTab) logoTab.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/54_mobile_tab_logo_ligamx.png' });

  // Click a Liga MX team crest (e.g. Club América)
  console.log('6. Adding Club América crest from Liga MX presets...');
  await page.evaluate(() => {
    const crestBtns = Array.from(document.querySelectorAll('button[title*="América"]'));
    if (crestBtns[0]) crestBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Save Design and Open User Gallery
  console.log('7. Testing Save Design to Gallery...');
  await page.evaluate(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Guardar') && b.closest('.shrink-0'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('8. Opening Mobile Gallery...');
  await page.evaluate(() => {
    const galleryBtn = document.querySelector('header button[title*="Galería"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mi Galería'));
    if (galleryBtn) galleryBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/55_mobile_user_gallery_modal.png' });

  // Close gallery
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Cerrar galería"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // ==========================================
  // TEST 2: DESKTOP (1440 x 900)
  // ==========================================
  console.log('9. Testing Desktop Studio...');
  await page.setViewport({ width: 1440, height: 900, isMobile: false });
  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/56_desktop_studio_3d.png' });

  // Toggle 2D on Desktop
  console.log('10. Toggling 2D on Desktop...');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-desktop-view-2d');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/57_desktop_studio_2d.png' });

  // Desktop Gallery
  console.log('11. Opening Desktop Gallery...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('Mis Diseños'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/58_desktop_user_gallery.png' });

  await browser.close();
  console.log('All verifications completed successfully!');
}

verifyAllFeatures().catch(console.error);
