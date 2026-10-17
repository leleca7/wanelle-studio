// Verificações de regressão da central de pedidos — sem envio real de clientes.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'pedidos.html'),'utf8');
const scripts=[...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length,2,'Duas rotinas JavaScript esperadas na página de pedidos');
for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i][1],{filename:'pedidos.html#inline-'+i});
assert.match(source,/id="cake-form"/);
assert.match(source,/id="c-date" type="date" required/);
assert.match(source,/id="c-phone" required/);
assert.match(source,/data-tab="tortas"/);
assert.match(source,/data-tab="potes"/);
assert.match(source,/data-tab="pontos"/);
assert.match(source,/A equipe confirmará o lançamento futuramente/);
assert.match(source,/Esta mensagem é somente consulta de interesse/);
assert.match(source,/confirmed:false,canPickup:false/);
assert.doesNotMatch(source,/available:true|confirmed:true,canPickup:false|p-method/);
assert.doesNotMatch(source,/https:\/\/raw\.githubusercontent\.com\/leleca7\/wanelle-studio\/205dc/);
assert.equal((source.match(/const selectedPhoto=/g)||[]).length,1,'Inspiração única');
console.log('✓ Central de pedidos: scripts sintaticamente válidos, formulário, consulta de interesse e locais não confirmados.');
