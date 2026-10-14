(function(){
'use strict';
const C=window.WanelleCore;
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=C.money;
let S=null,view='dashboard',orderSearch='',prodDate='',ingredientSearch='',msgTimer;
const titles={dashboard:'Visão geral',orders:'Esteira de pedidos',production:'Produção & compras',recipes:'Minhas receitas',ingredients:'Ingredientes',market:'Pesquisa de mercado',settings:'Custos & preços'};
function notify(str){const a=$('#alert');a.textContent=str;a.classList.add('show');clearTimeout(msgTimer);msgTimer=setTimeout(()=>a.classList.remove('show'),3300);}
function error(e){notify('Não foi possível salvar: '+(e?.message||e));console.error(e);}
function styleStage(status){return `<span class="pill ${esc(status)}">${esc(C.STAGES.find(x=>x[0]===status)?.[1]||status)}</span>`;}
function label(id,text,opts={}){return `<label class="field ${opts.class||''}">${text}<input name="${id}" type="${opts.type||'text'}" value="${esc(opts.value??'')}" ${opts.required?'required':''} ${opts.min!==undefined?`min="${opts.min}"`:''} ${opts.max!==undefined?`max="${opts.max}"`:''} ${opts.step!==undefined?`step="${opts.step}"`:''} placeholder="${esc(opts.placeholder||'')}"></label>`;}
function select(name,title,items,value,extra=''){return `<label class="field">${title}<select name="${name}" ${extra}>${items.map(x=>`<option value="${esc(x[0])}" ${String(x[0])===String(value)?'selected':''}>${esc(x[1])}</option>`).join('')}</select></label>`;}
function optionRec(value){return S.recipes.map(r=>[r.id,r.name]).map(([id,name])=>`<option value="${esc(id)}" ${value===id?'selected':''}>${esc(name)}</option>`).join('');}
function optionIng(value){return S.ingredients.map(i=>[i.id,`${i.name} (${i.unit})`]).map(([id,name])=>`<option value="${esc(id)}" ${value===id?'selected':''}>${esc(name)}</option>`).join('');}
function divTitle(title,description,btn=''){return `<div class="page-intro"><div><div class="overline">WANELLE STUDIO ✳</div><h2>${title}</h2><p>${description}</p></div>${btn}</div>`;}
function orderDesc(o){return C.itemDescription(o,S);}
function orderFigure(o){const calc=C.calculate(o,S);return o.quoteSnapshot?.effectivePrice??(calc.quoteReady?calc.effectivePrice:null);}
function updateSidebar(){document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#side-new').textContent=S.orders.filter(o=>o.status==='novo').length;$('#page-title').textContent=titles[view];}
function render(){if(!S)return;updateSidebar();const pages={dashboard,orders,production,recipes,ingredients,market,settings};$('#main').innerHTML=pages[view]();}
function dashboard(){
 const pending=S.orders.filter(o=>o.status==='novo').length;
 const active=S.orders.filter(o=>['confirmado','producao','pronto'].includes(o.status));
 const coming=S.orders.filter(o=>o.eventDate>=day()&&o.eventDate<=day(7)&&o.status!=='entregue').sort((a,b)=>a.eventDate.localeCompare(b.eventDate));
 const revenue=S.orders.filter(o=>o.status!=='novo').reduce((acc,o)=>acc+(orderFigure(o)||0),0);
 const forecast=active.reduce((acc,o)=>acc+C.calculate(o,S).totalCost,0);
 return `<div class="page-intro"><div><div class="overline">✳ SEU ATELIÊ EM ORDEM</div><h2>Bom ter você por aqui ♡</h2><p>Acompanhe cada encomenda sem precisar abrir uma planilha.</p></div><button class="btn btn-muted" data-view="orders">Ver todos os pedidos ↗</button></div>
  <div class="stats-grid">
  ${stat('Pedidos novos',pending,'Aguardando seu orçamento','♡')}
  ${stat('Em andamento',active.length,'Confirmados, produção ou prontos','◈')}
  ${stat('Próximos 7 dias',coming.length,'Entregas e retiradas agendadas','▦')}
  ${stat('Valor de orçamentos',fmt(revenue),'Estimativa dos pedidos não novos','✳')}
  </div>
  <div class="panels"><section class="panel"><div class="panel-title"><h3>Próximas encomendas</h3><button class="mini-action" data-view="orders">Abrir esteira ↗</button></div>
  ${coming.length?coming.slice(0,6).map(o=>`<div class="order-row"><span class="order-avatar">♡</span><div class="order-meta"><b>${esc(o.customer)}</b><span>${esc(orderDesc(o))} • ${C.dateBR(o.eventDate)} • ${o.servings} pessoas</span></div>${styleStage(o.status)}<button class="mini-action" data-order="${esc(o.id)}">Ver ↗</button></div>`).join(''):'<div class="empty">Nenhuma encomenda para os próximos 7 dias. ♡</div>'}
  </section><aside class="panel"><div class="panel-title"><h3>Seu cantinho de gestão</h3></div><div class="explain">As fotos antigas são apenas inspirações, sem preço histórico. A cada nova encomenda, você cria a ficha técnica com quantidades e custos reais. Só então o Studio calcula <strong>mão de obra, energia, água, gás, despesas, personalização e lucro</strong> automaticamente.</div><div class="quick-links"><button class="btn btn-sm" data-view="recipes">Fichas técnicas ↗</button><button class="btn btn-sm" data-view="market">Pesquisar preços ↗</button><button class="btn btn-sm" data-view="settings">Regras de preço ↗</button><button class="btn btn-sm" data-view="production">Lista de compras ↗</button></div><div class="divider"></div><span class="small-muted">Custo estimado das encomendas em andamento:</span><div class="price-big" style="margin-top:6px">${fmt(forecast)}</div><span class="small-muted">Inclui custos fixos e variáveis estimados.</span></aside></div>`;
}
function stat(t,v,small,ico){return `<article class="stat-card"><div class="stat-top"><span>${t}</span><span class="stat-icon">${ico}</span></div><div class="stat-value">${v}</div><div class="stat-note">${small}</div></article>`;}
function orders(){
 let selected=S.orders.filter(o=>(`${o.customer} ${o.id} ${orderDesc(o)}`).toLocaleLowerCase('pt-BR').includes(orderSearch.toLocaleLowerCase('pt-BR')));
 return divTitle('Tudo no seu tempo','Cada novo pedido começa sem preço: cadastre a receita real, revise insumos e só então envie o orçamento.',`<button class="btn btn-primary" data-action="new-order">+ Cadastrar pedido</button>`)
 + `<div class="toolbar"><input class="search-field" id="search-orders" aria-label="Buscar pedidos" placeholder="⌕ Buscar cliente ou encomenda..." value="${esc(orderSearch)}"><span class="small-muted">${selected.length} pedido(s) • da solicitação à entrega</span></div>`
 + `<div class="kanban">${C.STAGES.map(([stage,title])=>{
    const rows=selected.filter(o=>o.status===stage).sort((a,b)=>(a.eventDate||'').localeCompare(b.eventDate||''));
    return `<div class="kanban-column"><div class="column-head">${title}<span class="column-count">${rows.length}</span></div>${rows.length?rows.map(o=>`<article class="kanban-card" role="button" tabindex="0" data-order="${esc(o.id)}"><span class="short-id">${esc(o.id)}</span><h3>${esc(o.customer)}</h3><p>${esc(orderDesc(o))}</p><p>◷ ${C.dateBR(o.eventDate)} • ${o.servings} pessoas</p><div class="bottom"><span>${orderFigure(o)==null?'Aguardando ficha e custos':fmt(orderFigure(o))}</span><span>Ver ↗</span></div></article>`).join(''):'<div class="empty-col">Nenhum pedido aqui ♡</div>'}</div>`;}).join('')}</div>`;
}
function recipes(){return divTitle('Suas fichas técnicas','Comece com sua próxima venda real. Nenhuma foto antiga tem receita ou preço presumidos. Receitas cadastradas podem ser reutilizadas e ajustadas.',`<button class="btn btn-primary" data-action="new-recipe">+ Nova receita</button>`)
 + `${!S.recipes.length?`<div class="empty" style="margin:18px 0">Ainda não existem fichas técnicas. Quando entrar a próxima encomenda, cadastre a receita, os ingredientes realmente usados, embalagem e tempo. Depois o sistema calculará os preços.</div>`:""}<div class="recipe-grid">${S.recipes.map(r=>{
   const result=C.calculate({items:[{recipeId:r.id,qty:1}],servings:r.servings,custom:false},S);
   const photo=C.products.find(p=>p.id===r.id)?.photo;
   return `<article class="recipe-card">${photo?`<img class="recipe-photo" src="${photo}" alt="${esc(r.name)}">`:`<div class="recipe-photo" style="display:grid;place-items:center;font:64px Georgia;color:var(--wine)">♡</div>`}<div class="recipe-body"><h3>${esc(r.name)}</h3><p>${r.servings} porções-base • ${(r.lines||[]).length} ingredientes • ${r.laborMinutes} min-base • ${r.baseFillingLayers||2} camadas de recheio ${r.custom?'• Personalizada':''}</p><div class="recipe-bottom"><div><span class="price-note">${result.quoteReady?`Preço calculado para ${r.servings} pessoas`:`Pendente de custos / insumos`}</span><div class="price-big">${result.quoteReady?fmt(result.suggested):`—`}</div></div><button class="btn btn-sm" data-recipe="${esc(r.id)}">Editar ↗</button></div></div></article>`;
 }).join('')}</div>`;}
function ingredients(){
 const items=S.ingredients.filter(i=>i.name.toLocaleLowerCase('pt-BR').includes(ingredientSearch.toLocaleLowerCase('pt-BR')));
 return divTitle('Ingredientes com preço certo','Informe o preço da embalagem e quanto ela contém. O custo por grama, ml ou unidade é calculado automaticamente.',`<button class="btn btn-primary" data-action="new-ingredient">+ Novo ingrediente</button>`)
 + `<div class="toolbar"><input class="search-field" id="search-ingredients" placeholder="⌕ Buscar ingrediente..." value="${esc(ingredientSearch)}"><span class="small-muted">Os ingredientes começam sem preço. Cadastre o valor real ou aplique uma cotação conferida.</span></div>`
 + `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Ingrediente</th><th>Embalagem</th><th>Preço da embalagem</th><th>Proteção sugerida</th><th>Custo unitário protegido</th><th>Em estoque</th><th></th></tr></thead><tbody>${items.map(i=>`<tr><td><strong>${esc(i.name)}</strong><br><span class="small-muted">${i.priceSource?esc(i.priceSource.store+" • " +(i.priceSource.checkedAt||"sem data")):"⚠ Aguardando preço real"}</span></td><td>${i.packageQty} ${i.unit}</td><td>${i.priceSource?fmt(i.packagePrice):"—"}</td><td>${i.priceSource?fmt(C.safePackagePrice(i,S.settings)):"—"}</td><td><strong>${i.priceSource?fmt(C.unitCost(i,S.settings)):"—"} ${i.priceSource?"/ "+i.unit:""}</strong></td><td>${i.stockQty||0} ${i.unit}</td><td class="right"><button class="btn btn-sm" data-ingredient="${esc(i.id)}">Editar ↗</button></td></tr>`).join('')}</tbody></table></div>`;
}

function market(){
 const catalog=window.WANELLE_MARKET||{quotes:[]};
 const rows=catalog.quotes;
 const official=rows.filter(x=>x.level==='official');
 const alternatives=rows.filter(x=>x.level==='alternative');
 const reported=rows.filter(x=>x.level==='user_reported');
 const noQuote=S.ingredients.filter(i=>!i.priceSource);
 const today=day();
 function tile(q){
   const ing=q.ingredientId&&S.ingredients.find(i=>i.id===q.ingredientId);
   const applied=ing?.priceSource?.quoteId===q.id;
   const expired=q.validUntil&&q.validUntil<today;
   const notReady=q.confidence==='ambiguous';
   const label=q.level==='official'?'Atakarejo oficial':q.level==='user_reported'?'iFood • anotado':'Alternativa Salvador';
   const safeUrl=typeof q.source==='string'&&/^https:\/\//.test(q.source);
   const weight=Number(q.packageQty)>0&&q.unit==='g'?` • ${fmt(q.price*1000/q.packageQty)} / kg`:'';
   return `<article class="market-tile">
      <div class="market-title"><b>${esc(q.product)}</b><span class="market-tag ${esc(q.level)}">${label}</span></div>
      <div class="market-details"><strong class="market-value">${fmt(q.price)}</strong><span>${q.packageQty} ${esc(q.unit)}${weight}</span></div>
      <div class="small-muted">Proteção para orçamento: <b>${fmt(C.safePackagePrice({packagePrice:q.price},S.settings))}</b> pela embalagem, com ${C.n(S.settings.ingredientPriceBufferPct)}% de folga e arredondamento para cima. Não é cotação do mercado.</div>
      <div class="small-muted">${esc(q.store)} • ${q.level==='user_reported'?'Anotado em ':'Consultado em '}${C.dateBR(q.checkedAt)}${q.validUntil?' • Oferta até '+C.dateBR(q.validUntil):''}</div>
      ${q.note?`<p class="small-muted">${esc(q.note)}</p>`:''}
      ${q.level==='user_reported'?'<div class="market-warning">Anotação do iFood — conferir produto e carrinho antes de aplicar.</div>':''}
      ${expired?'<div class="market-warning">Oferta vencida — confirmar novo preço antes de usar</div>':''}
      <div class="market-buttons">${safeUrl?`<a class="btn btn-sm" href="${esc(q.source)}" target="_blank" rel="noopener noreferrer">Ver fonte ↗</a>`:'<span class="small-muted">Fonte: anotação feita durante pesquisa no iFood</span>'}
      ${applied?'<span class="market-used">✓ Aplicado nesta ficha</span>':notReady?'<span class="market-warning">Marca, variante ou embalagem pendente — não aplicar</span>':`<button class="btn btn-sm ${q.level==='official'?'btn-primary':''}" data-action="apply-quote" data-id="${esc(q.id)}">${ing?'Usar na ficha ↗':'Cadastrar insumo ↗'}</button>`}</div>
   </article>`;
 }
 const sections=[['farinha','Farinha de trigo'],['margarina','Margarina'],['chocolate','Chocolate e cacau']].map(([cat,label])=>{
   const list=reported.filter(q=>q.category===cat);
   return `<details class="panel" style="margin-top:14px" ${cat==='farinha'?'open':''}><summary style="cursor:pointer;font-weight:800;padding:8px">${label} — ${list.length} cotações</summary><div class="market-grid" style="margin-top:16px">${list.map(tile).join('')}</div></details>`;
 }).join('');
 return divTitle('Valores pesquisados em Salvador','Preço observado e preço protegido são diferentes. A proteção absorve variações de preço; não substitui cotação válida nem margem de lucro.',`<button class="btn btn-muted" data-view="ingredients">Ver ingredientes ↗</button>`)
 + `<div class="market-banner"><b>Mercado preferencial: Atakarejo — Boca do Rio ♡</b><p>As 67 cotações novas foram ANOTADAS durante a pesquisa no iFood em 14/10/2026. Não comprovam o preço na loja Boca do Rio, nem a disponibilidade do produto. Frete informado: Atakarejo aproximadamente R$ 21–21,50 por compra; Assaí possivelmente grátis acima de R$ 50 (verificar CEP e condição no carrinho). Ratear o frete da compra; nunca atribuir automaticamente todo o frete a uma só torta.</p></div>`
 + `<div class="market-stats"><article><b>${reported.length}</b><span>Novas cotações relatadas do iFood</span></article><article><b>${official.length+alternatives.length}</b><span>Valores pesquisados anteriormente</span></article><article><b>${noQuote.length}</b><span>Ingredientes sem custo aplicado</span></article></div>`
 + `<h3 class="market-heading">Pesquisa do iFood • 14/10/2026</h3>${sections}`
 + `<details class="panel" style="margin-top:22px"><summary style="cursor:pointer;font-weight:800;padding:8px">Cotações anteriores — Atakarejo (encarte) e Atacadão (${official.length+alternatives.length})</summary><h3 class="market-heading">Atakarejo • encarte Bahia</h3><div class="market-grid">${official.map(tile).join('')}</div><h3 class="market-heading">Outros mercados Salvador</h3><div class="market-grid">${alternatives.map(tile).join('')}</div></details>`
 + `<section class="panel" style="margin-top:22px"><div class="panel-title"><h3>Antes de fechar o orçamento</h3></div><p class="small-muted">Ainda faltam preços de abacaxi, coco, ovos, leite condensado, açúcar usado na receita, chantilly, embalagens e custos de água/energia específicos. Não misture farinha com e sem fermento; não troque percentuais de cacau sem ajustar a receita. Até cadastrar quantidades e horas reais, R$ 160 é uma proposta comercial, não garantia de lucro.</p></section>`;
}
function day(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function production(){
 const selected=S.orders.filter(o=>['confirmado','producao','pronto'].includes(o.status)&&(!prodDate||(o.eventDate===prodDate))&& (prodDate || (o.eventDate>=day()&&o.eventDate<=day(7)))).sort((a,b)=>a.eventDate.localeCompare(b.eventDate));
 const needs=new Map();
 selected.forEach(o=>C.calculate(o,S).usedIngredients.forEach(i=>{const old=needs.get(i.ingredientId)||{...i,quantity:0};old.quantity+=i.quantity;old.toBuy=Math.max(0,old.quantity-old.stockQty);needs.set(i.ingredientId,old);}));
 const supplies=[...needs.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 return divTitle('Produção sem surpresas','Veja o que produzir e os ingredientes que serão necessários, somando os pedidos confirmados.',`<button class="btn btn-muted" data-action="print">Imprimir lista ↗</button>`)
 + `<div class="toolbar"><label class="field" style="margin:0;min-width:225px">Escolha uma data (vazio = próximos 7 dias)<input id="production-date" type="date" value="${esc(prodDate)}"></label><button class="btn btn-sm" data-action="clear-prod-date">Ver próximos 7 dias</button><span class="count-badge">${selected.length} pedido(s) selecionado(s)</span></div>`
 + `<div class="production-grid"><section class="panel"><div class="panel-title"><h3>Agenda de produção</h3></div>${selected.length?selected.map(o=>`<article class="production-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h3>${esc(o.customer)}</h3>${styleStage(o.status)}</div><p><strong class="strong-wine">${C.dateBR(o.eventDate)}</strong> • ${esc(orderDesc(o))} • ${o.servings} porções<br>${nice(C.calculate(o,S).labor.totalMinutes)} minutos de trabalho ativo previsto; embalagem e insumos considerados no cálculo.</p><button class="mini-action" data-order="${esc(o.id)}">Ver ficha e quantidades ↗</button></article>`).join(''):'<div class="empty">Sem encomendas confirmadas nesse período.</div>'}</section>
 <section class="panel"><div class="panel-title"><h3>Lista inteligente de compras</h3></div><p class="small-muted">Soma do consumo previsto, descontando o estoque informado. A previsão de caixa usa embalagens inteiras e o valor com reserva de preço, não apenas os gramas consumidos. O valor realmente pago depende da compra.</p>${supplies.length?`<div style="overflow:auto"><table class="data-table" style="min-width:620px"><thead><tr><th>Ingrediente</th><th>Necessário</th><th>Falta comprar</th><th>Embalagens</th><th>Compra prevista c/ folga</th></tr></thead><tbody>${supplies.map(i=>{const ing=S.ingredients.find(x=>x.id===i.ingredientId);const packs=ing?.packageQty?Math.ceil(i.toBuy/ing.packageQty):0;return `<tr><td><strong>${esc(i.name)}</strong></td><td>${nice(i.quantity)} ${i.unit}</td><td class="${i.toBuy>0?'stock-low':''}">${nice(i.toBuy)} ${i.unit}</td><td>${packs} × ${nice(C.n(ing?.packageQty))} ${i.unit}</td><td>${fmt(packs*C.safePackagePrice(ing,S.settings))}</td></tr>`;}).join('')}</tbody></table></div><div class="explain" style="margin-top:12px"><b>Desembolso de compra estimado:</b> ${fmt(supplies.reduce((sum,i)=>{const ing=S.ingredients.find(x=>x.id===i.ingredientId);return sum+(ing?.packageQty?Math.ceil(i.toBuy/ing.packageQty)*C.safePackagePrice(ing,S.settings):0);},0))}. Esse é o dinheiro necessário no caixa para comprar embalagens inteiras, não o custo consumido pelos bolos (que considera apenas quantidades usadas).</div>`:'<div class="empty">A lista aparece assim que houver pedidos confirmados.</div>'}</section></div>`;
}
function nice(n){return Number(n.toFixed(1)).toLocaleString('pt-BR');}
function settings(){
 const s=S.settings;
 const groups=[
 ['Seu trabalho',[
  ['laborHourly','Hora de produção (R$)','Sugestão inicial R$ 25/h; valor próprio, não tabela oficial de autônomos.'],
  ['decorationHourly','Hora de decoração (R$)','Sugestão inicial R$ 35/h; tempo separado na ficha técnica.'],
  ['cakesPerMonth','Bolos vendidos por mês','Para dividir geladeira e custos mensais. Informe a média real.']]],
 ['Energia — batedeira, forno e geladeira',[
  ['electricityKwhRate','Custo do kWh (R$)','Coelba B1: R$ 0,87773 sem impostos (2026). Substitua pelo custo efetivo da fatura.'],
  ['mixerWatts','Batedeira — potência (W)','Veja a etiqueta da batedeira; 500 W é ilustrativo.'],
  ['mixerMinutesPerCake','Batedeira — minutos por torta-base','Tempo de motor ligado, não tempo total de receita.'],
  ['ovenElectricEnabled','Forno elétrico? 1 = sim; 0 = gás','Se elétrico, conta a energia do forno; se a gás, usa o gasto de gás abaixo.'],
  ['ovenWatts','Forno elétrico — potência (W)','Valor ilustrativo; só usado quando forno elétrico = 1.'],
  ['ovenMinutesPerCake','Forno elétrico — minutos por torta-base','Estimativa conservadora. Termostato pode reduzir consumo real.'],
  ['fridgeKwhPerMonth','Geladeira — kWh por mês','Consumo estimado dedicado à produção; informe medição real quando possível.']]],
 ['Água e gás',[
  ['waterRateM3','Água — R$ por m³, antes do esgoto','Provisório: R$ 44,77 ÷ 6 m³ (mínimo Embasa residencial normal de 2026). Não é tarifa marginal.'],
  ['sewagePct','Esgoto (% sobre água)','Use 80% apenas se a conta incluir essa cobrança; confirme na fatura.'],
  ['waterLitersPerCake','Água — litros por torta-base','Inclua lavagem de tigelas, bancada, utensílios e ingredientes. 15 L é exemplo.'],
  ['gasPerCake','Gás por torta-base (R$)','Usado apenas com forno a gás. Meça: preço do botijão ÷ horas úteis × tempo de forno.']]],
 ['Reserva contra aumento semanal', [
  ['ingredientPriceBufferPct','Proteção sobre ingredientes (%)','Sugestão inicial: 10% sobre cada embalagem pesquisada. Não é lucro; ajuste com compras reais.'],
  ['ingredientPriceRoundingStep','Arredondar embalagem protegida para múltiplos de R$','Sugestão: R$ 0,50. Ex.: pacote de R$ 4,64 → R$ 5,50 após aplicar 10%.']]],
 ['Despesas e lucro',[
  ['otherPerCake','Limpeza e pequenos gastos (R$)','Sabão, papel, desgaste dos utensílios: valor ilustrativo.'],
  ['fixedMonthlyCosts','Custos fixos mensais (R$)','Internet, aluguel e outras despesas NÃO contabilizadas antes. Não duplicar geladeira/energia.'],
  ['indirectPct','Reserva/indiretos sobre custo direto (%)','Porcentagem extra para custos não mapeados, sem duplicar custos fixos.'],
  ['creationPct','Serviço criativo adicional (%)','Cobrado no preço sugerido de personalizados, não duplicado como custo de produção.'],
  ['targetMarginPct','Margem de lucro desejada (%)','Lucro como proporção do preço de venda, além do pagamento pela mão de obra.'],
  ['paymentFeePct','Taxa de cartão/recebimento (%)','Custo proporcional de recebimento.'],
  ['salesTaxPct','Tributos sobre faturamento (%)','Preencha conforme regime tributário; 0 significa NÃO INFORMADO.'],
  ['roundTo','Arredondar preço para múltiplos de R$','Ex.: 5 arredonda para o próximo múltiplo de R$ 5.']]]
 ];
 const sections=groups.map(([heading,fields])=>`<section class="panel" style="margin-top:17px"><div class="panel-title"><h3>${heading}</h3></div><div class="settings-grid">${fields.map(([id,title,hint])=>`<label class="field">${title}${id==='ovenElectricEnabled'?`<select name="${id}" required><option value="0" ${!Number(s[id])?'selected':''}>Forno a gás</option><option value="1" ${Number(s[id])?'selected':''}>Forno elétrico</option></select>`:`<input type="number" name="${id}" min="0" step="${id==='electricityKwhRate'||id==='waterRateM3'?'0.00001':'0.01'}" value="${esc(s[id])}" required>`}<small>${hint}</small></label>`).join('')}</div></section>`).join('');
 return divTitle('Custos reais, lucro separado','A Wanelle soma ingredientes, seu tempo de trabalho, equipamentos, água, gás, embalagem, estrutura e taxas. Todos os valores são editáveis.')
 + `<form id="settings-form"><div class="market-warning" style="padding:14px;border-radius:12px;background:#fff0e2"><strong>⚠ Antes de vender:</strong> consumos desconhecidos começam zerados e NÃO equivalem a custo zero na vida real. Confira equipamentos, faturas e receitas. A Coelba está sem impostos no valor de referência.</div>${sections}<section class="panel" style="margin-top:17px"><label class="field" style="flex-direction:row;align-items:flex-start;gap:11px"><input type="checkbox" name="costsConfirmed" value="1" ${s.costsConfirmed?'checked':''} style="width:18px;min-height:18px;flex:none"><span><b>Conferi os custos operacionais reais</b><small>Confirme somente após revisar consumo de energia, água, gás, limpeza, embalagem, despesas mensais, valor/hora e taxas. Zero significa de fato R$ 0, não campo desconhecido.</small></span></label></section><section class="panel" style="margin-top:17px"><div class="quick-links"><button type="submit" class="btn btn-primary">Salvar regras e recalcular ♡</button></div><p class="small-muted">Proteção: o custo dos ingredientes usa o preço cotado + reserva configurável, arredondado por embalagem (não por grama). Frete e embalagem continuam separados; não somar a reserva duas vezes. Preço sugerido = (custo total estimado + adicional de serviço criativo, quando houver) ÷ (1 − margem − taxa de pagamento − tributos). A criação é uma cobrança extra, não um gasto duplicado. A mão de obra é paga mesmo quando não há lucro. Margem e remuneração da confeiteira não são a mesma coisa. Não informe zero nos tributos se houver imposto aplicável ao negócio.</p></section></form>`
 + `<section class="panel" style="margin-top:19px"><div class="panel-title"><h3>Seus dados</h3></div><p class="small-muted">Faça cópia dos dados da demonstração. Com Neon conectado, ficam armazenados no banco online.</p><div class="quick-links"><button class="btn btn-sm" data-action="export">↓ Baixar backup JSON</button>${!C.live?'<button class="btn btn-sm" data-action="import">↑ Restaurar backup</button><button class="btn btn-sm btn-danger" data-action="reset">Reiniciar dados de exemplo</button>':''}</div><input type="file" accept="application/json,.json" id="import-file" hidden></section>`;
}
function showModal(content,wide=false){const m=$('#modal');m.classList.toggle('wide',wide);$('#modal-content').innerHTML=content;m.showModal();}
function closeModal(){const m=$('#modal');if(m.open)m.close();}
function modalHead(title,caption=''){return `<div class="modal-head"><div><span class="overline" style="color:#ffbf8f">WANELLE STUDIO</span><h2>${esc(title)}</h2><p>${esc(caption)}</p></div><button type="button" class="close-modal" data-action="close-modal" aria-label="Fechar">×</button></div>`;}
function recipeLineHtml(line={}) {
 const component=line.component||C.inferComponent(line.ingredientId);
 return `<div class="recipe-line ingredient-phase-line"><label class="field">Ingrediente<select name="ingredientId">${optionIng(line.ingredientId)}</select></label><label class="field">Quantidade<input type="number" name="quantity" step="0.01" min="0.01" value="${esc(line.quantity||1)}" required></label>${select('component','Entra em qual parte?',C.COMPONENTS,component)}<button type="button" class="btn btn-sm btn-danger" data-action="remove-recipe-line" title="Remover ingrediente">×</button></div>`;
}
let attachRecipeToOrder=null;
function recipeModal(id, initialName=''){
 const r=S.recipes.find(x=>x.id===id)||{id:'',name:'',servings:20,laborMinutes:0,decorationMinutes:0,baseFillingLayers:2,packaging:0,custom:false,lines:[]};
 showModal(`${modalHead(id?'Editar ficha técnica':'Nova receita','Cadastre o rendimento, os tempos-base e identifique quais ingredientes pertencem ao recheio.')}
 <form id="recipe-form"><div class="modal-body"><input name="id" type="hidden" value="${esc(r.id)}"><div class="form-grid">
 ${label('name','Nome da receita *',{value:r.name||initialName,required:true})}
 ${label('servings','Receita-base serve quantas pessoas? *',{type:'number',min:1,value:r.servings,required:true})}
 ${label('baseFillingLayers','Camadas de recheio nesta receita-base *',{type:'number',min:1,max:10,value:r.baseFillingLayers||2,required:true})}
 ${label('laborMinutes','Tempo ativo total da receita-base (min) *',{type:'number',min:0,value:r.laborMinutes,required:true})}
 ${label('decorationMinutes','Do tempo total, minutos só de decoração',{type:'number',min:0,value:r.decorationMinutes??Math.round(r.laborMinutes*.18)})}
 ${label('packaging','Embalagem-base (R$) *',{type:'number',min:0,step:0.01,value:r.packaging,required:true})}
 </div><label class="field" style="flex-direction:row;align-items:center;gap:11px"><input type="checkbox" name="custom" ${r.custom?'checked':''} style="width:auto;min-height:auto"> Receita personalizada (adicional de serviço criativo)</label>
 <div class="explain"><b>Importante:</b> o tempo de forno ou descanso não é hora de trabalho ativa. O sistema estima o tempo de massa, recheio, montagem, decoração e limpeza a partir do total da receita, e você pode ajustar cada etapa no orçamento. As quantidades de ingredientes marcados como <b>Recheio / camadas</b> aumentam com as camadas extras; os demais não são multiplicados por esse número.</div>
 <div class="divider"></div><div class="panel-title"><h3>Lista de ingredientes por etapa</h3><button type="button" class="btn btn-sm" data-action="add-recipe-line">+ Ingrediente</button></div><p class="small-muted">Separe corretamente os ingredientes de massa, recheio, cobertura e decoração. A composição-base precisa ser validada pela confeiteira.</p><div class="line-items" id="recipe-lines">${(r.lines||[]).map(recipeLineHtml).join('')}</div></div>
 <div class="modal-footer">${id?`<button class="btn btn-danger" type="button" data-action="delete-recipe" data-id="${esc(id)}">Excluir receita</button>`:''}<button type="button" class="btn" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Salvar ficha técnica ♡</button></div></form>`,true);
}
function ingredientModal(id){
 const ing=S.ingredients.find(x=>x.id===id)||{id:'',name:'',unit:'g',packageQty:1000,packagePrice:0,stockQty:0,lossPct:0};
 showModal(`${modalHead(id?'Editar ingrediente':'Novo ingrediente','O custo usado nos bolos sai automaticamente do preço desta embalagem.')}
 <form id="ingredient-form"><div class="modal-body"><input name="id" type="hidden" value="${esc(ing.id)}"><div class="form-grid">
 <div class="span-2">${label('name','Nome do ingrediente *',{value:ing.name,required:true})}</div>
 ${select('unit','Unidade de medida',[['g','Gramas (g)'],['ml','Mililitros (ml)'],['un','Unidades (un)']],ing.unit)}
 ${label('packageQty','Quantidade na embalagem *',{type:'number',min:0.01,step:0.01,value:ing.packageQty,required:true})}
 ${label('packagePrice','Valor da embalagem (R$) *',{type:'number',min:0,step:0.01,value:ing.packagePrice,required:true})}
 ${label('stockQty','Quantidade que tem em estoque',{type:'number',min:0,step:0.01,value:ing.stockQty})}
 ${label('lossPct','Perda / desperdício estimado (%)',{type:'number',min:0,step:0.01,value:ing.lossPct})}
 ${label('supplier','Mercado / fornecedor desta cotação',{value:ing.priceSource?.store||''})}
 ${label('priceCheckedAt','Data em que conferiu o preço',{type:'date',value:ing.priceSource?.checkedAt||day()})}
 </div><div class="explain"><strong>Exemplo:</strong> R$ 10 por 1.000 g = R$ 3,00 para 300 g. Com proteção de 10% e arredondamento de R$ 0,50, a embalagem protegida fica em R$ 11,00, logo o custo para 300 g fica R$ 3,30. O valor cotado permanece R$ 10. Essa reserva não é lucro e não substitui o valor realmente pago.</div></div>
 <div class="modal-footer">${id?`<button type="button" class="btn btn-danger" data-action="delete-ingredient" data-id="${esc(id)}">Excluir</button>`:''}<button class="btn" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Salvar ingrediente ♡</button></div></form>`);
}
function orderItemHtml(item={recipeId:'',referenceId:'',qty:1}){return `<div class="recipe-line order-item-line">
 <label class="field">Inspiração (foto do portfólio)<select name="order-reference"><option value="">Modelo novo / sem foto</option>${C.products.map(p=>`<option value="${esc(p.id)}" ${item.referenceId===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label>
 <label class="field">Ficha técnica para cálculo<select name="order-recipe"><option value="">Aguardando cadastrar receita</option>${optionRec(item.recipeId)}</select></label>
 <label class="field">Unidades<input type="number" name="order-qty" min="1" max="30" step="1" value="${esc(item.qty||1)}"></label>
 <button class="btn btn-sm btn-danger" type="button" title="Remover torta" data-action="remove-order-line">×</button></div>`;}
function getModalOrder(){
 const f=$('#order-form-editor'); const fd=new FormData(f);
 const rows=[...f.querySelectorAll('.order-item-line')].map(line=>({referenceId:line.querySelector('[name=order-reference]').value,recipeId:line.querySelector('[name=order-recipe]').value,qty:Math.max(1,Math.round(Number(line.querySelector('[name=order-qty]').value)||1))}));
 const prev=S.orders.find(x=>x.id===fd.get('id'));
 const salePrice=String(fd.get('salePrice')||'').trim();
 const stageMinutes=Object.fromEntries(C.STAGE_DEFS.map(stage=>[stage.id,C.n(f.querySelector(`[name="stage-${stage.id}"]`)?.value)]));
 const actualStageMinutes=Object.fromEntries(C.STAGE_DEFS.map(stage=>[stage.id,C.n(f.querySelector(`[name="actual-${stage.id}"]`)?.value)]));
 return {...(prev||{}),id:fd.get('id')||C.id(),customer:String(fd.get('customer')||'').trim(),phone:String(fd.get('phone')||'').trim(),occasion:fd.get('occasion')||'',eventDate:fd.get('eventDate')||'',servings:Math.max(1,Math.round(Number(fd.get('servings'))||20)),items:rows.length?rows:[{referenceId:'',recipeId:'',qty:1}],method:fd.get('method'),neighborhood:fd.get('neighborhood')||'',flavor:fd.get('flavor')||'',filling:fd.get('filling')||'',decoration:fd.get('decoration')||'',notes:fd.get('notes')||'',custom:fd.has('custom'),fillingLayers:Math.max(1,Math.min(10,Math.round(C.n(fd.get('fillingLayers'))||2))),sizeCm:fd.get('sizeCm')?C.n(fd.get('sizeCm')):null,decorationLevel:fd.get('decorationLevel')||'simples',laborMode:fd.get('laborMode')||'auto',stageMinutes,actualRecorded:fd.has('actualRecorded'),actualStageMinutes,actualExtraCost:C.n(fd.get('actualExtraCost')),extraMaterialsCost:C.n(fd.get('extraMaterialsCost')),otherOrderCost:C.n(fd.get('otherOrderCost')),provisionalApproved:fd.has('provisionalApproved'),deliveryCost:C.n(fd.get('deliveryCost')),salePrice:salePrice===''?null:C.n(salePrice),status:fd.get('status')||'novo',createdAt:prev?.createdAt||new Date().toISOString(),source:prev?.source||'painel',updatedAt:new Date().toISOString()};
}
function buildDetails(o){
 const c=C.calculate(o,S);
 if(!c.quoteReady){return `<div class="risk-box danger"><strong>⏳ Ainda sem preço calculado</strong><p>${c.missingRecipes?'Cadastre ou vincule uma ficha técnica para cada torta. ':''}${c.incompleteRecipes?'Complete ingredientes, embalagem e tempo da receita. ':''}${!S.settings.costsConfirmed?'Valide os custos operacionais na aba Custos & preços. ':''}${c.missingPrices.length?'Faltam preços reais de '+c.missingPrices.slice(0,8).map(esc).join(', ')+'. ':''}As fotos das criações anteriores são apenas referências; não há custo histórico inventado. Preencha os dados da nova venda para calcular o valor.</p></div>`;}
 const rows=[['Ingredientes',c.ingredientsCost],['Embalagem',c.packagingCost],['Materiais extras (topper, laços...)',c.extraMaterialsCost],['Outros gastos deste pedido',c.otherOrderCost],['Mão de obra — massa e demais etapas',c.laborCost-c.decorationLaborCost],['Mão de obra — confeitar',c.decorationLaborCost],['Batedeira',c.mixerCost],['Forno elétrico',c.ovenCost],['Geladeira (rateio)',c.fridgeCost],['Água e esgoto',c.waterCost],['Gás',c.gasCost],['Limpeza e pequenos gastos',c.otherUtilitiesCost],['Despesas fixas (rateio)',c.fixedCosts],['Reserva de indiretos',c.indirectCost],['Entrega (custo)',c.deliveryCost]];
 const dangerous=c.profit<0||c.effectivePrice<c.minimumBreakeven;
 const warnings=`<div class="${c.missingPrices.length?'risk-box danger':'risk-box'}"><strong>${c.missingPrices.length?'⚠ Orçamento ainda provisório':'◈ Conferência necessária'}</strong><p>${c.missingPrices.length?`${c.missingPrices.length} ingrediente(s) sem valor documentado: ${c.missingPrices.slice(0,7).map(esc).join(', ')}${c.missingPrices.length>7?'...':''}. `:''}Dados de faturas, perdas, receita e produtividade precisam ser conferidos antes de usar como preço final.${c.risks.length?` <b>Alertas:</b> ${c.risks.map(esc).join(' • ')}.`:''}</p></div>`;
 const times=C.STAGE_DEFS.map(stage=>`<div class="stage-cost"><span>${esc(stage.label)}</span><b>${nice(c.labor.stageMinutes[stage.id])} min</b><strong>${fmt(c.labor.laborByStage[stage.id])}</strong></div>`).join('');
 return `${warnings}<section class="stage-result"><div class="stage-result-heading"><b>Tempo ${c.labor.mode==='auto'?'estimado':'informado'} de trabalho ativo</b><strong>${nice(c.labor.totalMinutes)} min · ${fmt(c.laborCost)}</strong></div>${times}<p class="small-muted">Cozimento/descanso não são cobrados como trabalho contínuo. Energia e gás entram separadamente.</p></section>
 <section class="breakdown"><div class="overline">CUSTO ESTIMADO — CONFIRMAR</div>${rows.map(([name,value])=>`<div class="breakdown-row"><span>${esc(name)}</span><b>${fmt(value)}</b></div>`).join('')}<div class="breakdown-row total"><span>Custo total (inclusive remuneração)</span><b>${fmt(c.totalCost)}</b></div><div class="breakdown-row"><span>Serviço criativo a cobrar à parte do custo</span><b>${fmt(c.creationFee)}</b></div><div class="breakdown-row"><span>Taxa do recebimento</span><b>${fmt(c.fee)}</b></div><div class="breakdown-row"><span>Tributos informados</span><b>${fmt(c.salesTax)}</b></div><div class="breakdown-row"><span>Lucro projetado (além da remuneração)</span><b>${fmt(c.profit)} (${nice(c.marginPct)}%)</b></div></section>
 <div class="highlight-price"><div><span>PREÇO ${o.salePrice!==null&&o.salePrice!==undefined?'DEFINIDO':'SUGERIDO'} PARA CLIENTE</span><div class="number">${fmt(c.effectivePrice)}</div></div><div style="text-align:right"><span>Meta ${S.settings.targetMarginPct}%<br>Empate ≈ ${fmt(c.minimumBreakeven)}</span></div></div>
 ${c.actualRecorded?`<section class="actual-summary"><b>Fechamento após a produção</b><div class="breakdown-row"><span>Mão de obra estimada × realizada</span><b>${fmt(c.laborCost)} → ${fmt(c.actualLaborCost)}</b></div><div class="breakdown-row"><span>Extras realizados</span><b>${fmt(c.actualExtraCost)}</b></div><div class="breakdown-row"><span>Custo revisado (ainda com ingredientes estimados)</span><b>${fmt(c.actualTotalCost)}</b></div><div class="breakdown-row total"><span>Lucro revisado</span><b>${fmt(c.actualProfit)}</b></div><p class="small-muted">Considera os minutos informados e despesas extras; materiais consumidos seguem os valores previstos na ficha. Não substitui fechamento contábil.</p></section>`:''}
 ${dangerous?'<div class="risk-box danger"><strong>⛔ Prejuízo previsto!</strong><p>O preço inserido não paga os custos + taxas. Corrija antes de enviar o orçamento.</p></div>':''}
 ${o.salePrice!==null&&o.salePrice!==undefined&&o.salePrice<c.suggested&&!dangerous?`<p class="small-muted">O preço manual está abaixo da sugestão de ${fmt(c.suggested)} e reduz a margem pretendida.</p>`:''}
 <details style="margin-top:14px"><summary style="font-size:12px;color:var(--wine2);font-weight:900;cursor:pointer">Ver cada ingrediente (${c.usedIngredients.length})</summary><div style="overflow:auto"><table class="data-table" style="min-width:350px"><thead><tr><th>Ingrediente</th><th>Necessário</th><th>Custo observado</th><th>Custo protegido</th></tr></thead><tbody>${c.usedIngredients.map(i=>`<tr><td>${esc(i.name)} ${i.priceVerified?'':'⚠'}</td><td>${nice(i.quantity)} ${esc(i.unit)}</td><td>${fmt(i.baseCost)}</td><td>${fmt(i.cost)}</td></tr>`).join('')}</tbody></table></div></details>`;
}
function previewOrder(){
 if(!$('#order-form-editor'))return;
 try{
  let o=getModalOrder();const estimate=C.estimateTime({...o,laborMode:'auto'},S);
  const isAuto=o.laborMode!=='manual';
  for(const stage of C.STAGE_DEFS){
   const input=$(`#order-form-editor [name="stage-${stage.id}"]`);
   if(input){if(isAuto){input.value=estimate.automatic[stage.id];input.readOnly=true;}else input.readOnly=false;}
  }
  const note=$('#time-mode-note');if(note)note.textContent=isAuto?'Estimativa automática pela receita, porções, camadas e complexidade. Mude para Manual para ajustar etapa por etapa.':'Ajuste os minutos por etapa. São minutos de trabalho ativo total deste pedido, não por unidade.';
  o=getModalOrder();$('#quote-preview').innerHTML=buildDetails(o);
 }catch(e){console.error(e);$('#quote-preview').textContent='Confira os dados para gerar a prévia.';}
}
function orderModal(id){
 const o=S.orders.find(x=>x.id===id)||{id:'',customer:'',phone:'',eventDate:day(7),occasion:'',servings:20,items:[{referenceId:'',recipeId:'',qty:1}],method:'Retirada',custom:false,status:'novo',salePrice:null,deliveryCost:0};
 const stageOpts=C.STAGES.map(([a,b])=>[a,b]);
 const auto=C.estimateTime({...o,laborMode:'auto'},S);
 showModal(`${modalHead(id?'Encomenda '+o.id:'Novo orçamento','O cérebro da Wanelle calcula cada etapa. Você pode revisar os minutos de trabalho antes de enviar.')}
 <form id="order-form-editor"><div class="modal-body"><div class="wizard-step"><span>01</span><div><b>Cliente e encomenda</b><small>Informações que chegaram pelo site ou atendimento</small></div></div><div class="form-grid">
 ${label('customer','Cliente *',{value:o.customer,required:true})}${label('phone','WhatsApp com DDD',{type:'tel',value:o.phone||'',placeholder:'5571999999999'})}
 ${label('eventDate','Data da encomenda *',{type:'date',value:o.eventDate,required:true})}${label('servings','Quantas pessoas por bolo? *',{type:'number',min:1,value:o.servings,required:true})}
 ${label('occasion','Ocasião',{value:o.occasion})}${select('status','Etapa da esteira',stageOpts,o.status)}
 </div><input type="hidden" name="id" value="${esc(o.id)}"><div class="divider"></div><div class="wizard-step"><span>02</span><div><b>Estrutura da torta</b><small>Tamanho, camadas, recheio e decoração afetam tempo e ingredientes</small></div></div>
 <div class="panel-title"><h3>O que vamos preparar</h3><button type="button" class="btn btn-sm" data-action="add-order-line">+ Outra torta</button></div><div class="explain"><strong>Foto ≠ receita.</strong> Selecione a referência do portfólio e depois cadastre a ficha de produção real. <button type="button" class="btn btn-sm" data-action="create-order-recipe" style="margin-top:8px">+ Criar ficha desta encomenda ↗</button></div>
 <div class="line-items" id="order-lines">${(o.items||[]).map(orderItemHtml).join('')}</div>
 <div class="form-grid">${label('fillingLayers','Camadas de recheio',{type:'number',min:1,max:10,value:o.fillingLayers||2,required:true})}
 ${select('decorationLevel','Nível de decoração',[['simples','Simples / tradicional'],['detalhada','Trabalhada / com detalhes'],['artistica','Artística / temática complexa']],o.decorationLevel||((o.custom)?'detalhada':'simples'))}
 ${label('sizeCm','Diâmetro aproximado (cm), opcional',{type:'number',min:1,step:1,value:o.sizeCm||''})}
 ${label('flavor','Sabor da massa',{value:o.flavor||''})}${label('filling','Recheio desejado',{value:o.filling||''})}
 ${label('decoration','Tema / decoração',{value:o.decoration||''})}
 ${select('method','Entrega ou retirada',[['Retirada','Retirada'],['Consultar entrega','Entrega a combinar']],o.method)}
 ${label('neighborhood','Bairro da entrega',{value:o.neighborhood||''})}
 </div><p class="small-muted">O rendimento da ficha (pessoas) determina a escala da receita. Diâmetro é uma referência para verificar forma e embalagem; não altera ingredientes sem altura/densidade definidos. Cada ingrediente de recheio aumenta proporcionalmente ao número de camadas configurado.</p>
 <label class="field" style="flex-direction:row;align-items:center"><input type="checkbox" name="custom" ${o.custom?'checked':''} style="width:auto;min-height:auto;margin-right:8px"> Cobrar serviço de criação / personalização</label>
 <label class="field">Detalhes e observações<textarea name="notes">${esc(o.notes||'')}</textarea></label>
 <div class="divider"></div><div class="wizard-step"><span>03</span><div><b>Quanto tempo você vai trabalhar?</b><small>A previsão já vem preenchida; altere se sua experiência indicar outro tempo</small></div></div>
 ${select('laborMode','Estimativa da mão de obra',[['auto','Automática — calculada pelo sistema'],['manual','Manual — revisar cada etapa']],o.laborMode||'auto')}
 <p class="small-muted" id="time-mode-note">Não inclui minutos de forno parado ou tempo de descanso; estes entram nas despesas energéticas.</p>
 <div class="stage-editor">${C.STAGE_DEFS.map(stage=>`<label class="field"><span>${esc(stage.label)}</span><div class="minutes-entry"><input type="number" name="stage-${stage.id}" min="0" max="10000" step="1" value="${esc(o.laborMode==='manual'?(o.stageMinutes?.[stage.id]??auto.automatic[stage.id]):auto.automatic[stage.id])}" ${o.laborMode==='manual'?'':'readonly'}><span>min</span></div></label>`).join('')}</div>
 <div class="divider"></div><div class="wizard-step"><span>04</span><div><b>Custos extras e resultado</b><small>O sistema soma e alerta sobre valores que ainda faltam</small></div></div>
 <div class="form-grid">${label('extraMaterialsCost','Topper, fitas e materiais extras (R$)',{type:'number',min:0,step:0.01,value:o.extraMaterialsCost||0})}
 ${label('otherOrderCost','Outros custos específicos (R$)',{type:'number',min:0,step:0.01,value:o.otherOrderCost||0})}
 ${label('deliveryCost','Custo real da entrega (R$)',{type:'number',min:0,step:0.01,value:o.deliveryCost||0})}
 <label class="field">Preço desejado para cobrar (R$)<input type="number" min="0" step="0.01" name="salePrice" placeholder="Em branco = sugerido" value="${o.salePrice===null||o.salePrice===undefined?'':esc(o.salePrice)}"><small>É possível ajustar, mas o sistema mostra se isso reduz o lucro.</small></label></div>
 <div class="explain"><strong>Segurança:</strong> sem ficha técnica, preços reais ou despesas operacionais conferidas, este pedido fica como rascunho. Não é possível enviá-lo como um orçamento definitivo.</div>
 <details class="actual-entry"><summary>Depois de produzir: registrar tempo REAL e gastos inesperados ↘</summary><p class="small-muted">Quando terminar a torta, preencha os minutos efetivamente trabalhados. Isso ajuda a descobrir se o orçamento inicial foi suficiente. Os valores reais não alteram o preço combinado com o cliente.</p>
 <label class="field actual-toggle"><input type="checkbox" name="actualRecorded" ${o.actualRecorded?'checked':''}> Já conferi os tempos reais deste pedido</label>
 <div class="stage-editor">${C.STAGE_DEFS.map(stage=>`<label class="field"><span>${esc(stage.label)}</span><div class="minutes-entry"><input type="number" name="actual-${stage.id}" step="1" min="0" max="10000" value="${esc(o.actualStageMinutes?.[stage.id]??0)}"><span>min reais</span></div></label>`).join('')}</div>
 ${label('actualExtraCost','Gastos extras reais que não estavam previstos (R$)',{type:'number',min:0,step:0.01,value:o.actualExtraCost||0})}
 </details>
 <h3 class="subhead">Orçamento da encomenda</h3><div id="quote-preview">${buildDetails(o)}</div></div>
 <div class="modal-footer">${id?`<button type="button" class="btn btn-danger btn-sm" data-action="delete-order" data-id="${esc(id)}">Excluir</button>`:''}<button type="button" class="btn" data-action="close-modal">Fechar</button><button type="button" class="btn btn-muted" data-action="send-quote">WhatsApp ↗</button><button type="submit" class="btn btn-primary">Salvar encomenda ♡</button></div></form>`,true);
 previewOrder();
}
function quoteSignature(o){return JSON.stringify({items:o.items,servings:o.servings,fillingLayers:o.fillingLayers,decorationLevel:o.decorationLevel,custom:o.custom,laborMode:o.laborMode,stageMinutes:o.laborMode==='manual'?o.stageMinutes:null,extraMaterialsCost:o.extraMaterialsCost,otherOrderCost:o.otherOrderCost,deliveryCost:o.deliveryCost,salePrice:o.salePrice});}
async function storeOrder(o){
 if(!o.customer||!o.eventDate)throw Error('Informe o nome do cliente e a data.');
 const old=S.orders.find(x=>x.id===o.id);
 if(o.status!=='novo'){
   const calc=C.calculate(o,S);
   if(!calc.quoteReady)throw Error('Não é possível avançar de etapa sem uma ficha técnica e os preços dos ingredientes.');
   if(!o.quoteSnapshot || quoteSignature(old||{})!==quoteSignature(o)){
     o.salePrice=o.salePrice??calc.suggested;
     o.quoteSnapshot={...C.calculate(o,S),quoteCreatedAt:new Date().toISOString(),signature:quoteSignature(o)};
   }
 }else if(old && quoteSignature(old)!==quoteSignature(o))o.quoteSnapshot=null;
 await C.saveOrder(o,S);
 const index=S.orders.findIndex(row=>row.id===o.id);if(index<0)S.orders.unshift(o);else S.orders[index]=o;
}
async function handleSaveOrder(f){
 if(!f.reportValidity())return;
 const order=getModalOrder();
 const calc=C.calculate(order,S);
 if(order.actualRecorded && !Object.values(order.actualStageMinutes).some(x=>x>0)){notify('Para conferir o custo real, informe o tempo gasto em pelo menos uma etapa.');return;}
 if(order.status!=='novo' && !calc.quoteReady){notify('Preencha todas as fichas e custos antes de confirmar a encomenda. Salve primeiro como Novo pedido.');return;}
 if(order.status!=='novo' && calc.profit<0 && !confirm('Este orçamento está com prejuízo previsto. Salvar mesmo assim como rascunho?'))return;
 await storeOrder(order);closeModal();render();notify('Encomenda salva! ♡');
}
async function sendQuote(){
 const f=$('#order-form-editor');if(!f.reportValidity())return;
 const o=getModalOrder();if(!o.phone){notify('Informe o WhatsApp do cliente antes de enviar.');return;}
 const phone=o.phone.replace(/\D/g,'');if(phone.length<10){notify('Confira o telefone com DDD.');return;}
 const calc=C.calculate(o,S);
 if(!calc.pricingValid){notify('A soma da margem, taxa e impostos deve ser menor que 100%.');return;}
 if(!calc.quoteReady){notify('Ainda não há preço confiável: vincule todas as fichas, ingredientes, embalagem e preços reais.');return;}
 if(calc.profit<0){notify('Preço com prejuízo: aumente o valor antes de enviar.');return;}
 if(calc.missingPrices.length && !o.provisionalApproved){notify('Há ingredientes sem preço confirmado. Marque a autorização provisória após conferir custos.');return;}
 if(o.filling?.trim() && !confirm('O recheio informado em texto foi conferido na ficha técnica? Se for diferente, atualize primeiro os ingredientes e o custo.'))return;
 if(o.decoration?.trim() && !o.extraMaterialsCost && !confirm('Conferiu se o tema e a decoração exigem toppers ou outros materiais extras?'))return;
 if(calc.missingPrices.length && !confirm('ATENÇÃO: orçamento provisório com ingredientes sem preço validado. Você conferiu os custos e autoriza o envio?'))return;
 if(o.salePrice!==null&&o.salePrice<calc.suggested && !confirm('O preço está abaixo do sugerido. Deseja enviá-lo com margem menor?'))return;
 if(o.status==='novo')o.status='orcado';
 o.salePrice=o.salePrice??calc.suggested;
 o.quoteSnapshot={...C.calculate(o,S),quoteCreatedAt:new Date().toISOString(),signature:quoteSignature(o)};
 const target=C.whatsapp(o,S);
 const popup=window.open(target,'_blank','noopener');
 if(!popup){notify('Permita janelas pop-up para abrir o WhatsApp.');}
 await storeOrder(o);closeModal();render();notify('Orçamento preparado para envio no WhatsApp.');
}
async function formSubmit(e){
 if(e.target.id==='order-form-editor'){e.preventDefault();try{await handleSaveOrder(e.target);}catch(ex){error(ex);}return;}
 if(e.target.id==='ingredient-form'){
   e.preventDefault();const data=new FormData(e.target),old=data.get('id');
   const ing={id:old||'ing-'+Date.now().toString(36),name:String(data.get('name')||'').trim(),unit:data.get('unit'),packageQty:Number(data.get('packageQty')),packagePrice:C.n(data.get('packagePrice')),stockQty:C.n(data.get('stockQty')),lossPct:C.n(data.get('lossPct'))};
   if(!ing.name||ing.packageQty<=0){notify('Confira o nome e a quantidade da embalagem.');return;}
   const oldIng=S.ingredients.find(i=>i.id===ing.id);
   ing.priceSource=oldIng?.priceSource||null;
   const supplier=String(data.get('supplier')||'').trim();
   const checkedAt=String(data.get('priceCheckedAt')||day()).trim();
   if(!oldIng||oldIng.packagePrice!==ing.packagePrice||oldIng.packageQty!==ing.packageQty||oldIng.name!==ing.name||oldIng.unit!==ing.unit|| (oldIng.priceSource?.store||'')!==supplier|| (oldIng.priceSource?.checkedAt||day())!==checkedAt){
     ing.priceSource={store:supplier||'Informado manualmente',checkedAt,source:'',quoteId:null};
   }
   if(oldIng && oldIng.unit!==ing.unit && S.recipes.some(r=>r.lines.some(l=>l.ingredientId===ing.id))&&!confirm('Alterar a unidade poderá modificar as fichas técnicas. Deseja continuar?'))return;
   const idx=S.ingredients.findIndex(i=>i.id===ing.id);if(idx<0)S.ingredients.push(ing);else S.ingredients[idx]=ing;
   try{await C.saveSection('ingredients',S.ingredients,S);closeModal();render();notify('Ingrediente atualizado!');}catch(ex){error(ex);}return;
 }
 if(e.target.id==='recipe-form'){
   e.preventDefault();const data=new FormData(e.target),old=data.get('id');
   const recipe={id:old||'receita-'+Date.now().toString(36),name:String(data.get('name')||'').trim(),servings:Math.max(1,Number(data.get('servings'))||1),laborMinutes:C.n(data.get('laborMinutes')),decorationMinutes:Math.min(C.n(data.get('laborMinutes')),C.n(data.get('decorationMinutes'))),baseFillingLayers:Math.max(1,Math.min(10,C.n(data.get('baseFillingLayers'))||2)),packaging:C.n(data.get('packaging')),custom:data.has('custom'),lines:[...e.target.querySelectorAll('.recipe-line')].map(line=>({ingredientId:line.querySelector('[name=ingredientId]').value,quantity:C.n(line.querySelector('[name=quantity]').value),component:line.querySelector('[name=component]').value})).filter(x=>x.ingredientId&&x.quantity>0)};
   if(!recipe.name||!recipe.lines.length||!recipe.laborMinutes||!recipe.packaging){notify('Informe nome, ingredientes, minutos de trabalho ativo e embalagem.');return;}
   const i=S.recipes.findIndex(x=>x.id===recipe.id);if(i<0)S.recipes.push(recipe);else S.recipes[i]=recipe;
   try{await C.saveSection('recipes',S.recipes,S);
     if(attachRecipeToOrder){const order=S.orders.find(x=>x.id===attachRecipeToOrder);if(order){const idx=(order.items||[]).findIndex(x=>!x.recipeId);if(idx>=0)order.items[idx].recipeId=recipe.id;else order.items.push({referenceId:'',recipeId:recipe.id,qty:1});await C.saveOrder(order,S);}const orderId=attachRecipeToOrder;attachRecipeToOrder=null;orderModal(orderId);notify('Ficha salva e vinculada à encomenda! ♡');}
     else {closeModal();render();notify('Ficha técnica salva! ♡');}}catch(ex){error(ex);}return;
 }
 if(e.target.id==='settings-form'){
   e.preventDefault();const d=new FormData(e.target),newSettings={};Object.keys(S.settings).forEach(k=>newSettings[k]=k==='costsConfirmed'?d.has(k):C.n(d.get(k)));
   if(newSettings.targetMarginPct+newSettings.paymentFeePct+newSettings.salesTaxPct>=100){notify('A soma da margem de lucro e da taxa deve ser menor que 100%.');return;}
   try{S.settings=newSettings;await C.saveSection('settings',newSettings,S);render();notify('Custos e margens atualizados! ♡');}catch(ex){error(ex);}return;
 }
 if(e.target.id==='login-form'){
  e.preventDefault();const btn=e.target.querySelector('[type=submit]');btn.disabled=true;$('#login-error').textContent='';
  try{await C.login($('#login-email').value,$('#login-password').value);await load();}
  catch(ex){$('#login-error').textContent=ex.message||'Não foi possível entrar.';}
  finally{btn.disabled=false;}
 }
}
async function handleAction(action,btn){
 switch(action){
 case 'new-order':orderModal();break;
 case 'new-recipe':attachRecipeToOrder=null;recipeModal();break;
 case 'create-order-recipe':{const o=getModalOrder();o.status='novo';await storeOrder(o);attachRecipeToOrder=o.id;const ref=C.products.find(p=>p.id===(o.items||[]).find(i=>!i.recipeId)?.referenceId);recipeModal(null,'Torta sob medida'+(ref?' — '+ref.name:''));notify('Pedido salvo como rascunho. Cadastre os ingredientes e o tempo da receita.');break;}
 case 'apply-quote':{
   const quote=(window.WANELLE_MARKET?.quotes||[]).find(q=>q.id===btn.dataset.id);
   if(!quote)throw Error('Cotação não encontrada.');
   if(quote.confidence==='ambiguous')throw Error('Esta cotação precisa confirmar marca/variante no iFood antes de ser usada.');
   if(quote.level==='user_reported'&&!confirm('Preço anotado durante a pesquisa no iFood e não verificado no checkout. Você conferiu exatamente a marca, versão, gramatura e o valor final desse produto?'))return;
   if(quote.validUntil && quote.validUntil<day() && !confirm('Esta oferta venceu. Confirma que o valor continua válido na loja?'))return;
   const old=quote.ingredientId&&S.ingredients.find(i=>i.id===quote.ingredientId);
   if(old && old.unit!==quote.unit)throw Error('Unidade diferente da receita. Corrija a ficha antes de aplicar.');
   if(!confirm(`${old?'Atualizar '+old.name:'Cadastrar '+quote.product} com ${fmt(quote.price)} por ${quote.packageQty} ${quote.unit} (${quote.store})? Confira se a marca/composição atende à receita.`))return;
   const meta={quoteId:quote.id,store:quote.store,product:quote.product,brand:quote.brand,source:quote.source,checkedAt:quote.checkedAt,validUntil:quote.validUntil||null};
   if(old){old.packageQty=quote.packageQty;old.packagePrice=quote.price;old.priceSource=meta;}
   else {S.ingredients.push({id:'merc-'+quote.id,name:quote.product,unit:quote.unit,packageQty:quote.packageQty,packagePrice:quote.price,stockQty:0,lossPct:0,priceSource:meta});}
   await C.saveSection('ingredients',S.ingredients,S);
   render();notify('Cotação aplicada. O custo dos bolos será recalculado.');break;
 }
 case 'new-ingredient':ingredientModal();break;
 case 'close-modal':attachRecipeToOrder=null;closeModal();break;
 case 'add-order-line':$('#order-lines').insertAdjacentHTML('beforeend',orderItemHtml());previewOrder();break;
 case 'remove-order-line':btn.closest('.order-item-line')?.remove();previewOrder();break;
 case 'add-recipe-line':$('#recipe-lines').insertAdjacentHTML('beforeend',recipeLineHtml());break;
 case 'remove-recipe-line':btn.closest('.recipe-line')?.remove();break;
 case 'send-quote':await sendQuote();break;
 case 'clear-prod-date':prodDate='';render();break;
 case 'print':window.print();break;
 case 'delete-order':{
   const id=btn.dataset.id;if(!confirm('Excluir esta encomenda? Essa operação não poderá ser desfeita.'))return;
   await C.deleteOrder(id,S);S.orders=S.orders.filter(o=>o.id!==id);closeModal();render();notify('Pedido excluído.');break;}
 case 'delete-recipe':{
   const id=btn.dataset.id;if(S.orders.some(o=>(o.items||[]).some(i=>i.recipeId===id))){notify('Esta receita aparece em pedidos e não pode ser excluída.');return;}
   if(!confirm('Excluir a ficha técnica?'))return;
   S.recipes=S.recipes.filter(r=>r.id!==id);await C.saveSection('recipes',S.recipes,S);closeModal();render();notify('Receita excluída.');break;}
 case 'delete-ingredient':{
   const id=btn.dataset.id;if(S.recipes.some(r=>r.lines.some(line=>line.ingredientId===id))){notify('Este ingrediente está em uma receita. Retire-o da ficha técnica antes.');return;}
   if(!confirm('Excluir ingrediente?'))return;
   S.ingredients=S.ingredients.filter(i=>i.id!==id);await C.saveSection('ingredients',S.ingredients,S);closeModal();render();notify('Ingrediente excluído.');break;}
 case 'export':{
   const file=new Blob([JSON.stringify({...S,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
   const href=URL.createObjectURL(file);const a=document.createElement('a');a.href=href;a.download=`wanelle-backup-${day()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1500);notify('Backup baixado.');break;}
 case 'import':$('#import-file')?.click();break;
 case 'reset':{
   if(!confirm('Apagar os dados locais e começar sem encomendas e sem receitas? Faça backup dos pedidos reais antes.'))return;
   if(!confirm('Confirma a exclusão dos dados locais? Faça um backup antes.'))return;
   S=C.seed();C.saveLocal(S);render();notify('Novo histórico iniciado, sem valores de tortas antigas.');break;}
 }
}
async function load(){
 if(C.live){
  const user=await C.session();if(!user){$('#login-screen').hidden=false;$('#mode-chip').textContent='Acesso restrito';return;}
 }
 try{S=await C.adminLoad();$('#login-screen').hidden=true;$('#logout').hidden=!C.live;$('#mode-chip').textContent=C.live?'● Dados conectados':'◯ Modo demonstração';$('#demo-notice').hidden=C.live;render();}
 catch(ex){if(C.live){$('#login-screen').hidden=false;$('#login-error').textContent=ex.message;}else{document.querySelector('.main-content').innerHTML=`<div class="empty">${esc(ex.message)}<br>Configure a conexão no arquivo config.js antes de publicar o painel.</div>`;$('#mode-chip').textContent='Não conectado';}}
}
document.addEventListener('click',async e=>{
 const nav=e.target.closest('[data-view]');if(nav&&S){view=nav.dataset.view;$('#sidebar').classList.remove('open');render();return;}
 const action=e.target.closest('[data-action]');if(action){try{await handleAction(action.dataset.action,action);}catch(ex){error(ex);}return;}
 const order=e.target.closest('[data-order]');if(order&&S){orderModal(order.dataset.order);return;}
 const recipe=e.target.closest('[data-recipe]');if(recipe&&S){recipeModal(recipe.dataset.recipe);return;}
 const ing=e.target.closest('[data-ingredient]');if(ing&&S){ingredientModal(ing.dataset.ingredient);return;}
});
document.addEventListener('submit',formSubmit);
document.addEventListener('input',e=>{
 const id=e.target.id;
 if(id==='search-orders'){orderSearch=e.target.value;const start=e.target.selectionStart;render();const input=$('#search-orders');input.focus();input.setSelectionRange(start,start);return;}
 if(id==='search-ingredients'){ingredientSearch=e.target.value;const start=e.target.selectionStart;render();const input=$('#search-ingredients');input.focus();input.setSelectionRange(start,start);return;}
 if(e.target.closest('#order-form-editor'))previewOrder();
});
document.addEventListener('change',async e=>{
 if(e.target.id==='production-date'){prodDate=e.target.value;render();}
 if(e.target.closest('#order-form-editor'))previewOrder();
 if(e.target.id==='import-file'){
  const file=e.target.files?.[0];if(!file)return;
  try{const o=JSON.parse(await file.text());if(!Array.isArray(o.ingredients)||!Array.isArray(o.recipes)||!Array.isArray(o.orders)||!o.settings)throw Error('Arquivo não corresponde a um backup Wanelle.');
  if(!confirm(`Restaurar ${o.orders.length} pedidos do arquivo? Os dados deste navegador serão substituídos.`))return;
  S={ingredients:o.ingredients,recipes:o.recipes,orders:o.orders,settings:o.settings};C.saveLocal(S);render();notify('Backup restaurado!');}catch(ex){error(ex);}e.target.value='';
 }
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.kanban-card')){e.preventDefault();orderModal(e.target.dataset.order);}});
$('#toggle-menu').onclick=()=>$('#sidebar').classList.toggle('open');
$('#logout').onclick=async()=>{await C.logout();S=null;await load();};
if(!C.live&&!C.demoAllowed){$('#main').innerHTML='<div class="empty">Painel bloqueado: conecte o Neon pelo Vercel para disponibilizar o sistema online com autenticação.</div>';$('#mode-chip').textContent='Conexão necessária';}
else load();
})();
