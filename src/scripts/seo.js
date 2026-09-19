// Small helpers for the JSON-LD graph that Layout emits. Used in page frontmatter.
export function breadcrumb(site, base, items) {
  const list = [{ '@type': 'ListItem', position: 1, name: 'Home', item: site + base }];
  items.forEach((it, i) => list.push({ '@type': 'ListItem', position: i + 2, name: it.name, item: site + base + it.path }));
  return { '@type': 'BreadcrumbList', itemListElement: list };
}

export function faqSchema(items) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a }
    }))
  };
}

export function siteOf(astroSite) {
  return astroSite ? String(astroSite).replace(/\/$/, '') : '';
}
