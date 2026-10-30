import puppeteer from 'puppeteer-core';

async function testLigaMxRotationAnd2D() {
  console.log('Launching browser for Liga MX rotation & 2D test...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Open Mexico Kits Modal and Select Club América Home
  console.log('1. Opening Mexico Kits modal and selecting Club América Home...');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-open-mexico-kits');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Select Club América Home
  await page.evaluate(() => {
    const btn = document.getElementById('btn-kit-mx_america_home') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Águila Crema'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Check initial decal position of América chevron
  const initialAmPos = await page.evaluate(() => {
    const root = window.__ATLETIQ_CURRENT_DESIGN__; // check design in state
    const decal = (window.__ATLETIQ_CURRENT_DESIGN__?.decals || []).find(d => d.type === 'LIGAMX_GRAPHIC');
    return decal ? { id: decal.id, centerMm: decal.centerMm, pinned: decal.pinned } : null;
  });
  console.log('América Chevron initial decal state:', initialAmPos);

  // Take screenshot in 3D
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/60_america_home_3d_front.png' });

  // 2. Perform Drag Gesture across the 3D surface to rotate the jersey
  console.log('2. Performing mouse drag across 3D canvas (OrbitControls rotation)...');
  const canvasBox = await page.evaluate(() => {
    const canvas = document.querySelector('.garment-3d-stage canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });

  if (canvasBox) {
    const startX = canvasBox.x + canvasBox.width * 0.5;
    const startY = canvasBox.y + canvasBox.height * 0.5;
    const endX = startX - 200; // Drag 200px to the left to rotate 3D view
    const endY = startY;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 15 });
    await page.mouse.up();
  }
  await new Promise(r => setTimeout(r, 1200));

  // Take screenshot after 3D rotation
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/61_america_home_3d_rotated.png' });

  // 3. Switch to 2D Plano view
  console.log('3. Switching to 2D Plano view...');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-desktop-view-2d');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/62_america_home_2d_front.png' });

  // Check 2D Espalda
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.garment-2d-stage button'));
    const espaldaBtn = btns.find(b => b.textContent.trim() === 'Espalda');
    if (espaldaBtn) espaldaBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/63_america_home_2d_espalda.png' });

  // 4. Switch to Visitante (Away) version
  console.log('4. Switching to Visitante version...');
  await page.evaluate(() => {
    const awayBtn = document.getElementById('btn-switch-kit-away');
    if (awayBtn) awayBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/64_america_away_2d_espalda.png' });

  // Switch back to 2D Frente
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.garment-2d-stage button'));
    const frenteBtn = btns.find(b => b.textContent.trim() === 'Frente');
    if (frenteBtn) frenteBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/65_america_away_2d_frente.png' });

  // 5. Test Chivas Guadalajara (Striped Kit)
  console.log('5. Testing Chivas Guadalajara with vertical stripes...');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-change-club-in-design') || document.getElementById('btn-open-mexico-kits');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const btn = document.getElementById('btn-kit-mx_chivas_home') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Rojiblanco Tapatío'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/66_chivas_home_2d_frente.png' });

  // Switch to 3D and test rotation on Chivas
  await page.evaluate(() => {
    const btn = document.getElementById('btn-desktop-view-3d');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Perform rotation drag on Chivas
  if (canvasBox) {
    const startX = canvasBox.x + canvasBox.width * 0.5;
    const startY = canvasBox.y + canvasBox.height * 0.5;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 220, startY, { steps: 15 });
    await page.mouse.up();
  }
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/67_chivas_home_3d_rotated.png' });

  // 6. Test Puebla (La Franja Diagonal)
  console.log('6. Testing Puebla with diagonal sash...');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-change-club-in-design') || document.getElementById('btn-open-mexico-kits');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const btn = document.getElementById('btn-kit-mx_puebla_home') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('La Franja'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/68_puebla_home_3d.png' });

  console.log('Runtime errors caught:', errors);
  console.log('All Liga MX tests finished successfully!');
  await browser.close();
}

testLigaMxRotationAnd2D().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
