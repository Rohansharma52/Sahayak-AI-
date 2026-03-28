import type { WeatherData } from "@/services/weatherService";
import { decodeWeatherCode } from "@/services/weatherService";

export interface FarmingAdvice {
  text: string;
  textHi: string;
  color: string;   // tailwind text color
  bg: string;      // tailwind bg color
  icon: string;
  isSpraySafe: boolean;
  sprayAdvice: string;
  sprayAdviceHi: string;
  irrigationAdvice: string;
  irrigationAdviceHi: string;
}

export function getWeatherAdvice(w: WeatherData): FarmingAdvice {
  const isRain = w.weathercode >= 51 && w.weathercode <= 84;
  const isThunder = w.weathercode >= 85;
  const highWind = w.windspeed > 20;

  let advice: FarmingAdvice = {
    text: "Weather looks suitable for normal farming activity.",
    textHi: "✅ मौसम अनुकूल है — खेती के लिए अच्छा समय।",
    color: "text-green-700", bg: "bg-green-50", icon: "✅",
    isSpraySafe: true,
    sprayAdvice: "Safe to spray pesticides today.",
    sprayAdviceHi: "आज छिड़काव करना सुरक्षित है।",
    irrigationAdvice: "Good time for irrigation.",
    irrigationAdviceHi: "सिंचाई के लिए अच्छा समय है।",
  };

  if (isThunder) {
    advice = {
      ...advice,
      text: "Thunderstorm alert! Stay indoors.",
      textHi: "⚡ आंधी-तूफान! घर के अंदर रहें।",
      color: "text-red-700", bg: "bg-red-50", icon: "⛈️",
      isSpraySafe: false,
      sprayAdvice: "Not safe! Avoid spraying during storm.",
      sprayAdviceHi: "सुरक्षित नहीं! तूफान में छिड़काव न करें।",
    };
  } else if (isRain) {
    advice = {
      ...advice,
      text: "Rain today — skip irrigation.",
      textHi: "🌧️ आज बारिश है — सिंचाई न करें।",
      color: "text-blue-700", bg: "bg-blue-50", icon: "🌧️",
      isSpraySafe: false,
      sprayAdvice: "Avoid spraying. Rain will wash it away.",
      sprayAdviceHi: "छिड़काव न करें। बारिश से धुल जाएगा।",
      irrigationAdvice: "Rain likely – skip irrigation today.",
      irrigationAdviceHi: "बारिश की संभावना – आज सिंचाई न करें।",
    };
  } else if (highWind) {
    advice = {
      ...advice,
      text: "Strong winds — avoid spraying.",
      textHi: "💨 तेज़ हवा — छिड़काव न करें।",
      color: "text-purple-700", bg: "bg-purple-50", icon: "💨",
      isSpraySafe: false,
      sprayAdvice: "Too windy for effective spraying.",
      sprayAdviceHi: "तेज़ हवा के कारण छिड़काव न करें।",
    };
  }

  if (w.temperature > 38) {
    advice.irrigationAdvice = "Extreme heat! Irrigate early morning or late evening.";
    advice.irrigationAdviceHi = "अत्यधिक गर्मी! सुबह जल्दी या देर शाम सिंचाई करें।";
  }

  return advice;
}
