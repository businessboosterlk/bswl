// HOME PAGE ONLY. Ported from the single-file build of July to September 2026, block for block, so no
// feature was lost in the move to Astro: the class finder, the scrubbed class numerals, the footer rise,
// the pinned tutes and the exercise-book page behind the trust strip. What was REMOVED on purpose, 18 Sep:
//   the old hero timeline   the hero's entrance is CSS now and its light lives in light.js
//   the warp corridor       Thulaib asked for the record to be shown another way (the zero in the bulb)
//   the wall of achievers   it shipped placeholder tiles. It comes back when Leon sends real students,
//                           each with written consent from a parent
//   the default reveals     now one IntersectionObserver in site.js, shared with every page
import './light.js';

/* ── SMART FEATURE: Batch & Path Finder (vanilla, works without GSAP) ── */
document.documentElement.classList.add('js');
(function(){
  const tool = document.querySelector('.finder-tool');
  if (!tool) return;
  const step1 = tool.querySelector('[data-step="1"]');
  const step2 = tool.querySelector('[data-step="2"]');
  const result = tool.querySelector('.fresult');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let year = null, loc = null;

  const PLAN = {
    '2027':  {num:'2027',  batch:'2027 batch', enrol:'Enrol for the 2027 batch',
              title:'The 2027 batch',  line:'Theory taught properly, building towards your 2027 A/L.'},
    '2028':  {num:'2028',  batch:'2028 batch', enrol:'Enrol for the 2028 batch',
              title:'The 2028 batch',  line:'The head start. Learn without exam-season pressure and walk in ahead.'},
    'revision': {num:'REVISE', batch:'Revision', enrol:'Ask about Revision',
              title:'Revision', line:'For your exam year: the syllabus once more before the paper.'},
    'unsure':{num:'?',     batch:null, enrol:'Enquire and get placed',
              title:"Let's place you",  line:'Send your details and Leon will put you in the right batch.'}
  };

  function reveal(el){
    el.hidden = false;
    if (reduce || !el.animate) return;
    el.animate([{opacity:0, transform:'translateY(16px)'}, {opacity:1, transform:'none'}],
      {duration:450, easing:'cubic-bezier(.16,1,.3,1)'});
  }
  function locLine(){ return loc === 'Online' ? 'Live online classes, join from anywhere.' : (loc === "Leon's classroom" ? "In person at Leon's own classroom." : 'In person at ' + loc + '.'); }

  step1.querySelectorAll('[data-year]').forEach(b => b.addEventListener('click', () => {
    year = b.dataset.year;
    step1.querySelectorAll('.fopt').forEach(o => o.classList.toggle('sel', o === b));
    step1.hidden = true; result.hidden = true;
    reveal(step2);
  }));
  step2.querySelectorAll('[data-loc]').forEach(b => b.addEventListener('click', () => {
    loc = b.dataset.loc;
    step2.querySelectorAll('.fopt').forEach(o => o.classList.toggle('sel', o === b));
    const p = PLAN[year];
    result.querySelector('.fr-num span').textContent = p.num;
    result.querySelector('.fr-label').textContent = p.batch ? 'Your batch' : 'Your next step';
    result.querySelector('.fr-title').textContent = p.title;
    result.querySelector('.fr-text').textContent = p.line + ' ' + locLine();
    result.querySelector('.fr-enrol').textContent = p.enrol;
    step2.hidden = true;
    reveal(result);
  }));
  tool.querySelector('[data-back]').addEventListener('click', () => { step2.hidden = true; reveal(step1); });
  result.querySelector('.fr-enrol').addEventListener('click', () => {
    const p = PLAN[year];
    const s = document.getElementById('inBatch'); if (s) s.value = p.batch || '';  // '' = leave "Choose a batch" for unsure
    const l = document.getElementById('inLoc'); if (l && loc) l.value = loc;
    location.hash = '#enquire';
    setTimeout(() => { const n = document.getElementById('inName'); if (n) n.focus({preventScroll:true}); }, 600);
  });
  result.querySelector('.fr-restart').addEventListener('click', () => {
    year = null; loc = null;
    tool.querySelectorAll('.fopt').forEach(o => o.classList.remove('sel'));
    result.hidden = true; step2.hidden = true;
    reveal(step1);
  });
})();

/* ── THE GATE: CDN dead → static premium page; reduced motion → no page cinema ── */
window.addEventListener('load', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  initMotion();
});

