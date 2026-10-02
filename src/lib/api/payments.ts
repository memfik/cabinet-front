import {apiClient} from "./client"
import type {DateOnly, DateRangeParams, DateTime, Money} from "./types"

export interface Payment {
  bill_id: number
  credited_at: DateTime
  amount: Money
  operator: string | null
  comment: string | null
}

export interface PaymentHistory {
  type: "payment-histories"
  has_contract: boolean
  from: DateOnly
  to: DateOnly
  /** Сумма всех платежей периода. */
  total: Money
  /** От новых к старым. */
  payments: Payment[]
}

export const paymentsApi = {
  /** Период — не длиннее 90 дней и не раньше 2012-01-01, иначе 422 с ошибкой в `from`. */
  getHistory: (params?: DateRangeParams) => apiClient.get<PaymentHistory>("payments", {params}).then((r) => r.data),
}
