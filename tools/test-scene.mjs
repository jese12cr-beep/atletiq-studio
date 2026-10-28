import { spawn } from 'child_process';

async function testScene() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9343',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9343/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!tab) return;
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const str = data.params.args.map(a => {
          if (a.type === 'object' && a.preview) {
            return JSON.stringify(a.preview.properties);
          }
          return a.value || a.description || JSON.stringify(a);
        }).join(' ');
        console.log(`[CONSOLE ${data.params.type}]`, str);
      } else if (data.id && data.result) {
        console.log(`[EVAL ${data.id}]`, JSON.stringify(data.result.result?.value, null, 2));
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

    // Inspect window.__OWAYO_SCENE_STATE__
    const stateInfo = await evalCode(10, `(() => {
      const st = window.__OWAYO_SCENE_STATE__;
      if (!st) return { error: 'No __OWAYO_SCENE_STATE__' };

      const frontCanvas = st.partCanvases['Front'];
      const frontTex = st.partTextures['Front'];
      const frontMat = st.partMaterials['Front'];

      let frontCanvasCenterPixel = null;
      if (frontCanvas) {
        const ctx = frontCanvas.getContext('2d');
        const img = ctx.getImageData(frontCanvas.width / 2, frontCanvas.height / 2, 1, 1).data;
        frontCanvasCenterPixel = Array.from(img);
      }

      // Check meshes in jerseyContainer
      const meshes = [];
      st.jerseyContainer.traverse(obj => {
        if (obj.isMesh) {
          meshes.push({
            name: obj.name,
            materialMap: Boolean(obj.material?.map),
            materialSameAsPartMaterial: obj.material === frontMat,
            visible: obj.visible,
          });
        }
      });

      return {
        frontCanvasSize: frontCanvas ? { w: frontCanvas.width, h: frontCanvas.height } : null,
        frontCanvasCenterPixel,
        frontTexVersion: frontTex?.version,
        meshes
      };
    })()`);

    console.log('--- Initial State ---', stateInfo);

    // Click Red
    await evalCode(20, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const colTab = btns.find(b => b.innerText.trim() === 'Colores');
      if (colTab) colTab.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    await evalCode(25, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const redBtn = btns.find(b => b.title && (b.title.includes('Rojo 4') || b.title.includes('Red') || b.title.includes('#c8102e') || b.title.includes('#dc2626')));
      if (redBtn) redBtn.click();
      return redBtn ? 'Clicked ' + redBtn.title : 'Not found';
    })()`);
    await new Promise(r => setTimeout(r, 2000));

    // Inspect state again after clicking red!
    const afterRedState = await evalCode(30, `(() => {
      const st = window.__OWAYO_SCENE_STATE__;
      if (!st) return null;
      const frontCanvas = st.partCanvases['Front'];
      const frontTex = st.partTextures['Front'];
      const ctx = frontCanvas.getContext('2d');
      const img = ctx.getImageData(frontCanvas.width / 2, frontCanvas.height / 2, 1, 1).data;
      return {
        frontCanvasCenterPixel: Array.from(img),
        frontTexVersion: frontTex?.version
      };
    })()`);
    console.log('--- After Red State ---', afterRedState);

  } finally {
    edge.kill();
  }
}

testScene().catch(console.error);
