$(document).ready(function(){
    const positionStackKey = "2cbc1624cc721b8a57999bd909b90f3e";
    const positionStackUrl = `http://api.positionstack.com/v1/forward?access_key=${positionStackKey}&query=`;
    const openWeatherKey = "b1f7b1c8cfc3521c9192c855eb16bfa9";
    const openWeatherUrl = `http://api.openweathermap.org/data/2.5/onecall?`;
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

    //Date calculating functions
    const getCurrentDate = () => {
        const today = new Date();
        let minutes = today.getMinutes();
        if (minutes < 10) minutes = `0${minutes}`;

        if (today.getHours() > 12) return `${today.getHours() - 12}:${minutes} p.m ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
        if (today.getHours() == 0) return `${today.getHours() + 12 }:${today.getMinutes()} a.m ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`
        return `${today.getHours()}:${today.getMinutes()} a.m ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    }

    const getForecastDates = () => {
        const today = new Date();
        let month = "";
        let day = "";
        let futureDates = [];
        console.log(today.getMonth());

        for (let i = 0; i < 6; i++) {
            switch (today.getMonth()) {
                case 0:
                case 2:
                case 4:
                case 6:
                case 7:
                case 9:
                case 11:
                    if(today.getDate() + i == 31) {
                        month = monthNames[(today.getMonth() + 1) % 11];
                        day = (today.getDate() + i + 1) % 31;
                    }
                    else {
                        month = monthNames[today.getMonth()];
                        day = today.getDate() + i + 1;
                    }
                    futureDates[i] = `${month.slice(0, 3)}. ${day}`;
                    break;
                case 3:
                case 5:
                case 8:
                case 10:
                    if(today.getDate() + i == 30) {
                        month = monthNames[(today.getMonth() + 1) % 11];
                        day = (today.getDate() + i + 1) % 30;
                    }
                    else {
                        month = monthNames[today.getMonth()];
                        day = today.getDate() + i + 1;
                    }
                    futureDates[i] = `${month.slice(0, 3)}. ${day}`;
                    break;
                case 1:
                    if((today.getFullYear() % 4 == 0) && (today.getFullYear() % 100 == 0) && (today.getFullYear() % 400 == 0)) {
                        if(today.getDate() + i == 29) {
                            month = monthNames[(today.getMonth() + 1) % 11];
                            day = (today.getDate() + i + 1) % 29;
                        }
                        else {
                            month = monthNames[today.getMonth()];
                            day = today.getDate() + i + 1;
                        }
                        futureDates[i] = `${month.slice(0, 3)}. ${day}`;
                        break;
                    }
                    else {
                        if(today.getDate() + i == 28) {
                            month = monthNames[(today.getMonth() + 1) % 11];
                            day = (today.getDate() + i + 1) % 28;
                        }
                        else {
                            month = monthNames[today.getMonth()];
                            day = today.getDate() + i + 1;
                        }
                        futureDates[i] = `${month.slice(0, 3)}. ${day}`;
                        break;
                    }
            } 
        }

        return futureDates;
    }


    //API calling function
    const getWeather = (location) => {
        $.get(`${positionStackUrl}${location}`, function(result) {
            if (result.data.length === 0) {
                $("#weather-container").html('<h2 id="weather-error">Could not find location please try again</h2>');
                $(".forecast-container").html("");
            }
            else {
                const latitude = result.data[0].latitude;
                const longitude = result.data[0].longitude;

                $.get(`${openWeatherUrl}lat=${latitude}&lon=${longitude}&exclude=minutely,hourly&units=metric&appid=${openWeatherKey}`, function(result) {
                    //console.log(result.current.weather[0].main);
                    displayCurrentWeather(result);
                    displayWeatherIcon(result.current.weather[0].main);
                    if(!$.trim($(".forecast-container").html())) insertCards();
                    displayForecast(getForecastDates(), result.daily);
                })
            }
            

        })
    }


    //Data displaying functions
    const displayCurrentWeather = (data) => {
        $("#weather-container").html(`<div id="weather-container-temp">
                                        <span id="weather-temp"></span>
                                        <div id="weather-container-icon">
                                            <img src="" id="weather-icon">
                                        </div>
                                    </div>
                                    <div id="weather-container-info">
                                        <span id="weather-temp-high"></span>
                                        <span id="weather-temp-low"></span>
                                    </div>`)

        $("#weather-temp").text(`${Math.floor(data.current.temp)}\u00B0C`);
        $("#weather-temp-high").text(`High: ${Math.floor(data.daily[0].temp.max)}\u00B0C`);
        $("#weather-temp-low").text(`Low: ${Math.floor(data.daily[0].temp.min)}\u00B0C`);
    }
    
    const displayForecast = (dates, data) => {
        $(".forecast-date").each((i, e) => {
            $(e).text(dates[i]);
        })

        $(".forecast-temp").each((i, e) => {
            $(e).text(`${Math.floor(data[i + 1].temp.day)}\u00B0C`);
        })

        $(".forecast-wind").each((i, e) => {
            $(e).text(`Wind: ${data[i + 1].wind_speed} km/h`);
        })

        $(".forecast-humidity").each((i, e) => {
            $(e).text(`Humidity: ${data[i + 1].humidity}`);
        })  
    }

    const insertCards = () => {
        const cardHtml = `<div class="forecast-card">
                            <div class="forecast-container-date">
                                <span class="forecast-date"></span>
                            </div>
                            <div class="forecast-container-temp">
                                <span class="forecast-temp"></span>
                            </div>
                            <div class="forecast-container-info">
                                <span class="forecast-wind"></span>
                                <span class="forecast-humidity"></span>
                            </div>
                        </div>`

        for (let i = 0; i < 6; i++) {
            $(".forecast-container").append(cardHtml);
        }
    }

    const displayWeatherIcon = (currentCondition) => {
        const today = new Date();
        let currentTime = "";
        if (today.getHours() >= 7 && today.getHours() <= 19) currentTime = "day";
    
        switch(currentCondition.toLowerCase()) {
            case "thunderstorm":
                $("#weather-icon").attr("src", "./assets/SVG/thunder.svg");
                break;
            case "drizzle":
            case "rain":
                $("#weather-icon").attr("src", "./assets/SVG/rain.svg");
                break;
            case "snow":
                $("#weather-icon").attr("src", "./assets/SVG/snow.svg");
                break;
            case "clouds":
                if (currentTime == "day") $("#weather-icon").attr("src", "./assets/SVG/cloudy-day.svg");
                else $("#weather-icon").attr("src", "./assets/SVG/cloudy-night.svg");
                break;
            case "clear":
                if (currentTime == "day") $("#weather-icon").attr("src", "./assets/SVG/sunny.svg");
                else $("#weather-icon").attr("src", "./assets/SVG/clear-night.svg");
                break;
            default:
                $("#weather-icon").attr("src", "./assets/SVG/wind.svg");
                break;
        }
    }

    //Events
    $("#header-time").text(getCurrentDate())

    $("#header-input").keydown(function(event) {
        const location = $(this).val();
        if(event.key == 'Enter')
        {   
            getWeather(location);
        }
        
    })
});