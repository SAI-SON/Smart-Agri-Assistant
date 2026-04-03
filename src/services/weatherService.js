const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function getWeatherByCity(city) {
  const resp = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`
  );
  if (!resp.ok) throw new Error('City not found');
  return resp.json();
}

export async function getForecastByCity(city) {
  const resp = await fetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`
  );
  if (!resp.ok) throw new Error('Forecast not available');
  return resp.json();
}

export async function getWeatherByCoords(lat, lon) {
  const resp = await fetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
  );
  if (!resp.ok) throw new Error('Weather data not available');
  return resp.json();
}

export async function getForecastByCoords(lat, lon) {
  const resp = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
  );
  if (!resp.ok) throw new Error('Forecast not available');
  return resp.json();
}

export function getWeatherIcon(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function getWeatherEmoji(main) {
  const map = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Haze: '🌫️',
    Fog: '🌫️',
    Smoke: '🌫️',
    Dust: '🌪️',
  };
  return map[main] || '🌤️';
}

export function getFarmingTip(weather) {
  const temp = weather.main.temp;
  const humidity = weather.main.humidity;
  const main = weather.weather[0].main;

  const tips = [];

  if (main === 'Rain' || main === 'Drizzle') {
    tips.push('🌧️ Rain expected — skip irrigation today and save water');
    tips.push('⚠️ Monitor fields for waterlogging');
    tips.push('🍄 Watch for fungal infections in humid conditions');
  } else if (main === 'Clear' && temp > 35) {
    tips.push('🔥 Extreme heat — irrigate during early morning or evening');
    tips.push('🌿 Apply mulching to retain soil moisture');
    tips.push('💧 Consider drip irrigation for water efficiency');
  } else if (main === 'Clear') {
    tips.push('☀️ Great day for outdoor farming activities');
    tips.push('🌱 Good conditions for sowing and transplanting');
  } else if (main === 'Clouds') {
    tips.push('☁️ Overcast skies — good for transplanting seedlings');
    tips.push('🧪 Ideal conditions for pesticide application');
  }

  if (humidity > 80) {
    tips.push('💧 High humidity — increased risk of pest infestation');
  }

  if (temp < 10) {
    tips.push('🥶 Cold temperatures — protect crops with covers');
    tips.push('🌡️ Delay sowing temperature-sensitive crops');
  }

  return tips.length > 0 ? tips : ['✅ Normal conditions — continue regular farming operations'];
}
