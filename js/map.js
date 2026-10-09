(() => {
  const $=selector=>document.querySelector(selector),host=$('#kurdistan-map');if(!host)return;
  const tr=(text,values={})=>window.I18N?.text(text,values)||text.replace(/\{(\w+)\}/g,(_,key)=>values[key]??'');
  const cities={
    erbil:{name:'Erbil',lat:36.19,lon:44.01},sulaymaniyah:{name:'Sulaymaniyah',lat:35.56,lon:45.43},
    duhok:{name:'Duhok',lat:36.86,lon:42.99},halabja:{name:'Halabja',lat:35.18,lon:45.98},shaqlawa:{name:'Shaqlawa',lat:36.40,lon:44.32}
  };
  let map=null,street=null,region=null,markers={},selection='erbil',request=0,controller=null,loading=false,temperature=null,aqi=null;
  let message='Regional overview works without external map tiles. Select a city or drag and zoom the map.';
  const text=(selector,value)=>{$(selector).textContent=value;};
  function render(){
    text('#map-message',tr(message));text('#map-city',tr(cities[selection].name));
    text('#map-temp',loading?'--':Number.isFinite(temperature)?temperature.toLocaleString(window.I18N?.locale||'en')+' °C':'--');
    text('#map-aqi',loading?'--':Number.isFinite(aqi)?aqi.toLocaleString(window.I18N?.locale||'en'):'--');
    text('#map-aqi-label',tr(loading?'Loading':Number.isFinite(aqi)?'Model estimate':'Unavailable'));
    for(const [key,marker] of Object.entries(markers)){
      marker.setTooltipContent(tr(cities[key].name));const element=marker.getElement();
      if(element){element.setAttribute('title',tr(cities[key].name));element.setAttribute('aria-label',tr('Select {city}',{city:tr(cities[key].name)}));}
    }
    if(map){const zoomIn=host.querySelector('.leaflet-control-zoom-in'),zoomOut=host.querySelector('.leaflet-control-zoom-out');
      if(zoomIn){zoomIn.title=tr('Zoom in');zoomIn.setAttribute('aria-label',tr('Zoom in'));}
      if(zoomOut){zoomOut.title=tr('Zoom out');zoomOut.setAttribute('aria-label',tr('Zoom out'));}
    }
  }
  async function selectCity(key,focus=true){
    if(!cities[key])return;selection=key;$('#map-city-select').value=key;
    const city=cities[key];$('#map-external').href=`https://www.openstreetmap.org/?mlat=${city.lat}&mlon=${city.lon}#map=12/${city.lat}/${city.lon}`;
    if(focus&&map)map.setView([city.lat,city.lon],Math.max(map.getZoom(),16));
    const own=++request;controller?.abort();controller=new AbortController();const signal=controller.signal;
    const timer=setTimeout(()=>controller?.signal===signal&&controller.abort(),15000);
    loading=true;temperature=null;aqi=null;render();
    const get=async url=>{const response=await fetch(url,{signal});if(!response.ok)throw Error('Unavailable');return response.json();};
    try{
      const [weather,air]=await Promise.allSettled([
        get(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m`),
        get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi`)
      ]);
      if(own!==request)return;
      temperature=weather.status==='fulfilled'?weather.value.current?.temperature_2m:null;
      aqi=air.status==='fulfilled'?air.value.current?.us_aqi:null;
      loading=false;render();
    }finally{clearTimeout(timer);}
  }
  function overview(reason){
    if(street&&map.hasLayer(street))map.removeLayer(street);
    if(region&&!map.hasLayer(region))region.addTo(map);
    $('#map-view').value='overview';map?.setMaxZoom(10);if(map&&map.getZoom()>10)map.setZoom(10);
    message=reason||'Regional overview works without external map tiles. Select a city or drag and zoom the map.';render();
  }
  if(window.L&&window.REGION_GEOJSON){
    map=L.map(host,{scrollWheelZoom:true,minZoom:3,maxZoom:19,zoomControl:true}).setView([36.19,44.01],16);
    region=L.geoJSON(window.REGION_GEOJSON,{style:{color:'#879e90',weight:1,fillColor:'#e9eee2',fillOpacity:1},interactive:false,
      attribution:'<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> (public domain)'}).addTo(map);
    for(const [key,city]of Object.entries(cities)){
      const icon=L.divIcon({className:'map-city-marker',html:'&#9679;',iconSize:[24,24],iconAnchor:[12,12]});
      markers[key]=L.marker([city.lat,city.lon],{icon,title:tr(city.name),keyboard:true}).addTo(map).bindTooltip(tr(city.name),{permanent:true,direction:key==='erbil'?'left':'right'}).on('click',()=>selectCity(key));
    }
    const fit=()=>map.fitBounds(Object.values(cities).map(city=>[city.lat,city.lon]),{padding:[55,55],maxZoom:8});
    $('#map-reset').addEventListener('click',fit);
    street=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,referrerPolicy:'strict-origin-when-cross-origin',
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'});
    street.on('tileerror',()=>overview('Street maps could not load. The regional overview and city controls remain available.'));
    $('#map-view').addEventListener('change',()=>{
      if($('#map-view').value==='streets'){map.removeLayer(region);map.setMaxZoom(19);street.addTo(map);message='Street map uses OpenStreetMap. Internet access is required.';render();}
      else overview();
    });
    $('#map-view').value='streets';map.removeLayer(region);street.addTo(map);message='Street map uses OpenStreetMap. Internet access is required.';render();
    setTimeout(()=>map.invalidateSize(),0);
  }else{
    message='The map files could not load. Use the city selector below and open the selected city in OpenStreetMap.';
    host.append(document.createTextNode(tr(message)));$('#map-view').disabled=true;$('#map-reset').disabled=true;
  }
  $('#map-city-select').addEventListener('change',event=>selectCity(event.target.value));
  window.addEventListener('site:language',render);
  window.GreenMap={map,selectCity};selectCity(selection,false);
})();
