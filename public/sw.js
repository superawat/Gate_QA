const SW_VERSION = "gateqa-sw-v1";
const CORE_CACHE = `${SW_VERSION}-core`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;

const getBaseUrl = () => {
  const scope = self.registration?.scope || self.location.origin;
  return scope.endsWith("/") ? scope : `${scope}/`;
};

const buildUrl = (relativePath = "") => new URL(relativePath, getBaseUrl()).toString();

const extractAssetUrlsFromHtml = (html = "") => {
  const matches = [];
  const pattern = /<(?:script|link|img)\b[^>]+(?:src|href)=["']([^"']+)["']/gi;

  for (const match of html.matchAll(pattern)) {
    const rawUrl = String(match[1] || "").trim();
    if (!rawUrl || rawUrl.startsWith("http") || rawUrl.startsWith("data:")) {
      continue;
    }
    matches.push(buildUrl(rawUrl));
  }

  return Array.from(new Set(matches));
};

const shouldRuntimeCache = (url) => {
  if (url.origin !== self.location.origin) {
    return false;
  }

  return [
    "/question-bank-manifest.json",
    "/question-search-index.json",
    "/mock_catalog_v1.json",
    "/question-detail-shards/",
    "/data/answers/",
    ".js",
    ".css",
    ".png",
    ".svg",
    ".woff",
    ".woff2",
  ].some((token) => url.pathname.includes(token));
};

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    const baseUrl = getBaseUrl();
    const coreUrls = [
      baseUrl,
      buildUrl("index.html"),
      buildUrl("offline.html"),
      buildUrl("manifest.webmanifest"),
      buildUrl("question-bank-manifest.json"),
      buildUrl("logo.png"),
    ];

    try {
      const shellResponse = await fetch(baseUrl, { cache: "no-store" });
      if (shellResponse.ok) {
        await cache.put(baseUrl, shellResponse.clone());
        const html = await shellResponse.text();
        const assetUrls = extractAssetUrlsFromHtml(html);
        await cache.addAll(assetUrls);
      }
    } catch {
      // Fall back to static core URLs below.
    }

    await cache.addAll(coreUrls);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => ![CORE_CACHE, RUNTIME_CACHE].includes(cacheName))
        .map((cacheName) => caches.delete(cacheName))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CORE_CACHE);

      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          await cache.put(buildUrl("index.html"), networkResponse.clone());
        }
        return networkResponse;
      } catch {
        const cachedShell = await cache.match(buildUrl("index.html")) || await cache.match(getBaseUrl());
        if (cachedShell) {
          return cachedShell;
        }
        return cache.match(buildUrl("offline.html"));
      }
    })());
    return;
  }

  if (!shouldRuntimeCache(requestUrl)) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      void fetch(request)
        .then((response) => {
          if (response?.ok) {
            return cache.put(request, response.clone());
          }
          return null;
        })
        .catch(() => null);
      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse?.ok) {
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch {
      return cachedResponse || Response.error();
    }
  })());
});
