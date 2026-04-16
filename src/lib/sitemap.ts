import { allSEOPageSlugs } from '@/lib/seo-pages';

// Generate sitemap XML string for all pages
export function generateSitemapXML(): string {
  const base = 'https://app.gearuptofit.com';
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/build-my-plan', priority: '0.95', changefreq: 'weekly' },
    { loc: '/workout-plans', priority: '0.9', changefreq: 'weekly' },
    { loc: '/free-fitness-calculators', priority: '0.9', changefreq: 'monthly' },
    { loc: '/free-fitness-calculators/tdee-calculator', priority: '0.85', changefreq: 'monthly' },
    { loc: '/free-fitness-calculators/macro-calculator', priority: '0.85', changefreq: 'monthly' },
    { loc: '/free-fitness-calculators/protein-calculator', priority: '0.85', changefreq: 'monthly' },
    { loc: '/free-fitness-calculators/one-rep-max-calculator', priority: '0.85', changefreq: 'monthly' },
    { loc: '/free-fitness-calculators/body-fat-calculator', priority: '0.85', changefreq: 'monthly' },
    { loc: '/methodology', priority: '0.8', changefreq: 'monthly' },
  ];

  const planPages = allSEOPageSlugs.map(slug => ({
    loc: `/workout-plans/${slug}`,
    priority: '0.7',
    changefreq: 'monthly' as const,
  }));

  const allPages = [...staticPages, ...planPages];

  const urls = allPages.map(p => `  <url>
    <loc>${base}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
