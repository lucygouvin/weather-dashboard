// API Key
var APIkey = "262d8997c6aac855ba637daa6177913c";

// See if there is an existing search history object in localStorage
var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
// If not (searchHistory is null), set it equal to an empty array
if (!searchHistory) {
  searchHistory = [];
} else {
  for (var i = 0; i < searchHistory.length; i++) {
    makeHistoryButton(searchHistory[i].name);
  }
  // var mostRecent =  searchHistory[searchHistory.length-1]
  // getCurrentForecast(mostRecent.name, mostRecent.lat, mostRecent.lon)
  // getWeather(mostRecent.lat, mostRecent.lon)
}

var searchHistoryButtons

// Wait until all DOM elemnts are loaded
$(function () {
  searchHistoryButtons = $(".searchHistory button")
  // Click listeners
  
  $(".currentWeather").on("click", searchLocation);
  $(".searchHistory button").on("click", function (event) {
    var cityName = $(event.target).text();
    searchFromHistory(cityName);
    // TO DO: Update the history list when you search from a history button
    // var index = searchHistory.indexOf(cityName)
    // var latest = 
    // searchHistory.splice(index,1)
    // searchHistory
  });
});

function searchLocation() {
  // TO DO fix capitalization check
  console.log("clicked")
  var cityName = $(".searchBar").val().trim();
  $(".searchBar").val("");

  if (searchFromHistory(cityName)) {
    return;
  } else {
    getCoord(cityName);
  }
}

function getCoord(city) {
  if (city) {
    var requestGeoUrl = new URL("http://api.openweathermap.org/geo/1.0/direct");
    requestGeoUrl.searchParams.append("q", city);
    requestGeoUrl.searchParams.append("appid", APIkey);

    console.log("running coord");
    fetch(requestGeoUrl)
      .then(function (response) {
        if (response.ok){
          response.json().then(function (data) {
            var lat = data[0].lat;
            var lon = data[0].lon;
            makeHistoryButton(data[0].name);
            $(".cityName").text(data[0].name)
            var locData = {
              name: data[0].name,
              state: data[0].state,
              lat: lat,
              lon: lon,
            };
            searchHistory.unshift(locData);
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory.slice(0,10)));
            getCurrentForecast(city, lat, lon)
            getWeather(lat, lon);
            
          });
        }else{
          alert('Error: ' + response.statusText);
        }
         
      })
      
  }
}

function getWeather(lat, lon) {
  if (lat && lon) {
    console.log("running weather");
    var requestWeatherUrl = new URL(
      "http://api.openweathermap.org/data/2.5/forecast"
    );
    requestWeatherUrl.searchParams.append("lat", lat);
    requestWeatherUrl.searchParams.append("lon", lon);
    requestWeatherUrl.searchParams.append("units", "imperial");
    requestWeatherUrl.searchParams.append("appid", APIkey);
    fetch(requestWeatherUrl)
      .then(function (response) {
        if (response.ok){
          response.json().then(function (data) {
            sortData(data.list);
          });
        }else {
          alert('Error: ' + response.statusText);
        }
      })
  }
}

function getCurrentForecast(name, lat, lon){
  if (lat && lon) {
    var currentWeatherUrl = new URL(
      "https://api.openweathermap.org/data/2.5/weather"
    );
    currentWeatherUrl.searchParams.append("lat", lat);
    currentWeatherUrl.searchParams.append("lon", lon);
    currentWeatherUrl.searchParams.append("units", "imperial");
    currentWeatherUrl.searchParams.append("appid", APIkey);
    // TO DO handle bad request response
    fetch(currentWeatherUrl)
      .then(function (response) {
        if (response.ok){
          response.json().then(function (data) {
            console.log(data)
            var iconURL =
              "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
            $(".currentWeather").prepend(
              "<div class='border border-black border-2 rounded'>" +   
              "<h2>" + name + "</h2>" +
                "<p class='date card-title'>Date: " + dayjs().format("ddd, MMM D") + "</p>" +
                "<p class='card-subtitle text-body-secondary text-capitalize fw-lighter fst-italic'>" + data.weather[0].description +"</p>" +
                "<img class='icon w-25' src=" + iconURL +">" +
                "<p class='card-text'>Temp: " + data.main.temp + "</p>" +
                "<p class='card-text'>Humidity: " +data.main.humidity + "%</p>" + "</div> </div>" + "<h3>5 Day Forecast</h3>"
            );
          });
        }else{
          alert('Error: ' + response.statusText);
        }
      })
  }
}

