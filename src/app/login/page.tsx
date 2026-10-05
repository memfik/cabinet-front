"use client"

import {Suspense, useState, useEffect} from "react"
import Link from "next/link"
import {useRouter, useSearchParams} from "next/navigation"
import {Eye, EyeOff, Sun, Moon} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {LogoMark} from "@/app/components/common/LogoMark"
import {useAppTheme} from "@/app/components/layout/ThemeContext"
import {useI18n} from "@/i18n"
import {LanguageSwitcher} from "@/i18n/ui/LanguageSwitcher"
import {cn} from "@/lib/utils"
import {authApi} from "@/lib/api/auth"
import {saveToken} from "@/lib/api/client"
import {errMsg} from "@/lib/api/errors"
import {useAuthStore} from "@/lib/stores/authStore"
import {toast} from "sonner"

const DEFAULT_AFTER_LOGIN = "/"

// принимаем только относительные пути — «//host» и абсолютные URL отбрасываем (open redirect)
function safeNext(value: string | null | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : DEFAULT_AFTER_LOGIN
}

/**
 * Вход в систему. После успешного логина токен кладётся и в localStorage (для axios),
 * и в cookie (по ней proxy пускает на защищённые страницы), а в authStore попадает
 * пользователь со всеми ролями и доступами.
 *
 * Параметр `next` возвращает пользователя на страницу, куда он шёл; принимаются
 * только относительные пути (см. safeNext) — иначе это открытый редирект.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const {t} = useI18n()
  const router = useRouter()
  const next = safeNext(useSearchParams().get("next"))
  const {isDark, toggleTheme} = useAppTheme()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (token) {
      router.replace(next)
    }
  }, [token, router, next])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authApi.login({login, password})
      saveToken(data.token, data.expires_at)
      setAuth(data.user, data.token)
      toast.success(t("auth.loginSuccess"))
      router.push(next)
    } catch (err: unknown) {
      toast.error(errMsg(err, t("auth.loginError")))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Aurora-фон: плывущие размытые пятна в бренд-тонах — вращаются и дышат
          прозрачностью каждое в своём ритме, поэтому движение не выглядит
          зацикленным. */}
      <div aria-hidden className="bg-background absolute inset-0 overflow-hidden">
        <div className="animate-aurora-1 bg-brand/25 dark:bg-brand/20 absolute -top-1/4 -left-1/6 size-[60vmax] rounded-full blur-[120px]" />
        <div className="animate-aurora-2 absolute top-1/4 -right-1/6 size-[50vmax] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-500/15" />
        <div className="animate-aurora-3 bg-brand/15 absolute -bottom-1/4 left-1/4 size-[45vmax] rounded-full blur-[120px] dark:bg-indigo-500/15" />
        <div className="animate-aurora-4 bg-brand/10 absolute top-1/3 left-1/2 size-[40vmax] rounded-full blur-[120px] dark:bg-blue-400/10" />
        <LogoMark className="text-brand absolute top-1/2 left-1/2 size-[min(130vmin,1000px)] -translate-x-1/2 -translate-y-1/2 opacity-20 dark:opacity-25" />
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-6 py-8 sm:px-12 lg:px-16">
        <LanguageSwitcher variant="compact" className="absolute top-4 left-4 z-10" />
        <button
          type="button"
          onClick={(e) => toggleTheme(e)}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 flex items-center gap-2 text-sm transition-colors"
          aria-label={t("auth.toggleTheme")}
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
            <img
              src={isDark ? "/logo-white.png" : "/logo-black.png"}
              alt={t("auth.logoAlt")}
              className="h-14 object-contain"
            />
          </div>

          <h1 className="mb-1.5 text-center text-2xl font-bold">{t("auth.welcome")}</h1>
          <p className="text-muted-foreground mb-10 text-center text-[15px]">{t("auth.loginSubtitle")}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-[15px] font-medium">{t("auth.loginLabel")}</Label>
              <Input
                type="text"
                required
                placeholder="example@jusanmobile.kz"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="h-12 text-[15px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[15px] font-medium">{t("auth.passwordLabel")}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-11 text-[15px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </Button>
              </div>
              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-brand self-end text-sm transition-colors"
              >
                {t("auth.forgot")}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-brand shadow-brand/30 hover:bg-brand/90 mt-1 h-auto w-full py-3 text-base font-semibold text-white shadow-lg disabled:opacity-60"
            >
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
