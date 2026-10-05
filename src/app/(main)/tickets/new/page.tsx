"use client"

import {useState} from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {ArrowLeft} from "lucide-react"
import {toast} from "sonner"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Page, Card, CardHeader} from "@/app/components/common/Page"
import {ErrorState, Skeleton} from "@/app/components/common/States"
import {Field, SelectField} from "@/app/components/common/Field"
import {errFields, errMsg, errStatus, ticketsApi} from "@/lib/api"
import {useApi} from "@/lib/hooks/useApi"
import {useAuthStore} from "@/lib/stores/authStore"
import {cn} from "@/lib/utils"
import {useI18n} from "@/i18n"

/** `datetime-local` (`2026-09-30T10:15`) → формат API со смещением Алматы. */
const toApiDateTime = (v: string) => (v ? `${v}:00+05:00` : undefined)

/** Текущее время в формате `datetime-local`. */
function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

/** Создание заявки. Справочники берём с бэка (`GET /tickets/options`). */
export default function NewTicketPage() {
  const router = useRouter()
  const {t} = useI18n()
  const user = useAuthStore((s) => s.user)
  const {data: options, error: optionsError, reload} = useApi(() => ticketsApi.getFormOptions())

  const [form, setForm] = useState({
    subject: "",
    description: "",
    symptom_id: "",
    branch_id: "",
    resource: "",
    detected_at: nowLocal(),
    downtime_started_at: "",
  })
  const [services, setServices] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)

  // Контакт по умолчанию — сам пользователь; пока поле не тронуто (null), показываем данные профиля
  const defaults = {
    contact_name: [user?.first_name, user?.last_name].filter(Boolean).join(" "),
    contact_phone: user?.phone ?? "",
    contact_email: user?.email ?? "",
  }
  const [contact, setContact] = useState<Partial<typeof defaults>>({})
  const contactValue = (k: keyof typeof defaults) => contact[k] ?? defaults[k]

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({...f, [key]: value}))
  const setC = (key: keyof typeof defaults) => (value: string) => setContact((c) => ({...c, [key]: value}))
  const err = (key: string) => errors[key]?.[0]
  // ошибки по услугам приходят как `services` или `services.0`, `services.1`…
  const servicesError = Object.entries(errors).find(([k]) => k === "services" || k.startsWith("services."))?.[1][0]

  const toggleService = (id: number) => setServices((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const ticket = await ticketsApi.create({
        subject: form.subject,
        description: form.description,
        services,
        symptom_id: Number(form.symptom_id),
        branch_id: Number(form.branch_id),
        contact_name: contactValue("contact_name"),
        contact_phone: contactValue("contact_phone"),
        contact_email: contactValue("contact_email"),
        resource: form.resource || null,
        detected_at: toApiDateTime(form.detected_at) ?? "",
        downtime_started_at: toApiDateTime(form.downtime_started_at) ?? null,
      })
      toast.success(t("tickets.created", {number: ticket.number}))
      router.push(`/tickets/${ticket.id}`)
    } catch (e) {
      const fields = errFields(e)
      if (errStatus(e) === 422 && Object.keys(fields).length) setErrors(fields)
      else toast.error(errMsg(e, t("tickets.createFailed")))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page
      title={t("tickets.newTitle")}
      description={t("tickets.newDescription")}
      actions={
        <Button variant="ghost" render={<Link href="/tickets" />} nativeButton={false}>
          <ArrowLeft /> {t("tickets.toList")}
        </Button>
      }
    >
      {optionsError ? (
        <Card>
          <ErrorState error={optionsError} onRetry={reload} />
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Отказ helpdesk приходит в errors.ticket */}
          {err("ticket") && (
            <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">{err("ticket")}</div>
          )}

          <Card>
            <CardHeader title={t("tickets.sectionProblem")} />
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Field label={t("tickets.fieldSubject")} required error={err("subject")} className="md:col-span-2">
                <Input
                  value={form.subject}
                  maxLength={255}
                  onChange={(e) => set("subject")(e.target.value)}
                  aria-invalid={!!err("subject")}
                />
              </Field>

              <Field label={t("tickets.fieldSymptom")} required error={err("symptom_id")}>
                {options ? (
                  <SelectField
                    value={form.symptom_id}
                    onChange={set("symptom_id")}
                    options={options.symptoms.map((o) => ({value: String(o.id), label: o.name}))}
                    invalid={!!err("symptom_id")}
                  />
                ) : (
                  <Skeleton className="h-10" />
                )}
              </Field>

              <Field label={t("tickets.fieldBranch")} required error={err("branch_id")}>
                {options ? (
                  <SelectField
                    value={form.branch_id}
                    onChange={set("branch_id")}
                    options={options.branches.map((o) => ({value: String(o.id), label: o.name}))}
                    invalid={!!err("branch_id")}
                  />
                ) : (
                  <Skeleton className="h-10" />
                )}
              </Field>

              <Field label={t("tickets.fieldServices")} required error={servicesError} className="md:col-span-2">
                {options ? (
                  <div className="flex flex-col gap-3">
                    {[
                      {title: t("tickets.servicesMain"), list: options.services},
                      {title: t("tickets.servicesAdditional"), list: options.additional_services},
                    ]
                      .filter((g) => g.list.length)
                      .map((g) => (
                        <div key={g.title}>
                          <p className="text-muted-foreground mb-1.5 text-xs">{g.title}</p>
                          <div className="flex flex-wrap gap-2">
                            {g.list.map((s) => {
                              const on = services.includes(s.id)
                              return (
                                <label
                                  key={s.id}
                                  className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                                    on ? "border-brand bg-brand/10 text-brand" : "border-input hover:bg-muted/50"
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    checked={on}
                                    onChange={() => toggleService(s.id)}
                                    className="accent-brand size-4"
                                  />
                                  {s.name}
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <Skeleton className="h-16" />
                )}
              </Field>

              <Field
                label={t("tickets.fieldDescription")}
                required
                error={err("description")}
                className="md:col-span-2"
              >
                <Textarea
                  rows={5}
                  value={form.description}
                  maxLength={10000}
                  onChange={(e) => set("description")(e.target.value)}
                  aria-invalid={!!err("description")}
                />
              </Field>

              <Field label={t("tickets.fieldResource")} error={err("resource")} hint={t("tickets.resourceHint")}>
                <Input value={form.resource} maxLength={255} onChange={(e) => set("resource")(e.target.value)} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("tickets.fieldDetectedAt")} required error={err("detected_at")}>
                  <Input
                    type="datetime-local"
                    value={form.detected_at}
                    max={nowLocal()}
                    onChange={(e) => set("detected_at")(e.target.value)}
                    aria-invalid={!!err("detected_at")}
                  />
                </Field>
                <Field label={t("tickets.fieldDowntimeStart")} error={err("downtime_started_at")}>
                  <Input
                    type="datetime-local"
                    value={form.downtime_started_at}
                    max={nowLocal()}
                    onChange={(e) => set("downtime_started_at")(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title={t("tickets.sectionContact")} />
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <Field label={t("tickets.fieldName")} required error={err("contact_name")}>
                <Input
                  value={contactValue("contact_name")}
                  maxLength={255}
                  onChange={(e) => setC("contact_name")(e.target.value)}
                  aria-invalid={!!err("contact_name")}
                />
              </Field>
              <Field label={t("tickets.fieldPhone")} required error={err("contact_phone")}>
                <Input
                  type="tel"
                  value={contactValue("contact_phone")}
                  maxLength={50}
                  onChange={(e) => setC("contact_phone")(e.target.value)}
                  aria-invalid={!!err("contact_phone")}
                />
              </Field>
              <Field label={t("tickets.fieldEmail")} required error={err("contact_email")}>
                <Input
                  type="email"
                  value={contactValue("contact_email")}
                  maxLength={255}
                  onChange={(e) => setC("contact_email")(e.target.value)}
                  aria-invalid={!!err("contact_email")}
                />
              </Field>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="h-10 px-4" render={<Link href="/tickets" />} nativeButton={false}>
              {t("tickets.cancel")}
            </Button>
            <Button type="submit" disabled={saving} className="bg-brand hover:bg-brand/90 h-10 px-5 text-white">
              {saving ? t("tickets.sending") : t("tickets.createTicket")}
            </Button>
          </div>
        </form>
      )}
    </Page>
  )
}
