const { chromium } = require('playwright-core');
const path = require('path');

const OUT_DIR = 'C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173/#studio...');
  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Initial screenshot with catalog open and soccer jersey active
  await page.screenshot({ path: path.join(OUT_DIR, '01_studio_catalog_modal.png') });
  console.log('Saved 01_studio_catalog_modal.png');

  // Switch to "Inspirados en la Liga MX" tab in the open modal
  const ligamxTab = page.locator('button:has-text("Inspirados en la Liga MX")').first();
  if (await ligamxTab.isVisible()) {
    await ligamxTab.click();
    await page.waitForTimeout(1000);
    // Click on Club América
    const americaBtn = page.locator('button:has-text("Club América"), button:has-text("América")').first();
    if (await americaBtn.isVisible()) {
      await americaBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Ensure any dialog is closed
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 2. Studio workspace with América and clean white sidebar
  await page.screenshot({ path: path.join(OUT_DIR, '02_studio_america_workspace.png') });
  console.log('Saved 02_studio_america_workspace.png');

  // 3. Click "Text" tab
  const textTab = page.locator('button:has-text("Text")').first();
  if (await textTab.isVisible()) {
    await textTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '03_studio_text_tab_white.png') });
    console.log('Saved 03_studio_text_tab_white.png');
  }

  // 4. Click "Logo" tab
  const logoTab = page.locator('button:has-text("Logo")').first();
  if (await logoTab.isVisible()) {
    await logoTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '04_studio_logo_tab_white.png') });
    console.log('Saved 04_studio_logo_tab_white.png');
  }

  // 5. Click "Plantilla" button in bottom bar
  const plantillaBtn = page.locator('#btn-open-production-mold').first();
  if (await plantillaBtn.isVisible()) {
    await plantillaBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '05_plantilla_modal_all_pieces.png') });
    console.log('Saved 05_plantilla_modal_all_pieces.png');
  }

  await browser.close();
  console.log('All verification screenshots saved successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
