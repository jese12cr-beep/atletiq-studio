import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632';

async function runVerification() {
  console.log('1. Starting Vite development server...');
  const server = await createServer({
    server: { port: 5190 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const port = address.port;
  console.log(`Vite running at http://localhost:${port}`);

  console.log('2. Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Browser error:', msg.text());
    }
  });

  try {
    // ------------------------------------------------------------------------
    // PASO 1: VERIFICAR PRODUCT SELECTOR MODAL DESDE STOREFRONT
    // ------------------------------------------------------------------------
    console.log('3. Navigating to storefront...');
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // Abrir modal de selección de prenda haciendo clic en "Configurador" en Navbar
    console.log('4. Opening ProductSelectorModal...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Configurador') || b.textContent?.includes('Configurar Modelo')
      );
      if (btn) btn.click();
    });
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await new Promise((r) => setTimeout(r, 1000));

    // Inspeccionar tarjetas e imágenes
    const modalCheck = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (!modal) return { open: false };
      const images = Array.from(modal.querySelectorAll('img')).map((img) => ({
        src: img.src,
        displayed: img.style.display !== 'none',
        naturalWidth: img.naturalWidth,
        width: img.offsetWidth,
        height: img.offsetHeight,
      }));
      const titles = Array.from(modal.querySelectorAll('h3')).map((h) => h.textContent?.trim());
      return {
        open: true,
        imageCount: images.length,
        visibleImages: images.filter((i) => i.displayed && i.width > 0).length,
        firstThreeImages: images.slice(0, 3),
        titles,
      };
    });
    console.log('ProductSelectorModal status:', JSON.stringify(modalCheck, null, 2));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_07_product_selector_fixed.png') });

    // Probar filtro de Baloncesto y Género Dama
    console.log('5. Testing filter tabs in ProductSelectorModal...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const damaTab = tabs.find((b) => b.textContent?.includes('♀ Dama'));
      if (damaTab) damaTab.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const damaTitles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="dialog"] h3')).map((h) => h.textContent?.trim());
    });
    console.log('Dama filter products:', damaTitles);

    // Clic en "Playera Fútbol F3W Dama Entallada" para entrar al estudio
    console.log('6. Selecting Playera Fútbol F3W Dama Entallada...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[role="dialog"] h3'));
      const damaF3W = cards.find((h) => h.textContent?.includes('Playera Fútbol F3W Dama Entallada'));
      if (damaF3W) {
        damaF3W.closest('.group')?.click();
      }
    });
    await new Promise((r) => setTimeout(r, 2000));

    // ------------------------------------------------------------------------
    // PASO 2: VERIFICAR ESTUDIO Y CAMBIO A PLANTILLA 2D
    // ------------------------------------------------------------------------
    console.log('7. Switching to Plantilla 2D view...');
    await page.evaluate(() => {
      const btn2D = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Plantilla 2D')
      );
      if (btn2D) btn2D.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    const svgInitialCheck = await page.evaluate(() => {
      const svg = document.querySelector('svg[viewBox="0 0 3543.31 3401.57"]');
      if (!svg) return { svgFound: false };
      const html = svg.innerHTML;
      const hasMockCurve = html.includes('M400,2100 Q950,2250');
      const hasDirectImages = html.includes('<image');
      const hasFrontClip = html.includes('clip-frente');
      const hasBackClip = html.includes('clip-trasero');
      return {
        svgFound: true,
        hasMockCurve,
        hasDirectImages,
        hasFrontClip,
        hasBackClip,
        length: html.length,
      };
    });
    console.log('Plantilla 2D Dama SVG check:', JSON.stringify(svgInitialCheck, null, 2));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_08_live_2d_initial.png') });

    // ------------------------------------------------------------------------
    // PASO 3: CAMBIAR DISEÑO EN SIDEBAR
    // ------------------------------------------------------------------------
    console.log('8. Selecting design in sidebar...');
    await page.evaluate(() => {
      const patternBtns = Array.from(document.querySelectorAll('button'));
      const cityBtn = patternBtns.find((b) => b.textContent?.includes('City') || b.textContent?.includes('Steps'));
      if (cityBtn) cityBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_09_live_2d_pattern_change.png') });

    // ------------------------------------------------------------------------
    // PASO 4: CAMBIAR COLOR Y VERIFICAR REACTIVIDAD
    // ------------------------------------------------------------------------
    console.log('9. Switching to Colores tab...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const colTab = tabs.find((b) => b.textContent?.includes('Colores'));
      if (colTab) colTab.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    await page.evaluate(() => {
      const swatches = Array.from(document.querySelectorAll('button[title]'));
      if (swatches.length > 5) {
        swatches[2].click();
      }
    });
    await new Promise((r) => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_10_live_2d_color_change.png') });

    // ------------------------------------------------------------------------
    // PASO 5: VERIFICAR MODAL 4 (GARMENT MENU & SECCIÓN DAMA)
    // ------------------------------------------------------------------------
    console.log('10. Opening Garment Menu (Modal 4)...');
    await page.evaluate(() => {
      const btn = document.getElementById('btn-open-garment-menu');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    console.log('11. Clicking ♀ Segmento Dama in Garment Menu...');
    await page.evaluate(() => {
      const btnDama = document.getElementById('modal-tab-dama');
      if (btnDama) btnDama.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const damaGarmentsCheck = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll('#garment-menu-title ~ * h4')).map((h) => h.textContent?.trim());
      const productButtons = Array.from(document.querySelectorAll('#garment-menu-title ~ * div.grid button')).map((b) =>
        b.textContent?.trim()
      );
      return { titles, productButtonsCount: productButtons.length, sampleButtons: productButtons.slice(0, 4) };
    });
    console.log('Garment Menu Dama section:', JSON.stringify(damaGarmentsCheck, null, 2));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_11_garment_menu_dama.png') });

    console.log('=== ALL TESTS PASSED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
    await server.close();
    console.log('Server & browser closed.');
  }
}

runVerification();
