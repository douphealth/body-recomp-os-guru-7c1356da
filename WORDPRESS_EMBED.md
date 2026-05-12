# Embedding Body Recomp OS into WordPress at `/fitness-plan/`

This app is engineered to mount **natively** at any WordPress subpath while
preserving 100% of its SEO link juice (canonical tags, JSON-LD, sitemap,
internal links, and pre-hydration SEO/AEO content all point to
`https://fitness-plan.gearuptofit.com/`).

---

## 1. Build & host the app on `app.gearuptofit.com`

The Vite build is pinned to stable filenames (see `vite.config.ts`):

- `https://app.gearuptofit.com/assets/index.js`
- `https://app.gearuptofit.com/assets/index.css`

Publish from Lovable, then point the `app.gearuptofit.com` subdomain to the
published project. **Do not** change these filenames — WordPress will
reference them directly.

## 2. Create a WordPress page at `/fitness-plan/`

In WordPress: **Pages → Add New** → set permalink slug to `fitness-plan`.

Use the **Custom HTML block** (or a "Code Snippet" / theme template) and
paste:

```html
<base href="/fitness-plan/">
<link rel="stylesheet" href="https://app.gearuptofit.com/assets/index.css">
<div id="root"></div>
<script type="module" src="https://app.gearuptofit.com/assets/index.js"></script>
```

That's it. React Router auto-detects `<base href>` and routes every internal
link under `/fitness-plan/...` natively.

## 3. WordPress configuration checklist

- [ ] **Disable theme container padding** on this page (use a "blank" or
      "full-width" page template) so the app fills the viewport.
- [ ] Add a wildcard rewrite so `/fitness-plan/anything` serves the same
      page (most themes / Yoast / Rank Math handle this; if not, add to
      `.htaccess`):
      ```apache
      RewriteRule ^fitness-plan(/.*)?$ /fitness-plan/ [L]
      ```
      For Nginx:
      ```nginx
      location /fitness-plan/ { try_files $uri /fitness-plan/index.html; }
      ```
- [ ] In Yoast/Rank Math, **disable** their canonical/OG output for this
      page — the React app injects its own per-route canonical and OG tags.
- [ ] Submit `https://fitness-plan.gearuptofit.com/sitemap.xml` to Google
      Search Console (the sitemap is bundled and served from the app build).

## 4. SEO guarantees baked into the build

| Concern | Implementation |
|---|---|
| Canonical URLs | `SEOHead.tsx` sets `https://fitness-plan.gearuptofit.com/<route>` per page |
| OG / Twitter cards | `SEOHead.tsx` per page + defaults in `index.html` |
| Structured data | `JsonLd.tsx` + per-page schemas (WebApplication, BreadcrumbList, Article) |
| Sitemap | `public/sitemap.xml` lists all 50+ pages under `/fitness-plan/` |
| robots.txt | `public/robots.txt` references the sitemap and allows crawl |
| Pre-hydration content | `index.html` ships H1, intro, FAQ, and `<noscript>` fallback inside `#root` so crawlers index content before React boots |
| Internal links | All routes use `react-router` `<Link>` + central `ROUTES` table — never hardcoded |
| Legacy URLs | Old `/app/body-recomp/...`, `/tools/...`, `/plans/...` paths 301-redirect to the new SEO-optimized paths |

## 5. Quick QA after deploy

1. Visit `https://fitness-plan.gearuptofit.com/` — homepage loads.
2. Navigate to a calculator — URL becomes
   `/fitness-plan/free-fitness-calculators/tdee-calculator`, page renders.
3. Refresh that deep URL — must still render (this is what the WordPress
   rewrite in step 3 ensures).
4. View source — confirm `<link rel="canonical" href="https://fitness-plan.gearuptofit.com/...">`.
5. Run the page through Google's Rich Results Test — JSON-LD should
   validate.
