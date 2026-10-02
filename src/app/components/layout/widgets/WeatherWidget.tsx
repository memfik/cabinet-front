"use client"

import {Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Droplets, Sun, Wind} from "lucide-react"
import {useApi} from "@/lib/hooks/useApi"
import {WidgetCard} from "./WidgetCard"

/** Город виджета. Open-Meteo не требует ключа. */
const CITY = {name: "Алматы", lat: 43.238, lon: 76.945, tz: "Asia/Almaty"}

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
function describe(code: number): {label: string; icon: typeof Sun} {
  if (code === 0) return {label: "Ясно", icon: Sun}
  if (code <= 2) return {label: "Переменная облачность", icon: CloudSun}
  if (code === 3) return {label: "Пасмурно", icon: Cloud}
  if (code <= 48) return {label: "Туман", icon: CloudFog}
  if (code <= 57) return {label: "Морось", icon: CloudDrizzle}
  if (code <= 67 || (code >= 80 && code <= 82)) return {label: "Дождь", icon: CloudRain}
  if (code <= 77 || code === 85 || code === 86) return {label: "Снег", icon: CloudSnow}
  if (code >= 95) return {label: "Гроза", icon: CloudLightning}
  return {label: "Облачно", icon: Cloud}
}

const deg = (n: number) => `${Math.round(n)}°`

export function WeatherWidget() {
  const {data, error, loading, reload} = useApi(loadWeather)

  return (
    <WidgetCard
      title={`Погода · ${CITY.name}`}
      icon={CloudSun}
      onReload={reload}
      loading={loading && !data}
      error={error && !data ? "Не удалось загрузить погоду" : null}
    >
      {data && <WeatherBody forecast={data} />}
    </WidgetCard>
  )
}

function WeatherBody({forecast}: {forecast: Forecast}) {
  const {current, daily} = forecast
  const {label, icon: Icon} = describe(current.weather_code)
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-4xl font-bold tracking-tight tabular-nums">{deg(current.temperature_2m)}</p>
          <p className="text-muted-foreground mt-1 text-sm">{label}</p>
        </div>
        <Icon className="text-brand size-14" strokeWidth={1.5} />
      </div>
      <dl className="text-muted-foreground mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>Ощущается как {deg(current.apparent_temperature)}</div>
        <div>
          Днём {deg(daily.temperature_2m_max[0])} · ночью {deg(daily.temperature_2m_min[0])}
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="size-3.5" />
          {Math.round(current.wind_speed_10m)} м/с
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="size-3.5" />
          {Math.round(current.relative_humidity_2m)}%
        </div>
      </dl>
    </>
  )
}
