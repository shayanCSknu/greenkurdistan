(() => {
  const languages=['en','ku','ar'], texts=new Map(), patterns=[], textState=new WeakMap(), attributeState=new WeakMap();
  let language='en',scheduled=false;
  try {language=localStorage.getItem('greenKurdistanLanguage')||localStorage.getItem('greenReportLanguage')||'en';}catch{}
  if(!languages.includes(language))language='en';
  for(const value of Object.values(window.RR_TEXT||{}))texts.set(value[0],[value[1],value[2]]);
  for(const [english,value]of Object.entries(window.SITE_TEXT||{}))texts.set(english,value);
  for(const [english,values]of texts){
    if(!english.includes('{'))continue;
    const keys=[];const escaped=english.split(/(\{\w+\})/g).map(part=>{if(/^\{\w+\}$/.test(part)){keys.push(part.slice(1,-1));return '(.+?)';}return part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('');
    patterns.push({regex:new RegExp('^'+escaped+'$'),keys,values});
  }
  function text(original,variables={}){
    if(typeof original!=='string')return String(original??'');
    let translated=language==='en'?original:texts.get(original)?.[language==='ku'?0:1];
    if(translated===undefined){
      for(const pattern of patterns){const match=original.match(pattern.regex);if(match){translated=pattern.values[language==='ku'?0:1];variables={...Object.fromEntries(pattern.keys.map((key,i)=>[key,text(match[i+1])])),...variables};break;}}
    }
    return (translated??original).replace(/\{(\w+)\}/g,(match,key)=>variables[key]??match);
  }
  function ignore(element){return !element||element.closest('script,style,svg,textarea,[data-t],[data-site-skip],#report-list,#report-detail,#account-label,#history-source,#history-table tbody,#history-summary');}
  function translateTextNode(node){
    if(ignore(node.parentElement))return;
    const current=node.textContent;let entry=textState.get(node);
    if(!entry||current!==entry.last)entry={source:current,last:current};
    const trimmed=entry.source.trim();if(!trimmed)return;
    const translated=text(trimmed);const next=entry.source.replace(trimmed,translated);
    entry.last=next;textState.set(node,entry);if(current!==next)node.textContent=next;
  }
  function apply(){
    scheduled=false;
    document.documentElement.lang=language==='ku'?'ckb':language;
    document.documentElement.dir=language==='en'?'ltr':'rtl';
    const select=document.getElementById('language');if(select)select.value=language;
    document.querySelectorAll('[data-t]').forEach(node=>{const source=window.RR_TEXT?.[node.dataset.t]?.[0];if(source){const next=text(source);if(node.textContent!==next)node.textContent=next;}});
    const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
    while(walker.nextNode())translateTextNode(walker.currentNode);
    document.querySelectorAll('[placeholder],[aria-label],[alt]').forEach(node=>{
      if(node.closest('[data-site-skip],#report-detail,#report-list')||node.hasAttribute('data-t-aria')||node.hasAttribute('data-t-alt'))return;
      let state=attributeState.get(node)||{};
      for(const name of ['placeholder','aria-label','alt']){if(!node.hasAttribute(name))continue;const current=node.getAttribute(name);if(!state[name]||current!==state[name].last)state[name]={source:current};const translated=text(state[name].source);state[name].last=translated;if(current!==translated)node.setAttribute(name,translated);}
      attributeState.set(node,state);
    });
  }
  function set(next,persist=true){
    if(!languages.includes(next))return;language=next;
    if(persist)try{localStorage.setItem('greenKurdistanLanguage',next);localStorage.setItem('greenReportLanguage',next);}catch{}
    apply();window.dispatchEvent(new CustomEvent('site:language',{detail:{language}}));
  }
  window.I18N={get language(){return language;},get locale(){return language==='ku'?'ckb-IQ':language==='ar'?'ar-IQ':'en-GB';},text,set,apply};
  const header=document.querySelector('.site-header');
  if(header){
    if(!document.getElementById('language')){
    const control=document.createElement('label');control.className='site-language';
    const label=document.createElement('span');label.textContent='Language';
    const select=document.createElement('select');select.id='language';select.setAttribute('aria-label','Language');
    for(const [value,name]of [['en','English'],['ku','کوردی'],['ar','العربية']]){const option=document.createElement('option');option.value=value;option.textContent=name;select.append(option);}
    control.append(label,select);header.insertBefore(control,document.getElementById('theme-toggle'));
    }
    document.getElementById('language').addEventListener('change',event=>set(event.target.value));
  }
  const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(apply);});
  observer.observe(document.documentElement,{childList:true,characterData:true,subtree:true});
  window.addEventListener('storage',event=>{if(event.key==='greenKurdistanLanguage'&&languages.includes(event.newValue))set(event.newValue,false);});
  set(language,false);
})();
