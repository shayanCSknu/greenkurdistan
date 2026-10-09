(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const groups = {
    categories: ['water','waste','green-space','pollution'],
    areas: ['knowledge-university','erbil','ankawa','baharka','shaqlawa','other'],
    statuses: ['submitted','reviewed','in_progress','resolved','rejected'],
    urgencies: ['normal','high']
  };
  const transitions = { submitted:['reviewed','rejected'], reviewed:['in_progress','rejected'], in_progress:['resolved','reviewed'], resolved:['in_progress'], rejected:['reviewed'] };
  let language = 'en';
  try { language = window.I18N?.language || localStorage.getItem('greenKurdistanLanguage') || localStorage.getItem('greenReportLanguage') || 'en'; } catch {}
  if (!['en','ku','ar'].includes(language)) language = 'en';
  let user = null, scope = 'public', page = 1, pages = 0, sequence = 0, detailSequence = 0;
  let stats = null, reports = [], reportTotal = 0, selectedReport = null, pendingCreate = false;
  let requestId = newId(), beforePhoto = Promise.resolve(null), beforeUrl = null, afterPhoto = Promise.resolve(null);
  function newId() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2,'0')).join('');
  }
  function t(key, values = {}) {
    const index = { en:0, ku:1, ar:2 }[language];
    const text = window.RR_TEXT[key]?.[index] || window.RR_TEXT.server_error[index];
    return text.replace(/\{(\w+)\}/g, (match,name) => String(values[name] ?? match));
  }
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function date(value) {
    return new Date(value).toLocaleString(language === 'ku' ? 'ckb-IQ' : language === 'ar' ? 'ar-IQ' : 'en-GB', { dateStyle:'medium',timeStyle:'short' });
  }
  function message(selector, key, values) { $(selector).textContent = key ? t(key,values) : ''; }
  function options(select, values, all = false) {
    const previous = select.value;
    select.replaceChildren();
    if (all) { const option = el('option', t('all')); option.value = ''; option.dataset.t='all';select.append(option); }
    for (const value of values) { const option = el('option',t(value)); option.value = value;option.dataset.t=value; select.append(option); }
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
  }
  function translate() {
    document.documentElement.lang = language === 'ku' ? 'ckb' : language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
    document.title = `${t('reportResolve')} | Green Kurdistan`;
    $('#language').value = language;
    document.querySelectorAll('[data-t]').forEach(node => { node.textContent = t(node.dataset.t); });
    document.querySelectorAll('[data-t-aria]').forEach(node => node.setAttribute('aria-label',t(node.dataset.tAria)));
    document.querySelectorAll('[data-t-alt]').forEach(node => { node.alt = t(node.dataset.tAlt); });
    document.querySelectorAll('[data-options]').forEach(node => options(node,groups[node.dataset.options],node.dataset.all === 'true'));
    updateAccount(); renderStats(); renderReports();
    if (selectedReport) {
      const root=$('#community-project'),draft=$('#admin-update[data-dirty]');
      if(root){window.CommunityUI?.retranslate(root);renderDetail(selectedReport,root,draft);}
      else renderDetail(selectedReport);
    }
  }
  async function api(path, method = 'GET', payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(path, { method, credentials:'same-origin', cache:'no-store', signal:controller.signal,
        headers: method === 'GET' ? {} : { 'Content-Type':'application/json', 'X-Green-Request':'1' },
        body: payload === undefined ? undefined : JSON.stringify(payload) });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('offline');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'server_error');
      return result;
    } catch (error) {
      if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('offline');
      throw error;
    } finally { clearTimeout(timer); }
  }
  function errorMessage(selector, error) { message(selector,window.RR_TEXT[error.message] ? error.message : 'server_error'); }
  function updateAccount() {
    $('#account-label').textContent = user ? t('signedIn',{name:user.username}) : t('guest');
    $('#account-open').hidden = !!user;
    $('#sign-out').hidden = !user;
    $('[data-scope=mine]').hidden = !user;
    $('[data-scope=teams]').hidden = !user;
    $('[data-scope=admin]').hidden = user?.role !== 'admin';
    if (scope === 'admin' && user?.role !== 'admin' || ['mine','teams'].includes(scope) && !user) scope = 'public';
    document.querySelectorAll('[data-scope]').forEach(node => node.setAttribute('aria-pressed',String(node.dataset.scope === scope)));
    $('#admin-hint').hidden = scope !== 'admin';
  }
  function renderStats() {
    const container = $('#stats'); container.replaceChildren();
    const counts = Object.fromEntries((stats?.counts || []).map(row => [row.status,row.count]));
    for (const key of ['total','reviewed','in_progress','resolved']) {
      const card = el('div',null,'rr-stat');
      const value = !stats ? '—' : key === 'total' ? Object.values(counts).reduce((a,b)=>a+b,0) : counts[key] || 0;
      card.append(el('strong',value),el('span',t(key))); container.append(card);
    }
    const breakdown = $('#breakdown'); breakdown.replaceChildren();
    for (const [key,label] of [['areas','area'],['categories','category']]) {
      const section = el('div'); section.append(el('h3',t(label)));
      for (const item of stats?.[key] || []) {
        const row = el('div',null,'rr-breakdown-row'); row.append(el('span',t(item[label])),el('strong',item.count)); section.append(row);
      }
      if (!stats?.[key]?.length) section.append(el('p',stats ? t('noData') : t('loading'),'rr-caption'));
      breakdown.append(section);
    }
    if (scope === 'admin' && stats?.pending !== null && stats?.pending !== undefined) $('#admin-hint').textContent = `${t('adminHint')} ${t('pending',{count:stats.pending})}`;
  }
  function badge(status) { const node = el('span',t(status),'rr-status'); node.dataset.status = status; return node; }
  function renderReports() {
    const container = $('#report-list'); container.replaceChildren();
    for (const report of reports) {
      const article = el('article',null,'glass-card rr-report');
      if (report.photos.includes('before')) {
        const image = el('img'); image.className = 'rr-report-photo'; image.alt = t('before'); image.loading = 'lazy';
        image.src = `/api/reports/${report.id}/photos/before?v=${report.version}`;
        image.addEventListener('error',()=>{image.hidden=true;},{once:true});article.append(image);
      }
      article.append(badge(report.status),el('h3',report.title),el('p',`${t(report.category)} · ${t(report.area)}`),el('p',report.location),el('p',`${t('updated')}: ${date(report.updated_at)}`));
      if (report.brief?.urgency === 'high') article.append(el('span',t('high'),'rr-priority'));
      if (report.community) article.append(el('p',t('communityCounts',{members:report.community.members,done:report.community.completedTasks,tasks:report.community.totalTasks,support:report.community.supporters}),'rr-caption'));
      const button = el('button',`${t('view')} #${report.id}`,'button button-small'); button.type = 'button';
      button.addEventListener('click',()=>showReport(report.id)); article.append(button); container.append(article);
    }
    $('#page-label').textContent = t('page',{page:pages ? page : 0,pages});
    $('#previous').disabled = page <= 1;
    $('#next').disabled = page >= pages;
    $('#list-message').textContent = reports.length ? t('results',{count:reportTotal}) : t('noReports');
  }
  async function refresh({quiet = false, preserveDetail = false} = {}) {
    const ownSequence = ++sequence;
    if (!quiet) message('#list-message','loading');
    try {
      const session = await api('/api/session');
      if (ownSequence !== sequence) return;
      user = session.user; updateAccount();
      if (!user) $('#create-panel').hidden = true;
      const params = new URLSearchParams(new FormData($('#filters')));
      params.set('scope',scope); params.set('page',String(page));
      const [list,newStats] = await Promise.all([api('/api/reports?' + params), api('/api/stats')]);
      if (ownSequence !== sequence) return;
      stats = newStats; reports = list.reports; reportTotal = list.total; pages = list.pages;
      if (pages && page > pages) { page = pages; return refresh(); }
      $('#connection-message').hidden = true;
      renderStats(); renderReports();
      if (!preserveDetail && !window.CommunityUI?.hasDraft() && $('#report-dialog').open && selectedReport && user?.role !== 'admin') await showReport(selectedReport.id, true);
    } catch (error) {
      if (ownSequence !== sequence) return;
      $('#connection-message').hidden = false;
      errorMessage('#connection-message',error);
      window.GreenRuntime?.showHelp();
      if (!quiet) errorMessage('#list-message',error);
    }
  }
  function formLabel(text, input) { const label = el('label'),span=el('span',t(text));span.dataset.t=text;label.append(span,input); return label; }
  function renderDetail(report, communityRoot = null, adminDraft = null) {
    const container = $('#report-detail'); container.replaceChildren();
    container.append(badge(report.status),el('h3',`#${report.id} · ${report.title}`,'rr-detail-heading'),el('p',report.description,'rr-description'));
    const metadata = el('dl',null,'rr-metadata');
    for (const [key,value] of [['area',t(report.area)],['category',t(report.category)],['location',report.location],['team',report.team || t('unassigned')],['created',date(report.created_at)],['updated',date(report.updated_at)]]) {
      const group = el('div'); group.append(el('dt',t(key)),el('dd',value)); metadata.append(group);
    }
    container.append(metadata);
    window.ReportMap?.show(container,report);
    for (const [key,value] of [['projectGoal',report.brief?.goal],['resourcesNeeded',report.brief?.resources]]) if(value)container.append(el('h3',t(key)),el('p',value,'rr-description'));
    if (report.latitude !== null && report.longitude !== null) {
      const link = el('a',t('openMap'),'text-link');
      link.href = `https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=17/${report.latitude}/${report.longitude}`;
      link.target = '_blank'; link.rel = 'noopener noreferrer'; container.append(link);
    }
    const photos = el('div',null,'rr-photo-grid');
    for (const kind of report.photos) {
      const figure = el('figure'); const image = el('img'); image.alt = t(kind); image.src = `/api/reports/${report.id}/photos/${kind}?v=${report.version}`;
      image.addEventListener('error',()=> { image.hidden = true; figure.append(el('p',t('photoUnavailable'),'rr-caption')); },{once:true});
      figure.append(image,el('figcaption',t(kind))); photos.append(figure);
    }
    container.append(photos);
    if (report.resolution) { container.append(el('h3',t('resolution')),el('p',report.resolution,'rr-resolution')); }
    container.append(el('h3',t('history')));
    const history = el('ol',null,'rr-history');
    for (const event of report.history) {
      const item = el('li'); const time = el('time',date(event.created_at)); time.dateTime = event.created_at;
      item.append(el('strong',t(event.status)),time);
      if (event.note) item.append(el('p',event.note));
      if (event.team) item.append(el('p',`${t('team')}: ${event.team}`));
      history.append(item);
    }
    container.append(history);
    if (adminDraft) container.append(adminDraft);
    if (user?.role === 'admin' && !adminDraft) {
      const editingVersion = report.version;
      const form = el('form',null,'rr-admin'); form.id = 'admin-update';
      form.addEventListener('input',()=>{form.dataset.dirty='true';});
      form.append(el('h3',t('updateReport')),el('p',t('adminHint'),'rr-caption'));
      const status = el('select'); status.name = 'status'; options(status,[report.status,...transitions[report.status]]); status.value = report.status;
      const team = el('input'); team.name = 'team'; team.maxLength = 100; team.value = report.team;
      const note = el('textarea'); note.name = 'note'; note.required = true; note.minLength = 5; note.maxLength = 1500; note.rows = 3;
      form.append(formLabel('status',status),formLabel('team',team),formLabel('note',note),el('p',t('noteHint'),'rr-caption'));
      const file = el('input'); file.type = 'file'; file.accept = 'image/jpeg,image/png,image/webp'; file.name = 'photo';
      const fileLabel = formLabel('afterPhoto',file); fileLabel.hidden = report.status !== 'resolved';
      afterPhoto = Promise.resolve(null);
      status.addEventListener('change',()=> { fileLabel.hidden = status.value !== 'resolved'; if (status.value !== 'resolved') { file.value = ''; afterPhoto = Promise.resolve(null); } });
      file.addEventListener('change',()=> { afterPhoto = preparePhoto(file,'#update-message'); });
      const hint = el('small',t('photoHint')); fileLabel.append(hint); form.append(fileLabel);
      const button = el('button',t('save'),'button'); button.type = 'submit';
      button.dataset.t='save';
      const feedback = el('p'); feedback.id = 'update-message'; feedback.setAttribute('role','status'); form.append(button,feedback);
      form.addEventListener('submit',async event => {
        event.preventDefault(); if (!form.reportValidity()) return;
        button.disabled = true; message('#update-message','saving');
        try {
          const image = await afterPhoto;
          if (!file.checkValidity()) { message('#update-message','invalid_photo'); return; }
          await api(`/api/reports/${report.id}`,'PATCH',{ status:status.value,team:team.value,note:note.value,version:editingVersion,photo:image });
          await showReport(report.id,true); message('#detail-message','updateSaved'); await refresh({quiet:true});
        } catch (error) { errorMessage('#update-message',error); }
        finally { button.disabled = false; }
      });
      container.append(form);
    }
    if (communityRoot) { container.append(communityRoot); return; }
    const projectRoot = window.CommunityUI?.mount(container,report,user,{api,t,el,date,normalizePhoto,
      signIn:()=>{pendingCreate=false;$('#auth-dialog').showModal();},
      changed:async data=>{
        const latest = await api(`/api/reports/${report.id}`);
        if (!$('#report-dialog').open || selectedReport?.id !== report.id || container.querySelector('#community-project') !== projectRoot) return;
        Object.assign(report,latest.report);
        renderDetail(report,container.querySelector('#community-project'),container.querySelector('#admin-update[data-dirty]'));
        await refresh({quiet:true,preserveDetail:true});
      }});
  }
  async function showReport(id, quiet = false) {
    const ownSequence = ++detailSequence;
    if (!quiet) { $('#report-detail').replaceChildren(); message('#detail-message','loading'); selectedReport = null; }
    if (!$('#report-dialog').open) $('#report-dialog').showModal();
    try {
      const result = await api(`/api/reports/${id}`);
      if (ownSequence !== detailSequence || !$('#report-dialog').open) return;
      selectedReport = result.report; renderDetail(result.report);
      if (!quiet) message('#detail-message',null);
    } catch (error) { if (ownSequence === detailSequence) errorMessage('#detail-message',error); }
  }
  async function normalizePhoto(file) {
    if (!file) return null;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 3*1024*1024 || !file.size) throw new Error('invalid_photo');
    const source = URL.createObjectURL(file);
    try {
      const image = new Image(); image.src = source; await image.decode();
      if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 24_000_000) throw new Error('invalid_photo');
      const ratio = Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
      const canvas = document.createElement('canvas'); canvas.width = Math.max(1,Math.round(image.naturalWidth*ratio)); canvas.height = Math.max(1,Math.round(image.naturalHeight*ratio));
      const context = canvas.getContext('2d'); context.fillStyle = '#ffffff'; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(image,0,0,canvas.width,canvas.height);
      const encoded = canvas.toDataURL('image/jpeg',.85).split(',')[1];
      if (!encoded || encoded.length > 4*1024*1024) throw new Error('invalid_photo');
      return {mime:'image/jpeg',data:encoded};
    } finally { URL.revokeObjectURL(source); }
  }
  async function preparePhoto(input, feedback) {
    const selected = input.files[0];
    input.setCustomValidity('');
    try { return await normalizePhoto(selected); }
    catch { if (input.files[0] === selected) { input.setCustomValidity(t('invalid_photo')); message(feedback,'invalid_photo'); } return null; }
  }
  function openCreate() {
    if (!user) { pendingCreate = true; $('#auth-dialog').showModal(); return; }
    $('#create-panel').hidden = false; $('#create-panel').scrollIntoView({behavior:'smooth',block:'start'}); $('#create-report').elements.title.focus({preventScroll:true});
    window.ReportMap?.open();
  }
  if(window.I18N)window.addEventListener('site:language',event=>{language=event.detail.language;translate();});
  else $('#language').addEventListener('change',event=> {
    language = event.target.value;
    try { localStorage.setItem('greenReportLanguage',language);localStorage.setItem('greenKurdistanLanguage',language); } catch {}
    translate();
  });
  $('#account-open').addEventListener('click',()=> { pendingCreate = false; $('#auth-dialog').showModal(); });
  $('#new-report').addEventListener('click',openCreate);
  $('#close-create').addEventListener('click',()=> { $('#create-panel').hidden = true; $('#new-report').focus(); });
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
  $('#report-dialog').addEventListener('close',()=> { ++detailSequence; selectedReport = null; $('#report-detail').replaceChildren(); });
  $('#auth-dialog').addEventListener('close',()=> { $('#auth-form').elements.password.value = ''; message('#auth-message',null); });
  $('#auth-form').addEventListener('submit',async event=> {
    event.preventDefault(); const form = event.currentTarget;
    const action = event.submitter?.value || 'login';
    if (action === 'register' && form.elements.password.value.length < 12) { message('#auth-message','password_short'); return; }
    const buttons = form.querySelectorAll('button'); buttons.forEach(button=> { button.disabled = true; }); message('#auth-message','loading');
    try {
      const result = await api(`/api/${action}`,'POST',{username:form.elements.username.value,password:form.elements.password.value});
      user = result.user; updateAccount(); $('#auth-dialog').close(); await refresh(); if (pendingCreate) { pendingCreate = false; openCreate(); }
    } catch (error) { errorMessage('#auth-message',error); }
    finally { buttons.forEach(button=> { button.disabled = false; }); }
  });
  $('#sign-out').addEventListener('click',async()=> {
    $('#sign-out').disabled = true;
    try {
      await api('/api/logout','POST',{}); user = null; scope = 'public'; page = 1; updateAccount();
      $('#create-panel').hidden = true; $('#create-report').reset(); beforePhoto = Promise.resolve(null); requestId = newId();
      if (beforeUrl) URL.revokeObjectURL(beforeUrl); beforeUrl = null; $('#before-preview').hidden = true;
      $('#report-dialog').close(); await refresh();
    } catch (error) { $('#connection-message').hidden = false; errorMessage('#connection-message',error); }
    finally { $('#sign-out').disabled = false; }
  });
  $('#create-report').elements.photo.addEventListener('change',event=> {
    beforePhoto = preparePhoto(event.target,'#create-message');
    if (beforeUrl) URL.revokeObjectURL(beforeUrl);
    const file = event.target.files[0]; const preview = $('#before-preview'); preview.hidden = true;
    if (file && file.size <= 3*1024*1024 && ['image/jpeg','image/png','image/webp'].includes(file.type)) { beforeUrl = URL.createObjectURL(file); preview.src = beforeUrl; preview.hidden = false; }
  });
  $('#create-report').addEventListener('submit',async event=> {
    event.preventDefault(); const form = event.currentTarget, fields = form.elements, button = form.querySelector('[type=submit]');
    if (!form.reportValidity()) return;
    const latitude = fields.latitude.value === '' ? null : Number(fields.latitude.value);
    const longitude = fields.longitude.value === '' ? null : Number(fields.longitude.value);
    if ((latitude === null) !== (longitude === null)) { message('#create-message','invalid_coordinates'); return; }
    button.disabled = true; message('#create-message','saving');
    try {
      const image = await beforePhoto;
      if (!fields.photo.checkValidity()) { message('#create-message','invalid_photo'); return; }
      const result = await api('/api/reports','POST',{requestId,title:fields.title.value,category:fields.category.value,area:fields.area.value,location:fields.location.value,description:fields.description.value,goal:fields.goal.value,resources:fields.resources.value,urgency:fields.urgency.value,latitude,longitude,photo:image});
      form.reset(); beforePhoto = Promise.resolve(null); requestId = newId(); $('#before-preview').hidden = true;
      if (beforeUrl) URL.revokeObjectURL(beforeUrl); beforeUrl = null;
      message('#create-message','reportSaved',{id:result.report.id}); scope = 'mine'; page = 1; $('#filters').reset(); updateAccount(); await refresh();
    } catch (error) { errorMessage('#create-message',error); }
    finally { button.disabled = false; }
  });
  $('#locate').addEventListener('click',()=> {
    if (!navigator.geolocation) { message('#location-message','locationUnavailable'); return; }
    $('#locate').disabled = true; message('#location-message','loading');
    navigator.geolocation.getCurrentPosition(position=> {
      const fields = $('#create-report').elements; fields.latitude.value = position.coords.latitude.toFixed(6); fields.longitude.value = position.coords.longitude.toFixed(6);
      window.ReportMap?.setPin([position.coords.latitude,position.coords.longitude]);
      $('#locate').disabled = false; message('#location-message','locationAdded');
    },()=> { $('#locate').disabled = false; message('#location-message','locationUnavailable'); },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
  });
  document.querySelectorAll('[data-scope]').forEach(button=>button.addEventListener('click',()=> { scope = button.dataset.scope; page = 1; $('#filters').reset(); updateAccount(); refresh(); }));
  $('#filters').addEventListener('submit',event=> { event.preventDefault(); page = 1; refresh(); });
  $('#previous').addEventListener('click',()=> { if (page > 1) { page--; refresh(); } });
  $('#next').addEventListener('click',()=> { if (page < pages) { page++; refresh(); } });
  $('#refresh').addEventListener('click',()=>refresh());
  window.addEventListener('online',()=>refresh());
  translate(); refresh().then(()=>{
    const reportId=new URLSearchParams(window.location.search).get('report');
    if(reportId&&/^[1-9][0-9]{0,9}$/.test(reportId))showReport(Number(reportId));
  });
  setInterval(()=> { if (!document.hidden && !$('#auth-dialog').open) refresh({quiet:true}); },20000);
})();
