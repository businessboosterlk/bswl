// THE GATE. Loads every built page in a real browser at five widths and fails the deploy on anything a visitor
// would see as broken. Run after `astro build`, against `astro preview` (the workflow starts it).
//   1. no page scrolls sideways at 1440, 1280, 820, 390 or 360
//   2. no console error and no page error
//   3. LEFT-ALIGN LAW: the first headline sits on the same left x as the brand mark (within 2px)
//   4. HOUSE STYLE on what the visitor reads: no em dash, no en dash, no comma before and/or/but/nor
//   5. no decorative dash before a label (an ::before with a width and no text on .eyebrow)
//   6. every internal link resolves, and every WhatsApp link carries Leon's number and a message
//   7. on the home page Leon does not move when the pointer or the page does, and the mark does
//   8. the enquiry form refuses an empty send and builds a WhatsApp message with the chosen class and place
// PW lets a machine that already has a Playwright browser point at it, so a local run never waits on a download:
//   PW=/Users/thulaibhassen/bb-systems/batch/node_modules/playwright/index.mjs node scripts/check-site.mjs
const { chromium } = await import(process.env.PW || 'playwright');
import { spawn } from 'node:child_process';

// THE GATE MUST TEST THIS BUILD AND NOTHING ELSE. On 21 Sep 2026 a preview left running by another checkout of this
// site was holding port 4699, so the gate loaded THAT site, failed three checks that were true of this one and would
// have passed faults that were not. Two guards: the port is one the system hands out as free, and before any check
// runs the served home page must be byte for byte the dist/index.html on disk.
import net from 'node:net';
import { readFileSync } from 'node:fs';
const PORT = await new Promise((res, rej) => { const srv = net.createServer(); srv.once('error', rej); srv.listen(0, () => { const { port } = srv.address(); srv.close(() => res(port)); }); });
const ROOT = `http://localhost:${PORT}/bswl/`;
const PAGES = ['', 'classes/', 'about/', 'locations/', 'tutes/', 'enrol/', 'app/', 'blog/'];
const WIDTHS = [[1440, 900], [1280, 720], [820, 1180], [390, 844], [360, 740]];
const WA = '94771396173';
let pass = 0; const fails = [];
const ok = (name, cond, detail = '') => { if (cond) pass++; else fails.push(name + (detail ? '  <- ' + detail : '')); };

// Astro 7 keeps ONE managed preview per project and refuses a second, so any preview already up is stopped first.
import { spawnSync } from 'node:child_process';
spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', 'stop'], { stdio: 'ignore' });
const server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
const up = async () => { for (let i = 0; i < 60; i++) { try { const r = await fetch(ROOT); if (r.ok) return; } catch {} await new Promise(r => setTimeout(r, 500)); } throw new Error('preview never started'); };

