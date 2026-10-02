"use client"

import {useState} from "react"
import Link from "next/link"
import {MailCheck} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {AuthShell} from "@/app/components/common/AuthShell"
import {Field} from "@/app/components/common/Field"
import {ErrorBanner, NO_ERROR, firstError, handleFormError, type FormError} from "@/app/components/common/formError"
import {authApi} from "@/lib/api/auth"

/** Запрос ссылки для восстановления пароля. Бэк всегда отвечает 204 — не раскрываем, есть ли такой email. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<FormError>(NO_ERROR)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(NO_ERROR)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (e) {
      setErr(handleFormError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Восстановление пароля" subtitle="Укажите email — отправим ссылку для смены пароля">
      {sent ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="bg-brand/10 text-brand flex size-14 items-center justify-center rounded-full">
            <MailCheck className="size-7" />
          </span>
          <p className="text-[15px]">
            Если такой email зарегистрирован, мы отправили ссылку для восстановления пароля.
          </p>
          <p className="text-muted-foreground text-sm">Ссылка действует 24 часа.</p>
          <Link href="/login" className="text-brand text-sm font-medium hover:underline">
            Вернуться ко входу
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-6">
          <ErrorBanner message={err.banner} />
          <Field label="Email" error={firstError(err, "email")}>
            <Input
              type="email"
              required
              autoFocus
              placeholder="example@jusanmobile.kz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-[15px]"
              aria-invalid={!!firstError(err, "email")}
            />
          </Field>
          <Button
            type="submit"
            disabled={loading}
            className="bg-brand shadow-brand/30 hover:bg-brand/90 h-auto w-full py-3 text-base font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {loading ? "Отправка…" : "Отправить ссылку"}
          </Button>
          <Link href="/login" className="text-muted-foreground hover:text-foreground text-center text-sm">
            Вернуться ко входу
          </Link>
        </form>
      )}
    </AuthShell>
  )
}
