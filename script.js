// Select elements from your widget
const humidityEl = document.querySelector(".humid-percentage");
const statusEl = document.querySelector(".humid-status");
const descEl = document.querySelector(".description");
const iconEls = [
  document.querySelector(".icon1"),
  document.querySelector(".icon2"),
  document.querySelector(".icon3")
];
const citySelect = document.getElementById("city-select");

function getHumidityState(humidity) { // changes the humidity percentage color and label based on the outdoor humidity
  if (humidity <= 40) {
    return {
      label: "Good",
      color: "#22a352",
      desc: "Humidity is in an optimal range. Filament stays stable and printing performance remains reliable. No extra precautions are needed.",
      icons: ["img/icon_half.svg", "img/icon_empty.svg", "img/icon_empty.svg"]
    };
  } else if (humidity <= 60) {
    return {
      label: "Fair",
      color: "#d4a017",
      desc: "Humidity is moderately elevated. Filament may slowly absorb moisture over time. Consider using sealed storage if filament is left out.",
      icons: ["img/icon_full.svg", "img/icon_half.svg", "img/icon_empty.svg"]
    };
  } else {
    return {
      label: "Bad",
      color: "#c62828",
      desc: "Humidity is high. Filament can absorb moisture quickly, which may affect print quality. Dry storage is recommended.",
      icons: ["img/icon_full.svg", "img/icon_full.svg", "img/icon_full.svg"]
    };
  }
}

// Fetch humidity data from Open-Meteo
async function fetchHumidity(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m`;
    const res = await fetch(url);
    const data = await res.json();

    const humidity = data.current.relative_humidity_2m;

    // Update widget
    humidityEl.textContent = `${humidity}%`;

    const state = getHumidityState(humidity);
    statusEl.textContent = state.label;
    statusEl.style.color = state.color;
    humidityEl.style.color = state.color;
    descEl.textContent = state.desc;

    iconEls.forEach((el, i) => {
      el.src = state.icons[i];
    });
  } catch (err) {
    console.error("Error fetching humidity:", err);
    descEl.textContent = "Unable to fetch humidity data.";
  }
}

// Event listener for city selection
citySelect.addEventListener("change", () => {
  const [lat, lon] = citySelect.value.split(",");
  fetchHumidity(lat, lon);
});

// Initial load (default city from dropdown)
const [defaultLat, defaultLon] = citySelect.value.split(",");
fetchHumidity(defaultLat, defaultLon);

// Refresh every 10 minutes for the selected city
setInterval(() => {
  const [lat, lon] = citySelect.value.split(",");
  fetchHumidity(lat, lon);
}, 10 * 60 * 1000);
