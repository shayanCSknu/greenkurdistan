const http = require('node:http');
const { randomBytes, createHash, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const { readFile } = require('node:fs/promises');
const { resolve, extname } = require('node:path');
const { openStore } = require('./store');
const { createClimateService } = require('./climate');
const { communityRoutes } = require('./community');
const { attachments,sendMedia } = require('./media');
const derive = promisify(scrypt);
const CATEGORIES = ['water', 'waste', 'green-space', 'pollution'];
const AREAS = ['knowledge-university', 'ankawa', 'baharka', ...Object.keys(require('../js/vendor/kurdistan-cities')), 'other'];
const STATUSES = ['submitted', 'reviewed', 'in_progress', 'resolved', 'rejected'];
const PUBLIC = ['reviewed', 'in_progress', 'resolved'];
const MAX_PHOTO = 3 * 1024 * 1024;
const MAX_BODY = 5 * 1024 * 1024;
const now = () => new Date().toISOString();
const hash = value => createHash('sha256').update(value).digest('hex');
class HttpError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
const fail = (status, code) => { throw new HttpError(status, code); };
function field(value, min, max) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) fail(400, 'invalid_input');
  return value.trim();
}
function photo(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || !['image/jpeg','image/png','image/webp'].includes(value.mime) || typeof value.data !== 'string') fail(400, 'invalid_photo');
  if (value.data.length > Math.ceil(MAX_PHOTO / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value.data)) fail(400, 'invalid_photo');
  const bytes = Buffer.from(value.data, 'base64');
  if (bytes.length < 12 || bytes.length > MAX_PHOTO || bytes.toString('base64') !== value.data) fail(400, 'invalid_photo');
  const valid = value.mime === 'image/png' ? bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))
    : value.mime === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 && bytes.at(-2) === 255 && bytes.at(-1) === 217
    : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
  if (!valid) fail(400, 'invalid_photo');
  return { mime: value.mime, bytes };
}
async function body(req, maximum = MAX_BODY) {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'json_required');
  if (Number(req.headers['content-length']) > maximum) fail(413, 'too_large');
  const chunks = []; let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > maximum) fail(413, 'too_large');
    chunks.push(chunk);
  }
  try {
    const result = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!result || typeof result !== 'object' || Array.isArray(result)) fail(400, 'invalid_input');
    return result;
  } catch { fail(400, 'invalid_input'); }
}

