(function(){
 'use strict';
 const C=window.WanelleCore;
 const $=s=>document.querySelector(s);
 const safe=value=>String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
 let sending=false;
 $('#order-form').addEventListener('submit',async e=>{
   e.preventDefault();if(sending||!e.target.reportValidity())return;
   const btn=$('#save-client-request');const previousText=btn.textContent;
   const cart=window.WANELLE_SITE_CART?.()||[];
   let items=cart.length?cart.map(x=>({referenceId:x.id,recipeId:'',qty:x.qty})):[{referenceId:$('#client-cake').value||'',recipeId:'',qty:1}];
   const phone=$('#client-phone').value.replace(/\D/g,'');
   if(phone.length<10||phone.length>13){window.toast?.('Informe um WhatsApp válido com DDD.');$('#client-phone').focus();return;}
   const formData={customer:$('#client-name').value.trim(),phone:phone.startsWith('55')?phone:'55'+phone,eventDate:$('#client-date').value,occasion:$('#client-event').value,servings:Number($('#client-servings').value),items,method:$('#client-method').value,neighborhood:$('#client-neighborhood').value.trim(),flavor:$('#client-flavor').value.trim(),filling:$('#client-filling').value.trim(),decoration:$('#client-decoration').value.trim(),fillingLayers:Number($('#client-filling-layers').value)||2,sizeCm:$('#client-size-cm').value?Number($('#client-size-cm').value):null,decorationLevel:$('#client-decoration-level').value,custom:$('#client-custom').checked,notes:$('#client-notes').value.trim(),source:new URLSearchParams(location.search).get('utm_source')||'site'};
   sending=true;btn.disabled=true;btn.textContent='Registrando seu pedido...';
   try{
     const saved=await C.publicSubmit(formData);
     const siteDemo=!C.live;
     $('#order-form').hidden=true;
     $('#order-success').hidden=false;
     $('#order-success').innerHTML=`<span style="font-size:35px;color:#ad244c">♡</span><h3>Pedido recebido!</h3><p>Obrigada, <strong>${safe(saved.customer)}</strong>! Seu pedido de orçamento foi registrado com o código <strong>${safe(saved.id)}</strong>. Nossa equipe vai conferir os detalhes, o valor e a disponibilidade.</p><button type="button" class="button" id="client-open-wa">Conversar pelo WhatsApp ↗</button><small>${siteDemo?'Demonstração: o pedido fica salvo apenas neste navegador. Para receber solicitações reais de outros clientes, é necessário conectar o banco de dados.':'Esta é uma solicitação de orçamento, ainda não uma encomenda confirmada.'}</small>`;
     $('#client-open-wa').onclick=()=>{
       const msg=`Olá, Wanelle! Enviei minha solicitação pelo site. Meu código é ${saved.id}. Sou ${saved.customer}.`;
       window.open('https://wa.me/5571993125721?text='+encodeURIComponent(msg),'_blank','noopener');
     };
     window.toast?.('Seu pedido foi registrado ♡');
   }catch(ex){
     window.toast?.(ex?.message||'Não foi possível registrar. Converse pelo WhatsApp.');
     alert('Não conseguimos registrar sua solicitação no painel. Por favor, solicite diretamente pelo WhatsApp da Wanelle.\n\n'+(ex?.message||''));
     const msg=`Olá, Wanelle! Gostaria de um orçamento. Sou ${formData.customer}. Data: ${formData.eventDate}. Pessoas por torta: ${formData.servings}. Referências visuais: ${items.map(x=>x.qty+'x '+(x.referenceId||'sem referência')).join(', ')}. Detalhes: ${formData.notes}.`;
     window.open('https://wa.me/5571993125721?text='+encodeURIComponent(msg),'_blank','noopener');
   }finally{sending=false;btn.disabled=false;btn.textContent=previousText;}
 });
 // Reabrir para um novo orçamento sem recarregar a página.
 ['header-order','hero-order','story-order','banner-order'].forEach(id=>{
  const btn=document.getElementById(id);if(!btn)return;
  btn.addEventListener('click',()=>{if(!$('#order-success').hidden){$('#order-form').reset();$('#order-form').hidden=false;$('#order-success').hidden=true;}});
 });
})();