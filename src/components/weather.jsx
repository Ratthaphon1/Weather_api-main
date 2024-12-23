import { useState, useEffect } from "react";
import axios from "axios";
import citiesData from "./citiesData";
import "../index.css";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [defaultCitiesWeather, setDefaultCitiesWeather] = useState([]);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('url("../3.jpg")'); // Set default background image

  const weatherDescriptions = {
    "clear sky": "ท้องฟ้าแจ่มใส",
    "few clouds": "เมฆบางส่วน",
    "scattered clouds": "เมฆกระจาย",
    "broken clouds": "เมฆปกคลุมบางส่วน",
    "shower rain": "ฝนตกหนัก",
    "overcast clouds": "เมฆครึ้ม",
    rain: "ฝนตก",
    thunderstorm: "พายุฝนฟ้าคะนอง",
    snow: "หิมะตก",
    mist: "หมอก",
  };

  const fetchWeather = async (city) => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
      const response = await axios.get(url);
      const description = response.data.weather[0].description;
      return {
        city: response.data.name,
        country: response.data.sys.country,
        temperature: response.data.main.temp,
        description: weatherDescriptions[description] || description,
        humidity: response.data.main.humidity,
        icon: response.data.weather[0].icon,
      };
    } catch (err) {
      console.error(`Error fetching weather data for ${city}:`, err.message);
      return null;
    }
  };

  const fetchDefaultCitiesWeather = async () => {
    const citiesWeather = await Promise.all(
      citiesData.map((city) => fetchWeather(city))
    );
    setDefaultCitiesWeather(citiesWeather.filter(Boolean));
  };

  const handleSearch = async () => {
    if (!city) return;
    const weatherData = await fetchWeather(city);
    if (weatherData) {
      setWeather(weatherData);
      setError("");
    } else {
      setError("ไม่พบข้อมูลอากาศของเมืองนี้");
      setWeather(null);
    }
  };

  // Add a handler for the Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchDefaultCitiesWeather();
  }, []);

  // Function to handle background image change when selecting a city from sidebar
  const handleCitySelect = (cityName) => {
    setCity(cityName);
    setBackgroundImage(`url(https://source.unsplash.com/1600x900/?${cityName},weather)`); // Update background with selected city
    handleSearch(); // Perform search for the selected city
    setIsSidebarOpen(false); // Close sidebar after selection
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: backgroundImage, // Use the dynamic background image
      }}
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-transform transform shadow-lg z-20 w-64 sidebar-halloween ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 flex justify-between items-center bg-gray-800">
            <h2 className="text-xl font-bold">เมือง</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white focus:outline-none text-lg"
            >
              ✕
            </button>
          </div>
          <ul className="mt-4">
            {citiesData.map((cityName, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleCitySelect(cityName)}
              >
                {cityName}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300 h-full flex flex-col">
          <div className="container mx-auto p-4 flex-1">
            {/* Navbar */}
            <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-black/70 to-gray-800/70 backdrop-blur-md p-4 rounded-lg shadow-lg">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-4 py-2 button-halloween font-semibold rounded-lg shadow hover:bg-red-600 lg:hidden"
              >
                เมือง
              </button>
              <h1 className="text-2xl font-bold text-orange-500">🎃 Weather App</h1>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ค้นหาเมือง"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={handleKeyPress} // Add this line to listen for Enter key
                  className="px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring focus:ring-orange-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 button-halloween font-semibold rounded-lg shadow"
                >
                  ค้นหา
                </button>
              </div>
            </div>

            {/* Alert Banner */}
            {error && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 z-50">
                <div className="bg-red-100 border border-red-400 text-red-700 w-full max-w-md p-4 rounded-lg shadow-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-red-500 mr-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="font-semibold text-lg flex-1">{error}</span>
                    <button
                      onClick={() => setError("")}
                      className="text-black hover:text-gray-400 focus:outline-none text-xl p-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Weather Info */}
            {weather && (
              <div className="max-w-md mx-auto rounded-lg shadow-lg overflow-hidden bg-halloween text-white">
                <div
                  className="w-20 h-20 mx-auto bg-no-repeat bg-center bg-contain"
                  style={{
                    backgroundImage: `url(https://openweathermap.org/img/wn/${weather.icon}@2x.png)`,
                  }}
                ></div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-bold mb-2">
                    🎃 เมือง: {weather.city}, {weather.country}
                  </h3>
                  <p>🌕 อุณหภูมิ: {weather.temperature}°C</p>
                  <p>💀 ความชื้น: {weather.humidity}%</p>
                  <p>👻 สภาพอากาศ: {weather.description}</p>
                </div>
              </div>
            )}

            {/* Default Cities */}
            <h2 className="text-3xl font-bold text-center mb-6 text-orange-300">
              ข้อมูลอากาศเมือง
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {defaultCitiesWeather.slice(0, 8).map((cityWeather, index) => (
                <div
                  key={index}
                  className="relative rounded-lg shadow-md overflow-hidden bg-halloween text-white"
                >
                  <div className="relative w-full h-20 flex items-center justify-center">
                    <div
                      className="w-16 h-16 bg-no-repeat bg-center bg-contain"
                      style={{
                        backgroundImage: `url(https://openweathermap.org/img/wn/${cityWeather.icon}@2x.png)`,
                      }}
                    ></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-center">
                      เมือง: {cityWeather.city}, {cityWeather.country}
                    </h3>
                    <p>อุณหภูมิ: {cityWeather.temperature}°C</p>
                    <p>ความชื้น: {cityWeather.humidity}%</p>
                    <p>สภาพอากาศ: {cityWeather.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
