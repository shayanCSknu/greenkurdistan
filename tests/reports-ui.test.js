const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const { fixture, report } = require('./report-helpers');

async function until(check, label) {
  const deadline=Date.now()+8000;
  while(Date.now()<deadline) { if(check())return; await new Promise(resolve=>setTimeout(resolve,15)); }
  throw new Error('Timed out: '+label);
}
async function browser(t,base,{cookie='',offline=false}={}) {
  const errors=[];
  const vc=new VirtualConsole(); vc.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(readFileSync('reports.html','utf8'),{url:base+'/reports.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  t.after(()=> { dom.window.close(); assert.deepEqual(errors,[],'no DOM runtime errors'); });
  const w=dom.window;
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
  w.AbortController=global.AbortController;
  w.SVGSVGElement.prototype.createSVGRect=function(){return {};};
  w.eval(readFileSync('js/vendor/leaflet/leaflet.js','utf8'));
  let disconnected=offline;
  w.fetch=async(path,options={})=> {
    if(disconnected)throw new w.TypeError('Network offline');
    const response=await fetch(new URL(path,base),{...options,headers:{...options.headers,Cookie:cookie}});
    const next=response.headers.get('set-cookie'); if(next)cookie=next.split(';')[0];
    return response;
  };
  w.eval(readFileSync('js/report-translations.js','utf8'));
  w.eval(readFileSync('js/site-translations.js','utf8'));
  w.eval(readFileSync('js/site-i18n.js','utf8'));
  w.eval(readFileSync('js/report-map.js','utf8'));
  w.eval(readFileSync('js/community-ui.js','utf8'));
  w.eval(readFileSync('js/reports.js','utf8'));
  const $=selector=>w.document.querySelector(selector);
  const submit=(selector,button)=>$(selector).dispatchEvent(new w.SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:button?$(button):$(selector).querySelector('[type=submit]')}));
  await until(()=>offline?!$('#connection-message').hidden:$('#stats strong')?.textContent==='0','initial data');
  return {w,$,submit,setOffline:value=>{disconnected=value;},get cookie(){return cookie;}};
}

test('reporting UI registers, creates a report, displays private history and signs out',async t=> {
  const app=await fixture(t), ui=await browser(t,app.base);
  ui.$('#new-report').click(); assert.ok(ui.$('#auth-dialog').open);
  const account=ui.$('#auth-form').elements;
  account.username.value='ui_student'; account.password.value='Student-password-123';
  ui.submit('#auth-form','[value=register]');
  await until(()=>!ui.$('#create-panel').hidden,'create panel after registration');
  const fields=ui.$('#create-report').elements;
  assert.ok(ui.w.ReportMap.picker);
  ui.w.ReportMap.picker.fire('click',{latlng:{lat:36.191234,lng:44.012345}});
  assert.equal(fields.latitude.value,'36.191234');assert.equal(fields.longitude.value,'44.012345');
  ui.w.ReportMap.marker.setLatLng([36.192222,44.013333]);ui.w.ReportMap.marker.fire('dragend');
  assert.equal(fields.latitude.value,'36.192222');assert.equal(fields.longitude.value,'44.013333');
  ui.$('#language').value='ar';ui.$('#language').dispatchEvent(new ui.w.Event('change'));
  assert.equal(fields.latitude.value,'36.192222');
  ui.$('#language').value='en';ui.$('#language').dispatchEvent(new ui.w.Event('change'));
  fields.title.value='Leaking tap outside the library'; fields.location.value='Library public entrance'; fields.description.value='Water is leaking from the outdoor tap near the public path.';
  ui.submit('#create-report');
  await until(()=>ui.$('#create-message').textContent.includes('Report #1 submitted'),'submission result');
  await until(()=>ui.$('#report-list button'),'created report card');
  assert.match(ui.$('#report-list').textContent,/Leaking tap outside/);
  ui.$('#report-list button').click();
  await until(()=>ui.$('.rr-history li'),'report details');
  assert.equal(ui.$('.rr-history strong').textContent,'Submitted');
  assert.ok(ui.w.ReportMap.detail);assert.ok(Math.abs(ui.w.ReportMap.detail.getCenter().lat-36.192222)<0.000001);
  assert.match(ui.$('#report-detail a[href*="google.com/maps/dir"]').href,/destination=36.192222,44.013333/);
  assert.equal(app.db.prepare('SELECT latitude FROM reports WHERE id=1').get().latitude,36.192222);
  assert.equal(ui.$('#admin-update'),null);
  ui.$('[data-close=report-dialog]').click();
  ui.$('#sign-out').click();
  await until(()=>ui.$('#sign-out').hidden,'signed out');
  assert.equal(ui.$('#create-panel').hidden,true);
  await until(()=>!ui.$('#report-list button'),'private submission absent from public view');
});

