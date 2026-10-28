import { spawn } from 'child_process';
import fs from 'fs';

async function capture() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9345',
    '--window-size=1400,900',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9345/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!tab) return;
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
    await new Promise(r => setTimeout(r, 3500));

    const shot = await new Promise((resolve) => {
      const handler = (evt) => {
        const d = JSON.parse(evt.data);
        if (d.id === 10) {
          ws.removeEventListener('message', handler);
          resolve(d.result?.data);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({
        id: 10,
        method: 'Page.captureScreenshot',
        params: { format: 'png' }
      }));
    });

    if (shot) {
      const buf = Buffer.from(shot, 'base64');
      fs.writeFileSync('C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\studio_screenshot.png', buf);
      console.log('Screenshot saved! Size:', buf.length);
    }
  } finally {
    edge.kill();
  }
}

capture().catch(console.error);
