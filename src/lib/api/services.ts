import {apiClient} from "./client"
import type {DateOnly, DateRangeParams, DateTime, Money} from "./types"

export interface Call {
  called_at: DateTime
  /** С какого номера. */
  caller_number: string | null
  /** На какой номер. */
  called_number: string
  duration_seconds: number
  /** С НДС 12%. */
  cost: Money
}

export interface CallStatistics {
  type: "call-statistics"
  from: DateOnly
  to: DateOnly
  total_duration_seconds: number
  /** С НДС 12%. */
  total_cost: Money
  /** Только платные звонки, по возрастанию времени. */
  calls: Call[]
}

export const servicesApi = {
  /**
   * Только для услуг с `has_statistics: true`. Период — не длиннее 30 дней.
   * `tariffId` и `accountNameId` — из `Dashboard.services[]`.
   */
  getCalls: (tariffId: number, accountNameId: number, params?: DateRangeParams) =>
    apiClient.get<CallStatistics>(`services/${tariffId}/${accountNameId}/calls`, {params}).then((r) => r.data),
}
