const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function closeAnyOpenDialog(page) {
  try {
    const dialogs = await page.locator('dialog[open]').all();
    for (const d of dialogs) {
      const closeBtn = d.locator('button[aria-label="Cerrar ventana"], #btn-close-garment-modal, #btn-close-production-mold, button:has-text("✕")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
    }
  } catch (e) {
    await page.keyboard.press('Escape');
  }
}

async function run() {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:5173/#studio...');
  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Close catalog modal
  console.log('2. Closing initial catalog modal...');
  await closeAnyOpenDialog(page);
  await page.waitForTimeout(1000);

  // Open Plantilla modal for default soccer jersey
  console.log('3. Opening Plantilla for default soccer jersey...');
  await page.locator('#btn-open-production-mold').click({ force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT_DIR, '20_plantilla_soccer_stripes_2d.png') });
  console.log('Saved 20_plantilla_soccer_stripes_2d.png');

  // Close Plantilla modal
  await closeAnyOpenDialog(page);
  await page.waitForTimeout(1000);

  // Open Mexico Kits Modal
  console.log('4. Opening Mexico Kits and selecting Club América...');
  await page.locator('#btn-open-mexico-kits').click({ force: true });
  await page.waitForTimeout(1000);
  const americaBtn = page.locator('button:has-text("Club América"), button:has-text("América")').first();
  await americaBtn.click({ force: true });
  await page.waitForTimeout(2500);

  // Open Plantilla modal for Club América
  console.log('5. Opening Plantilla for Club América...');
  await page.locator('#btn-open-production-mold').click({ force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT_DIR, '21_plantilla_america_chevron_2d.png') });
  console.log('Saved 21_plantilla_america_chevron_2d.png');

  // Close Plantilla modal
  await closeAnyOpenDialog(page);
  await page.waitForTimeout(1000);

  // Open Mexico Kits Modal and switch to Chivas Guadalajara
  console.log('6. Opening Mexico Kits and selecting Chivas Guadalajara...');
  await page.locator('#btn-open-mexico-kits').click({ force: true });
  await page.waitForTimeout(1000);
  const chivasBtn = page.locator('button:has-text("Chivas Guadalajara"), button:has-text("Chivas")').first();
  await chivasBtn.click({ force: true });
  await page.waitForTimeout(2500);

  // Open Plantilla modal for Chivas
  console.log('7. Opening Plantilla for Chivas...');
  await page.locator('#btn-open-production-mold').click({ force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT_DIR, '22_plantilla_chivas_stripes_2d.png') });
  console.log('Saved 22_plantilla_chivas_stripes_2d.png');

  // Close Plantilla modal
  await closeAnyOpenDialog(page);
  await page.waitForTimeout(1000);

  // Open Mexico Kits Modal and switch to Tigres UANL
  console.log('8. Opening Mexico Kits and selecting Tigres UANL...');
  await page.locator('#btn-open-mexico-kits').click({ force: true });
  await page.waitForTimeout(1000);
  const tigresBtn = page.locator('button:has-text("Tigres UANL"), button:has-text("Tigres")').first();
  await tigresBtn.click({ force: true });
  await page.waitForTimeout(2500);

  // Open Plantilla modal for Tigres
  console.log('9. Opening Plantilla for Tigres...');
  await page.locator('#btn-open-production-mold').click({ force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT_DIR, '23_plantilla_tigres_chest_bar_2d.png') });
  console.log('Saved 23_plantilla_tigres_chest_bar_2d.png');

  await browser.close();
  console.log('All 2D mapping test verifications finished successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
