
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
    
    caches.match(event.request).then(function(response) {
    
 	  if (response) {
        console.log('Found response in cache:'+ response);
        return response;
      }

      console.log('No response found in cache. About to fetch from network...');

      return fetch(event.request).then(function(response) {
	  
        console.log('Response from network is:' + response);
		
		if (response.status < 400) {		
		    caches.open(OFFLINE_CACHE).then(function(cache) {
		        return cache.put(event.request, response);
		    });  
        }
			
        return response.clone();
      
	  }).catch(function(error) {
        // This catch() will handle exceptions thrown from the fetch() operation.
        // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
        // It will return a normal response object that has the appropriate error code set.
        console.error('Fetching failed:' + error);

        throw error;
      });
    })
  );
  
});


