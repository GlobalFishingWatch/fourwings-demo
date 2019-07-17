// workbox.core.skipWaiting()
// workbox.core.clientsClaim()

self.addEventListener('install', event => {
  console.log('install sw')
  // cleaning up old cahc values...

})

self.addEventListener('activate', event => {
  console.log('activate sw')
  console.log(self.clients)
  // self.clients.claim()

  const allClients = clients.matchAll({
    includeUncontrolled: true
  }).then((a) => {
    console.log(a)

  });
  
  // Claim control of clients right after activating
  // This allows 
  event.waitUntil(self.clients.claim().then(() => {
    console.log('Now ready to handle fetches?');
  }));
  console.log('Now ready to handle fetches!');
})



// workbox.routing.registerRoute(
//   new RegExp('https:.*min\.(css|js)'),
//   workbox.strategies.staleWhileRevalidate({
//     cacheName: 'cdn'
//   })
// )

self.importScripts('readTile.js');

self.addEventListener('fetch', (e) => {
  console.log('fetch intercepted:', e.request.url)
  if (e.request.url.match(/pbf$/) !== null) {
    e.respondWith(self.readTile(e.request));
  }
})

// workbox.precaching.precacheAndRoute(self.__precacheManifest || [])