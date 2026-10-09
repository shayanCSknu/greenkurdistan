const {test}=require('node:test'),assert=require('node:assert/strict');
const {fixture,report,png}=require('./report-helpers');
const {createApp}=require('../server');
// Container signature fixture for API transport/ranges. Real playable video is
// separately recorded and decoded during the Chrome acceptance check.
const webmBytes=Buffer.concat([Buffer.from('1a45dfa3','hex'),Buffer.from('webm transport fixture - not a playable video')]);
const webm={mime:'video/webm',data:webmBytes.toString('base64')};
test('version-two databases retain legacy photo reports when upgraded for attachments',async t=>{
 const app=await fixture(t),owner=app.client();await owner.register('legacy_media_owner');const id=(await owner.request('/api/reports','POST',report({photo:png}))).data.report.id;
 app.db.exec('DROP TABLE report_media; PRAGMA user_version=2;');await new Promise(done=>app.server.close(done));
 const upgraded=createApp({database:app.database});await new Promise(done=>upgraded.server.listen(0,'127.0.0.1',done));
 try{assert.equal(upgraded.db.prepare('PRAGMA user_version').get().user_version,3);const response=await fetch('http://127.0.0.1:'+upgraded.server.address().port+'/api/reports/'+id,{headers:{Cookie:owner.cookie}});const data=await response.json();assert.deepEqual(data.report.attachments,[]);assert.deepEqual(data.report.photos,['before']);assert.equal(upgraded.db.prepare('SELECT bytes FROM photos WHERE report_id=?').get(id).bytes.length,Buffer.from(png.data,'base64').length);}
 finally{await new Promise(done=>upgraded.server.close(done));}
});
test('three mixed attachments obey moderation privacy, byte ranges, idempotency and restart persistence',async t=>{
 const app=await fixture(t),owner=app.client(),admin=app.client(),guest=app.client();await owner.register('media_owner');await admin.register('media_admin');app.db.prepare("UPDATE users SET role='admin' WHERE username='media_admin'").run();
 const input=report({area:'van',attachments:[png,webm,png]});let result=await owner.request('/api/reports','POST',input);assert.equal(result.status,201);const id=result.data.report.id,base='/api/reports/'+id;
 assert.equal(result.data.report.attachments.length,3);assert.deepEqual(result.data.report.photos,['before']);
 assert.equal((await guest.request(base+'/attachments/2')).status,404);assert.equal((await guest.request(base+'/photos/before')).status,404);
 assert.equal((await owner.request('/api/reports','POST',input)).data.report.id,id);assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM report_media').get().n,3);
 result=await admin.request(base,'PATCH',{status:'reviewed',note:'Verified problem location and attached evidence.',version:1});assert.equal(result.status,200);
 result=await guest.request(base+'/attachments/2');assert.equal(result.headers.get('content-type'),'video/webm');assert.equal(result.headers.get('cache-control'),'no-store');assert.deepEqual(result.data,webmBytes);
 result=await guest.request(base+'/attachments/2','GET',undefined,{Range:'bytes=4-11'});assert.equal(result.status,206);assert.deepEqual(result.data,webmBytes.subarray(4,12));assert.match(result.headers.get('content-range'),/^bytes 4-11\//);
 result=await guest.request(base+'/attachments/2','GET',undefined,{Range:'bytes=-5'});assert.deepEqual(result.data,webmBytes.subarray(-5));
 assert.equal((await guest.request(base+'/attachments/2','GET',undefined,{Range:'bytes=9999-'})).status,416);
 assert.equal((await guest.request(base+'/attachments/2','GET',undefined,{Range:'bytes=3-1'})).status,416);
 assert.equal((await guest.request(base+'/attachments/2','GET',undefined,{Range:'bytes=0-1,4-5'})).status,416);
 assert.equal((await guest.request(base+'/attachments/4')).status,404);
 assert.equal((await guest.request(base+'/photos/before')).data.toString('base64'),png.data);
 await new Promise(done=>app.server.close(done));const restarted=createApp({database:app.database});await new Promise(done=>restarted.server.listen(0,'127.0.0.1',done));
 try{
 result=await fetch('http://127.0.0.1:'+restarted.server.address().port+base);assert.equal((await result.json()).report.attachments.length,3);
 result=await fetch('http://127.0.0.1:'+restarted.server.address().port+base+'/attachments/2');assert.deepEqual(Buffer.from(await result.arrayBuffer()),webmBytes);
 }finally{await new Promise(done=>restarted.server.close(done));}
});
test('attachments reject excess files, legacy combinations, invalid signatures and unsupported types atomically',async t=>{
 const app=await fixture(t),owner=app.client();await owner.register('invalid_media');
 for(const input of [{attachments:[png,png,png,png]},{attachments:[png],photo:png},{attachments:'bad'},{attachments:[null]},{attachments:[{mime:'video/webm',data:png.data}]},{attachments:[{mime:'video/mp4',data:webm.data}]},{attachments:[{mime:'image/svg+xml',data:png.data}]},{attachments:[{mime:'video/webm',data:'bad%'}]}])assert.equal((await owner.request('/api/reports','POST',report(input))).status,400);
 const oversized={mime:'video/webm',data:Buffer.alloc(15*1024*1024+1).toString('base64')};assert.equal((await owner.request('/api/reports','POST',report({attachments:[oversized]}))).status,400);
 assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM reports').get().n,0);assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM report_media').get().n,0);
 const response=await new Promise((done,reject)=>{const req=require('node:http').request(new URL('/api/reports',app.base),{method:'POST',headers:{Cookie:owner.cookie,'Content-Type':'application/json','X-Green-Request':'1','Content-Length':65*1024*1024}},res=>{res.resume();res.on('end',()=>done(res.statusCode));});req.on('error',reject);req.end('{}');});assert.equal(response,413);
});
