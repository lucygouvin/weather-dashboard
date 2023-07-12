// API Key
var APIkey = "262d8997c6aac855ba637daa6177913c";

// Declare globally as these will be used by several functions
var searchHistoryButtons
var searchHistory

// WAIT UNTIL ALL DOM ELEMENTS ARE LOADED
$(function () {

  // See if there is an existing searchHistory object in localStorage
  searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  // If not (searchHistory is null), set it equal to an empty array
  if (!searchHistory) {
    searchHistory = [];
    // Display text to let user know what to do
    $(".currentWeather").append("<h3 class='fw-light fst-italic text-center p-5'>Search a city to see weather forecast.</h3>")
  } else {
    // Make a button for the items in searchHistory
    for (var i = searchHistory.length-1; i >= 0; i--) {
      makeHistoryButton(searchHistory[i].name);
    }
    // Automatically populate the current forecast and 5 day forecast areas with the most recent searched place
    var mostRecent =  searchHistory[0]
    getCurrentForecast(mostRecent.name, mostRecent.lat, mostRecent.lon)
    getWeather(mostRecent.lat, mostRecent.lon)
  }

  searchHistoryButtons = $(".searchHistory button");
  
  // Click listeners
  $(".searchButton").on("click", searchLocation);
  $(".searchHistory").on("click", "button", function (event) {
    var cityName = $(event.target).text();
    searchFromHistory(cityName);
  });
});

// CORE FUNCTIONALITY
// Get the geocode, either from localStorage or from an API call
function searchLocation() {
  var cityName = $(".searchBar").val().trim();
  $(".searchBar").val("");

  // First check to see if the geocode exists in localStorage, to avoid extra API calls. If it's not in local storage, it'll return false, and go on to the getCoord function
  if (searchFromHistory(cityName)) {
    return;
  } else {
    getCoord(cityName);
  }
}

// Get a geocode from a string of a city's name, via API call
function getCoord(city) {
  if (city) {
    var requestGeoUrl = new URL("http://api.openweathermap.org/geo/1.0/direct");
    requestGeoUrl.searchParams.append("q", city);
    requestGeoUrl.searchParams.append("appid", APIkey);

    fetch(requestGeoUrl)
      .then(function (response) {
        if (response.ok){
          response.json().then(function (data) {
            var lat = data[0].lat;
            var lon = data[0].lon;
            // Add the new search to the search history section and to localStorage
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
            // Get the current weather and five day forecast
            getCurrentForecast(city, lat, lon)
            getWeather(lat, lon);
          });
        }else{
          // Alert user if bad request response
          alert('Error: ' + response.statusText + ". Please check that you've entered a valid city.");
        }
      })
  }
}

// Get the current weather
function getCurrentForecast(name, lat, lon){
  $(".currentWeather").empty()
  if (lat && lon) {
    var currentWeatherUrl = new URL(
      "https://api.openweathermap.org/data/2.5/weather"
    );
    currentWeatherUrl.searchParams.append("lat", lat);
    currentWeatherUrl.searchParams.append("lon", lon);
    currentWeatherUrl.searchParams.append("units", "imperial");
    currentWeatherUrl.searchParams.append("appid", APIkey);
    
    fetch(currentWeatherUrl)
      .then(function (response) {
        if (response.ok){
          response.json().then(function (data) {
            var iconURL = "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
            // Dynamically add this section to the currentWeather container in the HTML
            $(".currentWeather").prepend(
              "<div class='border border-black border-2 rounded my-2 px-4 pt-4 pb-1'>" +
              "<h2 class='border-bottom'>" + name + " - " + dayjs().format("ddd, MMM D") + "</h2>" +
              "<div class='row'>"+
              "<div class='col'>"+  
                "<p class='card-subtitle text-body-secondary text-capitalize fw-lighter fst-italic fs-4'>" + data.weather[0].description +"</p>" +
                "<img class='icon' src=" + iconURL +">" +
                "</div>"+
                "<div class='col'>"+  
                "<p class='card-text fs-4'>Temp: " + data.main.temp + "</p>" +
                "<p class='card-text fs-4'>Humidity: " +data.main.humidity + "%</p>" + "</div> </div> </div> </div>" + "<h3>5 Day Forecast</h3>"
            );
          });
        }else{
          alert('Error: ' + response.statusText);
        }
      })
  }
}

// Get five day forecast
function getWeather(lat, lon) {
  $(".fiveDayForecast").empty()
  if (lat && lon) {
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
            // Send the response to be sorted into days for easier processing
            sortData(data.list);
          });
        }else {
          alert('Error: ' + response.statusText);
        }
      })
  }
}

