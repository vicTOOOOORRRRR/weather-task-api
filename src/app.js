require("dotenv").config(); //loads the .env

//import and setup express
const express = require("express");
const app = express();
const path = require("path");

//define port
const PORT = process.env.PORT || 3000;

app.use(express.json()); //allow server to parse json requests
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api", (req, res) => { //test the route
    res.json({ message: "Weather Task API is running" });
});


app.get("/api/cities", async (req, res) => { //get city list
  const city = req.query.city;

  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

app.get("/api/weather", async (req, res) => {//get weather
  const { city, lat, lon } = req.query;

  let url;

  if (lat && lon) { //search by lat and long
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`;
  } 
  else if (city) {//or search by name (not used in current frontend)
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`;
  } 
  else {
    return res.json({ error: "City is required" });
  }

  try {
    //gets the weather data 
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return res.json({ error: "City not found" });
    }

    res.json({
      city: data.name,
      country: data.sys.country,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      weather: {
        temperature: data.main.temp,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        humidity: data.main.humidity,
        condition: data.weather[0].description
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

app.listen(PORT, (error) => { // runs server
    if (!error) 
        console.log(`Server running on port ${PORT}`);
    else 
        console.log("Error occured, server can't start: ", error);
    
});