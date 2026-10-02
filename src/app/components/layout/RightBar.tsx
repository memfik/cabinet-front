"use client"

import {AccountWidget} from "./widgets/AccountWidget"
import {TicketsWidget} from "./widgets/TicketsWidget"
import {CurrencyWidget} from "./widgets/CurrencyWidget"
import {WeatherWidget} from "./widgets/WeatherWidget"

/** Правая колонка с виджетами — только на широких экранах (xl+), отступы и скругления как у левой. */
export function RightBar() {
  return (
    <aside className="my-3 mr-3 hidden w-72 shrink-0 flex-col gap-3 overflow-y-auto pb-1 [scrollbar-width:none] xl:flex">
      <AccountWidget />
      <TicketsWidget />
      <WeatherWidget />
      <CurrencyWidget />
    </aside>
  )
}
