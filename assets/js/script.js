// Testing Variables
var testCityName = "Pittsburgh";
// var testCityLat = "40.44";
// var testCityLon = "-79.99";


// API Key
var APIkey = "262d8997c6aac855ba637daa6177913c";

// dayjs.extend(window.dayjs_plugin_utc);
// dayjs.extend(window.dayjs_plugin_timezone);


// See if there is an existing search history object in localStorage
var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
// If not (searchHistory is null), set it equal to an empty array
if (searchHistory === null) {
  searchHistory = [];
}else{
  for (var i = 0; i < searchHistory.length; i++){
    makeHistoryButton(searchHistory[i].name)
  }
}

// Wait until all DOM elemnts are loaded
$(function () {
  // DOM Elements

  $(".searchButton").on("click", searchLocation);


});
function searchLocation() {
  // TO DO fix capitalization check
  var cityName = $(".searchBar").val().trim();
  // var cityName = testCityName
  $(".searchBar").val("");

  if (cityName) {
    for (var i = 0; i < searchHistory.length; i++) {
      if (searchHistory[i].name === cityName) {
        getWeather(searchHistory[i].lat, searchHistory[i].lon);
        return;
      }
    }
    getCoord(cityName);
  }
}

function getCoord(city) {
  //TO DO Add defensive programming check here?
  var requestGeoUrl = new URL("http://api.openweathermap.org/geo/1.0/direct");
  requestGeoUrl.searchParams.append("q", city);
  requestGeoUrl.searchParams.append("appid", APIkey);

  console.log("running coord");

  fetch(requestGeoUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;
      makeHistoryButton(data[0].name)
      var locData = {
        name: data[0].name,
        state: data[0].state,
        lat: lat,
        lon: lon,
      };
      searchHistory.push(locData);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      getWeather(lat, lon);
    });
}

function getWeather(lat, lon) {
  //TO DO Add defensive programming check here?
  console.log("running weather");
  var requestWeatherUrl = new URL(
    "http://api.openweathermap.org/data/2.5/forecast"
  );
  requestWeatherUrl.searchParams.append("lat", lat);
  requestWeatherUrl.searchParams.append("lon", lon);
  requestWeatherUrl.searchParams.append("units", "imperial")
  requestWeatherUrl.searchParams.append("appid", APIkey);
  fetch(requestWeatherUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      sortData(data.list);
    });
}

function makeHistoryButton(location){
  var historyButton = $("<button>" + location + "</button>")
  $(".searchHistory").prepend(historyButton)
}

function sortData(forecast){
  var today = dayjs().set('hour', 23).set('minute',59).set('second',59);
  var days = [
    [], //today
    [], //day + 1
    [], //day + 2
    [], //day + 3
    [], //day + 4
    [], //day + 5
  ];
  for (var i = 0; i < forecast.length; i++) {
    // convert the unix code to local time
    var convertDay = dayjs.unix(forecast[i].dt);
    if (convertDay.$D === today.$D) {
      days[0].push(forecast[i])
    } else {
    var index = (convertDay.diff(today, "day"))+1;
    days[index].push(forecast[i]);
    }
  }
  console.log(days)
  presentData(days)
}

function presentData(days) {
  var dayCards = $(".dayCard");
  for (var i = 1; i < days.length; i++) {
    var highTracker = null
    var lowTracker = null
    var humidityTracker = null
    var iconList = []
    var descriptionList = []

    for (var j = 1; j < days[i].length; j++) {
      // Update high and low temps
      if (days[i][j].main.temp > highTracker || highTracker === null) {
        highTracker = days[i][j].main.temp
      } 
      if (days[i][j].main.temp < lowTracker|| lowTracker === null) {
        lowTracker = days[i][j].main.temp;
      }
      // Update humidity
      if (days[i][j].main.humidity > humidityTracker || humidityTracker === null) {
        humidityTracker= days[i][j].main.humidity
      }
      // Track icon
      iconList.push(days[i][j].weather[0].icon)
      // Track weather desciption
      descriptionList.push(days[i][j].weather[0].description)
    }
    // Set date
    dayCards[i-1].querySelector(".date").textContent = dayjs.unix(days[i][1].dt).format("ddd, MMM D");
    // Set high temp
    dayCards[i-1].querySelector(".high").textContent = highTracker;
    // Set low temp
    dayCards[i-1].querySelector(".low").textContent = lowTracker;
    // Set humidity
    dayCards[i-1].querySelector(".humidity").textContent = humidityTracker;
    // Set icon
    var iconCode = getMostFrequent(iconList)
    var imageURL = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png"
    dayCards[i-1].querySelector("img").setAttribute("src", imageURL)


    // Set verbose weather
    // TO DO Apply correct capitalization
    dayCards[i-1].querySelector(".verbose-weather").textContent = getMostFrequent(descriptionList)
  }
}
function getMostFrequent(list){
  if(list){
    var freqTracker = {}
    var maxItem
    var maxCount = 1
    
    for (var i=0; i<list.length; i++){
      var item = list[i]
      if(!freqTracker[item]){
        freqTracker[item] = 1
      }else{
        freqTracker[item] ++
      }
      if (freqTracker[item]>maxCount){
        maxCount = freqTracker[item]
        maxItem = item 
      }
    }
    return maxItem
  }
}



// STRETCH GOALS
// Support city name search with optional state
// support zip code search
// Autofill suggestions
// If rainy, show chance of rain
// Make search button activate when you press enter

// LOAD PAGE
// Check localStorage ✅
// Populate search history✅
// Use latest search to get the current weather and the five day forecast. Populate dynamically

// If there's no localStorage, show a message like "Search for a city"
// Hide the forecast area

// USER SEARCHES A CITY✅
// Sanitize the data✅
// Check to see if the data is already in the localStorage. If so, you don't have to do the geocoding API call✅
// Make a call to the Geocoding API to turn a search string into longitude and latitude✅
// Save the location to localStorage✅
// Array of objects. Each object should have the place name, state, lat, and long✅
// Take the longitude and latitude and make another API call to get the weather forecast✅
// Add city to the search history✅
// Create a button with the place name. Store lat and long as data attributes to avoid future geocoding API calls✅

// USE A HISTORY BUTTON TO SEARCH

// STATS TO DISPLAY
// Date✅
// Convert UTC with DayJS✅
// Temp hi✅
// For loop through temperatures, update if higher✅
// Temp low✅
// For loop through temperatures, update if lower✅
// Weather icon
// Track how many of each kind of weather there is, and show whichever one has the most
// If two weather conditions are equally likely, show both?
// Verbose weather?
// list.weather.description
// Humidity?✅
// For loop through humidity, update if higher✅

// DISPLAY TO USER
// Calculate each value and assign it to the relevant text field
