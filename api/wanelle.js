// API Wanelle Studio — executa somente no Vercel (Node.js). DATABASE_URL e segredos nunca vão ao cliente.
const crypto = require('node:crypto');
const { neon } = require('@neondatabase/serverless');

const MAX_BODY_BYTES = 100_000;
const COOKIE = '__Host-wanelle_session';
const COOKIE_TTL = 12 * 60 * 60;
const RESET_MINUTES = 20;
const ALL_STAGES = new Set(['novo','orcado','confirmado','producao','pronto','entregue']);
const SECTIONS = new Set(['ingredients','recipes','settings']);
function apiError(status, message) { const err = new Error(message); err.status = status; return err; }
function json(res, code, data) { res.status(code).setHeader('Cache-Control','no-store').setHeader('Content-Type','application/json; charset=utf-8').end(JSON.stringify(data)); }
function clean(value, max = 120) { return String(value == null ? '' : value).trim().slice(0,max); }
function cookieValue(req) { const cookie=String(req.headers.cookie || '');const found=cookie.match(/(?:^|;\s*)__Host-wanelle_session=([^;]+)/);return found?.[1] || ''; }
function b64url(text) { return Buffer.from(text).toString('base64url'); }
function hmac(text) { return crypto.createHmac('sha256',process.env.WANELLE_SESSION_SECRET).update(text).digest('base64url'); }
function compare(a,b) { const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length && crypto.timingSafeEqual(x,y); }
function mint(email){const payload=b64url(JSON.stringify({email,exp:Date.now()+COOKIE_TTL*1000,iat:Date.now()}));return payload+'.'+hmac(payload);}
function authenticate(req) {
  if(!process.env.WANELLE_SESSION_SECRET) return null;
  const token=cookieValue(req);const idx=token.lastIndexOf('.');if(idx<1) return null;
  const payload=token.slice(0,idx),signature=token.slice(idx+1);
  if(!compare(signature,hmac(payload)))return null;
  try {const obj=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));if(obj.exp<Date.now() || obj.email!==process.env.WANELLE_ADMIN_EMAIL?.toLowerCase())return null;return obj;}catch{return null;}
}
function sameOrigin(req){const origin=req.headers.origin;if(!origin)return true;try{const host=req.headers['x-forwarded-host'] || req.headers.host;return new URL(String(origin)).host===String(host);}catch{return false;}}
function dataBody(req){const s=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});if(Buffer.byteLength(s)>MAX_BODY_BYTES)throw apiError(413,'Solicitação muito grande.');try{return typeof req.body==='string'?JSON.parse(req.body):req.body||{};}catch{throw apiError(400,'JSON inválido.');}}
function dateBR(date){return /^\d{4}-\d\d-\d\d$/.test(date)&&!Number.isNaN(new Date(date+'T12:00:00Z').valueOf());}
function minDate(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bahia',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function publicOrder(form){
  const customer=clean(form.customer,150),phone=clean(form.phone,30).replace(/\D/g,'');
  const eventDate=clean(form.eventDate,20),servings=Math.round(Number(form.servings));
  if(customer.length<2||phone.length<10||phone.length>13||!dateBR(eventDate)||eventDate<minDate()||!Number.isFinite(servings)||servings<1||servings>500)throw apiError(400,'Confira nome, WhatsApp, data e número de pessoas.');
  const rawItems=Array.isArray(form.items)?form.items:[];
  if(rawItems.length<1||rawItems.length>20)throw apiError(400,'Selecione ao menos uma referência de torta.');
  const items=rawItems.map(x=>({referenceId:clean(x.referenceId,50),recipeId:'',qty:Math.max(1,Math.min(10,Math.round(Number(x.qty)||1)))}));
  const layers=Math.max(1,Math.min(10,Math.round(Number(form.fillingLayers)||2)));
  const size=Number(form.sizeCm)||null;
  return {id:'WAN-'+crypto.randomUUID().slice(0,12).toUpperCase(),customer,phone,eventDate,
    occasion:clean(form.occasion,100),servings,items,method:clean(form.method,30)||'Retirada',
    neighborhood:clean(form.neighborhood,150),custom:!!form.custom,flavor:clean(form.flavor,150),
    filling:clean(form.filling,150),decoration:clean(form.decoration,150),notes:clean(form.notes,4000),
    status:'novo',createdAt:new Date().toISOString(),source:clean(form.source,80)||'site',
    salePrice:null,quoteSnapshot:null,deliveryCost:0,fillingLayers:layers,
    decorationLevel:['simples','detalhada','artistica'].includes(form.decorationLevel)?form.decorationLevel:'simples',
    sizeCm:size&&size>=10&&size<=50?size:null,laborMode:'auto',stageMinutes:{},extraMaterialsCost:0,
    otherOrderCost:0,provisionalApproved:false,actualRecorded:false,actualStageMinutes:{},actualExtraCost:0};
}
async function authorized(sql,req){const user=authenticate(req);if(!user)throw apiError(401,'Faça login para acessar o painel.');await resetStorage(sql);const rows=await sql`SELECT changed_at FROM public.wanelle_password_recovery WHERE id=1`;if(rows[0]?.changed_at&&(!user.iat||user.iat<=new Date(rows[0].changed_at).getTime()))throw apiError(401,'Sessão encerrada após alteração da senha. Faça login novamente.');}

