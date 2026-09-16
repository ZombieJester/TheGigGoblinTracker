// Minimal service worker for The Gig Goblins Tracker.
// It only ever caches the app shell (this page itself), so the "Install
// app" prompt criteria are met on Android. It never caches Firestore data
// or the Firebase SDK, so you always see live, current data when online.
// Bump this version string any time you replace index.html so returning
// visitors pick up the new copy instead of a stale cached one.
var CACHE_NAME = 'gig-goblins-shell-v1';
var SHELL_URL = './';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  // Only handle navigation requests for the page shell itself.
  // Everything else (fonts, the Firebase SDK, Firestore calls) goes
  // straight to the network, untouched.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(SHELL_URL, copy); });
        return res;
      }).catch(function () {
        return caches.match(SHELL_URL);
      })
    );
  }
});
