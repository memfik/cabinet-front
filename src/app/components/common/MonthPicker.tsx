"use client"

import {useState} from "react"
import {CalendarDays, ChevronLeft, ChevronRight} from "lucide-react"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {cn} from "@/lib/utils"
import {useI18n} from "@/i18n"
import {dateLocales} from "./DateInput"

/**
 * Выбор месяца (`YYYY-MM`) сеткой 3×4 с переключением года. `""` — «не выбрано» (в OneWeb это текущий период).
 * Замена нативного `<input type="month">`, чей вид зависит от браузера и ОС.
 */
export function MonthPicker({
  value,
  onChange,
  max,
  className,
}: {
  value: string
  onChange: (value: string) => void
  /** Последний доступный месяц, `YYYY-MM`. */
  max?: string
  className?: string
}) {
  const {locale, t} = useI18n()
  const [open, setOpen] = useState(false)
  const now = new Date()
  const [year, setYear] = useState(() => Number(value.slice(0, 4)) || now.getFullYear())

  const dl = dateLocales[locale]
  const monthName = (m: number, style: "LLLL" | "LLL") =>
    dl.localize.month(m as Parameters<typeof dl.localize.month>[0], {
      width: style === "LLLL" ? "wide" : "abbreviated",
      context: "standalone",
    })
  const [maxYear, maxMonth] = max ? [Number(max.slice(0, 4)), Number(max.slice(5, 7)) - 1] : [9999, 11]

  const label = value ? `${monthName(Number(value.slice(5, 7)) - 1, "LLLL")} ${value.slice(0, 4)}` : t("oneweb.current")

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setYear(Number(value.slice(0, 4)) || now.getFullYear())
      }}
    >
      <PopoverTrigger
        type="button"
        className={cn(
          "border-foreground/20 hover:border-foreground/30 dark:bg-input/30 dark:hover:bg-input/50 flex h-11 w-full items-center gap-2.5 rounded-xl border bg-white/70 px-3.5 text-sm shadow-xs transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 aria-expanded:border-brand aria-expanded:ring-brand/20 focus-visible:ring-3 aria-expanded:ring-3",
          className
        )}
      >
        <CalendarDays className="text-brand size-4.5 shrink-0" />
        <span className="font-medium capitalize">{label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            className="hover:bg-muted flex size-8 items-center justify-center rounded-lg transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-semibold tabular-nums">{year}</span>
          <button
            type="button"
            disabled={year >= maxYear}
            onClick={() => setYear((y) => y + 1)}
            className="hover:bg-muted flex size-8 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({length: 12}, (_, m) => {
            const v = `${year}-${String(m + 1).padStart(2, "0")}`
            const disabled = year > maxYear || (year === maxYear && m > maxMonth)
            const active = v === value
            return (
              <button
                key={v}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onChange(v)
                  setOpen(false)
                }}
                className={cn(
                  "h-9 rounded-lg text-sm font-medium capitalize transition-colors disabled:pointer-events-none disabled:opacity-30",
                  active ? "bg-brand text-white" : "hover:bg-brand/10 hover:text-brand"
                )}
              >
                {monthName(m, "LLL")}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
