/* Wanelle — lógica compartilhada: receitas, custos, pedidos e armazenamento.
   As cifras iniciais são EXEMPLOS, não custos reais da confeitaria. */
(function (global) {
  'use strict';
  const KEY = 'wanelle-operacao-real-v2';
  const STAGES = [
    ['novo', 'Novo pedido'], ['orcado', 'Orçamento enviado'],
    ['confirmado', 'Confirmado'], ['producao', 'Em produção'],
    ['pronto', 'Pronto'], ['entregue', 'Entregue']
  ];
  const products = [
    { id:"chocolate", name:"Torta de Chocolate", photo:"assets/media/nova-chocolate-frontal.webp" },
    { id:"chocolate-raspas", name:"Torta de Chocolate com Raspas", photo:"assets/media/wanelle-chocolate-raspas-frontal.webp" },
    { id:"morango", name:"Torta de Morango", photo:"assets/media/foto-c01ef23f279de8.webp" },
    { id:"abacaxi", name:"Torta de Abacaxi com Coco", photo:"assets/media/nova-abacaxi-frontal.webp" },
    { id:"kiwi", name:"Torta de Frutas", photo:"assets/media/foto-f999ef06c816e0.webp" },
    { id:"formatura", name:"Torta de Formatura", photo:"assets/media/wanelle-formatura-nova-frente.webp" },
    { id:"ellen", name:"Torta Temática", photo:"assets/media/foto-80a5346b079ec6.webp" },
    { id:"rosa", name:"Torta Rosa Delicada", photo:"assets/media/nova-rosa-close.webp" },
    { id:"heroi", name:"Torta Super-Herói", photo:"assets/media/nova-heroi-close.webp" },
    { id:"infantil", name:"Torta Infantil", photo:"assets/media/wanelle-infantil-nova.webp" },
    { id:"boteco", name:"Torta Tema Boteco", photo:"assets/media/wanelle-boteco-principal.webp" },
    { id:"administracao", name:"Torta de Formatura Administração", photo:"assets/media/wanelle-formatura-administracao-frontal.webp" },
  ];
  const ingredientSeed = [
    ['farinha','Farinha de trigo','g',1000,6.80,1500],
    ['acucar','Açúcar','g',1000,5.40,1800],
    ['ovos','Ovos','un',30,23.90,18],
    ['leite','Leite integral','ml',1000,5.50,2000],
    ['chocolate','Chocolate em pó','g',1000,37.90,900],
    ['leite-cond','Leite condensado','g',395,7.40,1200],
    ['creme-leite','Creme de leite','g',200,4.60,800],
    ['manteiga','Manteiga','g',200,12.00,350],
    ['chantilly','Chantilly','ml',1000,22.90,1500],
    ['morango','Morango','g',1000,29.90,600],
    ['abacaxi','Abacaxi','g',1000,13.90,1000],
    ['kiwi','Kiwi','g',1000,32.00,500],
    ['fermento','Fermento','g',100,5.90,150],
    ['corante','Corante alimentício','ml',30,12.00,45],
    ['pasta-americana','Pasta americana','g',1000,45.00,1200]
  ].map(([id,name,unit,packageQty,packagePrice,stockQty]) => ({id,name,unit,packageQty,packagePrice,stockQty,lossPct:0}));
  // As fotos antigas pertencem exclusivamente ao portfólio. Nenhuma tem preço ou receita-base presumidos.
  // As receitas passam a nascer somente com cada nova encomenda real.
  const STAGE_DEFS = [
    {id:'massa',label:'Preparar massa',rate:'laborHourly'},
    {id:'recheio',label:'Preparar recheio',rate:'laborHourly'},
    {id:'montagem',label:'Montagem e camadas',rate:'laborHourly'},
    {id:'decoracao',label:'Confeitar e decorar',rate:'decorationHourly'},
    {id:'finalizacao',label:'Finalizar, embalar e higienizar',rate:'laborHourly'}
  ];
  const COMPONENTS = [['massa','Massa'],['recheio','Recheio / camadas'],['cobertura','Cobertura'],['decoracao','Decoração']];
  const inferComponent = id => ['leite-cond','creme-leite','morango','abacaxi','kiwi'].includes(id)?'recheio'
    :['chantilly'].includes(id)?'cobertura': ['corante','pasta-americana'].includes(id)?'decoracao':'massa';
  const settingsSeed = {
    // Referência salarial CLT Salvador: R$12,36/h (não é tarifa autônoma); valores da Wanelle a calibrar.
    laborHourly:25, decorationHourly:35,
    // Neoenergia Coelba B1, 22/04/2026 a 21/04/2027: tarifa base sem impostos.
    electricityKwhRate:0.87773, mixerWatts:500, mixerMinutesPerCake:15,
    ovenElectricEnabled:0, ovenWatts:2000, ovenMinutesPerCake:45,
    fridgeKwhPerMonth:40, cakesPerMonth:40,
    // Tarifa mínima Embasa residencial normal (6m³ = R$44,77); média, NÃO preço marginal.
    waterRateM3:7.46167, sewagePct:80, waterLitersPerCake:15,
    gasPerCake:4, otherPerCake:3, fixedMonthlyCosts:0,
    indirectPct:5, creationPct:12,
    // Margem de segurança sobre o preço de cada embalagem; não é lucro nem preço real do mercado.
    ingredientPriceBufferPct:10, ingredientPriceRoundingStep:0.5,
    targetMarginPct:30, paymentFeePct:3.5, salesTaxPct:0, roundTo:5, costsConfirmed:false
  };
  const day = offset => { const d=new Date(); d.setDate(d.getDate()+offset); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  function seed() {
    // Catálogo auxiliar de nomes de ingredientes, SEM preços de compra, estoque ou receitas fictícias.
    // A primeira ficha técnica deve ser cadastrada com dados reais da encomenda.
    const ingredients=ingredientSeed.map(i=>({...i,packagePrice:0,stockQty:0,priceSource:null}));
    return {ingredients,recipes:[],settings:{...settingsSeed,
      mixerWatts:0,mixerMinutesPerCake:0,ovenWatts:0,ovenMinutesPerCake:0,
      fridgeKwhPerMonth:0,cakesPerMonth:0,waterLitersPerCake:0,gasPerCake:0,otherPerCake:0,
      fixedMonthlyCosts:0,indirectPct:0},orders:[]};
  }
  function getLocal() { try {const s=JSON.parse(localStorage.getItem(KEY)); if(s && Array.isArray(s.orders)&&Array.isArray(s.recipes)&&Array.isArray(s.ingredients)&&s.settings){s.settings={...settingsSeed,...s.settings};return s;}} catch(e){} const s=seed();saveLocal(s);return s; }
  function saveLocal(s) { localStorage.setItem(KEY,JSON.stringify(s)); window.dispatchEvent(new Event('wanelle-data-updated')); }
  const config = global.WANELLE_CONFIG || {};
  const demoAllowed = ['file:'].includes(location.protocol) || ['localhost','127.0.0.1'].includes(location.hostname);
  const live = Boolean(config.backend === 'neon' && !demoAllowed);
  const apiPath = config.apiPath || '/api/wanelle';
  async function api(action, {method='GET',body}={}) {
    const response=await fetch(apiPath+'?action='+encodeURIComponent(action),{
      method,credentials:'same-origin',cache:'no-store',
      headers:body?{'Content-Type':'application/json'}:{},
      body:body?JSON.stringify(body):undefined
    });
    let result;try{result=await response.json();}catch{throw Error('A conexão com o sistema está indisponível.');}
    if(!response.ok)throw Error(result.error||'Não foi possível completar a operação.');
    return result;
  }
  function money(n) { return (Number(n)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  function n(v) {return Math.max(0,Number(v)||0);}
  function dateBR(d) {if(!d)return 'Sem data'; const [y,m,day]=d.split('-');return [day,m,y].join('/');}
  function id() {return 'WAN-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();}
  // Cotação observada e preço de PROTEÇÃO devem permanecer valores distintos.
  // Nunca arredondar o custo por grama antes de multiplicar pela quantidade usada.
  function safePackagePrice(ing,settings) {
    const observed=n(ing?.packagePrice);
    if(!observed)return 0;
    const percentage=settings ? Math.min(100,n(settings.ingredientPriceBufferPct ?? 10)) : 0;
    const step=settings ? Math.max(.01,n(settings.ingredientPriceRoundingStep ?? .5)) : 0;
    const adjusted=observed*(1+percentage/100);
    return step ? Math.round(Math.ceil((adjusted-0.00000001)/step)*step*100)/100 : adjusted;
  }
  function unitCost(ing,settings) {return n(ing?.packageQty) > 0 ? safePackagePrice(ing,settings)/n(ing.packageQty)*(1+n(ing.lossPct)/100):0;}
  function recipeLines(recipe) { return (recipe.lines||[]).map(line=>({...line,component:line.component||inferComponent(line.ingredientId)})); }
  function estimateTime(order,state) {
    const servingCount=Math.max(1,n(order.servings)||20);
    const layers=Math.max(1,Math.min(10,Math.round(n(order.fillingLayers)||2)));
    const level=['simples','detalhada','artistica'].includes(order.decorationLevel)?order.decorationLevel:'simples';
    const complexity={simples:1,detalhada:1.5,artistica:2.3}[level];
    const total={massa:0,recheio:0,montagem:0,decoracao:0,finalizacao:0};
    let bakedUnits=0;
    for(const item of order.items||[]) {
      const recipe=state.recipes.find(r=>r.id===item.recipeId);if(!recipe)continue;
      const qty=Math.max(1,Math.round(Number(item.qty)||1));
      const size=servingCount/Math.max(1,n(recipe.servings)||20);
      const activeScale=0.4+0.6*size; // custo fixo de preparação + parte variável por rendimento
      const referenceLayers=Math.max(1,n(recipe.baseFillingLayers)||2);
      const layerRatio=layers/referenceLayers;
      const totalMinutes=n(recipe.laborMinutes)||120;
      const decorationBase=recipe.decorationMinutes===undefined ? Math.max(15,totalMinutes*.18) : Math.min(totalMinutes,n(recipe.decorationMinutes));
      const preparationMinutes=Math.max(0,totalMinutes-decorationBase);
      total.massa+=preparationMinutes*.34*activeScale*qty;
      total.recheio+=preparationMinutes*.29*activeScale*(.55+.45*layerRatio)*qty;
      total.montagem+=preparationMinutes*.23*activeScale*(.5+.5*layerRatio)*qty;
      total.finalizacao+=preparationMinutes*.14*activeScale*qty;
      total.decoracao+=decorationBase*activeScale*complexity*qty;
      bakedUnits+=qty;
    }
    const automatic=Object.fromEntries(STAGE_DEFS.map(x=>[x.id,Math.ceil(total[x.id]/5)*5]));
    const isManual=order.laborMode==='manual';
    const stageMinutes=isManual ? Object.fromEntries(STAGE_DEFS.map(x=>[x.id,Math.min(10000,n(order.stageMinutes?.[x.id]))])) : automatic;
    const laborByStage=Object.fromEntries(STAGE_DEFS.map(x=>[x.id,stageMinutes[x.id]/60*n(state.settings[x.rate])]));
    const totalMinutes=Object.values(stageMinutes).reduce((a,b)=>a+b,0);
    const laborCost=Object.values(laborByStage).reduce((a,b)=>a+b,0);
    return {stageMinutes,automatic,mode:isManual?'manual':'auto',totalMinutes,laborByStage,laborCost,decorationLaborCost:laborByStage.decoracao,bakedUnits};
  }
  function calculate(order, state) {
    const settings=state.settings;
    const labor=estimateTime(order,state);
    let ingredientsCost=0,ingredientsMarketCost=0,packagingCost=0,utilitiesCost=0;
    let mixerCost=0,ovenCost=0,fridgeCost=0,waterCost=0,gasCost=0,otherUtilitiesCost=0,fixedCosts=0;
    let baseForCreation=0;
    const energyRate=n(settings.electricityKwhRate);
    const monthlyQuantity=Math.max(1,n(settings.cakesPerMonth)||1);
    const required={};
    const servings=Math.max(1,n(order.servings)||20);
    const fillingLayers=Math.max(1,Math.min(10,Math.round(n(order.fillingLayers)||2)));
    let totalCakes=0;
    let missingRecipes=0;
    for(const item of order.items||[]) {
      const recipe=state.recipes.find(r=>r.id===item.recipeId);if(!recipe){missingRecipes++;continue;}
      const qty=Math.max(1,Math.round(Number(item.qty)||1));
      const sizeFactor=servings/Math.max(1,n(recipe.servings)||20);
      const factor=sizeFactor*qty;
      const referenceLayers=Math.max(1,n(recipe.baseFillingLayers)||2);
      const fillingScale=fillingLayers/referenceLayers;
      const cakeIngredients=recipeLines(recipe).reduce((acc,line)=>{
        const ing=state.ingredients.find(i=>i.id===line.ingredientId);if(!ing)return acc;
        const requested=n(line.quantity)*factor*(line.component==='recheio'?fillingScale:1);
        required[ing.id]=(required[ing.id]||0)+requested;
        ingredientsMarketCost+=unitCost(ing)*requested;
        return acc + unitCost(ing,settings)*requested;
      },0);
      const cakePackaging=n(recipe.packaging)*qty;
      const thisMixer=n(settings.mixerWatts)/1000*n(settings.mixerMinutesPerCake)/60*energyRate*factor;
      const thisOven=n(settings.ovenElectricEnabled)>0 ? n(settings.ovenWatts)/1000*n(settings.ovenMinutesPerCake)/60*energyRate*factor:0;
      const thisFridge=n(settings.fridgeKwhPerMonth)/monthlyQuantity*energyRate*qty;
      const thisWater=n(settings.waterLitersPerCake)/1000*n(settings.waterRateM3)*(1+n(settings.sewagePct)/100)*factor;
      const thisGas=n(settings.ovenElectricEnabled)>0?0:n(settings.gasPerCake)*factor;
      const thisOther=n(settings.otherPerCake)*qty;
      const thisFixed=n(settings.fixedMonthlyCosts)/monthlyQuantity*qty;
      ingredientsCost+=cakeIngredients;packagingCost+=cakePackaging;
      mixerCost+=thisMixer;ovenCost+=thisOven;fridgeCost+=thisFridge;
      waterCost+=thisWater;gasCost+=thisGas;otherUtilitiesCost+=thisOther;fixedCosts+=thisFixed;
      utilitiesCost+=thisMixer+thisOven+thisFridge+thisWater+thisGas+thisOther;
      totalCakes+=qty;
      if(order.custom || recipe.custom)baseForCreation+=cakeIngredients+cakePackaging;
    }
    const extraMaterialsCost=n(order.extraMaterialsCost);
    const otherOrderCost=n(order.otherOrderCost);
    const direct=ingredientsCost+packagingCost+labor.laborCost+extraMaterialsCost+otherOrderCost;
    const indirectCost=direct*n(settings.indirectPct)/100;
    const deliveryCost=n(order.deliveryCost);
    const totalCost=direct+utilitiesCost+fixedCosts+indirectCost+deliveryCost;
    // Criação é adicional de serviço cobrado, não gasto duplicado: lucro continua distinto da mão de obra.
    const creationFee=(order.custom|| (order.items||[]).some(item=>state.recipes.find(r=>r.id===item.recipeId)?.custom))
      ? (baseForCreation+labor.laborCost)*n(settings.creationPct)/100 : 0;
    const sellFraction=(n(settings.targetMarginPct)+n(settings.paymentFeePct)+n(settings.salesTaxPct))/100;
    const pricingValid=sellFraction<1;
    const exact=pricingValid?(totalCost+creationFee)/(1-sellFraction):0;
    const step=n(settings.roundTo)||1;
    const suggested=pricingValid?Math.ceil((exact-0.000001)/step)*step:0;
    const effectivePrice=order.salePrice!==undefined&&order.salePrice!==null&&order.salePrice!=='' ? n(order.salePrice):suggested;
    const fee=effectivePrice*n(settings.paymentFeePct)/100;
    const salesTax=effectivePrice*n(settings.salesTaxPct)/100;
    const profit=effectivePrice-fee-salesTax-totalCost;
    const usedIngredients=Object.entries(required).map(([ingredientId,quantity])=>{
      const ing=state.ingredients.find(x=>x.id===ingredientId);
      return {ingredientId,name:ing?.name||ingredientId,unit:ing?.unit||'',quantity,
        baseCost:quantity*unitCost(ing||{}),cost:quantity*unitCost(ing||{},settings),
        quotedPackagePrice:n(ing?.packagePrice),protectedPackagePrice:safePackagePrice(ing,settings),
        stockQty:n(ing?.stockQty),toBuy:Math.max(0,quantity-n(ing?.stockQty)),priceVerified:!!ing?.priceSource&&!!n(ing?.packagePrice)};
    }).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    const actualRecorded=!!order.actualRecorded;
    const actualStageMinutes=Object.fromEntries(STAGE_DEFS.map(stage=>[stage.id,n(order.actualStageMinutes?.[stage.id])]));
    const actualLaborCost=STAGE_DEFS.reduce((sum,stage)=>sum+actualStageMinutes[stage.id]/60*n(settings[stage.rate]),0);
    const actualExtraCost=n(order.actualExtraCost);
    const actualTotalCost=totalCost+(actualLaborCost-labor.laborCost)*(1+n(settings.indirectPct)/100)+actualExtraCost;
    const actualProfit=effectivePrice-fee-salesTax-actualTotalCost;
    const missingPrices=usedIngredients.filter(i=>!i.priceVerified).map(i=>i.name);
    const unregisteredItems=(order.items||[]).length===0 || missingRecipes>0;
    const incompleteRecipes=(order.items||[]).some(item=>{const r=state.recipes.find(x=>x.id===item.recipeId);return r && (!(r.lines||[]).length || !n(r.laborMinutes) || !n(r.packaging));});
    const quoteReady=totalCakes>0 && !unregisteredItems && !incompleteRecipes && !missingPrices.length && pricingValid && !!settings.costsConfirmed;
    const risks=[];
    if(unregisteredItems)risks.push('Crie ou selecione a ficha técnica de cada torta: a foto é apenas inspiração, não receita');
    if(incompleteRecipes)risks.push('Ficha técnica incompleta: confira ingredientes, mão de obra e embalagem');
    if(!settings.costsConfirmed)risks.push('Despesas de água, energia, gás, taxas e remuneração ainda não foram validadas nas configurações');
    if(missingPrices.length)risks.push(`${missingPrices.length} ingrediente(s) sem preço documentado`);
    if(!n(settings.salesTaxPct))risks.push('Tributos não configurados');
    if(!n(settings.fixedMonthlyCosts))risks.push('Custos fixos mensais não informados');
    if(n(settings.ingredientPriceBufferPct)===0)risks.push('Sem proteção para variação semanal de preços de ingredientes');
    if((order.items||[]).some(item=>{const r=state.recipes.find(x=>x.id===item.recipeId);return r && servings>n(r.servings)*1.25;}))risks.push('Embalagem-base pode ser insuficiente para o tamanho');
    const expired=usedIngredients.filter(i=>{const ing=state.ingredients.find(x=>x.id===i.ingredientId);return ing?.priceSource?.validUntil && ing.priceSource.validUntil < new Date().toISOString().slice(0,10)}).map(i=>i.name);
    if(expired.length)risks.push(`Ofertas de ${expired.length} ingrediente(s) vencidas`);
    if(order.filling?.trim())risks.push('Recheio solicitado em texto: conferir correspondência com a ficha técnica');
    if(order.decoration?.trim() && !n(order.extraMaterialsCost))risks.push('Conferir se decoração exige materiais extras');
    if(n(order.sizeCm))risks.push('Diâmetro informado: validar forma, rendimento e embalagem');
    if(n(order.salePrice)<suggested && order.salePrice!==null && order.salePrice!==undefined && order.salePrice!=='')risks.push('Preço manual abaixo da sugestão');
    if(labor.mode==='manual' && labor.totalMinutes===0)risks.push('Tempo manual zerado');
    if(n(order.fillingLayers)>n((state.recipes.find(r=>r.id===(order.items||[])[0]?.recipeId)||{}).baseFillingLayers||2))risks.push('Camadas extras: confira se a altura do bolo e embalagem comportam a receita');
    return {quoteReady,missingRecipes,incompleteRecipes,totalCakes,servings,fillingLayers,ingredientsCost,
      ingredientsMarketCost,ingredientPriceSafetyReserve:Math.max(0,ingredientsCost-ingredientsMarketCost),packagingCost,laborCost:labor.laborCost,decorationLaborCost:labor.decorationLaborCost,
      labor,utilitiesCost,mixerCost,ovenCost,fridgeCost,waterCost,gasCost,otherUtilitiesCost,fixedCosts,
      creationFee,creationCost:0,extraMaterialsCost,otherOrderCost,indirectCost,deliveryCost,totalCost,suggested,effectivePrice,fee,salesTax,profit,
      marginPct:effectivePrice?100*profit/effectivePrice:0,usedIngredients,missingPrices,risks,pricingValid,
      actualRecorded,actualStageMinutes,actualLaborCost,actualExtraCost,actualTotalCost,actualProfit,
      minimumBreakeven:(n(settings.paymentFeePct)+n(settings.salesTaxPct))<100?totalCost/(1-(n(settings.paymentFeePct)+n(settings.salesTaxPct))/100):0};
  }
  function itemDescription(order,state){return (order.items||[]).map(item=>{const r=state.recipes.find(r=>r.id===item.recipeId);const p=products.find(p=>p.id===item.referenceId);return `${item.qty||1}× ${r?.name|| (p?'Sob medida (inspiração: '+p.name+')':'Torta sob medida')}`;}).join(' • ') || 'Torta personalizada';}
  async function publicSubmit(o) {
    const publicOrder={id:id(),customer:String(o.customer||'').trim(),phone:String(o.phone||'').trim(),eventDate:o.eventDate,occasion:o.occasion||'',servings:Math.max(1,Math.round(n(o.servings)||20)),items:o.items||[],method:o.method||'Retirada',neighborhood:o.neighborhood||'',custom:!!o.custom,flavor:o.flavor||'',filling:o.filling||'',decoration:o.decoration||'',notes:o.notes||'',status:'novo',createdAt:new Date().toISOString(),source:o.source||'site',salePrice:null,quoteSnapshot:null,deliveryCost:0,fillingLayers:Math.max(1,Math.min(10,Math.round(n(o.fillingLayers)||2))),decorationLevel:o.decorationLevel||'simples',sizeCm:o.sizeCm? n(o.sizeCm):null,laborMode:'auto',stageMinutes:{},extraMaterialsCost:0,otherOrderCost:0,provisionalApproved:false,actualRecorded:false,actualStageMinutes:{},actualExtraCost:0};
    if(live){ const saved=await api('submit',{method:'POST',body:publicOrder});return {...publicOrder,id:saved.id}; }
    else if(demoAllowed){const s=getLocal();s.orders.unshift(publicOrder);saveLocal(s);}
    else throw Error('Recebimento pelo site ainda não foi conectado. Entre em contato pelo WhatsApp.');
    return publicOrder;
  }
  async function login(email,password) {return api('login',{method:'POST',body:{email,password}});}
  async function logout() {if(live)await api('logout',{method:'POST',body:{}});}
  async function session() {if(!live)return null;return (await api('session')).user;}
  async function adminLoad() {
    if(!live){if(!demoAllowed)throw Error('Conecte o Neon e o Vercel para acessar o painel online.');return getLocal();}
    const r=await api('bootstrap');const defaults=seed();
    if (Array.isArray(r.marketQuotes) && global.WANELLE_MARKET) {
      const items=new Map((global.WANELLE_MARKET.quotes||[]).map(q=>[q.id,q]));
      r.marketQuotes.forEach(q=>{if(q && q.id)items.set(q.id,q);});
      global.WANELLE_MARKET.quotes=[...items.values()];
    }
    const settings={...defaults.settings,...(r.sections.settings||{})};
    return {ingredients:r.sections.ingredients||defaults.ingredients,
      recipes:r.sections.recipes||defaults.recipes,settings,orders:r.orders||[]};
  }
  async function saveSection(section,value,state) {
    if(!['ingredients','recipes','settings'].includes(section))throw Error('Seção inválida.');
    if(live)await api('section',{method:'POST',body:{section,payload:value}});
    else {if(!demoAllowed)throw Error('Sem banco conectado');const s=state||getLocal();s[section]=value;saveLocal(s);}
  }
  async function saveOrder(order,state) {
    if(live)await api('order',{method:'POST',body:{order}});
    else {if(!demoAllowed)throw Error('Sem banco conectado');const s=state||getLocal();const i=s.orders.findIndex(x=>x.id===order.id);if(i>=0)s.orders[i]=order;else s.orders.unshift(order);saveLocal(s);}
  }
  async function deleteOrder(orderId,state) {
    if(live)await api('delete',{method:'POST',body:{id:orderId}});
    else {if(!demoAllowed)throw Error('Sem banco conectado');const s=state||getLocal();s.orders=s.orders.filter(o=>o.id!==orderId);saveLocal(s);}
  }
  function whatsapp(order,state){
    const summary=order.quoteSnapshot||calculate(order,state);
    const lines=[`Olá, ${order.customer}! ♡`,`Aqui é da Wanelle Tortas. Preparamos seu orçamento:`,``,`🍰 ${itemDescription(order,state)}`,`👥 ${order.servings} pessoas`, `📅 ${dateBR(order.eventDate)}`,`✨ ${order.decoration||order.notes||'Personalização a combinar'}`,``,`*Investimento: ${money(order.salePrice??summary.effectivePrice)}*`,``,`Podemos confirmar os detalhes da sua encomenda?`];
    const digits=String(order.phone||'').replace(/\D/g,'');
    const normalized=(digits.length===10||digits.length===11)?'55'+digits:digits;
    return 'https://wa.me/'+normalized+'?text='+encodeURIComponent(lines.join('\n'));
  }
  global.WanelleCore={KEY,STAGES,STAGE_DEFS,COMPONENTS,inferComponent,recipeLines,estimateTime,products,seed,getLocal,saveLocal,calculate,unitCost,safePackagePrice,money,n,dateBR,id,itemDescription,publicSubmit,login,logout,session,adminLoad,saveSection,saveOrder,deleteOrder,whatsapp,live,demoAllowed};
})(window);
