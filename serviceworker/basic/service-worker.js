'use strict';

self.addEventListener('activate', function(e) {
  console.log('Activate event:' + e);
});

self.addEventListener('install', function(event) {
  
  console.log('serviceworker install'); 
});

self.addEventListener('fetch', function(event) {

//self.onfetch = function(event) {
  console.log('got a request');

  var salutation = 'Hello, ';
  var whom = decodeURIComponent(event.request.url.match(/\/([^/]*)$/)[1]);
  var energyLevel = (whom == 'Cleveland') ? '!!!' : '!';
  var version = '\n\n(Version 1)';

  var body = new Blob([salutation, whom, energyLevel, version]);

  event.respondWith(new Response(body));
});
