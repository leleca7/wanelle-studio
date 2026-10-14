/* Public-facing editorial interactions. No pricing logic is executed here. */
(function(){
'use strict';
function ready(){
 const catalog=document.getElementById('tortas');
 const filterGroup=document.getElementById('filters');
 document.querySelectorAll('[data-vibe]').forEach(card=>{
  card.addEventListener('click',()=>{
    const filter=filterGroup?.querySelector('[data-category="'+card.dataset.vibe+'"]');
    filter?.click();
    catalog?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
 });
 document.querySelectorAll('[data-feature-target]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(typeof openProduct==='function')openProduct(btn.dataset.featureTarget);
  });
 });
 ['gallery-order','step-order'].forEach(id=>{
  document.getElementById(id)?.addEventListener('click',()=>{
    const source=document.getElementById('header-order');
    source?.click();
  });
 });
 // Add a subtle 'saved' visual state, without changing the original favorites logic.
 const catalogGrid=document.getElementById('catalog-grid');
 catalogGrid?.addEventListener('click',event=>{
  const button=event.target.closest('[data-add]');
  if(!button)return;
  button.classList.add('is-saved');
  button.textContent='♥';
  setTimeout(()=>{if(button.isConnected){button.classList.remove('is-saved');button.textContent='♡'}},1400);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();