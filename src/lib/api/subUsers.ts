import {apiClient} from "./client"
import type {User} from "./auth"

export interface CreateSubUserPayload {
  /** Уникальный, не длиннее 32 символов (ограничение логина в старой БД). Становится логином. */
  email: string
  /** Не указан — сгенерируется и уйдёт на email. */
  password?: string | null
  /** Обязателен, если указан `password`. */
  password_confirmation?: string | null
  first_name?: string | null
  last_name?: string | null
  position?: string | null
  /** По умолчанию `false`. */
  is_user_manager?: boolean
}

/** Полная замена полей; `password` не указан — пароль не меняется. */
export interface UpdateSubUserPayload extends Omit<CreateSubUserPayload, "is_user_manager"> {
  is_user_manager: boolean
}

/** Доступно только при `is_user_manager: true` (иначе 403). */
export const subUsersApi = {
  /** Все пользователи ниже текущего в дереве. */
  list: () => apiClient.get<User[]>("sub-users").then((r) => r.data),
  get: (id: number) => apiClient.get<User>(`sub-users/${id}`).then((r) => r.data),
  create: (payload: CreateSubUserPayload) => apiClient.post<User>("sub-users", payload).then((r) => r.data),
  update: (id: number, payload: UpdateSubUserPayload) => apiClient.put<User>(`sub-users/${id}`, payload).then((r) => r.data),
  /** 409 — на пользователя ссылаются заявки или заказы. Его дети переходят к его родителю. */
  remove: (id: number) => apiClient.delete<void>(`sub-users/${id}`).then((r) => r.data),
}
