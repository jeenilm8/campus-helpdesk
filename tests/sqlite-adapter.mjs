import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
// A real SQLite adapter with the small D1 interface used by the production API.
// Tests execute actual SQL and the same handler as production; no mocked permissions.
export function testDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys=ON');
  for (const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())
    sqlite.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
  const db = {
    prepare(sql) {
      let args=[];
      return {
        bind(...values) {args=values;return this;},
        async first() {return sqlite.prepare(sql).get(...args)||null;},
        async all() {return {results:sqlite.prepare(sql).all(...args)};},
        async run() {const r=sqlite.prepare(sql).run(...args);return {success:true,meta:{changes:Number(r.changes)}};},
      };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {const results=[];for(const statement of statements)results.push(await statement.run());sqlite.exec('COMMIT');return results;}
      catch(e){sqlite.exec('ROLLBACK');throw e;}
    },
    close(){sqlite.close();},
  };
  return db;
}
