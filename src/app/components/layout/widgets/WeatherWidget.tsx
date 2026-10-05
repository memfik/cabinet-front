"use client"

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from "lucide-react"
import {useApi} from "@/lib/hooks/useApi"
import {useI18n, type MessageKey} from "@/i18n"
import {WidgetCard} from "./WidgetCard"

/** Город виджета. Open-Meteo не требует ключа. */
const CITY = {lat: 43.238, lon: 76.945, tz: "Asia/Almaty"}

interface Forecast {
  current: {
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
  }
  daily: {temperature_2m_max: number[]; temperature_2m_min: number[]}
}

async function loadWeather(): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(CITY.lat),
    longitude: String(CITY.lon),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min",
    wind_speed_unit: "ms",
    timezone: CITY.tz,
    forecast_days: "1",
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error("Погода недоступна")
  return res.json()
}

/** Коды WMO → подпись и иконка. */
function describe(code: number): {label: MessageKey; icon: typeof Sun} {
  if (code === 0) return {label: "widgets.wmoClear", icon: Sun}
  if (code <= 2) return {label: "widgets.wmoPartlyCloudy", icon: CloudSun}
  if (code === 3) return {label: "widgets.wmoOvercast", icon: Cloud}
  if (code <= 48) return {label: "widgets.wmoFog", icon: CloudFog}
  if (code <= 57) return {label: "widgets.wmoDrizzle", icon: CloudDrizzle}
  if (code <= 67 || (code >= 80 && code <= 82)) return {label: "widgets.wmoRain", icon: CloudRain}
  if (code <= 77 || code === 85 || code === 86) return {label: "widgets.wmoSnow", icon: CloudSnow}
  if (code >= 95) return {label: "widgets.wmoThunderstorm", icon: CloudLightning}
  return {label: "widgets.wmoCloudy", icon: Cloud}
}

const deg = (n: number) => `${Math.round(n)}°`

export function WeatherWidget() {
  const {t} = useI18n()
  const {data, error, loading, reload} = useApi(loadWeather)

  return (
    <WidgetCard
      title={t("widgets.weatherTitle", {city: t("widgets.city")})}
      icon={CloudSun}
      onReload={reload}
      loading={loading && !data}
      refreshing={loading && !!data}
      staleError={!!error && !!data}
      error={error && !data ? t("widgets.weatherError") : null}
    >
      {data && <WeatherBody forecast={data} />}
    </WidgetCard>
  )
}

function WeatherBody({forecast}: {forecast: Forecast}) {
  const {t} = useI18n()
  const {current, daily} = forecast
  const {label, icon: Icon} = describe(current.weather_code)
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-4xl font-bold tracking-tight tabular-nums">{deg(current.temperature_2m)}</p>
          <p className="text-muted-foreground mt-1 text-sm">{t(label)}</p>
        </div>
        <Icon className="text-brand size-14" strokeWidth={1.5} />
      </div>
      <dl className="text-muted-foreground mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>{t("widgets.feelsLike", {temp: deg(current.apparent_temperature)})}</div>
        <div>
          {t("widgets.dayNight", {day: deg(daily.temperature_2m_max[0]), night: deg(daily.temperature_2m_min[0])})}
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="size-3.5" />
          {t("widgets.windSpeed", {value: Math.round(current.wind_speed_10m)})}
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="size-3.5" />
          {Math.round(current.relative_humidity_2m)}%
        </div>
      </dl>
    </>
  )
}
