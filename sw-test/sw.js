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
            return cache.match(request, opts);
          }).then(function(response) {
            match = response;
            return match;
          });
        });
      }, Promise.resolve());
    });
  };
}






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
  var response;
  var cachedResponse = caches.match(event.request).catch(function() {
    return fetch(event.request);
  }).then(function(r) {
    response = r;
    caches.open('v1').then(function(cache) {
      cache.put(event.request, response);
    });  
    return response.clone();
  }).catch(function() {
    return caches.match('/sw/sw-test/gallery/myLittleVader.jpg');
  });
});