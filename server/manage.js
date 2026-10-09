// Administrator access is granted only by the person operating the server.
const { openStore } = require('./store');
const [command, username] = process.argv.slice(2);
if (!['promote', 'demote'].includes(command) || !username) {
  console.error('Usage: node server/manage.js promote|demote USERNAME');
  process.exitCode = 1;
} else {
  const db = openStore();
  try {
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (!user) throw new Error('Account not found. Register this username on the site first.');
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(command === 'promote' ? 'admin' : 'member', user.id);
    // A fresh sign-in is required after a role change.
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
    console.log(`Account role updated. Sign in again to use the new permissions.`);
  } catch (error) {
    console.error(error.message); process.exitCode = 1;
  } finally { db.close(); }
}
