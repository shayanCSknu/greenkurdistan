const { DatabaseSync } = require('node:sqlite');
const { mkdirSync } = require('node:fs');
const { dirname, resolve } = require('node:path');

function openStore(filename = process.env.DATA_FILE || resolve(__dirname, '../data/reports.sqlite')) {
  if (filename !== ':memory:') mkdirSync(dirname(resolve(filename)), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','admin')),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
      request_id TEXT NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL,
      area TEXT NOT NULL, location TEXT NOT NULL, description TEXT NOT NULL,
      latitude REAL, longitude REAL, status TEXT NOT NULL DEFAULT 'submitted',
      team TEXT NOT NULL DEFAULT '', resolution TEXT NOT NULL DEFAULT '',
      version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      UNIQUE(user_id, request_id)
    );
    CREATE TABLE IF NOT EXISTS photos (
      report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK(kind IN ('before','after')), mime TEXT NOT NULL, bytes BLOB NOT NULL,
      PRIMARY KEY(report_id, kind)
    );
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY, report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      actor_id INTEGER NOT NULL REFERENCES users(id), status TEXT NOT NULL,
      note TEXT NOT NULL, team TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS reports_status_area ON reports(status, area);
    CREATE INDEX IF NOT EXISTS reports_owner ON reports(user_id);
    CREATE INDEX IF NOT EXISTS history_report ON history(report_id, id);
    CREATE TABLE IF NOT EXISTS project_briefs (
      report_id INTEGER PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
      goal TEXT NOT NULL DEFAULT '', resources TEXT NOT NULL DEFAULT '',
      urgency TEXT NOT NULL DEFAULT 'normal' CHECK(urgency IN ('normal','high'))
    );
    CREATE TABLE IF NOT EXISTS community_teams (
      report_id INTEGER PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
      name TEXT NOT NULL, plan TEXT NOT NULL, leader_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS team_members (
      report_id INTEGER NOT NULL REFERENCES community_teams(report_id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id), contribution TEXT NOT NULL DEFAULT '',
      joined_at TEXT NOT NULL, PRIMARY KEY(report_id,user_id)
    );
    CREATE TABLE IF NOT EXISTS project_tasks (
      id INTEGER PRIMARY KEY, report_id INTEGER NOT NULL REFERENCES community_teams(report_id) ON DELETE CASCADE,
      title TEXT NOT NULL, due_date TEXT NOT NULL DEFAULT '',
      assignee_id INTEGER REFERENCES users(id), status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','doing','done')),
      created_by INTEGER NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS community_updates (
      id INTEGER PRIMARY KEY, report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      kind TEXT NOT NULL CHECK(kind IN ('discussion','progress','resolution_request')),
      content TEXT NOT NULL, photo_mime TEXT, photo_bytes BLOB,
      hidden INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS report_supporters (
      report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id), PRIMARY KEY(report_id,user_id)
    );
    CREATE INDEX IF NOT EXISTS members_user ON team_members(user_id,report_id);
    CREATE INDEX IF NOT EXISTS tasks_report ON project_tasks(report_id,id);
    CREATE INDEX IF NOT EXISTS updates_report ON community_updates(report_id,id);
    PRAGMA user_version = 2;
  `);
  return db;
}
module.exports = { openStore };
