// Execute localmente: node scripts/gerar-hash-senha.mjs
// Não imprime a senha, apenas o hash para configurar no painel de variáveis da Vercel.
import {randomBytes,scryptSync} from 'node:crypto';
import {stdin,stdout} from 'node:process';
import {createInterface} from 'node:readline/promises';
const ui=createInterface({input:stdin,output:stdout});
try{
  const password=await ui.question('Digite a senha administrativa forte: ');
  if(password.length<14)throw Error('Use pelo menos 14 caracteres.');
  const salt=randomBytes(16).toString('hex');
  console.log('WANELLE_ADMIN_PASSWORD_HASH='+salt+':'+scryptSync(password,salt,64).toString('hex'));
  console.log('WANELLE_SESSION_SECRET='+randomBytes(32).toString('hex'));
}finally{ui.close();}
