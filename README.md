# Camping plan — The Cliff Camp, Yahchouch

A single-page trip plan: map, live weather, the two-day itinerary, the hike, and
a packing list that remembers what you've ticked.

Open `index.html` in a browser. No build step, no server, no install.

## Where things live

```
index.html              the page itself — markup only
assets/css/
  tokens.css            colours for light and dark themes
  base.css              reset, body, links, headings
  layout.css            sections, scroll reveal, notices, footer
  auth.css              the sign-in gate
  weather.css           the "right now" infobox
  content.css           contents box, map, tables, lists, checklists
  responsive.css        small screens, printing, reduced motion
assets/js/
  boot.js               runs in <head>: locks the page before it paints
  config.js             trip settings — dates, coordinates, sign-in
  data.js               the packing list
  dom.js                two small helpers
  store.js              saving to this browser
  auth.js               the sign-in gate
  reveal.js             sections fading in as you scroll
  maps.js               map embed and the "open in Maps" links
  weather.js            live forecast from Open-Meteo
  checklist.js          ticking, adding and removing items
  editable.js           the click-to-edit fields
  app.js                starts the modules in order
index.original.html     the old single-file version, kept as a fallback
```

## Changing things

- **Dates, coordinates, sign-in** — `assets/js/config.js`
- **The packing list** — `assets/js/data.js`. Bump `storageKey` in `config.js`
  when you change the list, or old ticks will land on the wrong items.
- **The itinerary and the hike** — they're plain markup in `index.html`

## Two things to know

**The sign-in is not security.** The name and password are sitting in
`config.js` in plain text, and the page is a file on disk — anyone who can open
the folder can read both, or just skip the gate entirely. It keeps the page
tidy; it does not protect anything. Real protection needs a server that refuses
to send the page to visitors who haven't signed in.

**The scripts are plain `<script>` tags, deliberately.** ES modules
(`type="module"`) are blocked by browser security rules when a page is opened
straight from disk with `file://`, so switching to `import`/`export` would break
the page unless it were served over HTTP.

## Credits

Weather from [Open-Meteo](https://open-meteo.com/) (free, no API key).
Maps from Google. Trail details from
[Jabal Moussa Biosphere Reserve](https://www.jabalmoussa.org/trails-facilities).
