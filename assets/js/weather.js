/* Live weather from Open-Meteo — free, and no API key needed.
   Fills the "right now" infobox and the two-day forecast table. */
window.Camp = window.Camp || {};

Camp.weather = (function () {
  "use strict";

  /* WMO weather codes, in plain words. */
  var CODES = {
    0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Cloudy",
    45: "Fog", 48: "Freezing fog",
    51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
    56: "Freezing drizzle", 57: "Freezing drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain",
    66: "Freezing rain", 67: "Freezing rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
    80: "Light showers", 81: "Showers", 82: "Heavy showers",
    85: "Snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail"
  };
  var COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                 "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

  /* One row of the forecast table per entry, in table order. */
  var DAY_CELLS = ["sky", "hi", "lo", "feels", "pop", "mm", "hum", "wind", "gust", "uv", "rise", "set"];

  var wxTemp, wxFeels, wxNow, wxHum, wxWind, wxGust;
  var wxAdvice, adviceRow, wxStamp, wxNote;
  var unitsBtn, refreshEl, infobox;

  /* Last good reading, kept so switching units needs no refetch. */
  var latest = null;

  function id(name) { return Camp.dom.byId(name); }
  function num(v) { return typeof v === "number" && isFinite(v); }

  function describe(code) {
    return Object.prototype.hasOwnProperty.call(CODES, code) ? CODES[code] : "—";
  }
  function temp(c) {
    if (!num(c)) return "—";
    return Camp.store.state.units === "f"
      ? Math.round(c * 9 / 5 + 32) + " °F"
      : Math.round(c) + " °C";
  }
  function speed(kmh) {
    if (!num(kmh)) return "—";
    return Camp.store.state.units === "f"
      ? Math.round(kmh * 0.621371) + " mph"
      : Math.round(kmh) + " km/h";
  }
  function bearing(deg) {
    if (!num(deg)) return "";
    return COMPASS[Math.round(deg / 22.5) % 16];
  }
  function uvWord(v) {
    if (!num(v)) return "—";
    var word = v < 3 ? "low" : v < 6 ? "moderate" : v < 8 ? "high" : v < 11 ? "very high" : "extreme";
    return Math.round(v) + " — " + word;
  }
  function clockOf(stamp) {
    return typeof stamp === "string" && stamp.length >= 16 ? stamp.slice(11, 16) : "—";
  }
  function blankDays() {
    [1, 2].forEach(function (n) {
      DAY_CELLS.forEach(function (cell) {
        var el = id("d" + n + cell);
        if (el) el.textContent = "—";
      });
    });
  }

  function paint() {
    if (!latest) return;
    var cur = latest.current || {};
    var day = latest.daily || {};

    wxTemp.textContent = temp(cur.temperature_2m);
    wxFeels.textContent = num(cur.apparent_temperature)
      ? "feels like " + temp(cur.apparent_temperature) : "";
    wxNow.textContent = describe(cur.weather_code);
    wxNow.className = "";
    wxHum.textContent = num(cur.relative_humidity_2m)
      ? Math.round(cur.relative_humidity_2m) + "%" : "—";
    wxWind.textContent = speed(cur.wind_speed_10m);
    wxGust.textContent = speed(cur.wind_gusts_10m);

    var times = day.time || [];
    var lows = [], wet = false, uvMax = null, sunsetDay1 = null;

    Camp.config.tripDays.forEach(function (date, n) {
      var slot = "d" + (n + 1);
      var i = times.indexOf(date);

      if (i === -1) {
        DAY_CELLS.forEach(function (cell) { id(slot + cell).textContent = "too far ahead"; });
        return;
      }

      var code = day.weather_code[i];
      var lo   = day.temperature_2m_min[i];
      var pop  = day.precipitation_probability_max[i];
      var mm   = day.precipitation_sum[i];
      var uv   = day.uv_index_max[i];

      if (num(lo)) lows.push(lo);
      if (code >= 51 || (num(pop) && pop >= 40)) wet = true;
      if (num(uv) && (uvMax === null || uv > uvMax)) uvMax = uv;
      if (n === 0) sunsetDay1 = clockOf(day.sunset[i]);

      id(slot + "sky").textContent   = describe(code);
      id(slot + "hi").textContent    = temp(day.temperature_2m_max[i]);
      id(slot + "lo").textContent    = temp(lo);
      id(slot + "feels").textContent = temp(day.apparent_temperature_max[i]);
      id(slot + "pop").textContent   = num(pop) ? pop + "%" : "—";
      id(slot + "mm").textContent    = num(mm) ? (mm === 0 ? "none" : mm.toFixed(1) + " mm") : "—";
      id(slot + "hum").textContent   = num(day.relative_humidity_2m_mean[i])
        ? Math.round(day.relative_humidity_2m_mean[i]) + "%" : "—";
      id(slot + "wind").textContent  = speed(day.wind_speed_10m_max[i])
        + (bearing(day.wind_direction_10m_dominant[i])
            ? " from the " + bearing(day.wind_direction_10m_dominant[i]) : "");
      id(slot + "gust").textContent  = speed(day.wind_gusts_10m_max[i]);
      id(slot + "uv").textContent    = uvWord(uv);
      id(slot + "rise").textContent  = clockOf(day.sunrise[i]);
      id(slot + "set").textContent   = clockOf(day.sunset[i]);
    });

    var coldest = lows.length ? Math.min.apply(null, lows) : null;
    var says = [];
    if (wet) says.push("Rain is forecast — bring a jacket, and rethink the hike.");
    if (num(uvMax) && uvMax >= 8) says.push("UV is very high — sunscreen and a hat.");
    if (coldest !== null && coldest < 16) says.push("Cold after dark — pack a warm layer.");
    if (coldest !== null && coldest >= 22) says.push("Warm night — a light blanket is enough.");
    adviceRow.hidden = says.length === 0;
    wxAdvice.textContent = says.join(" ");

    if (sunsetDay1 && sunsetDay1 !== "—") {
      wxNote.textContent = "The sun sets at " + sunsetDay1 + " on the Monday — aim to be at the camp"
        + " and unpacked well before then.";
    }

    wxStamp.textContent = "Updated "
      + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ".";
  }

  function endpoint() {
    return "https://api.open-meteo.com/v1/forecast"
      + "?latitude=" + Camp.config.site.lat + "&longitude=" + Camp.config.site.lon
      + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,"
      + "wind_speed_10m,wind_gusts_10m"
      + "&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,"
      + "relative_humidity_2m_mean,precipitation_probability_max,precipitation_sum,"
      + "wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset"
      + "&forecast_days=16&timezone=auto";
  }

  function fail() {
    latest = null;
    wxTemp.textContent = "—";
    wxFeels.textContent = "";
    wxHum.textContent = "—";
    wxWind.textContent = "—";
    wxGust.textContent = "—";
    adviceRow.hidden = true;
    blankDays();
    wxNow.textContent = "No connection — try Refresh";
    wxNow.className = "wx-fail";
    wxStamp.textContent = "Live from Open-Meteo.";
  }

  function load() {
    infobox.classList.add("wx-load");
    wxNow.textContent = "Loading…";
    wxNow.className = "wx-wait";

    fetch(endpoint())
      .then(function (r) {
        if (!r.ok) throw new Error("bad response");
        return r.json();
      })
      .then(function (data) {
        latest = data;
        paint();
      })
      .catch(fail)
      .then(function () {
        infobox.classList.remove("wx-load");
      });
  }

  function toggleUnits() {
    var store = Camp.store;
    store.state.units = store.state.units === "f" ? "c" : "f";
    unitsBtn.textContent = store.state.units === "f" ? "°C" : "°F";
    paint();
    store.save();
  }

  function init() {
    wxTemp = id("wxTemp");
    wxFeels = id("wxFeels");
    wxNow = id("wxNow");
    wxHum = id("wxHum");
    wxWind = id("wxWind");
    wxGust = id("wxGust");
    wxAdvice = id("wxAdvice");
    adviceRow = id("wxAdviceRow");
    wxStamp = id("wxStamp");
    wxNote = id("wxNote");
    unitsBtn = id("units");
    refreshEl = id("wxRefresh");
    infobox = document.querySelector(".infobox");

    unitsBtn.textContent = Camp.store.state.units === "f" ? "°C" : "°F";
    unitsBtn.addEventListener("click", toggleUnits);
    refreshEl.addEventListener("click", load);

    load();
  }

  return { init: init, load: load };
})();
