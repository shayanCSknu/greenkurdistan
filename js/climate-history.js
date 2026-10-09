(() => {
  const $=s=>document.querySelector(s), tr=(text,values={})=>window.I18N?.text(text,values)||text.replace(/\{(\w+)\}/g,(_,key)=>values[key]??'');
  const names={anomaly:'Temperature anomaly',lower:'Lower 95% confidence limit',upper:'Upper 95% confidence limit',temperature_2m_mean:'Mean temperature',temperature_2m_min:'Minimum temperature',temperature_2m_max:'Maximum temperature',precipitation_sum:'Precipitation',relative_humidity_2m_mean:'Mean relative humidity',wind_speed_10m_max:'Maximum wind speed',pm2_5:'PM2.5',pm10:'PM10',nitrogen_dioxide:'Nitrogen dioxide',ozone:'Ozone',sulphur_dioxide:'Sulphur dioxide',carbon_monoxide:'Carbon monoxide',us_aqi:'US AQI'};
  let result=null,page=1,request=0,controller=null,statusText='',statusValues={};
  const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
  function status(text,values={},error=false){statusText=text;statusValues=values;$('#history-message').textContent=tr(text,values);$('#history-message').classList.toggle('history-error',error);}
  function configure(){
    const dataset=$('#history-dataset').value,global=dataset==='global';
    $('#history-city-label').hidden=global;$('#history-interval-label').hidden=!global;
    const start=$('#history-start'),end=$('#history-end'),date=new Date();
    if(global){start.type=end.type='number';start.min=end.min='1850';start.max=end.max=String(date.getUTCFullYear());start.value='1900';end.value=String(date.getUTCFullYear());}
    else {start.type=end.type='date';const latest=new Date(date.getTime()-(dataset==='weather'?5:1)*86400000);start.min=end.min=dataset==='weather'?'1940-01-01':'2022-08-01';start.max=end.max=latest.toISOString().slice(0,10);end.value=end.max;start.value=new Date(latest.getTime()-(dataset==='weather'?364:29)*86400000).toISOString().slice(0,10);}
    updateHint();
  }
  function updateHint(){
    const dataset=$('#history-dataset').value;
    document.querySelectorAll('[data-history-dataset]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.historyDataset===dataset)));
    $('#history-range-hint').textContent=tr(dataset==='global'?'Annual records exclude the unfinished current year. Monthly records show the latest published month.':dataset==='weather'?'Choose up to 10 years per request, from 1940 through the latest available ERA5 days.':'Choose up to one year per request, from August 2022 through yesterday. Missing source values stay missing.');
  }
  function render(){
    updateHint();$('#history-message').textContent=tr(statusText,statusValues);
    if(!result)return;
    const city=result.city?$('#history-city option[value="'+result.city+'"]').textContent:'';
    $('#history-scope-title').textContent=result.dataset==='global'?tr('Global temperature history · Worldwide'):result.dataset==='weather'?tr('Local temperature and weather history')+' · '+city:tr('Local air-quality history')+' · '+city;
    const keys=Object.keys(result.units),select=$('#history-variable'),old=select.value;
    select.replaceChildren(...keys.map(key=>{const node=el('option',tr(names[key]||key));node.value=key;return node;}));
    if(keys.includes(old))select.value=old;
    const key=select.value,unit=result.units[key],valid=result.rows.filter(row=>typeof row[key]==='number'),summary=$('#history-summary');summary.replaceChildren();
    for(const [label,value] of [['Available values',valid.length],['Missing values',result.rows.length-valid.length],['Latest available value',valid.length?`${valid.at(-1)[key]} ${unit} · ${valid.at(-1).time}`:tr('Unavailable')]]){const card=el('article');card.append(el('strong',String(value)),el('span',tr(label)));summary.append(card);}
    draw(key);table(keys);provenance();
  }
  function draw(key){
    const svg=$('#history-chart');svg.replaceChildren();svg.setAttribute('aria-label',tr('Historical data chart'));
    const node=(name,attrs,text)=>{const x=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [key,value]of Object.entries(attrs))x.setAttribute(key,value);if(text!==undefined)x.textContent=text;svg.append(x);return x;};
    const rows=result.rows,values=rows.map(r=>r[key]).filter(v=>typeof v==='number');
    if(!values.length){node('text',{x:40,y:160},tr('No source values for this selection.'));return;}
    let min=Math.min(...values),max=Math.max(...values);if(min===max){min-=1;max+=1;}const pad=(max-min)*.08;min-=pad;max+=pad;
    const timestamp=row=>Date.parse(row.time.length===4?row.time+'-01-01T00:00Z':row.time.length===7?row.time+'-01T00:00Z':row.time.length===10?row.time+'T00:00Z':row.time+'Z');
    const first=timestamp(rows[0]),last=timestamp(rows.at(-1));
    const x=row=>75+(timestamp(row)-first)/Math.max(last-first,1)*885,y=value=>275-(value-min)/(max-min)*240;
    for(let i=0;i<5;i++){const value=min+(max-min)*i/4;node('line',{x1:75,x2:960,y1:y(value),y2:y(value),class:'grid-line'});node('text',{x:65,y:y(value)+4,'text-anchor':'end'},value.toFixed(2));}
    node('text',{x:75,y:20},`${tr(names[key])} (${result.units[key]})`);node('text',{x:75,y:310},rows[0].time);node('text',{x:960,y:310,'text-anchor':'end'},rows.at(-1).time);
    let path='',connected=false,lastTime=null;
    for(const row of rows){
      const current=timestamp(row),expected=result.interval==='hourly'?3600000:result.interval==='daily'?86400000:result.interval==='monthly'?32*86400000:366*86400000;
      if(lastTime!==null&&current-lastTime>expected)connected=false;lastTime=current;
      if(typeof row[key]!=='number'){connected=false;continue;}
      path+=`${connected?'L':'M'}${x(row).toFixed(2)},${y(row[key]).toFixed(2)} `;connected=true;
      if(rows.length<=200){const point=node('circle',{cx:x(row),cy:y(row[key]),r:2.5,class:'data-point'});point.append(el('title',`${row.time}: ${row[key]} ${result.units[key]}`));}
    }
    node('path',{d:path,class:'data-line'});
  }
  function table(keys){
    const header=el('tr');header.append(el('th',tr('Date')),...keys.map(key=>el('th',`${tr(names[key]||key)} (${result.units[key]})`)));$('#history-table thead').replaceChildren(header);
    const body=$('#history-table tbody');body.replaceChildren();for(const row of result.rows.slice((page-1)*30,page*30)){const trNode=el('tr');trNode.append(el('td',row.time),...keys.map(key=>el('td',row[key]===null?tr('Missing'):String(row[key]))));body.append(trNode);}
    const pages=Math.ceil(result.rows.length/30);$('#history-page').textContent=tr('Page {page} of {pages}',{page:pages?page:0,pages});$('#history-previous').disabled=page<=1;$('#history-next').disabled=page>=pages;
  }
  function provenance(){
    const box=$('#history-source');box.replaceChildren();
    const dl=el('dl');
    const entries=[['Provider',result.source.name],['Spatial scope',result.dataset==='global'?tr('Worldwide'):tr($('#history-city option[value="'+result.city+'"]').textContent)],['Data type',tr({global_analysis:'Observation-based statistical analysis',reanalysis:'Model-assisted reanalysis',archived_model:'Archived air-quality model estimates'}[result.source.kind])],['Spatial resolution',result.source.resolution],['Timezone',result.source.timezone],['Retrieved at',result.fetchedAt],['Latest source period',result.availableThrough||tr('Unavailable')],['Cache status',tr(result.stale?'Previously retrieved real data; source refresh failed.':'Source retrieved successfully.')]];
    if(result.source.baseline)entries.push(['Anomaly reference period',result.source.baseline]);
    if(result.grid)entries.push(['Requested coordinates',`${result.requested.latitude}, ${result.requested.longitude}`],['Source grid coordinates',`${result.grid.latitude}, ${result.grid.longitude}`]);
    for(const [key,value]of entries)dl.append(el('dt',tr(key)),el('dd',value));box.append(dl);
    for(const [label,url]of [['Source documentation',result.source.documentation],['Original data request',result.source.url],['Data licence',result.source.license]]){const p=el('p'),a=el('a',tr(label));a.href=url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);box.append(p);}
    box.append(el('p',tr('The displayed precision is not a guarantee of exactness. Source estimates have uncertainty; missing values are never replaced with zero.')));
  }
  async function load(event){
    event?.preventDefault();if(!$('#history-form').reportValidity())return;
    const own=++request;controller?.abort();controller=new AbortController();const activeController=controller;const timer=setTimeout(()=>activeController.abort(),35000);
    const params=new URLSearchParams({dataset:$('#history-dataset').value,city:$('#history-city').value,start:$('#history-start').value,end:$('#history-end').value,interval:$('#history-interval').value});
    result=null;$('#history-results').hidden=true;status('Loading source records…');
    try {const response=await fetch('/api/climate/history?'+params,{signal:activeController.signal,cache:'no-store'});if(!response.headers.get('content-type')?.includes('application/json'))throw Error('api_unavailable');const data=await response.json();if(!response.ok)throw Error(data.error||'source_unavailable');if(own!==request)return;result=data;page=1;$('#history-results').hidden=false;status(data.rows.length?'Loaded {count} source records.':'No source values for this selection.',{count:data.rows.length});render();}
    catch(error){if(own!==request)return;const unavailable=error.message==='api_unavailable'||error instanceof TypeError;if(unavailable)window.GreenRuntime?.showHelp();const text=unavailable?'The website server is unavailable. Start the complete website using Start Website.cmd and try again.':{outside_coverage:'This date range is outside the source coverage. Check the dates above.',range_too_large:'Choose a shorter range: up to 10 years for weather or one year for air quality.',invalid_range:'Enter a valid start and end date.',source_unavailable:'The source is unavailable. No replacement data has been generated. Please try again.'}[error.message]||'The source is unavailable. No replacement data has been generated. Please try again.';status(text,{},true);}
    finally{clearTimeout(timer);}
  }
  $('#history-form').addEventListener('submit',load);$('#history-dataset').addEventListener('change',()=>{configure();load();});
  $('#history-city').addEventListener('change',()=>{if($('#history-dataset').value!=='global')load();});
  document.querySelectorAll('[data-history-dataset]').forEach(button=>button.addEventListener('click',()=>{
    $('#history-dataset').value=button.dataset.historyDataset;configure();load();
  }));
  $('#history-variable').addEventListener('change',render);$('#history-previous').addEventListener('click',()=>{page--;render();});$('#history-next').addEventListener('click',()=>{page++;render();});
  $('#history-download').addEventListener('click',()=>{
    if(!result)return;const keys=Object.keys(result.units);const quote=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
    const metadata=[['provider',result.source.name],['source_url',result.source.url],['fetched_at',result.fetchedAt],['dataset',result.dataset],['city',result.city||'global'],['timezone',result.source.timezone],['baseline',result.source.baseline||''],['stale_cache',result.stale],['missing_values','empty cells; not zero']];
    const text=[...metadata.map(row=>row.map(quote).join(',')),['time',...keys.map(key=>`${key} (${result.units[key]})`)].map(quote).join(','),...result.rows.map(row=>[row.time,...keys.map(key=>row[key])].map(quote).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=url;a.download=`green-kurdistan-${result.dataset}-${result.city||'global'}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const initial=new URLSearchParams(window.location.search);
  if(['global','weather','air'].includes(initial.get('dataset')))$('#history-dataset').value=initial.get('dataset');
  if([...$('#history-city').options].some(option=>option.value===initial.get('city')))$('#history-city').value=initial.get('city');
  window.addEventListener('site:language',render);configure();load();
})();
