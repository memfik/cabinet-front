import {apiClient} from "./client"
import type {DateTime} from "./types"

export type Role = "login" | "admin" | "support" | "support_admin"

export interface User {
  type: "users"
  id: number
  /** `null` — основной пользователь договора. */
  parent_id: number | null
  username: string
  email: string
  /** Номер ЛС с ведущими нулями (`004211`); `null` — нет договора. */
  dogid: string | null
  first_name: string | null
  last_name: string | null
  position: string | null
  phone: string | null
  timezone: string | null
  /** Может управлять субпользователями (раздел «Пользователи»). */
  is_user_manager: boolean
  is_registration_complete: boolean
  roles: Role[]
  /** Права текущего пользователя на эту запись — для показа кнопок. */
  permissions: {update: boolean; delete: boolean}
}

/** Текущий пользователь (GET /me). */
export type ProfileUser = User

export interface LoginPayload {
  /** Email или логин. */
  login: string
  password: string
}

export interface LoginResult {
  type: "auth-tokens"
  token: string
  token_type: "Bearer"
  expires_at: DateTime
  user: User
}

export interface ResetPasswordPayload {
  /** Токен из ссылки письма (`/reset-password?token=…`). */
  token: string
  password: string
  password_confirmation: string
}

export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

/** Есть ли у пользователя роль (`login`, `admin`, `support`, `support_admin`). */
export function hasRole(user: User | null, role: Role): boolean {
  return !!user && user.roles.includes(role)
}

/** Методы возвращают уже развёрнутое тело ответа (r.data). */
export const authApi = {
  // POST /auth/login. Токен сохраняет вызывающий: saveToken(data.token, data.expires_at).
  // 401 здесь — «неверный логин/пароль», а не протухшая сессия, поэтому skipAuthRedirect.
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResult>("auth/login", payload, {skipAuthRedirect: true}).then((r) => r.data),

  // POST /auth/logout — отзывает только текущий токен (204)
  logout: () => apiClient.post<void>("auth/logout").then((r) => r.data),

  // POST /auth/forgot-password — всегда 204, даже если email не найден
  forgotPassword: (email: string) =>
    apiClient.post<void>("auth/forgot-password", {email}, {skipAuthRedirect: true}).then((r) => r.data),

  // POST /auth/reset-password — после успеха все токены отозваны, нужно войти заново
  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<void>("auth/reset-password", payload, {skipAuthRedirect: true}).then((r) => r.data),

  // PUT /auth/password — остальные сессии пользователя разлогиниваются, текущая остаётся
  changePassword: (payload: ChangePasswordPayload) => apiClient.put<void>("auth/password", payload).then((r) => r.data),

  // GET /me
  getProfile: () => apiClient.get<ProfileUser>("me").then((r) => r.data),
}
