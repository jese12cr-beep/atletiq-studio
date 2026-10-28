import { spawn } from 'child_process';

async function testTextureChange() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9341',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9341/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!tab) return;
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log(`[BROWSER ${data.params.type}]`, data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
      } else if (data.id && data.result) {
        console.log(`[EVAL ${data.id}]`, JSON.stringify(data.result.result?.value));
      }
    };

    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    await new Promise(r => setTimeout(r, 3000));

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

    // Check what React components are mounted and what design is
    const checkState = await evalCode(10, `(() => {
      const activePill = document.querySelector('button[class*="bg-amber-400"]')?.innerText.trim();
      return { activePill };
    })()`);
    console.log('Current state:', checkState);

    // Let's inspect the 3D scene meshes and their materials
    const sceneCheck = await evalCode(15, `(() => {
      // Find the Three.js canvas
      const canvas = document.querySelector('canvas');
      return {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      };
    })()`);
    console.log('Canvas info:', sceneCheck);

    // Click on "Colores" tab, then select a different color (e.g. Red or Green or Yellow)
    console.log('--- Switching to Colores tab ---');
    await evalCode(20, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const colTab = btns.find(b => b.innerText.trim() === 'Colores');
      if (colTab) colTab.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // Inspect active color zone
    const zoneInfo = await evalCode(22, `(() => {
      const zoneBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Zona'));
      return zoneBtns.map(b => b.innerText.trim());
    })()`);
    console.log('Zones:', zoneInfo);

    // Click on a red color swatch
    console.log('--- Clicking Red color swatch ---');
    const clickRed = await evalCode(25, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const redBtn = btns.find(b => b.title && b.title.includes('Rojo') || b.title && b.title.includes('Red'));
      if (redBtn) {
        redBtn.click();
        return 'Clicked ' + redBtn.title;
      }
      return 'Red not found. Available: ' + btns.map(b => b.title).filter(Boolean).slice(0, 5).join(', ');
    })()`);
    console.log('Click red result:', clickRed);
    await new Promise(r => setTimeout(r, 2000));

    // Sample pixel from WebGL canvas to see if color changed!
    const sampleAfterRed = await evalCode(28, `(() => {
      const c = document.querySelector('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      const p = new Uint8Array(4);
      gl.readPixels(c.width / 2, c.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p);
      return Array.from(p);
    })()`);
    console.log('Sample after Red:', sampleAfterRed);

  } finally {
    edge.kill();
  }
}

testTextureChange().catch(console.error);
