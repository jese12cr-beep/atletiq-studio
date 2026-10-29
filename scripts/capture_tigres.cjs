const { chromium } = require('playwright-core');
const path = require('path');

const OUT_DIR = 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

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

  // Switch to "Inspirados en la Liga MX" in the open catalog modal
  const ligamxTab = page.locator('#btn-men-tab-ligamx').first();
  if (await ligamxTab.isVisible()) {
    await ligamxTab.click();
    await page.waitForTimeout(1000);

    // Click "Cargar en 3D" for Tigres UANL (#btn-menu-kit-mx_tigres_home)
    const tigresLoadBtn = page.locator('#btn-menu-kit-mx_tigres_home').first();
    if (await tigresLoadBtn.isVisible()) {
      await tigresLoadBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Screenshot Tigres 3D workspace
  await page.screenshot({ path: path.join(OUT_DIR, '08_tigres_3d_workspace.png') });
  console.log('Saved 08_tigres_3d_workspace.png');

  // Open Plantilla modal for Tigres
  const plantillaBtn = page.locator('#btn-open-production-mold').first();
  if (await plantillaBtn.isVisible()) {
    await plantillaBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '09_tigres_plantilla_2d.png') });
    console.log('Saved 09_tigres_plantilla_2d.png');
  }

  await browser.close();
  console.log('Tigres verification completed!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
