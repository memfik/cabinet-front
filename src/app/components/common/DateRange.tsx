"use client"

import {useEffect, useState} from "react"
import {DayPicker, type DateRange as DayRange} from "react-day-picker"
import {ArrowRight, CalendarDays} from "lucide-react"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {daysAgoInput, toDateInput} from "@/lib/format"
import {cn} from "@/lib/utils"
import {Field} from "./Field"
import {CaptionSelect, dateLocales, parseDay, rdpStyle} from "./DateInput"
import {useI18n} from "@/i18n"

/**
 * Пара полей «с … по …» (`YYYY-MM-DD`). На мобильном — два поля в ряд на всю ширину.
 * `presets` — быстрые периоды в днях («последние 30 дней»): чипы над полями, активный подсвечивается.
 */
export function DateRange({
  from,
  to,
  onChange,
  error,
  presets,
}: {
  from: string
  to: string
  onChange: (range: {from: string; to: string}) => void
  error?: string
  presets?: number[]
}) {
  const {t} = useI18n()
  const today = toDateInput(new Date())

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-5 sm:gap-y-3">
      {presets && (
        <div className="bg-muted flex gap-1 rounded-lg p-1 sm:order-last sm:ml-auto">
          {presets.map((days) => {
            // «N дн.» — N календарных дней включительно, чтобы 30 и 90 не превышали лимит бэка
            const start = daysAgoInput(days - 1)
            const active = to === today && from === start
            return (
              <button
                key={days}
                type="button"
                onClick={() => onChange({from: start, to: today})}
                aria-pressed={active}
                className={cn(
                  "h-9 flex-1 rounded-md px-4 text-sm font-medium transition-all sm:flex-none",
                  active
                    ? "bg-background text-brand shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                )}
              >
                {t("common.daysShort", {n: days})}
              </button>
            )
          })}
        </div>
      )}

      <Field label={t("common.period")}>
        <RangeTrigger from={from} to={to} onChange={onChange} />
      </Field>

      {error && <p className="text-destructive text-xs sm:basis-full">{error}</p>}
    </div>
  )
}

/** `YYYY-MM-DD` → `дд/мм/гггг` (как в полях даты, независимо от локали ОС). */
const show = (v: string) => (v ? v.split("-").reverse().join("/") : "")

/** Ширина экрана от `md`: на узких показываем один месяц вместо двух. */
function useWide() {
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const sync = () => setWide(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return wide
}

/**
 * Один «пилюля»-триггер с периодом и календарь на два месяца в поповере.
 * Первый клик — начало, второй — конец (порядок не важен); поповер закрывается после выбора диапазона.
 */
function RangeTrigger({
  from,
  to,
  onChange,
}: {
  from: string
  to: string
  onChange: (range: {from: string; to: string}) => void
}) {
  const {t, locale} = useI18n()
  const wide = useWide()
  const [open, setOpen] = useState(false)
  // начало диапазона, выбранное первым кликом, пока второй ещё не сделан
  const [anchor, setAnchor] = useState<Date | null>(null)

  const start = parseDay(from)
  const end = parseDay(to)
  const selected: DayRange | undefined = anchor
    ? {from: anchor, to: anchor}
    : start
      ? {from: start, to: end}
      : undefined

  function pick(day: Date) {
    if (!anchor) return setAnchor(day)
    const [a, b] = anchor <= day ? [anchor, day] : [day, anchor]
    onChange({from: toDateInput(a), to: toDateInput(b)})
    setAnchor(null)
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setAnchor(null)
      }}
    >
      <PopoverTrigger
        type="button"
        className={cn(
          "border-foreground/20 hover:border-foreground/30 dark:bg-input/30 dark:hover:bg-input/50 flex h-11 w-full items-center gap-2.5 rounded-xl border bg-white/70 px-3.5 text-sm shadow-xs transition-colors outline-none sm:w-auto",
          "focus-visible:border-ring focus-visible:ring-ring/50 aria-expanded:border-brand aria-expanded:ring-brand/20 focus-visible:ring-3 aria-expanded:ring-3"
        )}
      >
        <CalendarDays className="text-brand size-4.5 shrink-0" />
        <span className="font-medium tabular-nums">{show(from) || "дд/мм/гггг"}</span>
        <ArrowRight className="text-muted-foreground size-3.5 shrink-0" />
        <span className="font-medium tabular-nums">{show(to) || "дд/мм/гггг"}</span>
      </PopoverTrigger>
      <PopoverContent className="p-3" align="start">
        <p className="text-muted-foreground px-1 pb-1 text-xs">
          {anchor ? t("common.pickRangeEnd") : t("common.pickRangeStart")}
        </p>
        <DayPicker
          mode="range"
          numberOfMonths={wide ? 2 : 1}
          pagedNavigation
          locale={dateLocales[locale]}
          weekStartsOn={1}
          captionLayout="dropdown"
          startMonth={new Date(2015, 0)}
          endMonth={new Date(new Date().getFullYear() + 1, 11)}
          defaultMonth={wide && end ? new Date(end.getFullYear(), end.getMonth() - 1) : (end ?? new Date())}
          components={{Dropdown: CaptionSelect}}
          classNames={{dropdowns: "flex items-center gap-1.5"}}
          selected={selected}
          onDayClick={pick}
          style={rdpStyle}
        />
      </PopoverContent>
    </Popover>
  )
}
