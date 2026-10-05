/**
 * Общий axios-клиент. Токен берётся из localStorage и подставляется в Bearer;
 * 401 очищает токен и уводит на /login — кроме запросов, помеченных skipAuthRedirect
 * (например запросов, где 401 означает «неверный пароль», а не протухшую сессию).
 *
 * Базовый путь — NEXT_PUBLIC_API_URL со слэшем на конце, поэтому пути даём БЕЗ ведущего слэша.
 */
import axios from "axios"
import {getLocale} from "@/i18n"

declare module "axios" {
  export interface AxiosRequestConfig {
    /** true — 401 в ответе не значит протухшую сессию, разлогинивать не нужно */
    skipAuthRedirect?: boolean
  }
}

/** Ключ токена. Дублируется в cookie: по ней proxy решает, пускать ли на страницу. */
export const TOKEN_KEY = "auth_token"

/**
 * Токен пишем дважды: в localStorage — для axios, в cookie — для проверки в proxy.
 * Cookie живёт до `expiresAt` из ответа логина (токен бэка — 14 дней), а не сутки.
 */
export function saveToken(token: string, expiresAt?: string) {
  localStorage.setItem(TOKEN_KEY, token)
  const expires = expiresAt ? `;expires=${new Date(expiresAt).toUTCString()}` : ""
  document.cookie = `${TOKEN_KEY}=${token};path=/${expires};SameSite=Lax`
}

/** Снимаем оба хранилища сразу, иначе proxy пустит на страницу без рабочего токена. */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = `${TOKEN_KEY}=;path=/;max-age=0`
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Content-Type axios выставит сам: JSON для объектов, multipart с boundary для FormData
  headers: {Accept: "application/json"},
  // NEXT_PUBLIC_API_MOCK=true — ответы из mock.ts, бэк не нужен (в проде ветка вырезается)
  ...(process.env.NEXT_PUBLIC_API_MOCK === "true" && {
    adapter: (config) => import("./mock").then((m) => m.mockAdapter(config)),
  }),
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // бэк отвечает по-русски, но язык интерфейса передаём — пригодится, когда он научится локализовать ответы
  config.headers["Accept-Language"] = getLocale()
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.skipAuthRedirect &&
      !window.location.pathname.startsWith("/login")
    ) {
      clearToken()
      // после повторного входа вернём на страницу, где сессия истекла
      const next = window.location.pathname + window.location.search
      window.location.href = `/login?next=${encodeURIComponent(next)}`
    }
    return Promise.reject(error)
  }
)
