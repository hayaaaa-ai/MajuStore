/* Client-supplied information and authorized preview portraits. No social SDK. */
(() => {
  'use strict';
  const data=window.MAJU_STORE_DATA,instagram=data.business.instagram;
  const sellers=data.sellers.filter(seller=>data.proposal||(seller.publicUseAuthorized&&seller.numberFormatConfirmed));
  function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function contactLink(key,label,className){
    const link=el('a',className,label);link.dataset.contact=key;link.href='#contato';link.target='_blank';link.rel='noopener noreferrer';
    link.setAttribute('aria-label',`${label} (abre em outra aba)`);link.append(el('span','sr-only',' (abre em outra aba)'));return link;
  }
  document.querySelectorAll('[data-instagram-handle]').forEach(node=>{node.textContent='@'+instagram.username;if(node.tagName==='A')node.setAttribute('aria-label',`Abrir @${instagram.username} no Instagram (abre em outra aba)`);});
  document.querySelector('[data-followers-label]').textContent=instagram.followersLabel;
  document.querySelector('[data-followers-accessible]').textContent=instagram.followersAccessibleLabel;
  document.querySelector('#instagram-title').textContent=instagram.followersHeadline;
  document.querySelector('[data-profile-name]').textContent=instagram.profileName;
  document.querySelector('[data-follow-instagram]').prepend(document.createTextNode(`Seguir @${instagram.username}`));
  const community=document.querySelector('[data-community-link]');community.firstChild.textContent=`Ver @${instagram.username}`;
  instagram.highlights.forEach(name=>document.querySelector('.instagram-themes').append(el('li',null,name)));
  const readySellers=sellers.filter(seller=>seller.numberFormatConfirmed);
  const sellerMetric=document.querySelector('[data-seller-metric]');sellerMetric.hidden=!readySellers.length;sellerMetric.querySelector('strong').textContent=String(readySellers.length);
  const address=data.business.address,addressBlock=document.querySelector('[data-store-address]');
  [`${address.street}, ${address.number}`,`${address.district} · ${address.city} – ${address.state}`,`CEP ${address.postalCode}`].forEach((line,i)=>{if(i)addressBlock.append(document.createElement('br'));addressBlock.append(document.createTextNode(line));});
  document.querySelector('[data-general-phone]').prepend(document.createTextNode(data.business.whatsapp.display));
  const reference=data.products.find(item=>item.id==='dress');
  const referenceImage=el('img');referenceImage.src=reference.image;referenceImage.width=720;referenceImage.height=1080;referenceImage.loading='lazy';referenceImage.decoding='async';referenceImage.alt=`Referência visual de ${reference.name.toLocaleLowerCase('pt-BR')} — imagem demonstrativa`;
  document.querySelector('[data-universe-visual]').append(referenceImage);
  const sellerSection=document.querySelector('#atendimento');sellerSection.hidden=!sellers.length;
  if(sellers.length)document.querySelector('[data-seller-intro]').textContent=`Prefere atendimento direto? ${sellers.map(seller=>seller.name).join(' e ')} estão por aqui.`;
  const sellerGrid=document.querySelector('.seller-grid'),footerSellers=document.querySelector('.footer-sellers');footerSellers.hidden=!readySellers.length;
  sellers.forEach((seller,index)=>{
    const card=el('article','seller-card');card.dataset.seller=seller.id;
    // CONFIRMAR AUTORIZAÇÃO COMERCIAL PARA PUBLICAÇÃO DA FOTO, NOME E TELEFONE.
    if(seller.photo){
      const portrait=el('div','seller-portrait'),image=el('img');image.src=seller.photo;image.alt=`Retrato de ${seller.name}, atendimento da Maju Store`;image.width=512;image.height=640;image.loading='lazy';image.decoding='async';
      const number=el('span','seller-index',String(index+1).padStart(2,'0'));number.setAttribute('aria-hidden','true');portrait.append(image,number);card.append(portrait);
    }
    const body=el('div','seller-body'),meta=el('div','seller-meta');meta.append(el('p','eyebrow',seller.role),el('h3',null,seller.name),el('p','seller-phone',seller.numberFormatConfirmed?seller.display:'Contato direto em confirmação'));
    let cta;
    if(seller.numberFormatConfirmed){cta=contactLink(seller.id,`Falar com ${seller.name}`,'button primary seller-cta');footerSellers.append(contactLink(seller.id,seller.name,'text-link'));}
    else{cta=el('button','button seller-cta',`Falar com ${seller.name}`);cta.type='button';cta.disabled=true;cta.setAttribute('aria-label',`Falar com ${seller.name} — número completo em confirmação`);}
    body.append(meta,cta);card.append(body);sellerGrid.append(card);
  });
  document.querySelector('[data-seller-preview-note]').hidden=!data.proposal||!sellers.some(seller=>!seller.publicUseAuthorized);

  // A short, one-shot visual count. Screen readers always get the static label.
  function initCounter(){
    const node=document.querySelector('[data-followers-label]'),section=document.querySelector('.follower-counter');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let state=window.MAJU_MOTION.getState(),frame=0,elapsed=0,last=0,entered=false,done=false,observer;
    const duration=1700;
    const staticMode=()=>reduced.matches||state.lowPower;
    const blocked=()=>state.userPaused||state.hidden||state.dialogOpen;
    function finish(){
      cancelAnimationFrame(frame);frame=0;done=true;node.textContent=instagram.followersLabel;node.dataset.counterState='complete';observer?.disconnect();
      document.removeEventListener('maju:motion',motionChanged);reduced.removeEventListener('change',sync);
    }
    function tick(time){
      frame=0;if(done||blocked())return;
      if(last)elapsed+=time-last;last=time;
      const progress=Math.min(elapsed/duration,1),value=instagram.followersCount*(1-Math.pow(1-progress,3));
      const label=value<1000?'0':`${Math.floor(value/1000)} mil`;
      // Only write when the visible thousand changes, rather than every frame.
      if(node.textContent!==label)node.textContent=label;
      if(progress===1){finish();return;}frame=requestAnimationFrame(tick);
    }
    function sync(){
      if(done)return;if(staticMode()){finish();return;}
      if(blocked()){cancelAnimationFrame(frame);frame=0;last=0;return;}
      if(entered&&!frame){last=0;node.dataset.counterState='running';frame=requestAnimationFrame(tick);}
    }
    function motionChanged(event){state=event.detail;sync();}
    if(staticMode()||!('IntersectionObserver' in window)){finish();return;}
    node.textContent='0';node.dataset.counterState='idle';
    observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){entered=true;observer.disconnect();sync();}},{threshold:.25});observer.observe(section);
    document.addEventListener('maju:motion',motionChanged);reduced.addEventListener('change',sync);
  }
  if(!window.MAJU_MOTION)document.addEventListener('DOMContentLoaded',initCounter,{once:true});else initCounter();
})();
