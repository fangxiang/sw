
'use strict';

//////////////////////////////////////////////////////////////

var CURRENT_CACHES = "CURRENT_CACHES";


self.addEventListener('activate', function(e) {


  console.log('Activate event:' + e);
  
  
  self.clients.getAll().then(function(clients) {
  
        console.log("In activate sw clients:" + clients.length);
  
        clients.forEach(function(client) {
            console.log("In activate postMessage:" + client);
            client.postMessage('Begin fetch');
        });
  });
	
});



self.addEventListener('install', function(event) {
  
  console.log("sw install:" + self.clients);
  
  var urlsToPrefetch = [
    'images/img.jpg', 'index.html'
  ];
  
  self.clients.getAll().then(function(clients) {
  
     console.log("sw clients:" + clients.length);
  
     clients.forEach(function(client) {
        console.log("postMessage:" + client);
        client.postMessage('The service worker updated.');
     });
  });
  
  
  console.log('Handling install event Resources to pre-fetch:'+ urlsToPrefetch);
  
  event.waitUntil(

    caches.open(CURRENT_CACHES).then(function(cache) {
        
	var cachePromises = urlsToPrefetch.map(function(urlToPrefetch) {

		console.log("fetch url: " + urlToPrefetch);

        var  url = '/sw/' + urlToPrefetch;
        var request = new Request(url, { host : 'fangxiang.github.io', localUrl : urlToPrefetch});

        return fetch(request).then(function(response) {
		
		  console.log("fetch response:" + response.status);  
		
          if (response.status >= 400) {
            throw new Error('request for ' + urlToPrefetch +   ' failed with status ' + response.statusText);
          }

          return cache.put(request, response);
		  
        }).catch(function(error) {
          console.error('Not caching ' + urlToPrefetch + ' due to ' + error);
        });
      });

      return Promise.all(cachePromises).then(function() {
        console.log('Pre-fetching complete.');
      });
	  
    }).catch(function(error) {
        console.error('Pre-fetching failed:', error);
    })
  );

});


self.addEventListener('fetch', function(event) {

    console.log('aaaHandling fetch event for:'+ event.request.url);

  
    event.respondWith(

        caches.open(CURRENT_CACHES).then(function(cache) {

            console.log('load from cache:' + event.request.url);

            return cache.match(event.request.url).then(function(response) {

                if(response != null) {
                    return response;
                }

                return fetch(event.request).then(function(response) {

                    console.log('Response from network is:' + response);
                    return cache.put(request, response);

                }).catch(function(error) {

                    console.error('Fetching failed:' + error);
                    throw error;
                });

            });
        })

    );
});

