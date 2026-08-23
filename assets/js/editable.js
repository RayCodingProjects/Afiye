/* Every span with class "ed" becomes a click-to-edit field.
   Empty ones show their placeholder in blue, so open questions stand out. */
window.Camp = window.Camp || {};

Camp.editable = (function () {
  "use strict";

  function flagEmpty(field) {
    field.classList.toggle("empty", field.textContent.trim() === "");
  }

  function wire(field) {
    var key = field.getAttribute("data-key");
    var state = Camp.store.state;

    field.setAttribute("contenteditable", "plaintext-only");
    field.setAttribute("role", "textbox");
    field.setAttribute("spellcheck", "false");
    field.setAttribute("tabindex", "0");

    if (typeof state.fields[key] === "string") field.textContent = state.fields[key];
    flagEmpty(field);

    field.addEventListener("input", function () {
      state.fields[key] = field.textContent.trim();
      flagEmpty(field);
      Camp.store.save();
    });

    field.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        field.blur();
      }
    });
  }

  function init() {
    Camp.dom.all(".ed").forEach(wire);
  }

  return { init: init };
})();
