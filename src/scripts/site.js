// SHARED BY EVERY PAGE. Each block guards for elements that only exist on some pages.
import { SITE, waURL } from './config.js';
import './light.js';

document.documentElement.classList.add('js');

/* ── nav + drawer ── */
const nav = document.getElementById('nav');
const drawer = document.getElementById('drawer');
const scrim = document.getElementById('scrim');
function openDrawer() { drawer.classList.add('open'); scrim.classList.add('open'); document.body.classList.add('locked'); }
function closeDrawer() { drawer.classList.remove('open'); scrim.classList.remove('open'); document.body.classList.remove('locked'); }
document.querySelectorAll('[data-open-drawer]').forEach(b => b.addEventListener('click', openDrawer));
document.querySelectorAll('[data-close-drawer]').forEach(b => b.addEventListener('click', closeDrawer));
addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
function onScroll() { if (nav) nav.classList.toggle('stick', scrollY > 8); }
addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
onScroll();

/* ── sticky mobile bar: hides while an enquiry form is on screen ── */
(function () {
  const mbar = document.getElementById('mbar'), enq = document.getElementById('enquire');
  if (mbar && enq && 'IntersectionObserver' in window) {
    new IntersectionObserver(en => mbar.classList.toggle('off', en[0].isIntersecting), { threshold: .12 }).observe(enq);
  }
})();

/* ── WhatsApp links that name what the visitor was looking at. <a data-wa="the Gampaha timetable"> ── */
document.querySelectorAll('[data-wa]').forEach(a => {
  const about = a.dataset.wa;
  a.href = waURL('Hi Leon, I would like to know about ' + about + '.\n(Sent from the website, ' + (document.body.dataset.page || 'home') + ' page)');
  a.target = '_blank'; a.rel = 'noopener';
});

/* ── a class button fills the batch in the form. Works across pages: /enrol/?batch=2027%20batch ── */
(function () {
  const sel = document.getElementById('inBatch'), locSel = document.getElementById('inLoc');
  document.querySelectorAll('[data-batch]').forEach(a => a.addEventListener('click', () => { if (sel) sel.value = a.dataset.batch; }));
  const q = new URLSearchParams(location.search);
  if (sel && q.get('batch')) sel.value = q.get('batch');
  if (locSel && q.get('loc')) locSel.value = q.get('loc');
})();

/* ── enquiry form: name and number required, straight to WhatsApp with what they chose ── */
(function () {
  const form = document.getElementById('enqForm');
  if (!form) return;
  const SL_PHONE = /^(0\d{9}|(\+?94)\d{9})$/;
  const val = id => document.getElementById(id).value.trim();
  const bad = (fid, isBad) => { document.getElementById(fid).classList.toggle('invalid', isBad); return !isBad; };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = val('inName'), phone = val('inPhone').replace(/[\s-]/g, ''), batch = val('inBatch'), loc = val('inLoc');
    let ok = true;
    ok = bad('fName', !name) && ok;
    ok = bad('fPhone', !SL_PHONE.test(phone)) && ok;
    ok = bad('fBatch', !batch) && ok;
    ok = bad('fLoc', !loc) && ok;
    if (!ok) { const first = form.querySelector('.invalid input,.invalid select'); if (first) first.focus(); return; }
    const text = "Hi! I'd like to enrol at the Academy of Business Studies.\n"
      + 'Name: ' + name + '\n' + 'WhatsApp: ' + phone + '\n' + 'Class: ' + batch + '\n' + 'Preferred location: ' + loc + '\n'
      + '(Sent from the website)';
    /* THE PIPE. The enquiry also lands in a key the staff system reads on the same origin, so nobody retypes it
       off a phone. On Leon's own domain the two become separate origins and the real backend goes here instead. */
    try {
      const KEY = 'bswl_enquiries_v1';
      const q = JSON.parse(localStorage.getItem(KEY) || '[]');
      q.push({ ref: 'W' + Date.now().toString(36).toUpperCase(), name, phone, batch, loc, at: new Date().toISOString(), src: 'Website' });
      localStorage.setItem(KEY, JSON.stringify(q.slice(-50)));
    } catch (err) { /* a private window or a full store must never block the enquiry */ }
    const url = waURL(text);
    document.getElementById('waAgain').href = url;
    form.style.display = 'none';
    document.getElementById('enqDone').classList.add('show');
    window.open(url, '_blank', 'noopener');
  });
  document.getElementById('enqReset').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('enqDone').classList.remove('show');
    form.style.display = ''; form.reset();
  });
})();

/* ── reveals. Nothing is hidden in CSS: this script hides, then shows, so dead JS leaves a whole page. ── */
(function () {
  const els = document.querySelectorAll('[data-sr]');
  if (!els.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }),
    { rootMargin: '0px 0px -12% 0px', threshold: .08 });
  els.forEach(el => { el.classList.add('sr'); io.observe(el); });
})();
