import puppeteer from 'puppeteer-core';

async function check() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173/#studio', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Check button exists
  const btn = await page.$('#btn-open-production-mold');
  console.log('Button exists?', !!btn);

  // Close dialogs
  await page.evaluate(() => {
    document.querySelectorAll('dialog').forEach(d => {
      d.close?.();
      d.removeAttribute('open');
    });
  });
  await new Promise(r => setTimeout(r, 500));

  console.log('Clicking button...');
  await page.click('#btn-open-production-mold');
  await new Promise(r => setTimeout(r, 2000));

  const domCheck = await page.evaluate(() => {
    const allSvgs = Array.from(document.querySelectorAll('svg')).map(s => ({
      viewBox: s.getAttribute('viewBox'),
      w: s.clientWidth,
      h: s.clientHeight,
      parent: s.parentElement?.className
    }));
    const fixedModal = document.querySelector('.fixed.inset-0.z-50');
    return {
      hasFixedModal: !!fixedModal,
      modalHtmlSnippet: fixedModal ? fixedModal.outerHTML.slice(0, 300) : null,
      allSvgs
    };
  });
  console.log('DOM check:', JSON.stringify(domCheck, null, 2));

  await browser.close();
}

check().catch(console.error);