test('administrator UI advances reviewed reports to resolution and renders notes as text',async t=> {
  const app=await fixture(t), admin=app.client(), owner=app.client();
  await admin.register('ui_admin'); await owner.register('ui_owner'); app.db.prepare("UPDATE users SET role='admin' WHERE username='ui_admin'").run();
  await owner.request('/api/reports','POST',report({title:'<img src=x onerror=alert(1)>',description:'A leaking pipe near the campus public garden.'}));
  const ui=await browser(t,app.base,{cookie:admin.cookie});
  ui.$('[data-scope=admin]').click(); await until(()=>ui.$('#report-list button'),'admin pending list');
  assert.equal(ui.$('#report-list img'),null,'untrusted title stays plain text');
  ui.$('#report-list button').click(); await until(()=>ui.$('#admin-update'),'admin controls');
  for(const [status,note] of [['reviewed','Accepted after checking the location.'],['in_progress','Campus repair team is handling this problem.'],['resolved','The pipe has been repaired and checked.']]) {
    const form=ui.$('#admin-update'); form.elements.status.value=status; form.elements.team.value='Campus repair team'; form.elements.note.value=note;
    form.elements.status.dispatchEvent(new ui.w.Event('change'));
    ui.submit('#admin-update');
    await until(()=>ui.$('#report-detail>.rr-status')?.dataset.status===status,'status '+status);
  }
  assert.match(ui.$('.rr-resolution').textContent,/repaired and checked/);
  assert.equal(ui.w.document.querySelectorAll('.rr-history li').length,4);
  assert.equal(ui.$('#report-detail img'),null);
});

test('all reporting translations exist; language switch changes content, options and RTL direction',async t=> {
  const app=await fixture(t),ui=await browser(t,app.base);
  for(const [key,values]of Object.entries(ui.w.RR_TEXT)) assert.ok(values.length===3&&values.every(x=>typeof x==='string'&&x.length),key);
  for(const node of ui.w.document.querySelectorAll('[data-t]')) assert.ok(ui.w.RR_TEXT[node.dataset.t],node.dataset.t);
  for(const language of ['ku','ar','en']) {
    ui.$('#language').value=language;ui.$('#language').dispatchEvent(new ui.w.Event('change'));
    assert.equal(ui.w.document.documentElement.dir,language==='en'?'ltr':'rtl');
    assert.equal(ui.w.document.documentElement.lang,language==='ku'?'ckb':language);
    assert.equal(ui.$('#new-report').textContent,ui.w.RR_TEXT.newReport[{en:0,ku:1,ar:2}[language]]);
    assert.equal(ui.$('#filters [name=area]').options[1].textContent,ui.w.RR_TEXT['knowledge-university'][{en:0,ku:1,ar:2}[language]]);
  }
});

test('offline errors are honest and failed submissions preserve form text for retry',async t=> {
  const app=await fixture(t),member=app.client();await member.register('offline_member');
  const ui=await browser(t,app.base,{cookie:member.cookie});ui.$('#new-report').click();
  const fields=ui.$('#create-report').elements;
  fields.title.value='Overflowing public bin';fields.location.value='Garden entrance';fields.description.value='The public bin is overflowing next to the main garden entrance.';fields.category.value='waste';
  ui.setOffline(true);ui.submit('#create-report');
  await until(()=>ui.$('#create-message').textContent.includes('unavailable'),'offline feedback');
  assert.equal(fields.title.value,'Overflowing public bin');assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM reports').get().n,0);
  ui.setOffline(false);ui.submit('#create-report');
  await until(()=>ui.$('#create-message').textContent.includes('submitted'),'retry success');
  assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM reports').get().n,1);
  const offlineUI=await browser(t,app.base,{offline:true});assert.match(offlineUI.$('#connection-message').textContent,/server is unavailable/);
});

test('UI validates paired coordinates and rejects unsupported photo types before upload',async t=> {
  const app=await fixture(t),member=app.client();await member.register('validation_member');
  const ui=await browser(t,app.base,{cookie:member.cookie});ui.$('#new-report').click();
  const fields=ui.$('#create-report').elements;
  fields.title.value='Water leak on public path';fields.location.value='Garden entrance';fields.description.value='A pipe is leaking water on the public footpath.';fields.latitude.value='36.19';
  ui.submit('#create-report');assert.match(ui.$('#create-message').textContent,/both valid latitude/);
  const file=new ui.w.File(['<svg/>'],'untrusted.svg',{type:'image/svg+xml'});
  Object.defineProperty(fields.photo,'files',{value:[file],configurable:true});fields.photo.dispatchEvent(new ui.w.Event('change'));
  await until(()=>ui.$('#create-message').textContent.includes('valid JPEG'),'photo validation');
  assert.equal(fields.photo.checkValidity(),false);assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM reports').get().n,0);
});
