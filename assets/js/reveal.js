/* Sections fade and lift into place as you scroll to them, once each. */
window.Camp = window.Camp || {};

Camp.reveal = (function () {
  "use strict";

  var panels = [];
  var seer = null;

  function show(entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      seer.unobserve(entry.target);
    });
  }

  /* While the gate is up the page is display:none, so nothing can intersect.
     Re-observe once it's dismissed, so the sections already on screen reveal. */
  function recheck() {
    if (!seer) return;
    panels.forEach(function (p) {
      if (p.classList.contains("in")) return;
      seer.unobserve(p);
      seer.observe(p);
    });
  }

  function init() {
    panels = Camp.dom.all(".reveal");

    if (!window.IntersectionObserver) {
      panels.forEach(function (p) { p.classList.add("in"); });
      return;
    }

    seer = new IntersectionObserver(show, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.06
    });
    panels.forEach(function (p) { seer.observe(p); });
  }

  return { init: init, recheck: recheck };
})();
