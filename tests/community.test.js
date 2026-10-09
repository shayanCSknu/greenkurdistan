const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('../server');
const {fixture,report,png}=require('./report-helpers');
async function setup(t){
  const app=await fixture(t),owner=app.client(),admin=app.client(),volunteer=app.client(),outsider=app.client();
  await owner.register('community_owner');await admin.register('community_admin');await volunteer.register('community_volunteer');await outsider.register('community_outsider');
  app.db.prepare("UPDATE users SET role='admin' WHERE username='community_admin'").run();
  let response=await owner.request('/api/reports','POST',report({photo:png,goal:'Restore a clean and safe public garden.',resources:'Gloves, bags and volunteers',urgency:'high',description:'A detailed account of waste in the public garden. '.repeat(60)}));
  assert.equal(response.status,201);const id=response.data.report.id,base='/api/reports/'+id;
  const approve=async()=>{const detail=await admin.request(base);return admin.request(base,'PATCH',{status:'reviewed',team:'',note:'Reviewed the public location and the submitted evidence.',version:detail.data.report.version});};
  return {app,owner,admin,volunteer,outsider,id,base,approve};
}

test('community lifecycle: photo report, moderation, team, volunteers, tasks, evidence and verified solution',async t=>{
  const {app,owner,admin,volunteer,outsider,id,base,approve}=await setup(t);
  let result=await outsider.request(base+'/community');assert.equal(result.status,404);
  result=await owner.request(base+'/team','POST',{name:'Garden helpers',plan:'Collect litter and check the public garden paths.'});assert.equal(result.status,409);
  assert.equal((await approve()).status,200);
  result=await owner.request(base+'/team','POST',{name:'Garden helpers',plan:'Collect litter and check the public garden paths.',contribution:'I can coordinate the cleanup.'});assert.equal(result.status,200);
  result=await owner.request(base);assert.equal(result.data.report.status,'in_progress');assert.equal(result.data.report.brief.urgency,'high');assert.ok(result.data.report.description.length>2000);
  assert.equal((await volunteer.request(base+'/team/membership','POST',{action:'join',contribution:'I can bring gloves and help on Friday.'})).status,200);
  result=await volunteer.request('/api/reports?scope=teams');assert.equal(result.data.reports.length,1);
  assert.equal((await owner.request(base+'/tasks','POST',{title:'Collect and sort the litter',dueDate:'2026-10-20'})).status,200);
  result=await owner.request(base+'/community');const task=result.data.tasks[0];assert.equal(result.data.members.length,2);
  assert.equal((await volunteer.request(base+'/tasks/'+task.id,'PATCH',{action:'claim'})).status,200);
  assert.equal((await owner.request(base+'/tasks/'+task.id,'PATCH',{action:'claim'})).status,409);
  assert.equal((await outsider.request(base+'/tasks/'+task.id,'PATCH',{action:'complete'})).status,403);
  assert.equal((await owner.request(base+'/updates','POST',{kind:'resolution_request',content:'The litter has been collected and the paths checked.',photo:png})).data.error,'unfinished_tasks');
  assert.equal((await volunteer.request(base+'/updates','POST',{kind:'progress',content:'We collected the litter and separated recyclable materials.',photo:png})).status,200);
  assert.equal((await volunteer.request(base+'/tasks/'+task.id,'PATCH',{action:'complete'})).status,200);
  assert.equal((await owner.request(base+'/updates','POST',{kind:'resolution_request',content:'The garden has been cleaned and the public paths checked.'})).data.error,'evidence_required');
  assert.equal((await owner.request(base+'/updates','POST',{kind:'resolution_request',content:'The garden has been cleaned and the public paths checked.',photo:png})).status,200);
  result=await app.client().request(base+'/community');const request=result.data.updates.find(u=>u.kind==='resolution_request');
  assert.equal((await volunteer.request(base+'/updates/'+request.id+'/resolve','POST',{note:'Verified the clean paths.'})).status,403);
  assert.equal((await admin.request(base+'/updates/'+request.id+'/resolve','POST',{note:'Checked the result photo and confirmed all tasks are completed.'})).status,200);
  result=await app.client().request(base);assert.equal(result.data.report.status,'resolved');assert.ok(result.data.report.photos.includes('after'));
  const after=await app.client().request(base+'/photos/after');assert.deepEqual(after.data,Buffer.from(png.data,'base64'));
  result=await owner.request(base+'/community');assert.equal(result.data.tasks[0].status,'done');
  assert.equal((await volunteer.request(base+'/team/membership','POST',{action:'join'})).status,409);
  assert.equal((await outsider.request(base+'/updates','POST',{kind:'discussion',content:'Thank you for cleaning the public garden.'})).status,200);
  assert.equal(app.db.prepare('PRAGMA user_version').get().user_version,2);
});

