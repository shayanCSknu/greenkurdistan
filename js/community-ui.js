(() => {
  const roots=new WeakMap();
  function mount(container, report, user, helpers) {
    const {api,t,el,date,normalizePhoto,signIn,changed}=helpers;
    const root=el('section',null,'community-project');root.id='community-project';container.append(root);
    const drafts=new Map();let state=null,activityPage=1,sequence=0;
    const endpoint=`/api/reports/${report.id}`;
    const label=(key,input)=>{const node=el('label');node.append(el('span',t(key)),input);return node;};
    const input=(name,{type='text',max=200,required=true,min=0}={})=>{const node=el(type==='textarea'?'textarea':'input');node.name=name;if(type!=='textarea')node.type=type;else node.rows=3;node.required=required;if(!['file','date'].includes(type)){node.maxLength=max;node.minLength=min;}return node;};
    const error=(node,value)=>{node.textContent=t(window.RR_TEXT[value.message]?value.message:'server_error');node.classList.add('rr-error-text');};
    async function reload(notify=false) {
      const own=++sequence;
      try {const data=await api(endpoint+'/community?page='+activityPage);if(own!==sequence||!root.isConnected)return;
        state=data;render();if(notify)await changed(data);
      }catch(value){if(own!==sequence||!root.isConnected)return;root.replaceChildren(el('h3',t('communityProject')));const message=el('p');message.setAttribute('role','status');error(message,value);root.append(message,button('refresh',()=>reload()));}
    }
    function button(key,run,{disabled=false,className='outline-button'}={}) {
      const node=el('button',t(key),className);node.type='button';node.disabled=disabled;
      node.addEventListener('click',async()=>{node.disabled=true;const feedback=root.querySelector('#community-feedback')||root.querySelector('[role="status"]');if(feedback)feedback.textContent='';
        try{await run();}catch(value){if(feedback)error(feedback,value);}finally{if(node.isConnected)node.disabled=disabled;}});return node;
    }
    async function mutate(route,method,data){await api(endpoint+route,method,data);await reload(true);}
    function form(name,fields,submitKey,submit) {
      const node=el('form',null,'community-form');node.id=name;
      const saved=drafts.get(name)||{};
      for(const [key,control]of fields){if(control.type!=='file'&&saved[control.name]!==undefined)control.value=saved[control.name];node.append(label(key,control));}
      if(saved.photoFile)node.append(el('small',saved.photoFile.name));
      const message=el('p');message.setAttribute('role','status');
      const save=el('button',t(submitKey),'button button-small');save.type='submit';node.append(save,message);
      node.addEventListener('input',()=>{const values={};for(const field of node.elements){if(!field.name)continue;if(field.type==='file')values.photoFile=field.files[0]||saved.photoFile;else values[field.name]=field.value;}drafts.set(name,values);node.dataset.dirty='true';});
      if(drafts.has(name))node.dataset.dirty='true';
      node.addEventListener('submit',async event=>{event.preventDefault();if(!node.reportValidity())return;save.disabled=true;message.textContent=t('saving');
        try{const data=Object.fromEntries([...node.elements].filter(x=>x.name&&x.type!=='file').map(x=>[x.name,x.value]));
          const file=node.elements.photo?.files[0]||drafts.get(name)?.photoFile;
          if(node.elements.photo)data.photo=await normalizePhoto(file);
          await submit(data);drafts.delete(name);await reload(true);
        }catch(value){error(message,value);}finally{if(save.isConnected)save.disabled=false;}
      });return node;
    }
    function render() {
      root.replaceChildren();const feedback=el('p');feedback.id='community-feedback';feedback.setAttribute('role','status');
      root.append(el('h2',t('communityProject')),el('p',t('communityProjectHint'),'rr-caption'),feedback);
      const share=el('input');share.type='url';share.readOnly=true;share.value=new URL('/reports.html?report='+report.id,window.location.href).href;
      root.append(label('shareReport',share),button('copyLink',async()=>{
        if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(share.value);feedback.textContent=t('linkCopied');return;}catch{}}
        share.focus();share.select();feedback.textContent=t('selectLink');
      }));
      const active=['reviewed','in_progress'].includes(state.reportStatus),isMember=!!user&&state.members.some(member=>member.user_id===user.id);
      const isLeader=!!user&&(state.team?.leader_id===user.id||user.role==='admin'),canParticipate=isMember||user?.role==='admin';
      const support=el('div',null,'community-toolbar');support.append(el('p',t('supportCount',{count:state.supporters})),button(state.supported?'removeSupport':'supportProject',()=>user?mutate('/support','POST',{supported:!state.supported}):signIn(),{disabled:!['reviewed','in_progress','resolved'].includes(state.reportStatus)}));root.append(support);
      if(!active)root.append(el('p',t(['submitted','rejected'].includes(state.reportStatus)?'awaitingApproval':'projectArchived'),'rr-notice'));
      if(!state.team) {
        root.append(el('h3',t('startTeam')),el('p',t('teamEmpty'),'rr-caption'));
        if(active&&user)root.append(form('create-team',[
          ['teamName',input('name',{max:100,min:3})],['actionPlan',input('plan',{type:'textarea',max:2000,min:15})],['yourContribution',input('contribution',{max:300,required:false})]
        ],'createTeam',data=>api(endpoint+'/team','POST',data)));
        else if(active)root.append(button('signInToHelp',signIn));
      } else {
        const card=el('article',null,'community-team glass-card');card.append(el('h3',state.team.name),el('p',t('teamLead',{name:state.team.leader}),'rr-caption'),el('p',state.team.plan,'rr-description'));
        const list=el('ul',null,'community-members');
        for(const member of state.members){const item=el('li');item.append(el('strong',member.username+(member.user_id===state.team.leader_id?' · '+t('leader'):'')));if(member.contribution)item.append(el('p',member.contribution));list.append(item);}
        card.append(el('h4',t('teamMembers',{count:state.members.length})),list);
        if(active&&user) {
          const contribution=input('contribution',{max:300,required:false});contribution.value=state.members.find(member=>member.user_id===user.id)?.contribution||'';
          card.append(form('join-team',[['yourContribution',contribution]],isMember?'updateContribution':'joinTeam',data=>api(endpoint+'/team/membership','POST',{action:'join',...data})));
          if(isMember&&state.team.leader_id!==user.id)card.append(button('leaveTeam',()=>mutate('/team/membership','POST',{action:'leave'})));
          if(isLeader) {
            const details=el('details');details.append(el('summary',t('manageTeam')));
            const name=input('name',{max:100,min:3}),plan=input('plan',{type:'textarea',max:2000,min:15});name.value=state.team.name;plan.value=state.team.plan;
            details.append(form('edit-team',[['teamName',name],['actionPlan',plan]],'save',data=>api(endpoint+'/team','PATCH',data)));
            if(state.members.length>1) {
              const select=el('select');select.name='userId';for(const member of state.members.filter(member=>member.user_id!==state.team.leader_id)){const option=el('option',member.username);option.value=member.user_id;select.append(option);}
              details.append(form('transfer-team',[['newLeader',select]],'transferLeader',data=>api(endpoint+'/team/leader','POST',{userId:Number(data.userId)})));
            }
            card.append(details);
          }
        } else if(active)card.append(button('signInToHelp',signIn));
        root.append(card);
        const tasks=el('section',null,'community-tasks');const done=state.tasks.filter(task=>task.status==='done').length;
        tasks.append(el('h3',t('sharedTasks')),el('p',t('taskProgress',{done,total:state.tasks.length}),'rr-caption'));
        const progress=el('progress');progress.max=Math.max(state.tasks.length,1);progress.value=done;progress.setAttribute('aria-label',t('sharedTasks'));tasks.append(progress);
        if(!state.tasks.length)tasks.append(el('p',t('noTasks'),'rr-caption'));
        for(const task of state.tasks) {
          const row=el('article',null,'community-task');row.dataset.taskId=task.id;row.dataset.status=task.status;
          row.append(el('strong',task.title),el('p',t('task_'+task.status)+(task.assignee?' · '+task.assignee:'')+(task.due_date?' · '+t('dueDate')+': '+task.due_date:''),'rr-caption'));
          const controls=el('div',null,'rr-form-actions');const owns=task.assignee_id===user?.id||isLeader;
          if(active&&canParticipate){if(task.status==='open')controls.append(button('claimTask',()=>mutate('/tasks/'+task.id,'PATCH',{action:'claim'})));
            if(task.status==='doing'&&owns)controls.append(button('completeTask',()=>mutate('/tasks/'+task.id,'PATCH',{action:'complete'})),button('releaseTask',()=>mutate('/tasks/'+task.id,'PATCH',{action:'release'})));
            if(task.status==='done'&&owns)controls.append(button('reopenTask',()=>mutate('/tasks/'+task.id,'PATCH',{action:'reopen'})));}
          row.append(controls);tasks.append(row);
        }
        if(active&&isLeader)tasks.append(form('create-task',[['taskTitle',input('title',{min:3})],['dueDate',input('dueDate',{type:'date',required:false})]],'addTask',data=>api(endpoint+'/tasks','POST',data)));
        root.append(tasks);
      }
      const activity=el('section',null,'community-activity');activity.append(el('h3',t('discussionAndUpdates')),el('p',t('updatesPublic'),'rr-caption'));
      if(user&&['reviewed','in_progress','resolved'].includes(state.reportStatus)) {
        const kind=el('select');kind.name='kind';
        for(const key of ['discussion',...(active&&canParticipate?['progress']:[]),...(active&&isLeader&&state.team?['resolution_request']:[])]){const option=el('option',t('update_'+key));option.value=key;kind.append(option);}
        const file=input('photo',{type:'file',required:false});file.accept='image/jpeg,image/png,image/webp';
        const composer=form('post-update',[['updateType',kind],['writeUpdate',input('content',{type:'textarea',max:3000,min:5})],['updatePhoto',file]],'publishUpdate',data=>api(endpoint+'/updates','POST',data));
        const hint=el('p',t('resolutionRequestHint'),'rr-caption');hint.hidden=kind.value!=='resolution_request';composer.append(hint);
        kind.addEventListener('change',()=>{hint.hidden=kind.value!=='resolution_request';});activity.append(composer);
      } else if(!user)activity.append(button('signInToHelp',signIn));
      if(!state.updates.length)activity.append(el('p',t('noUpdates'),'rr-caption'));
      for(const update of state.updates){const post=el('article',null,'community-update');post.dataset.updateId=update.id;
        post.append(el('strong',t('update_'+update.kind)),el('p',update.username+' · '+date(update.created_at),'rr-caption'),el('p',update.content,'rr-description'));
        if(update.hidden)post.append(el('p',t('hiddenUpdate'),'rr-priority'));
        if(update.hasPhoto){const image=el('img');image.className='rr-preview';image.alt=t('updatePhoto');image.loading='lazy';image.src=endpoint+'/updates/'+update.id+'/photo';image.addEventListener('error',()=>{image.hidden=true;post.append(el('p',t('photoUnavailable')));},{once:true});post.append(image);}
        if(user?.role==='admin'){
          post.append(button(update.hidden?'restoreUpdate':'hideUpdate',()=>mutate('/updates/'+update.id,'PATCH',{hidden:!update.hidden})));
          if(update.kind==='resolution_request'&&!update.hidden&&state.reportStatus==='in_progress'){
            const note=input('note',{type:'textarea',min:5,max:1500});
            post.append(form('confirm-resolution-'+update.id,[['verificationNote',note]],'confirmResolution',data=>api(endpoint+'/updates/'+update.id+'/resolve','POST',data)));
          }
        }
        activity.append(post);
      }
      if(state.pages>1){const pages=el('div',null,'rr-pagination');pages.append(button('previous',async()=>{activityPage--;await reload();},{disabled:activityPage<=1}),el('span',t('page',{page:activityPage,pages:state.pages})),button('next',async()=>{activityPage++;await reload();},{disabled:activityPage>=state.pages}));activity.append(pages);}
      root.append(activity);
    }
    roots.set(root,{drafts,render:()=>{if(state)render();}});root.append(el('p',t('loading')));reload();return root;
  }
  window.CommunityUI={mount,retranslate:root=>{if(roots.get(root))roots.get(root).render();},hasDraft:()=>[...document.querySelectorAll('.community-project')].some(root=>roots.get(root)?.drafts.size>0)};
})();
