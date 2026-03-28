// Open-Meteo API — completely free, no API key required
// Docs: https://open-meteo.com/en/docs

export interface WeatherData {
  temperature: number;   // °C
  windspeed: number;     // km/h
  humidity: number;      // %
  weathercode: number;   // WMO code
  time: string;          // ISO string
  latitude: number;
  longitude: number;
  city: string;
  rainProbability: number;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    precipitation_probability_max: number[];
  };
  hourly: {
    precipitation: number[];
    time: string[];
  };
}

export interface LocationPreset {
  name: string;
  nameHi: string;
  lat: number;
  lon: number;
}

// Major Indian farming cities
export const LOCATIONS: LocationPreset[] = [
  { name: "Meerut",       nameHi: "मेरठ",        lat: 28.98, lon: 77.70 },
  { name: "Delhi",        nameHi: "दिल्ली",       lat: 28.61, lon: 77.21 },
  { name: "Lucknow",      nameHi: "लखनऊ",        lat: 26.85, lon: 80.95 },
  { name: "Kanpur",       nameHi: "कानपुर",       lat: 26.46, lon: 80.33 },
  { name: "Patna",        nameHi: "पटना",         lat: 25.59, lon: 85.14 },
  { name: "Jaipur",       nameHi: "जयपुर",        lat: 26.91, lon: 75.79 },
  { name: "Bhopal",       nameHi: "भोपाल",        lat: 23.26, lon: 77.41 },
  { name: "Nagpur",       nameHi: "नागपुर",       lat: 21.15, lon: 79.09 },
  { name: "Pune",         nameHi: "पुणे",         lat: 18.52, lon: 73.86 },
  { name: "Ahmedabad",    nameHi: "अहमदाबाद",     lat: 23.03, lon: 72.58 },
  { name: "Amritsar",     nameHi: "अमृतसर",       lat: 31.63, lon: 74.87 },
  { name: "Ludhiana",     nameHi: "लुधियाना",     lat: 30.90, lon: 75.85 },
  { name: "Hyderabad",    nameHi: "हैदराबाद",     lat: 17.38, lon: 78.49 },
  { name: "Chennai",      nameHi: "चेन्नई",       lat: 13.08, lon: 80.27 },
  { name: "Kolkata",      nameHi: "कोलकाता",      lat: 22.57, lon: 88.36 },
];

// WMO Weather Code → description + emoji
export function decodeWeatherCode(code: number): { label: string; labelHi: string; emoji: string } {
  if (code === 0)              return { label: "Clear Sky",          labelHi: "साफ आसमान",        emoji: "☀️" };
  if (code <= 2)               return { label: "Partly Cloudy",      labelHi: "आंशिक बादल",       emoji: "⛅" };
  if (code === 3)              return { label: "Overcast",           labelHi: "बादल छाए",          emoji: "☁️" };
  if (code <= 49)              return { label: "Foggy",              labelHi: "कोहरा",             emoji: "🌫️" };
  if (code <= 59)              return { label: "Drizzle",            labelHi: "बूंदाबांदी",        emoji: "🌦️" };
  if (code <= 69)              return { label: "Rain",               labelHi: "बारिश",             emoji: "🌧️" };
  if (code <= 79)              return { label: "Snow",               labelHi: "बर्फबारी",          emoji: "❄️" };
  if (code <= 84)              return { label: "Rain Showers",       labelHi: "बौछारें",           emoji: "🌦️" };
  if (code <= 94)              return { label: "Thunderstorm",       labelHi: "आंधी-तूफान",        emoji: "⛈️" };
  return                              { label: "Thunderstorm+Hail",  labelHi: "ओलावृष्टि",         emoji: "🌩️" };
}

export async function getWeather(lat: number, lon: number, city: string): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation,relative_humidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&past_days=2&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = await res.json();
    const cw = json.current_weather;
    if (!cw) return null;

    // Current index in hourly data
    const now = new Date();
    const currentHourStr = now.toISOString().split(':')[0] + ':00';
    const hourIndex = json.hourly.time.findIndex((t: string) => t.startsWith(currentHourStr));
    const humidity = hourIndex !== -1 ? json.hourly.relative_humidity_2m[hourIndex] : 60;
    const rainProb = json.daily.precipitation_probability_max[2]; // Index 2 is today (0: d-2, 1: d-1, 2: today)

    return {
      temperature: Math.round(cw.temperature),
      windspeed:   Math.round(cw.windspeed),
      humidity:    humidity,
      weathercode: cw.weathercode,
      time:        cw.time,
      latitude:    lat,
      longitude:   lon,
      city,
      rainProbability: rainProb,
      daily: json.daily,
      hourly: json.hourly,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}
