import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import weather from '../static/images/weather.png'
import sunny from '../static/images/sun.png'
import rainy from '../static/images/rainy.png'
import cloudy from '../static/images/cloudy.png'
import storm from '../static/images/storm.png'
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    faBookReader,
    faClock,
    faCloudMoonRain,
    faSearch,
    faTemperatureHalf,
    faTemperatureHigh,
    faTemperatureLow,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../weather/weather.module.css";
import axios from "axios";

function Weather() {
    const [city, setCity] = useState("");
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [weatherData, setWeatherData] = useState(null);
    const apiKey = "SYT8YMGLCNSNVEY68N3QAF9KF";

    // Function to map API icons to local images
    const getImageForIcon = (icon) => {
        if (icon.includes('rain')) {
            return rainy;
        } else if (icon.includes('storm')) {
            return storm;
        } else if (icon.includes('cloud')) {
            return cloudy;
        } else if (icon.includes('clear')) {
            return sunny;
        } else {
            return sunny; // Default image for unknown icons
        }
    };

    // to get the current loction permission
    useEffect(() => {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };

        function success(pos) {
            const crd = pos.coords;
            setLocation({ latitude: crd.latitude, longitude: crd.longitude });
        }

        function errors(err) {
            toast.warn(`ERROR(${err.code}): ${err.message}`,{autoClose: 2000});
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.permissions
                    .query({ name: "geolocation" })
                    .then(function (result) {
                        if (result.state === "granted") {
                            toast.success(`Location permision ${result.state}`,{autoClose: 2000})
                            // If granted, you can directly call your function here
                            navigator.geolocation.getCurrentPosition(success);
                        } else if (result.state === "prompt") {
                            navigator.geolocation.getCurrentPosition(
                                success,
                                errors,
                                options
                            );
                        } else if (result.state === "denied") {
                            // If denied, you have to show instructions to enable location
                            toast.error(`Location access denied. Please enable location services.`,{autoClose: 2000})
                        }
                        result.onchange = function () {
                            console.log(`${result.state}`)
                        };
                    });
            } else {
                toast.warn(`Sorry, geolocation is not available!`,{autoClose: 2000});
            }
        }

        getLocation();
    }, []);

    // to get the next 5 days weather report
    useEffect(() => {
        if (location.latitude && location.longitude) {
            const fetchWeatherData = async () => {
                try {
                    const response = await axios.get(
                        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location.latitude},${location.longitude}?key=${apiKey}`
                    );
                    setWeatherData(response.data);
                } catch (error) {
                    toast.error(`Error fetching weather data: ${error}`,{autoClose: 2000})
                }
            };

            fetchWeatherData();
        }
    }, [location, apiKey]);

    // to get the sercg city weather report
    const handleInputChange = (event) => {
        setCity(event.target.value);
    };
    const handleSearch = (event) => {
        event.preventDefault();
        setQuery(city);
    };

    useEffect(() => {
        if (query) {
            const fetchWeatherDataByCity = async () => {
                try {
                    const response = await axios.get(
                        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${query}?key=${apiKey}`
                    );
                    setWeatherData(response.data);
                    toast.success(`Showing result for ${query}`,{autoClose: 2000})
                } catch (error) {
                    toast.error(`Error fetching weather data: ${error}`,{autoClose: 2000})
                }
            };

            fetchWeatherDataByCity();
        }
    }, [query, apiKey]);

    return (
        <>
            <nav className="navbar navbar-light bg-light ">
                <div className="container-fluid">
                    <p className="navbar-brand fw-bold text-primary">
                        <FontAwesomeIcon icon={faCloudMoonRain} /> Weather Forecast
                    </p>
                    <form className="d-flex" onSubmit={handleSearch}>
                        <input
                            className="form-control me-2"
                            type="search"
                            value={city}
                            onChange={handleInputChange}
                            placeholder="Enter city name"
                            aria-label="Search"
                        />
                        <button
                            className="btn btn-primary fw-bold"
                            style={{ width: "150px" }}
                            type="submit"
                        >
                            Search <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </form>
                </div>
            </nav>
            <div className={styles.weatherContainerDiv}>
                <div className={styles.weatherContainer}>
                    <h2 className="text-center">
                        Showing weather for {query || "current location"}
                    </h2>
                    {weatherData ? (
                        <div className="container">
                            <div className=" p-3 shadow border-2 rounded-3 bg-light d-flex row ">
                                <div className="col-8 text-start">
                                    <h4> Timezone <FontAwesomeIcon icon={faClock} />: {weatherData.timezone} </h4>
                                    <p> Description <FontAwesomeIcon icon={faBookReader} />: {weatherData.description} </p>
                                </div>
                                <div className="col-auto text-end">
                                    <img className={styles.weatherimg} src={weather} />
                                </div>
                                <div className="col-auto text-end">
                                    <h3 className="text-primary"><FontAwesomeIcon icon={faTemperatureHalf} /> {weatherData.currentConditions.temp}°C</h3>
                                    <p className="fw-bold text-info">{weatherData.currentConditions.conditions}</p>
                                </div>
                            </div>
                            <ul className={styles.weatherUl}>
                                {weatherData.days.slice(0, 5).map((day, index) => (
                                    <li className={`${styles.weatherCard} ${styles.weatherLi}`} key={index}>
                                        <h2 className="fw-bold"> {day.datetime}</h2>
                                        <p className="text-center fw-bold text-dark">{day.conditions}</p>
                                        <img
                                            className={styles.cardImg}
                                            src={getImageForIcon(day.icon)}
                                            alt={day.conditions}
                                            style={{ width: "50px", height: "50px" }}
                                        />
                                        <div className="d-flex row">
                                            <div className="col-5">
                                                <p className="text-danger fw-bold">Max <FontAwesomeIcon icon={faTemperatureHigh} /> {day.tempmax}°C</p>
                                                <p className="text-primary fw-bold">Min <FontAwesomeIcon icon={faTemperatureLow} /> {day.tempmin}°C</p>
                                            </div>
                                            <div className="col text-end">
                                                <p className="fw-bold text-muted">Wind: {day.windspeed} km/h</p>
                                                <p className="fw-bold text-muted">Pressure: {day.pressure} hPa</p>
                                            </div>
                                            <h5 className="m-2">{day.description}</h5>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
            <ToastContainer />
        </>
    );
}

export default Weather;
