import {create} from "zustand"
import {persist, devtools} from "zustand/middleware"
import type {User} from "@/lib/api/auth"

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

/** Пользователь и токен, сохраняются в localStorage под ключом "auth". */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        setAuth: (user, token) => set({user, token}, false, "setAuth"),
        clearAuth: () => set({user: null, token: null}, false, "clearAuth"),
      }),
      {name: "auth"}
    ),
    {name: "AuthStore"}
  )
)
