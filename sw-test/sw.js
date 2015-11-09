
$import('serviceworker-cache-polyfill.js');


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