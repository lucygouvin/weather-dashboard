// Testing Variables
var testCityName = "Pittsburgh"

var testCityLat = "40.44"
var testCityLon = "-79.99"

var APIkey = "262d8997c6aac855ba637daa6177913c"
var requestGeoUrl = new URL("http://api.openweathermap.org/geo/1.0/direct")
var requestWeatherUrl = new URL("http://api.openweathermap.org/data/2.5/forecast")


function getCoord(city){
requestGeoUrl.searchParams.append("q",city);
requestGeoUrl.searchParams.append("appid", APIkey)

fetch(requestGeoUrl)
.then(function (response) {
  return response.json();
}).then(function (data) {
  var lat = data[0].lat
  var lon = data[0].lon
  getWeather(lat, lon)

})
}

function getWeather(lat, lon){
requestWeatherUrl.searchParams.append("lat", lat)
requestWeatherUrl.searchParams.append("lon", lon)
requestWeatherUrl.searchParams.append("appid", APIkey)
  fetch(requestWeatherUrl)
    .then(function(response){
      return response.json();
    })
    .then(function(data){
      console.log(data)
    })
}

getCoord(testCityName)

// STRETCH GOALS
// Support city name search with optional state
// support zip code search
// Autofill suggestions
// If rainy, show chance of rain

// LOAD PAGE
// Check localStorage, populate search history
// Use latest search to get the current weather and the five day forecast. Populate dynamically

// If there's no localStorage, show a message like "Search for a city"
// Hide the forecast area

// USER SEARCHES A CITY
// Sanitize the data
  // Check to see if the data is already in the localStorage. If so, you don't have to do the geocoding API call
// Make a call to the Geocoding API to turn a search string into longitude and latitude
// Take the longitude and latitude and make another API call to get the weather forecast
// Save the location to localStorage
  // Array of objects. Each object should have the place name, state, zip code, lat, and long
// Add city to the search history
  // Create a button with the place name. Store lat and long as data attributes to avoid future geocoding API calls

// STATS TO DISPLAY
// Date
  // Convert UTC with DayJS
// Temp hi
  // For loop through temperatures, update if higher
// Temp low
  // For loop through temperatures, update if lower
// Weather icon
  // Track how many of each kind of weather there is, and show whichever one has the most
  // If two weather conditions are equally likely, show both?
// Verbose weather?
  // list.weather.description
// Humidity?
  // list.main.humidity

// DISPLAY TO USER
// Calculate each value and assign it to the relevant text field


