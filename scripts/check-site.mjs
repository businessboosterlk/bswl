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

// Always launch a fresh preview of this build. A process already listening on the dev port
// may be serving an older build, which gives false failures (or false passes).
const PORT = 4699;
const ROOT = `http://localhost:${PORT}/bswl/`;
const PAGES = ['', 'classes/', 'about/', 'locations/', 'tutes/', 'enrol/', 'app/', 'blog/'];
const WIDTHS = [[1440, 900], [1280, 720], [820, 1180], [390, 844], [360, 740]];
const WA = '94771396173';
let pass = 0; const fails = [];
const ok = (name, cond, detail = '') => { if (cond) pass++; else fails.push(name + (detail ? '  <- ' + detail : '')); };

const server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
const up = async () => { for (let i = 0; i < 60; i++) { try { const r = await fetch(ROOT); if (r.ok) return; } catch {} await new Promise(r => setTimeout(r, 500)); } throw new Error('preview never started'); };

try {
  await up();
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
  await p.goto(ROOT, { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
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
  ok('home: one clean portrait and the complete bulb mark', await p.evaluate(() =>
    !!document.querySelector('.hx-leon[src*="leon-front-refined"]') &&
    !!document.querySelector('.hx .bulb-outline') &&
    document.querySelectorAll('.hx-chip').length === 0));
  await p.close();
  const ph = await b.newPage({ viewport: { width: 390, height: 844 } });
  await ph.goto(ROOT, { waitUntil: 'networkidle' }); await ph.waitForTimeout(3200);
  ok('home on a phone: hero actions remain reachable', await ph.evaluate(() => {
    const links = [...document.querySelectorAll('.hx-cta a')];
    return links.length === 2 && links.every(a => { const r = a.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth; });
  }));
  await ph.close();

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
} finally { server.kill(); }

console.log(`\n${pass} of ${pass + fails.length} checks pass`);
if (fails.length) { console.log(fails.map(x => 'FAIL  ' + x).join('\n')); process.exit(1); }
