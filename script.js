const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const errorTitle = document.getElementById("errorTitle");
const errorDescription = document.getElementById("errorDescription");
const errorClose = document.getElementById("errorClose");
const weatherContainer = document.getElementById("weatherContainer");
const weatherCard = document.querySelector(".weather-card");

const locationName = document.getElementById("locationName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const visibility = document.getElementById("visibility");
const pressure = document.getElementById("pressure");
const cloudiness = document.getElementById("cloudiness");
const uvIndex = document.getElementById("uvIndex");
const heatIndex = document.getElementById("heatIndex");

const API_KEY = "e2819fb85f1e48d0b33102201252506";
const API_URL = "http://api.weatherapi.com/v1/current.json";

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    cityInput.focus();
  }, 1000);
});

searchBtn.addEventListener("click", () => {
  fetchWeather(cityInput.value);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchWeather(cityInput.value);
  }
});

function getWeatherIcon(condition) {
  const conditionLower = condition.toLowerCase();

  if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
    return "fas fa-sun";
  } else if (conditionLower.includes("cloud")) {
    return "fas fa-cloud";
  } else if (
    conditionLower.includes("rain") ||
    conditionLower.includes("drizzle")
  ) {
    return "fas fa-cloud-rain";
  } else if (conditionLower.includes("snow")) {
    return "fas fa-snowflake";
  } else if (
    conditionLower.includes("thunder") ||
    conditionLower.includes("storm")
  ) {
    return "fas fa-bolt";
  } else if (
    conditionLower.includes("fog") ||
    conditionLower.includes("mist")
  ) {
    return "fas fa-smog";
  } else if (conditionLower.includes("wind")) {
    return "fas fa-wind";
  } else {
    return "fas fa-cloud-sun";
  }
}

function showError(type, message) {
  const errorTypes = {
    "not-found": {
      title: "Location Not Found",
      icon: "fas fa-map-marker-alt",
    },
    "invalid-input": {
      title: "Invalid Input",
      icon: "fas fa-keyboard",
    },
    network: {
      title: "Connection Error",
      icon: "fas fa-wifi",
    },
    "api-error": {
      title: "Service Error",
      icon: "fas fa-exclamation-triangle",
    },
    general: {
      title: "Error",
      icon: "fas fa-exclamation-triangle",
    },
  };

  const errorConfig = errorTypes[type] || errorTypes["general"];

  errorTitle.textContent = errorConfig.title;
  errorDescription.textContent = message;

  const errorIcon = document.querySelector(".error-icon");
  errorIcon.className = `${errorConfig.icon} error-icon`;

  errorMessage.style.display = "block";

  setTimeout(() => {
    hideError();
  }, 6000);
}

errorClose.addEventListener("click", hideError);

function hideError() {
  errorMessage.style.display = "none";
}

function showLoading() {
  loading.style.display = "flex";
  weatherContainer.classList.add("hidden");
  hideError();
}

function hideLoading() {
  loading.style.display = "none";
}

function updateWeatherDisplay(data) {
  locationName.textContent = `${data.location.name}, ${data.location.country}`;
  temperature.textContent = `${Math.round(data.current.temp_c)}°`;
  weatherDescription.textContent = data.current.condition.text;

  const iconClass = getWeatherIcon(data.current.condition.text);
  weatherIcon.innerHTML = `<i class="${iconClass}"></i>`;

  feelsLike.textContent = `${Math.round(data.current.feelslike_c)}°C`;
  humidity.textContent = `${data.current.humidity}%`;
  windSpeed.textContent = `${Math.round(data.current.wind_kph)} km/h`;
  visibility.textContent = `${data.current.vis_km} km`;
  pressure.textContent = `${Math.round(data.current.pressure_mb)} mb`;
  cloudiness.textContent = `${data.current.cloud}%`;
  uvIndex.textContent = data.current.uv;
  heatIndex.textContent = `${Math.round(data.current.heatindex_c)}°C`;

  hideLoading();
  weatherContainer.classList.remove("hidden");
  weatherContainer.classList.add("show");

  setTimeout(() => {
    weatherCard.classList.add("show");
  }, 100);
}

async function fetchWeather(city) {
  if (!city.trim()) {
    showError(
      "invalid-input",
      "Please enter a city name to get weather information."
    );
    return;
  }

  if (/\d/.test(city)) {
    showError(
      "invalid-input",
      "City names should not contain numbers. Please enter a valid city name."
    );
    return;
  }

  if (city.trim().length < 2) {
    showError(
      "invalid-input",
      "Please enter at least 2 characters for the city name."
    );
    return;
  }

  showLoading();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); 

    const response = await fetch(
      `${API_URL}?key=${API_KEY}&q=${encodeURIComponent(city.trim())}&aqi=no`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      if (data.error.code === 1006) {
        throw new Error("LOCATION_NOT_FOUND");
      } else {
        throw new Error(`API_ERROR: ${data.error.message}`);
      }
    }

    updateWeatherDisplay(data);
    cityInput.value = "";
  } catch (error) {
    hideLoading();

    if (error.name === "AbortError") {
      showError(
        "network",
        "Request timed out. Please check your internet connection and try again."
      );
    } else if (error.message === "LOCATION_NOT_FOUND") {
      showError(
        "not-found",
        `We couldn't find weather data for "${city}". Please check the spelling or try a different city name.`
      );
    } else if (error.message.startsWith("API_ERROR:")) {
      showError(
        "api-error",
        "Our weather service is temporarily unavailable. Please try again in a few moments."
      );
    } else if (error.message.includes("Failed to fetch")) {
      showError(
        "network",
        "Unable to connect to weather service. Please check your internet connection and try again."
      );
    } else {
      showError(
        "general",
        "An unexpected error occurred. Please try again later."
      );
    }

    console.error("Weather API error:", error);
  }
}