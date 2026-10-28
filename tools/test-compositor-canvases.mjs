import { spawn } from 'child_process';
import fs from 'fs';

async function testCanvasCompositor() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9460',
    '--window-size=1200,800',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:5173/#studio'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9460/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('5173'));
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

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');
    await new Promise(r => setTimeout(r, 2500));

    // Select America kit in studio
    console.log('Selecting America kit in studio...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const btnKits = document.getElementById('btn-open-mexico-kits');
          if (btnKits) btnKits.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const btnCard = document.getElementById('btn-kit-mx_america_home');
          if (btnCard) btnCard.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // Now test composeGarmentPartCanvas for Front, Back, LeftArm, RightArm
    console.log('Evaluating canvas compositor in browser context...');
    const evalRes = await sendCommand('Runtime.evaluate', {
      expression: `
        (async () => {
          // Find window or module or render directly
          // Let's inspect what's available in window
          const canvases = Array.from(document.querySelectorAll('canvas'));
          return {
            canvasCount: canvases.length,
            canvasSizes: canvases.map(c => ({ w: c.width, h: c.height, className: c.className }))
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Canvases in page:', evalRes?.result?.value);
  } finally {
    edge.kill();
  }
}

testCanvasCompositor();
