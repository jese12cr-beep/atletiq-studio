import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632';

async function testUserExperience() {
  console.log('1. Starting Vite preview server...');
  const server = await createServer({
    server: { port: 5179 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const port = address.port;
  console.log(`Vite listening on port ${port}`);

  console.log('2. Launching Edge headless...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  try {
    // 1. Visitar storefront
    console.log('3. Loading storefront...');
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_01_storefront.png') });

    // 2. Hacer scroll hacia abajo para simular usuario navegando catálogo
    console.log('4. Scrolling down in storefront...');
    await page.evaluate(() => window.scrollTo(0, 1500));
    const scrollBefore = await page.evaluate(() => window.scrollY);
    console.log(`Scroll Y before clicking: ${scrollBefore}px`);

    // 3. Clic en "Personalizar" para verificar apertura del ProductSelectorModal
    console.log('5. Clicking Personalizar...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => 
        b.textContent.includes('Configurador') || b.textContent.includes('Personalizar Ahora')
      );
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_02_product_selector_modal.png') });

    // Verificar que el modal de selección de productos está abierto
    const modalVisible = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      return modal && modal.textContent.includes('Selecciona la Prenda a Personalizar');
    });
    console.log(`ProductSelectorModal visible: ${modalVisible}`);

    // 4. Seleccionar "Playera Fútbol F3W Dama Entallada"
    console.log('6. Selecting Playera Fútbol F3W Dama...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cardBtn = buttons.find((b) => b.closest('.group') && b.closest('.group').textContent.includes('F3W Dama'));
      if (cardBtn) cardBtn.click();
      else {
        // Fallback: any card button
        const anyCard = buttons.find((b) => b.textContent.includes('Personalizar en 3D & 2D') || b.textContent.includes('Continuar Editando'));
        if (anyCard) anyCard.click();
      }
    });
    await new Promise((r) => setTimeout(r, 2500));

    // Verificar que el scroll ahora es 0 (arriba del todo, sin saltar al carrito)
    const scrollAfter = await page.evaluate(() => window.scrollY);
    console.log(`Scroll Y after entering studio: ${scrollAfter}px (Target: 0px)`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_03_studio_top_view.png') });

    // 5. Verificar que el Canvas 3D está presente y renderizando
    console.log('7. Checking 3D Canvas rendering...');
    const canvasInfo = await page.evaluate(() => {
      const cvs = document.querySelector('canvas');
      if (!cvs) return null;
      return { width: cvs.width, height: cvs.height };
    });
    console.log('3D Canvas Info:', canvasInfo);

    // 6. Probar Conmutador Dual: Cambiar a "Plantilla 2D"
    console.log('8. Switching to Plantilla 2D view...');
    await page.evaluate(() => {
      const btn2d = document.getElementById('toggle-stage-2d');
      if (btn2d) btn2d.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_04_plantilla_2d_view.png') });

    const is2DActive = await page.evaluate(() => {
      return Boolean(document.querySelector('#PIECE_FRENTE') || document.querySelector('#PIECE_TRASERO'));
    });
    console.log(`Plantilla 2D active and pieces found in SVG: ${is2DActive}`);

    // 7. Probar pestaña de Logos y Parches Oficiales
    console.log('9. Checking Sleeve Badges in Logo Tab...');
    await page.evaluate(() => {
      const logoTab = document.getElementById('tab-pill-logo');
      if (logoTab) logoTab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_05_logo_tab_with_badges.png') });

    // 8. Abrir Modal de Mockups para Redes Sociales
    console.log('10. Opening Social Media Mockup Modal...');
    await page.evaluate(() => {
      const mockupBtn = Array.from(document.querySelectorAll('button')).find((b) => 
        b.textContent.includes('Mockup / Redes')
      );
      if (mockupBtn) mockupBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_06_social_media_mockup_modal.png') });

    console.log('--- TEST SUMMARY ---');
    console.log(`Scroll reset to top: ${scrollAfter === 0 ? 'PASSED ✅' : 'FAILED ❌'}`);
    console.log(`ProductSelectorModal: ${modalVisible ? 'PASSED ✅' : 'FAILED ❌'}`);
    console.log(`Plantilla 2D Live Stage: ${is2DActive ? 'PASSED ✅' : 'FAILED ❌'}`);
    console.log(`Console Errors count: ${errors.length}`);
    if (errors.length > 0) {
      console.log('Errors:', errors);
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

testUserExperience().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
