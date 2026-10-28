import { spawn } from 'child_process';

async function testKeys() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9344',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9344/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!tab) return;
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id && data.result) {
        console.log(`[EVAL ${data.id}]`, JSON.stringify(data.result.result?.value, null, 2));
      }
    };

    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    await new Promise(r => setTimeout(r, 3500));

    const evalCode = (id, expr) => {
      return new Promise((resolve) => {
        const handler = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === id) {
            ws.removeEventListener('message', handler);
            resolve(d.result?.result?.value);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({
          id,
          method: 'Runtime.evaluate',
          params: { expression: expr, returnByValue: true, awaitPromise: true }
        }));
      });
    };

    const res = await evalCode(10, `(() => {
      const st = window.__OWAYO_SCENE_STATE__;
      // Let's inspect the canvas pixels at 4 corners and center
      const fc = st?.partCanvases['Front'];
      if (!fc) return 'No front canvas';
      const ctx = fc.getContext('2d');
      const getP = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data);
      return {
        fcW: fc.width,
        fcH: fc.height,
        cornerTL: getP(10, 10),
        cornerTR: getP(fc.width - 10, 10),
        center: getP(fc.width / 2, fc.height / 2),
        chest: getP(fc.width / 2, fc.height * 0.35),
        bottom: getP(fc.width / 2, fc.height * 0.8),
      };
    })()`);

    console.log('Front canvas pixel samples:', res);

  } finally {
    edge.kill();
  }
}

testKeys().catch(console.error);
