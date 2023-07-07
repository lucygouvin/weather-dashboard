// Testing Variables
var testCityName = "Pittsburgh";

var testCityLat = "40.44";
var testCityLon = "-79.99";


// API Key and Base URLs
var APIkey = "262d8997c6aac855ba637daa6177913c";


// DOM Elements
var searchEl = $(".searchBar")
var searchButtonEl = $(".searchButton")

// TO DO Wrap code that interacts with elements in $ function

// See if there is an existing search history object in localStorage
var searchHistory = JSON.parse(localStorage.getItem("searchHistory"))
// If not (searchHistory is null), set it equal to an empty array
if (searchHistory === null) {
    searchHistory = []
}

function searchLocation(){
  // TO DO send to lowercase?
  var cityName = searchEl.val().trim()
  searchEl.val("")
  
  if (cityName){
    for (var i =0; i<searchHistory.length; i++){
      if (searchHistory[i].name === cityName){
        getWeather(searchHistory[i].lat, searchHistory[i].lon)
        return
      }
      }
      getCoord(cityName)
    }
  }

function getCoord(city) {
  //TO DO Add defensive programming check here?
  var requestGeoUrl = new URL("http://api.openweathermap.org/geo/1.0/direct");
  requestGeoUrl.searchParams.append("q", city);
  requestGeoUrl.searchParams.append("appid", APIkey);

  console.log("running coord")

  fetch(requestGeoUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;
      var locData={
        name: data[0].name,
        state: data[0].state,
        lat: lat,
        lon: lon
      }
      searchHistory.push(locData)
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
      getWeather(lat, lon);
    });
}

function getWeather(lat, lon) {
  //TO DO Add defensive programming check here?
  console.log("running weather")
  var requestWeatherUrl = new URL(
    "http://api.openweathermap.org/data/2.5/forecast")
  requestWeatherUrl.searchParams.append("lat", lat);
  requestWeatherUrl.searchParams.append("lon", lon);
  requestWeatherUrl.searchParams.append("appid", APIkey);
  fetch(requestWeatherUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
    });
}

searchButtonEl.on("click", searchLocation)

// STRETCH GOALS
// Support city name search with optional state
// support zip code search
// Autofill suggestions
// If rainy, show chance of rain
// Make search button activate when you press enter

// LOAD PAGE
// Check localStorage ✅
// Populate search history 
// Use latest search to get the current weather and the five day forecast. Populate dynamically

// If there's no localStorage, show a message like "Search for a city"
// Hide the forecast area

// USER SEARCHES A CITY
// Sanitize the data
// Check to see if the data is already in the localStorage. If so, you don't have to do the geocoding API call✅
// Make a call to the Geocoding API to turn a search string into longitude and latitude✅
// Save the location to localStorage✅
// Array of objects. Each object should have the place name, state, lat, and long✅
// Take the longitude and latitude and make another API call to get the weather forecast✅
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
