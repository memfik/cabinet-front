"use client"

import {usePathname, useRouter} from "next/navigation"
import {MoreHorizontal} from "lucide-react"
import {cn} from "@/lib/utils"
import {useAuthStore} from "@/lib/stores/authStore"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {isNavActive, navItems} from "./nav"

/** Сколько разделов показываем в ленте, остальные уходят в «Ещё». */
const VISIBLE_COUNT = 4

const itemClass = "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors"

/** Нижняя навигация — только в мобильной раскладке вместо меню шапки. Первые разделы в ленте, остальные — в меню «Ещё». */
export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isManager = useAuthStore((s) => s.user?.is_user_manager)
  const items = navItems.filter((i) => !i.managerOnly || isManager)

  const hasOverflow = items.length > VISIBLE_COUNT + 1
  const visible = hasOverflow ? items.slice(0, VISIBLE_COUNT) : items
  const overflow = hasOverflow ? items.slice(VISIBLE_COUNT) : []
  const overflowActive = overflow.some((i) => isNavActive(pathname, i.href))

  return (
    <nav className="bg-card border-border relative z-40 shrink-0 rounded-t-3xl border-t shadow-[0_-4px_16px_-8px_rgb(0_0_0/0.15)] pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex">
        {visible.map((item) => {
          const Icon = item.icon
          const active = isNavActive(pathname, item.href)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(itemClass, "min-w-0", active ? "text-brand" : "text-muted-foreground hover:text-foreground")}
            >
              <Icon className="size-5" />
              <span className="w-full truncate text-center">{item.label}</span>
            </button>
          )
        })}

        {hasOverflow && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className={cn(
                    itemClass,
                    "min-w-0",
                    overflowActive ? "text-brand" : "text-muted-foreground hover:text-foreground"
                  )}
                />
              }
            >
              <MoreHorizontal className="size-5" />
              Ещё
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-52 p-1">
              {overflow.map((item) => {
                const Icon = item.icon
                const active = isNavActive(pathname, item.href)
                return (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm",
                      active && "text-brand font-semibold"
                    )}
                  >
                    <Icon className="size-4.5" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}
