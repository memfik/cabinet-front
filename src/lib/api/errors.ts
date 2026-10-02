/**
 * Разбор ошибок API (формат из api.json).
 * - 422: `{message, errors: {поле: [сообщения]}}` — показывать у полей формы как есть;
 * - остальные: `{message}` на русском — можно показывать пользователю;
 * - 429: заголовок `Retry-After` (секунды); 503: внешняя система недоступна, предложить повторить позже.
 */
import axios from "axios"
import type {Message, ValidationError} from "./types"

export interface ApiError {
  /** `null` — ответа не было (сеть, CORS, таймаут). */
  status: number | null
  message: string
  /** Ошибки по полям (только 422). Ключи: `email`, `services.0`, `attachments.1`. */
  errors: Record<string, string[]>
  /** Секунд до повтора (только 429). */
  retryAfter: number | null
}

export function parseApiError(err: unknown, fallback = "Что-то пошло не так"): ApiError {
  if (axios.isAxiosError<Partial<Message & ValidationError>>(err)) {
    const retry = Number(err.response?.headers?.["retry-after"])
    return {
      status: err.response?.status ?? null,
      message: err.response ? (err.response.data?.message ?? fallback) : "Нет соединения с сервером",
      errors: err.response?.data?.errors ?? {},
      retryAfter: Number.isFinite(retry) ? retry : null,
    }
  }
  return {status: null, message: err instanceof Error ? err.message : fallback, errors: {}, retryAfter: null}
}

/** Текст ошибки для тоста. */
export function errMsg(err: unknown, fallback: string): string {
  const {message, status} = parseApiError(err, fallback)
  return status === null ? fallback : message
}

/** HTTP-код ответа, если он был. */
export function errStatus(err: unknown): number | undefined {
  return parseApiError(err).status ?? undefined
}

/** Ошибки валидации по полям (422). */
export function errFields(err: unknown): Record<string, string[]> {
  return parseApiError(err).errors
}

/** Первая ошибка конкретного поля. */
export function fieldError(err: unknown, field: string): string | undefined {
  return errFields(err)[field]?.[0]
}
