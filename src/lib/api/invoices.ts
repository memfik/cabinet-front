import {apiClient} from "./client"
import type {DateOnly, Money} from "./types"

export type InvoiceDocumentType = "account-notice" | "invoice" | "one-time-invoice" | "correction-invoice"

export interface Invoice {
  type: "invoices"
  /** id документа — для скачивания PDF. */
  id: number
  number: string
  document_type: InvoiceDocumentType | null
  document_type_label: string | null
  period_start: DateOnly | null
  period_end: DateOnly | null
  amount: Money
}

export interface DownloadedFile {
  blob: Blob
  filename: string
}

/** Достаёт имя файла из Content-Disposition (поддерживает `filename*=UTF-8''…` для русских имён). */
function filenameFromDisposition(header: string | undefined, fallback: string): string {
  if (!header) return fallback
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header)
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""))
    } catch {
      /* падаем на обычный filename */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header)
  return plain ? plain[1].trim() : fallback
}

export const invoicesApi = {
  /** Документы с начала текущего года, от новых к старым. Без договора — пустой массив. */
  list: () => apiClient.get<Invoice[]>("invoices").then((r) => r.data),

  /**
   * PDF нужно тянуть через axios (с токеном) — обычная ссылка `<a href>` заголовок Authorization не передаст.
   * Чтобы имя файла из Content-Disposition было доступно, бэк должен отдавать его в Access-Control-Expose-Headers.
   */
  downloadPdf: async (billId: number): Promise<DownloadedFile> => {
    const res = await apiClient.get<Blob>(`invoices/${billId}/pdf`, {responseType: "blob"})
    return {
      blob: res.data,
      filename: filenameFromDisposition(res.headers["content-disposition"], `Документ-${billId}.pdf`),
    }
  },
}

/** Сохраняет blob на диск пользователя через временную ссылку. */
export function saveFile({blob, filename}: DownloadedFile) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
