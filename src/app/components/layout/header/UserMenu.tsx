"use client"

import {useRouter} from "next/navigation"
import {ChevronDown, ChevronsUpDown, LogOut, Sun, Moon, User as UserIcon} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useAppTheme} from "../ThemeContext"
import {cn} from "@/lib/utils"
import {authApi} from "@/lib/api/auth"
import {clearToken} from "@/lib/api/client"
import {useAuthStore} from "@/lib/stores/authStore"
import {toast} from "sonner"

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

/**
 * Меню пользователя: тема, акцентный цвет и выход. Тема и акцент пишутся в cookie,
 * чтобы сервер отдал верную разметку сразу и не мигал светлый экран.
 */
export function UserMenu({variant = "header"}: {variant?: "header" | "rail"}) {
  const rail = variant === "rail"
  const router = useRouter()
  const {isDark, setDark} = useAppTheme()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const user = useAuthStore((s) => s.user)
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Пользователь"

  async function handleLogout() {
    await authApi.logout()
    clearToken()
    clearAuth()
    toast.success("Вы вышли из системы.")
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            suppressHydrationWarning
            className={cn(
              "hover:bg-muted/50 flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors md:px-2",
              rail && "border-border bg-muted/40 hover:bg-muted/70 w-full gap-3 rounded-xl border p-2 md:px-2"
            )}
          />
        }
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white",
            rail && "size-10 text-[15px]"
          )}
        >
          {getInitials(name)}
        </span>
        {rail && (
          <>
            <div className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="w-full truncate text-sm leading-tight font-semibold">{name}</span>
              {user?.email && (
                <span className="text-muted-foreground w-full truncate text-xs leading-tight">{user.email}</span>
              )}
            </div>
            <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
          </>
        )}
        {!rail && (
          <>
            <div className="hidden min-w-0 flex-col items-start md:flex">
              <span className="max-w-35 truncate text-sm font-semibold">{name}</span>
            </div>
            <ChevronDown className="text-muted-foreground hidden size-3.5 shrink-0 md:block" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={rail ? "right" : "bottom"}
        align="end"
        sideOffset={rail ? 8 : 4}
        className="w-72 overflow-hidden p-0"
      >
        <div className="from-brand/15 via-brand/5 bg-linear-to-br to-transparent px-4 pt-4 pb-3.5">
          <div className="flex items-center gap-3">
            <span className="ring-background flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-base font-semibold text-white shadow-sm ring-2">
              {getInitials(name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              {user?.email && <p className="text-muted-foreground truncate text-xs">{user.email}</p>}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator className="my-0" />

        <div className="px-4 pt-3 pb-4">
          <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
            Тема оформления
          </p>
          <div className="flex gap-2">
            <button
              onClick={(e) => setDark(false, e)}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors",
                !isDark ? "border-brand text-brand bg-brand/5" : "border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Sun className="size-4" />
              Светлая
            </button>
            <button
              onClick={(e) => setDark(true, e)}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors",
                isDark ? "border-brand text-brand bg-brand/5" : "border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Moon className="size-4" />
              Тёмная
            </button>
          </div>
        </div>
        <DropdownMenuSeparator className="my-0" />

        <div className="py-1">
          <DropdownMenuItem
            onClick={() => router.push("/profile")}
            className="flex cursor-pointer items-center gap-2.5 rounded-none px-4 py-2.5 text-sm"
          >
            <UserIcon className="text-muted-foreground size-4.5" />
            <span>Профиль</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2.5 rounded-none px-4 py-2.5 text-sm"
          >
            <LogOut className="text-muted-foreground size-4.5" />
            <span>Выйти</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
