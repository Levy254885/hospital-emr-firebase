/* ==================== SCROLL REVEAL ==================== */
(function(){
  const items = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    items.forEach(el=>el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.12,rootMargin:'0px 0px -70px 0px'});
  items.forEach(el=>obs.observe(el));
})();

/* ==================== HEADER SHRINK ==================== */
(function(){
  const header = document.getElementById('site-header');
  if(!header) return;
  const onScroll = ()=> header.classList.toggle('shrink', window.scrollY > 50);
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

/* ==================== ACTIVE NAV LINK ==================== */
(function(){
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === page) a.classList.add('active');
  });
})();

/* ==================== MOBILE MENU ==================== */
(function(){
  const toggle = document.getElementById('menuToggle');
  const menu   = document.getElementById('mobileMenu');
  const close  = document.getElementById('mobileClose');
  if(!toggle || !menu) return;
  const open  = ()=>{ menu.classList.add('open'); document.body.style.overflow='hidden'; };
  const shut  = ()=>{ menu.classList.remove('open'); document.body.style.overflow=''; };
  toggle.addEventListener('click', open);
  close && close.addEventListener('click', shut);
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click', shut));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') shut(); });
})();

/* ==================== ANIMATED COUNTERS ==================== */
(function(){
  const els = document.querySelectorAll('[data-count]');
  if(!els.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count,10);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();
      const step = (now)=>{
        const p = Math.min((now-start)/duration,1);
        const eased = 1 - Math.pow(1-p,3);
        el.textContent = Math.round(eased*target) + suffix;
        if(p<1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  },{threshold:0.4});
  els.forEach(el=>obs.observe(el));
})();

/* ==================== BACK TO TOP ==================== */
(function(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;
  window.addEventListener('scroll',()=>{
    btn.classList.toggle('show', window.scrollY > 500);
  },{passive:true});
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();

/* ==================== SMOOTH PAGE TRANSITIONS ==================== */
(function(){
  document.querySelectorAll('a[href$=".html"]').forEach(link=>{
    link.addEventListener('click',(e)=>{
      const href = link.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('http')) return;
      if(link.target === '_blank') return;
      e.preventDefault();
      document.body.style.transition = 'opacity .28s ease';
      document.body.style.opacity = '0';
      setTimeout(()=>{ window.location.href = href; },280);
    });
  });
})();
