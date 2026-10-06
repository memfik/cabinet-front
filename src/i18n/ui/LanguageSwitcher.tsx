"use client"

import {cn} from "@/lib/utils"
import {LOCALES, LOCALE_META, type Locale} from "@/i18n/config"
import {useI18n} from "@/i18n/provider"

/** Пружинистая кривая для ползунка: он слегка «перелетает» цель и возвращается. */
const SPRING = "duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"

/**
 * Переключатель языка с «ползунком», который плавно перетекает к выбранному языку.
 * - `menu` — три крупные карточки с кодом и названием языка (для меню пользователя);
 * - `compact` — таблетка с кодами (для страниц входа, где меню пользователя нет).
 */
export function LanguageSwitcher({variant = "menu", className}: {variant?: "menu" | "compact"; className?: string}) {
  const {locale, setLocale, t} = useI18n()
  const index = LOCALES.indexOf(locale)
  const compact = variant === "compact"

  return (
    <div
      role="radiogroup"
      aria-label={t("shell.language")}
      className={cn(
        "relative grid grid-cols-3",
        compact ? "gap-1 p-1" : "gap-0.5 p-0.5",
        compact
          ? "bg-card/70 border-border/60 rounded-full border shadow-sm backdrop-blur-md"
          : "bg-muted/70 rounded-xl",
        className
      )}
    >
      {/* ползунок: ширина одной ячейки, сдвиг на `index` ячеек (100% — это ширина самого ползунка) */}
      <span
        aria-hidden
        className={cn(
          "from-brand/20 via-brand/10 ring-brand/40 bg-card absolute bg-linear-to-br to-indigo-500/15 shadow-md ring-1 transition-transform",
          compact
            ? "top-1 bottom-1 left-1 w-[calc((100%-1rem)/3)] rounded-full"
            : "top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.5rem-0.25rem)/3)] rounded-[10px]",
          SPRING
        )}
        style={{transform: `translateX(calc(${index} * (100% + ${compact ? "0.25rem" : "0.125rem"})))`}}
      />
      {LOCALES.map((code) => (
        <LocaleButton key={code} code={code} active={code === locale} compact={compact} onSelect={setLocale} />
      ))}
    </div>
  )
}

function LocaleButton({
  code,
  active,
  compact,
  onSelect,
}: {
  code: Locale
  active: boolean
  compact: boolean
  onSelect: (locale: Locale) => void
}) {
  const meta = LOCALE_META[code]
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      lang={code}
      title={meta.native}
      onClick={() => onSelect(code)}
      className={cn(
        "group focus-visible:ring-brand/50 relative z-10 flex items-center justify-center transition-colors outline-none focus-visible:ring-2",
        compact ? "h-8 gap-1.5 rounded-full px-3" : "flex-col gap-0.5 rounded-[10px] px-1 py-1.5",
        active ? "text-brand" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "font-bold tracking-wide transition-transform duration-300",
          compact ? "text-xs" : "text-sm leading-none",
          active ? "scale-105" : "group-hover:scale-105"
        )}
      >
        {meta.short}
      </span>
      {!compact && (
        <span className={cn("text-[10px] leading-none font-medium", !active && "text-muted-foreground/80")}>
          {meta.native}
        </span>
      )}
    </button>
  )
}
