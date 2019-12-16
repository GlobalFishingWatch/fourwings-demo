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

// self.importScripts('readTile.js');

self.addEventListener('fetch', (e) => {
  console.log(/dummy/.test(e.request.url))
  // if (e.request.url.match(/pbf$/) !== null) {
    if (/dummy/.test(e.request.url) === true) {
      console.log('fetch intercepted:', e.request.url)

      const url = e.request.url.replace('http://dummy', 'http://34.69.224.29/v1/fishing/heatmap')
      const p = fetch(url)

      const p2 = p.then(f => {
        // console.log(f)
        return f.arrayBuffer().then(function(buffer) {
          // console.log('plp')
          // console.log(buffer)
          // do something with buffer
          return new Response(buffer, {
            status: f.status,
            statusText: f.statusText,
            headers: f.headers
          })
          
        });
        
      })

      e.respondWith(p2)
  }
})

// workbox.precaching.precacheAndRoute(self.__precacheManifest || [])
