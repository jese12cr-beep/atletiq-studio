import { spawn } from 'child_process';
import fs from 'fs';

async function captureOriginalMolde() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9459',
    '--window-size=1400,1350',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/assets/patterns/molde_camisa_talla_m.svg'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9459/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('5173'));
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
    await new Promise(r => setTimeout(r, 1500));
    const shotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
    if (shotRes?.data) {
      const buf = Buffer.from(shotRes.data, 'base64');
      fs.writeFileSync('C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\original_molde_raw.png', buf);
      console.log('Original molde screenshot saved! Size:', buf.length);
    }
  } finally {
    edge.kill();
  }
}

captureOriginalMolde();
