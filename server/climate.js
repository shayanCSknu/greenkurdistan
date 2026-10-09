const { createHash } = require('node:crypto');
const { mkdir, readFile, writeFile, rename } = require('node:fs/promises');
const { join, resolve } = require('node:path');
const CITIES = {
  erbil: { latitude:36.19,longitude:44.01 }, sulaymaniyah:{latitude:35.56,longitude:45.43},
  duhok:{latitude:36.86,longitude:42.99},halabja:{latitude:35.18,longitude:45.98},shaqlawa:{latitude:36.40,longitude:44.32}
};
const HADCRUT = 'https://www.metoffice.gov.uk/hadobs/hadcrut5/data/HadCRUT.5.2.0.0/analysis/diagnostics/HadCRUT.5.2.0.0.analysis.summary_series.global.';
const SOURCES = {
  global: { name:'HadCRUT5 5.2.0.0 — Met Office Hadley Centre / Climatic Research Unit', documentation:'https://www.metoffice.gov.uk/hadobs/hadcrut5/', license:'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/', baseline:'1961–1990', earliest:'1850-01-01', kind:'global_analysis', resolution:'global', timezone:'UTC' },
  weather: { name:'ERA5 — ECMWF / Copernicus, via Open-Meteo', documentation:'https://open-meteo.com/en/docs/historical-weather-api', license:'https://open-meteo.com/en/licence', earliest:'1940-01-01', kind:'reanalysis', resolution:'0.25° (~25 km)', timezone:'Asia/Baghdad' },
  air: { name:'CAMS Global atmospheric composition forecasts, via Open-Meteo', documentation:'https://open-meteo.com/en/docs/air-quality-api', license:'https://open-meteo.com/en/licence', earliest:'2022-08-01', kind:'archived_model', resolution:'0.4° (~45 km); native 3-hourly, API hourly', timezone:'Asia/Baghdad' }
};
const WEATHER = ['temperature_2m_mean','temperature_2m_min','temperature_2m_max','precipitation_sum','relative_humidity_2m_mean','wind_speed_10m_max'];
const AIR = ['pm2_5','pm10','nitrogen_dioxide','ozone','sulphur_dioxide','carbon_monoxide','us_aqi'];
const fail = (status, code) => { const error = new Error(code); error.status = status; error.code = code; throw error; };
const numeric = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
function parseHadcrut(csv, interval) {
  const lines = csv.trim().split(/\r?\n/);
  if (!lines[0].startsWith('Time,Anomaly (deg C),Lower confidence limit')) fail(502,'source_invalid');
  const rows = lines.slice(1).map(line=> {
    const [time,...values]=line.split(',');
    if (!(interval === 'annual' ? /^\d{4}$/ : /^\d{4}-\d{2}$/).test(time)) fail(502,'source_invalid');
    const parsed = values.map(v => v?.trim() && Number.isFinite(Number(v)) ? Number(v) : null);
    return {time,anomaly:parsed[0]??null,lower:parsed[1]??null,upper:parsed[2]??null};
  });
  if (!rows.length) fail(502,'source_invalid');
  return rows;
}
function parseMeteo(data, dataset) {
  const keys=dataset==='weather'?WEATHER:AIR, group=dataset==='weather'?'daily':'hourly';
  const block=data[group], units=data[group+'_units'];
  if (!Array.isArray(block?.time) || !block.time.length || !units || keys.some(key=>!Array.isArray(block[key])||block[key].length!==block.time.length)) fail(502,'source_invalid');
  const pattern=dataset==='weather'?/^\d{4}-\d{2}-\d{2}$/:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  const rows=block.time.map((time,i)=> {
    if (typeof time!=='string'||!pattern.test(time)) fail(502,'source_invalid');
    return {time,...Object.fromEntries(keys.map(key=>[key,numeric(block[key][i])]))};
  });
  return {rows,units:Object.fromEntries(keys.map(key=>[key,units[key]])),grid:{latitude:numeric(data.latitude),longitude:numeric(data.longitude),elevation:numeric(data.elevation)}};
}
function createClimateService({ fetcher=fetch, cacheDir=resolve(__dirname,'../.cache/climate'), clock=()=>new Date() }={}) {
  const pending=new Map();
  async function source(url,format,ttl,timeout=25000) {
    const file=join(cacheDir,createHash('sha256').update(url).digest('hex')+'.json');
    let cached;
    try { cached=JSON.parse(await readFile(file,'utf8')); if(cached.url!==url||!cached.fetchedAt)cached=null; } catch {}
    const age=cached?clock().getTime()-Date.parse(cached.fetchedAt):Infinity;
    if(cached&&age>=0&&age<ttl) return {...cached,stale:false};
    if(pending.has(url))return pending.get(url);
    const work=(async()=> {
      try {
        const response=await fetcher(url,{signal:AbortSignal.timeout(timeout),headers:{Accept:format==='csv'?'text/csv':'application/json'}});
        if(!response.ok)throw new Error('source_unavailable');
        const raw=await response.text();
        if(raw.length>15*1024*1024)throw new Error('source_invalid');
        const data=format==='csv'?raw:JSON.parse(raw);
        // Validate before replacing a previously good cache entry.
        if(format==='csv')parseHadcrut(data,url.includes('.annual.')?'annual':'monthly');
        else parseMeteo(data,url.includes('/v1/archive')?'weather':'air');
        const result={url,fetchedAt:clock().toISOString(),data};
        await mkdir(cacheDir,{recursive:true});
        const temporary=file+'.tmp';await writeFile(temporary,JSON.stringify(result));await rename(temporary,file);
        return {...result,stale:false};
      } catch {
        if(cached)return {...cached,stale:true};
        fail(502,'source_unavailable');
      } finally {pending.delete(url);}
    })();
    pending.set(url,work);return work;
  }
  async function history(params) {
    const dataset=params.get('dataset')||'global';
    if(!SOURCES[dataset])fail(400,'invalid_dataset');
    const sourceInfo=SOURCES[dataset], today=clock().toISOString().slice(0,10);
    if(dataset==='global') {
      const interval=params.get('interval')||'annual';if(!['annual','monthly'].includes(interval))fail(400,'invalid_interval');
      const start=Number(params.get('start')||1900),end=Number(params.get('end')||clock().getUTCFullYear());
      if(!Number.isInteger(start)||!Number.isInteger(end)||start<1850||end>clock().getUTCFullYear()||end<start)fail(400,'invalid_range');
      let result;
      try { result=await source(HADCRUT+interval+'.csv','csv',24*3600000,12000); }
      catch {
        // The same official dataset is served by the Hadley Centre host.
        const alternate=(HADCRUT+interval+'.csv').replace('www.metoffice.gov.uk/hadobs','hadleyserver.metoffice.gov.uk');
        result=await source(alternate,'csv',24*3600000,12000);
      }
      const all=parseHadcrut(result.data,interval);
      // Never label a part-year average as a complete annual observation.
      const rows=all.filter(row=>Number(row.time.slice(0,4))>=start&&Number(row.time.slice(0,4))<=end&& (interval!=='annual'||Number(row.time)<clock().getUTCFullYear()) && row.time<=today);
      return {dataset,interval,source:{...sourceInfo,url:result.url},fetchedAt:result.fetchedAt,stale:result.stale,rows,units:{anomaly:'°C',lower:'°C',upper:'°C'},requested:{start,end},availableThrough:all.filter(row=>row.time<=today&&(interval!=='annual'||Number(row.time)<clock().getUTCFullYear())).at(-1)?.time||null};
    }
    const city=params.get('city')||'erbil';if(!CITIES[city])fail(400,'invalid_city');
    const start=params.get('start'),end=params.get('end');
    const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
    if(!validDate(start)||!validDate(end)||end<start)fail(400,'invalid_range');
    const latest=new Date(clock().getTime()-(dataset==='weather'?5:1)*86400000).toISOString().slice(0,10);
    if(start<sourceInfo.earliest||end>latest)fail(400,'outside_coverage');
    const maxDays=dataset==='weather'?3660:366;
    if((Date.parse(end)-Date.parse(start))/86400000+1>maxDays)fail(400,'range_too_large');
    const coordinates=CITIES[city];
    const query=new URLSearchParams({...coordinates,start_date:start,end_date:end,timezone:'Asia/Baghdad'});
    let url;
    if(dataset==='weather'){query.set('models','era5');query.set('daily',WEATHER.join(','));url='https://archive-api.open-meteo.com/v1/archive?'+query;}
    else {query.set('domains','cams_global');query.set('hourly',AIR.join(','));url='https://air-quality-api.open-meteo.com/v1/air-quality?'+query;}
    const result=await source(url,'json',6*3600000), parsed=parseMeteo(result.data,dataset);
    return {dataset,interval:dataset==='weather'?'daily':'hourly',city,source:{...sourceInfo,url},fetchedAt:result.fetchedAt,stale:result.stale,...parsed,requested:{start,end,...coordinates},availableThrough:parsed.rows.at(-1)?.time||null};
  }
  return {history};
}
module.exports={createClimateService,parseHadcrut,parseMeteo,CITIES,WEATHER,AIR,SOURCES};