test('community permissions, support idempotency, task ownership, leadership transfer and leaving',async t=>{
  const {app,owner,admin,volunteer,outsider,base,approve}=await setup(t);await approve();
  await owner.request(base+'/team','POST',{name:'Garden helpers',plan:'Collect litter and repair damaged public bins.'});
  assert.equal((await outsider.request(base+'/team','POST',{name:'Other helpers',plan:'A second team attempting to replace the first.'})).data.error,'team_exists');
  assert.equal((await app.client().request(base+'/team/membership','POST',{action:'join'})).status,401);
  assert.equal((await outsider.request(base+'/tasks','POST',{title:'Unauthorized task'})).status,403);
  assert.equal((await outsider.request(base+'/updates','POST',{kind:'progress',content:'An unauthorized progress entry.'})).status,403);
  for(let i=0;i<3;i++)assert.equal((await outsider.request(base+'/support','POST',{supported:true})).status,200);
  let state=(await outsider.request(base+'/community')).data;assert.equal(state.supporters,1);assert.equal(state.supported,true);
  assert.equal((await outsider.request(base+'/support','POST',{supported:false})).status,200);
  await volunteer.request(base+'/team/membership','POST',{action:'join',contribution:'Bring bags.'});
  await owner.request(base+'/tasks','POST',{title:'Prepare bags and gloves'});
  state=(await owner.request(base+'/community')).data;const task=state.tasks[0];
  await volunteer.request(base+'/tasks/'+task.id,'PATCH',{action:'claim'});
  assert.equal((await owner.request(base+'/team/membership','POST',{action:'leave'})).data.error,'transfer_leadership');
  await volunteer.request(base+'/team/membership','POST',{action:'leave'});
  state=(await owner.request(base+'/community')).data;assert.equal(state.tasks[0].status,'open');assert.equal(state.tasks[0].assignee_id,null);
  await volunteer.request(base+'/team/membership','POST',{action:'join'});
  const volunteerId=app.db.prepare("SELECT id FROM users WHERE username='community_volunteer'").get().id;
  assert.equal((await outsider.request(base+'/team/leader','POST',{userId:volunteerId})).status,403);
  assert.equal((await owner.request(base+'/team/leader','POST',{userId:volunteerId})).status,200);
  assert.equal((await owner.request(base+'/team/membership','POST',{action:'leave'})).status,200);
  assert.equal((await volunteer.request(base+'/team','PATCH',{name:'New garden team',plan:'Continue working together to clean the garden.'})).status,200);
  assert.equal((await admin.request(base)).data.report.team,'New garden team');
  assert.equal((await owner.request('/api/reports?scope=teams')).data.total,0);
});

test('discussion moderation, photos, report isolation, pagination and restart persistence',async t=>{
  const {app,owner,admin,volunteer,base,approve}=await setup(t);await approve();
  await owner.request(base+'/team','POST',{name:'Garden helpers',plan:'Work together to clean the public paths.'});
  for(let i=0;i<22;i++)await volunteer.request(base+'/updates','POST',{kind:'discussion',content:i===0?'<img src=x onerror=alert(1)>':'Practical cleanup suggestion '+i,...(i===0?{photo:png}:{})});
  let state=(await app.client().request(base+'/community')).data;assert.equal(state.updates.length,20);assert.equal(state.pages,2);
  state=(await app.client().request(base+'/community?page=2')).data;const update=state.updates.find(u=>u.hasPhoto);assert.ok(update);
  assert.equal((await volunteer.request(base+'/updates/'+update.id,'PATCH',{hidden:true})).status,403);
  const image=await app.client().request(base+'/updates/'+update.id+'/photo');assert.deepEqual(image.data,Buffer.from(png.data,'base64'));
  await admin.request(base+'/updates/'+update.id,'PATCH',{hidden:true});
  assert.equal((await app.client().request(base+'/updates/'+update.id+'/photo')).status,404);
  assert.equal((await admin.request(base+'/updates/'+update.id+'/photo')).status,200);
  state=(await app.client().request(base+'/community?page=2')).data;assert.ok(!state.updates.some(u=>u.id===update.id));
  await admin.request(base+'/updates/'+update.id,'PATCH',{hidden:false});
  const other=await owner.request('/api/reports','POST',report({requestId:'different-request-123456',title:'A second environmental issue'}));
  assert.equal((await owner.request('/api/reports/'+other.data.report.id+'/updates/'+update.id+'/photo')).status,404);
  await new Promise(done=>app.server.close(done));
  const restarted=createApp({database:app.database});restarted.server.listen(0,'127.0.0.1');await new Promise(done=>restarted.server.once('listening',done));
  try {
    const r=await fetch('http://127.0.0.1:'+restarted.server.address().port+base+'/community');state=await r.json();
    assert.equal(state.team.name,'Garden helpers');assert.equal(state.total,22);assert.equal(state.members.length,1);
  } finally { await new Promise(done=>restarted.server.close(done)); }
});

test('version-one databases upgrade without losing accounts, sessions, reports or photos',async t=>{
  const {DatabaseSync}=require('node:sqlite');
  const app=await fixture(t),owner=app.client();await owner.register('migration_owner');
  const created=await owner.request('/api/reports','POST',report({photo:png}));const id=created.data.report.id,cookie=owner.cookie;
  await new Promise(done=>app.server.close(done));
  const legacy=new DatabaseSync(app.database);
  legacy.exec('DROP TABLE project_tasks; DROP TABLE team_members; DROP TABLE community_teams; DROP TABLE project_briefs; DROP TABLE community_updates; DROP TABLE report_supporters; PRAGMA user_version=1;');legacy.close();
  for(let attempt=0;attempt<2;attempt++){
    const upgraded=createApp({database:app.database});upgraded.server.listen(0,'127.0.0.1');await new Promise(done=>upgraded.server.once('listening',done));
    try{
      const base='http://127.0.0.1:'+upgraded.server.address().port;
      const response=await fetch(base+'/api/reports/'+id,{headers:{Cookie:cookie}});assert.equal(response.status,200);const data=await response.json();
      assert.equal(data.report.title,created.data.report.title);assert.equal(data.report.brief.urgency,'normal');
      assert.equal((await fetch(base+'/api/reports/'+id+'/photos/before',{headers:{Cookie:cookie}})).status,200);
      assert.equal(upgraded.db.prepare('SELECT COUNT(*) AS n FROM users').get().n,1);
      assert.equal(upgraded.db.prepare('PRAGMA user_version').get().user_version,2);
    }finally{await new Promise(done=>upgraded.server.close(done));}
  }
});
