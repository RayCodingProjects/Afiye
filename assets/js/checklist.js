/* The "what to bring" lists: ticking, adding, removing, and the progress bar. */
window.Camp = window.Camp || {};

Camp.checklist = (function () {
  "use strict";

  var groupsEl, fillEl, progressEl;
  var hidePacked = false;

  /* A group's live items: the ones from data.js that haven't been removed,
     followed by anything added in the browser. */
  function itemsFor(group) {
    var state = Camp.store.state;
    var removed = state.removed[group.id] || [];
    var out = [];

    group.items.forEach(function (pair, i) {
      var itemId = group.id + "." + i;
      if (removed.indexOf(itemId) === -1) {
        out.push({ id: itemId, text: pair[0], note: pair[1] });
      }
    });
    (state.custom[group.id] || []).forEach(function (entry) {
      out.push({ id: entry.id, text: entry.text, note: "", custom: true });
    });

    return out;
  }

  function afterChange() {
    Camp.store.save();
    render();
    refreshTotals();
  }

  function buildItem(group, it) {
    var state = Camp.store.state;

    var li = document.createElement("li");
    li.className = "item" + (state.checked[it.id] ? " checked" : "");

    var chk = document.createElement("input");
    chk.type = "checkbox";
    chk.id = "chk-" + it.id;
    chk.checked = !!state.checked[it.id];
    chk.addEventListener("change", function () {
      if (chk.checked) state.checked[it.id] = true;
      else delete state.checked[it.id];
      afterChange();
    });

    var label = document.createElement("label");
    label.htmlFor = chk.id;
    label.appendChild(document.createTextNode(it.text));
    if (it.note) {
      var qty = document.createElement("span");
      qty.className = "qty";
      qty.textContent = " — " + it.note;
      label.appendChild(qty);
    }

    var kill = document.createElement("button");
    kill.type = "button";
    kill.className = "kill noprint";
    kill.textContent = "×";
    kill.title = "Remove this item";
    kill.setAttribute("aria-label", "Remove " + it.text);
    kill.addEventListener("click", function () {
      if (it.custom) {
        state.custom[group.id] = (state.custom[group.id] || []).filter(function (e) {
          return e.id !== it.id;
        });
      } else {
        state.removed[group.id] = (state.removed[group.id] || []).concat(it.id);
      }
      delete state.checked[it.id];
      afterChange();
    });

    li.appendChild(chk);
    li.appendChild(label);
    li.appendChild(kill);
    return li;
  }

  function buildAdder(group) {
    var form = document.createElement("form");
    form.className = "adder noprint";

    var input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Add something…";
    input.setAttribute("aria-label", "Add an item to " + group.name);
    input.dataset.group = group.id;

    var add = document.createElement("button");
    add.type = "submit";
    add.className = "btn";
    add.textContent = "Add";

    form.appendChild(input);
    form.appendChild(add);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;

      var state = Camp.store.state;
      state.custom[group.id] = (state.custom[group.id] || []).concat({
        id: group.id + ".x" + Date.now().toString(36),
        text: text
      });
      afterChange();

      /* render() rebuilt the DOM, so find the fresh input and keep typing. */
      var again = groupsEl.querySelector('.adder input[data-group="' + group.id + '"]');
      if (again) again.focus();
    });

    return form;
  }

  function buildGroup(group) {
    var state = Camp.store.state;
    var all = itemsFor(group);
    var done = all.filter(function (it) { return state.checked[it.id]; }).length;
    var shown = hidePacked ? all.filter(function (it) { return !state.checked[it.id]; }) : all;

    var box = document.createElement("section");

    var h3 = document.createElement("h3");
    h3.appendChild(document.createTextNode(group.name + " "));
    var count = document.createElement("span");
    count.className = "count" + (all.length && done === all.length ? " done" : "");
    count.textContent = done + " of " + all.length;
    h3.appendChild(count);
    box.appendChild(h3);

    var list = document.createElement("ul");
    list.className = "checklist";

    if (!shown.length) {
      var empty = document.createElement("li");
      empty.className = "allclear";
      empty.textContent = all.length ? "All packed." : "Nothing in this list.";
      list.appendChild(empty);
    }

    shown.forEach(function (it) {
      list.appendChild(buildItem(group, it));
    });

    box.appendChild(list);
    box.appendChild(buildAdder(group));
    return box;
  }

  function render() {
    groupsEl.textContent = "";
    Camp.data.groups.forEach(function (group) {
      groupsEl.appendChild(buildGroup(group));
    });
  }

  function refreshTotals() {
    var state = Camp.store.state;
    var total = 0, done = 0;

    Camp.data.groups.forEach(function (group) {
      itemsFor(group).forEach(function (it) {
        total++;
        if (state.checked[it.id]) done++;
      });
    });

    var pct = total ? Math.round((done / total) * 100) : 0;
    fillEl.style.width = pct + "%";
    progressEl.textContent = (done === total && total)
      ? "All " + total + " packed"
      : done + " of " + total + " packed · " + (total - done) + " to go";
  }

  function init() {
    groupsEl = Camp.dom.byId("groups");
    fillEl = Camp.dom.byId("fill");
    progressEl = Camp.dom.byId("progress");

    Camp.dom.byId("filter").addEventListener("click", function () {
      hidePacked = !hidePacked;
      this.setAttribute("aria-pressed", String(hidePacked));
      this.textContent = hidePacked ? "Show everything" : "Hide what's packed";
      render();
    });

    Camp.dom.byId("reset").addEventListener("click", function () {
      Camp.store.state.checked = {};
      afterChange();
    });

    render();
    refreshTotals();
  }

  return { init: init, render: render, refreshTotals: refreshTotals };
})();
