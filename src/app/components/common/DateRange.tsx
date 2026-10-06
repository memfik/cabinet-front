"use client"

import {DateInput} from "./DateInput"
import {daysAgoInput, toDateInput} from "@/lib/format"
import {cn} from "@/lib/utils"
import {Field} from "./Field"
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

      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end sm:gap-2">
        <Field label={t("common.dateFrom")}>
          <DateInput
            value={from}
            max={to || undefined}
            onChange={(v) => onChange({from: v, to})}
            className="h-11 w-full min-w-0 sm:w-44"
          />
        </Field>
        <span className="text-muted-foreground hidden h-11 items-center sm:flex">—</span>
        <Field label={t("common.dateTo")}>
          <DateInput
            value={to}
            min={from || undefined}
            onChange={(v) => onChange({from, to: v})}
            className="h-11 w-full min-w-0 sm:w-44"
          />
        </Field>
      </div>

      {error && <p className="text-destructive text-xs sm:basis-full">{error}</p>}
    </div>
  )
}
