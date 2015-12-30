
'use strict';

// Via https://github.com/coonsta/cache-polyfill/blob/master/dist/serviceworker-cache-polyfill.js
// Adds in some functionality missing in Chrome 40.

if (!Cache.prototype.add) {
    Cache.prototype.add = function add(request) {
        return this.addAll([request]);
    };
}

if (!Cache.prototype.addAll) {
    Cache.prototype.addAll = function addAll(requests) {
        var cache = this;

        // Since DOMExceptions are not constructable:
        function NetworkError(message) {
            this.name = 'NetworkError';
            this.code = 19;
            this.message = message;
        }
        NetworkError.prototype = Object.create(Error.prototype);

        return Promise.resolve().then(function() {
            if (arguments.length < 1) throw new TypeError();

            // Simulate sequence<(Request or USVString)> binding:
            var sequence = [];

            requests = requests.map(function(request) {
                if (request instanceof Request) {
                    return request;
                }
                else {
                    return String(request); // may throw TypeError
                }
            });

            return Promise.all(
                requests.map(function(request) {
                    if (typeof request === 'string') {
                        request = new Request(request);
                    }

                    var scheme = new URL(request.url).protocol;

                    if (scheme !== 'http:' && scheme !== 'https:') {
                        throw new NetworkError("Invalid scheme");
                    }

                    return fetch(request.clone());
                })
            );
        }).then(function(responses) {
            // TODO: check that requests don't overwrite one another
            // (don't think this is possible to polyfill due to opaque responses)
            return Promise.all(
                responses.map(function(response, i) {
                    return cache.put(requests[i], response);
                })
            );
        }).then(function() {
            return undefined;
        });
    };
}

if (!CacheStorage.prototype.match) {
    // This is probably vulnerable to race conditions (removing caches etc)
    CacheStorage.prototype.match = function match(request, opts) {
        var caches = this;

        return this.keys().then(function(cacheNames) {
            var match;

            return cacheNames.reduce(function(chain, cacheName) {
                return chain.then(function() {
                    return match || caches.open(cacheName).then(function(cache) {

                            if(opts) {
                                return cache.match(request, opts);
                            } else {
                                return cache.match(request);
                            }

                        }).then(function(response) {
                            match = response;
                            return match;
                        });
                });
            }, Promise.resolve());
        });
    };
}


//////////////////////////////////////////////////////////////

var CURRENT_CACHES = "CURRENT_CACHES";


self.addEventListener('activate', function(e) {
  console.log('Activate event:' + e);
});



self.addEventListener('install', function(event) {
  
  console.log("sw install");
  
  var urlsToPrefetch = [
    'images/img.jpg'
  ];

  console.log('Handling install event Resources to pre-fetch:' +  urlsToPrefetch);


  event.waitUntil(

    caches.open(CURRENT_CACHES).then(function(cache) {
        
	var cachePromises = urlsToPrefetch.map(function(urlToPrefetch) {
		
        var url = new URL(urlToPrefetch, location.href);
        
		console.log("fetch url:" + url);
		
        return fetch(new Request(url, {mode: 'no-cors'})).then(function(response) {
		
		  console.log("fetch response:" + response.status);  
		
          if (response.status >= 400) {
            throw new Error('request for ' + urlToPrefetch +
              ' failed with status ' + response.statusText);
          }

          return cache.put(urlToPrefetch, response);
		  
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

/*
self.addEventListener('fetch', function(event) {

  console.log('fetch event for ' + event.request.url);

  event.respondWith(   
	
	fetch(event.request).then(function(response) {
        console.log('Response from network is:' + response);			
        return response;
	})
	
  );  
});
*/



self.addEventListener('fetch', function(event) {

    console.log('Handling fetch event for£º'+ event.request.url);

    event.respondWith(

        caches.match(event.request).then(function(response) {
            if (response) {
                console.log('Found response in cache:'+ response);
                return response;
            }

            console.log('No response found in cache. About to fetch from network...');


            return fetch(event.request).then(function(response) {

                console.log('Response from network is:' + response);
                return response;

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
