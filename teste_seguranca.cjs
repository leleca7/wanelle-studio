// Regressões de segurança da superfície pública Wanelle (não substituem DAST/pentest).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('index.html','utf8');
const api = fs.readFileSync('api/wanelle.js','utf8');
const publicConfig = fs.readFileSync('config.js','utf8');
const headers = JSON.parse(fs.readFileSync('vercel.json','utf8')).headers.flatMap(x=>x.headers);
assert(!/savedEl\.innerHTML/.test(html),'Não renderizar localStorage via innerHTML');
assert(/savedEl\.replaceChildren\(\)/.test(html),'A lista usa DOM seguro');
assert(/tag\.textContent=/.test(html),'Texto não confiável não deve virar HTML');
assert(!/DATABASE_URL|SESSION_SECRET|RESEND_API_KEY|PGPASSWORD|ADMIN_PASSWORD/i.test(publicConfig),'Não expor secrets em config.js');
assert(/timingSafeEqual/.test(api),'Comparação de tokens/segredos protegida');
assert(/scryptSync/.test(api),'Senha não pode ser armazenada em claro');
assert(/sameOrigin\(req\)/.test(api),'Deve haver defesa contra CSRF');
assert(/\breset-global\b/.test(api),'Recuperação de senha deve ter cota global');
assert(/\breset-ip:/.test(api),'Recuperação de senha deve ter cota por origem');
assert(!/emailResetReady:Boolean/.test(api),'Não revelar estado de segurança no health público');
assert(!/console\.error\('Wanelle API error:',err\.code\|\|err\.message\)/.test(api),'Não logar erro potencialmente com DSN/PII');
for(const key of ['X-Content-Type-Options','Referrer-Policy','X-Frame-Options','Strict-Transport-Security'])
 assert(headers.some(x=>x.key===key),'Header ausente: '+key);
console.log('OK: regressões de segurança pública Wanelle');
