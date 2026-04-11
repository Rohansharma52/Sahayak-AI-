// Smart Farm Predictor — uses real weather data + crop knowledge
// No ML library needed — rule-based expert system trained on agricultural science

export interface FarmSetup {
  crop: string;
  cropHi: string;
  sowDate: string;
  landAcres: number;
  soilType: "sandy" | "loamy" | "clay" | "black";
  lat: number;
  lon: number;
  location: string;
  state?: string;
  district?: string;
}

export interface WeatherForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  rainMm: number;
  rainProb: number;
  weatherCode: number;
  humidity: number;
  windspeed: number;
  evapotranspiration: number; // mm/day — key for irrigation
}

export interface DailyTask {
  date: string;
  dateHi: string;
  tasks: Task[];
  urgency: "normal" | "important" | "urgent";
}

export interface Task {
  emoji: string;
  title: string;
  titleHi: string;
  desc: string;
  descHi: string;
  type: "irrigation" | "fertilizer" | "spray" | "harvest" | "sow" | "weather" | "general";
}

export interface IrrigationAdvice {
  shouldIrrigate: boolean;
  reason: string;
  reasonHi: string;
  nextIrrigationDate: string;
  waterAmountLiters: number;
  bestTime: string;
  bestTimeHi: string;
  urgency: "skip" | "normal" | "urgent";
}

// Crop water requirements (mm per day at peak growth)
const CROP_WATER: Record<string, { daily: number; interval: number; rootDepth: number }> = {
  "Wheat":     { daily: 4,  interval: 7,  rootDepth: 60 },
  "Rice":      { daily: 8,  interval: 2,  rootDepth: 30 },
  "Maize":     { daily: 5,  interval: 5,  rootDepth: 60 },
  "Sugarcane": { daily: 7,  interval: 4,  rootDepth: 80 },
  "Cotton":    { daily: 5,  interval: 6,  rootDepth: 90 },
  "Mustard":   { daily: 3,  interval: 10, rootDepth: 50 },
  "Soybean":   { daily: 5,  interval: 6,  rootDepth: 60 },
  "Chickpea":  { daily: 3,  interval: 12, rootDepth: 60 },
  "Tomato":    { daily: 6,  interval: 3,  rootDepth: 40 },
  "Onion":     { daily: 5,  interval: 4,  rootDepth: 30 },
};

// Soil water holding capacity (mm per cm depth)
const SOIL_WHC: Record<string, number> = {
  sandy: 0.8, loamy: 1.5, clay: 1.8, black: 2.0,
};

