/* script.js
 - Handles:
   1) progressive image loading for service cards & social icons (tries several filenames)
   2) wave animation randomization (directions/speeds) + scroll parallax
*/

(function(){
  // helper: try a list of candidate paths for an <img> element
  function trySetImage(imgEl, candidates){
    if(!candidates || !candidates.length) return;
    let i = 0;
    function attempt(){
      if(i >= candidates.length){ return; }
      imgEl.src = candidates[i];
      imgEl.onload = ()=>{/* ok */};
      imgEl.onerror = ()=>{
        i++;
        attempt();
      };
    }
    attempt();
  }

  // Initialize service images (each .service-card has data-files JSON array)
  document.addEventListener('DOMContentLoaded', ()=>{

    document.querySelectorAll('.service-card').forEach(card=>{
      const imgEl = card.querySelector('.service-img') || card.querySelector('img');
      const data = card.getAttribute('data-files');
      let candidates = [];
      try {
        candidates = JSON.parse(data);
      } catch(e){
        // fallback: try based on heading text
        const title = card.querySelector('h3')?.textContent || '';
        const fallbackName = title.trim().replace(/\s+/g, '_') + '.png';
        candidates = [fallbackName];
      }
      // make candidate paths absolute attempts: images/... then root
      let attempts = [];
      candidates.forEach(name=>{
        attempts.push('images/' + name);
        attempts.push(name);
      });
      // also try lower/normalize variants (remove zero width no-break)
      attempts = Array.from(new Set(attempts));
      trySetImage(imgEl, attempts);
    });

    // social icons
    document.querySelectorAll('.social-icon').forEach(icon=>{
      const data = icon.getAttribute('data-fallback');
      let candidates = [];
      try{ candidates = JSON.parse(data); }catch(e){ candidates = [icon.getAttribute('src') || '']; }
      // build attempts
      let attempts = [];
      candidates.forEach(name=>{ attempts.push(name); attempts.push('images/' + name); });
      attempts = Array.from(new Set(attempts));
      trySetImage(icon, attempts);
    });

    // waves parallax + randomized horizontal movement
    const waveLayers = document.querySelectorAll('.wave-layer');
    // assign each layer a random speed and direction
    waveLayers.forEach((el, idx)=>{
      const base = 6 + Math.random() * 8; // sec
      el.style.animationDuration = (base + idx*2) + 's';
      // alternate direction randomly
      if(Math.random() > 0.45) el.style.animationDirection = 'reverse';
      el.style.willChange = 'transform';
    });

    // Parallax on scroll: adjust translateY of waves slightly and speed
    function onScroll(){
      const scrollY = window.scrollY || window.pageYOffset;
      waveLayers.forEach((el, i)=>{
        const speed = 0.15 + i*0.04; // different speeds
        const y = -(scrollY * speed);
        el.style.transform = `translate3d(${(parseFloat(getComputedStyle(el).transform.split(',')[4])||0)}px, ${y}px,0)`;
        // Note: horizontal animation still via CSS keyframes; we update vertical translate for parallax.
      });
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();

    // Make wave horizontal animation use translateX keyframes; CSS already animates translateX.
    // To keep waves from moving fully out of view we use wide SVGs (200%) and translateX -50% loops.

    // optional: smooth reveal with IntersectionObserver
    const io = new IntersectionObserver((entries)=> {
      entries.forEach(e=>{
        if(e.isIntersecting) e.target.classList.add('inview');
      });
    }, {threshold:0.12});
    document.querySelectorAll('.service-card, .bot-inner, .contact-left, .contact-map, .about-section').forEach(el=>{
      io.observe(el);
    });

  });

})();
