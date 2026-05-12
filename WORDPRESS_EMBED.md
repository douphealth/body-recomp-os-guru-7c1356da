# Hosting Body Recomp OS at `fitness-plan.gearuptofit.com`

The app is deployed natively at the subdomain
**`https://fitness-plan.gearuptofit.com/`** — every canonical, OG, Twitter,
JSON-LD, sitemap and internal-link URL points there.

---

## 1. DNS / hosting

Point the `fitness-plan` subdomain to the Lovable-published project:

| Type | Name | Value |
|------|------|-------|
| A    | fitness-plan | 185.158.133.1 |

Or, if proxied via Cloudflare, use the CNAME flow inside
**Project Settings → Domains → Connect Domain → Advanced → Proxy mode**.

Once verified, Lovable provisions SSL automatically.

## 2. WordPress integration

No embed snippet is needed — the subdomain hosts the React app directly.
From WordPress, link to it like any external page:

```html
<a href="https://fitness-plan.gearuptofit.com/">Build my free plan →</a>
```

For deep links to specific calculators or plans:

```
https://fitness-plan.gearuptofit.com/build-my-plan
https://fitness-plan.gearuptofit.com/free-fitness-calculators
https://fitness-plan.gearuptofit.com/workout-plans
```

Subdomains pass topical authority to the apex domain via internal linking,
shared brand, and sitemap cross-references. To maximize SEO juice flow:

- Link **from** `gearuptofit.com` blog posts **to** specific
  `fitness-plan.gearuptofit.com/...` calculators and plans.
- Link **back** from in-app pages (Header / Footer) to the main
  `gearuptofit.com` site.
- Submit `https://fitness-plan.gearuptofit.com/sitemap.xml` to Google
  Search Console as a separate property, and add it to the apex domain's
  `robots.txt` `Sitemap:` directive.

## 3. SEO guarantees baked into the build

| Concern | Implementation |
|---|---|
| Canonical URLs | `SEOHead.tsx` sets `https://fitness-plan.gearuptofit.com/<route>` per page |
| OG / Twitter cards | `SEOHead.tsx` per page + defaults in `index.html` |
| Structured data | `JsonLd.tsx` + per-page schemas (WebApplication, BreadcrumbList, Article) |
| Sitemap | `public/sitemap.xml` lists all 50+ pages on the subdomain |
| robots.txt | `public/robots.txt` references the sitemap and allows crawl |
| Pre-hydration content | `index.html` ships H1, intro, FAQ, and `<noscript>` fallback inside `#root` so crawlers index content before React boots |
| Internal links | All routes use `react-router` `<Link>` + central `ROUTES` table |
| Legacy URLs | Old `/app/body-recomp/...`, `/tools/...`, `/plans/...` paths 301-redirect to the new SEO-optimized paths |

## 4. Quick QA after deploy

1. `https://fitness-plan.gearuptofit.com/` — homepage loads.
2. Navigate to a calculator — URL becomes
   `/free-fitness-calculators/tdee-calculator`, page renders.
3. Refresh that deep URL — must still render (Lovable hosting handles SPA
   fallback automatically).
4. View source — confirm
   `<link rel="canonical" href="https://fitness-plan.gearuptofit.com/...">`.
5. Run the page through Google's Rich Results Test — JSON-LD validates.
