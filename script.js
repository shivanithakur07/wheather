const apiKey = "YOUR_OPENAI_API_KEY";

const weatherIcons = {
    Clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
    Rain: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
    Snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
    Clouds: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
    Thunderstorm: "https://cdn-icons-png.flaticon.com/512/1146/1146858.png",
    Drizzle: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Mist: "https://cdn-icons-png.flaticon.com/512/4005/4005899.png"
};

const weatherTypeEl = document.getElementById("weather-type");
const weatherIconEl = document.getElementById("weather-icon");
const locationInput = document.getElementById("locationInput");
const searchBtn = document.getElementById("search-btn");
const weatherInfo = document.getElementById("weatherInfo");

searchBtn.addEventListener("click", getWeatherByCity);
locationInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        getWeatherByCity();
    }
});

function showLoading() {
    weatherInfo.innerHTML = '<div class="loading"></div>';
    searchBtn.disabled = true;
    searchBtn.style.opacity = '0.7';
}

function hideLoading() {
    searchBtn.disabled = false;
    searchBtn.style.opacity = '1';
}

function getWeatherByCity() {
    const city = locationInput.value.trim();
    if (!city) {
        showError("Please enter a city name");
        return;
    }
    showLoading();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetchWeather(url);
}

function getWeatherByGeolocation() {
    if ("geolocation" in navigator) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
                fetchWeather(url);
            },
            error => {
                hideLoading();
                showError("Unable to get your location. Please enter a city name.");
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
}

function fetchWeather(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.cod !== 200) {
                showError("Location not found. Please try again.");
                return;
            }
            updateWeatherUI(data);
        })
        .catch(error => {
            hideLoading();
            showError("Error fetching weather data. Please try again.");
            console.error("Error:", error);
        });
}

function updateWeatherUI(data) {
    const weatherMain = data.weather[0].main;
    const weatherDesc = data.weather[0].description;
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const cityName = data.name;
    const country = data.sys.country;

    // Fade out current content
    weatherInfo.style.opacity = '0';
    
    setTimeout(() => {
        weatherTypeEl.textContent = weatherMain;
        weatherIconEl.style.backgroundImage = `url(${weatherIcons[weatherMain] || weatherIcons.Clouds})`;

        const html = `
            <p><strong>${cityName}, ${country}</strong></p>
            <p>🌡 ${temp}°C (Feels like ${feelsLike}°C)</p>
            <p>☁ ${weatherDesc}</p>
            <p>💧 Humidity: ${humidity}%</p>
            <p>🌬 Wind: ${windSpeed} m/s</p>
        `;
        weatherInfo.innerHTML = html;
        
        // Fade in new content
        weatherInfo.style.opacity = '1';
    }, 300);
}

function showError(message) {
    weatherInfo.innerHTML = `<p class="error-message">${message}</p>`;
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const datetimeEl = document.getElementById("datetime");
    datetimeEl.style.opacity = '0';
    
    setTimeout(() => {
        datetimeEl.textContent = now.toLocaleDateString('en-US', options);
        datetimeEl.style.opacity = '1';
    }, 300);
}

// Add smooth transitions to weather info
weatherInfo.style.transition = 'opacity 0.3s ease';
document.getElementById("datetime").style.transition = 'opacity 0.3s ease';

setInterval(updateDateTime, 1000);
updateDateTime();
getWeatherByGeolocation();
