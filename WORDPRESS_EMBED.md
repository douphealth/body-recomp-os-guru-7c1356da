# Body Recomp OS — native WordPress URL deployment

Canonical public URL:

```txt
https://gearuptofit.com/fitness-plan/
```

Retired URL that must **not** serve the app publicly:

```txt
https://fitness-plan.gearuptofit.com/
```

## What is actually required

The app cannot turn a live subdomain into a WordPress subfolder by code alone. The browser is currently showing the subdomain because DNS/Cloudflare/hosting still routes that hostname to an old Lovable deployment.

To match the working RunMatch AI setup, deploy the Cloudflare Worker in `cloudflare/worker.js` and attach these two routes:

```txt
gearuptofit.com/fitness-plan*
fitness-plan.gearuptofit.com/*
```

The Worker does two enterprise-critical things:

1. Proxies the Lovable app origin from `https://body-recomp-os-guru.lovable.app` into `https://gearuptofit.com/fitness-plan/`.
2. Sends a real server-side `301` from `https://fitness-plan.gearuptofit.com/*` to `https://gearuptofit.com/fitness-plan/*`.

## Cloudflare setup

Use the included Worker files:

```txt
cloudflare/worker.js
cloudflare/wrangler.toml
```

Expected routes in Cloudflare:

| Route | Behavior |
|---|---|
| `gearuptofit.com/fitness-plan*` | Serve the app natively under the WordPress domain path |
| `fitness-plan.gearuptofit.com/*` | 301 redirect to `https://gearuptofit.com/fitness-plan/` |

## WordPress setup

Create or keep the WordPress page at:

```txt
https://gearuptofit.com/fitness-plan/
```

Then let Cloudflare Worker handle that route before WordPress. This is the same architecture as the RunMatch AI `/shoe-match/` app: the final URL remains on `gearuptofit.com`, preserving SEO link equity, AEO/GEO visibility, AI citations, SERP authority, and organic traffic signals.

## QA after deployment

Run these checks after publishing and deploying the Worker:

```bash
curl -I https://fitness-plan.gearuptofit.com/
curl -I https://gearuptofit.com/fitness-plan/
curl -I https://gearuptofit.com/fitness-plan/build-my-plan
```

Expected results:

1. `https://fitness-plan.gearuptofit.com/` returns `301`.
2. `Location` points to `https://gearuptofit.com/fitness-plan/`.
3. `https://gearuptofit.com/fitness-plan/` returns `200` and renders Body Recomp OS.
4. Page source canonical/OG/JSON-LD URLs point to `https://gearuptofit.com/fitness-plan/`.
5. Deep routes like `/fitness-plan/free-fitness-calculators/tdee-calculator` refresh correctly.
