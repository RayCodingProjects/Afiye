/* Everything anyone ticks or types, kept in this browser's localStorage.
   Nothing leaves the machine. */
window.Camp = window.Camp || {};

Camp.store = (function () {
  "use strict";

  /* Held as one object so other modules can read Camp.store.state directly. */
  var state = { checked: {}, custom: {}, removed: {}, fields: {}, units: "c" };
  var savedNote = null;

  function load() {
    try {
      var raw = window.localStorage.getItem(Camp.config.storageKey);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      ["checked", "custom", "removed", "fields"].forEach(function (k) {
        if (parsed && parsed[k] && typeof parsed[k] === "object") state[k] = parsed[k];
      });
      if (parsed && (parsed.units === "c" || parsed.units === "f")) state.units = parsed.units;
    } catch (e) {
      /* some browsers block storage for local files */
    }
  }

  function save() {
    try {
      window.localStorage.setItem(Camp.config.storageKey, JSON.stringify(state));
      if (savedNote) {
        savedNote.textContent = "Saved at "
          + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          + " — in this browser only.";
      }
    } catch (e) {
      if (savedNote) {
        savedNote.textContent = "Not saving — this browser blocks storage for local files.";
      }
    }
  }

  function init() {
    savedNote = Camp.dom.byId("saved");
    load();
  }

  return { state: state, init: init, save: save };
})();