async function resetStorage(sql){
 await sql`CREATE TABLE IF NOT EXISTS public.wanelle_password_recovery (id integer PRIMARY KEY DEFAULT 1 CHECK (id=1), password_hash text, reset_hash text, reset_expires timestamptz, requested_at timestamptz, changed_at timestamptz)`;
}
async function effectivePassword(sql){
 let rows;
 try { rows=await sql`SELECT password_hash FROM public.wanelle_password_recovery WHERE id=1`; }
 catch(err){ if(err.code!=='42P01')throw err; await resetStorage(sql); rows=await sql`SELECT password_hash FROM public.wanelle_password_recovery WHERE id=1`; }
 return rows[0]?.password_hash||process.env.WANELLE_ADMIN_PASSWORD_HASH||'';
}
async function requestReset(sql,req,body){
 const email=clean(body.email,200).toLowerCase(),configured=process.env.WANELLE_ADMIN_EMAIL?.toLowerCase();
 const response={message:'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'};
 if(!email||!email.includes('@'))throw apiError(400,'Informe um e-mail válido.');
 if(email!==configured)return response;
 if(!process.env.RESEND_API_KEY||!process.env.WANELLE_RESET_FROM_EMAIL)throw apiError(503,'Envio de e-mail ainda não configurado. Contate o administrador do site.');
 await resetStorage(sql);
 const existing=await sql`SELECT requested_at FROM public.wanelle_password_recovery WHERE id=1`;
 if(existing[0]?.requested_at&&Date.now()-new Date(existing[0].requested_at).getTime()<120000)return response;
 const token=crypto.randomBytes(32).toString('hex');
 const tokenHash=crypto.createHash('sha256').update(token).digest('hex');
 const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim().toLowerCase();
 const allowedHost=host==='wanelle-site.vercel.app'||/^wanelle-site-[a-z0-9-]+-blinkojobs\.vercel\.app$/.test(host);
 const configuredBase=String(process.env.WANELLE_PUBLIC_URL||'').trim().replace(/\/$/,'');
 const baseUrl=configuredBase||('https://'+(allowedHost?host:'wanelle-site.vercel.app'));
 if(!/^https:\/\//.test(baseUrl))throw apiError(503,'Endereço de recuperação não configurado corretamente.');
 await sql`INSERT INTO public.wanelle_password_recovery(id,reset_hash,reset_expires,requested_at) VALUES(1,${tokenHash},now()+interval '20 minutes',now()) ON CONFLICT(id) DO UPDATE SET reset_hash=excluded.reset_hash,reset_expires=excluded.reset_expires,requested_at=excluded.requested_at`;
 const link=baseUrl+'/redefinir-senha.html?token='+encodeURIComponent(token);
 const responseEmail=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.WANELLE_RESET_FROM_EMAIL,to:[configured],subject:'Wanelle Studio — Redefinição de senha',text:'Você solicitou uma troca de senha. Abra este link nos próximos 20 minutos: '+link+'\\nSe não foi você, ignore esta mensagem.'})});
 if(!responseEmail.ok){
   await sql`UPDATE public.wanelle_password_recovery SET reset_hash=null,reset_expires=null WHERE id=1 AND reset_hash=${tokenHash}`;
   throw apiError(503,'Não foi possível enviar o e-mail. Tente novamente mais tarde.');
 }
 return response;
}
async function finishReset(sql,body){
 const token=clean(body.token,120),password=String(body.password||'');
 if(!/^[a-f0-9]{64}$/.test(token)||password.length<14||password.length>128)throw apiError(400,'Link inválido ou senha fora do padrão (14 a 128 caracteres).');
 await resetStorage(sql);
 const tokenHash=crypto.createHash('sha256').update(token).digest('hex');
 const salt=crypto.randomBytes(24).toString('hex');
 const digest=crypto.scryptSync(password,salt,64).toString('hex');
 const rows=await sql`UPDATE public.wanelle_password_recovery SET password_hash=${salt+':'+digest},reset_hash=null,reset_expires=null,changed_at=now() WHERE id=1 AND reset_hash=${tokenHash} AND reset_expires>now() RETURNING id`;
 if(!rows.length)throw apiError(400,'Link expirado ou já utilizado. Solicite outro.');
 return {ok:true};
}

