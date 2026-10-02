import {create} from "zustand"
import {devtools} from "zustand/middleware"
import {authApi} from "@/lib/api/auth"
import type {ProfileUser} from "@/lib/api/auth"

interface ProfileState {
  profile: ProfileUser | null
  loaded: boolean
  fetch: () => Promise<void>
}

/** Профиль из GET /profile. Ленивый: повторный fetch() после загрузки ничего не делает. */
export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      profile: null,
      loaded: false,
      fetch: async () => {
        if (get().loaded) return
        const res = await authApi.getProfile()
        set({profile: res, loaded: true}, false, "fetch")
      },
    }),
    {name: "ProfileStore"}
  )
)
