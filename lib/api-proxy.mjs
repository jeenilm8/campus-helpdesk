const reply = (error, status) => Response.json({error}, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

/** A server-side bridge to the existing private SQL-backed API.
 * The application session still determines the student's/staff member's permissions.
 * The service credential only authenticates this server to the private host.
 */
export async function proxyApi(request, config, fetcher = fetch) {
  if(!config.origin || !config.token) return reply('The backend connection is not configured.',503);
  let target;
  try {
    const configured=new URL(config.origin);
    if(configured.protocol!=='https:' || configured.username || configured.password || configured.pathname!=='/' || configured.search || configured.hash)
      return reply('The backend connection is not configured.',503);
    const incoming=new URL(request.url);
    if(!incoming.pathname.startsWith('/api/'))return reply('Endpoint not found.',404);
    target=new URL(incoming.pathname+incoming.search,configured.origin);
    // Do not let browser requests change the configured backend or bypass CSRF checks.
    if(target.origin!==configured.origin)return reply('Endpoint not found.',404);
    if(!['GET','HEAD'].includes(request.method)) {
      const origin=request.headers.get('origin');
      if((origin && origin!==incoming.origin)||request.headers.get('sec-fetch-site')==='cross-site')
        return reply('This request came from a different website.',403);
    }
    const headers=new Headers({'Accept':'application/json','OAI-Sites-Authorization':`Bearer ${config.token}`});
    const session=(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>/^campus_session=[a-zA-Z0-9-]+$/.test(v));
    if(session)headers.set('cookie',session);
    let body;
    if(!['GET','HEAD'].includes(request.method)) {
      // Read and bound content before forwarding. The original API validates the JSON fields.
      if(Number(request.headers.get('content-length')||0)>16000)return reply('The request is too large.',413);
      body=await request.text();
      if(new TextEncoder().encode(body).byteLength>16000)return reply('The request is too large.',413);
      headers.set('content-type',request.headers.get('content-type')||'application/json');
      headers.set('origin',configured.origin);
    }
    const upstream=await fetcher(target,{method:request.method,headers,body,cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(25000)});
    // A revoked service connection must not send a sign-in page, redirect, or cookies to the browser.
    if(upstream.status>=300 && upstream.status<400 || !upstream.headers.get('content-type')?.includes('application/json'))
      return reply('The backend is temporarily unavailable. Please try again.',503);
    const output=new Headers({'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    const cookies=upstream.headers.getSetCookie?.()||[upstream.headers.get('set-cookie')].filter(Boolean);
    for(const cookie of cookies) {
      if(cookie.startsWith('campus_session=')) {
        // Scope the app session to the Vercel response host. Never relay platform auth cookies.
        output.append('set-cookie',cookie.replace(/;\s*Domain=[^;]+/ig,''));
      }
    }
    return new Response(upstream.body,{status:upstream.status,headers:output});
  } catch {
    // Do not log request headers or the service credential on connection errors.
    return reply('The backend is temporarily unavailable. Please try again.',503);
  }
}
