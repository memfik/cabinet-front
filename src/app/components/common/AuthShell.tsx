"use client"

import {Sun, Moon} from "lucide-react"
import {useAppTheme} from "@/app/components/layout/ThemeContext"
import {cn} from "@/lib/utils"

/**
 * Обёртка публичных страниц (восстановление пароля): aurora-фон, карточка, логотип и переключатель темы —
 * визуально совпадает со страницей входа.
 */
export function AuthShell({title, subtitle, children}: {title: string; subtitle?: string; children: React.ReactNode}) {
  const {isDark, toggleTheme} = useAppTheme()

  return (
    <div className="relative flex h-screen overflow-hidden">
      <div aria-hidden className="bg-background absolute inset-0 overflow-hidden">
        <div className="animate-aurora-1 bg-brand/25 dark:bg-brand/20 absolute -top-1/4 -left-1/6 size-[60vmax] rounded-full blur-[120px]" />
        <div className="animate-aurora-2 absolute top-1/4 -right-1/6 size-[50vmax] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-500/15" />
        <div className="animate-aurora-3 bg-brand/15 absolute -bottom-1/4 left-1/4 size-[45vmax] rounded-full blur-[120px] dark:bg-indigo-500/15" />
        <div className="animate-aurora-4 bg-brand/10 absolute top-1/3 left-1/2 size-[40vmax] rounded-full blur-[120px] dark:bg-blue-400/10" />
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-6 py-8 sm:px-12 lg:px-16">
        <button
          type="button"
          onClick={(e) => toggleTheme(e)}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 flex items-center gap-2 text-sm transition-colors"
          aria-label="Сменить тему"
        >
          {isDark ? <Sun className="size-6 text-yellow-400" /> : <Moon className="size-6" />}
          <div
            className={cn(
              "relative inline-flex h-6 w-9.5 shrink-0 items-center rounded-full transition-colors",
              isDark ? "bg-brand" : "bg-zinc-400"
            )}
          >
            <span
              className={cn(
                "inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform",
                isDark ? "translate-x-4.5" : "translate-x-0.5"
              )}
            />
          </div>
        </button>

        <div className="sm:bg-card/60 sm:border-border/60 sm:dark:bg-card/40 w-full max-w-md sm:rounded-3xl sm:border sm:p-12 sm:shadow-2xl sm:shadow-black/10 sm:backdrop-blur-xl sm:dark:shadow-black/40">
          <div className="mb-10 flex justify-center">
            <img src={isDark ? "/logo-white.png" : "/logo-black.png"} alt="Logo" className="h-14 object-contain" />
          </div>
          <h1 className="mb-1.5 text-center text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground mb-10 text-center text-[15px]">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}
