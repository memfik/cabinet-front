"use client"

import {Suspense, useState} from "react"
import Link from "next/link"
import {useRouter, useSearchParams} from "next/navigation"
import {toast} from "sonner"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {AuthShell} from "@/app/components/common/AuthShell"
import {Field} from "@/app/components/common/Field"
import {ErrorBanner, NO_ERROR, firstError, handleFormError, type FormError} from "@/app/components/common/formError"
import {useI18n} from "@/i18n"
import {authApi} from "@/lib/api/auth"

/** Установка нового пароля по ссылке из письма (`/reset-password?token=…`). Ссылка одноразовая. */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  )
}

function ResetForm() {
  const {t} = useI18n()
  const router = useRouter()
  const token = useSearchParams().get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<FormError>(NO_ERROR)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(NO_ERROR)
    try {
      await authApi.resetPassword({token, password, password_confirmation: confirmation})
      toast.success(t("auth.resetDone"))
      router.push("/login")
    } catch (e) {
      setErr(handleFormError(e))
    } finally {
      setLoading(false)
    }
  }

  // ошибка недействительной/просроченной ссылки приходит в поле token (или email) — выводим её блоком
  const linkError = firstError(err, "token") ?? firstError(err, "email")

  if (!token)
    return (
      <AuthShell title={t("auth.invalidLinkTitle")}>
        <p className="text-muted-foreground mb-6 text-center text-[15px]">{t("auth.invalidLinkText")}</p>
        <Link href="/forgot-password" className="text-brand block text-center text-sm font-medium hover:underline">
          {t("auth.requestNewLink")}
        </Link>
      </AuthShell>
    )

  return (
    <AuthShell title={t("auth.newPasswordTitle")} subtitle={t("auth.newPasswordSubtitle")}>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <ErrorBanner message={err.banner ?? linkError ?? null} />
        <Field label={t("auth.newPasswordLabel")} error={firstError(err, "password")}>
          <Input
            type="password"
            required
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 text-[15px]"
            aria-invalid={!!firstError(err, "password")}
          />
        </Field>
        <Field label={t("auth.confirmPasswordLabel")} error={firstError(err, "password_confirmation")}>
          <Input
            type="password"
            required
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="h-12 text-[15px]"
            aria-invalid={!!firstError(err, "password_confirmation")}
          />
        </Field>
        <Button
          type="submit"
          disabled={loading}
          className="bg-brand shadow-brand/30 hover:bg-brand/90 h-auto w-full py-3 text-base font-semibold text-white shadow-lg disabled:opacity-60"
        >
          {loading ? t("auth.saving") : t("auth.savePassword")}
        </Button>
        {linkError && (
          <Link href="/forgot-password" className="text-brand text-center text-sm font-medium hover:underline">
            {t("auth.requestNewLink")}
          </Link>
        )}
      </form>
    </AuthShell>
  )
}
