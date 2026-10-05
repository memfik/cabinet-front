"use client"

import {Coins} from "lucide-react"
import {useApi} from "@/lib/hooks/useApi"
import {WidgetCard} from "./WidgetCard"

const CURRENCIES = [
  {code: "USD", flag: "🇺🇸"},
  {code: "EUR", flag: "🇪🇺"},
  {code: "RUB", flag: "🇷🇺"},
  {code: "CNY", flag: "🇨🇳"},
] as const

interface Rates {
  rates: Record<string, number>
  time_last_update_utc: string
}

async function loadRates(): Promise<Rates> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD")
  if (!res.ok) throw new Error("Курсы недоступны")
  const json = await res.json()
  if (json.result !== "success") throw new Error("Курсы недоступны")
  return json
}

const fmt = new Intl.NumberFormat("ru-RU", {minimumFractionDigits: 2, maximumFractionDigits: 2})

export function CurrencyWidget() {
  const {data, error, loading, reload} = useApi(loadRates)
  // Сколько тенге стоит единица валюты: база ответа — USD, поэтому KZT / валюта.
  const toKzt = (code: string) => (data ? data.rates.KZT / data.rates[code] : NaN)

  return (
    <WidgetCard
      title="Курс валют"
      icon={Coins}
      onReload={reload}
      loading={loading && !data}
      refreshing={loading && !!data}
      staleError={!!error && !!data}
      error={error && !data ? "Не удалось загрузить курсы" : null}
    >
      {data && (
        <>
          <ul className="divide-border divide-y">
            {CURRENCIES.map(({code, flag}) => (
              <li key={code} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-base leading-none">{flag}</span>
                  {code}
                </span>
                <span className="text-sm font-semibold tabular-nums">{fmt.format(toKzt(code))} ₸</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground mt-3 text-[11px]">
            Обновлено {new Date(data.time_last_update_utc).toLocaleDateString("ru-RU")} · рыночный курс, не официальный
          </p>
        </>
      )}
    </WidgetCard>
  )
}
