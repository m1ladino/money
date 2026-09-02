/* Omogućava da se aplikacija otvori i kad nema interneta. */
var KES = "moja-zarada-v1";
var FAJLOVI = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "ikona-180.png",
  "ikona-192.png",
  "ikona-512.png",
  "ikona-apple.png"
];

self.addEventListener("install", function(dogadjaj){
  dogadjaj.waitUntil(
    caches.open(KES).then(function(kes){ return kes.addAll(FAJLOVI); }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(dogadjaj){
  dogadjaj.waitUntil(
    caches.keys().then(function(imena){
      return Promise.all(imena.map(function(ime){
        return ime === KES ? null : caches["delete"](ime);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(dogadjaj){
  var zahtev = dogadjaj.request;
  if(zahtev.method !== "GET"){ return; }
  if(new URL(zahtev.url).origin !== self.location.origin){ return; }

  dogadjaj.respondWith(
    caches.match(zahtev).then(function(izKesa){
      var samreze = fetch(zahtev).then(function(odgovor){
        if(odgovor && odgovor.status === 200){
          var kopija = odgovor.clone();
          caches.open(KES).then(function(kes){ kes.put(zahtev, kopija); });
        }
        return odgovor;
      })["catch"](function(){
        return izKesa || caches.match("index.html");
      });
      return izKesa || samreze;
    })
  );
});
