
'use strict';


var OFFLINE_CACHE = 'offline';
var OFFLINE_URL = 'offline.html';


self.addEventListener('activate', function(e) {
  console.log('Activate event:' + e);
});

self.addEventListener('install', function(event) {
  
  console.log('serviceworker install'); 
});


self.addEventListener('fetch', function(event) {

  console.log('fetch event for ' + event.request.url);

  event.respondWith(   
	
	fetch(event.request).then(function(response) {
        console.log('Response from network is:' + response);			
        return response;
	})
	
  );  
});



/*
self.addEventListener('fetch', function(event) {

    console.log('fetch event for ' + event.request.url);
 
    event.respondWith(
      fetch(event.request).catch(function(e) {

  	    console.log('Fetch failed; returning offline page instead.' + e);
		
        return caches.open(OFFLINE_CACHE).then(function(cache) {
          return cache.match(OFFLINE_URL);
        });
      })
    );
 
});
*/


