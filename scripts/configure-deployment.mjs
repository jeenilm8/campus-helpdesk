import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const id=process.env.CLOUDFLARE_DATABASE_ID;
const name=process.env.CLOUDFLARE_WORKER_NAME||'campus-helpdesk';
if(!id||!/^[a-z0-9-]+$/.test(id))throw new Error('Set the CLOUDFLARE_DATABASE_ID repository variable to your D1 database ID.');
if(!/^[a-z][a-z0-9-]{1,62}$/.test(name))throw new Error('Choose a valid CLOUDFLARE_WORKER_NAME.');
mkdirSync('.sites-runtime',{recursive:true});
writeFileSync('.sites-runtime/wrangler.deploy.json',JSON.stringify({
 name,main:resolve('dist/server/index.js'),compatibility_date:'2026-05-15',compatibility_flags:['nodejs_compat'],
 assets:{directory:resolve('dist/client')},
 d1_databases:[{binding:'DB',database_name:'campus-helpdesk',database_id:id,migrations_dir:resolve('drizzle')}],
 observability:{enabled:true},
},null,2));
console.log('Deployment configuration prepared.');
