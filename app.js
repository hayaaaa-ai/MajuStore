(() => {
  'use strict';
  const data = window.MAJU_STORE_DATA;
  const products = new Map(data.products.map((item,index)=>[item.id,{...item,index:String(index+1).padStart(2,'0')}]));
  const whatsappUrl = `https://wa.me/${data.business.whatsapp.number}?text=${encodeURIComponent(data.business.whatsapp.message)}`;
  const address=data.business.address;
  const mapsQuery=`Maju Store, ${address.street}, ${address.number}, ${address.district}, ${address.city}-${address.state}`;
  const contactLinks = {whatsapp:whatsappUrl,instagram:data.business.instagram.url,maps:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`};
  data.sellers.filter(seller=>seller.numberFormatConfirmed&&(data.proposal||seller.publicUseAuthorized)).forEach(seller=>{contactLinks[seller.id]=`https://wa.me/${seller.number}?text=${encodeURIComponent(seller.message)}`;});
  document.querySelectorAll('[data-contact]').forEach(link=>{if(contactLinks[link.dataset.contact])link.href=contactLinks[link.dataset.contact];});
  document.querySelectorAll('[data-proposal-banner],[data-proposal-note]').forEach(el=>{el.hidden=!data.proposal;});
  const grid = document.querySelector('.product-grid');
  function element(tag,className,text) {
    const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;
  }
  function referenceImage(item) {
    const img=element('img');img.width=600;img.height=750;img.decoding='async';
    img.alt=`Referência visual de ${item.name.toLocaleLowerCase('pt-BR')}`;
    img.loading='lazy';img.src=item.image;
    return img;
  }
  products.forEach(item=>{
    const card=element('button','product-card reveal');card.type='button';card.dataset.piece=item.id;
    const visual=element('span',`product-visual tone-${item.tone}`);
    const index=element('span','product-index',item.index+' /');
    const explore=element('span','view-label','Ver inspiração');const plus=element('span',null,'＋');plus.setAttribute('aria-hidden','true');explore.append(plus);
    visual.append(index,referenceImage(item),explore);
    const meta=element('span','product-meta');meta.append(element('span','product-name',item.name),element('span','product-type',item.category.toLocaleUpperCase('pt-BR')));
    card.append(visual,meta,element('span','demo-tag','Referência visual'));grid.append(card);
  });
  // Reuse the product data: these panels are editorial references, never stock.
  const panelCopy=[['shirt','LEVEZA','Tons claros criam uma base simples para combinar com cores e texturas.'],['dress','MOVIMENTO','Uma silhueta fluida muda a leitura do look, mesmo com poucos elementos.'],['blazer','PRESENÇA','A sobreposição acrescenta linhas definidas a uma composição mais leve.'],['trousers','DETALHES','Observe como o comprimento e o volume equilibram as proporções.']];
  const track=document.querySelector('.lookbook-track');
  panelCopy.forEach(([id,title,copy],index)=>{
    const item=products.get(id),panel=element('article',`lookbook-panel tone-${item.tone}`);
    const text=element('div','panel-copy');
    text.append(element('p','eyebrow',String(index+1).padStart(2,'0')),element('h3',null,title),element('p',null,copy),element('small',null,'REFERÊNCIA VISUAL'));
    const image=referenceImage(item);panel.append(text,image);track.append(panel);
  });
  const pauseButtons = [...document.querySelectorAll('.motion-toggle')];
  const dialog = document.querySelector('.detail-dialog');
  const closeButton = document.querySelector('.close-detail');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 999px)');
  const lowPower = !!(navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory < 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 3));
  let userPaused = false, opener = null, closeTimer = null;
  if (lowPower) document.documentElement.classList.add('low-motion');
  function updateMotion() {
    const staticScene = reduced.matches || lowPower;
    const paused = userPaused || staticScene || document.hidden || dialog.open;
    document.documentElement.dataset.motion = paused ? 'paused' : 'running';
    pauseButtons.forEach(button=>{
      button.disabled = staticScene;
      button.setAttribute('aria-pressed', String(userPaused || staticScene));
      button.querySelector('.motion-label').textContent = staticScene ? (reduced.matches ? 'Movimento reduzido' : 'Movimento simplificado') : userPaused ? 'Retomar movimento' : 'Pausar movimento';
      button.querySelector('.pause-symbol').textContent = staticScene ? '—' : userPaused ? '▷' : 'Ⅱ';
    });
    document.dispatchEvent(new CustomEvent('maju:motion',{detail:motionState()}));
  }
  function motionState(){return {userPaused,lowPower,reduced:reduced.matches,hidden:document.hidden,dialogOpen:dialog.open};}
  window.MAJU_MOTION={getState:motionState,setPaused(value){userPaused=!!value;updateMotion();}};
  pauseButtons.forEach(button=>button.addEventListener('click',()=>{userPaused = !userPaused; updateMotion();}));
  reduced.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveals.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>reveals.observe(el));
    document.documentElement.classList.add('js-ready');
  }
  function showDetails(trigger) {
    if(dialog.open) return;
    const item=products.get(trigger.dataset.piece);
    if(!item) return;
    opener=trigger;
    document.querySelector('#detail-title').textContent=item.name;
    document.querySelector('#detail-description').textContent=item.description;
    document.querySelector('#detail-index').textContent=`/ ${item.index}`;
    const img=document.querySelector('#detail-image');img.src=item.image;img.alt=`Referência visual de ${item.name.toLocaleLowerCase('pt-BR')} — imagem ampliada`;
    dialog.classList.remove('is-closing');dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';closeButton.focus({preventScroll:true});updateMotion();
  }
  function closeDetails() {
    if(!dialog.open || closeTimer) return;
    dialog.classList.add('is-closing');
    closeTimer=setTimeout(()=>{
      dialog.close();dialog.classList.remove('is-closing');document.body.style.overflow='';
      opener?.focus({preventScroll:true});opener=null;closeTimer=null;updateMotion();
    },reduced.matches?0:240);
  }
  document.querySelectorAll('[data-piece]').forEach(btn=>btn.addEventListener('click',()=>showDetails(btn)));
  closeButton.addEventListener('click',closeDetails);
  document.querySelector('.back-composition').addEventListener('click',closeDetails);
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeDetails();});
  dialog.addEventListener('keydown',e=>{
    if(e.key!=='Tab') return;
    const focusable=[...dialog.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
  });
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) closeDetails();}});
  const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
  const header=document.querySelector('.site-header'),main=document.querySelector('main'),footer=document.querySelector('.site-footer');
  let menuScroll=0;
  function closeMenu(returnFocus=false){
    if(menu.getAttribute('aria-expanded')!=='true')return;
    menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');
    document.documentElement.classList.remove('menu-open');document.body.style.removeProperty('top');
    main.inert=false;footer.inert=false;
    menu.querySelector('.menu-label').textContent='Menu';menu.querySelector('.menu-symbol').textContent='＋';
    window.scrollTo({top:menuScroll,behavior:'instant'});if(returnFocus)menu.focus({preventScroll:true});
  }
  function openMenu(){
    menuScroll=window.scrollY;document.body.style.top=-menuScroll+'px';
    menu.setAttribute('aria-expanded','true');nav.classList.add('is-open');document.documentElement.classList.add('menu-open');
    main.inert=true;footer.inert=true;
    menu.querySelector('.menu-label').textContent='Fechar';menu.querySelector('.menu-symbol').textContent='×';
    nav.querySelector('a').focus({preventScroll:true});
  }
  menu.addEventListener('click',()=>menu.getAttribute('aria-expanded')==='true'?closeMenu(true):openMenu());
  mobile.addEventListener('change',()=>{if(!mobile.matches)closeMenu();});
  header.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  // Smooth navigation only for intentional clicks. Native reload/back restoration stays instant.
  document.addEventListener('click',e=>{
    const link=e.target.closest('a[href^="#"]');
    if(!link||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const target=document.getElementById(link.hash.slice(1));if(!target)return;
    e.preventDefault();history.pushState(null,'',link.hash);
    target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
    target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
    target.scrollIntoView({behavior:reduced.matches||lowPower?'instant':'smooth',block:'start'});
  });
  document.addEventListener('keydown',e=>{
    if(menu.getAttribute('aria-expanded')!=='true')return;
    if(e.key==='Escape'){e.preventDefault();closeMenu(true);return;}
    if(e.key==='Tab'){
      const items=[header.querySelector('.wordmark'),menu,...nav.querySelectorAll('a[href]')],first=items[0],last=items[items.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>header.classList.toggle('is-scrolled',!entry.isIntersecting)).observe(document.querySelector('.header-sentinel'));
  updateMotion();
})();
