import { spawn } from 'child_process';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\scratch\\edge_temp_mold_shot';
const outDir = 'C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632';

const edgeProc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9239',
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--disable-gpu',
  '--window-size=1920,1200',
  'http://127.0.0.1:5173/assets/patterns/molde_aplanado_america_sample.svg'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const tabsRes = await fetch('http://127.0.0.1:9239/json');
  const tabs = await tabsRes.json();
  const pageTab = tabs[0];
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise(res => {
      const id = msgId++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          res(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 1500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}\\preview_molde_aplanado_america.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved preview_molde_aplanado_america.png');
  ws.close();
} catch (err) {
  console.error('Error:', err);
} finally {
  edgeProc.kill();
}
