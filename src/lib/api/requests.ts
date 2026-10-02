import {apiClient} from "./client"
import type {SelectOption} from "./types"

export type DocumentRequestType = "detalization" | "invoice"
export type SuspendResume = "suspend" | "resume"
export type WifiSetup = "initial" | "repeat"

export type PhoneOptionKey =
  | "long-distance"
  | "international"
  | "directory"
  | "hotline"
  | "international-pin"
  | "forward-on-busy"
  | "caller-id"
  | "caller-id-restriction"
  | "unconditional-forward"
  | "call-waiting"

export type UnlimitedSpeed =
  | "128-kbps"
  | "256-kbps"
  | "512-kbps"
  | "1-mbps"
  | "2-mbps"
  | "4-mbps"
  | "8-mbps"
  | "10-mbps"
  | "other"

export type PrepaidSpeed =
  | "128-kbps-100-mb"
  | "256-kbps-400-mb"
  | "512-kbps-600-mb"
  | "1-mbps-1-gb"
  | "2-mbps-5-gb"
  | "4-mbps-10-gb"
  | "8-mbps-40-gb"
  | "8-mbps-100-gb"
  | "other"

/** Значения и подписи для выпадающих списков — не хардкодим на фронте. */
export interface RequestFormOptions {
  document_types: SelectOption[]
  service_availability_changes: SelectOption[]
  phone_options: (SelectOption & {
    /** Опция платных звонков (8 / 810). */
    is_paid_call: boolean
  })[]
  phone_option_changes: SelectOption[]
  wifi_setups: SelectOption[]
  unlimited_speeds: SelectOption[]
  prepaid_speeds: SelectOption[]
}

export interface DocumentRequestPayload {
  type: DocumentRequestType
  /** 1–12. Месяц не может быть в будущем. */
  month: number
  /** От 2012 до текущего. */
  year: number
  /** Куда прислать. */
  email: string
}

/** Заполняем только то, что нужно изменить. */
export interface ServiceSettingsPayload {
  addresses: string
  /** Контактное лицо и телефон. */
  contact: string
  telephony?: SuspendResume | null
  internet?: SuspendResume | null
  phone_options?: Partial<Record<PhoneOptionKey, "open" | "close" | null>> | null
  wifi_setup?: WifiSetup | null
  unlimited_speed?: UnlimitedSpeed | null
  prepaid_speed?: PrepaidSpeed | null
  comment?: string | null
}

export interface DisconnectionPayload {
  /** Из `Dashboard.services[]`. */
  tariff_id: number
  account_name_id: number
}

/**
 * Заявления уходят письмом сотрудникам, ответ — 204 без тела.
 * Без лицевого счёта бэк вернёт 422 только с `message` (без `errors`).
 */
export const requestsApi = {
  getOptions: () => apiClient.get<RequestFormOptions>("requests/options").then((r) => r.data),
  sendDocument: (payload: DocumentRequestPayload) => apiClient.post<void>("requests/document", payload).then((r) => r.data),
  sendServiceSettings: (payload: ServiceSettingsPayload) => apiClient.post<void>("requests/service-settings", payload).then((r) => r.data),
  sendDisconnection: (payload: DisconnectionPayload) => apiClient.post<void>("requests/disconnection", payload).then((r) => r.data),
}
