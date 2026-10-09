const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { fixture,report,png } = require('./report-helpers');
const { createApp } = require('../server');

test('accounts use password hashes, protected cookies, independent sessions and logout',async t=> {
  const app=await fixture(t), alice=app.client(), stranger=app.client();
  const registration=await alice.register('alice');
  assert.equal(registration.status,201); assert.equal(registration.data.user.role,'member');
  assert.match(registration.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
  const stored=app.db.prepare('SELECT password FROM users').get().password;
  assert.notEqual(stored,'Test-password-12345'); assert.match(stored,/^[a-f0-9]{32}:[a-f0-9]{128}$/);
  assert.equal((await stranger.request('/api/session')).data.user,null);
  assert.equal((await alice.request('/api/session')).data.user.username,'alice');
  assert.equal((await stranger.request('/api/login','POST',{username:'alice',password:'wrong'})).status,401);
  assert.equal((await stranger.register('ALICE')).status,409);
  await alice.request('/api/logout','POST',{});
  assert.equal((await alice.request('/api/session')).data.user,null);
  assert.equal((await stranger.request('/api/login','POST',{username:'alice',password:'Test-password-12345'})).status,200);
});

test('full report lifecycle works across users, with photos, assignment, history and public statistics',async t=> {
  const app=await fixture(t), owner=app.client(), other=app.client(), admin=app.client(), guest=app.client();
  await owner.register('reporter'); await other.register('another'); await admin.register('coordinator');
  app.db.prepare("UPDATE users SET role='admin' WHERE username='coordinator'").run();
  const submission=report({photo:png,latitude:36.19,longitude:44.01});
  const created=await owner.request('/api/reports','POST',submission); assert.equal(created.status,201);
  const id=created.data.report.id;
  assert.equal(created.data.report.status,'submitted'); assert.equal(created.data.report.user_id,undefined);
  assert.equal((await guest.request('/api/reports')).data.total,0);
  assert.equal((await other.request(`/api/reports/${id}`)).status,404);
  assert.equal((await other.request(`/api/reports/${id}/photos/before`)).status,404);
  assert.equal((await owner.request('/api/reports?scope=mine')).data.total,1);
  assert.equal((await admin.request('/api/reports?scope=admin&status=submitted')).data.total,1);
  assert.equal((await admin.request('/api/stats')).data.pending,1);
  assert.equal((await owner.request('/api/reports','POST',submission)).data.report.id,id);
  assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM reports').get().n,1);
  assert.equal((await owner.request(`/api/reports/${id}`,'PATCH',{version:1,status:'reviewed',note:'Reviewed by student.'})).status,403);
  assert.equal((await admin.request(`/api/reports/${id}`,'PATCH',{version:1,status:'resolved',note:'Skip the workflow.'})).status,400);
  let result=await admin.request(`/api/reports/${id}`,'PATCH',{version:1,status:'reviewed',team:'Campus maintenance',note:'Location confirmed and accepted for review.'});
  assert.equal(result.status,200); assert.equal(result.data.report.version,2);
  assert.equal((await guest.request('/api/reports')).data.total,1);
  const publicPhoto=await guest.request(`/api/reports/${id}/photos/before`);
  assert.equal(publicPhoto.status,200); assert.equal(publicPhoto.headers.get('content-type'),'image/png');
  assert.deepEqual(publicPhoto.data,Buffer.from(png.data,'base64')); assert.equal(publicPhoto.headers.get('cache-control'),'no-store');
  assert.equal((await admin.request(`/api/reports/${id}`,'PATCH',{version:1,status:'in_progress',note:'Outdated version should fail.'})).status,409);
  result=await admin.request(`/api/reports/${id}`,'PATCH',{version:2,status:'in_progress',team:'Campus maintenance',note:'Repair work has started.'}); assert.equal(result.status,200);
  result=await admin.request(`/api/reports/${id}`,'PATCH',{version:3,status:'resolved',team:'Campus maintenance',note:'Tap replaced and the leak stopped.',photo:png}); assert.equal(result.status,200);
  const detail=(await owner.request(`/api/reports/${id}`)).data.report;
  assert.equal(detail.status,'resolved'); assert.equal(detail.history.length,4); assert.equal(detail.team,'Campus maintenance');
  assert.equal(detail.resolution,'Tap replaced and the leak stopped.'); assert.deepEqual(detail.photos,['after','before']);
  assert.equal((await guest.request(`/api/reports/${id}/photos/after`)).status,200);
  const stats=(await guest.request('/api/stats')).data;
  assert.deepEqual(stats.counts,[{status:'resolved',count:1}]); assert.equal(stats.areas[0].area,'knowledge-university'); assert.equal(stats.pending,null);
  result=await admin.request(`/api/reports/${id}`,'PATCH',{version:4,status:'in_progress',team:'Campus maintenance',note:'Reopened after a new inspection.'});
  assert.equal(result.data.report.resolution,''); assert.deepEqual(result.data.report.photos,['before']);
  assert.equal((await guest.request(`/api/reports/${id}/photos/after`)).status,404);
});

test('moderation rejection hides reports and photos from the public but keeps owner history',async t=> {
  const app=await fixture(t), member=app.client(), admin=app.client(), guest=app.client();
  await member.register('member'); await admin.register('moderator'); app.db.prepare("UPDATE users SET role='admin' WHERE username='moderator'").run();
  const id=(await member.request('/api/reports','POST',report({photo:png}))).data.report.id;
  assert.equal((await admin.request(`/api/reports/${id}`,'PATCH',{version:1,status:'rejected',note:'Duplicate report; existing team already assigned.'})).status,200);
  assert.equal((await guest.request(`/api/reports/${id}`)).status,404);
  assert.equal((await guest.request(`/api/reports/${id}/photos/before`)).status,404);
  assert.equal((await member.request(`/api/reports/${id}`)).data.report.history[1].status,'rejected');
  assert.equal((await admin.request(`/api/reports/${id}`,'PATCH',{version:2,status:'reviewed',note:'New information supports this report.'})).status,200);
  assert.equal((await guest.request(`/api/reports/${id}`)).status,200);
});

test('validation, origin checks, private files and role escalation attempts are rejected',async t=> {
  const app=await fixture(t), client=app.client();
  assert.equal((await client.request('/api/reports','POST',report())).status,401);
  assert.equal((await client.request('/api/register','POST',{username:'member',password:'short'})).data.error,'password_short');
  assert.equal((await client.request('/api/register','POST',{username:'member',password:'long-password-12345',role:'admin'})).data.user.role,'member');
  for (const overrides of [{title:'a'},{description:'short'},{category:'unknown'},{area:'unknown'},{latitude:36},{latitude:100,longitude:20},{title:['bad']},{photo:{mime:'image/svg+xml',data:'PHN2Zz4='}},{photo:{mime:'image/png',data:'not base64'}}]) {
    assert.equal((await client.request('/api/reports','POST',report(overrides))).status,400,JSON.stringify(overrides));
  }
  assert.equal((await client.request('/api/reports','POST',report(),{'X-Green-Request':''})).status,403);
  assert.equal((await client.request('/api/reports','POST',report(),{Origin:'https://evil.example'})).status,403);
  assert.equal((await client.request('/api/reports?scope=admin')).status,403);
  for (const path of ['/data/reports.sqlite','/server/index.js','/package.json','/.git/config','/api/reports?page=-1','/api/reports?status=madeup']) assert.ok((await client.request(path)).status>=400,path);
  const raw=await fetch(app.base+'/api/reports',{method:'POST',headers:{'X-Green-Request':'1','Content-Type':'text/plain',Cookie:client.cookie},body:'{}'}); assert.equal(raw.status,415);
  const malformed=await fetch(app.base+'/api/reports',{method:'POST',headers:{'X-Green-Request':'1','Content-Type':'application/json',Cookie:client.cookie},body:'{broken'}); assert.equal(malformed.status,400);
  assert.equal((await client.request('/api/reports','POST',report({description:'x'.repeat(6*1024*1024)}))).status,400,'text limit still applies despite larger media request allowance');
  assert.equal((await client.request('/api/register','POST',{username:'x'.repeat(6*1024*1024)})).status,413,'account requests retain their smaller body limit');
  assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM reports').get().n,0);
});

test('filters, pagination and literal search operate on real stored reports',async t=> {
  const app=await fixture(t), member=app.client(); await member.register('filter_user');
  for(let i=0;i<14;i++) await member.request('/api/reports','POST',report({title:`Report ${i} ${i===0?'100%_literal':'garden'}`,area:i%2?'erbil':'ankawa',category:i%2?'waste':'water'}));
  app.db.prepare("UPDATE reports SET status='reviewed'").run();
  assert.equal((await member.request('/api/reports')).data.reports.length,12);
  assert.equal((await member.request('/api/reports?page=2')).data.reports.length,2);
  assert.equal((await member.request('/api/reports?area=ankawa&category=water')).data.total,7);
  assert.equal((await member.request('/api/reports?q=100%25_literal')).data.total,1);
  assert.equal((await member.request('/api/reports?q='+encodeURIComponent("' OR 1=1 --"))).data.total,0);
});

test('database reports, photos and sessions survive a server restart',async t=> {
  const app=await fixture(t), member=app.client(); await member.register('persistent');
  const id=(await member.request('/api/reports','POST',report({photo:png}))).data.report.id;
  const cookie=member.cookie;
  await new Promise(resolve=>app.server.close(resolve));
  const restarted=createApp({database:app.database}); restarted.server.listen(0,'127.0.0.1'); await once(restarted.server,'listening');
  try {
    const base=`http://127.0.0.1:${restarted.server.address().port}`;
    const response=await fetch(`${base}/api/reports/${id}`,{headers:{Cookie:cookie}});
    assert.equal(response.status,200); assert.equal((await response.json()).report.id,id);
    assert.equal((await fetch(`${base}/api/reports/${id}/photos/before`,{headers:{Cookie:cookie}})).status,200);
  } finally { await new Promise(resolve=>restarted.server.close(resolve)); }
});

test('expired sessions and authentication rate limits are enforced',async t=> {
  const app=await fixture(t), member=app.client(); await member.register('expiry');
  app.db.prepare('UPDATE sessions SET expires_at=0').run();
  assert.equal((await member.request('/api/session')).data.user,null);
  assert.equal((await member.request('/api/reports?scope=mine')).status,401);
  for(let i=0;i<29;i++) await member.request('/api/login','POST',{username:'unknown',password:'test'});
  assert.equal((await member.request('/api/login','POST',{username:'unknown',password:'test'})).status,429);
});

test('static site serves reporting assets with security headers and blocks caching API data',async t=> {
  const app=await fixture(t), guest=app.client();
  for(const path of ['/reports.html','/css/reports.css','/js/reports.js','/js/report-translations.js']) {
    const response=await guest.request(path); assert.equal(response.status,200,path);
    assert.equal(response.headers.get('x-content-type-options'),'nosniff');
    assert.match(response.headers.get('content-security-policy'),/img-src[^;]*https:\/\/tile\.openstreetmap\.org(?:;|\s)/);
  }
  const source=(await guest.request('/sw.js')).data.toString(); assert.match(source,/url\.pathname\.startsWith\('\/api\/'\)/);
  assert.equal((await guest.request('/api/session')).headers.get('cache-control'),'no-store');
});
