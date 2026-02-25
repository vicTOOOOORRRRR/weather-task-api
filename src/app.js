require("dotenv").config();
const express = require("express");

const app = express();
const path = require("path");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api", (req, res) => { //define the route
    res.json({ message: "Weather Task API is running" });
});

const axios = require("axios");

app.get("/api/weather", async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: "City is required" });
    }

    try {
        const response = await axios.get(
            "https://api.openweathermap.org/data/2.5/weather",
            {
                params: {
                    q: `${city},US`,
                    appid: process.env.OPENWEATHER_API_KEY,
                    units: "imperial"
                }
            }
        );

        const data = response.data;

        res.json({
            city: data.name,
            weather : {
                temperature: Math.round(data.main.temp * 10) / 10, 
                temp_min: Math.round(data.main.temp_min * 10) / 10,
                temp_max: Math.round(data.main.temp_max * 10) / 10,
                humidity: data.main.humidity,
                condition: data.weather[0].description,
            },
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset
        });

    } catch (error) {
        if (error.response) {
            return res.status(500).json({ error: "City not found" });
        }

        res.status(500).json({ error: "Weather service unavailable" });
    }
});

app.listen(PORT, (error) => { // runs server
    if (!error) 
        console.log(`Server running on port ${PORT}`);
    else 
        console.log("Error occured, server can't start: ", error);
    
});