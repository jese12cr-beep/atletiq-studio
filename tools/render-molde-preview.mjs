import { spawn } from 'child_process';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\scratch\\edge_temp_molde';
const outDir = 'C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632';

// Create a simple HTML page that displays the SVG
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .wrapper { background: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border-radius: 8px; padding: 20px; }
    svg { width: 1400px; height: auto; display: block; border: 1px solid #cbd5e1; }
  </style>
</head>
<body>
  <div class="wrapper">
    ${fs.readFileSync('C:\\Users\\crja_\\Downloads\\MOLDE CAMISA.svg', 'utf8')}
  </div>
</body>
</html>`;

fs.writeFileSync('C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\scratch\\view_molde.html', htmlContent);

const edgeProc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9238',
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--disable-gpu',
  '--window-size=1600,1600',
  'file:///C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/scratch/view_molde.html'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const tabsRes = await fetch('http://127.0.0.1:9238/json');
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
  await new Promise(r => setTimeout(r, 1000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}\\preview_molde_camisa_original.png`, Buffer.from(shot.data, 'base64'));
  console.log('Saved preview_molde_camisa_original.png');
  ws.close();
} catch (err) {
  console.error('Error:', err);
} finally {
  edgeProc.kill();
}