try {
  await up();
  { const served = await (await fetch(ROOT)).text(); const built = readFileSync('dist/index.html', 'utf8');
    if (served !== built) throw new Error('the preview on port ' + PORT + ' is not serving this build (dist/index.html differs). Refusing to test another site.'); }
  let b;
  try { b = await chromium.launch(); }
  catch (err) {
    if (!String(err).includes("Executable doesn't exist")) throw err;
    b = await chromium.launch({ channel: 'chrome' });
  }
  const links = new Set();
  for (const pth of PAGES) {
    for (const [w, h] of WIDTHS) {
      const p = await b.newPage({ viewport: { width: w, height: h } });
      const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); }); p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
      await p.goto(ROOT + pth, { waitUntil: 'networkidle' }); await p.waitForTimeout(w === 1440 ? 2600 : 900);
      const r = await p.evaluate(() => {
        const h1 = document.querySelector('h1'), brand = document.querySelector('.nav .brand');
        const vis = el => { const c = getComputedStyle(el); return c.display !== 'none' && c.visibility !== 'hidden'; };
        const text = [...document.querySelectorAll('main *, footer *, header *')].filter(e => e.children.length === 0 && vis(e)).map(e => e.textContent).join(' \n ');
        const dash = [...document.querySelectorAll('.eyebrow,.ph-kick,.meta')].some(e => { const c = getComputedStyle(e, '::before'); return c.content === '""' && parseFloat(c.width) > 8; });
        return { sw: document.documentElement.scrollWidth, vw: innerWidth, h1: h1 ? Math.round(h1.getBoundingClientRect().left) : null, brand: brand ? Math.round(brand.getBoundingClientRect().left) : null,
          text, dash, hrefs: [...document.querySelectorAll('a[href]')].map(a => a.href), wa: [...document.querySelectorAll('a[data-wa]')].map(a => a.href) };
      });
      const tag = (pth || 'home') + ' @' + w;
      ok(tag + ': no sideways scroll', r.sw <= r.vw, r.sw + ' > ' + r.vw);
      ok(tag + ': no console or page error', errs.length === 0, errs.join(' | '));
      if (r.h1 !== null && pth !== '') ok(tag + ': headline on the brand\'s left edge', Math.abs(r.h1 - r.brand) <= 2, 'h1 ' + r.h1 + ' brand ' + r.brand);
      if (pth === '') ok(tag + ': hero headline on the brand\'s left edge', Math.abs(r.h1 - r.brand) <= 2, 'h1 ' + r.h1 + ' brand ' + r.brand);
      if (w === 1440) {
        ok(tag + ': no em or en dash in what the visitor reads', !/[—–]/.test(r.text), (r.text.match(/.{20}[—–].{20}/) || [''])[0]);
        ok(tag + ': no comma before and, or, but, nor', !/,\s+(and|or|but|nor)\b/i.test(r.text), (r.text.match(/.{24},\s+(and|or|but|nor)\b.{10}/i) || [''])[0]);
        ok(tag + ': no decorative dash before a label', !r.dash);
        ok(tag + ': every WhatsApp link carries Leon\'s number and a message', r.wa.every(u => u.includes('wa.me/' + WA) && u.includes('text=')), r.wa.find(u => !u.includes(WA)) || '');
        r.hrefs.filter(u => u.startsWith(ROOT)).forEach(u => links.add(u.split('#')[0]));
      }
      await p.close();
    }
  }
  for (const u of links) { const r = await fetch(u); ok('link resolves: ' + u.replace(ROOT, '/'), r.ok, String(r.status)); }

  // 7. Leon is static, the light is not
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(ROOT, { waitUntil: 'networkidle' }); await p.waitForTimeout(4800);
  const box = sel => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.top + scrollY]; }, sel);
  const l0 = await box('.hx-leon'), m0 = await box('.hx .bulb-body');
  await p.mouse.move(500, 500); await p.mouse.move(1200, 300, { steps: 10 }); await p.waitForTimeout(1300);
  const l1 = await box('.hx-leon'), m1 = await box('.hx .bulb-body');
  ok('home: Leon does not move with the pointer', l1[0] === l0[0] && l1[1] === l0[1], JSON.stringify([l0, l1]));
  ok('home: the mark moves with the pointer', Math.abs(m1[0] - m0[0]) > 3);
  await p.mouse.click(640, 520); await p.waitForTimeout(250);
  ok('home: touching the light switches it on', await p.evaluate(() => document.querySelector('.hx').classList.contains('is-on')));
  await p.mouse.wheel(0, 320); await p.waitForTimeout(900);
  const l2 = await box('.hx-leon');
  ok('home: Leon does not move on scroll', l2[0] === l0[0] && l2[1] === l0[1], JSON.stringify([l0, l2]));
  // THE HERO, Thulaib 21 Sep 2026: the solid mark (never the outline), and each ray becomes one card.
  await p.evaluate(() => scrollTo(0, 0)); await p.mouse.move(5, 300); await p.waitForTimeout(1600);   // the checks below measure the hero at rest
  ok('home: the mark is solid, never an outline', await p.evaluate(() => { const cs = getComputedStyle(document.querySelector('.hx .bulb-body'));
    return !document.querySelector('.hx .bulb-outline') && cs.fill !== 'none' && cs.stroke === 'none'; }));
  ok('home: five cards, all on the screen, none over his face, none over the headline', await p.evaluate(() => {
    const L = document.querySelector('.hx-leon').getBoundingClientRect(); const f = { l: L.left + L.width * .3, r: L.left + L.width * .7, t: L.top + L.height * .08, b: L.top + L.height * .34 };
    const H = document.querySelector('.hx-head h1').getBoundingClientRect(); const hit = (r, q) => !(r.right < q.l || r.left > q.r || r.bottom < q.t || r.top > q.b);
    const c = [...document.querySelectorAll('.hx-chip')].map(x => x.getBoundingClientRect());
    return c.length === 5 && c.every(r => r.left >= 8 && r.right <= innerWidth - 8 && r.top >= 72 && !hit(r, f) && !hit(r, { l: H.left, r: H.right, t: H.top, b: H.bottom })); }));
  ok('home: the rays have become the cards (no ray left showing)', await p.evaluate(() => [...document.querySelectorAll('.hx .bulb-ray')].every(r => parseFloat(getComputedStyle(r).opacity) < .05)));
  ok('home: no two cards overlap', await p.evaluate(() => { const c = [...document.querySelectorAll('.hx-chip')].map(x => x.getBoundingClientRect());
    return c.every((a, i) => c.every((b, j) => i >= j || a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)); }));
  await p.close();
  const ph = await b.newPage({ viewport: { width: 390, height: 844 } });
  await ph.goto(ROOT, { waitUntil: 'networkidle' }); await ph.waitForTimeout(5400);   // the last card lands at 3.8s
  ok('home on a phone: cards on the screen, off his face, not on top of each other', await ph.evaluate(() => {
    const L = document.querySelector('.hx-leon').getBoundingClientRect(); const f = { l: L.left + L.width * .3, r: L.left + L.width * .7, t: L.top + L.height * .08, b: L.top + L.height * .34 };
    const c = [...document.querySelectorAll('.hx-chip')].filter(x => getComputedStyle(x).display !== 'none').map(x => x.getBoundingClientRect());
    return c.length >= 3 && c.every(r => r.left >= 4 && r.right <= innerWidth - 4 && (r.right < f.l || r.left > f.r || r.bottom < f.t || r.top > f.b)) &&
      c.every((a, i) => c.every((b, j) => i >= j || a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)); }));
  ok('home on a phone: hero actions remain reachable', await ph.evaluate(() => {
    const links = [...document.querySelectorAll('.hx-cta a')];
    return links.length === 2 && links.every(a => { const r = a.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth; });
  }));
  await ph.close();

  // CONTACT at the foot of every page: four ways to reach Leon, one map, three towns
  const ct = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await ct.goto(ROOT + 'classes/', { waitUntil: 'networkidle' });
  ok('contact: WhatsApp, Instagram, Facebook and YouTube, each to the right place', await ct.evaluate(wa => { const h = [...document.querySelectorAll('.contact-list a')].map(a => a.href);
    return h.length === 4 && h[0].includes('wa.me/' + wa) && h[1].includes('instagram.com/bswithleon') && h[2].includes('facebook.com/') && h[3].includes('youtube.com/@BSwithLeon'); }, WA));
  await ct.evaluate(() => document.getElementById('contact').scrollIntoView()); await ct.click('.map-tab:nth-child(3)'); await ct.waitForTimeout(300);
  ok('contact: choosing a town moves the map and the Google Maps button', await ct.evaluate(() => document.getElementById('mapFrame').src.includes('Gampaha') && document.getElementById('mapOpen').href.includes('Gampaha') && document.getElementById('mapName').textContent === 'Gampaha'));
  ok('contact: the map never points at a private address', await ct.evaluate(() => [...document.querySelectorAll('.map-tab')].every(t => /^(Nugegoda|Kiribathgoda|Gampaha)$/.test(t.dataset.name))));
  await ct.close();

  // 8. the form
  const f = await b.newPage({ viewport: { width: 390, height: 844 } });
  await f.addInitScript(() => { window.__opened = []; window.open = u => { window.__opened.push(u); return null; }; });
  await f.goto(ROOT + 'enrol/?batch=2028%20batch&loc=Gampaha', { waitUntil: 'networkidle' });
  ok('enrol: a link with ?batch and ?loc fills the form', await f.evaluate(() => document.getElementById('inBatch').value === '2028 batch' && document.getElementById('inLoc').value === 'Gampaha'));
  await f.click('#enqForm button[type=submit]');
  ok('enrol: an empty send is refused', await f.evaluate(() => document.querySelectorAll('.field.invalid').length >= 2 && window.__opened.length === 0));
  await f.fill('#inName', 'Test Student'); await f.fill('#inPhone', '0771234567'); await f.click('#enqForm button[type=submit]');
  const opened = await f.evaluate(() => window.__opened[0] || '');
  ok('enrol: the message goes to Leon with the class and the place', opened.includes('wa.me/' + WA) && decodeURIComponent(opened).includes('2028 batch') && decodeURIComponent(opened).includes('Gampaha'), opened.slice(0, 90));
  ok('enrol: field text is 16px so a phone does not zoom', await f.evaluate(() => parseFloat(getComputedStyle(document.getElementById('inName')).fontSize) >= 16));
  await f.close();
  await b.close();
} finally { server.kill(); spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', 'stop'], { stdio: 'ignore' }); }

console.log(`\n${pass} of ${pass + fails.length} checks pass`);
if (fails.length) { console.log(fails.map(x => 'FAIL  ' + x).join('\n')); process.exit(1); }