// Calculate the values for the data and dynamically add to the page
function presentData(days) {
  // Handles an edge case where, due to time zone difference, in the morning the returned forecast actually includes results for the current day, and it seems more correct to include them than not to.
  var start;
  // If there's at leat half a day of entries for today, include it in the five day forecast.
  if (days[0].length >= 4) {
    start = 0;
  } else {
    start = 1;
  }
  // For each of the five days in the forecast, calculate the data
  for (var i = start; i <= start + 4; i++) {
    var date = dayjs.unix(days[i][1].dt).format("ddd, MMM D");
    var highTracker = null;
    var lowTracker = null;
    var humidityTracker = null;
    var iconList = [];
    var descriptionList = [];
    // To calculate the data, do the following for each result in that day's forecast
    for (var j = 1; j < days[i].length; j++) {
      // Update high and low temps
      if (days[i][j].main.temp > highTracker || highTracker === null) {
        highTracker = days[i][j].main.temp;
      }
      if (days[i][j].main.temp < lowTracker || lowTracker === null) {
        lowTracker = days[i][j].main.temp;
      }
      // Update humidity. Show the user the highest expected humidity value for the day.
      if (
        days[i][j].main.humidity > humidityTracker || humidityTracker === null
      ) {
        humidityTracker = days[i][j].main.humidity;
      }
      // Create an array of all the returned weather icons 
      iconList.push(days[i][j].weather[0].icon);
      // TCreate an array of all the returned weather descriptions
      descriptionList.push(days[i][j].weather[0].description);
    }

    var iconURL =
      "https://openweathermap.org/img/wn/" + getMostFrequent(iconList) + ".png";

    // Dynamically create the card for this day, populate the data, and append to the fiveDayForecast section
    $(".fiveDayForecast").append(
      "<div class='text-bg-primary card rounded p-2 flex-fill'>" + "<p class='date card-title'>" + date + "</p>" +
        "<p class='card-subtitle text-body-secondary text-capitalize fw-lighter fst-italic'>" + getMostFrequent(descriptionList) + "</p>" +
        "<img class='icon w-25' src=" + iconURL + ">" +
        "<p class='card-text'>Temp High: " + highTracker + "</p>" +
        "<p class='card-text'>Temp Low: " + lowTracker + "</p>" +
        "<p class='card-text'>Humidity: " + humidityTracker + "%</p>" +
        "</div>"
    );
  }
}

// HELPER FUNCTIONS
// Sort the returned data into days for easier processing
function sortData(forecast) {
  if (forecast) {
    // We'll need to compare against today's midnight to determine where it should be sorted
    var today = dayjs().set("hour", 23).set("minute", 59).set("second", 59);
    var days = [
      [], //today. Due to time difference, the API sometimes returns a value that's actually for today.
      [], //day + 1
      [], //day + 2
      [], //day + 3
      [], //day + 4
      [], //day + 5
    ];
    for (var i = 0; i < forecast.length; i++) {
      // Convert the unix code to local time
      var convertDay = dayjs.unix(forecast[i].dt);
      if (convertDay.$D === today.$D) {
        days[0].push(forecast[i]);
      } else {
        var index = convertDay.diff(today, "day") + 1;
        days[index].push(forecast[i]);
      }
    }
    presentData(days);
  }
}

// Used with weather icon and weather description. Look at all the values returned and determine which is the most freqent, present it as the overall weather condition for the day.
function getMostFrequent(list) {
  if (list) {
    // Track the values and their frequencies in an object
    var freqTracker = {};
    var maxItem;
    var maxCount = 1;

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      // Check to see if this item already exists as a key in the object
      if (!freqTracker[item]) {
        // If it doesn't, this is the first instance, so make its value 1
        freqTracker[item] = 1;
      } else {
        // If it does, increment the value
        freqTracker[item]++;
      }
      // Check to see if the value is greater than any other value. If so, that item is the most freqent item.
      if (freqTracker[item] > maxCount) {
        maxCount = freqTracker[item];
        maxItem = item;
      }
    }
    return maxItem;
  }
}

// Create a search history button and add it to the searchHistory section
function makeHistoryButton(location) {
  var historyButton = $("<button class='btn btn-secondary m-1'>" + location + "</button>");
  $(".searchHistory").prepend(historyButton);
}

// To avoid unnecessary API calls, check to see if the city information already exists in localStorage. Return true or false for controlling the searchLocaiton function flow.
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