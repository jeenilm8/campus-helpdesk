import { test } from 'node:test';
import assert from 'node:assert/strict';
import { proxyApi } from '../lib/api-proxy.mjs';

const config={origin:'https://private-backend.example',token:'test-service-credential'};
const req=(path='complaints',options={})=>new Request('https://campus.example/api/'+path,options);
test('proxy fails closed without a server connection',async()=>{
 let called=false;const r=await proxyApi(req(),{},()=>{called=true;});assert.equal(r.status,503);assert.equal(called,false);
});
test('proxy only sends the service credential to the configured backend and filters request cookies',async()=>{
 const request=req('complaints/CH-1001',{headers:{cookie:'unrelated=secret; campus_session=example-session; __platform_auth=secret',authorization:'Bearer attacker','OAI-Sites-Authorization':'attacker'}});
 const r=await proxyApi(request,config,async(url,options)=>{
  assert.equal(url.href,'https://private-backend.example/api/complaints/CH-1001');
  assert.equal(options.headers.get('OAI-Sites-Authorization'),'Bearer test-service-credential');
  assert.equal(options.headers.get('cookie'),'campus_session=example-session');
  assert.equal(options.headers.get('authorization'),null);assert.equal(options.redirect,'manual');
  return Response.json({complaint:{id:'CH-1001'}});
 });assert.equal(r.status,200);assert.equal((await r.json()).complaint.id,'CH-1001');
});
test('proxy validates browser origin before forwarding mutations',async()=>{
 for(const headers of [{origin:'https://attacker.example'},{'sec-fetch-site':'cross-site'}]) {
  let called=false;const r=await proxyApi(req('auth/demo',{method:'POST',headers,body:'{}'}),config,()=>{called=true;});
  assert.equal(r.status,403);assert.equal(called,false);
 }
});
test('proxy forwards valid JSON without altering it and scopes only the app cookie to this host',async()=>{
 const r=await proxyApi(req('auth/demo',{method:'POST',headers:{origin:'https://campus.example','content-type':'application/json'},body:'{"role":"student"}'}),config,async(url,options)=>{
  assert.equal(options.body,'{"role":"student"}');assert.equal(options.headers.get('origin'),config.origin);
  const response=Response.json({user:{role:'student'}});
  response.headers.append('set-cookie','campus_session=abc; HttpOnly; Secure; SameSite=Lax; Domain=private-backend.example; Path=/');
  response.headers.append('set-cookie','platform_secret=do-not-forward; Path=/');return response;
 });const cookie=r.headers.get('set-cookie');assert.match(cookie,/campus_session=abc/);assert.match(cookie,/HttpOnly/);assert.doesNotMatch(cookie,/Domain=|platform_secret/);
});
test('upstream authentication failures return generic errors without redirects, platform cookies or credentials',async()=>{
 const r=await proxyApi(req(),config,async()=>new Response('<html>Sign in</html>',{status:302,headers:{location:'https://sign-in.example','set-cookie':'platform=secret'}}));
 assert.equal(r.status,503);assert.equal(r.headers.get('location'),null);assert.equal(r.headers.get('set-cookie'),null);assert.doesNotMatch(await r.text(),/test-service-credential|Sign in/);
});
test('proxy preserves backend authorization and conflict responses',async()=>{
 for(const status of [401,403,404,409,429]){const r=await proxyApi(req(),config,async()=>Response.json({error:'Rejected'},{status}));assert.equal(r.status,status);assert.equal(r.headers.get('cache-control'),'no-store');}
});
test('proxy rejects oversized payloads before connecting and returns safe connection errors',async()=>{
 let called=false;const r=await proxyApi(req('complaints',{method:'POST',body:'x'.repeat(16001)}),config,()=>{called=true;});assert.equal(r.status,413);assert.equal(called,false);
 const failed=await proxyApi(req(),config,async()=>{throw new Error('test-service-credential');});assert.equal(failed.status,503);assert.doesNotMatch(await failed.text(),/test-service-credential/);
});
