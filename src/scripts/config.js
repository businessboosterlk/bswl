// ONE place for every real-world value on this site. Pages and scripts import it.
// Edit here, never inside a page. The source of each value is noted.
export const SITE = {
  name: 'Academy of Business Studies by Leon Fambeck',
  short: 'BS With Leon',
  teacher: 'Leon Fambeck',
  subject: 'A/L Business Studies',
  medium: 'English medium',                     // Instagram @bswithleon display name, read 16 Sep 2026
  // Leon's WhatsApp, digits only, no plus. 077 139 6173. From BB's own files and the student app,
  // NOT yet confirmed by Leon in writing (open loop 5, 16 Sep 2026). One edit here changes every button.
  whatsapp: '94771396173',
  whatsappPretty: '077 139 6173',
  instagram: 'https://instagram.com/bswithleon',
  instagramHandle: '@bswithleon',
  // The student app Leon's students sign in to. Hosted by BB's developer on Leon's domain. It answered 522 on
  // 18 Sep 2026 (hosting down), so check it before telling students to use it. NEVER the old GitHub demo app.
  studentApp: 'https://bswl.businessbooster.lk/systemdemo/student/',
  batches: ['2027', '2028']                     // Thulaib, 16 Sep 2026: both intakes are open
};

// Astro sets BASE_URL from astro.config (/bswl/ on GitHub Pages, / on Leon's own domain).
export const BASE = String(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
export const IMG = BASE + 'assets/';

export function waURL(msg) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
}

// This address IS the public site today, so it is indexable. If a second copy ever goes up on
// another domain, one of the two must become 'noindex, nofollow' or they compete in Google.
export const ROBOTS = 'index, follow';
