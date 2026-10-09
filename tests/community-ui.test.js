const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {fixture,report,png}=require('./report-helpers');
async function until(check,label){const deadline=Date.now()+7000;while(Date.now()<deadline){if(check())return;await new Promise(done=>setTimeout(done,15));}throw Error('Timed out: '+label);}
async function browser(t,app,cookie,reportId){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',value=>errors.push(value.message));
  const dom=new JSDOM(readFileSync('dist/reports.html','utf8'),{url:app.base+'/reports.html'+(reportId?'?report='+reportId:''),runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});const w=dom.window;
  t.after(()=>{w.close();assert.deepEqual(errors,[],'no UI runtime errors');});
  w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};w.AbortController=global.AbortController;
  let offline=false;
  w.fetch=async(path,options={})=>{if(offline)throw new w.TypeError('Offline');const response=await fetch(new URL(path,app.base),{...options,headers:{...options.headers,Cookie:cookie}});const next=response.headers.get('set-cookie');if(next)cookie=next.split(';')[0];return response;};
  for(const path of ['js/report-translations.js','js/site-translations.js','js/site-i18n.js','js/community-ui.js'])w.eval(readFileSync(resolve('dist',path),'utf8'));
  // DOM engines do not decode images or implement canvas. Server photo storage is tested
  // with actual bytes; this stub tests selecting and sending evidence through the UI.
  const mount=w.CommunityUI.mount;w.CommunityUI.mount=(container,report,user,helpers)=>mount(container,report,user,{...helpers,normalizePhoto:async file=>file?png:null});
  w.eval(readFileSync('dist/js/reports.js','utf8'));
  const $=selector=>w.document.querySelector(selector);
  const submit=selector=>$(selector).dispatchEvent(new w.SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:$(selector).querySelector('[type=submit]')}));
  const enter=(selector,name,value)=>{const field=$(selector).elements[name];field.value=value;field.dispatchEvent(new w.Event('input',{bubbles:true}));};
  await until(()=>$('#stats strong')?.textContent==='1','public statistics');
  if(!reportId)$('#report-list button').click();
  await until(()=>$('#community-project #post-update'),'project loaded');
  return {w,$,submit,enter,setOffline:value=>{offline=value;}};
}

