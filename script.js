// =========================
// Elements
// =========================
const humidityEl = document.querySelector(".humid-percentage");
const statusEl = document.querySelector(".humid-status");
const descEl = document.querySelector(".description");
const iconEls = [
  document.querySelector(".icon1"),
  document.querySelector(".icon2"),
  document.querySelector(".icon3"),
];
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");

// =========================
// Humidity state + rendering
// =========================
function getHumidityState(h) {
  if (h <= 50) {
    return {
      label: "Good",
      color: "#22a352",
      desc:
        "Humidity is in an optimal range. Filament stays stable and printing performance remains reliable. No extra precautions are needed.",
      icons: ["img/icon_full.svg", "img/icon_empty.svg", "img/icon_empty.svg"],
    };
  } else if (h <= 60) {
    return {
      label: "Fair",
      color: "#d4a017",
      desc:
        "Humidity is moderately elevated. Filament may slowly absorb moisture over time. Consider using sealed storage if filament is left out.",
      icons: ["img/icon_full.svg", "img/icon_half.svg", "img/icon_empty.svg"],
    };
  } else {
    return {
      label: "Bad",
      color: "#c62828",
      desc:
        "Humidity is high. Filament can absorb moisture quickly, which may affect print quality. Dry storage is recommended.",
      icons: ["img/icon_full.svg", "img/icon_full.svg", "img/icon_full.svg"],
    };
  }
}

function renderHumidity(h) {
  humidityEl.textContent = `${h}%`;
  const state = getHumidityState(h);
  statusEl.textContent = state.label;
  statusEl.style.color = state.color;
  humidityEl.style.color = state.color;
  descEl.textContent = state.desc;
  iconEls.forEach((el, i) => (el.src = state.icons[i]));
}

// =========================
// API Calls
// =========================
async function geocodeCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name
  )}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocode HTTP ${res.status}`);
  const data = await res.json();
  return data.results?.[0];
}

async function fetchHumidity(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast HTTP ${res.status}`);
  const data = await res.json();
  return data.current?.relative_humidity_2m;
}

// =========================
// Load city + update widget
// =========================
async function loadCity(name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  descEl.textContent = "Loading...";
  try {
    const city = await geocodeCity(trimmed);
    if (!city) {
      descEl.textContent = "City not found. Try another search.";
      return;
    }
    const humidity = await fetchHumidity(city.latitude, city.longitude);
    if (typeof humidity !== "number") throw new Error("No humidity data");

    renderHumidity(humidity);
    localStorage.setItem("humidity:lastCity", city.name);
  } catch (err) {
    console.error(err);
    descEl.textContent = "Unable to fetch humidity data.";
  }
}

// =========================
// Event listeners
// =========================
searchBtn.addEventListener("click", () => loadCity(cityInput.value));
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadCity(cityInput.value);
});

// =========================
// Initial load
// =========================
(function init() {
  const last = localStorage.getItem("humidity:lastCity") || "Toronto";
  cityInput.value = last;
  loadCity(last);
  setInterval(() => loadCity(cityInput.value), 10 * 60 * 1000); // auto-refresh
})();
