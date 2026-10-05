import {apiClient} from "./client"
import {downloadFile} from "./files"
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

export const invoicesApi = {
  /** Документы с начала текущего года, от новых к старым. Без договора — пустой массив. */
  list: () => apiClient.get<Invoice[]>("invoices").then((r) => r.data),

  /** PDF счёта: имя файла берётся из Content-Disposition. */
  downloadPdf: (billId: number) => downloadFile(`invoices/${billId}/pdf`, `Документ-${billId}.pdf`),
}

export {saveFile, type DownloadedFile} from "./files"
