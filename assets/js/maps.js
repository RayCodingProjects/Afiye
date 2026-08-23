/* Points the embedded map and every "open in Maps" link at the camp,
   and the trail links at the reserve entrance. */
window.Camp = window.Camp || {};

Camp.maps = (function () {
  "use strict";

  function init() {
    var site = encodeURIComponent(Camp.config.site.query);
    var trail = encodeURIComponent(Camp.config.trail);

    var mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + site;
    var dirUrl = "https://www.google.com/maps/dir/?api=1&destination=" + site;
    var trailUrl = "https://www.google.com/maps/search/?api=1&query=" + trail;

    Camp.dom.byId("map").src =
      "https://maps.google.com/maps?q=" + site + "&z=13&hl=en&output=embed";

    Camp.dom.byId("openApp").href = mapsUrl;
    Camp.dom.byId("openDir").href = dirUrl;
    Camp.dom.byId("trailMap").href = trailUrl;
    Camp.dom.byId("footMap").href = mapsUrl;
    Camp.dom.byId("footDir").href = dirUrl;
    Camp.dom.byId("footTrail").href = trailUrl;
  }

  return { init: init };
})();
