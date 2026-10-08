/* Ocean Forest invoice service worker: offline after first visit (also from Home Screen). */
var CACHE='of-invoice-aad04d85ac';
var ASSETS=['./','index.html','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png','icon-maskable-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k.indexOf('of-invoice-')===0&&k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  var isPage=req.mode==='navigate';
  /* Pages: network first (get updates when online), fall back to cache offline. Assets: cache first. */
  if(isPage){
    e.respondWith(fetch(req).then(function(res){
      if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put('index.html',copy);});}
      return res;
    }).catch(function(){
      return caches.match(req,{ignoreSearch:true}).then(function(r){return r||caches.match('index.html');});
    }));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(r){
    return r||fetch(req).then(function(res){
      if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return res;
    });
  }));
});