function initMotion(){
  const mob = innerWidth < 768;
  const PF = mob ? .5 : 1;                     /* parallax factor halves on mobile */

  /* ── SCENE 2: classes — scrubbed numeral focus (outline→fill), rule draw, copy rise ── */
  document.querySelectorAll('[data-cls]').forEach(row => {
    const fill = row.querySelector('.num .f');
    const rule = row.querySelector('.rule');
    const arr = row.querySelector('.cls-arr');
    const kids = row.querySelectorAll('.cls-copy > *');
    gsap.set(row, {opacity:.35});
    gsap.set(fill, {opacity:0});
    gsap.set(rule, {scaleX:0});
    gsap.set(kids, {y:26, opacity:0});
    if (arr) gsap.set(arr, {x:-40, opacity:0});
    const tl = gsap.timeline({scrollTrigger:{trigger:row, start:'top 75%', end:'top 28%', scrub:.8}})
      .to(row, {opacity:1, duration:.35}, 0)
      .to(fill, {opacity:1, duration:.6}, .05)
      .to(rule, {scaleX:1, duration:.6, ease:'none'}, 0)
      .to(kids, {y:0, opacity:1, duration:.5, stagger:.06}, .1);
    if (arr) tl.to(arr, {x:0, opacity:1, duration:.5}, .15);
  });


  /* ── SCENE 5: footer wordmark rise ── */
  gsap.set('.foot-mark', {yPercent:26, opacity:0});
  gsap.to('.foot-mark', {yPercent:0, opacity:1, duration:1.2, ease:'expo.out',
    scrollTrigger:{trigger:'.footer', start:'top 82%', once:true}});

  /* ── SCENE 6: THE TUTES — pinned scroll (desktop only; no pin on mobile/iOS) ── */
  if (!mob && document.getElementById('tutes')){
    const tW1=document.getElementById('tW1'), tW2=document.getElementById('tW2'),
          tStage=document.querySelector('.tutes .stage'), tCard=document.getElementById('tuteCard'),
          tCapA=document.getElementById('tCapA'), tCapB=document.getElementById('tCapB'),
          tFill=document.getElementById('tuteFill');
    // xPercent/yPercent centre the words behind the card; x adds the drift.
    // Rest slightly LEFT so leading letters (Fre… / Tut…) read; the SWAP sweeps each word
    // straight through the MIDDLE of the tute (behind it) like a conveyor moving left.
    gsap.set(tW1, {xPercent:-50, yPercent:-50, x:0, opacity:0, scale:.92});     // "Free" starts dead-centre (middle of the tute)
    gsap.set(tW2, {xPercent:-50, yPercent:-50, x:'80vw', opacity:0, scale:.92});
    gsap.set(tStage, {scale:.72, opacity:0, rotationZ:-7});
    const tutTl = gsap.timeline({defaults:{ease:'sine.inOut'}, scrollTrigger:{
      trigger:'#tutes', start:'top top', end:'+=340%', scrub:1, pin:true, anticipatePin:1,
      onUpdate:self => { tFill.style.width = (8 + self.progress*92) + '%'; }
    }});
    tutTl.to(tStage, {scale:1, opacity:1, rotationZ:0, duration:1, ease:'power2.out'}, 0)
      .to(tW1, {opacity:.6, scale:1, duration:1, ease:'power2.out'}, 0)        // "Free" flows in, centred (kept in the middle)
      .to(tW1, {x:'-10vw', duration:1.6}, 1)                                    // then glides LEFT
      // ── THE SWAP: both words pass straight THROUGH THE MIDDLE of the tute, moving left ──
      .to(tW1, {x:'-84vw', opacity:0, duration:1.9}, 2.7)                       // Free sweeps through centre and off left
      .to(tW2, {x:'-6vw', opacity:.6, scale:1, duration:1.9}, 2.7)             // Tutes sweeps in from right THROUGH centre
      // ── the beautiful tilt: a real page-turn (bigger, with a scale dip + depth) ──
      .to(tCard, {rotationY:26, scale:.955, duration:1, ease:'power3.inOut'}, 2.85)
      .add(() => {
        const fwd = tutTl.scrollTrigger && tutTl.scrollTrigger.direction === 1;
        document.getElementById('tuteUnit').textContent = fwd ? 'A/L Business Studies · Unit 02' : 'A/L Business Studies · Unit 01';
        document.getElementById('tuteTitle').textContent = fwd ? 'Marketing' : 'The Business Environment';
        document.getElementById('tuteKey').textContent  = fwd ? 'The marketing mix' : 'Opportunity cost';
        document.getElementById('tutePage').textContent = fwd ? 'Page 02' : 'Page 01';
      }, 3.45)
      .to(tCard, {rotationY:0, scale:1, duration:1, ease:'power3.inOut'}, 3.85)
      .to(tCapA, {opacity:0, duration:.5}, 3.0)
      .to(tCapB, {opacity:1, duration:.5}, 3.9)
      .to(tW2, {x:'-11vw', duration:1.4}, 4.9);                                 // whisper hold-drift
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   THE PAGE — kinetic exercise-book grid behind the trust strip.

   Squared paper with a margin rule, the way an A/L exercise book looks.
   The sheet presses in toward the pointer and dents where you click.

   Three rules it obeys:
     1. ENHANCEMENT ONLY. The canvas is aria-hidden decoration. Dead JS, an old
        browser or no canvas support leaves the three facts on plain paper.
     2. IT SLEEPS. The loop runs only while the section is on screen AND the
        pointer has touched it in the last couple of seconds. A phone scrolling
        past pays for one static frame, not a running animation.
     3. NO GLOW. Ink and paper, nothing else.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  var sec = document.querySelector('.trust');
  if (!sec) return;
  var cv = sec.querySelector('canvas.page');
  /* the first stat, NOT the .wrap: the wrap's gutter is padding, so its own box
     starts at 0 and measuring it puts the margin rule through the text */
  var row = sec.querySelector('.trust-item');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  if (!ctx) return;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CELL      = 34;    // squared-paper cell, about a 5mm square on screen
  var REACH     = 200;   // how far from the pointer the press is felt
  var MAX_PRESS = 14;    // paper gives a little. It is not rubber
  var EASE      = 0.10;  // how fast the sheet catches up to the pointer

  var W = 0, H = 0, dpr = 1;
  var mx = -9999, my = -9999, tx = -9999, ty = -9999;
  /* inView starts TRUE on purpose. IntersectionObserver is only ever allowed to
     PAUSE this loop, never to permit it. Gating the other way round means one
     silent IO failure (in-app browsers do this) kills the effect with nothing to
     show for it, and the auto-sleep below already stops the loop when idle. */
  var raf = 0, live = false, inView = true, lastMove = -1e9;
  var dents = [];

  /* where one grid point ends up once the sheet is pressed */
  function press(gx, gy, col, row, cols, rows){
    /* the sheet is held at its edges, so the outer rows and columns barely move */
    var m  = 1.5;
    var pc = Math.min(col / m, (cols - 1 - col) / m, 1);
    var pr = Math.min(row / m, (rows - 1 - row) / m, 1);
    var pin = pc * pc * pr * pr;

    var dx = gx - mx, dy = gy - my;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var near = Math.max(0, 1 - dist / REACH) * pin;

    var ox = 0, oy = 0, i, d, ddx, ddy, dd, off, s, a;
    for (i = 0; i < dents.length; i++){
      d = dents[i];
      ddx = gx - d.x; ddy = gy - d.y;
      dd  = Math.sqrt(ddx * ddx + ddy * ddy);
      off = dd - d.r;
      if (Math.abs(off) < 58){
        s = (1 - Math.abs(off) / 58) * d.life * 11 * pin;
        a = Math.atan2(ddy, ddx);
        ox += Math.cos(a) * s * (off < 0 ? 1 : -1);
        oy += Math.sin(a) * s * (off < 0 ? 1 : -1);
      }
    }

    if (dist < REACH && dist > 0 && pin > 0){
      var t   = dist / REACH;
      var amt = (1 - t) * (1 - t) * Math.min(1, dist / 56) * MAX_PRESS * pin;
      var ang = Math.atan2(dy, dx);
      return { x: gx - Math.cos(ang) * amt + ox, y: gy - Math.sin(ang) * amt + oy, n: near };
    }
    return { x: gx + ox, y: gy + oy, n: near };
  }

  function draw(now){
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);

    /* dents spread out and fade */
    for (var i = dents.length - 1; i >= 0; i--){
      var age = (now - dents[i].born) / 1000;
      dents[i].r    = Math.max(0, age * 260);
      dents[i].life = Math.max(0, 1 - age * 1.35);
      if (dents[i].life <= 0) dents.splice(i, 1);
    }

    var cols = Math.max(2, Math.ceil(W / CELL)) + 1;
    var rows = Math.max(2, Math.ceil(H / CELL)) + 1;
    var cw = W / (cols - 1), ch = H / (rows - 1);

    var P = [], r, c;
    for (r = 0; r < rows; r++){
      P[r] = [];
      for (c = 0; c < cols; c++) P[r][c] = press(c * cw, r * ch, c, r, cols, rows);
    }

    /* the squares */
    function seg(a, b){
      var n = (a.n + b.n) / 2;
      var t = n * n * (3 - 2 * n);                       // smoothstep
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = 'rgba(20,20,23,' + (0.085 + t * 0.26).toFixed(3) + ')';
      ctx.lineWidth = 0.75 + t * 0.5;
      ctx.stroke();
    }
    for (r = 0; r < rows; r++) for (c = 0; c < cols - 1; c++) seg(P[r][c], P[r][c + 1]);
    for (c = 0; c < cols; c++) for (r = 0; r < rows - 1; r++) seg(P[r][c], P[r + 1][c]);

    /* pencil dots. Invisible at rest, they surface only where the page is pressed */
    for (r = 0; r < rows; r++){
      for (c = 0; c < cols; c++){
        var p = P[r][c];
        var t = p.n * p.n * (3 - 2 * p.n);
        if (t < 0.02) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.9 + t * 1.1, 0, 6.2832);
        ctx.fillStyle = 'rgba(20,20,23,' + (t * 0.42).toFixed(3) + ')';
        ctx.fill();
      }
    }

    /* The margin rule, printed on the sheet so it bends with it. It is measured
       OFF the text column, never a percentage of the width: on a real page the
       margin sits beside what you write, and a percentage put it straight
       through the "100%". */
    var mX  = 24;
    if (row){
      var gap = row.getBoundingClientRect().left - sec.getBoundingClientRect().left;
      mX = Math.max(11, gap - 16);
    }
    var mc  = mX / cw;
    var c0  = Math.max(0, Math.min(cols - 2, Math.floor(mc)));
    var f   = mc - c0;
    ctx.beginPath();
    for (r = 0; r < rows; r++){
      var a = P[r][c0], b = P[r][c0 + 1];
      var x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
      if (r) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(20,20,23,.26)';   /* was a red margin rule. The brand is black and white, no colour is ever added */
    ctx.lineWidth = 1.1;
    ctx.stroke();

    /* the dent ring itself, a thumb pressed into the page */
    for (i = 0; i < dents.length; i++){
      ctx.beginPath();
      ctx.arc(dents[i].x, dents[i].y, Math.max(0, dents[i].r), 0, 6.2832);
      ctx.strokeStyle = 'rgba(20,20,23,' + (dents[i].life * 0.16).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function frame(now){
    mx += (tx - mx) * EASE;
    my += (ty - my) * EASE;
    draw(now);
    var settled = Math.abs(mx - tx) < 0.5 && Math.abs(my - ty) < 0.5;
    if (!inView || (now - lastMove > 2200 && !dents.length && settled)){
      live = false; raf = 0; return;                     /* sleep until touched again */
    }
    raf = requestAnimationFrame(frame);
  }

  function wake(){
    lastMove = performance.now();
    if (!live && inView && !reduce){ live = true; raf = requestAnimationFrame(frame); }
  }

  function size(){
    var r = sec.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.round(r.width); H = Math.round(r.height);
    cv.width  = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());                             /* a static frame always exists */
    return true;
  }

  function at(e){
    var r = sec.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  sec.addEventListener('pointermove', function(e){
    var p = at(e); tx = p.x; ty = p.y; wake();
  }, { passive: true });

  sec.addEventListener('pointerleave', function(){
    tx = -9999; ty = -9999; wake();
  }, { passive: true });

  sec.addEventListener('pointerdown', function(e){
    var p = at(e);
    tx = p.x; ty = p.y;
    if (mx < -1000){ mx = p.x; my = p.y; }               /* touch: land on the point, no swoop */
    if (dents.length < 4){
      dents.push({ x: p.x, y: p.y, r: 0, life: 1, born: performance.now() });
    }
    wake();
  }, { passive: true });

  if ('ResizeObserver' in window) new ResizeObserver(size).observe(sec);
  window.addEventListener('resize', size);

  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      inView = es[0].isIntersecting;                     /* pause only, see above */
      if (inView) wake();
    }, { rootMargin: '80px' }).observe(sec);
  }

  /* Some in-app webviews (Instagram's especially) measure the section as 0 wide
     while the page is still settling. Keep trying briefly instead of trusting one
     measurement, or a blank 300x150 canvas is what ships. Stops the moment it
     succeeds; ResizeObserver and fonts.ready handle every change after that. */
  (function settle(n){
    if (size() || n > 20) return;
    setTimeout(function(){ settle(n + 1); }, 120);
  })(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
})();
