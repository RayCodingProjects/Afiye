/* The sign-in gate.
   This is client-side only. The name and password sit in config.js, which
   anyone can open in a text editor, and the page itself is a plain file on
   disk. Treat it as a doorstep that keeps the page tidy — not as security. */
window.Camp = window.Camp || {};

Camp.auth = (function () {
  "use strict";

  var gate, form, userField, passField, errBox;

  /* Other modules push callbacks here to run the moment the page is revealed. */
  var onUnlock = [];

  function locked() {
    return document.documentElement.className.indexOf("locked") !== -1;
  }

  function unlock() {
    document.documentElement.className =
      document.documentElement.className.replace(/\blocked\b/, "").trim();
    gate.hidden = true;
    try {
      window.sessionStorage.setItem(Camp.config.sessionKey, "yes");
    } catch (e) { /* nothing to do */ }
    onUnlock.forEach(function (fn) { fn(); });
  }

  function signOut() {
    try {
      window.sessionStorage.removeItem(Camp.config.sessionKey);
    } catch (e) { /* nothing to do */ }
    document.documentElement.className += " locked";
    gate.hidden = false;
    passField.value = "";
    errBox.hidden = true;
    window.scrollTo(0, 0);
    userField.focus();
  }

  function attempt(e) {
    e.preventDefault();
    var ok = userField.value.trim().toLowerCase() === Camp.config.user
      && passField.value === Camp.config.pass;

    if (ok) {
      errBox.hidden = true;
      unlock();
      return;
    }

    errBox.hidden = false;
    passField.value = "";
    passField.focus();
  }

  function init() {
    gate = Camp.dom.byId("gate");
    form = Camp.dom.byId("signin");
    userField = Camp.dom.byId("user");
    passField = Camp.dom.byId("pass");
    errBox = Camp.dom.byId("gateerr");

    if (locked()) {
      userField.focus();
    } else {
      gate.hidden = true;
    }

    form.addEventListener("submit", attempt);
    Camp.dom.byId("signout").addEventListener("click", signOut);
  }

  return { init: init, onUnlock: onUnlock, signOut: signOut };
})();
