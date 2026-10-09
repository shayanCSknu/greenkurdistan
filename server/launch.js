const { spawn } = require('node:child_process');
const { mkdirSync, openSync, closeSync } = require('node:fs');
const { resolve } = require('node:path');

async function launch() {
  const port = Number(process.env.PORT || 3000);
  const url = `http://127.0.0.1:${port}/api/health`;
  const healthy = async () => {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      const result = await response.json();
      return response.ok && result.ok && result.app === 'green-kurdistan';
    } catch { return false; }
  };
  if (await healthy()) return;
  const root = resolve(__dirname, '..');
  mkdirSync(resolve(root, '.cache'), { recursive: true });
  const log = openSync(resolve(root, '.cache/server.log'), 'a');
  const child = spawn(process.execPath, [resolve(__dirname, 'index.js')], {
    cwd: root, detached: true, windowsHide: true, stdio: ['ignore', log, log]
  });
  closeSync(log);
  let spawnError;
  child.on('error', error => { spawnError = error; });
  child.unref();
  for (let attempt = 0; attempt < 30; attempt++) {
    if (spawnError) throw spawnError;
    if (await healthy()) return;
    await new Promise(done => setTimeout(done, 200));
  }
  throw new Error('The website server did not start. Check .cache/server.log; another application may be using the port.');
}
if (require.main === module) launch().then(() => console.log(`Website ready: http://localhost:${process.env.PORT || 3000}/`)).catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { launch };
