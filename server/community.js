async function communityRoutes(c) {
  const { req,res,path,method,url,db,userFor,authenticated,getReport,field,photo,body,json,fail,transaction,rate,now }=c;
  const match=path.match(/^\/api\/reports\/([1-9][0-9]{0,9})\/(community|support|team(?:\/membership|\/leader)?|tasks(?:\/[1-9][0-9]{0,9})?|updates(?:\/[1-9][0-9]{0,9}(?:\/photo|\/resolve)?)?)$/);
  if (!match) return false;
  const id=Number(match[1]), route=match[2], viewer=userFor(req);
  let report=getReport(id,viewer);
  const team=()=>db.prepare('SELECT t.*,u.username AS leader FROM community_teams t JOIN users u ON u.id=t.leader_id WHERE report_id=?').get(id);
  const member=user=>db.prepare('SELECT * FROM team_members WHERE report_id=? AND user_id=?').get(id,user.id);
  const leader=user=>{const value=team();if(!value)fail(404,'team_missing');if(value.leader_id!==user.id&&user.role!=='admin')fail(403,'leader_required');return value;};
  const active=()=>{if(!['reviewed','in_progress'].includes(report.status))fail(409,'project_not_active');};
  const participant=user=>{if(!member(user)&&user.role!=='admin')fail(403,'team_member_required');};
  const touch=()=>db.prepare('UPDATE reports SET updated_at=? WHERE id=?').run(now(),id);
  const limit=(table,maximum)=>{if(db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE report_id=?`).get(id).n>=maximum)fail(409,'project_limit');};
  const output=value=>{json(res,200,value);return true;};
  if(route==='community'&&method==='GET') {
    const page=Number(url.searchParams.get('page')||1);
    if(!Number.isSafeInteger(page)||page<1||page>100000)fail(400,'invalid_input');
    const visibility=viewer?.role==='admin'?'':' AND hidden=0';
    const total=db.prepare('SELECT COUNT(*) AS n FROM community_updates WHERE report_id=?'+visibility).get(id).n;
    return output({reportStatus:report.status,reportVersion:report.version,reportTeam:report.team,team:team()||null,
      members:db.prepare('SELECT m.user_id,u.username,m.contribution,m.joined_at FROM team_members m JOIN users u ON u.id=m.user_id WHERE m.report_id=? ORDER BY m.joined_at,m.user_id').all(id),
      tasks:db.prepare('SELECT t.*,u.username AS assignee FROM project_tasks t LEFT JOIN users u ON u.id=t.assignee_id WHERE t.report_id=? ORDER BY t.id').all(id),
      updates:db.prepare('SELECT p.id,p.kind,p.content,p.hidden,p.created_at,p.user_id,u.username,p.photo_mime IS NOT NULL AS hasPhoto FROM community_updates p JOIN users u ON u.id=p.user_id WHERE p.report_id=?'+visibility+' ORDER BY p.id DESC LIMIT 20 OFFSET ?').all(id,(page-1)*20),
      supporters:db.prepare('SELECT COUNT(*) AS n FROM report_supporters WHERE report_id=?').get(id).n,
      supported:!!(viewer&&db.prepare('SELECT 1 FROM report_supporters WHERE report_id=? AND user_id=?').get(id,viewer.id)),
      page,pages:Math.ceil(total/20),total});
  }
  const image=route.match(/^updates\/([1-9][0-9]{0,9})\/photo$/);
  if(image&&method==='GET') {
    const update=db.prepare('SELECT photo_mime,photo_bytes,hidden FROM community_updates WHERE id=? AND report_id=?').get(Number(image[1]),id);
    if(!update?.photo_bytes||(update.hidden&&viewer?.role!=='admin'))fail(404,'not_found');
    res.writeHead(200,{'Content-Type':update.photo_mime,'Content-Length':update.photo_bytes.length,'Cache-Control':'no-store'});
    res.end(Buffer.from(update.photo_bytes));return true;
  }
  if(!['POST','PATCH'].includes(method))fail(405,'method_not_allowed');
  const user=authenticated(req);rate(req,'community',150);
  const data=await body(req);
  report=getReport(id,user);
  const resolveMatch=route.match(/^updates\/([1-9][0-9]{0,9})\/resolve$/);
  if(resolveMatch&&method==='POST') {
    authenticated(req,true);
    if(report.status!=='in_progress')fail(409,'project_not_active');
    const update=db.prepare("SELECT * FROM community_updates WHERE id=? AND report_id=? AND kind='resolution_request' AND hidden=0").get(Number(resolveMatch[1]),id);
    if(!update?.photo_bytes)fail(404,'not_found');
    if(db.prepare("SELECT COUNT(*) AS n FROM project_tasks WHERE report_id=? AND status!='done'").get(id).n)fail(409,'unfinished_tasks');
    const note=field(data.note,5,1500),timestamp=now();
    transaction(()=>{
      db.prepare("UPDATE reports SET status='resolved',resolution=?,updated_at=?,version=version+1 WHERE id=?").run(note,timestamp,id);
      db.prepare('INSERT INTO photos VALUES (?,?,?,?) ON CONFLICT(report_id,kind) DO UPDATE SET mime=excluded.mime,bytes=excluded.bytes').run(id,'after',update.photo_mime,update.photo_bytes);
      db.prepare('INSERT INTO history(report_id,actor_id,status,note,team,created_at) VALUES (?,?,?,?,?,?)').run(id,user.id,'resolved',note,report.team,timestamp);
    });return output({ok:true});
  }
  if(route==='support'&&method==='POST') {
    if(!['reviewed','in_progress','resolved'].includes(report.status))fail(409,'project_not_active');
    if(typeof data.supported!=='boolean')fail(400,'invalid_input');
    if(data.supported)db.prepare('INSERT OR IGNORE INTO report_supporters VALUES (?,?)').run(id,user.id);
    else db.prepare('DELETE FROM report_supporters WHERE report_id=? AND user_id=?').run(id,user.id);
    return output({ok:true});
  }
  if(route==='team'&&method==='POST') {
    active();const name=field(data.name,3,100),plan=field(data.plan,15,2000),contribution=field(data.contribution??'',0,300);
    if(team())fail(409,'team_exists');
    transaction(()=>{
      const time=now();db.prepare('INSERT INTO community_teams VALUES (?,?,?,?,?)').run(id,name,plan,user.id,time);
      db.prepare('INSERT INTO team_members VALUES (?,?,?,?)').run(id,user.id,contribution,time);
      db.prepare("UPDATE reports SET team=?,status='in_progress',updated_at=?,version=version+1 WHERE id=?").run(name,time,id);
      db.prepare('INSERT INTO history(report_id,actor_id,status,note,team,created_at) VALUES (?,?,?,?,?,?)').run(id,user.id,'in_progress','Community team formed. '+plan.slice(0,1400),name,time);
    });return output({ok:true});
  }
  if(route==='team'&&method==='PATCH') {
    active();leader(user);const name=field(data.name,3,100),plan=field(data.plan,15,2000);
    transaction(()=>{db.prepare('UPDATE community_teams SET name=?,plan=? WHERE report_id=?').run(name,plan,id);db.prepare('UPDATE reports SET team=?,updated_at=?,version=version+1 WHERE id=?').run(name,now(),id);});
    return output({ok:true});
  }
  if(route==='team/leader'&&method==='POST') {
    active();leader(user);
    if(!Number.isSafeInteger(data.userId)||!db.prepare('SELECT 1 FROM team_members WHERE report_id=? AND user_id=?').get(id,data.userId))fail(400,'invalid_input');
    db.prepare('UPDATE community_teams SET leader_id=? WHERE report_id=?').run(data.userId,id);touch();return output({ok:true});
  }
  if(route==='team/membership'&&method==='POST') {
    active();const value=team();if(!value)fail(404,'team_missing');
    if(data.action==='join') {
      const contribution=field(data.contribution??'',0,300);
      if(!member(user))limit('team_members',100);
      db.prepare('INSERT INTO team_members VALUES (?,?,?,?) ON CONFLICT(report_id,user_id) DO UPDATE SET contribution=excluded.contribution').run(id,user.id,contribution,now());
    } else if(data.action==='leave') {
      if(value.leader_id===user.id)fail(409,'transfer_leadership');
      transaction(()=>{db.prepare("UPDATE project_tasks SET assignee_id=NULL,status='open',updated_at=? WHERE report_id=? AND assignee_id=? AND status='doing'").run(now(),id,user.id);db.prepare('DELETE FROM team_members WHERE report_id=? AND user_id=?').run(id,user.id);});
    } else fail(400,'invalid_input');
    touch();return output({ok:true});
  }
  if(route==='tasks'&&method==='POST') {
    active();leader(user);limit('project_tasks',100);
    const title=field(data.title,3,200),due=field(data.dueDate??'',0,10);
    if(due&&(!/^\d{4}-\d{2}-\d{2}$/.test(due)||!Number.isFinite(Date.parse(due))||new Date(due).toISOString().slice(0,10)!==due))fail(400,'invalid_input');
    db.prepare('INSERT INTO project_tasks(report_id,title,due_date,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?)').run(id,title,due,user.id,now(),now());touch();return output({ok:true});
  }
  const taskMatch=route.match(/^tasks\/([1-9][0-9]{0,9})$/);
  if(taskMatch&&method==='PATCH') {
    active();participant(user);const task=db.prepare('SELECT * FROM project_tasks WHERE id=? AND report_id=?').get(Number(taskMatch[1]),id);
    if(!task)fail(404,'not_found');
    if(data.action==='claim') {
      if(task.status!=='open')fail(409,'task_conflict');
      const result=db.prepare("UPDATE project_tasks SET status='doing',assignee_id=?,updated_at=? WHERE id=? AND status='open'").run(user.id,now(),task.id);
      if(!result.changes)fail(409,'task_conflict');
    } else if(['complete','release','reopen'].includes(data.action)) {
      const coordinator=team().leader_id===user.id||user.role==='admin';
      if(task.assignee_id!==user.id&&!coordinator)fail(403,'task_owner_required');
      if(data.action==='complete'&&task.status!=='doing'||data.action==='release'&&task.status!=='doing'||data.action==='reopen'&&task.status!=='done')fail(409,'task_conflict');
      if(data.action==='complete')db.prepare("UPDATE project_tasks SET status='done',updated_at=? WHERE id=?").run(now(),task.id);
      else db.prepare("UPDATE project_tasks SET status='open',assignee_id=NULL,updated_at=? WHERE id=?").run(now(),task.id);
    } else fail(400,'invalid_input');
    touch();return output({ok:true});
  }
  if(route==='updates'&&method==='POST') {
    if(!['reviewed','in_progress','resolved'].includes(report.status))fail(409,'project_not_active');
    if(!['discussion','progress','resolution_request'].includes(data.kind))fail(400,'invalid_input');
    if(data.kind!=='discussion'){active();participant(user);}
    if(data.kind==='resolution_request') {
      leader(user);
      if(!data.photo)fail(400,'evidence_required');
      if(db.prepare("SELECT COUNT(*) AS n FROM project_tasks WHERE report_id=? AND status!='done'").get(id).n)fail(409,'unfinished_tasks');
    }
    const content=field(data.content,5,3000),image=photo(data.photo);limit('community_updates',2000);
    db.prepare('INSERT INTO community_updates(report_id,user_id,kind,content,photo_mime,photo_bytes,created_at) VALUES (?,?,?,?,?,?,?)').run(id,user.id,data.kind,content,image?.mime??null,image?.bytes??null,now());
    touch();return output({ok:true});
  }
  const updateMatch=route.match(/^updates\/([1-9][0-9]{0,9})$/);
  if(updateMatch&&method==='PATCH') {
    authenticated(req,true);if(typeof data.hidden!=='boolean')fail(400,'invalid_input');
    const changed=db.prepare('UPDATE community_updates SET hidden=? WHERE id=? AND report_id=?').run(Number(data.hidden),Number(updateMatch[1]),id);
    if(!changed.changes)fail(404,'not_found');return output({ok:true});
  }
  fail(405,'method_not_allowed');
}
module.exports={communityRoutes};
