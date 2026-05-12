# Hosting Body Recomp OS natively at `gearuptofit.com/fitness-plan/`

The canonical production URL is now:

**`https://gearuptofit.com/fitness-plan/`**

Every canonical, Open Graph, Twitter, JSON-LD, sitemap, and robots reference in this app points to the WordPress path — not the `fitness-plan.gearuptofit.com` subdomain.

---

## 1. Required WordPress hosting model

Use a native WordPress path/reverse-proxy setup so the app is served from:

```txt
https://gearuptofit.com/fitness-plan/
```

Do **not** use the subdomain as the public canonical destination.
If `https://fitness-plan.gearuptofit.com/` already exists, configure it as a source/origin only or redirect it permanently to the WordPress path.

## 2. App base path

The app ships with:

```html
<base href="/fitness-plan/" />
```

React Router reads that base path, so internal routes become:

```txt
https://gearuptofit.com/fitness-plan/build-my-plan
https://gearuptofit.com/fitness-plan/free-fitness-calculators
https://gearuptofit.com/fitness-plan/workout-plans
```

The same build still works in Lovable preview because the router falls back to `/` when the current host is not actually mounted under `/fitness-plan/`.

## 3. SEO guarantees baked into the build

| Concern | Implementation |
|---|---|
| Canonical URLs | `SEOHead.tsx` resolves every route under `https://gearuptofit.com/fitness-plan/` |
| OG / Twitter cards | `index.html` and runtime meta tags point to the WordPress path |
| Structured data | WebApplication, BreadcrumbList, Article, FAQ, and HowTo URLs point to the WordPress path |
| Sitemap | `public/sitemap.xml` lists pages under `https://gearuptofit.com/fitness-plan/` |
| robots.txt | `public/robots.txt` references `https://gearuptofit.com/fitness-plan/sitemap.xml` |
| Pre-hydration content | `index.html` includes H1, intro, FAQ, and `<noscript>` fallback before React boots |
| Internal routes | All in-app links remain relative, so they inherit `/fitness-plan/` automatically |

## 4. Server-level redirect required for old subdomain

To consolidate authority, redirect the old subdomain to the native WordPress URL with a permanent 301:

```txt
https://fitness-plan.gearuptofit.com/* → https://gearuptofit.com/fitness-plan/$1
```

This redirect must be configured in DNS/CDN/hosting or WordPress server rules, because JavaScript cannot issue a true server-side 301.

## 5. Quick QA after deploy

1. Open `https://gearuptofit.com/fitness-plan/` — homepage loads.
2. Navigate to a calculator — URL becomes `/fitness-plan/free-fitness-calculators/tdee-calculator`.
3. Refresh that deep URL — the same page still renders.
4. View source — canonical is `https://gearuptofit.com/fitness-plan/...`.
5. Rich Results Test validates JSON-LD URLs under the WordPress path.
6. Open `https://fitness-plan.gearuptofit.com/` — it 301-redirects to `https://gearuptofit.com/fitness-plan/`.
