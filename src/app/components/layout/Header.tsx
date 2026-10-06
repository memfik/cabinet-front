"use client"

import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"
import {useI18n} from "@/i18n"
import {cn} from "@/lib/utils"
import {UserMenu} from "./header/UserMenu"
import {useAuthStore} from "@/lib/stores/authStore"
import {isNavActive, navItems} from "./nav"

/** Шапка приложения: навигация и меню пользователя. */
export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const {t} = useI18n()
  const isManager = useAuthStore((s) => s.user?.is_user_manager)
  const items = navItems.filter((i) => !i.managerOnly || isManager)

  return (
    <header className="glass border-b">
      <div className="grid h-16 grid-cols-[1fr_auto_minmax(0,1fr)] items-center gap-3 px-4 md:px-16">
        <Link href="/" className="col-start-1 flex shrink-0 items-center gap-2.5 justify-self-start">
          <img src="/icon.svg" alt={t("shell.logoAlt")} className="size-10" />
          <span className="text-xl font-semibold">Cabinet</span>
        </Link>

        <nav className="col-start-2 hidden items-center gap-0.5 lg:flex">
          {items.map((item) => {
            const active = isNavActive(pathname, item.href)
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                  active
                    ? "bg-brand/10 text-brand dark:bg-brand/25 font-semibold dark:text-blue-300"
                    : "text-foreground/80 hover:bg-muted/50 hover:text-foreground font-medium"
                )}
              >
                <Icon className="size-4.5 shrink-0" />
                {t(item.labelKey)}
              </button>
            )
          })}
        </nav>

        <div className="col-start-3 flex min-w-0 items-center gap-2 justify-self-end">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
