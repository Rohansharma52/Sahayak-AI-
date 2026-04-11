import { useEffect, useState } from "react";
import { X, AlertTriangle, CloudRain, Wind, Thermometer } from "lucide-react";
import { getWeather, LOCATIONS } from "@/services/weatherService";
import { getWeatherAdvice } from "@/utils/weatherAdvice";
import type { AppLang } from "@/pages/Index";
import { useTranslation } from "@/hooks/useTranslation";

interface WeatherAlertBannerProps { lang: AppLang; }

export default function WeatherAlertBanner({ lang }: WeatherAlertBannerProps) {
  const { t } = useTranslation(lang);
  const [alert, setAlert] = useState<{ text: string; textHi: string; color: string; bg: string; icon: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedKey = `weather_alert_dismissed_${new Date().toDateString()}`;
    if (localStorage.getItem(dismissedKey)) { setDismissed(true); return; }

    getWeather(LOCATIONS[0].lat, LOCATIONS[0].lon, LOCATIONS[0].name).then(data => {
      if (!data) return;
      const advice = getWeatherAdvice(data);
      // Only show non-safe alerts
      if (!advice.isSpraySafe || data.temperature > 38 || data.rainProbability > 60) {
        setAlert(advice);
      }
    }).catch(() => {});
  }, []);

  if (!alert || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(`weather_alert_dismissed_${new Date().toDateString()}`, "1");
  };

  const isHindi = ["hi", "mr", "pa", "bn", "te", "ta", "kn"].includes(lang);
  const text = isHindi ? alert.textHi : alert.text;

  return (
    <div className={`mx-4 mt-2 rounded-2xl px-4 py-3 flex items-center gap-3 ${alert.bg} border border-current/20`}>
      <span className="text-xl shrink-0">{alert.icon}</span>
      <p className={`text-sm font-bold flex-1 ${alert.color}`}>{text}</p>
      <button onClick={handleDismiss} className="shrink-0 opacity-60 hover:opacity-100">
        <X size={16} className={alert.color} />
      </button>
    </div>
  );
}
