const {test}=require('node:test');const assert=require('node:assert/strict');const {readFileSync}=require('node:fs');const {resolve}=require('node:path');const {JSDOM,VirtualConsole}=require('jsdom');
async function until(check,label){const end=Date.now()+5000;while(Date.now()<end){if(check())return;await new Promise(done=>setTimeout(done,10));}throw Error('Timed out: '+label);}
async function browser(t,page,{root='dist',language='en',offline=false}={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',value=>errors.push(value.message));
 const dom=new JSDOM(readFileSync(resolve(root,page),'utf8'),{url:'http://localhost:3000/'+page,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});const w=dom.window;
 t.after(()=>{w.close();assert.deepEqual(errors,[],'no DOM runtime errors on '+page);});
 w.localStorage.setItem('greenKurdistanLanguage',language);w.AbortController=global.AbortController;w.SVGSVGElement.prototype.createSVGRect=function(){return {};};
 const host=w.document.querySelector('#kurdistan-map');if(host){Object.defineProperty(host,'clientWidth',{value:700});Object.defineProperty(host,'clientHeight',{value:450});}
 const requests=[];w.fetch=async(path)=>{
  requests.push(String(path));const url=new URL(path,w.location.href);
  if(url.hostname==='api.open-meteo.com'){if(offline)throw new w.TypeError('Offline');return Response.json({current:{temperature_2m:Number(url.searchParams.get('latitude')),weather_code:0},daily:{}});}
  if(url.hostname==='air-quality-api.open-meteo.com'){if(offline)throw new w.TypeError('Offline');return Response.json({current:{us_aqi:71}});}
  if(url.pathname==='/api/session')return Response.json({user:null});
  if(url.pathname==='/api/reports')return Response.json({reports:[],total:0,page:1,pages:0});
  if(url.pathname==='/api/stats')return Response.json({counts:[],areas:[],categories:[],pending:null});
  if(url.pathname==='/api/climate/history')return Response.json({dataset:'global',interval:'annual',rows:[{time:'2025',anomaly:1}],units:{anomaly:'C'},source:{name:'Test fixture',kind:'global_analysis',resolution:'global',timezone:'UTC',documentation:'https://example.test/docs',url:'https://example.test/data',license:'https://example.test/license'},fetchedAt:'2026-10-09T00:00:00Z',availableThrough:'2025',stale:false});
  throw new w.TypeError('Unknown endpoint: '+path);
 };
 for(const script of w.document.querySelectorAll('script[src]'))w.eval(readFileSync(resolve(root,script.getAttribute('src')),'utf8'));
 await new Promise(done=>setTimeout(done,30));return {w,$:selector=>w.document.querySelector(selector),requests};
}

test('header language selector translates every page, navigation, titles and dynamic tools in both directions',async t=>{
 for(const root of ['.','dist'])for(const page of ['index.html','weather.html','climate.html','actions.html','toolkit.html','impact.html','reports.html','404.html']){
  const ui=await browser(t,page,{root});const originalHeading=ui.$('h1').textContent,originalTitle=ui.w.document.title;
  assert.equal(ui.w.document.querySelectorAll('#language').length,1);
  assert.equal(ui.$('#language').closest('.site-language').nextElementSibling.id,'theme-toggle');
  for(const [language,weatherLabel,direction]of [['ar','الطقس','rtl'],['ku','کەشوهەوا','rtl'],['en','Weather','ltr']]){
   ui.$('#language').value=language;ui.$('#language').dispatchEvent(new ui.w.Event('change'));await new Promise(done=>setTimeout(done,0));
   assert.equal(ui.w.document.documentElement.dir,direction);assert.equal(ui.w.localStorage.getItem('greenKurdistanLanguage'),language);assert.equal(ui.w.localStorage.getItem('greenReportLanguage'),language);
   if(page!=='404.html')assert.equal(ui.$('.main-nav a[href="weather.html"]').textContent,weatherLabel);
   if(language!=='en'){assert.notEqual(ui.$('h1').textContent,originalHeading);assert.notEqual(ui.w.document.title,originalTitle);}
   else{assert.equal(ui.$('h1').textContent,originalHeading);assert.equal(ui.w.document.title,originalTitle);}
   if(page==='toolkit.html'&&language==='ar'){
    assert.match(ui.$('#quiz-question').textContent,/الماء/);ui.$('#quiz-options button').click();await until(()=>!ui.$('#quiz-feedback').textContent.includes('answer is'),'translated quiz feedback');
    assert.ok(!ui.$('#carbon-message').textContent.includes('Enter all four'));
   }
   if(page==='climate.html'&&language==='ku')assert.ok(!ui.$('#history-variable').textContent.includes('Temperature anomaly'));
  }
 }
});

test('saved site language is applied on a different tab including reporting and map controls',async t=>{
 const source=await browser(t,'index.html');source.w.I18N.set('ar');
 for(const page of ['toolkit.html','reports.html','impact.html','climate.html']){
  const ui=await browser(t,page,{language:source.w.localStorage.getItem('greenKurdistanLanguage')});
  assert.equal(ui.$('#language').value,'ar');assert.equal(ui.w.document.documentElement.lang,'ar');assert.equal(ui.$('.main-nav a[href="index.html"]').textContent,'الرئيسية');
  if(page==='reports.html')assert.equal(ui.$('#new-report').textContent,'الإبلاغ عن مشكلة');
  if(page==='impact.html')assert.equal(ui.$('#map-city-select option[value="erbil"]').textContent,'أربيل');
 }
});

test('bundled regional map draws geography, selects cities, handles blocked street tiles and remains usable offline',async t=>{
 const ui=await browser(t,'impact.html');assert.ok(ui.w.GreenMap.map);
 assert.equal(ui.w.document.querySelectorAll('.leaflet-marker-icon').length,5);assert.equal(ui.$('.leaflet-overlay-pane svg path'),null,'regional fill must not cover street tiles');
 assert.equal(ui.$('#map-view').value,'streets');assert.ok(ui.$('.leaflet-tile'),'street tiles load by default');assert.equal(ui.w.GreenMap.map.getZoom(),16);
 ui.$('.leaflet-marker-icon[title="Duhok"]').dispatchEvent(new ui.w.MouseEvent('click',{bubbles:true,view:ui.w}));
 await until(()=>ui.$('#map-temp').textContent.includes('36.86'),'Duhok live conditions');assert.equal(ui.$('#map-city-select').value,'duhok');assert.match(ui.$('#map-external').href,/42.99/);
 ui.$('#map-view').value='streets';ui.$('#map-view').dispatchEvent(new ui.w.Event('change'));assert.ok(ui.$('.leaflet-tile'));
 assert.equal(ui.$('.leaflet-tile').referrerPolicy,'strict-origin-when-cross-origin');
 ui.$('.leaflet-tile').dispatchEvent(new ui.w.Event('error'));assert.equal(ui.$('#map-view').value,'overview');assert.match(ui.$('#map-message').textContent,/could not load/);assert.equal(ui.w.document.querySelectorAll('.leaflet-marker-icon').length,5);
 ui.$('#map-city-select').value='halabja';ui.$('#map-city-select').dispatchEvent(new ui.w.Event('change'));
 await until(()=>ui.$('#map-temp').textContent.includes('35.18'),'Halabja after fallback');ui.$('#map-reset').click();assert.ok(ui.w.GreenMap.map.getZoom()<=8);
 const offline=await browser(t,'impact.html',{offline:true});offline.$('.leaflet-tile').dispatchEvent(new offline.w.Event('error'));assert.ok(offline.$('.leaflet-overlay-pane svg path'));assert.equal(offline.$('#map-aqi-label').textContent,'Unavailable');
 offline.$('#map-city-select').value='shaqlawa';offline.$('#map-city-select').dispatchEvent(new offline.w.Event('change'));await until(()=>offline.$('#map-city').textContent==='Shaqlawa','offline city selection');
 assert.equal(offline.$('#map-temp').textContent,'--');assert.equal(offline.w.document.querySelectorAll('.leaflet-marker-icon').length,5);
});
