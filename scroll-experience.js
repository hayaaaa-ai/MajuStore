/* Editorial motion: typography, local parallax and the horizontal lookbook. */
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const motion=window.MAJU_MOTION;
  const lookbook=document.getElementById('lookbook');
  const editorial=document.getElementById('editorial');
  // Set enabled to false to keep the editorial chapters static.
  const CONFIG={enabled:true,horizontalScrollVh:62,desktopWidth:1024};
  let enabled=CONFIG.enabled,media=null,active=null,loading=null,status='static',reason='initial';
  let state=motion.getState();
  const blocked=()=>state.userPaused||state.hidden||state.dialogOpen;
  function fallback(why){status='static';reason=why;}
  function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script);});}
  function loadLibraries(){
    if(!loading)loading=(async()=>{
      await loadScript('vendor/gsap/gsap.min.js');
      await loadScript('vendor/gsap/ScrollTrigger.min.js');
      gsap.registerPlugin(ScrollTrigger);
    })();
    return loading;
  }
  function setup(desktop,tall){
    const animations=[];
    let aboutEntered=false;
    const track=document.querySelector('.lookbook-track');
    const windowEl=document.querySelector('.lookbook-window');
    const progressFill=document.querySelector('.lookbook-progress-line i');
    const currentPanel=document.querySelector('.lookbook-current');
    let panelIndex=0;
    const horizontal=desktop&&tall;
    // This displacement is navigation: pausing decoration must not hide panels.
    if(horizontal){
      lookbook.classList.add('is-horizontal');
      gsap.to(track,{x:()=>-Math.max(0,track.scrollWidth-windowEl.clientWidth),ease:'none',scrollTrigger:{id:'maju-lookbook',trigger:lookbook,start:'top top',end:()=>`+=${innerHeight*CONFIG.horizontalScrollVh/100}`,pin:true,scrub:true,anticipatePin:1,invalidateOnRefresh:true,onUpdate(self){progressFill.style.transform=`scaleX(${self.progress})`;const index=Math.min(4,1+Math.floor(self.progress*4));if(index!==panelIndex){currentPanel.textContent=String(index).padStart(2,'0');panelIndex=index;}}}});
    }
    function scrubTimeline(animation,options){
      const update=self=>{if(!blocked())animation.progress(self.progress);};
      const trigger=ScrollTrigger.create({...options,onUpdate:update,onRefresh:update});
      animations.push({animation,trigger});
    }
    // Slight offsets and different masks; essential content is always readable.
    document.querySelectorAll('[data-title-motion]').forEach(title=>{
      const type=title.dataset.titleMotion;
      const from=type==='side'?{x:desktop?-24:-8,opacity:.8}:type==='mask'?{clipPath:'inset(0% 0% 12% 0%)',y:10}:{y:desktop?22:10,opacity:.8};
      const animation=gsap.fromTo(title,from,{x:0,y:0,opacity:1,clipPath:'inset(0% 0% 0% 0%)',ease:'power1.out',duration:1,paused:true});
      scrubTimeline(animation,{trigger:title,start:'top 95%',end:'top 48%'});
    });
    const words=gsap.fromTo('.possibility-words>span',{x:index=>(index%2?-1:1)*(desktop?14:5),y:index=>index%2?8:18,opacity:.75},{x:0,y:0,opacity:1,duration:1,stagger:.13,ease:'power1.out',paused:true});
    scrubTimeline(words,{trigger:'.possibility-words',start:'top 90%',end:'bottom 65%'});
    const form=gsap.timeline({paused:true})
      .fromTo('.details-type>span:first-child',{x:desktop?-18:-8},{x:desktop?10:4,duration:1,ease:'none'},0)
      .fromTo('.details-type>span:last-child',{x:desktop?18:8},{x:desktop?-10:-4,duration:1,ease:'none'},0);
    scrubTimeline(form,{trigger:'.details-type',start:'top bottom',end:'bottom top'});
    const palette=getComputedStyle(document.documentElement);
    [['#possibilidades','--maju-blush'],['#momento','--maju-charcoal'],['#detalhes','--maju-blush-light']].forEach(([selector,color])=>{
      const animation=gsap.fromTo(selector,{backgroundColor:palette.getPropertyValue(selector==='#momento'?'--maju-charcoal-soft':'--maju-ivory').trim()},{backgroundColor:palette.getPropertyValue(color).trim(),duration:1,ease:'none',paused:true});
      scrubTimeline(animation,{trigger:selector,start:'top bottom',end:'top 25%'});
    });
    if(desktop){
      const photo=gsap.fromTo('.editorial-photo>img',{yPercent:-2.5,scale:1.07},{yPercent:2.5,scale:1.07,duration:1,ease:'none',paused:true});
      scrubTimeline(photo,{trigger:editorial,start:'top bottom',end:'bottom top'});
      const copy=gsap.fromTo('.editorial-copy h2',{y:-8},{y:8,duration:1,ease:'none',paused:true});
      scrubTimeline(copy,{trigger:editorial,start:'top bottom',end:'bottom top'});
    }
    const about=gsap.timeline({paused:true}).fromTo('.about-monogram>span:first-child',{y:12,opacity:.75},{y:0,opacity:1,duration:.45}).fromTo('[data-about-enter]',{y:12,opacity:.8},{y:0,opacity:1,duration:.5,stagger:.1},.15).fromTo('.about-brand-line',{scaleX:0},{scaleX:1,duration:.55},.35);
    ScrollTrigger.create({trigger:'#sobre',start:'top 85%',once:true,onEnter(){aboutEntered=true;if(!blocked())about.play();}});
    // Shared hero control also pauses decorative scroll effects. No global RAF.
    const sync=()=>{if(blocked()){about.pause();return;}animations.forEach(({animation,trigger})=>animation.progress(trigger.progress));if(aboutEntered&&about.progress()<1)about.play();};
    active={sync,getState(){return {mode:desktop?'desktop':'mobile',horizontal,triggerCount:ScrollTrigger.getAll().length};}};
    status='active';reason=desktop?'desktop':'mobile';
    ScrollTrigger.refresh();sync();
    // matchMedia reverts the animations/triggers/styles before rebuilding.
    return ()=>{
      active=null;lookbook.classList.remove('is-horizontal');
      progressFill.style.removeProperty('transform');currentPanel.textContent='01';
    };
  }
  async function start(){
    if(!enabled||state.lowPower||reduced.matches){fallback(!enabled?'disabled':state.lowPower?'low-power':'reduced-motion');return;}
    try{
      await loadLibraries();
      if(!enabled||state.lowPower||reduced.matches){fallback('static-preference');return;}
      if(media)return;
      media=gsap.matchMedia();
      media.add({desktop:`(min-width:${CONFIG.desktopWidth}px)`,small:`(max-width:${CONFIG.desktopWidth-1}px)`,tall:'(min-height:650px)',reduce:'(prefers-reduced-motion: reduce)'},context=>{
        if(context.conditions.reduce){fallback('reduced-motion');return;}
        return setup(context.conditions.desktop,context.conditions.tall);
      });
    }catch{fallback('library-unavailable');}
  }
  document.addEventListener('maju:motion',event=>{state=event.detail;active?.sync();});
  reduced.addEventListener('change',()=>{if(!reduced.matches&&!media)start();});
  window.MAJU_SCROLL={
    disable(){enabled=false;media?.revert();media=null;fallback('disabled');},
    enable(){enabled=true;start();},
    refresh(){if(media)ScrollTrigger.refresh();},
    getState(){return {status,reason,paused:blocked(),...(active?.getState()||{})};}
  };
  if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:900});else setTimeout(start,100);
})();
