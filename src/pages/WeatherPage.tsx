import React from "react";
import WeatherCard from "@/components/WeatherCard";
import { LOCATIONS } from "@/services/weatherService";
import type { AppLang } from "./Index";

interface WeatherPageProps { lang: AppLang; }

const WeatherPage = ({ lang }: WeatherPageProps) => (
  <WeatherCard lang={lang} defaultLocation={LOCATIONS[0]} />
);

export default WeatherPage;
