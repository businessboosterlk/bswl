// Built at build time, so lastmod is the build date. Drafts are never listed. The blog index is only listed
// once a post is published. On GitHub Pages this lives under /bswl/, so submit it directly in Search Console.
import { getCollection } from 'astro:content';
import { BASE } from '../scripts/config.js';

export async function GET({ site }) {
  const root = (site ? String(site).replace(/\/$/, '') : '') + BASE;
  const today = new Date().toISOString().slice(0, 10);
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const pages = ['', 'classes/', 'about/', 'locations/', 'tutes/', 'enrol/', 'app/',
    ...(posts.length ? ['blog/'] : []), ...posts.map(p => 'blog/' + p.id + '/')];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map(p => `  <url><loc>${root}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n') + `\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
