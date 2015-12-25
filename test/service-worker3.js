
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

  event.respondWith(

  
    return fetch(event.request).then(function(response) {
	  
        console.log('Response from network is:' + response);
		
		caches.open(OFFLINE_CACHE).then(function(cache) {
		    cache.put(event.request.url, response);
		});
		
        return response;
      
	  }).catch(function(error) {
	  
	    return caches.match(event.request.url).then(function(response) {
    
 	        if (response) {
			
               console.log('Found response in cache:'+ response);
               return response;
			   
            } else {
			
			    throw error;
			}
		});      
    })
	
  );
  
});

