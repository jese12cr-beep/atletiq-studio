import { spawn } from 'child_process';

async function inspectThree() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9342',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9342/json/list');
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

    // Inspect the internal Three scene
    const sceneInfo = await evalCode(10, `(() => {
      // Find the WebGL renderer on window or through DOM
      const dom = document.querySelector('.garment-3d-stage');
      // In React Fiber, we can inspect props/state of the component!
      const fiberKey = Object.keys(dom || {}).find(k => k.startsWith('__reactFiber$'));
      let fiber = dom ? dom[fiberKey] : null;
      let garmentCanvasState = null;
      while (fiber) {
        if (fiber.memoizedState && fiber.memoizedState.current) {
          if (fiber.memoizedState.current.scene) {
            garmentCanvasState = fiber.memoizedState.current;
            break;
          }
        }
        fiber = fiber.return;
      }
      if (!garmentCanvasState) {
        // Search through children fibers
        const search = (f) => {
          if (!f) return null;
          if (f.memoizedState && f.memoizedState.current && f.memoizedState.current.scene) return f.memoizedState.current;
          return search(f.child) || search(f.sibling);
        };
        garmentCanvasState = search(dom[fiberKey]);
      }

      if (!garmentCanvasState) return { found: false };

      const st = garmentCanvasState;
      const meshes = [];
      st.jerseyContainer.traverse(obj => {
        if (obj.isMesh) {
          meshes.push({
            name: obj.name,
            materialName: obj.material?.name,
            hasMap: Boolean(obj.material?.map),
            mapNeedsUpdate: obj.material?.map?.needsUpdate,
            mapImageWidth: obj.material?.map?.image?.width,
            mapImageHeight: obj.material?.map?.image?.height,
            userData: obj.userData
          });
        }
      });

      // Sample pixels from st.partCanvases.Front
      const frontCanvas = st.partCanvases['Front'];
      let frontPixels = null;
      if (frontCanvas) {
        const fCtx = frontCanvas.getContext('2d');
        const img = fCtx.getImageData(frontCanvas.width / 2, frontCanvas.height / 2, 2, 2).data;
        frontPixels = Array.from(img);
      }

      return {
        found: true,
        meshes,
        frontCanvasSize: frontCanvas ? { w: frontCanvas.width, h: frontCanvas.height } : null,
        frontCanvasSamplePixels: frontPixels
      };
    })()`);

    console.log('Scene info:', sceneInfo);

  } finally {
    edge.kill();
  }
}

inspectThree().catch(console.error);
