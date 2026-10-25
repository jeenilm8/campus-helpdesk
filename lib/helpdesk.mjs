import { ApiError, requiredText, validateComplaint, validateRegistration, canView, checkTransition } from './domain.mjs';
import { digest, hashPassword, verifyPassword, sessionCookie, sessionToken } from './auth.mjs';

const publicUser = u => ({id:u.id, name:u.name, email:u.email, role:u.role, department:u.department});
const selectedComplaint = `SELECT c.*, s.name AS student_name, a.name AS assignee_name, a.department AS assignee_department,
  (SELECT COUNT(*) FROM comments WHERE complaint_id = c.id) AS comment_count
  FROM complaints c JOIN users s ON c.student_id=s.id LEFT JOIN users a ON c.assignee_id=a.id`;
const json = (data, status=200, extra={}) => new Response(JSON.stringify(data), {status, headers:{
  'Content-Type':'application/json', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', ...extra}});
const resultRows = async stmt => (await stmt.all()).results || [];

// This is an intentional classroom demonstration. It must be disabled before real campus use.
export async function seedDemo(db) {
  if (await db.prepare("SELECT value FROM settings WHERE key='demo_seeded'").first()) return;
  const now = Date.now();
  const people = [
    ['demo-student','Jeenil Makwana','student@campus.demo','student','Computer Engineering'],
    ['demo-student-2','Aarav Patel','aarav@campus.demo','student','Information Technology'],
    ['demo-admin','Campus Administrator','admin@campus.demo','admin','Campus Operations'],
    ['demo-staff','Riya Shah','staff@campus.demo','staff','IT & Network'],
    ['demo-staff-2','Kunal Mehta','facilities@campus.demo','staff','Campus Facilities'],
  ];
  const password = await hashPassword('CampusDemo123!');
  const statements = people.map(p => db.prepare('INSERT OR IGNORE INTO users (id,name,email,role,department,password_hash,created_at) VALUES (?,?,?,?,?,?,?)').bind(...p,password,now));
  const samples = [
    ['CH-1001','Wi-Fi keeps disconnecting in the library','The library Wi-Fi disconnects every few minutes on the second floor. Several students are unable to access study material.','IT & Network','Central Library · Floor 2','High','In Progress','demo-student','demo-staff',5],
    ['CH-1002','Projector display is blurry','The projector in Room 204 shows blurred text even after adjusting the focus. Please check it before our next lecture.','Classroom','Academic Block A · Room 204','Medium','Assigned','demo-student','demo-staff',3],
    ['CH-1003','Drinking water tap is leaking','The drinking water tap near the canteen keeps leaking after it is closed. Water is collecting on the floor.','Plumbing','Student Canteen · Entrance','High','Open','demo-student',null,1],
    ['CH-1004','Replace flickering classroom lights','Two ceiling lights in Room 105 keep flickering during lectures. The issue was noticed throughout the morning session.','Electrical','Academic Block B · Room 105','Medium','Resolved','demo-student','demo-staff-2',7],
    ['CH-1005','Classroom needs cleaning after event','Room 301 needs cleaning following the department event. Please arrange cleaning before tomorrow morning.','Housekeeping','Academic Block A · Room 301','Low','Resolved','demo-student','demo-staff-2',6],
    ['CH-1006','Computer lab keyboard is not working','The keyboard on workstation 12 does not respond. Restarting the computer and reconnecting the keyboard did not help.','IT & Network','Computer Lab · Workstation 12','Medium','Open','demo-student',null,0.4],
    ['CH-1007','Loose electrical socket in seminar hall','A wall socket near the rear seating area is loose. Please inspect and secure it before the next seminar.','Electrical','Seminar Hall · Rear seating','High','Assigned','demo-student-2','demo-staff-2',2],
    ['CH-1008','Network printer is offline','The shared printer in the department office appears offline on all computers. Please restore the connection.','IT & Network','IT Department · Office','Low','In Progress','demo-student-2','demo-staff',4],
  ];
  for (const sample of samples) {
    const [id,title,description,category,location,priority,status,student,assignee,days] = sample;
    const created = now - days * 86400000;
    statements.push(db.prepare('INSERT OR IGNORE INTO complaints (id,title,description,category,location,priority,status,student_id,assignee_id,created_at,updated_at,resolved_at,revision) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)').bind(id,title,description,category,location,priority,status,student,assignee,created,created+1800000,status==='Resolved'?created+7200000:null));
    statements.push(db.prepare('INSERT OR IGNORE INTO events (id,complaint_id,actor_id,message,created_at) VALUES (?,?,?,?,?)').bind('seed-'+id,id,student,'Submitted the complaint',created));
    if(assignee) statements.push(db.prepare('INSERT OR IGNORE INTO events (id,complaint_id,actor_id,message,created_at) VALUES (?,?,?,?,?)').bind('assigned-'+id,id,'demo-admin',`Assigned to ${people.find(p=>p[0]===assignee)[1]}`,created+600000));
    if(status==='In Progress'||status==='Resolved') statements.push(db.prepare('INSERT OR IGNORE INTO events (id,complaint_id,actor_id,message,created_at) VALUES (?,?,?,?,?)').bind('progress-'+id,id,assignee,'Changed status to In Progress',created+1800000));
    if(status==='Resolved') statements.push(db.prepare('INSERT OR IGNORE INTO events (id,complaint_id,actor_id,message,created_at) VALUES (?,?,?,?,?)').bind('resolved-'+id,id,assignee,'Changed status to Resolved',created+7200000));
  }
  statements.push(db.prepare('INSERT OR IGNORE INTO comments (id,complaint_id,author_id,body,created_at) VALUES (?,?,?,?,?)').bind('seed-comment','CH-1001','demo-staff','I have checked the access point. We are replacing the network cable and will share an update shortly.',now-4.5*86400000));
  statements.push(db.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('demo_seeded','1')"));
  await db.batch(statements);
}

async function newSession(db, user, request) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expires=Date.now()+28800000;
  await db.batch([
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now()),
    db.prepare('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(await digest(token),user.id,expires),
  ]);
  return json({user:publicUser(user)},200,{'Set-Cookie':sessionCookie(token,new URL(request.url).protocol==='https:')});
}
async function requireUser(db,request) {
  const token=sessionToken(request);
  const user=token && await db.prepare('SELECT u.* FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?').bind(await digest(token),Date.now()).first();
  if(!user) throw new ApiError(401,'Please sign in to continue.');
  return user;
}
async function readBody(request) {
  if(!request.headers.get('content-type')?.includes('application/json')) throw new ApiError(415,'Send the request as JSON.');
  const body=await request.text();
  if(body.length>16000) throw new ApiError(413,'The request is too large.');
  try { const data=JSON.parse(body); if(!data || typeof data!=='object'||Array.isArray(data)) throw 0; return data; }
  catch { throw new ApiError(400,'Enter valid request data.'); }
}
async function getComplaint(db,id,user) {
  const c=await db.prepare(selectedComplaint+' WHERE c.id=?').bind(id).first();
  if(!c || !canView(user,c)) throw new ApiError(404,'Complaint not found.');
  return c;
}

export async function handleApi(request,db) {
  try {
    if(!db) throw new ApiError(503,'The database is not connected.');
    const url=new URL(request.url), path=url.pathname.replace(/^\/api\//,'').replace(/\/$/,''), method=request.method;
    if(!['GET','HEAD'].includes(method)) {
      const origin=request.headers.get('origin');
      if((origin && origin!==url.origin) || request.headers.get('sec-fetch-site')==='cross-site') throw new ApiError(403,'This request came from a different website.');
    }
    if(path==='health'&&method==='GET') {await db.prepare('SELECT 1').first();return json({status:'ok',version:'1.0.0',database:'connected'});}
    if(path==='auth/demo'&&method==='POST') {
      const data=await readBody(request);
      if(!['student','admin','staff'].includes(data.role)) throw new ApiError(400,'Choose a valid demo role.');
      await seedDemo(db);
      const user=await db.prepare('SELECT * FROM users WHERE id=?').bind('demo-'+data.role).first();
      return await newSession(db,user,request);
    }
    if(path==='auth/register'&&method==='POST') {
      const data=validateRegistration(await readBody(request));
      if(await db.prepare('SELECT id FROM users WHERE email=?').bind(data.email).first()) throw new ApiError(409,'An account already exists with this email.');
      const user={...data,id:crypto.randomUUID(),role:'student'};
      try { await db.prepare('INSERT INTO users (id,name,email,password_hash,role,department,created_at) VALUES (?,?,?,?,?,?,?)').bind(user.id,user.name,user.email,await hashPassword(data.password),'student',data.department,Date.now()).run(); }
      catch(error) {if(String(error).includes('UNIQUE'))throw new ApiError(409,'An account already exists with this email.');throw error;}
      return await newSession(db,user,request);
    }
    if(path==='auth/login'&&method==='POST') {
      const data=await readBody(request),email=requiredText(data.email,'Email',3,254).toLowerCase(),password=requiredText(data.password,'Password',1,128);
      if(email.endsWith('@campus.demo')) await seedDemo(db);
      const key=await digest(email),now=Date.now();
      const attempts=await db.prepare('SELECT * FROM login_attempts WHERE key=?').bind(key).first();
      if(attempts && attempts.expires_at>now && attempts.count>=5) throw new ApiError(429,'Too many attempts. Try again in 15 minutes.');
      const user=await db.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
      const fallback='pbkdf2$100000$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000';
      const valid=await verifyPassword(password,user?.password_hash||fallback);
      if(!user || !valid) {
        await db.prepare('INSERT INTO login_attempts (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at>? THEN count+1 ELSE 1 END, expires_at=CASE WHEN expires_at>? THEN expires_at ELSE ? END').bind(key,now+900000,now,now,now+900000).run();
        throw new ApiError(401,'Email or password is incorrect.');
      }
      await db.prepare('DELETE FROM login_attempts WHERE key=?').bind(key).run();
      return await newSession(db,user,request);
    }
    const user=await requireUser(db,request);
    if(path==='auth/me'&&method==='GET')return json({user:publicUser(user)});
    if(path==='auth/logout'&&method==='POST') {
      const token=sessionToken(request);await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await digest(token)).run();
      return json({ok:true},200,{'Set-Cookie':sessionCookie('',new URL(request.url).protocol==='https:',true)});
    }
    if(path==='staff'&&method==='GET') {
      if(user.role!=='admin')throw new ApiError(403,'Only administrators can view the staff directory.');
      return json({staff:await resultRows(db.prepare("SELECT u.id,u.name,u.department,u.email,COUNT(c.id) AS assigned_count,SUM(CASE WHEN c.status!='Resolved' THEN 1 ELSE 0 END) AS active_count FROM users u LEFT JOIN complaints c ON c.assignee_id=u.id WHERE u.role='staff' GROUP BY u.id ORDER BY u.name"))});
    }
    if(path==='complaints'&&method==='GET') {
      const where=user.role==='student'?' WHERE c.student_id=?':user.role==='staff'?' WHERE c.assignee_id=?':'';
      let stmt=db.prepare(selectedComplaint+where+' ORDER BY c.created_at DESC');
      if(where)stmt=stmt.bind(user.id);
      return json({complaints:await resultRows(stmt)});
    }
    if(path==='complaints'&&method==='POST') {
      if(user.role!=='student')throw new ApiError(403,'Only students can submit complaints.');
      const data=validateComplaint(await readBody(request)),id='CH-'+crypto.randomUUID().slice(0,8).toUpperCase(),now=Date.now();
      await db.batch([
        db.prepare("INSERT INTO complaints (id,title,description,category,location,priority,status,student_id,created_at,updated_at,revision) VALUES (?,?,?,?,?,?,'Open',?,?,?,1)").bind(id,data.title,data.description,data.category,data.location,data.priority,user.id,now,now),
        db.prepare('INSERT INTO events (id,complaint_id,actor_id,message,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),id,user.id,'Submitted the complaint',now),
      ]);
      return json({complaint:await getComplaint(db,id,user)},201);
    }
    const match=path.match(/^complaints\/([^/]+)(?:\/(comments))?$/);
    if(match) {
      const c=await getComplaint(db,decodeURIComponent(match[1]),user);
      if(!match[2]&&method==='GET') {
        const comments=await resultRows(db.prepare('SELECT c.*,u.name AS author_name,u.role AS author_role FROM comments c JOIN users u ON c.author_id=u.id WHERE c.complaint_id=? ORDER BY c.created_at,c.id').bind(c.id));
        const events=await resultRows(db.prepare('SELECT e.*,u.name AS actor_name FROM events e JOIN users u ON e.actor_id=u.id WHERE e.complaint_id=? ORDER BY e.created_at,e.id').bind(c.id));
        return json({complaint:c,comments,events});
      }
      if(match[2]==='comments'&&method==='POST') {
        const data=await readBody(request),body=requiredText(data.body,'Comment',1,2000),now=Date.now();
        await db.batch([
          db.prepare('INSERT INTO comments (id,complaint_id,author_id,body,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),c.id,user.id,body,now),
          db.prepare('INSERT INTO events (id,complaint_id,actor_id,message,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),c.id,user.id,'Added a comment',now),
        ]);return json({ok:true},201);
      }
      if(!match[2]&&method==='PATCH') {
        if(user.role==='student')throw new ApiError(403,'Only staff and administrators can update complaints.');
        const data=await readBody(request);
        if(!Number.isInteger(data.revision)||data.revision!==c.revision)throw new ApiError(409,'This complaint has changed. Refresh and try again.');
        let status=c.status,assignee=c.assignee_id,message='';
        if(data.action==='assign') {
          if(user.role!=='admin')throw new ApiError(403,'Only administrators can assign staff.');
          if(c.status==='Resolved')throw new ApiError(400,'Reopen the complaint before reassigning it.');
          const staff=await db.prepare("SELECT id,name FROM users WHERE id=? AND role='staff'").bind(requiredText(data.assignee_id,'Staff member')).first();
          if(!staff)throw new ApiError(400,'Choose a valid staff member.');
          if(staff.id===assignee)throw new ApiError(400,'This staff member is already assigned.');
          assignee=staff.id;status=c.status==='Open'?'Assigned':c.status;message=`Assigned to ${staff.name}`;
        } else if(data.action==='status') {
          checkTransition(c.status,data.status);
          status=data.status;message=`Changed status to ${status}`;
        } else throw new ApiError(400,'Choose a valid update action.');
        const now=Date.now();
        const result=await db.batch([
          db.prepare('UPDATE complaints SET status=?,assignee_id=?,updated_at=?,resolved_at=?,revision=revision+1 WHERE id=? AND revision=?').bind(status,assignee,now,status==='Resolved'?now:null,c.id,c.revision),
          db.prepare('INSERT INTO events (id,complaint_id,actor_id,message,created_at) SELECT ?,?,?,?,? WHERE changes()=1').bind(crypto.randomUUID(),c.id,user.id,message,now),
        ]);
        if(result[0].meta.changes!==1)throw new ApiError(409,'This complaint has changed. Refresh and try again.');
        return json({complaint:await getComplaint(db,c.id,user)});
      }
    }
    throw new ApiError(404,'This endpoint does not exist.');
  } catch(error) {
    if(error instanceof ApiError)return json({error:error.message},error.status);
    console.error('Helpdesk request failed:',error instanceof Error?error.message:'unknown error');
    return json({error:'Something went wrong. Please try again.'},500);
  }
}
