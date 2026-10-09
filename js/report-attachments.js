(() => {
  const input=document.querySelector('#create-report [name=photo]'),host=document.querySelector('#attachment-previews');
  const tr=text=>window.I18N?.text(text)||text;
  let files=[],urls=[],normalizePhoto;
  function render(){
    urls.forEach(url=>URL.revokeObjectURL(url));urls=[];host.replaceChildren();
    files.forEach((file,index)=>{const card=document.createElement('figure'),media=document.createElement(file.type.startsWith('video/')?'video':'img'),remove=document.createElement('button'),caption=document.createElement('figcaption');
      const url=URL.createObjectURL(file);urls.push(url);media.src=url;if(media.tagName==='VIDEO'){media.controls=true;media.preload='metadata';media.playsInline=true;}else media.alt=tr('Problem attachment');
      caption.textContent=`${index+1} / 3`;remove.type='button';remove.className='outline-button';remove.textContent=tr('Remove attachment');remove.addEventListener('click',()=>{files.splice(index,1);input.value='';input.setCustomValidity('');render();});card.append(media,caption,remove);host.append(card);
    });
  }
  function validate(file){return file.size>0&&(['image/jpeg','image/png','image/webp'].includes(file.type)?file.size<=3*1024*1024:['video/mp4','video/webm'].includes(file.type)&&file.size<=15*1024*1024);}
  function read(file){return new Promise((done,reject)=>{const reader=new FileReader();reader.onload=()=>done(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('invalid_attachments'));reader.readAsDataURL(file);});}
  input.addEventListener('change',()=>{
    const added=[...input.files];
    if(added.some(file=>!validate(file))){input.setCustomValidity(tr('Use up to three photos (3 MB each) or MP4/WebM videos (15 MB each).'));input.reportValidity();return;}
    const merged=[...files];for(const file of added)if(!merged.some(old=>old.name===file.name&&old.size===file.size&&old.lastModified===file.lastModified))merged.push(file);
    if(merged.length>3){input.setCustomValidity(tr('You can attach up to three files in total.'));input.reportValidity();return;}
    files=merged;input.setCustomValidity('');input.value='';render();
  });
  function clear(){files=[];input.value='';input.setCustomValidity('');render();}
  document.querySelector('#create-report').addEventListener('reset',clear);
  window.addEventListener('site:language',render);
  window.ReportAttachments={init:fn=>{normalizePhoto=fn;},clear,async payload(){const selected=[...files];return Promise.all(selected.map(file=>file.type.startsWith('image/')?normalizePhoto(file):read(file).then(data=>({mime:file.type,data}))));},get count(){return files.length;}};
})();
