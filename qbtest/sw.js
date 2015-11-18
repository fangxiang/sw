

importScripts('serviceworker-cache-polyfill.js');

this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/sw/sw-test/',
        '/sw/sw-test/index.html',
        '/sw/sw-test/style.css',
        '/sw/sw-test/app.js',
        '/sw/sw-test/image-list.js',
        '/sw/sw-test/star-wars-logo.jpg',
        '/sw/sw-test/gallery/',
        '/sw/sw-test/gallery/bountyHunters.jpg',
        '/sw/sw-test/gallery/myLittleVader.jpg',
        '/sw/sw-test/gallery/snowTroopers.jpg'
      ]);
    })
  );
});


this.addEventListener('fetch', function(event) {
  
    event.respondWith(caches.match(event.request).then(function(resp) {
    
    console.log("mactch event.request:" + event.request.url);
	
	 return resp;
  
  }).catch(function() {
  
    console.log("Not mactch event.request:" + event.request.url + " 1");
  
    return fetch(event.request).then(function(resp) {
	
	    return resp;
	
	}).catch(function() {
     
	    console.log("fetch error");
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
    });
	
  }));
    
  
});

