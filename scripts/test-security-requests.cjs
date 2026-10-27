'use strict';
// Testes isolados: banco fictício, sem requests externos e sem credenciais reais.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'api/wanelle.js'),'utf8');
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');

let inserts=0;
const sql=async (strings,...values)=>{
  const statement=Array.isArray(strings)?strings.join('?'):String(strings);
  if(statement.includes('SELECT password_hash FROM'))return [];
  if(statement.includes('wanelle_public_limits'))return [{hits:1}];
  if(statement.includes('INSERT INTO public.wanelle_orders')){inserts++;return [];}
  return [];
};
const sandbox={
  module:{exports:{}},
  Buffer,URL,Intl,Date,
  console:{error:()=>{}},
  require:name=>name==='@neondatabase/serverless'?{neon:()=>sql}:require(name),
  process:{env:{
    DATABASE_URL:'postgresql://test.invalid/placeholder',
    WANELLE_ADMIN_EMAIL:'test-admin@example.invalid',
    WANELLE_ADMIN_PASSWORD_HASH:'placeholder-salt:placeholder-hash',
    WANELLE_SESSION_SECRET:'test-only-non-production-secret',
    WANELLE_ENABLE_ONLINE_INTAKE:'true'
  }}
};
vm.runInNewContext(source,sandbox,{filename:'api/wanelle.js',timeout:3000});
const handler=sandbox.module.exports;
function makeResponse(){
  const response={statusCode:0,headers:{},body:null,
    status(code){this.statusCode=code;return this;},
    setHeader(k,v){this.headers[k.toLowerCase()]=v;return this;},
    end(data){this.body=JSON.parse(data);return this;}};
  return response;
}
function validBody(){
  return {
    customer:'Cliente Exemplo', phone:'71999999999', eventDate:'2030-01-01',
    servings:20,items:[{referenceId:'chocolate-raspas',qty:1}],
    privacyAccepted:true,website:'',clientStartedAt:Date.now()-5000
  };
}
async function invoke(body,headers={}){
  const req={
    method:'POST',query:{action:'submit'},socket:{remoteAddress:'127.0.0.1'},
    headers:{host:'wanelle-site.vercel.app','content-type':'application/json','sec-fetch-site':'same-origin',...headers},
    body
  };
  const res=makeResponse();
  await handler(req,res);
  return res;
}
(async()=>{
  let resp=await invoke(validBody(),{'sec-fetch-site':'cross-site'});
  assert.equal(resp.statusCode,403,'Fetch Metadata de outro site deve ser rejeitado');
  resp=await invoke(validBody(),{origin:'https://evil.example.invalid'});
  assert.equal(resp.statusCode,403,'Origin diferente deve ser rejeitada');
  resp=await invoke(validBody(),{origin:'http://wanelle-site.vercel.app'});
  assert.equal(resp.statusCode,403,'Origin sem HTTPS deve ser rejeitada');
  resp=await invoke(validBody(),{'content-type':'text/plain'});
  assert.equal(resp.statusCode,415,'Formulários sem JSON devem ser rejeitados');
  resp=await invoke([validBody()]);
  assert.equal(resp.statusCode,400,'Corpo JSON precisa ser objeto');
  const invalidReference=validBody();
  invalidReference.items=[null];
  resp=await invoke(invalidReference);
  assert.equal(resp.statusCode,400,'Referência nula não pode causar erro 500');
  const invalidNested=validBody();
  invalidNested.items=[{referenceId:{nested:'invalid'},qty:1}];
  resp=await invoke(invalidNested);
  assert.equal(resp.statusCode,400,'Tipo inesperado não pode virar objeto persistido');
  resp=await invoke(validBody(),{origin:'https://wanelle-site.vercel.app'});
  assert.equal(resp.statusCode,201,'O fluxo legítimo de orçamento permanece funcional');
  assert.match(resp.body.id,/^WAN-/);
  assert.equal(inserts,1,'Apenas requisição legítima foi gravada no banco fictício');
  assert.match(page,/savedEl\.replaceChildren\(\)/);
  assert.match(page,/span\.textContent="♡ "\+n/);
  assert(!page.includes('savedEl.innerHTML=saved.length'),'Texto do armazenamento local não pode virar HTML');
  console.log('PASS: 10 verificações de requisições, validação de corpo, integridade do formulário e proteção de HTML.');
})().catch(error=>{console.error(error);process.exitCode=1;});
