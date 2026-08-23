/* Starts everything, in the order the modules depend on each other. */
(function () {
  "use strict";

  /* Saved ticks and notes first — the rest read from them. */
  Camp.store.init();

  Camp.auth.init();
  Camp.reveal.init();

  /* The page is hidden while the gate is up, so nothing can scroll into view.
     Ask reveal to look again the moment someone signs in. */
  Camp.auth.onUnlock.push(Camp.reveal.recheck);

  Camp.maps.init();
  Camp.weather.init();
  Camp.checklist.init();
  Camp.editable.init();
})();
