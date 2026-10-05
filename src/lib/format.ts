/** Форматирование значений API для показа. Деньги приходят строкой — числом становятся только здесь, для вывода. */

import {intlTag, tr} from "@/i18n"

const TZ = "Asia/Almaty"

/** Формат чисел и дат зависит от текущего языка интерфейса (см. `intlTag`). */
const moneyFormats = new Map<string, Intl.NumberFormat>()
const moneyFormat = () => {
  const tag = intlTag()
  let f = moneyFormats.get(tag)
  if (!f) moneyFormats.set(tag, (f = new Intl.NumberFormat(tag, {minimumFractionDigits: 2, maximumFractionDigits: 2})))
  return f
}

/** `"944580.75"` → `944 580,75 ₸`. */
export function formatMoney(value: string | null | undefined): string {
  if (value == null || value === "") return "—"
  return `${moneyFormat().format(Number(value))} ₸`
}

/** Отрицательная сумма — задолженность. */
export function isNegative(value: string | null | undefined): boolean {
  return value != null && Number(value) < 0
}

/** `2026-09-15T14:30:00+05:00` → `15.09.2026, 14:30` (порядок и разделители зависят от языка). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString(intlTag(), {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** `2026-09-15` или ISO → `15.09.2026`. Дату без времени не сдвигаем часовым поясом. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  // дату без времени читаем как UTC-полдень и форматируем в UTC — часовой пояс её не сдвинет
  return new Date(dateOnly ? `${value}T12:00:00Z` : value).toLocaleDateString(intlTag(), {
    timeZone: dateOnly ? "UTC" : TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/** Секунды → `1 ч 05 мин 09 сек` / `3 мин 12 сек` / `45 сек`. */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  if (h) return tr("common.durationHms", {h, m: pad(m), s: pad(s)})
  if (m) return tr("common.durationMs", {m, s: pad(s)})
  return tr("common.durationS", {s})
}

/** Date → `YYYY-MM-DD` в локальной зоне (для `<input type="date">` и query-параметров). */
export function toDateInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Сегодня минус `days` дней, `YYYY-MM-DD`. */
export function daysAgoInput(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return toDateInput(d)
}
