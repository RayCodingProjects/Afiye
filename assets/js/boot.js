/* Runs in <head>, before the page paints.
   Marks the document as scripted (so sections start hidden, ready to reveal,
   with no flash) and locks it until sign-in. */
(function () {
  "use strict";

  document.documentElement.className += " js";

  try {
    if (window.sessionStorage.getItem("camp.signedin") !== "yes") {
      document.documentElement.className += " locked";
    }
  } catch (e) {
    document.documentElement.className += " locked";
  }
})();
