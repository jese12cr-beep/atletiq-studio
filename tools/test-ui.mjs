import { spawn } from 'child_process';

async function test() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9336',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9336/json/list');
    const tabs = await listRes.json();
    const atletiqTab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!atletiqTab) return;
    const ws = new WebSocket(atletiqTab.webSocketDebuggerUrl);

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', data.params.type, data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
      } else if (data.method === 'Runtime.exceptionThrown') {
        console.log('[BROWSER EXCEPTION]', JSON.stringify(data.params.exceptionDetails));
      } else if (data.id && data.result) {
        console.log('[EVAL ' + data.id + ']', JSON.stringify(data.result));
      }
    };

    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));

    await new Promise(r => setTimeout(r, 3000));

    // Test fetch legend.fish
    ws.send(JSON.stringify({
      id: 10,
      method: 'Runtime.evaluate',
      params: {
        expression: `(async () => {
          try {
            const resp = await fetch('/designs/basketball_b6_hero/legend.fish');
            const ab = await resp.arrayBuffer();
            return { ok: resp.ok, status: resp.status, byteLength: ab.byteLength };
          } catch (e) {
            return { error: e.message };
          }
        })()`,
        awaitPromise: true,
        returnByValue: true
      }
    }));

    await new Promise(r => setTimeout(r, 2000));

    // Click on "Colores" tab, then click a color!
    ws.send(JSON.stringify({
      id: 20,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const colTab = btns.find(b => b.innerText.trim() === 'Colores');
          if (colTab) {
            colTab.click();
            return 'Clicked Colores tab';
          }
          return 'Colores tab not found';
        })()`,
        returnByValue: true
      }
    }));

    await new Promise(r => setTimeout(r, 2000));

    // Now inspect visible color buttons
    ws.send(JSON.stringify({
      id: 30,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          return btns.map(b => ({ text: b.innerText.trim(), title: b.getAttribute('title') })).filter(b => b.title || b.text).slice(0, 25);
        })()`,
        returnByValue: true
      }
    }));

    await new Promise(r => setTimeout(r, 2000));

  } finally {
    edge.kill();
  }
}

test().catch(console.error);
