"use client"

import Link from "next/link"
import {useRouter} from "next/navigation"
import {ArrowLeft, Compass, Home, User} from "lucide-react"
import {Button} from "@/components/ui/button"

/** Куда увести пользователя с 404 — основные разделы кабинета. */
const SECTIONS = [
  {href: "/", icon: Home, label: "Главная", hint: "Стартовая страница"},
  {href: "/profile", icon: User, label: "Профиль", hint: "Данные аккаунта"},
]

/**
 * Страница 404. Рендерится корневым layout'ом — без шапки и навигации приложения,
 * поэтому разделы продублированы ссылками прямо здесь.
 *
 * Оформление повторяет экран входа (тот же aurora-фон и стеклянная карточка):
 * анимация отключается при prefers-reduced-motion — правило в globals.css.
 */
export default function NotFound() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div aria-hidden className="bg-background absolute inset-0 overflow-hidden">
        <div className="animate-aurora-1 bg-brand/25 dark:bg-brand/20 absolute -top-1/4 -left-1/6 size-[60vmax] rounded-full blur-[120px]" />
        <div className="animate-aurora-2 absolute top-1/4 -right-1/6 size-[50vmax] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-500/15" />
        <div className="animate-aurora-3 bg-brand/15 absolute -bottom-1/4 left-1/4 size-[45vmax] rounded-full blur-[120px] dark:bg-violet-500/15" />
      </div>

      <div className="sm:bg-card/60 sm:border-border/60 relative w-full max-w-2xl sm:rounded-3xl sm:border sm:p-12 sm:shadow-2xl sm:shadow-black/10 sm:backdrop-blur-xl sm:dark:bg-card/40 sm:dark:shadow-black/40">
        <div className="flex flex-col items-center text-center">
          <span className="bg-brand/10 mb-6 flex size-16 items-center justify-center rounded-2xl">
            <Compass className="text-brand size-8" />
          </span>

          <p className="from-brand to-brand/40 bg-linear-to-b bg-clip-text text-[88px] leading-none font-bold tracking-tight text-transparent select-none sm:text-[110px]">
            404
          </p>

          <h1 className="mt-4 text-2xl font-bold tracking-tight">Страница не найдена</h1>
          <p className="text-muted-foreground mt-2 max-w-md text-[15px] leading-relaxed">
            Адрес введён с ошибкой, или страницу переместили. Проверьте ссылку — либо перейдите в нужный раздел
            ниже.
          </p>

          <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SECTIONS.map(({href, icon: Icon, label, hint}) => (
              <Link
                key={href}
                href={href}
                className="border-border/60 bg-card/70 hover:border-brand/40 hover:bg-brand/5 group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
              >
                <span className="bg-brand/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="text-brand size-4" />
                </span>
                <span className="min-w-0">
                  <span className="group-hover:text-brand block text-sm font-semibold transition-colors">
                    {label}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">{hint}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="flex h-12 items-center gap-2 px-7 text-[15px] font-semibold max-sm:w-full sm:min-w-40"
            >
              <ArrowLeft className="size-4" />
              Назад
            </Button>
            <Button
              size="lg"
              onClick={() => router.push("/")}
              className="bg-brand hover:bg-brand/90 h-12 px-7 text-[15px] font-semibold text-white max-sm:w-full sm:min-w-40"
            >
              На главную
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
