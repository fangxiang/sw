
'use strict';


var OFFLINE_URL = 'images/img.jpg';
var OFFLINE_CACHE = 'CACHE';

self.addEventListener('activate', function(e) {
  console.log('Activate event:' + e);
});

self.addEventListener('install', function(event) {
  
  console.log('serviceworker install'); 
  
/*  
  var offlineRequest = new Request(OFFLINE_URL);
  event.waitUntil(
    fetch(offlineRequest).then(function(response) {
      return caches.open(OFFLINE_CACHE).then(function(cache) {
	     console.log('Offline cached' + offlineRequest.url); 
        return cache.put(offlineRequest, response);
      });
    })
  );    
*/
});


self.addEventListener('fetch', function(event) {

  console.log('fetch event for ' + event.request.url);

  // We only want to call event.respondWith() if this is a GET request for an HTML document.
  if (event.request.method === 'GET'>=0)) {
	  
    console.log('Handling fetch event for ' + event.request.url);
	
	fetch(event.request).then(function(response) {
		
		caches.open(OFFLINE_CACHE).then(function(cache) {
	       cache.put(event.request.url, response);
        });
	    
		event.respondWith(response);
		
    }).catch(function(error) {
        
        /*		
		caches.open(OFFLINE_CACHE).then(function(cache) {
         
		    event.respondWith(cache.match(event.request.url));
			 
        });
		*/
    });
  }
});

