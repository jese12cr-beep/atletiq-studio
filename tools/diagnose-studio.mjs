import { spawn } from 'child_process';

async function diagnoseAll() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9339',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9339/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!tab) return;
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log(`[CONSOLE ${data.params.type}]`, data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
      } else if (data.method === 'Runtime.exceptionThrown') {
        console.error(`[EXCEPTION]`, data.params.exceptionDetails?.exception?.description || JSON.stringify(data.params.exceptionDetails));
      } else if (data.id && data.result) {
        console.log(`[EVAL ${data.id}]`, JSON.stringify(data.result.result?.value));
      }
    };

    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    await new Promise(r => setTimeout(r, 2500));

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

    // Test A: On active model (B6 Hero), click pattern "Screen"
    console.log('--- Test A: Click Screen on B6 ---');
    const resA = await evalCode(10, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Screen'));
      if (btn) { btn.click(); return 'Clicked Screen'; }
      return 'Screen not found';
    })()`);
    console.log('Res A:', resA);
    await new Promise(r => setTimeout(r, 2000));

    // Test B: Switch to J5 Softshell
    console.log('--- Test B: Switch to J5 Softshell ---');
    const resB = await evalCode(20, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('J5 Softshell'));
      if (btn) { btn.click(); return 'Clicked J5 Softshell'; }
      return 'J5 Softshell not found';
    })()`);
    console.log('Res B:', resB);
    await new Promise(r => setTimeout(r, 3000));

    // Test C: On J5 Softshell, inspect available pattern buttons
    console.log('--- Test C: Check patterns on J5 Softshell ---');
    const resC = await evalCode(30, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const patterns = btns.filter(b => b.innerText.includes('Z')).map(b => b.innerText.trim());
      return { patternCount: patterns.length, patterns };
    })()`);
    console.log('Res C:', resC);

    // Test D: Click pattern "Velo" on J5 Softshell
    console.log('--- Test D: Click Velo on J5 Softshell ---');
    const resD = await evalCode(40, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Velo'));
      if (btn) { btn.click(); return 'Clicked Velo'; }
      return 'Velo not found';
    })()`);
    console.log('Res D:', resD);
    await new Promise(r => setTimeout(r, 2000));

    // Test E: Switch to Women module
    console.log('--- Test E: Switch to Women Module ---');
    const resE = await evalCode(50, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Dama'));
      if (btn) { btn.click(); return 'Clicked Dama'; }
      return 'Dama not found';
    })()`);
    console.log('Res E:', resE);
    await new Promise(r => setTimeout(r, 3000));

    // Test F: On Women module, inspect active garment
    console.log('--- Test F: Check Women active garment ---');
    const resF = await evalCode(60, `(() => {
      const activePills = Array.from(document.querySelectorAll('button[class*="bg-amber-400"]')).map(b => b.innerText.trim());
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Z')).map(b => b.innerText.trim());
      return { activePills, patternButtons: btns };
    })()`);
    console.log('Res F:', resF);

    // Test G: Click a pattern in Women module
    console.log('--- Test G: Click pattern on Women garment ---');
    const resG = await evalCode(70, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const patBtn = btns.find(b => b.innerText.includes('Z') && !b.innerText.includes('Pure'));
      if (patBtn) { patBtn.click(); return 'Clicked ' + patBtn.innerText; }
      return 'No pattern button found';
    })()`);
    console.log('Res G:', resG);
    await new Promise(r => setTimeout(r, 2000));

    // Test H: Switch to Molde 2D Real
    console.log('--- Test H: Switch to Molde 2D Real ---');
    const resH = await evalCode(80, `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Molde 2D'));
      if (btn) { btn.click(); return 'Clicked Molde 2D'; }
      return 'Molde 2D not found';
    })()`);
    console.log('Res H:', resH);
    await new Promise(r => setTimeout(r, 2500));

    // Check if 2D canvas is rendering without error
    const resH2 = await evalCode(85, `(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      return { canvasCount: canvases.length, sizes: canvases.map(c => ({ w: c.width, h: c.height })) };
    })()`);
    console.log('Res H2 (2D canvases):', resH2);

  } finally {
    edge.kill();
  }
}

diagnoseAll().catch(console.error);
