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

  // 1. Switch to "Inspirados en la Liga MX" in the open catalog modal
  const ligamxTab = page.locator('#btn-men-tab-ligamx').first();
  if (await ligamxTab.isVisible()) {
    await ligamxTab.click();
    await page.waitForTimeout(1000);

    // Click "Cargar en 3D" for Club América (#btn-menu-kit-mx_america_home)
    const americaLoadBtn = page.locator('#btn-menu-kit-mx_america_home').first();
    if (await americaLoadBtn.isVisible()) {
      await americaLoadBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Screenshot América 3D workspace
  await page.screenshot({ path: path.join(OUT_DIR, '06_america_3d_workspace.png') });
  console.log('Saved 06_america_3d_workspace.png');

  // Open Plantilla modal for América
  const plantillaBtn = page.locator('#btn-open-production-mold').first();
  if (await plantillaBtn.isVisible()) {
    await plantillaBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '07_america_plantilla_2d.png') });
    console.log('Saved 07_america_plantilla_2d.png');

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  // Now switch to Tigres
  const changeClubBtn = page.locator('#btn-change-club-in-design').first();
  if (await changeClubBtn.isVisible()) {
    await changeClubBtn.click();
    await page.waitForTimeout(1000);

    // Inside Mexico Kits Modal, click Tigres
    const tigresCard = page.locator('button:has-text("Tigres UANL")').first();
    if (await tigresCard.isVisible()) {
      await tigresCard.click();
      await page.waitForTimeout(2000);
    }
  }

  // Screenshot Tigres 3D
  await page.screenshot({ path: path.join(OUT_DIR, '08_tigres_3d_workspace.png') });
  console.log('Saved 08_tigres_3d_workspace.png');

  // Open Plantilla modal for Tigres
  if (await plantillaBtn.isVisible()) {
    await plantillaBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, '09_tigres_plantilla_2d.png') });
    console.log('Saved 09_tigres_plantilla_2d.png');
  }

  await browser.close();
  console.log('Finished capturing América and Tigres in 3D and 2D Plantilla!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
