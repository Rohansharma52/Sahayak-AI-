import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Droplets, Sun, Cloud, CloudRain, CloudLightning, MapPin, RefreshCw, Thermometer, Gauge, Eye, Clock, ChevronDown } from "lucide-react";
import { getWeather, decodeWeatherCode, type WeatherData, type LocationPreset, LOCATIONS } from "@/services/weatherService";
import { getWeatherAdvice } from "@/utils/weatherAdvice";
import type { AppLang } from "@/pages/Index";
import { useTranslation } from "@/hooks/useTranslation";

// ── i18n ──────────────────────────────────────────────────────────────────────
const UI_EN = {
  humidity: "Humidity",
  wind: "Wind",
  feelsLike: "Feels like",
  pressure: "Pressure",
  visibility: "Visibility",
  temp: "Temp",
  loading: "Loading weather...",
  error: "Weather data unavailable",
  retry: "Retry",
};

const REFRESH_MS = 600000; // 10 mins

interface WeatherCardProps {
  lang: AppLang;
  defaultLocation: LocationPreset;
  compact?: boolean;
}

const WeatherStat = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
    <Icon size={16} className="text-gray-400 mb-1" />
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-xs font-black text-gray-800">{value}</p>
  </div>
);

const WeatherCard = ({ lang, defaultLocation, compact = false }: WeatherCardProps) => {
  const { t } = useTranslation(lang);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState(defaultLocation);
  const [locationOpen, setLocationOpen] = useState(false);

  const fetchWeather = useCallback(async (loc: LocationPreset) => {
    setLoading(true);
    setError(false);
    try {
      const res = await getWeather(loc.lat, loc.lon, loc.name);
      setData(res);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWeather(location); }, [location, fetchWeather]);
  useEffect(() => { const id = setInterval(() => fetchWeather(location), REFRESH_MS); return () => clearInterval(id); }, [location, fetchWeather]);

  if (loading && !data) return (
    <div className={`bg-white rounded-3xl p-6 border border-gray-100 flex items-center justify-center ${compact ? "h-full" : "min-h-[200px]"}`}>
      <div className="flex flex-col items-center gap-2">
        <RefreshCw className="animate-spin text-green-600" size={24} />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t(UI_EN.loading)}</p>
      </div>
    </div>
  );

  if (error && !data) return (
    <div className={`bg-red-50 rounded-3xl p-6 border border-red-100 flex items-center justify-center ${compact ? "h-full" : "min-h-[200px]"}`}>
      <div className="text-center space-y-3">
        <p className="text-sm font-bold text-red-600">{t(UI_EN.error)}</p>
        <button onClick={() => fetchWeather(location)} className="px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl shadow-lg">
          {t(UI_EN.retry)}
        </button>
      </div>
    </div>
  );

  const { label: weatherLabel, emoji: weatherEmoji } = decodeWeatherCode(data?.weathercode || 0);
  const advice = data ? getWeatherAdvice(data) : null;

  if (compact) return (
    <div className="h-full bg-white p-5 border border-gray-100 shadow-sm flex flex-col justify-between group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-110 transition-transform" />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-400">
          <MapPin size={13} />
          <span className="text-[10px] font-black uppercase tracking-wider">{location.name}</span>
        </div>
        <span className="text-2xl animate-pulse">{weatherEmoji}</span>
      </div>
      <div className="relative z-10 mt-1">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-black text-gray-900">{Math.round(data?.temperature || 0)}°</span>
          <span className="text-sm font-bold text-gray-400 mb-1.5">{t(weatherLabel)}</span>
        </div>
      </div>
      <div className="relative z-10 grid grid-cols-2 gap-2 mt-3">
        <div className="bg-gray-50 rounded-xl p-2 flex items-center gap-2">
          <Wind size={12} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-600">{data?.windspeed} km/h</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-2 flex items-center gap-2">
          <Clock size={12} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-600">{fmtTime(data?.time || "")}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
      {/* Location Header */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button onClick={() => setLocationOpen(!locationOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-all group">
            <MapPin size={14} className="text-green-600" />
            <span className="text-xs font-black text-gray-700">{location.name}</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${locationOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {locationOpen && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                {LOCATIONS.map(loc => (
                  <button key={loc.name} onClick={() => { setLocation(loc); setLocationOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${location.name === loc.name ? "bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-50"}`}>
                    {loc.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={() => fetchWeather(location)} disabled={loading} className="text-gray-400 hover:text-green-600 transition-colors">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="flex items-center gap-6">
          <div className="relative text-6xl">
            {weatherEmoji}
          </div>
          <div>
            <div className="flex items-start gap-1">
              <span className="text-5xl font-black text-gray-900">{Math.round(data?.temperature || 0)}</span>
              <span className="text-xl font-bold text-gray-400 mt-2">°C</span>
            </div>
            <p className="text-lg font-bold text-gray-600">{t(weatherLabel)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <WeatherStat icon={Wind} label={t(UI_EN.wind)} value={`${data?.windspeed} km/h`} />
          <WeatherStat icon={Thermometer} label={t(UI_EN.feelsLike)} value={`${Math.round(data?.temperature || 0)}°C`} />
          <WeatherStat icon={Clock} label={t("Updated")} value={fmtTime(data?.time || "")} />
          <WeatherStat icon={Sun} label={t("UV Index")} value="Moderate" />
        </div>
      </div>

      {advice && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`${advice.bg} rounded-2xl p-4 border border-opacity-50`} style={{ borderColor: 'currentColor' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-widest">{t("Farming Advice")}</span>
            <div className="h-px flex-1 bg-current opacity-20" />
          </div>
          <p className={`text-sm font-semibold leading-relaxed ${advice.color}`}>"{t(lang === 'hi' ? advice.textHi : advice.text)}"</p>
        </motion.div>
      )}
    </div>
  );
};

function fmtTime(iso: string) {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default WeatherCard;
