const { createApp } = require('../server');
const { mkdtempSync, rmSync } = require('node:fs');
const { resolve, join, sep, basename } = require('node:path');
const { tmpdir } = require('node:os');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');

async function fixture(t, options = {}) {
  const directory = mkdtempSync(join(tmpdir(),'green-report-test-'));
  const database = join(directory,'reports.sqlite');
  const app = createApp({ database, ...options, climateOptions: { cacheDir: join(directory, 'climate'), ...options.climateOptions } });
  app.server.listen(0,'127.0.0.1'); await once(app.server,'listening');
  const base = `http://127.0.0.1:${app.server.address().port}`;
  t.after(async()=> {
    if (app.server.listening) await new Promise(resolve=>app.server.close(resolve));
    const target = resolve(directory);
    if (!target.startsWith(resolve(tmpdir()) + sep) || !basename(target).startsWith('green-report-test-')) throw new Error('Unsafe test cleanup path');
    rmSync(target,{recursive:true,force:true});
  });
  function client() {
    let cookie = '';
    return {
      get cookie() { return cookie; },
      async request(path, method = 'GET', payload, headers = {}) {
        const response = await fetch(base+path,{ method, headers:{cookie,...(method==='GET'?{}:{'Content-Type':'application/json','X-Green-Request':'1'}),...headers},body:payload===undefined?undefined:JSON.stringify(payload) });
        const next = response.headers.get('set-cookie'); if(next) cookie=next.split(';')[0];
        const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : Buffer.from(await response.arrayBuffer());
        return {status:response.status,data,headers:response.headers};
      },
      async register(username) { return this.request('/api/register','POST',{username,password:'Test-password-12345'}); }
    };
  }
  return { ...app,base,database,client };
}
const report = (overrides = {}) => ({requestId:randomUUID(),title:'Water leak near the garden',description:'A public garden tap is leaking continuously.',category:'water',area:'knowledge-university',location:'Public campus garden entrance',...overrides});
const png = {mime:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aMegAAAAASUVORK5CYII='};
module.exports = {fixture,report,png};
