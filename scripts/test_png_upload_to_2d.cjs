const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

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

  // Close the open dialog: either click its close button or press Escape
  console.log('Closing catalog modal...');
  const openDialog = page.locator('dialog[open]').first();
  if (await openDialog.isVisible()) {
    const closeBtn = openDialog.locator('button[aria-label="Cerrar ventana"], #btn-close-garment-modal').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(1000);
  }

  // Verify dialog is closed
  const stillOpen = await page.locator('dialog[open]').count();
  console.log('Open dialogs count:', stillOpen);

  // Switch to Logo tab
  console.log('Clicking Logo tab (#tab-pill-logo)...');
  const logoTabBtn = page.locator('#tab-pill-logo').first();
  await logoTabBtn.click();
  await page.waitForTimeout(1000);

  // Upload the test PNG logo directly to #logo-file-input
  console.log('Uploading test PNG logo...');
  const fileInput = page.locator('#logo-file-input').first();
  await fileInput.setInputFiles(TEST_PNG_PATH);
  await page.waitForTimeout(3000);

  // Screenshot 3D jersey with uploaded PNG logo
  await page.screenshot({ path: path.join(OUT_DIR, '10_jersey_with_uploaded_png_3d.png') });
  console.log('Saved 10_jersey_with_uploaded_png_3d.png');

  // Open "Plantilla" modal
  console.log('Opening Plantilla modal...');
  const plantillaBtn = page.locator('#btn-open-production-mold').first();
  await plantillaBtn.click();
  await page.waitForTimeout(3000);

  // Screenshot 2D Plantilla with uploaded PNG logo
  await page.screenshot({ path: path.join(OUT_DIR, '11_plantilla_with_uploaded_png_2d.png') });
  console.log('Saved 11_plantilla_with_uploaded_png_2d.png');

  // Test SVG download & inspect DOM SVG
  const svgInfo = await page.evaluate(() => {
    const svgEl = document.querySelector('.bg-slate-200\\/80 svg');
    if (!svgEl) return { found: false };
    const html = svgEl.outerHTML;
    return {
      found: true,
      length: html.length,
      hasDirectImages: html.includes('<image'),
      hasBase64Data: html.includes('data:image/png;base64,'),
    };
  });
  console.log('SVG inspection:', svgInfo);

  await browser.close();
  console.log('PNG upload and 2D transfer test completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
