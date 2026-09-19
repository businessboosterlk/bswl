// Academy of Business Studies by Leon Fambeck. Astro static site, BB stack standard (2026-09-09).
//
// TWO VALUES CHANGE WHEN THE SITE MOVES TO LEON'S OWN DOMAIN:
//   SITE_URL  = https://bswl.businessbooster.lk   (or whatever he ends up on)
//   BASE_PATH = /
// Set them as environment variables in the build and nothing else changes.
// The defaults are the GitHub Pages address, businessboosterlk.github.io/bswl/.
import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL || 'https://businessboosterlk.github.io';
const base = process.env.BASE_PATH || '/bswl';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' }
});
