const CACHE_NAME = 'mmm-myteams-leaguetable-cache-v1';
const ASSETS_TO_CACHE = [
    './MMM-MyTeams-LeagueTable.js',
    './MMM-MyTeams-LeagueTable-Base.css',
    './MMM-MyTeams-LeagueTable-Fixtures.css',
    './MMM-MyTeams-LeagueTable-National.css',
    './MMM-MyTeams-LeagueTable-UEFA.css',
    './MMM-MyTeams-LeagueTable-WorldCup.css',
    './european-leagues.js'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName !== CACHE_NAME;
                }).map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only intercept requests for this module's assets or data
    const url = new URL(event.request.url);
    
    // Check if it's a request we want to cache (static assets or our specific API calls)
    if (ASSETS_TO_CACHE.some(asset => event.request.url.endsWith(asset)) || 
        event.request.url.includes('translations/') || 
        event.request.url.includes('images/')) {
        
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((fetchResponse) => {
                    if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                        return fetchResponse;
                    }
                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return fetchResponse;
                });
            })
        );
    }
});
