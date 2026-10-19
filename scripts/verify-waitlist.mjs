import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
const url = 'file:/home/user/xr-site/.local/waitlist.db';
const db = createClient({ url, authToken: 'local' });
const sql = readFileSync('/home/user/xr-site/schema/001_waitlist.sql','utf8')
  .split(';')
  .map((s) => s.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n').trim())
  .filter((s) => s.length > 0);
for (const s of sql) await db.execute(s);
console.log('# schema applied');
const insert = async (email, source) => {
  const before = await db.execute('SELECT email FROM waitlist WHERE email = ?', [email]);
  if (before.rows.length > 0) return 'already-subscribed';
  await db.execute({ sql: 'INSERT INTO waitlist (email, source) VALUES (?, ?) ON CONFLICT(email) DO NOTHING', args: [email, source] });
  return 'subscribed';
};
console.log('# first insert           ->', await insert('owner-check@rrrtx-systems.com','hero'));
console.log('# duplicate insert       ->', await insert('owner-check@rrrtx-systems.com','footer'));
console.log('# second distinct insert ->', await insert('second-check@rrrtx-systems.com','footer'));
const rows = await db.execute('SELECT email, source, created_at FROM waitlist ORDER BY created_at DESC');
console.log('# rows in table:', rows.rows.length);
for (const r of rows.rows) console.log(`#   ${r.email}  source=${r.source}  at=${r.created_at}`);
const pk = await db.execute("SELECT sql FROM sqlite_master WHERE name='waitlist'");
console.log('# table definition:\n#   ' + String(pk.rows[0].sql).split('\n').join('\n#   '));
const dup = rows.rows.filter(r=>r.email==='owner-check@rrrtx-systems.com');
console.log(dup.length===1 ? '# RESULT: duplicate produced exactly one row — the primary key holds.' : `# RESULT: FAILURE — ${dup.length} rows`);
