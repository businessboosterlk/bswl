// EVERY ICON ON THIS SITE COMES FROM A LICENSED ICON SET. NOBODY DRAWS ONE BY HAND.
// On 21 Sep 2026 the owner opened the contact section and saw a WhatsApp logo that had been typed from memory as path
// data. It looked like what it was. The same was true, less visibly, of every icon on the site. This script is the fix:
//   line icons   Lucide (ISC licence), via the lucide-static package
//   brand marks  Simple Icons (CC0), the companies' own glyphs, via the simple-icons package
// It writes src/data/icons.json. Icon.astro only reads that file. `--check` fails if the file differs from what the
// packages produce, which is how the gate proves no icon was edited or added by hand.
//   node scripts/build-icons.mjs          write
//   node scripts/build-icons.mjs --check  verify (run by check-site.mjs)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const LINE = {                      // our name            Lucide's file
  calendar: 'calendar-check', pin: 'map-pin', book: 'book-open', speech: 'languages', medal: 'medal', whistle: 'whistle',
  screen: 'monitor-play', home: 'house', arrow: 'arrow-right', check: 'check', chat: 'message-circle', phone: 'smartphone',
  map: 'map', clock: 'clock', cap: 'graduation-cap', back: 'arrow-left', menu: 'menu', close: 'x',
  bars: 'chart-column', trend: 'trending-up', pie: 'chart-pie', coin: 'circle-dollar-sign', briefcase: 'briefcase-business', target: 'target'
};
const BRAND = { whatsapp: 'whatsapp', instagram: 'instagram', facebook: 'facebook', youtube: 'youtube' };

const inner = svg => svg.replace(/<!--[\s\S]*?-->/g, '').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s*\n\s*/g, '').trim();
const out = { _source: { line: 'lucide-static ' + JSON.parse(readFileSync('node_modules/lucide-static/package.json')).version + ' (ISC)',
                         brand: 'simple-icons ' + JSON.parse(readFileSync('node_modules/simple-icons/package.json')).version + ' (CC0-1.0)' }, line: {}, brand: {} };
for (const [k, f] of Object.entries(LINE)) {
  // pathLength lets any icon draw itself in (.ic * in pages.css). It changes nothing about the shape.
  out.line[k] = inner(readFileSync(`node_modules/lucide-static/icons/${f}.svg`, 'utf8')).replace(/<(path|rect|circle|line|polyline|polygon|ellipse)\b/g, '<$1 pathLength="100"');
}
for (const [k, f] of Object.entries(BRAND)) out.brand[k] = inner(readFileSync(`node_modules/simple-icons/icons/${f}.svg`, 'utf8')).replace(/<title>.*?<\/title>/, '');

const next = JSON.stringify(out, null, 1) + '\n', file = 'src/data/icons.json';
if (process.argv.includes('--check')) {
  if (!existsSync(file) || readFileSync(file, 'utf8') !== next) { console.error('icons.json does not match the icon packages. An icon was edited by hand, or the packages changed. Run: node scripts/build-icons.mjs'); process.exit(1); }
  console.log('icons.json matches the packages:', Object.keys(out.line).length, 'line,', Object.keys(out.brand).length, 'brand');
} else { writeFileSync(file, next); console.log('wrote', file, Object.keys(out.line).length, 'line,', Object.keys(out.brand).length, 'brand'); }
