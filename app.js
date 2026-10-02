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
  const sceneContainer = document.querySelector('.scene-plane');
  function element(tag,className,text) {
    const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;
  }
  function referenceImage(item,lazy=false) {
    const img=element('img');img.width=600;img.height=750;img.decoding='async';
    img.alt=`Referência visual de ${item.name.toLocaleLowerCase('pt-BR')}`;
    if(lazy){img.loading='lazy';img.src=item.image;}else{img.dataset.src=item.image;}
    return img;
  }
  products.forEach(item=>{
    const floating=element('button',`floating-piece piece-${item.id}`);floating.type='button';floating.dataset.piece=item.id;
    floating.setAttribute('aria-label',`Ver detalhes: ${item.name} — referência visual`);
    const number=element('span','piece-number',item.index);number.setAttribute('aria-hidden','true');floating.append(referenceImage(item),number);sceneContainer.append(floating);
    const card=element('button','product-card reveal');card.type='button';card.dataset.piece=item.id;
    const visual=element('span',`product-visual tone-${item.tone}`);
    const index=element('span','product-index',item.index+' /');
    const explore=element('span','view-label','Ver inspiração');const plus=element('span',null,'＋');plus.setAttribute('aria-hidden','true');explore.append(plus);
    visual.append(index,referenceImage(item,true),explore);
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
    const image=referenceImage(item,true);panel.append(text,image);track.append(panel);
  });
  const scene = document.querySelector('.scene');
  const plane = document.querySelector('.scene-plane');
  const pauseButtons = [...document.querySelectorAll('.motion-toggle')];
  const dialog = document.querySelector('.detail-dialog');
  const closeButton = document.querySelector('.close-detail');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = matchMedia('(max-width: 599px)');
  const lowPower = !!(!window.CSS?.supports('perspective','1px') || navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory < 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 3));
  let userPaused = false, sceneVisible = true, selected = null, opener = null, pendingOpen = false, closeTimer = null, pointerFrame = null;
  if (lowPower) document.documentElement.classList.add('low-motion');
  function updateMotion() {
    const staticScene = reduced.matches || lowPower;
    const paused = userPaused || staticScene || !sceneVisible || document.hidden || dialog.open || pendingOpen;
    scene.dataset.motion = paused ? 'paused' : 'running';
    pauseButtons.forEach(button=>{
      button.disabled = staticScene;
      button.setAttribute('aria-pressed', String(userPaused || staticScene));
      button.querySelector('.motion-label').textContent = staticScene ? (reduced.matches ? 'Movimento reduzido' : 'Composição estática') : userPaused ? 'Retomar movimento' : 'Pausar movimento';
      button.querySelector('.pause-symbol').textContent = staticScene ? '—' : userPaused ? '▷' : 'Ⅱ';
    });
    if (paused) {plane.style.removeProperty('--rx');plane.style.removeProperty('--ry');}
    document.dispatchEvent(new CustomEvent('maju:motion',{detail:motionState()}));
  }
  function motionState(){return {userPaused,lowPower,reduced:reduced.matches,hidden:document.hidden,dialogOpen:dialog.open||pendingOpen};}
  window.MAJU_MOTION={getState:motionState,setPaused(value){userPaused=!!value;updateMotion();}};
  pauseButtons.forEach(button=>button.addEventListener('click',()=>{userPaused = !userPaused; updateMotion();}));
  reduced.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {sceneVisible = entries[0].isIntersecting;updateMotion();},{threshold:.08}).observe(scene);
    const reveals = new IntersectionObserver(entries => entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveals.unobserve(entry.target);}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>reveals.observe(el));
    document.documentElement.classList.add('js-ready');
  }
  function loadSceneImages() {
    scene.querySelectorAll('img[data-src]').forEach(img=>{
      if(getComputedStyle(img.closest('button')).display !== 'none') {img.src=img.dataset.src;img.removeAttribute('data-src');}
    });
  }
  if ('requestIdleCallback' in window) requestIdleCallback(loadSceneImages,{timeout:600}); else setTimeout(loadSceneImages,0);
  mobile.addEventListener('change',loadSceneImages);
  scene.addEventListener('pointermove', e=>{
    if(!finePointer.matches || mobile.matches || scene.dataset.motion === 'paused') return;
    if(pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame=requestAnimationFrame(()=>{
      const rect=scene.getBoundingClientRect();
      plane.style.setProperty('--ry',`${((e.clientX-rect.left)/rect.width-.5)*5}deg`);
      plane.style.setProperty('--rx',`${-((e.clientY-rect.top)/rect.height-.5)*4}deg`);
    });
  });
  scene.addEventListener('pointerleave',()=>{if(pointerFrame)cancelAnimationFrame(pointerFrame);plane.style.removeProperty('--rx');plane.style.removeProperty('--ry');});
  function showDetails(trigger) {
    if(dialog.open || pendingOpen) return;
    const item=products.get(trigger.dataset.piece);
    if(!item) return;
    opener=trigger;
    selected=scene.querySelector(`[data-piece="${trigger.dataset.piece}"]`);
    pendingOpen=true;
    if(selected && getComputedStyle(selected).display!=='none') selected.classList.add('is-selected');
    updateMotion();
    document.querySelector('#detail-title').textContent=item.name;
    document.querySelector('#detail-description').textContent=item.description;
    document.querySelector('#detail-index').textContent=`/ ${item.index}`;
    const img=document.querySelector('#detail-image');img.src=item.image;img.alt=`Referência visual de ${item.name.toLocaleLowerCase('pt-BR')} — imagem ampliada`;
    setTimeout(()=>{pendingOpen=false;dialog.classList.remove('is-closing');dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';closeButton.focus({preventScroll:true});updateMotion();},reduced.matches?0:260);
  }
  function closeDetails() {
    if(!dialog.open || closeTimer) return;
    dialog.classList.add('is-closing');
    closeTimer=setTimeout(()=>{
      dialog.close();dialog.classList.remove('is-closing');document.body.style.overflow='';
      if(selected) {const returning=selected;returning.classList.remove('is-selected');returning.classList.add('is-returning');setTimeout(()=>returning.classList.remove('is-returning'),reduced.matches?0:400);}
      opener?.focus({preventScroll:true});selected=null;opener=null;closeTimer=null;updateMotion();
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
  function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');document.documentElement.classList.remove('menu-open');menu.querySelector('span').textContent='＋';}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);document.documentElement.classList.toggle('menu-open',open);menu.querySelector('span').textContent=open?'−':'＋';});
  mobile.addEventListener('change',()=>{if(!mobile.matches)closeMenu();});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
  updateMotion();
})();
