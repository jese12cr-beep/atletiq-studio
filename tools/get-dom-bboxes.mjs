import { spawn } from 'child_process';

async function getDomBBoxes() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9462',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/assets/patterns/molde_camisa_talla_m.svg'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9462/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('molde_camisa_talla_m.svg'));
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

    await sendCommand('Runtime.enable');
    const res = await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const designGroup = document.getElementById('DESIGN');
          if (!designGroup) return 'No DESIGN group';
          const paths = Array.from(designGroup.querySelectorAll('path'));
          return paths.map((p, idx) => {
            const b = p.getBBox();
            return {
              idx,
              dStart: p.getAttribute('d').slice(0, 40),
              x: Math.round(b.x * 100) / 100,
              y: Math.round(b.y * 100) / 100,
              width: Math.round(b.width * 100) / 100,
              height: Math.round(b.height * 100) / 100,
              centerX: Math.round((b.x + b.width / 2) * 100) / 100,
              centerY: Math.round((b.y + b.height / 2) * 100) / 100,
            };
          });
        })()
      `,
      returnByValue: true
    });
    console.log('DOM Exact BBoxes:', JSON.stringify(res?.result?.value, null, 2));
  } finally {
    edge.kill();
  }
}

getDomBBoxes();
