import {apiClient} from "./client"
import type {Money} from "./types"

export type ServiceCategory = "telephony" | "internet" | "other"

export interface DashboardService {
  /** Вместе с `account_name_id` нужен для статистики звонков и заявления на отключение. */
  tariff_id: number
  account_name_id: number
  name: string
  tariff_name: string
  category: ServiceCategory
  /** Есть статистика звонков. */
  has_statistics: boolean
}

/** Без договора (`has_contract: false`) все поля кроме `services` — `null`, `services` пуст. */
export interface Dashboard {
  type: "dashboards"
  has_contract: boolean
  account_number: string | null
  contract_id: number | null
  contract_code: string | null
  client_name: string | null
  is_company: boolean | null
  account_manager: string | null
  /** Отрицательный — задолженность. Кешируется на бэке 5 минут. */
  balance: Money | null
  services: DashboardService[]
}

export const dashboardApi = {
  get: () => apiClient.get<Dashboard>("dashboard").then((r) => r.data),
}
