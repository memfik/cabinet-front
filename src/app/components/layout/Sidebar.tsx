"use client"

import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"
import {cn} from "@/lib/utils"
import {useAuthStore} from "@/lib/stores/authStore"
import {UserMenu} from "./header/UserMenu"
import {isNavActive, navItems} from "./nav"

/**
 * Левая колонка навигации в стиле Telegram: узкая лента, иконка над подписью,
 * активный раздел — скруглённая плашка. Внизу — меню пользователя. Только десктоп (lg+).
 */
export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const isManager = useAuthStore((s) => s.user?.is_user_manager)
  const items = navItems.filter((i) => !i.managerOnly || isManager)

  return (
    <aside className="bg-card border-border my-3 ml-3 hidden w-24 shrink-0 flex-col items-center rounded-2xl border py-3 shadow-md lg:flex">
      <Link href="/" className="mb-3 flex size-11 shrink-0 items-center justify-center" aria-label="Cabinet">
        <img src="/icon.svg" alt="Логотип" className="size-10" />
      </Link>

      <nav className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2 [scrollbar-width:none]">
        {items.map((item) => {
          const Icon = item.icon
          const active = isNavActive(pathname, item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] leading-tight font-medium transition-colors",
                active ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="size-6 shrink-0" />
              <span className="w-full truncate text-center">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-3 shrink-0">
        <UserMenu variant="rail" />
      </div>
    </aside>
  )
}
