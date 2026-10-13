const VERSION='kitty-quest-galaxy-progression-v4';
const ASSETS=['./','./index.html','./manifest.webmanifest','./src/app.js','./src/core.js','./src/storage.js','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('kitty-quest-galaxy-')&&key!==VERSION)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{const cache=await caches.open(VERSION);const hit=await cache.match(event.request,{ignoreSearch:true});if(hit)return hit;try{return await fetch(event.request);}catch(error){if(event.request.mode==='navigate')return cache.match(new URL('index.html',self.registration.scope));throw error;}})());
});
