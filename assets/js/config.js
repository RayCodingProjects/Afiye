/* Every setting for the trip lives here. Change the trip, change this file. */
window.Camp = window.Camp || {};

Camp.config = {
  /* Bump storageKey when the packing list changes shape, so old ticks
     can't land on the wrong items. */
  storageKey: "camp.v6",
  sessionKey: "camp.signedin",

  /* Sign-in. This is a doorstep, not a lock — the values sit in a file
     anyone can open. Never put a real password here. */
  user: "ray",
  pass: "1234",

  /* Fixed destination. Coordinates are Yahchouch village (34°3'59"N, 35°44'11"E),
     hardcoded so the weather never depends on a place-name lookup. */
  site: {
    query: "The Cliff Camp, Yahchouch, Lebanon",
    lat: 34.0664,
    lon: 35.7364
  },
  trail: "Jabal Moussa Chouwan Entrance, Lebanon",

  tripDays: ["2026-08-24", "2026-08-25"]
};
