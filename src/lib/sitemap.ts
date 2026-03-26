import { allSEOPageSlugs } from '@/lib/seo-pages';

// Generate sitemap XML string for all pages
export function generateSitemapXML(): string {
  const base = 'https://app.gearuptofit.com';
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/plans', priority: '0.9', changefreq: 'weekly' },
    { loc: '/methodology', priority: '0.8', changefreq: 'monthly' },
    { loc: '/app/body-recomp/results', priority: '0.7', changefreq: 'weekly' },
    // Legacy template pages (redirect to new system)
    { loc: '/app/body-recomp/fat-loss-beginner-home-workouts', priority: '0.6', changefreq: 'monthly' },
    { loc: '/app/body-recomp/runner-cut-plan', priority: '0.6', changefreq: 'monthly' },
    { loc: '/app/body-recomp/lean-muscle-high-protein', priority: '0.6', changefreq: 'monthly' },
  ];

  const planPages = allSEOPageSlugs.map(slug => ({
    loc: `/plans/${slug}`,
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