function makeHistoryButton(location) {
  var historyButton = $("<button class='btn btn-secondary m-1'>" + location + "</button>");
  $(".searchHistory").prepend(historyButton);
    // for (var i = searchHistoryButtons.length; i >10; i--){
    //   searchHistoryButtons[i].remove()

    // }
  }

function sortData(forecast) {
  if (forecast){
  var today = dayjs().set("hour", 23).set("minute", 59).set("second", 59);
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
      days[0].push(forecast[i]);
    } else {
      var index = convertDay.diff(today, "day") + 1;
      days[index].push(forecast[i]);
    }
  }
  console.log(days);
  presentData(days);
}
}

function presentData(days) {
  // var dayCards = $(".dayCard");
  var start
  if (days[0].length >= 4){
    console.log("today counts as first day")
    start = 0
  }else{
    start = 1
  }
  console.log(start)
  for (var i =start; i <= start+4; i++) {
    console.log("for loop running")
    var date = dayjs.unix(days[i][1].dt).format('ddd, MMM D');
    var highTracker = null;
    var lowTracker = null;
    var humidityTracker = null;
    var iconList = [];
    var descriptionList = [];

    for (var j = 1; j < days[i].length; j++) {
      // Update high and low temps
      if (days[i][j].main.temp > highTracker || highTracker === null) {
        highTracker = days[i][j].main.temp;
      }
      if (days[i][j].main.temp < lowTracker || lowTracker === null) {
        lowTracker = days[i][j].main.temp;
      }
      // Update humidity
      if (
        days[i][j].main.humidity > humidityTracker ||
        humidityTracker === null
      ) {
        humidityTracker = days[i][j].main.humidity;
      }
      // Track icon
      iconList.push(days[i][j].weather[0].icon);
      // Track weather desciption
      descriptionList.push(days[i][j].weather[0].description);
    }

    var iconURL = "https://openweathermap.org/img/wn/" + getMostFrequent(iconList) + ".png"


    $(".fiveDayForecast").append("<div class='dayCard day1 card rounded mx-3 p-2 flex-fill'>"+
                    "<p class='date card-title'>Date: " + date +"</p>"+
                    "<p class='card-subtitle text-body-secondary text-capitalize fw-lighter fst-italic'>" + getMostFrequent(descriptionList) + "</p>"+
                    "<img class='icon w-25' src="+ iconURL + ">"+
                    "<p class='card-text'>Temp High: " + highTracker +"</p>"+
                    "<p class='card-text'>Temp Low: " + lowTracker +"</p>"+
                    "<p class='card-text'>Humidity: "+ humidityTracker +"%</p>"+
                    "</div>")
  }
}
function getMostFrequent(list) {
  if (list) {
    var freqTracker = {};
    var maxItem;
    var maxCount = 1;

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (!freqTracker[item]) {
        freqTracker[item] = 1;
      } else {
        freqTracker[item]++;
      }
      if (freqTracker[item] > maxCount) {
        maxCount = freqTracker[item];
        maxItem = item;
      }
    }
    return maxItem;
  }
}

function searchFromHistory(cityName) {
  if (cityName) {
    for (var i = 0; i < searchHistory.length; i++) {
      if (searchHistory[i].name === cityName) {
        getCurrentForecast(cityName, searchHistory[i].lat, searchHistory[i].lon)
        getWeather(searchHistory[i].lat, searchHistory[i].lon);

        return true;
      }
    }
    return false;
  }
}




// STRETCH GOALS
// Support city name search with optional state
// support zip code search
// Autofill suggestions
// If rainy, show chance of rain
// Make search button activate when you press enter
// If two weather conditions are equally likely, show both?

// LOAD PAGE
// Check localStorage ✅
// Populate search history✅
// Use latest search to get the current weather and the five day forecast. Populate dynamically✅

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

// USE A HISTORY BUTTON TO SEARCH✅

// STATS TO DISPLAY✅
// Date✅
// Convert UTC with DayJS✅
// Temp hi✅
// For loop through temperatures, update if higher✅
// Temp low✅
// For loop through temperatures, update if lower✅
// Weather icon✅
// Track how many of each kind of weather there is, and show whichever one has the most✅
// Verbose weather?✅
// list.weather.description✅
// Humidity?✅
// For loop through humidity, update if higher✅

// DISPLAY TO USER✅
// Calculate each value and assign it to the relevant text field✅

// HANDLE A CASE WHERE THE USER CHECKS AT MIDNIGHT AND TODAY BASICALLY COUNTS AS THE FIRST DAY ✅

// DELETE LONG LIST OF SEARCH HISTORY BUTTONS

// Handle bad response request✅

// Show current forecast✅

// Finish styling

// Cleanup pass

// Readme

