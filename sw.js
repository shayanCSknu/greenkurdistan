const CACHE_NAME = 'green-kurdistan-v8';
const APP_SHELL = ['./', 'index.html', 'weather.html', 'climate.html', 'actions.html', 'toolkit.html', 'impact.html', 'reports.html', 'css/style.css', 'css/reports.css', 'css/languages.css', 'css/history.css', 'js/app.js', 'js/reports.js', 'js/community-ui.js', 'js/report-translations.js', 'js/climate-history.js', 'js/site-runtime.js', 'js/site-translations.js', 'js/site-i18n.js', 'js/map.js', 'js/report-map.js', 'js/vendor/leaflet/leaflet.js', 'js/vendor/leaflet/leaflet.css', 'js/vendor/region-data.js', 'site.webmanifest', 'img/kurdistan-flag.svg', 'img/kurdistan-landscape.svg', 'icon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('green-kurdistan-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Never cache sessions, private submissions, photos or any API responses.
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())));
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    if (event.request.mode === 'navigate') return (await caches.match(new URL('index.html', self.registration.scope).href)) || Response.error();
    return Response.error();
  }));
});
