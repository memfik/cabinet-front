import {apiClient} from "./client"
import type {DateTime} from "./types"

export interface OneWebProducts {
  type: "oneweb-products"
  /** Пусто — у клиента нет OneWeb, раздел можно скрыть. */
  products: {product_id: string}[]
}

export interface OneWebPackage {
  type: "main" | "overage"
  type_label: string
  /** Число строкой. */
  size: string | null
  /** Число строкой. */
  remaining: string | null
  /** Например `GB`. */
  units: string | null
  starts_at: DateTime | null
  ends_at: DateTime | null
}

export interface OneWebUsage {
  type: "oneweb-usage"
  product_id: string
  /** `YYYY-MM`; `null` — текущий период. */
  month: string | null
  /** `null` — нет данных за период. */
  tariff_name: string | null
  /** Безлимит — `packages` пуст. */
  is_unlimited: boolean
  packages: OneWebPackage[]
}

export const oneWebApi = {
  listProducts: () => apiClient.get<OneWebProducts>("oneweb/products").then((r) => r.data),

  /** `productId` вида `SC-000123`; `month` — `YYYY-MM` (не будущий, не старше пяти лет). */
  getUsage: (productId: string, month?: string) =>
    apiClient.get<OneWebUsage>(`oneweb/products/${productId}/usage`, {params: {month}}).then((r) => r.data),
}
