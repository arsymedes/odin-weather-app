import "normalize.css"
import "./main.css"
import weatherIcons from "./weatherIcons"
import clearDay from "./img/Clear Day.jpg"
import clearNight from "./img/Clear Night.jpg"
import cloudsDay from "./img/Clouds Day.jpg"
import cloudsNight from "./img/Clouds Night.jpg"
import drizzle from "./img/Drizzle.jpg"
import rain from "./img/Rain.jpg"
import snow from "./img/Snow.jpg"
import thunderstorm from "./img/Thunderstorm.jpg"
import favicon from "./img/favicon.jpg"


const head = document.querySelector("head")
const body = document.querySelector("body")
const key = "f9ddde2afd91a0bfc112781b590bca19"

const bgImages = {
  "Clear d": clearDay,
  "Clear n": clearNight,
  "Clouds d": cloudsDay,
  "Clouds n": cloudsNight,
  "Drizzle d": drizzle,
  "Drizzle n": drizzle,
  "Rain d": rain,
  "Rain n": rain,
  "Snow d": snow,
  "Thunderstorm d": thunderstorm,
  "Thunderstorm n": thunderstorm,
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

async function getLocation(city) {
  const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${key}`, {mode: "cors"})
  const cityData = await response.json()
  const cityLocation = [cityData[0].lat, cityData[0].lon]
  return cityLocation
}

async function getWeather(city) {
  const cityLocation = await getLocation(city)
  const response = await fetch (`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLocation[0]}&lon=${cityLocation[1]}&units=metric&exclude=minutely&appid=${key}`, {mode: "cors"})
  const cityWeather = await response.json()
  return cityWeather
}

async function getCurrentWeather(city) {
  const weather = await getWeather(city)
  const currentWeather = weather.current
  const todayWeather = weather.daily[0]
  const weatherInfo = {
    city,
    mainWeather: currentWeather.weather[0].main,
    weather: toTitleCase(currentWeather.weather[0].description),
    icon: currentWeather.weather[0].icon,
    rain: todayWeather.rain ? todayWeather.rain: 100,
    humidity: currentWeather.humidity,
    feelsLike: currentWeather.feels_like,
    windSpeed: currentWeather.wind_speed,
    temperature: Math.round(currentWeather.temp),
  }
  return weatherInfo
}

async function getDailyForecast(city) {
  const weather = await getWeather(city)
  const weatherDaily = weather.daily
  const dailyForecast = [
    weatherDaily[1].weather[0].description,
    weatherDaily[2].weather[0].description,
    weatherDaily[3].weather[0].description,
    weatherDaily[4].weather[0].description,
  ]
  const dailyForecastTitle = dailyForecast.map(toTitleCase)
  return dailyForecastTitle
}

function getDOM(currentWeather, dailyForecast) {
  const html = /* html */ `
    <div class="main">
      <h1>${currentWeather.temperature}°</h1>
      <div class="container">
        <div class="main-info">
          <h2>${currentWeather.city}</h2>
          <p>06:09 - Monday, 9 Sep 2019</p>
        </div>
        <div class="weather">
        ${weatherIcons[currentWeather.icon]}
        <p>${currentWeather.weather}</p>
        </div>
      </div>
    </div>
    <div class="side">
      <form action="" id="my-form">
        <input type="search" name="search" id="search" placeholder="Enter a City Name e.g. London">
        <button type="submit"><svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
        </svg></button>
      </form>
      <div class="section details">
        <h3>Weather Details</h3>
        <ul>
          <li><div class="text">Feels Like</div><div class="bold">${currentWeather.feelsLike}°C</div></li>
          <li><div class="text">Humidity</div><div class="bold">${currentWeather.humidity}%</div></li>
          <li><div class="text">Chance of Rain</div><div class="bold">${currentWeather.rain}%</div></li>
          <li><div class="text">Wind Speed</div><div class="bold">${currentWeather.windSpeed} km/h</div></li>
        </ul>
      </div>
      <div class="section next-days">
        <h3>Upcoming Weather</h3>
        <ul>
          <li><div class="text">Tomorrow</div><div class="bold">${dailyForecast[0]}</div></li>
          <li><div class="text">2 Days From Now</div><div class="bold">${dailyForecast[1]}</div></li>
          <li><div class="text">3 Days From Now</div><div class="bold">${dailyForecast[2]}</div></li>
          <li><div class="text">4 Days From Now</div><div class="bold">${dailyForecast[3]}</div></li>
        </ul>
      </div>
    </div>
  `

  body.innerHTML = html;
}

async function display(city) {
  try {
    const currentWeather = await getCurrentWeather(city)
    const dailyForecast = await getDailyForecast(city)
    
    head.insertAdjacentHTML("beforeend", `<link rel="icon" href=${favicon}>`);
    getDOM(currentWeather, dailyForecast)
    body.style.background = `url(${bgImages[`${currentWeather.mainWeather} ${currentWeather.icon[2]}`]}) no-repeat center center / cover`

    const form = document.querySelector("#my-form")
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      const newCity = form.querySelector("#search").value
      display(newCity)
    })
  }
  catch(error) {
    const search = document.querySelector("#search")
    search.value = ""
    search.placeholder = "City Doesn't Exist, Re-Enter"
  }
}

display("Tokyo")