test('production community UI creates a team, recruits a volunteer, completes a task and verifies photo evidence',async t=>{
  const app=await fixture(t,{root:resolve('dist')}),owner=app.client(),volunteer=app.client(),admin=app.client();
  await owner.register('team_ui_owner');await volunteer.register('team_ui_volunteer');await admin.register('team_ui_admin');app.db.prepare("UPDATE users SET role='admin' WHERE username='team_ui_admin'").run();
  const result=await owner.request('/api/reports','POST',report({photo:png,goal:'Clean the garden and restore public access.',resources:'Gloves and bags'}));const id=result.data.report.id,base='/api/reports/'+id;
  await admin.request(base,'PATCH',{status:'reviewed',team:'',note:'Approved this public cleanup project.',version:1});
  const lead=await browser(t,app,owner.cookie,id);
  assert.ok(lead.$('#report-dialog').open,'shared report URL opens project');
  assert.match(lead.$('#report-detail').textContent,/Gloves and bags/);
  lead.enter('#create-team','name','Student garden team');lead.enter('#create-team','plan','Collect and sort litter from the public garden path.');lead.enter('#create-team','contribution','Organize volunteers and supplies.');lead.submit('#create-team');
  await until(()=>lead.$('#create-task')&&lead.$('#report-detail>.rr-status').dataset.status==='in_progress','team created');
  assert.equal(lead.$('#report-detail>.rr-status').dataset.status,'in_progress');
  lead.enter('#create-task','title','Clean the garden path');lead.submit('#create-task');
  await until(()=>lead.$('.community-task'),'task created');
  const taskId=lead.$('.community-task').dataset.taskId;
  const helper=await browser(t,app,volunteer.cookie,id);helper.enter('#join-team','contribution','Bring reusable gloves.');helper.submit('#join-team');
  await until(()=>helper.$('.community-members').textContent.includes('team_ui_volunteer'),'joined team');
  helper.$('.community-task button').click();await until(()=>helper.$('.community-task').dataset.status==='doing','claimed task');
  helper.$('.community-task button').click();await until(()=>helper.$('.community-task').dataset.status==='done','completed task');
  lead.$('#refresh').click();await until(()=>lead.$('.community-task')?.dataset.status==='done','shared state refresh');
  lead.enter('#post-update','content','<img src=x onerror=alert(1)> The path is clean and ready for inspection.');
  lead.w.I18N.set('ar');assert.match(lead.$('#post-update').elements.content.value,/path is clean/,'language switching preserves the draft');
  lead.w.I18N.set('en');
  lead.$('#refresh').click();await new Promise(done=>setTimeout(done,80));
  assert.match(lead.$('#post-update').elements.content.value,/path is clean/,'refresh preserves unsaved update');
  lead.enter('#post-update','kind','resolution_request');lead.$('#post-update').elements.kind.dispatchEvent(new lead.w.Event('change'));
  const file=new lead.w.File(['test photo'],'result.png',{type:'image/png'});Object.defineProperty(lead.$('#post-update').elements.photo,'files',{value:[file],configurable:true});lead.$('#post-update').elements.photo.dispatchEvent(new lead.w.Event('input',{bubbles:true}));
  lead.submit('#post-update');await until(()=>lead.$('.community-update'),'resolution request');
  assert.equal(lead.$('.community-update img')?.className,'rr-preview');assert.equal(lead.$('.community-update [onerror]'),null,'content is plain text');
  assert.equal((await owner.request(base)).data.report.status,'in_progress','evidence does not self-approve');
  const reviewer=await browser(t,app,admin.cookie,id);
  const review=reviewer.$('[id^="confirm-resolution-"]');assert.ok(review);
  reviewer.enter('#'+review.id,'note','Reviewed the result photo and completed tasks. The path is clean.');reviewer.submit('#'+review.id);
  await until(()=>reviewer.$('#report-detail>.rr-status').dataset.status==='resolved','moderator verified resolution');
  assert.equal((await app.client().request(base+'/photos/after')).status,200);
  assert.equal(reviewer.$('#create-task'),null,'closed project has no active task form');
  assert.equal(reviewer.$('.community-project progress').value,1);
});

test('community forms retain text on connection failure and can retry; project loading can retry',async t=>{
  const app=await fixture(t),owner=app.client(),admin=app.client();await owner.register('retry_team_owner');await admin.register('retry_team_admin');app.db.prepare("UPDATE users SET role='admin' WHERE username='retry_team_admin'").run();
  const result=await owner.request('/api/reports','POST',report());const id=result.data.report.id;await admin.request('/api/reports/'+id,'PATCH',{status:'reviewed',team:'',note:'Reviewed the report for volunteers.',version:1});
  const ui=await browser(t,app,owner.cookie,id);ui.enter('#create-team','name','Persistent team');ui.enter('#create-team','plan','Prepare supplies and clean the public garden.');ui.setOffline(true);ui.submit('#create-team');
  await until(()=>ui.$('#create-team [role=status]').textContent.includes('unavailable'),'offline error');assert.equal(ui.$('#create-team').elements.name.value,'Persistent team');
  assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM community_teams').get().n,0);
  ui.setOffline(false);ui.submit('#create-team');await until(()=>ui.$('#create-task')&&ui.$('#report-detail>.rr-status').dataset.status==='in_progress','retry saved');
  assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM community_teams').get().n,1);
  const originalFetch=ui.w.fetch;let failProject=true;
  ui.w.fetch=async(path,options)=>{if(String(path).includes('/community')&&failProject){failProject=false;throw new ui.w.TypeError('Temporary disconnect');}return originalFetch(path,options);};
  ui.$('#refresh').click();await until(()=>ui.$('#community-project [role=status]')?.textContent.includes('unavailable'),'project loading failure');
  ui.$('#community-project button').click();await until(()=>ui.$('#create-task'),'project loading retry');
});
