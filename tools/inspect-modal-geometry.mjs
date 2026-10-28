import { spawn } from 'child_process';
import fs from 'fs';

async function inspectModalDom() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9461',
    '--window-size=1500,1000',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/#studio'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9461/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!tab) return;
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

    // Open mold modal
    await send('Runtime.evaluate', {
      expression: 'document.getElementById("btn-open-production-mold")?.click()'
    });
    await new Promise(r => setTimeout(r, 1500));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const svg = document.querySelector(".fixed.inset-0 svg");
        if (!svg) return "no svg";
        const cRect = svg.parentElement.getBoundingClientRect();
        const sRect = svg.getBoundingClientRect();
        const pieces = Array.from(svg.querySelectorAll("g[id]")).map(g => {
          const r = g.getBoundingClientRect();
          return { id: g.id, top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), width: Math.round(r.width) };
        });
        const modalContainer = document.querySelector(".fixed.inset-0 .flex-1");
        return {
          viewportHeight: window.innerHeight,
          viewportWidth: window.innerWidth,
          scrollContainer: modalContainer ? {
            scrollTop: modalContainer.scrollTop,
            scrollHeight: modalContainer.scrollHeight,
            clientHeight: modalContainer.clientHeight
          } : null,
          svg: {
            top: Math.round(sRect.top),
            bottom: Math.round(sRect.bottom),
            width: Math.round(sRect.width),
            height: Math.round(sRect.height),
            viewBox: svg.getAttribute("viewBox")
          },
          pieces
        };
      })()`,
      returnByValue: true
    });
    console.log('DOM Evaluation:');
    console.log(JSON.stringify(evalRes.result.value, null, 2));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\current_modal_state.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to current_modal_state.png');

    ws.close();
  } finally {
    edge.kill();
  }
}

inspectModalDom();
