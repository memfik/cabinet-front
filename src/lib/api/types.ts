/** Общие типы API. Схема — api.json (OpenAPI 3.1). */

/** Деньги приходят строкой с двумя знаками (`"1500.00"`) — чтобы не терять точность. */
export type Money = string
/** ISO 8601 со смещением Алматы: `2026-09-15T14:30:00+05:00`. */
export type DateTime = string
/** `YYYY-MM-DD`. */
export type DateOnly = string

export interface Message {
  message: string
}

/** 422: `errors` — по полям (для массивов ключи вида `services.0`, `attachments.1`). */
export interface ValidationError {
  message: string
  errors: Record<string, string[]>
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  path: string
  per_page: number
  to: number | null
  total: number
  links: {url: string | null; label: string; active: boolean}[]
}

export interface Paginated<T> {
  data: T[]
  links: PaginationLinks
  meta: PaginationMeta
}

/** Период для отчётов: `from`/`to` включительно. Без параметров бэк берёт последние 25 дней. */
export interface DateRangeParams {
  from?: DateOnly
  to?: DateOnly
}

export interface SelectOption {
  value: string
  label: string
}
