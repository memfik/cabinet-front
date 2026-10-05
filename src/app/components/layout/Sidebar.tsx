"use client"

import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"
import {useI18n} from "@/i18n"
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
  const {t} = useI18n()
  const isManager = useAuthStore((s) => s.user?.is_user_manager)
  const items = navItems.filter((i) => !i.managerOnly || isManager)

  return (
    <aside className="bg-card border-border my-3 ml-3 hidden w-56 shrink-0 flex-col rounded-2xl border py-3 shadow-md lg:flex">
      <Link href="/" className="mx-4 mb-3 flex shrink-0 items-center gap-2.5" aria-label="Cabinet">
        <img src="/icon.svg" alt={t("shell.logoAlt")} className="size-10" />
        <span className="text-xl font-semibold">Cabinet</span>
      </Link>

      <nav className="flex min-h-0 w-full flex-1 [scrollbar-width:none] flex-col gap-1 overflow-y-auto px-3">
        {items.map((item) => {
          const Icon = item.icon
          const active = isNavActive(pathname, item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="size-5.5 shrink-0" />
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          )
        })}
      </nav>

      <div className="mx-3 mt-3 shrink-0">
        <UserMenu variant="rail" />
      </div>
    </aside>
  )
}
