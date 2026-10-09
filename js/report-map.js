(() => {
  const tr=text=>window.I18N?.text(text)||text;
  const tiles=()=>L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,referrerPolicy:'strict-origin-when-cross-origin',attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'});
  const icon=()=>L.divIcon({className:'report-location-pin',html:'&#9679;',iconSize:[26,26],iconAnchor:[13,13]});
  let picker,marker,detail,statusKey='Click the problem location on the map, or drag its pin.';
  const form=document.querySelector('#create-report');
  const coordinates=()=>{const a=form.elements.latitude.value,b=form.elements.longitude.value;return a!==''&&b!==''&&Number.isFinite(Number(a))&&Number.isFinite(Number(b))&&Math.abs(Number(a))<=90&&Math.abs(Number(b))<=180?[Number(a),Number(b)]:null;};
  function status(text){statusKey=text;const node=document.querySelector('#pin-status');node.textContent=tr(text);}
  function setPin(point,focus=true){
    if(!point)return;
    form.elements.latitude.value=point[0].toFixed(6);form.elements.longitude.value=point[1].toFixed(6);
    if(picker){if(!marker){marker=L.marker(point,{draggable:true,icon:icon(),title:tr('Problem location')}).addTo(picker);marker.on('dragend',()=>{const p=marker.getLatLng();setPin([p.lat,p.lng],false);});}else marker.setLatLng(point);
      if(focus)picker.setView(point,18);}
    status('Exact pin saved in this form. Check that it marks the problem, then submit your report.');
  }
  function attachTiles(map,node){
    const layer=tiles().addTo(map);
    layer.on('tileerror',()=>{const text='Street map unavailable. Check your connection and retry. Your coordinates are still saved.';if(node.id==='pin-status')status(text);else node.textContent=tr(text);});
    return layer;
  }
  function open(){
    if(!window.L){status('Street map unavailable. Check your connection and retry. Your coordinates are still saved.');return;}
    if(!picker){picker=L.map('report-location-map',{scrollWheelZoom:false,maxZoom:19,fadeAnimation:false}).setView([36.19,44.01],15);const layer=attachTiles(picker,document.querySelector('#pin-status'));
      picker.on('click',event=>setPin([event.latlng.lat,event.latlng.lng],false));
      document.querySelector('#pin-center').addEventListener('click',()=>{const p=picker.getCenter();setPin([p.lat,p.lng],false);});
      document.querySelector('#pin-retry').addEventListener('click',()=>{layer.redraw();status('Click the problem location on the map, or drag its pin.');});
    }
    picker.invalidateSize();const point=coordinates();if(point)setPin(point);else {const city=window.KURDISTAN_CITIES?.[form.elements.area.value];if(city)picker.setView([city.lat,city.lon],15);status('Click the problem location on the map, or drag its pin.');}
  }
  function show(container,report){
    detail?.remove();detail=null;
    if(!Number.isFinite(report.latitude)||!Number.isFinite(report.longitude))return;
    const section=document.createElement('section'),heading=document.createElement('h3'),host=document.createElement('div'),note=document.createElement('p'),link=document.createElement('a'),retry=document.createElement('button');
    heading.textContent=tr('Exact problem location');host.className='report-location-map';host.setAttribute('aria-label',tr('Exact problem location'));
    note.textContent=`${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`;note.className='rr-caption';
    link.className='text-link';link.textContent=tr('Directions to this problem');link.href=`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`;link.target='_blank';link.rel='noopener noreferrer';
    retry.type='button';retry.className='outline-button';retry.textContent=tr('Retry map');
    section.append(heading,host,note,retry,link);container.append(section);
    if(window.L){detail=L.map(host,{scrollWheelZoom:false,maxZoom:19,fadeAnimation:false}).setView([report.latitude,report.longitude],18);const layer=attachTiles(detail,note);L.marker([report.latitude,report.longitude],{icon:icon(),title:tr('Problem location')}).addTo(detail);retry.addEventListener('click',()=>layer.redraw());setTimeout(()=>detail?.invalidateSize(),0);}
    else retry.hidden=true;
  }
  for(const field of ['latitude','longitude'])form.elements[field].addEventListener('input',()=>{const point=coordinates();if(point)setPin(point);else if(marker){marker.remove();marker=null;status('Click the problem location on the map, or drag its pin.');}});
  document.querySelector('#pin-clear').addEventListener('click',()=>{form.elements.latitude.value='';form.elements.longitude.value='';marker?.remove();marker=null;status('Click the problem location on the map, or drag its pin.');});
  form.addEventListener('reset',()=>{marker?.remove();marker=null;status('Click the problem location on the map, or drag its pin.');});
  form.elements.area.addEventListener('change',()=>{const city=window.KURDISTAN_CITIES?.[form.elements.area.value];if(picker&&city){picker.setView([city.lat,city.lon],15);status('Click the problem location on the map, or drag its pin.');}});
  window.addEventListener('site:language',()=>{status(statusKey);if(marker)marker.getElement()?.setAttribute('title',tr('Problem location'));});
  window.ReportMap={open,setPin,show,get picker(){return picker;},get marker(){return marker;},get detail(){return detail;}};
})();
