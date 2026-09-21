# Academy of Business Studies by Leon Fambeck: developer notes

Written 19 September 2026 by Business Booster. Read this before touching the code.

## What this is

Leon Fambeck's public website. Eight pages, static HTML built by **Astro 7** from `src/`. No server: every
enquiry hands off to WhatsApp with a pre-filled message. Stack per Business Booster's standard: Astro for pages.
If a server is ever added it is Node.js (Next.js where pages and an API live together) on Supabase.

Until 18 September 2026 this site was one 1,700 line HTML file. That file is kept, untouched, in `legacy/` as the
rollback. Nothing in `legacy/` is built or served.

## Run it

```bash
npm install          # Node 22.12 or newer
npm run dev          # http://localhost:4605/bswl/
npm run build        # writes dist/
npm run check:site   # the gate: real browser, 8 pages, 5 widths. Must pass before a push
npm run verify       # build, then the gate
```

Pushing to `main` builds and publishes to GitHub Pages (`.github/workflows/deploy.yml`). The gate runs in that
workflow too, so a failing page never goes live. **The local working branch is `deploy`, tracking `origin/main`.
The local branch called `main` is an unrelated old history: never merge it. Push with `git push origin deploy:main`.**

## Where things are

| Path | What it is |
|---|---|
| `src/scripts/config.js` | **Every real-world value**: WhatsApp number, Instagram, the student app address, the robots switch. Edit here, never in a page |
| `src/layouts/Layout.astro` | Head (SEO, share preview, JSON-LD), menu, drawer, footer, the sticky phone button |
| `src/pages/` | `index` home, `classes`, `about`, `locations`, `tutes`, `enrol`, `app` (student app), `blog/`, `404`, `sitemap.xml.js` |
| `src/components/Bulb.astro` | Leon's mark, traced from his logo to vector. Paths live in `src/data/bulb.json`. Never redraw it |
| `src/components/Icon.astro` | The one line icon set |
| `src/scripts/light.js` | The moving light behind Leon, shared by every scene that carries the mark |
| `src/scripts/site.js` | Shared behaviour: menu, WhatsApp links, the enquiry form, reveals |
| `src/scripts/home.js` | Home only: class finder, class numerals, pinned tutes, the exercise-book page |
| `src/styles/global.css` | The single-file stylesheet, moved across byte for byte minus four rewritten sections |
| `src/styles/pages.css` | Everything written for the rebuild: buttons, the mark, the hero, every inner page |
| `src/data/*.json` | Classes, locations, FAQ. Change the words here and every page follows |
| `src/content/blog/` | Blog posts in Markdown. `draft: true` keeps a post out of the build, the menu and the sitemap |

## Rules that must not break

1. **Leon never moves.** Only the light behind him does. The gate measures it.
2. **Black and white only.** No colour is ever added. No decorative dash before any label.
3. **His students are minors.** No student face, name, school or result without written consent from a parent.
   The wall of achievers was removed for that reason and comes back only with real, consented students.
4. **No fee and no timetable is printed.** Leon gives both on WhatsApp.
5. **Nothing is invented.** Every line on the site is something Leon has said in public or Business Booster was told
   by him. Still open with Leon: his sport, how long he has taught, proof behind "island rank".
6. **The blog is hidden until a post is published**, and a post is published only after Leon has read it.
7. **Hero copy sits hard left** on the brand's left edge. The menu bar spans the screen. The gate measures both.

## Moving to Leon's own domain

Set `SITE_URL` and `BASE_PATH=/` in the build and nothing else changes. If two copies are ever live at once, one of
them must carry `noindex` (`ROBOTS` in `config.js`) or they compete in Google.

## The student app

`SITE.studentApp` in `config.js`. It is hosted separately. It answered 522 (hosting down) on 18 September 2026.
Never point it at `businessboosterlk.github.io/bswl-demo/student/`: that is an old demo with three fixed logins.

## Icons: never drawn by hand

Every icon comes from one of two licensed sets: Lucide (line icons, ISC licence) and Simple Icons (brand marks such as WhatsApp, CC0). To add one, put its name in `scripts/build-icons.mjs` and run `npm run icons`. That writes `src/data/icons.json`, which is the only thing `Icon.astro` reads. The gate fails the deploy if that file differs from the packages by a single character, or if anybody types an `<svg>` into a page. Before shipping a new icon, render it at 120px and look at it.
