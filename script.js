const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusMsg = document.getElementById("statusMsg");
const currentCard = document.getElementById("currentCard");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const windEl = document.getElementById("wind");
const conditionEl = document.getElementById("condition");
const forecastBody = document.getElementById("forecastBody");

// ============================================================
// TASK 1 — WEATHER CODE DESCRIPTION
// ============================================================

function describeWeatherCode(code) {
    if (code === 0) {
        return "Clear sky"
    };
    if (code >= 1 && code <= 3) {
        return "Partly cloudy"
    };
    if (code === 45 || code === 48) {
        return "Fog"
    };
    if (code >= 51 && code <= 57) {
        return "Drizzle"
    };
    if (code >= 61 && code <= 67) {
        return "Rain"
    };
    if (code >= 71 && code <= 77) {
        return "Snow"
    };
    if (code >= 80 && code <= 82) {
        return "Rain showers"
    };
    if (code >= 95 && code <= 99) {
        return "Thunderstorm"
    };
    return "Unknown";
}

// ============================================================
// TASK 2 — STATUS MESSAGE
// ============================================================

function setStatus(message, isError = false) {
    statusMsg.textContent = message;
    statusMsg.classList.toggle("error", isError);
}

// ============================================================
// API FUNCTION 1 — GEOCODING
// ============================================================

// This function is provided.
// DO NOT MODIFY the API URL or the fetch logic.
//
// It converts a city name into latitude and longitude.

async function geocodeCity(city) {
const url =
`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

const res = await fetch(url);

if (!res.ok) {
throw new Error("Geocoding request failed");
}

const data = await res.json();

if (!data.results || data.results.length === 0) {
throw new Error("City not found — try another name.");
}

return data.results[0];
}

// ============================================================
// API FUNCTION 2 — WEATHER FORECAST
// ============================================================

// This function is provided.
// DO NOT MODIFY the API URL or fetch logic.
//
// It retrieves:
// - Current weather
// - Daily weather code
// - Maximum temperature
// - Minimum temperature
// - Precipitation
//
// The API uses the coordinates obtained from geocodeCity().

async function fetchForecast(lat, lon) {
const url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
`&current_weather=true` +
`&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
`&forecast_days=5` +
`&timezone=auto`;

const res = await fetch(url);

if (!res.ok) {
throw new Error("Forecast request failed");
}

return res.json();
}

// ============================================================
// TASK 3 — DISPLAY CURRENT WEATHER
// ============================================================

    function renderCurrentWeather(place, weatherData) {
    const current = weatherData.current_weather;

    cityNameEl.textContent = `${place.name}, ${place.country}`;
    tempEl.textContent = `${current.temperature} °C`;
    windEl.textContent = `${current.windspeed} km/h`;
    conditionEl.textContent = describeWeatherCode(current.weathercode);

    currentCard.classList.remove("hidden");
    }

// ============================================================
// TASK 4 — CREATE THE FORECAST TABLE
// ============================================================

function renderForecastTable(daily) {
  forecastBody.innerHTML = "";

  const daysToShow = daily.time.slice(0, 5);

  daysToShow.forEach((dateString, index) => {
    const row = document.createElement("tr");
    const precipitation = Number(daily.precipitation_sum[index]) || 0;

    if (precipitation > 0) {
      row.classList.add("rainy");
    }

    const displayDate = new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    row.innerHTML = `
      <td>${displayDate}</td>
      <td>${describeWeatherCode(daily.weathercode[index])}</td>
      <td>${daily.temperature_2m_max[index]} °C</td>
      <td>${daily.temperature_2m_min[index]} °C</td>
      <td>${precipitation} mm</td>
    `;

    forecastBody.appendChild(row);
  });
}

// ============================================================
// TASK 5 — HANDLE SEARCH
// ============================================================

async function handleSearch() {
  const city = cityInput.value.trim();

  if (!city) {
    setStatus("Please type a city name.", true);
    return;
  }

  currentCard.classList.add("hidden");
  forecastBody.innerHTML = "";
  setStatus("Loading…");

  try {
    const place = await geocodeCity(city);
    const weatherData = await fetchForecast(place.latitude, place.longitude);

    renderCurrentWeather(place, weatherData);
    renderForecastTable(weatherData.daily);

    setStatus("");
  } catch (error) {
    setStatus(error.message || "Something went wrong.", true);
  }
}

// ============================================================
// TASK 6 — SEARCH BUTTON EVENT
// ============================================================

searchBtn.addEventListener("click", handleSearch);

// ============================================================
// TASK 7 — ENTER KEY SUPPORT
// ============================================================

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

// ============================================================
// STRETCH GOAL — HIGHLIGHT RAINY DAYS
// ============================================================

// This is already handled in renderForecastTable() by adding the "rainy" class
// when precipitation is greater than zero.
