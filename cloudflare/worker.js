/**
 * GearUpToFit Body Recomp OS — Native WordPress Path Reverse Proxy
 *
 * Public canonical route:
 *   https://gearuptofit.com/fitness-plan/
 *   https://gearuptofit.com/fitness-plan/*
 *
 * Lovable origin:
 *   https://body-recomp-os-guru.lovable.app
 *
 * Retired public host:
 *   https://fitness-plan.gearuptofit.com/*
 *
 * Purpose:
 * - Serve the Lovable app natively under the WordPress domain path.
 * - Keep SEO link equity, AI visibility, AEO/GEO citations, and SERP authority
 *   consolidated on gearuptofit.com/fitness-plan/.
 * - Permanently redirect the old subdomain with a real server-side 301.
 */

const ORIGIN = "https://body-recomp-os-guru.lovable.app";
const CANONICAL_HOST = "gearuptofit.com";
const RETIRED_HOST = "fitness-plan.gearuptofit.com";
const PREFIX = "/fitness-plan";
const ORIGIN_HOST = new URL(ORIGIN).host;

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-robots-tag": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
};

function canonicalUrl(url, path = "/") {
  const cleanPath = path === "/" ? "/" : `/${path.replace(/^\/+/, "")}`;
  return `https://${CANONICAL_HOST}${PREFIX}${cleanPath}${url.search}${url.hash}`;
}

function redirectRetiredHost(url) {
  const rawPath = url.pathname.replace(/^\/+/, "");
  const pathWithoutPrefix = rawPath.replace(/^fitness-plan\/?/, "");
  const destinationPath = pathWithoutPrefix ? `/${pathWithoutPrefix}` : "/";
  return Response.redirect(canonicalUrl(url, destinationPath), 301);
}

function toOriginPath(pathname) {
  if (pathname === PREFIX || pathname === `${PREFIX}/`) return "/";
  if (pathname.startsWith(`${PREFIX}/`)) return pathname.slice(PREFIX.length) || "/";
  return "/";
}

function cloneHeaders(headers) {
  const out = new Headers(headers);
  out.set("host", ORIGIN_HOST);
  out.set("x-forwarded-host", CANONICAL_HOST);
  out.set("x-forwarded-proto", "https");
  out.delete("cf-connecting-ip");
  out.delete("cf-ipcountry");
  out.delete("cf-ray");
  out.delete("cf-visitor");
  return out;
}

function withHeaders(response, extra = {}) {
  const headers = new Headers(response.headers);
  Object.entries({ ...SECURITY_HEADERS, ...extra }).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function rewritePathValue(value) {
  if (!value) return value;
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith(`${PREFIX}/`) &&
    value !== PREFIX
  ) {
    return `${PREFIX}${value}`;
  }
  if (value.startsWith(ORIGIN)) {
    return value.replace(ORIGIN, `https://${CANONICAL_HOST}${PREFIX}`);
  }
  return value;
}

class AttrRewriter {
  constructor(attr) {
    this.attr = attr;
  }

  element(el) {
    const value = el.getAttribute(this.attr);
    const next = rewritePathValue(value);
    if (next && next !== value) el.setAttribute(this.attr, next);
  }
}

class SrcsetRewriter {
  element(el) {
    const value = el.getAttribute("srcset");
    if (!value) return;
    const next = value
      .split(",")
      .map((part) => {
        const item = part.trim();
        if (!item) return item;
        const [assetUrl, ...rest] = item.split(/\s+/);
        return [rewritePathValue(assetUrl), ...rest].join(" ");
      })
      .join(", ");
    el.setAttribute("srcset", next);
  }
}

class HeadInjector {
  element(el) {
    el.prepend(
      `<base href="${PREFIX}/"><link rel="canonical" href="https://${CANONICAL_HOST}${PREFIX}/">`,
      { html: true },
    );
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname === RETIRED_HOST) {
      return redirectRetiredHost(url);
    }

    if (url.hostname !== CANONICAL_HOST || !url.pathname.startsWith(PREFIX)) {
      return new Response("Not found", { status: 404, headers: SECURITY_HEADERS });
    }

    const originPath = toOriginPath(url.pathname);
    const originUrl = `${ORIGIN}${originPath}${url.search}`;
    const originRequest = new Request(originUrl, {
      method: request.method,
      headers: cloneHeaders(request.headers),
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual",
    });

    const response = await fetch(originRequest);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        const nextLocation = new URL(location, originUrl);
        if (nextLocation.host === ORIGIN_HOST) {
          const headers = new Headers(response.headers);
          headers.set(
            "location",
            `https://${CANONICAL_HOST}${PREFIX}${nextLocation.pathname}${nextLocation.search}${nextLocation.hash}`,
          );
          return new Response(response.body, { status: response.status, headers });
        }
      }
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      return new HTMLRewriter()
        .on("head", new HeadInjector())
        .on("a", new AttrRewriter("href"))
        .on("link", new AttrRewriter("href"))
        .on("script", new AttrRewriter("src"))
        .on("img", new AttrRewriter("src"))
        .on("img", new SrcsetRewriter())
        .on("source", new AttrRewriter("src"))
        .on("source", new SrcsetRewriter())
        .on("video", new AttrRewriter("src"))
        .on("video", new AttrRewriter("poster"))
        .on("audio", new AttrRewriter("src"))
        .on("iframe", new AttrRewriter("src"))
        .on("form", new AttrRewriter("action"))
        .on("meta[property='og:url']", new AttrRewriter("content"))
        .on("meta[property='og:image']", new AttrRewriter("content"))
        .on("meta[name='twitter:image']", new AttrRewriter("content"))
        .transform(withHeaders(response, {
          "cache-control": "public, max-age=0, must-revalidate",
          "link": `<https://${CANONICAL_HOST}${PREFIX}/>; rel="canonical"`,
        }));
    }

    return withHeaders(response, {
      "cache-control": response.headers.get("cache-control") || "public, max-age=31536000, immutable",
    });
  },
};