function createApp({ database, root = resolve(__dirname, '..'), secureCookies = process.env.COOKIE_SECURE === '1', climateOptions } = {}) {
  const db = openStore(database);
  const climate = createClimateService(climateOptions);
  const limits = new Map();
  const cookieName = 'green_session';
  const cleanup = setInterval(() => {
    const time = Date.now();
    for (const [key, item] of limits) if (item.until <= time) limits.delete(key);
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(time);
  }, 60_000).unref();
  function rate(req, bucket, maximum) {
    const key = `${bucket}:${req.socket.remoteAddress}`;
    let item = limits.get(key);
    if (!item || item.until <= Date.now()) item = { count: 0, until: Date.now() + 15 * 60_000 };
    item.count++; limits.set(key, item);
    if (item.count > maximum) fail(429, 'rate_limit');
  }
  function userFor(req) {
    const token = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    return db.prepare(`SELECT u.id,u.username,u.role FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires_at>?`).get(hash(token), Date.now()) || null;
  }
  function authenticated(req, admin = false) {
    const user = userFor(req);
    if (!user) fail(401, 'sign_in_required');
    if (admin && user.role !== 'admin') fail(403, 'admin_required');
    return user;
  }
  function setSession(res, userId) {
    const token = randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(token), userId, Date.now() + 7 * 86400000);
    res.setHeader('Set-Cookie', `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secureCookies ? '; Secure' : ''}`);
  }
  function canRead(report, user) { return PUBLIC.includes(report.status) || user?.role === 'admin' || report.user_id === user?.id; }
  function getReport(id, user) {
    const report = db.prepare('SELECT * FROM reports WHERE id=?').get(id);
    if (!report || !canRead(report, user)) fail(404, 'not_found');
    return report;
  }
  function serialize(report) {
    const result = { ...report };
    delete result.user_id; delete result.request_id;
    result.photos = db.prepare('SELECT kind FROM photos WHERE report_id=?').all(report.id).map(p => p.kind);
    result.attachments=db.prepare('SELECT slot,mime,length(bytes) AS size FROM report_media WHERE report_id=? ORDER BY slot').all(report.id);
    if(!result.photos.includes('before')&&result.attachments.some(item=>item.mime.startsWith('image/')))result.photos.push('before');
    result.brief = db.prepare('SELECT goal,resources,urgency FROM project_briefs WHERE report_id=?').get(report.id) || { goal:'', resources:'', urgency:'normal' };
    result.community = db.prepare(`SELECT
      (SELECT COUNT(*) FROM team_members WHERE report_id=?) AS members,
      (SELECT COUNT(*) FROM project_tasks WHERE report_id=? AND status='done') AS completedTasks,
      (SELECT COUNT(*) FROM project_tasks WHERE report_id=?) AS totalTasks,
      (SELECT COUNT(*) FROM report_supporters WHERE report_id=?) AS supporters`).get(report.id,report.id,report.id,report.id);
    return result;
  }
  function json(res, status, value) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(value));
  }
  function transaction(fn) {
    db.exec('BEGIN IMMEDIATE');
    try { const result = fn(); db.exec('COMMIT'); return result; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://tile.openstreetmap.org; media-src 'self' blob:; connect-src 'self' https://api.open-meteo.com https://air-quality-api.open-meteo.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
    try {
      const url = new URL(req.url, 'http://localhost');
      const path = url.pathname;
      const method = req.method;
      if (path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store');
        if (!['GET','POST','PATCH'].includes(method)) fail(405, 'method_not_allowed');
        if (method !== 'GET') {
          if (req.headers['x-green-request'] !== '1') fail(403, 'invalid_origin');
          if (req.headers.origin) {
            let origin;
            try { origin = new URL(req.headers.origin); } catch { fail(403, 'invalid_origin'); }
            if (origin.host !== req.headers.host || !['http:','https:'].includes(origin.protocol)) fail(403, 'invalid_origin');
          }
        }
        if (path === '/api/health' && method === 'GET') return json(res, 200, { ok: true, app: 'green-kurdistan', features: ['community-projects','climate-history','report-media','regional-cities'],schemaVersion:db.prepare('PRAGMA user_version').get().user_version,cityCount:Object.keys(require('../js/vendor/kurdistan-cities')).length });
        if (await communityRoutes({ req,res,path,method,url,db,userFor,authenticated,getReport,field,photo,body,json,fail,transaction,rate,now })) return;
        if (path === '/api/climate/history' && method === 'GET') {
          rate(req,'climate',120);
          try { return json(res,200,await climate.history(url.searchParams)); }
          catch(error) { if(error.status) return json(res,error.status,{error:error.code}); throw error; }
        }
        if (path === '/api/session' && method === 'GET') return json(res, 200, { user: userFor(req) });
        if (['/api/register','/api/login'].includes(path) && method === 'POST') {
          rate(req, 'auth', 30);
          const data = await body(req);
          const username = field(data.username, 3, 32).toLowerCase();
          if (!/^[a-z0-9_]+$/.test(username) || typeof data.password !== 'string' || data.password.length > 128) fail(400, 'invalid_credentials_format');
          if (path === '/api/register') {
            if (data.password.length < 12) fail(400, 'password_short');
            if (db.prepare('SELECT id FROM users WHERE username=?').get(username)) fail(409, 'username_taken');
            const salt = randomBytes(16).toString('hex');
            const secret = (await derive(data.password, salt, 64)).toString('hex');
            // Recheck after asynchronous password hashing to handle simultaneous registrations.
            if (db.prepare('SELECT id FROM users WHERE username=?').get(username)) fail(409, 'username_taken');
            const result = db.prepare('INSERT INTO users(username,password,created_at) VALUES (?,?,?)').run(username, `${salt}:${secret}`, now());
            setSession(res, Number(result.lastInsertRowid));
            return json(res, 201, { user: { id: Number(result.lastInsertRowid), username, role: 'member' } });
          }
          const account = db.prepare('SELECT * FROM users WHERE username=?').get(username);
          const [salt, digest] = account ? account.password.split(':') : ['00000000000000000000000000000000','00'.repeat(64)];
          const calculated = await derive(data.password, salt, 64);
          if (!account || !timingSafeEqual(calculated, Buffer.from(digest,'hex'))) fail(401, 'incorrect_login');
          setSession(res, account.id);
          return json(res, 200, { user: { id: account.id, username: account.username, role: account.role } });
        }
        if (path === '/api/logout' && method === 'POST') {
          await body(req);
          const token = (req.headers.cookie || '').match(/(?:^|;\s*)green_session=([a-f0-9]{64})(?:;|$)/)?.[1];
          if (token) db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));
          res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureCookies ? '; Secure' : ''}`);
          return json(res, 200, { ok: true });
        }
        if (path === '/api/stats' && method === 'GET') {
          const counts = db.prepare("SELECT status,COUNT(*) AS count FROM reports WHERE status IN ('reviewed','in_progress','resolved') GROUP BY status").all();
          const areas = db.prepare("SELECT area,COUNT(*) AS count FROM reports WHERE status IN ('reviewed','in_progress','resolved') GROUP BY area ORDER BY count DESC").all();
          const categories = db.prepare("SELECT category,COUNT(*) AS count FROM reports WHERE status IN ('reviewed','in_progress','resolved') GROUP BY category ORDER BY count DESC").all();
          const pending = userFor(req)?.role === 'admin' ? db.prepare("SELECT COUNT(*) AS count FROM reports WHERE status='submitted'").get().count : null;
          return json(res, 200, { counts, areas, categories, pending });
        }
        if (path === '/api/reports' && method === 'GET') {
          const user = userFor(req), scope = url.searchParams.get('scope') || 'public';
          const where = [], values = [];
          if (scope === 'mine') { if (!user) fail(401, 'sign_in_required'); where.push('user_id=?'); values.push(user.id); }
          else if (scope === 'teams') { if (!user) fail(401, 'sign_in_required'); where.push("id IN (SELECT report_id FROM team_members WHERE user_id=?) AND status IN ('reviewed','in_progress','resolved')"); values.push(user.id); }
          else if (scope === 'admin') { authenticated(req, true); where.push('1=1'); }
          else if (scope === 'public') where.push("status IN ('reviewed','in_progress','resolved')");
          else fail(400, 'invalid_input');
          for (const [key, allowed] of [['area',AREAS],['category',CATEGORIES],['status',STATUSES]]) {
            const value = url.searchParams.get(key);
            if (value) { if (!allowed.includes(value)) fail(400, 'invalid_input'); where.push(`${key}=?`); values.push(value); }
          }
          const q = url.searchParams.get('q')?.trim();
          if (q) { if (q.length > 100) fail(400, 'invalid_input'); where.push("(title LIKE ? ESCAPE '\\' OR location LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')"); const term = `%${q.replace(/[\\%_]/g,'\\$&')}%`; values.push(term,term,term); }
          const page = Number(url.searchParams.get('page') || 1);
          if (!Number.isSafeInteger(page) || page < 1 || page > 100000) fail(400, 'invalid_input');
          const condition = where.join(' AND ');
          const total = db.prepare(`SELECT COUNT(*) AS count FROM reports WHERE ${condition}`).get(...values).count;
          const rows = db.prepare(`SELECT * FROM reports WHERE ${condition} ORDER BY updated_at DESC,id DESC LIMIT 12 OFFSET ?`).all(...values,(page-1)*12);
          return json(res, 200, { reports: rows.map(serialize), total, page, pages: Math.ceil(total/12) });
        }
        if (path === '/api/reports' && method === 'POST') {
          const user = authenticated(req); rate(req, 'report', 40);
          const data = await body(req,64*1024*1024);
          const requestId = field(data.requestId, 16, 80);
          if (!/^[a-zA-Z0-9-]+$/.test(requestId)) fail(400,'invalid_input');
          const existing = db.prepare('SELECT * FROM reports WHERE user_id=? AND request_id=?').get(user.id, requestId);
          if (existing) return json(res, 200, { report: serialize(existing) });
          const title = field(data.title, 5, 120), location = field(data.location, 3, 180), description = field(data.description, 15, 10000);
          const goal = field(data.goal ?? '',0,2000), resources = field(data.resources ?? '',0,1500), urgency = data.urgency ?? 'normal';
          if (!['normal','high'].includes(urgency)) fail(400,'invalid_input');
          if (!CATEGORIES.includes(data.category) || !AREAS.includes(data.area)) fail(400, 'invalid_input');
          const latitude = data.latitude ?? null, longitude = data.longitude ?? null;
          if ((latitude === null) !== (longitude === null) || latitude !== null && (typeof latitude !== 'number' || typeof longitude !== 'number' || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)) fail(400,'invalid_coordinates');
          const before = photo(data.photo);
          const media=attachments(data.attachments,photo,fail);
          if(before&&media.length)fail(400,'invalid_attachments');
          const id = transaction(() => {
            const timestamp = now();
            const result = db.prepare('INSERT INTO reports(user_id,request_id,title,category,area,location,description,latitude,longitude,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(user.id,requestId,title,data.category,data.area,location,description,latitude,longitude,timestamp,timestamp);
            const reportId = Number(result.lastInsertRowid);
            db.prepare('INSERT INTO project_briefs(report_id,goal,resources,urgency) VALUES (?,?,?,?)').run(reportId,goal,resources,urgency);
            if (before) db.prepare('INSERT INTO photos VALUES (?,?,?,?)').run(reportId,'before',before.mime,before.bytes);
            media.forEach((item,i)=>db.prepare('INSERT INTO report_media VALUES (?,?,?,?)').run(reportId,i+1,item.mime,item.bytes));
            db.prepare('INSERT INTO history(report_id,actor_id,status,note,team,created_at) VALUES (?,?,?,?,?,?)').run(reportId,user.id,'submitted','','',timestamp);
            return reportId;
          });
          return json(res, 201, { report: serialize(getReport(id,user)) });
        }
        const detail = path.match(/^\/api\/reports\/([1-9][0-9]{0,9})$/);
        if (detail && method === 'GET') {
          const report = getReport(Number(detail[1]), userFor(req));
          return json(res, 200, { report: { ...serialize(report), history: db.prepare('SELECT status,note,team,created_at FROM history WHERE report_id=? ORDER BY id').all(report.id) } });
        }
        if (detail && method === 'PATCH') {
          const user = authenticated(req,true), data = await body(req);
          const report = getReport(Number(detail[1]),user);
          if (!Number.isInteger(data.version) || data.version !== report.version) fail(409,'version_conflict');
          const transitions = { submitted:['reviewed','rejected'], reviewed:['in_progress','rejected'], in_progress:['resolved','reviewed'], resolved:['in_progress'], rejected:['reviewed'] };
          if (!STATUSES.includes(data.status) || data.status !== report.status && !transitions[report.status].includes(data.status)) fail(400,'invalid_transition');
          const note = field(data.note, 5, 1500), team = field(data.team ?? '', 0, 100);
          const after = photo(data.photo);
          if (after && data.status !== 'resolved') fail(400,'resolution_only');
          const timestamp = now();
          transaction(() => {
            db.prepare('UPDATE reports SET status=?,team=?,resolution=?,updated_at=?,version=version+1 WHERE id=?').run(data.status,team,data.status === 'resolved' ? note : '',timestamp,report.id);
            if (after) db.prepare('INSERT INTO photos VALUES (?,?,?,?) ON CONFLICT(report_id,kind) DO UPDATE SET mime=excluded.mime,bytes=excluded.bytes').run(report.id,'after',after.mime,after.bytes);
            if (data.status !== 'resolved' && report.status === 'resolved') db.prepare("DELETE FROM photos WHERE report_id=? AND kind='after'").run(report.id);
            db.prepare('INSERT INTO history(report_id,actor_id,status,note,team,created_at) VALUES (?,?,?,?,?,?)').run(report.id,user.id,data.status,note,team,timestamp);
          });
          return json(res,200,{ report: serialize(getReport(report.id,user)) });
        }
        const attachment=path.match(/^\/api\/reports\/([1-9][0-9]{0,9})\/attachments\/([1-3])$/);
        if(attachment&&method==='GET'){
          const report=getReport(Number(attachment[1]),userFor(req));
          const data=db.prepare('SELECT mime,bytes FROM report_media WHERE report_id=? AND slot=?').get(report.id,Number(attachment[2]));
          if(!data)fail(404,'not_found');return sendMedia(req,res,data,fail);
        }
        const image = path.match(/^\/api\/reports\/([1-9][0-9]{0,9})\/photos\/(before|after)$/);
        if (image && method === 'GET') {
          const report = getReport(Number(image[1]),userFor(req));
          const data = db.prepare('SELECT mime,bytes FROM photos WHERE report_id=? AND kind=?').get(report.id,image[2]) || (image[2]==='before'?db.prepare("SELECT mime,bytes FROM report_media WHERE report_id=? AND mime LIKE 'image/%' ORDER BY slot LIMIT 1").get(report.id):null);
          if (!data) fail(404,'not_found');
          res.writeHead(200, { 'Content-Type': data.mime, 'Content-Length': data.bytes.length, 'Cache-Control':'no-store', 'Content-Disposition':'inline' });
          return res.end(Buffer.from(data.bytes));
        }
        fail(404,'not_found');
      }
      if (!['GET','HEAD'].includes(method)) fail(405,'method_not_allowed');
      const pathname = path === '/' ? '/index.html' : path;
      const allowed = /^\/(?:index|weather|climate|actions|toolkit|impact|reports|404)\.html$/.test(pathname)
        || /^\/(?:css|js|img)\/[a-zA-Z0-9_./-]+\.(?:css|js|svg|jpg|png|webp)$/.test(pathname)
        || ['/sw.js','/icon.svg','/icon.png','/favicon.ico','/site.webmanifest','/robots.txt'].includes(pathname);
      if (!allowed || pathname.includes('..')) fail(404,'not_found');
      let bytes;
      try { bytes = await readFile(resolve(root, '.' + pathname)); } catch { fail(404,'not_found'); }
      const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.txt':'text/plain; charset=utf-8'};
      res.writeHead(200, { 'Content-Type': mime[extname(pathname)], 'Content-Length':bytes.length, 'Cache-Control':'no-cache' });
      res.end(method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      if (res.headersSent) { res.end(); return; }
      if (!(error instanceof HttpError)) console.error('Request failed:', error.message);
      json(res, error.status || 500, { error: error.code && error instanceof HttpError ? error.code : 'server_error' });
    }
  });
  server.requestTimeout = 120_000;
  server.headersTimeout = 15_000;
  server.on('close', () => { clearInterval(cleanup); db.close(); });
  return { server, db };
}
if (require.main === module) {
  const port = Number(process.env.PORT || 3000), host = process.env.HOST || '127.0.0.1';
  const { server } = createApp();
  server.on('error', error => { console.error(`Server could not start: ${error.message}`); process.exitCode = 1; });
  server.listen(port, host, () => console.log(`Green Kurdistan: http://${host}:${port}/reports.html\nRegister an account, then run: node server/manage.js promote YOUR_USERNAME\nNo default administrator account is created.`));
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close());
}
module.exports = { createApp, CATEGORIES, AREAS, STATUSES };
