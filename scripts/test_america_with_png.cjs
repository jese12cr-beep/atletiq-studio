const { chromium } = require('playwright-core');
const path = require('path');

const OUT_DIR = 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const TEST_PNG_PATH = path.join(__dirname, 'test_logo_sponsor.png');

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

  // Switch to Logo tab
  console.log('Clicking Logo tab (#tab-pill-logo)...');
  const logoTabBtn = page.locator('#tab-pill-logo').first();
  await logoTabBtn.click();
  await page.waitForTimeout(1000);

  // Upload the test PNG logo directly to #logo-file-input
  console.log('Uploading test PNG logo to Club América...');
  const fileInput = page.locator('#logo-file-input').first();
  await fileInput.setInputFiles(TEST_PNG_PATH);
  await page.waitForTimeout(3000);

  // Screenshot 3D América jersey with uploaded PNG logo
  await page.screenshot({ path: path.join(OUT_DIR, '12_america_with_uploaded_png_3d.png') });
  console.log('Saved 12_america_with_uploaded_png_3d.png');

  // Open "Plantilla" modal
  console.log('Opening Plantilla modal...');
  const plantillaBtn = page.locator('#btn-open-production-mold').first();
  await plantillaBtn.click();
  await page.waitForTimeout(3000);

  // Screenshot 2D Plantilla América with uploaded PNG logo
  await page.screenshot({ path: path.join(OUT_DIR, '13_america_plantilla_with_uploaded_png_2d.png') });
  console.log('Saved 13_america_plantilla_with_uploaded_png_2d.png');

  await browser.close();
  console.log('América PNG upload test completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
