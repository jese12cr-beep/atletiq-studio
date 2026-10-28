import { spawn } from 'child_process';
import fs from 'fs';

async function captureKitsPreviews() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9458',
    '--window-size=1500,1000',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/#studio'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch('http://127.0.0.1:9458/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!tab) {
      console.error('Could not find localhost:5173 tab');
      return;
    }
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let msgId = 1;
    function sendCommand(method, params = {}) {
      const id = ++msgId;
      return new Promise((resolve) => {
        const handler = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === id) {
            ws.removeEventListener('message', handler);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');
    console.log('Studio page loaded, waiting 3s for 3D engine...');
    await new Promise(r => setTimeout(r, 3000));

    // Open Garment Menu
    console.log('Opening Cambiar producto...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const changeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cambiar producto'));
          if (changeBtn) changeBtn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 800));

    // Click tab Liga MX
    console.log('Clicking Liga MX tab...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const tabs = Array.from(document.querySelectorAll('button'));
          const mxTab = tabs.find(b => b.textContent.includes('Liga MX'));
          if (mxTab) mxTab.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1000));

    // Click "Cargar en 3D" for Club America
    console.log('Clicking Cargar en 3D for America...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const loadBtn = buttons.find(b => b.textContent.includes('Cargar en 3D'));
          if (loadBtn) loadBtn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 2000));

    // Open Plantilla Modal
    console.log('Opening Plantilla Modal for America...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btn-open-production-mold');
          if (btn) btn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 2000));

    const shotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
    if (shotRes?.data) {
      const buf = Buffer.from(shotRes.data, 'base64');
      const outPath = 'C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\preview_molde_america_2d.png';
      fs.writeFileSync(outPath, buf);
      console.log('America 2D modal screenshot saved! Size:', buf.length);
    }

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    edge.kill();
  }
}

captureKitsPreviews();
