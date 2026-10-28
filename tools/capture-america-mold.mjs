import { spawn } from 'child_process';
import fs from 'fs';

async function captureAmericaMoldView() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9457',
    '--window-size=1500,1000',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/#studio'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch('http://127.0.0.1:9457/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!tab) return;
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
    await new Promise(r => setTimeout(r, 2000));

    // Open Mexico kits modal and select America
    console.log('Selecting America kit...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const btnKits = document.getElementById('btn-open-mexico-kits');
          if (btnKits) btnKits.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1000));

    // Click on America kit in modal
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const btnCard = document.getElementById('btn-kit-mx_america_home');
          if (btnCard) {
            btnCard.click();
            return 'clicked America kit';
          }
          return 'btnCard not found';
        })()
      `,
      returnByValue: true
    });

    await new Promise(r => setTimeout(r, 1500));

    // Open production mold modal
    console.log('Opening production mold modal...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const btnMold = document.getElementById('btn-open-production-mold');
          if (btnMold) btnMold.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 2000));

    const shotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
    if (shotRes?.data) {
      const buf = Buffer.from(shotRes.data, 'base64');
      const outPath = 'C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\preview_molde_produccion_2d_america.png';
      fs.writeFileSync(outPath, buf);
      console.log('America 2D production mold screenshot saved! Size:', buf.length);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    edge.kill();
  }
}

captureAmericaMoldView();