export async function fetchForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max,et0_fao_evapotranspiration`
    + `&hourly=relative_humidity_2m`
    + `&timezone=Asia/Kolkata&forecast_days=7`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  const d = data.daily;

  return d.time.map((date: string, i: number) => ({
    date,
    tempMax: Math.round(d.temperature_2m_max[i]),
    tempMin: Math.round(d.temperature_2m_min[i]),
    rainMm: +(d.precipitation_sum[i] ?? 0).toFixed(1),
    rainProb: d.precipitation_probability_max[i] ?? 0,
    weatherCode: d.weathercode[i],
    humidity: Math.round((data.hourly?.relative_humidity_2m?.[i * 24] ?? 60)),
    windspeed: Math.round(d.windspeed_10m_max[i] ?? 0),
    evapotranspiration: +(d.et0_fao_evapotranspiration[i] ?? 4).toFixed(1),
  }));
}

export function predictIrrigation(
  farm: FarmSetup,
  forecast: WeatherForecast[],
  lastIrrigatedDaysAgo: number
): IrrigationAdvice {
  const crop = CROP_WATER[farm.crop] ?? CROP_WATER["Wheat"];
  const soil = SOIL_WHC[farm.soilType] ?? 1.5;
  const today = forecast[0];

  // Total rain in next 2 days
  const upcomingRain = forecast.slice(0, 2).reduce((s, d) => s + d.rainMm, 0);
  const todayET = today.evapotranspiration;

  // Soil water deficit (simplified)
  const waterDeficit = (lastIrrigatedDaysAgo * crop.daily) - upcomingRain;
  const fieldCapacity = soil * crop.rootDepth;
  const deficitPct = Math.min(100, Math.round((waterDeficit / fieldCapacity) * 100));

  // Water amount needed (liters per acre)
  const litersPerAcre = Math.round(waterDeficit * 4047 / 10); // 1mm = 1L/m² = 4047L/acre
  const totalLiters = Math.round(litersPerAcre * farm.landAcres);

  // Decision logic
  if (upcomingRain > 10) {
    return {
      shouldIrrigate: false,
      reason: `Rain expected (${upcomingRain.toFixed(0)}mm). Skip irrigation.`,
      reasonHi: `बारिश आने वाली है (${upcomingRain.toFixed(0)}mm)। सिंचाई न करें।`,
      nextIrrigationDate: forecast[2]?.date ?? "",
      waterAmountLiters: 0,
      bestTime: "Skip today",
      bestTimeHi: "आज छोड़ें",
      urgency: "skip",
    };
  }

  if (lastIrrigatedDaysAgo < crop.interval * 0.7) {
    return {
      shouldIrrigate: false,
      reason: `Irrigated ${lastIrrigatedDaysAgo} days ago. Next in ${crop.interval - lastIrrigatedDaysAgo} days.`,
      reasonHi: `${lastIrrigatedDaysAgo} दिन पहले सिंचाई हुई। ${crop.interval - lastIrrigatedDaysAgo} दिन बाद करें।`,
      nextIrrigationDate: forecast[crop.interval - lastIrrigatedDaysAgo]?.date ?? "",
      waterAmountLiters: 0,
      bestTime: "Not needed",
      bestTimeHi: "अभी ज़रूरत नहीं",
      urgency: "skip",
    };
  }

  const isUrgent = lastIrrigatedDaysAgo >= crop.interval || today.tempMax > 38;
  const bestTime = today.tempMax > 35 ? "Early morning (5–7 AM)" : "Evening (5–7 PM)";
  const bestTimeHi = today.tempMax > 35 ? "सुबह जल्दी (5–7 बजे)" : "शाम को (5–7 बजे)";

  return {
    shouldIrrigate: true,
    reason: `${farm.crop} needs water every ${crop.interval} days. ${lastIrrigatedDaysAgo} days since last irrigation.`,
    reasonHi: `${farm.cropHi} को हर ${crop.interval} दिन में पानी चाहिए। आखिरी सिंचाई ${lastIrrigatedDaysAgo} दिन पहले हुई।`,
    nextIrrigationDate: forecast[crop.interval]?.date ?? "",
    waterAmountLiters: totalLiters,
    bestTime,
    bestTimeHi,
    urgency: isUrgent ? "urgent" : "normal",
  };
}

export function generateDailyTasks(
  farm: FarmSetup,
  forecast: WeatherForecast[],
  lastIrrigatedDaysAgo: number
): DailyTask[] {
  const crop = CROP_WATER[farm.crop] ?? CROP_WATER["Wheat"];
  const sowDate = new Date(farm.sowDate);
  const today = new Date();
  const daysGrown = Math.floor((today.getTime() - sowDate.getTime()) / 86400000);

  return forecast.map((day, i) => {
    const tasks: Task[] = [];
    const date = new Date(day.date);
    const dayOfWeek = date.toLocaleDateString("en-IN", { weekday: "long" });
    const dayOfWeekHi = date.toLocaleDateString("hi-IN", { weekday: "long" });

    // Weather warning
    if (day.rainProb > 70) {
      tasks.push({ emoji: "🌧️", type: "weather",
        title: "Heavy rain expected", titleHi: "भारी बारिश आने वाली है",
        desc: `${day.rainProb}% chance of ${day.rainMm}mm rain. Avoid spraying.`,
        descHi: `${day.rainProb}% बारिश की संभावना। छिड़काव न करें।` });
    }
    if (day.tempMax > 40) {
      tasks.push({ emoji: "🌡️", type: "weather",
        title: "Extreme heat alert", titleHi: "अत्यधिक गर्मी की चेतावनी",
        desc: `${day.tempMax}°C expected. Irrigate early morning only.`,
        descHi: `${day.tempMax}°C तापमान। केवल सुबह सिंचाई करें।` });
    }
    if (day.windspeed > 25) {
      tasks.push({ emoji: "💨", type: "weather",
        title: "Strong winds — avoid spraying", titleHi: "तेज़ हवा — छिड़काव न करें",
        desc: `Wind ${day.windspeed} km/h. Pesticide spray will drift.`,
        descHi: `हवा ${day.windspeed} km/h। कीटनाशक उड़ जाएगा।` });
    }

    // Irrigation task
    const daysAgo = lastIrrigatedDaysAgo + i;
    if (daysAgo >= crop.interval && day.rainMm < 5) {
      tasks.push({ emoji: "💧", type: "irrigation",
        title: "Irrigation needed today", titleHi: "आज सिंचाई करें",
        desc: `${farm.crop} needs water. Best time: ${day.tempMax > 35 ? "5–7 AM" : "5–7 PM"}`,
        descHi: `${farm.cropHi} को पानी चाहिए। सही समय: ${day.tempMax > 35 ? "सुबह 5–7 बजे" : "शाम 5–7 बजे"}` });
    }

    // Fertilizer schedule (based on crop growth stage)
    if (i === 0 && daysGrown === 21) {
      tasks.push({ emoji: "🌿", type: "fertilizer",
        title: "Apply Urea (1st dose)", titleHi: "यूरिया डालें (पहली खुराक)",
        desc: "21 days after sowing — apply 50kg urea per acre.",
        descHi: "बुवाई के 21 दिन बाद — 50 किलो यूरिया प्रति एकड़।" });
    }
    if (i === 0 && daysGrown === 45) {
      tasks.push({ emoji: "🌿", type: "fertilizer",
        title: "Apply Urea (2nd dose)", titleHi: "यूरिया डालें (दूसरी खुराक)",
        desc: "45 days after sowing — apply 50kg urea per acre.",
        descHi: "बुवाई के 45 दिन बाद — 50 किलो यूरिया प्रति एकड़।" });
    }

    // Spray schedule (every 15 days if no rain)
    if (i === 0 && daysGrown % 15 === 0 && day.rainProb < 30 && day.windspeed < 15) {
      tasks.push({ emoji: "🧴", type: "spray",
        title: "Pesticide spray day", titleHi: "कीटनाशक छिड़काव का दिन",
        desc: "Weather is suitable for spraying today. Do it in the morning.",
        descHi: "आज मौसम छिड़काव के लिए अच्छा है। सुबह करें।" });
    }

    // General good weather task
    if (tasks.length === 0 && day.rainProb < 20 && day.tempMax < 35) {
      tasks.push({ emoji: "✅", type: "general",
        title: "Good day for field work", titleHi: "खेत के काम के लिए अच्छा दिन",
        desc: "Clear weather. Good for weeding, inspection, or light work.",
        descHi: "साफ मौसम। निराई, निरीक्षण या हल्के काम के लिए अच्छा।" });
    }

    const urgency = tasks.some(t => t.type === "irrigation" && daysAgo > crop.interval + 2) ? "urgent"
      : tasks.some(t => t.type === "weather" || t.type === "irrigation") ? "important" : "normal";

    return {
      date: day.date,
      dateHi: date.toLocaleDateString("hi-IN", { weekday: "short", day: "numeric", month: "short" }),
      tasks,
      urgency,
    };
  });
}