async function login(sql,req,res,body){
  const email=clean(body.email,200).toLowerCase(),pw=String(body.password||'');
  const ip=clean(req.headers['x-forwarded-for']?.split(',')[0]||req.socket?.remoteAddress||'',100);
  const key=crypto.createHash('sha256').update(email+'|'+ip).digest('hex');
  await resetStorage(sql);
  const rows=await sql`SELECT failures,first_attempt_at,locked_until FROM public.wanelle_login_attempts WHERE key_hash=${key}`;
  if(rows[0]?.locked_until && new Date(rows[0].locked_until).getTime()>Date.now())throw apiError(429,'Muitas tentativas. Tente novamente mais tarde.');
  const storedRows=await sql`SELECT password_hash FROM public.wanelle_password_recovery WHERE id=1`;
  const storedHash=storedRows[0]?.password_hash||'';
  const hash=await effectivePassword(sql);const [salt,expected]=hash.split(':');
  if((!storedHash&&!process.env.WANELLE_ADMIN_INITIAL_PASSWORD&&!process.env.WANELLE_ADMIN_PASSWORD_HASH)||!process.env.WANELLE_SESSION_SECRET||!process.env.WANELLE_ADMIN_EMAIL)throw apiError(503,'Acesso administrativo ainda não configurado.');
  let valid=false;
  try {
    const emailMatches=email===process.env.WANELLE_ADMIN_EMAIL.toLowerCase();
    if(emailMatches&&storedHash&&salt&&expected) valid=compare(crypto.scryptSync(pw,salt,64).toString('hex'),expected);
    else if(emailMatches&&!storedHash&&process.env.WANELLE_ADMIN_INITIAL_PASSWORD&&compare(pw,process.env.WANELLE_ADMIN_INITIAL_PASSWORD)) {
      const firstSalt=crypto.randomBytes(24).toString('hex');
      const firstDigest=crypto.scryptSync(pw,firstSalt,64).toString('hex');
      await sql`INSERT INTO public.wanelle_password_recovery(id,password_hash) VALUES(1,${firstSalt+':'+firstDigest}) ON CONFLICT(id) DO UPDATE SET password_hash=excluded.password_hash WHERE public.wanelle_password_recovery.password_hash IS NULL`;
      const confirmed=await sql`SELECT password_hash FROM public.wanelle_password_recovery WHERE id=1`;
      valid=Boolean(confirmed[0]?.password_hash===firstSalt+':'+firstDigest);
    }
  } catch {}
  if(!valid){
    await sql`INSERT INTO public.wanelle_login_attempts (key_hash,failures,first_attempt_at,locked_until)
      VALUES (${key},1,now(),null) ON CONFLICT (key_hash) DO UPDATE SET
      failures = CASE WHEN public.wanelle_login_attempts.first_attempt_at < now()-interval '15 minutes' THEN 1 ELSE public.wanelle_login_attempts.failures + 1 END,
      first_attempt_at = CASE WHEN public.wanelle_login_attempts.first_attempt_at < now()-interval '15 minutes' THEN now() ELSE public.wanelle_login_attempts.first_attempt_at END,
      locked_until = CASE WHEN public.wanelle_login_attempts.first_attempt_at >= now()-interval '15 minutes' AND public.wanelle_login_attempts.failures >= 4 THEN now()+interval '15 minutes' ELSE null END`;
    throw apiError(401,'E-mail ou senha incorretos.');
  }
  await sql`DELETE FROM public.wanelle_login_attempts WHERE key_hash=${key}`;
  res.setHeader('Set-Cookie',COOKIE+'='+mint(email)+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+COOKIE_TTL);
  return {user:{email}};
}
module.exports = async (req,res) => {
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.wanellestudio_DATABASE_URL;
    if(!databaseUrl)throw apiError(503,'Banco de dados ainda não configurado.');
    if(!['GET','POST'].includes(req.method))throw apiError(405,'Método não permitido.');
    if(req.method==='POST' && !sameOrigin(req))throw apiError(403,'Origem não autorizada.');
    const sql=neon(databaseUrl);
    const action=clean(req.query.action,40);
    const body=req.method==='POST'?dataBody(req):null;
    if(req.method==='GET'&&action==='health'){const pass=await effectivePassword(sql);const adminReady=Boolean(((pass&&pass.includes(':'))||process.env.WANELLE_ADMIN_INITIAL_PASSWORD)&&process.env.WANELLE_ADMIN_EMAIL&&process.env.WANELLE_SESSION_SECRET);let databaseTarget='unverified';try{const marker=await sql`SELECT marker FROM public.wanelle_environment_marker WHERE marker='wanelle-preview-test-20261019' LIMIT 1`;if(marker.length)databaseTarget='wanelle-preview-test';}catch{}return json(res,200,{status:'ok',database:'connected',databaseTarget,adminReady,intakeReady:adminReady&&process.env.WANELLE_ENABLE_ONLINE_INTAKE==='true',emailResetReady:Boolean(process.env.RESEND_API_KEY&&process.env.WANELLE_RESET_FROM_EMAIL)});}
    if(req.method==='POST'&&action==='submit'){
      const activeHash=await effectivePassword(sql);
      if(!activeHash||!process.env.WANELLE_ADMIN_EMAIL||!process.env.WANELLE_SESSION_SECRET||process.env.WANELLE_ENABLE_ONLINE_INTAKE!=='true')
        throw apiError(503,'Atendimento automático ainda em preparação. Use o WhatsApp.');
      if(body.website||body.privacyAccepted!==true)throw apiError(400,'Confirme os dados para contato.');
      const started=Number(body.clientStartedAt);
      if(!Number.isFinite(started)||Date.now()-started<2500||Date.now()-started>86400000)throw apiError(400,'Reabra o formulário e tente novamente.');
      const ip=clean(req.headers['x-real-ip']||req.headers['x-forwarded-for']?.split(',')[0]||req.socket?.remoteAddress||'sem-ip',100);
      const hour=Math.floor(Date.now()/3600000);
      const key=crypto.createHmac('sha256',process.env.WANELLE_SESSION_SECRET).update(ip+'|'+hour).digest('hex');
      const quota=await sql`INSERT INTO public.wanelle_public_limits (key_hash,hits,updated_at)
        VALUES (${key},1,now()) ON CONFLICT(key_hash) DO UPDATE
        SET hits=public.wanelle_public_limits.hits+1, updated_at=now() RETURNING hits`;
      if(Number(quota[0]?.hits)>4)throw apiError(429,'Limite de solicitações atingido. Continue pelo WhatsApp.');
      const order=publicOrder(body);
      await sql`INSERT INTO public.wanelle_orders (id,payload,created_at,updated_at) VALUES (${order.id},${JSON.stringify(order)}::jsonb,now(),now())`;
      return json(res,201,{id:order.id,customer:order.customer});
    }
    if(req.method==='POST'&&action==='request-password-reset')return json(res,200,await requestReset(sql,req,body));
    if(req.method==='POST'&&action==='reset-password')return json(res,200,await finishReset(sql,body));
    if(req.method==='POST'&&action==='login')return json(res,200,await login(sql,req,res,body));
    if(req.method==='POST'&&action==='logout'){
      res.setHeader('Set-Cookie',COOKIE+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');return json(res,200,{ok:true});
    }
    if(req.method==='GET'&&action==='session'){try{await authorized(sql,req);return json(res,200,{user:{email:authenticate(req).email}});}catch{return json(res,200,{user:null});}}
    await authorized(sql,req);
    if(req.method==='GET'&&action==='bootstrap'){
      const [s,o,q]=await Promise.all([sql`SELECT section,payload FROM public.wanelle_app_data`,sql`SELECT payload FROM public.wanelle_orders ORDER BY created_at DESC LIMIT 3000`,sql`SELECT payload FROM public.wanelle_market_quotes ORDER BY id`]);
      return json(res,200,{sections:Object.fromEntries(s.map(x=>[x.section,x.payload])),orders:o.map(x=>x.payload),marketQuotes:q.map(x=>x.payload)});
    }
    if(req.method==='POST'&&action==='section'){
      const section=clean(body.section,40);if(!SECTIONS.has(section))throw apiError(400,'Seção inválida.');
      const payload=body.payload;if(!Array.isArray(payload) && !(payload&&typeof payload==='object'))throw apiError(400,'Dados inválidos.');
      await sql`INSERT INTO public.wanelle_app_data (section,payload,updated_at) VALUES (${section},${JSON.stringify(payload)}::jsonb,now()) ON CONFLICT(section) DO UPDATE SET payload=excluded.payload,updated_at=now()`;
      return json(res,200,{ok:true});
    }
    if(req.method==='POST'&&action==='order'){
      const order=body.order;if(!order||typeof order!=='object'||!clean(order.id,80).startsWith('WAN-')||!ALL_STAGES.has(order.status))throw apiError(400,'Pedido inválido.');
      if(!Array.isArray(order.items)||order.items.length>20||!dateBR(clean(order.eventDate,20)))throw apiError(400,'Dados do pedido inválidos.');
      await sql`INSERT INTO public.wanelle_orders (id,payload,created_at,updated_at) VALUES (${order.id},${JSON.stringify(order)}::jsonb,now(),now())
         ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=now()`;
      return json(res,200,{ok:true});
    }
    if(req.method==='POST'&&action==='delete'){
      const id=clean(body.id,80);if(!id.startsWith('WAN-'))throw apiError(400,'Pedido inválido.');
      await sql`DELETE FROM public.wanelle_orders WHERE id=${id}`;return json(res,200,{ok:true});
    }
    throw apiError(404,'Rota não encontrada.');
  }catch(err){
    const status=Number(err.status)||500;
    if(status>=500)console.error('Wanelle API error:',err.code||err.message);
    return json(res,status,{error:status>=500?'Serviço indisponível. Tente novamente em instantes.':err.message});
  }
};
