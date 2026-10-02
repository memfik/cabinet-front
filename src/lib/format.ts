/** Форматирование значений API для показа. Деньги приходят строкой — числом становятся только здесь, для вывода. */

const TZ = "Asia/Almaty"

const money = new Intl.NumberFormat("ru-RU", {minimumFractionDigits: 2, maximumFractionDigits: 2})

/** `"944580.75"` → `944 580,75 ₸`. */
export function formatMoney(value: string | null | undefined): string {
  if (value == null || value === "") return "—"
  return `${money.format(Number(value))} ₸`
}

/** Отрицательная сумма — задолженность. */
export function isNegative(value: string | null | undefined): boolean {
  return value != null && Number(value) < 0
}

/** `2026-09-15T14:30:00+05:00` → `15.09.2026, 14:30`. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("ru-RU", {
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-")
    return `${d}.${m}.${y}`
  }
  return new Date(value).toLocaleDateString("ru-RU", {timeZone: TZ})
}

/** Секунды → `1 ч 05 мин 09 сек` / `3 мин 12 сек` / `45 сек`. */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h) return `${h} ч ${String(m).padStart(2, "0")} мин ${String(s).padStart(2, "0")} сек`
  if (m) return `${m} мин ${String(s).padStart(2, "0")} сек`
  return `${s} сек`
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

/** Склонение: plural(3, ["заявка", "заявки", "заявок"]). */
export function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}
