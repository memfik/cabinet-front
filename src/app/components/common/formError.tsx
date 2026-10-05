import {toast} from "sonner"
import {AlertCircle} from "lucide-react"
import {parseApiError} from "@/lib/api/errors"
import {tr} from "@/i18n"

export interface FormError {
  /** Ошибки по полям (422 с `errors`). */
  fields: Record<string, string[]>
  /** 422 без `errors` (бизнес-правило, например «нет лицевого счёта») — показывается блоком над формой. */
  banner: string | null
}

export const NO_ERROR: FormError = {fields: {}, banner: null}

/**
 * Разбор ошибки отправки формы: 422 → поля/баннер, всё остальное (429, 503, 404, 409…) → тост.
 * 401 обрабатывает интерсептор клиента.
 */
export function handleFormError(err: unknown): FormError {
  const e = parseApiError(err)
  if (e.status === 422) {
    const hasFields = Object.keys(e.errors).length > 0
    return {fields: e.errors, banner: hasFields ? null : e.message}
  }
  const wait = e.status === 429 && e.retryAfter ? ` ${tr("common.retryAfter", {sec: e.retryAfter})}` : ""
  toast.error(e.message + wait)
  return NO_ERROR
}

/** Первая ошибка поля. */
export const firstError = (err: FormError, field: string): string | undefined => err.fields[field]?.[0]

/** Заметный блок ошибки над формой. */
export function ErrorBanner({message}: {message: string | null}) {
  if (!message) return null
  return (
    <div className="bg-destructive/10 text-destructive mb-4 flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
