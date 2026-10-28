import { spawn } from 'child_process';
import fs from 'fs';

async function testModal() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9459',
    '--window-size=1440,900',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9459/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!tab) {
      console.log('No tab found');
      edge.kill();
      return;
    }
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let msgId = 1;
    function send(method, params = {}) {
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

    await send('Page.enable');
    await send('Runtime.enable');
    await new Promise(r => setTimeout(r, 1500));

    // Click on 'Plantilla' button
    const clickRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const btn = btns.find(b => b.textContent.includes("Plantilla") || b.textContent.includes("Molde"));
        if (btn) { btn.click(); return "clicked: " + btn.textContent.trim(); }
        return "not found";
      })()`
    });
    console.log('Button click result:', clickRes);

    await new Promise(r => setTimeout(r, 2000));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('tools/modal-test-screenshot.png', Buffer.from(shot.data, 'base64'));
    console.log('Screenshot saved to tools/modal-test-screenshot.png');

    // Also evaluate the modal DOM structure
    const domEval = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector(".fixed.inset-0");
        if (!modal) return "modal not open";
        const svg = modal.querySelector("svg");
        if (!svg) return "no svg found in modal";
        const rect = svg.getBoundingClientRect();
        const viewBox = svg.getAttribute("viewBox");
        const gElements = Array.from(svg.querySelectorAll("g[id]")).map(g => g.id);
        return {
          viewBox,
          svgWidth: rect.width,
          svgHeight: rect.height,
          gElements
        };
      })()`,
      returnByValue: true
    });
    console.log('DOM Eval:', domEval);

    ws.close();
  } finally {
    edge.kill();
  }
}

testModal();
