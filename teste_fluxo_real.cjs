const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const storage={};const window={WANELLE_CONFIG:{},dispatchEvent:()=>{}};
const ctx={window,location:{protocol:'file:',hostname:''},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>{storage[k]=v}},Event:class{constructor(type){this.type=type}},console};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/assets/wanelle-core.js','utf8'),ctx);
const C=window.WanelleCore, s=C.seed();
assert.equal(s.orders.length,0,'Sem clientes fictícios');
assert.equal(s.recipes.length,0,'As fotos não originam receitas');
assert.equal(s.ingredients.filter(i=>i.packagePrice>0).length,0,'Nenhum ingrediente com preço de exemplo');
assert.equal(s.settings.costsConfirmed,false,'Despesas não verificadas inicialmente');
const o={items:[{recipeId:'',referenceId:'morango',qty:1}],servings:20,fillingLayers:2,decorationLevel:'simples',status:'novo',salePrice:null};
let c=C.calculate(o,s);assert.equal(c.quoteReady,false);assert.equal(c.missingRecipes,1);
assert.match(C.itemDescription(o,s),/inspiração: Torta de Morango/);
s.recipes.push({id:'receita-nova',name:'Bolo de encomenda real',servings:20,laborMinutes:140,decorationMinutes:30,baseFillingLayers:2,packaging:13,custom:false,lines:[{ingredientId:'farinha',quantity:450,component:'massa'},{ingredientId:'leite-cond',quantity:790,component:'recheio'}]});
o.items[0].recipeId='receita-nova';
c=C.calculate(o,s);assert.equal(c.quoteReady,false);assert.equal(c.missingPrices.length,2);
for(const id of ['farinha','leite-cond']){const ing=s.ingredients.find(i=>i.id===id);ing.packagePrice=id==='farinha'?6:8;ing.priceSource={store:'Atakarejo Boca do Rio — conferido pela confeiteira',checkedAt:'2026-10-14'};}
c=C.calculate(o,s);assert.equal(c.quoteReady,false,'Despesas operacionais precisam de confirmação');
s.settings.costsConfirmed=true;c=C.calculate(o,s);assert.equal(c.quoteReady,true);assert(c.suggested>c.totalCost);
const layers=C.calculate({...o,fillingLayers:3},s);assert(layers.ingredientsCost>c.ingredientsCost);
const missing=C.calculate({...o,items:[...o.items,{referenceId:'chocolate',recipeId:'',qty:1}]},s);assert.equal(missing.quoteReady,false);
async function run(){const added=await C.publicSubmit({customer:'Cliente teste',phone:'5571999999999',eventDate:'2026-12-01',servings:30,items:[{referenceId:'ellen',recipeId:'',qty:1}]});assert.equal(added.items[0].referenceId,'ellen');assert.equal(added.items[0].recipeId,'');assert.equal(C.getLocal().orders.length,1);assert.equal(C.calculate(added,C.getLocal()).quoteReady,false);console.log('✓ 15 verificações: portfólio sem preços, pedido novo, ficha de venda, cotação e bloqueio do orçamento.');}
run().catch(err=>{console.error(err);process.exit(1)});