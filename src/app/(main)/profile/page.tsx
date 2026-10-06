"use client"

import {useState} from "react"
import {toast} from "sonner"
import {KeyRound} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Page, Card, CardHeader} from "@/app/components/common/Page"
import {Field} from "@/app/components/common/Field"
import {LottieAnimation} from "@/app/components/common/LottieAnimation"
import {ErrorBanner, NO_ERROR, firstError, handleFormError, type FormError} from "@/app/components/common/formError"
import {useI18n, type MessageKey} from "@/i18n"
import {authApi} from "@/lib/api/auth"
import {useAuthStore} from "@/lib/stores/authStore"
import {useProfileStore} from "@/lib/stores/profileStore"

/** Профиль: данные пользователя и смена пароля. */
export default function ProfilePage() {
  const {t} = useI18n()
  // profile — свежий ответ /me, user — сохранённый при входе; берём свежий, если уже пришёл
  const profile = useProfileStore((s) => s.profile)
  const authUser = useAuthStore((s) => s.user)
  const me = profile ?? authUser

  const rows: [MessageKey, string | null | undefined][] = [
    ["profile.name", [me?.first_name, me?.last_name].filter(Boolean).join(" ")],
    ["profile.email", me?.email],
    ["profile.login", me?.username],
    ["profile.position", me?.position],
    ["profile.phone", me?.phone],
    ["profile.account", me?.dogid],
    ["profile.timezone", me?.timezone],
  ]

  return (
    <Page title={t("profile.title")} illustration={<LottieAnimation src="/videos/profile.json" />}>
      <div className="space-y-6">
        <Card>
          <CardHeader title={t("profile.userData")} />
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-[180px_1fr]">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{t(label)}</dt>
                <dd className="font-medium wrap-break-word">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader title={t("profile.changePassword")} />
          <PasswordForm />
        </Card>
      </div>
    </Page>
  )
}

function PasswordForm() {
  const {t} = useI18n()
  const [current, setCurrent] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<FormError>(NO_ERROR)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr(NO_ERROR)
    try {
      await authApi.changePassword({current_password: current, password, password_confirmation: confirmation})
      toast.success(t("profile.passwordChanged"))
      setCurrent("")
      setPassword("")
      setConfirmation("")
    } catch (e) {
      setErr(handleFormError(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <ErrorBanner message={err.banner} />
      <Field label={t("profile.currentPassword")} required error={firstError(err, "current_password")}>
        <Input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          aria-invalid={!!firstError(err, "current_password")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("profile.newPassword")}
          required
          error={firstError(err, "password")}
          hint={t("profile.newPasswordHint")}
        >
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!firstError(err, "password")}
          />
        </Field>
        <Field label={t("profile.confirmPassword")} required error={firstError(err, "password_confirmation")}>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            aria-invalid={!!firstError(err, "password_confirmation")}
          />
        </Field>
      </div>
      <Button
        type="submit"
        disabled={saving || !current || !password}
        className="bg-brand hover:bg-brand/90 h-10 px-5 text-white"
      >
        <KeyRound /> {saving ? t("profile.saving") : t("profile.submit")}
      </Button>
    </form>
  )
}
