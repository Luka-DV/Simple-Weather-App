//Simple weather app

"use strict";

document.querySelector('button').addEventListener('click', () => {
  newCity.getLocation();
})

document.querySelector("#reset").addEventListener("click", () => {
  newCity.clearWeatherData();
});

document.body.addEventListener("keydown", e => {
  if(e.key === "Enter") {
      document.querySelector("#show-weather").click();
  }
})

class weatherApp {

  async getLocation() {
    const choice = document.querySelector('input').value
    const url = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=LjV7oCVZtTOW5rxriX4N73BRqKIlZ41M&q=${choice}`

    await this.clearLocalStorage();
  
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
          console.log(data, "LOCATION API data")

          const location = data[0].LocalizedName;
          const country = data[0].Country.LocalizedName;
          this.showLocationInHeader(location, country);

          const cityKey = data[0].Key;
          this.getWeather(cityKey);
        })
        .catch(err => {
          this.clearWeatherData();
          document.querySelector(".header p").innerText = `Sorry, couldn't find any weather data for "${choice}"`
          console.log(`error ${err}`)
        });
     }

  getWeather(key) {

    const url = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${key}?apikey=LjV7oCVZtTOW5rxriX4N73BRqKIlZ41M&metric=true`

      fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
          console.log(data, "WEATHER API data")
          let dayNum = 1;
          for (let element of data.DailyForecasts) {

            const date = this.formatDate(element.Date);

            this.transferToLocalStorage(element, date);

            document.querySelector(`#day${dayNum} .date`).innerText = date;

            document.querySelector(`#day${dayNum} .weather`).innerText = `Weather: ${element.Day.IconPhrase}`;

            document.querySelector(`#day${dayNum} .tempMax`).innerText = `Highest temperature: ${element.Temperature.Maximum.Value}°C`;

            document.querySelector(`#day${dayNum} .tempMin`).innerText = `Lowest temperature: ${element.Temperature.Minimum.Value}°C`;

            dayNum++;
          };

          this.clearHidden();
      
        })
        .catch(err => {
            console.log(`error ${err}`);
        });
     }



  showLocationInHeader(location, country) {
    document.querySelector(".header p").innerText = `Forecast for ${location}, ${country}:`

    //save to localStorage:
    localStorage.setItem("locationHeader", `Forecast for ${location}, ${country}:`);
  }

  transferToLocalStorage(element, date) {

    const dailyWeather = [date, `Weather: ${element.Day.IconPhrase}`, `Highest temperature: ${element.Temperature.Maximum.Value}°C`, `Lowest temperature: ${element.Temperature.Minimum.Value}°C`];

    if(!localStorage.getItem("weatherData")) {
      localStorage.setItem("weatherData", JSON.stringify([dailyWeather]));
    } else {
      const existingData = JSON.parse(localStorage.getItem("weatherData"));
      existingData.push(dailyWeather);
      localStorage.setItem("weatherData", JSON.stringify(existingData));
  
    } 
  }

  getDataFromLocalStorage() {

    if(localStorage.weatherData) {
      //location:
      document.querySelector(".header p").innerText = localStorage.getItem("locationHeader");
      //weather:
      const weatherData = JSON.parse(localStorage.getItem("weatherData"));
      console.log(weatherData, "localStorage");

      let dayNum = 1;
      for (let dailyData of weatherData) {

        document.querySelector(`#day${dayNum} .date`).innerText = dailyData[0];
        document.querySelector(`#day${dayNum} .weather`).innerText = dailyData[1];
        document.querySelector(`#day${dayNum} .tempMax`).innerText = dailyData[2];
        document.querySelector(`#day${dayNum} .tempMin`).innerText = dailyData[3];

        dayNum++;
      };
    }
  }

  clearLocalStorage() {
      localStorage.removeItem("weatherData");
  }

  formatDate(originalDateString) {
    const date = new Date(originalDateString);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formatedtDate = `${day < 10? "0": ""}${day}.${month < 10? "0" : ""}${month}.${year}`

    return formatedtDate;

  }

  clearWeatherData() {
    this.clearLocalStorage();
    //clear shown weather data
    this.addHidden();
    document.querySelector(".header p").innerText = null;
    document.querySelector("header input").value = null;
    for (let dayNum = 1; dayNum <= 5; dayNum++) {
      document.querySelector(`#day${dayNum} .date`).innerText = "";
      document.querySelector(`#day${dayNum} .weather`).innerText = "";
      document.querySelector(`#day${dayNum} .tempMax`).innerText = "";
      document.querySelector(`#day${dayNum} .tempMin`).innerText = "";
    };
  }


  clearHidden() {
    document.querySelector(".forecast").classList.remove("hidden");
  }

  addHidden() {
    document.querySelector(".forecast").classList.add("hidden");
  }

  checkLocalStorage() {
    if(localStorage.weatherData) {
      this.clearHidden();
    }
  }
}

const newCity = new weatherApp();

newCity.checkLocalStorage();

newCity.getDataFromLocalStorage();



