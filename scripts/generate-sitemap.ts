// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml from the canonical SEO page registry.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { allSEOPageSlugs } from "../src/lib/seo-pages";
import { APP_CANONICAL_URL } from "../src/lib/site-url";

interface Entry {
  path: string;
  changefreq: "weekly" | "monthly";
  priority: string;
}

const today = new Date().toISOString().split("T")[0];

const staticEntries: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/build-my-plan", changefreq: "weekly", priority: "0.95" },
  { path: "/workout-plans", changefreq: "weekly", priority: "0.9" },
  { path: "/free-fitness-calculators", changefreq: "monthly", priority: "0.9" },
  { path: "/free-fitness-calculators/tdee-calculator", changefreq: "monthly", priority: "0.85" },
  { path: "/free-fitness-calculators/macro-calculator", changefreq: "monthly", priority: "0.85" },
  { path: "/free-fitness-calculators/protein-calculator", changefreq: "monthly", priority: "0.85" },
  { path: "/free-fitness-calculators/one-rep-max-calculator", changefreq: "monthly", priority: "0.85" },
  { path: "/free-fitness-calculators/body-fat-calculator", changefreq: "monthly", priority: "0.85" },
  { path: "/methodology", changefreq: "monthly", priority: "0.8" },
];

const planEntries: Entry[] = allSEOPageSlugs.map((slug) => ({
  path: `/workout-plans/${slug}`,
  changefreq: "monthly",
  priority: "0.7",
}));

const entries = [...staticEntries, ...planEntries];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map(
    (e) =>
      `  <url><loc>${APP_CANONICAL_URL}${e.path}</loc><lastmod>${today}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
  ),
  `</urlset>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${entries.length} entries)`);
