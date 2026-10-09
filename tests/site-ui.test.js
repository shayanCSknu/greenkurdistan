const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { fixture } = require('./report-helpers');
const { WEATHER, AIR } = require('../server/climate');
test('expanded city history uses shared coordinates and each city timezone across four countries',async t=>{
  const cities=require('../js/vendor/kurdistan-cities');assert.equal(Object.keys(cities).length,44);
  const app=await fixture(t,{climateOptions:{fetcher:sourceFixture}}),client=app.client();
  for(const key of ['zakho','van','sanandaj','qamishli']){
    const result=await client.request('/api/climate/history?dataset=weather&city='+key+'&start=2025-01-01&end=2025-01-02');assert.equal(result.status,200,key);
    const url=new URL(result.data.source.url);assert.equal(Number(url.searchParams.get('latitude')),cities[key].lat);assert.equal(Number(url.searchParams.get('longitude')),cities[key].lon);assert.equal(url.searchParams.get('timezone'),cities[key].timezone);assert.equal(result.data.source.timezone,cities[key].timezone);
  }
});

// Deterministic fixtures are used only in tests; production always fetches source records.
async function sourceFixture(url) {
  if (url.includes('metoffice')) {
    const monthly = url.includes('.monthly.');
    const rows = monthly ? ['2025-01,1,0.9,1.1','2025-02,,0.8,1.2'] :
      Array.from({length:127}, (_,i) => `${1900+i},${i/100},${i/100-0.1},${i/100+0.1}`);
    return new Response('Time,Anomaly (deg C),Lower confidence limit (2.5%),Upper confidence limit (97.5%)\n'+rows.join('\n'));
  }
  const weather = url.includes('/v1/archive'), group = weather ? 'daily' : 'hourly', keys = weather ? WEATHER : AIR;
  return Response.json({latitude:36.25,longitude:44,elevation:434,
    [group]:{time:weather?['2025-01-01','2025-01-02']:['2025-01-01T00:00','2025-01-01T01:00'],...Object.fromEntries(keys.map(key=>[key,[12,null]]))},
    [group+'_units']:Object.fromEntries(keys.map(key=>[key,'test unit']))});
}
async function until(check, label) {
  const deadline = Date.now()+5000;
  while (Date.now()<deadline) { if (check()) return; await new Promise(done=>setTimeout(done,10)); }
  throw Error('Timed out: '+label);
}
async function browser(t, app, page, {root='.', offline=false}={}) {
  const errors=[], console=new VirtualConsole(); console.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(readFileSync(resolve(root,page),'utf8'),{url:app.base+'/'+page,runScripts:'outside-only',virtualConsole:console,pretendToBeVisual:true});
  const w=dom.window;
  w.SVGSVGElement.prototype.createSVGRect=function(){return {};};
  const mapHost=w.document.querySelector('#kurdistan-map');
  if(mapHost){Object.defineProperty(mapHost,'clientWidth',{value:700});Object.defineProperty(mapHost,'clientHeight',{value:450});}
  w.AbortController=global.AbortController;
  w.fetch=async (path,options)=> {
    if (offline) throw new w.TypeError('Offline');
    const url=new URL(path,app.base);
    if (url.origin===new URL(app.base).origin) return fetch(url,options);
    if (url.hostname==='api.open-meteo.com') return Response.json({current:{temperature_2m:24,weather_code:0},daily:{time:['2025-01-01'],temperature_2m_min:[null],temperature_2m_max:[30]}});
    if (url.hostname==='air-quality-api.open-meteo.com') return Response.json({current:{us_aqi:null}});
    throw new w.TypeError('Unknown source');
  };
  t.after(()=>{w.close();assert.deepEqual(errors,[],'no DOM runtime errors on '+page);});
  for (const script of w.document.querySelectorAll('script[src]')) {
    if (script.src.startsWith(app.base)) w.eval(readFileSync(resolve(root,script.getAttribute('src')),'utf8'));
  }
  return { w, $: selector=>w.document.querySelector(selector) };
}

