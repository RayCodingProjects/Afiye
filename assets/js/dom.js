/* Two shorthands the other modules share. */
window.Camp = window.Camp || {};

Camp.dom = {
  byId: function (name) {
    return document.getElementById(name);
  },
  all: function (selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }
};
