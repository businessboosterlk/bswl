// THE LIGHT. One behaviour, used by every scene that carries Leon's mark: the home hero, the record band
// and the header of every inner page. Thulaib's ruling, 18 Sep 2026: Leon never moves, only the light
// behind him does, and touching the light should do something.
//
//   markup     <div data-light> … <div class="bulbwrap"><svg data-bulb>…</svg></div> … </div>
//   is-lit     the light is visible and sits under the pointer (or drifts on its own when nobody is touching)
//   is-on      a tap or a click: the rays fire, a ring leaves the bulb, the light peaks
//
// Four movements, all transform or opacity:
//   1. AMBIENT  with no pointer at all (every phone), the light walks slowly round the glass and the mark
//               sways a degree or so. This is what makes it alive on a phone.
//   2. POINTER  the mark leans away from the mouse and the light follows it across the glass.
//   3. SCROLL   the mark rises, turns and grows a little as the page moves.
//   4. TOUCH    the rays fire and a ring goes out.
// Reduced motion: the tap still lights the bulb, everything that travels is dropped.

const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;

function initLight(scene) {
  const wrap = scene.querySelector('.bulbwrap');
  const svg = scene.querySelector('svg[data-bulb]');
  if (!wrap || !svg) return;
  const glowG = svg.querySelector('.bulb-glow');
  const grad = svg.querySelector('[data-glow]');
  const amp = parseFloat(scene.dataset.light || '1') || 1;       // data-light="0.6" calms a small header mark
  let tx = 0, ty = 0, cx = 0, cy = 0, sy = 0, live = false, seen = true, hot = false, onT = 0, t0 = performance.now();

  setTimeout(() => { wrap.style.animation = 'none'; live = true; }, 1700);   // after the CSS entrance, so the two never fight

  function place(x, y) {                                        // x,y in the mark's own coordinates
    if (!grad) return;
    grad.setAttribute('cx', x.toFixed(0)); grad.setAttribute('cy', y.toFixed(0));
  }
  function under(e) {                                           // put the light under the finger or the mouse
    if (!glowG) return;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const m = glowG.getScreenCTM(); if (!m) return;
    const q = pt.matrixTransform(m.inverse()); place(q.x, q.y);
  }

  scene.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const r = scene.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5;
    hot = true; under(e);
  });
  scene.addEventListener('pointerleave', () => { hot = false; tx = 0; ty = 0; });
  scene.addEventListener('pointerdown', e => {
    if (e.target.closest('a,button,input,select,summary,label')) return;   // links and chips keep their own job
    under(e); hot = true;                                       // hold the light under the finger for the length of the flash
    const touch = e.pointerType === 'touch';
    scene.classList.remove('is-on'); void scene.offsetWidth; scene.classList.add('is-on');
    clearTimeout(onT); onT = setTimeout(() => { scene.classList.remove('is-on'); if (touch) hot = false; }, 1000);
  });
  addEventListener('scroll', () => {
    const r = scene.getBoundingClientRect();
    sy = Math.max(-r.height, Math.min(r.height, -r.top));       // how far this scene has travelled, either way
  }, { passive: true });
  new IntersectionObserver(en => { seen = en[0].isIntersecting; if (seen) scene.classList.add('is-lit'); }, { threshold: .05 }).observe(scene);

  if (calm) return;
  (function tick(now) {
    if (seen && live) {
      const t = (now - t0) / 1000;
      cx += (tx - cx) * .05; cy += (ty - cy) * .05;
      if (!hot) place(14200 + Math.cos(t * .45) * 9500, 27000 + Math.sin(t * .45) * 8500);   // the light walks round the glass
      const swayX = Math.sin(t * .5) * 7 * amp, swayY = Math.cos(t * .37) * 5 * amp, swayR = Math.sin(t * .31) * 1.1 * amp;
      wrap.style.transform =
        'translate(' + (-cx * 46 * amp + swayX).toFixed(2) + 'px,' + (-cy * 28 * amp + swayY + Math.max(-36, Math.min(14, -sy * .1 * amp))).toFixed(2) + 'px) ' +
        'rotate(' + (cx * 2.6 * amp + swayR + sy * .004 * amp).toFixed(3) + 'deg) ' +   // .012 tilted the record bulb 10 degrees and pushed it over its own caption
        'scale(' + (1 + Math.min(Math.abs(sy), 300) * .00016 * amp).toFixed(4) + ')';   // capped: a mark waiting below the screen used to sit 80px low and 12% big, over the cards under it
    }
    requestAnimationFrame(tick);
  })(t0);
}

document.querySelectorAll('[data-light]').forEach(initLight);