test('every source and production page has all local scripts, styles, images and navigation targets',()=>{
  for (const root of ['.','dist']) for (const page of ['index','weather','climate','actions','toolkit','impact','reports','404']) {
    const dom=new JSDOM(readFileSync(resolve(root,page+'.html'),'utf8'),{url:'http://localhost:3000/'+page+'.html'});
    for(const node of dom.window.document.querySelectorAll('[src],[href]')) {
      const path=node.getAttribute('src')||node.getAttribute('href');
      if (!path || path.startsWith('#') || /^(https?:|mailto:|data:)/.test(path)) continue;
      assert.ok(existsSync(resolve(root,path.split(/[?#]/)[0])),root+'/'+page+': '+path);
    }
    dom.window.close();
  }
  const sw=readFileSync('sw.js','utf8');
  for (const path of ['js/climate-history.js','css/history.css','js/site-runtime.js']) assert.ok(sw.includes(path),'offline shell includes '+path);
});

test('production climate page loads records, draws chart, paginates, switches datasets and exports CSV',async t=>{
  const app=await fixture(t,{root:resolve('dist'),climateOptions:{fetcher:sourceFixture}});
  const ui=await browser(t,app,'climate.html',{root:'dist'});
  await until(()=>!ui.$('#history-results').hidden,'initial history');
  assert.match(ui.$('#history-message').textContent,/Loaded 126/);
  assert.match(ui.$('#history-scope-title').textContent,/Worldwide/);
  assert.ok(ui.$('#history-chart path').getAttribute('d').length>100);
  assert.equal(ui.$('#history-table tbody').rows.length,30);
  ui.$('#history-next').click(); assert.match(ui.$('#history-page').textContent,/Page 2/);
  ui.$('#history-previous').click(); assert.match(ui.$('#history-page').textContent,/Page 1/);
  ui.$('#history-variable').value='upper';ui.$('#history-variable').dispatchEvent(new ui.w.Event('change'));
  assert.match(ui.$('#history-chart').getAttribute('aria-label'),/Historical/);
  let csv,download;
  ui.w.URL.createObjectURL=blob=>{csv=blob;return 'blob:test';}; ui.w.URL.revokeObjectURL=()=>{};
  ui.w.HTMLAnchorElement.prototype.click=function(){download=this.download;};
  ui.$('#history-download').click();assert.ok(csv.size>1000);assert.match(download,/global/);
  for (const dataset of ['weather','air']) {
    ui.$('#history-dataset').value=dataset;ui.$('#history-dataset').dispatchEvent(new ui.w.Event('change'));
    ui.$('#history-start').value='2025-01-01';ui.$('#history-end').value='2025-01-02';
    ui.$('#history-form').dispatchEvent(new ui.w.Event('submit',{cancelable:true}));
    await until(()=>!ui.$('#history-results').hidden,dataset+' results');
    assert.equal(ui.$('#history-table tbody').rows.length,2);
    assert.match(ui.$('#history-table tbody').textContent,/Missing/);
    assert.match(ui.$('#history-source').textContent,/Erbil/);
  }
  ui.$('[data-history-dataset="weather"]').click();
  await until(()=>!ui.$('#history-results').hidden,'local shortcut loads automatically');
  assert.match(ui.$('#history-scope-title').textContent,/Local.*Erbil/);
  assert.equal(ui.$('#history-city-label').hidden,false);
  ui.$('#history-city').value='sulaymaniyah';ui.$('#history-city').dispatchEvent(new ui.w.Event('change'));
  await until(()=>!ui.$('#history-results').hidden,'city selection reloads');
  assert.match(ui.$('#history-scope-title').textContent,/Sulaymaniyah/);
  ui.$('[data-history-dataset="global"]').click();
  await until(()=>!ui.$('#history-results').hidden,'global shortcut loads automatically');
  assert.match(ui.$('#history-scope-title').textContent,/Worldwide/);
  assert.equal(ui.$('#history-city-label').hidden,true);
});

test('climate UI explains connection failure without local setup links and retries with source validation errors',async t=>{
  const app=await fixture(t,{climateOptions:{fetcher:sourceFixture}});
  const ui=await browser(t,app,'climate.html',{offline:true});
  await until(()=>ui.$('#history-message').textContent.includes('server is unavailable'),'offline message');
  assert.equal(ui.$('#server-help'),null);
  assert.doesNotMatch(ui.$('#history-message').textContent,/Start Website|localhost|npm/);
  assert.ok(ui.$('#history-results').hidden);
  ui.w.fetch=async()=>Response.json({error:'outside_coverage'},{status:400});
  ui.$('#history-form').dispatchEvent(new ui.w.Event('submit',{cancelable:true}));
  await until(()=>ui.$('#history-message').textContent.includes('outside the source coverage'),'validation error');
});

test('climate API uses official fallback, omits incomplete annual years and labels stale cached data',async t=>{
  let offline=false, date=new Date('2026-10-09T00:00:00Z'), requests=[];
  const app=await fixture(t,{climateOptions:{clock:()=>date,fetcher:async url=>{
    requests.push(url); if(offline||url.includes('www.metoffice'))throw Error('Connection failed');return sourceFixture(url);
  }}});
  const path='/api/climate/history?dataset=global&start=1900&end=2026';
  let response=await app.client().request(path);
  assert.equal(response.status,200);assert.equal(response.data.rows.at(-1).time,'2025');assert.equal(response.data.availableThrough,'2025');
  assert.match(response.data.source.url,/hadleyserver.metoffice.gov.uk/);
  assert.equal(response.data.stale,false);assert.equal(requests.length,2);
  offline=true;date=new Date('2026-10-11T00:00:00Z');
  response=await app.client().request(path);
  assert.equal(response.status,200);assert.equal(response.data.stale,true);assert.equal(response.data.rows.length,126);
  response=await app.client().request('/api/climate/history?dataset=weather&start=1900-01-01&end=1900-01-02');
  assert.equal(response.status,400);assert.equal(response.data.error,'outside_coverage');
});

test('all interactive pages initialize; calculators explain missing inputs and refresh results',async t=>{
  const app=await fixture(t);
  for (const page of ['index.html','weather.html','actions.html','toolkit.html','impact.html']) {
    const ui=await browser(t,app,page,{root:'dist'});
    if(page==='toolkit.html') {
      assert.match(ui.$('#carbon-message').textContent,/emission factors/);
      for(const key of ['car','bus','electricity','plastic'])ui.$('#factor-'+key).value='1';
      ui.$('#factor-source').value='Test fixture';ui.$('#factor-source').dispatchEvent(new ui.w.Event('input'));
      assert.equal(ui.$('#carbon-value').textContent,'22.00');
      assert.ok(ui.$('#quiz-options button'));
      assert.equal(ui.$('#recycle-search'),null);
      assert.equal(ui.$('.recycle'),null);
    }
    if(page==='impact.html') {
      ui.$('#water-calculate').click();assert.equal(ui.$('#water-result').textContent,'--');
      assert.match(ui.$('#water-message').textContent,/Enter your measured/);
      ui.$('#water-flow').value='4';ui.$('#water-shower-minutes').value='3';ui.$('#water-flow').dispatchEvent(new ui.w.Event('input'));
      assert.equal(ui.$('#water-result').textContent,'164');
      ui.$('#new-mission').click();ui.$('#mission-done').click();assert.equal(ui.$('#dashboard-actions').textContent,'1');
    }
    if(page==='weather.html') {
      await until(()=>ui.$('#temperature').textContent==='24','weather');
      assert.match(ui.$('#forecast-list').textContent,/--° \/ 30°/);
    }
  }
});
