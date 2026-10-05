"use client"

import {useState} from "react"
import {toast} from "sonner"
import {FileText, Settings2, PowerOff, Phone} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Page, Card} from "@/app/components/common/Page"
import {LottieAnimation} from "@/app/components/common/LottieAnimation"
import {ErrorState, Skeleton} from "@/app/components/common/States"
import {Field, SelectField, type Option} from "@/app/components/common/Field"
import {Badge} from "@/app/components/common/Badge"
import {ErrorBanner, NO_ERROR, firstError, handleFormError, type FormError} from "@/app/components/common/formError"
import {useApi} from "@/lib/hooks/useApi"
import {cn} from "@/lib/utils"
import {dashboardApi} from "@/lib/api/dashboard"
import {requestsApi} from "@/lib/api/requests"
import type {
  DocumentRequestType,
  PhoneOptionKey,
  PrepaidSpeed,
  RequestFormOptions,
  ServiceSettingsPayload,
  SuspendResume,
  UnlimitedSpeed,
  WifiSetup,
} from "@/lib/api/requests"
import {useAuthStore} from "@/lib/stores/authStore"

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
]

/** Заявления: три формы, уходящие письмом сотрудникам. Справочники подгружаются с бэка. */
export default function RequestsPage() {
  const {data: options, error, loading, reload} = useApi(() => requestsApi.getOptions())

  return (
    <Page
      title="Заявления"
      description="Запрос документов, изменение настроек и отключение услуг. Заявление уходит сотрудникам письмом."
      illustration={<LottieAnimation src="/videos/application.json" />}
    >
      {loading && !options ? (
        <Card className="space-y-4 p-6">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      ) : error && !options ? (
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      ) : (
        options && (
          <Tabs defaultValue="document">
            <TabsList className="h-auto w-full flex-wrap gap-1 p-1.5 group-data-horizontal/tabs:h-auto sm:w-fit">
              <TabsTrigger value="document" className="h-11 px-5 text-[15px]">
                <FileText /> Документ
              </TabsTrigger>
              <TabsTrigger value="settings" className="h-11 px-5 text-[15px]">
                <Settings2 /> Настройки услуг
              </TabsTrigger>
              <TabsTrigger value="disconnect" className="h-11 px-5 text-[15px]">
                <PowerOff /> Отключение
              </TabsTrigger>
            </TabsList>
            <TabsContent value="document" className="mt-4">
              <DocumentForm options={options} />
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <SettingsForm options={options} />
            </TabsContent>
            <TabsContent value="disconnect" className="mt-4">
              <DisconnectionForm />
            </TabsContent>
          </Tabs>
        )
      )}
    </Page>
  )
}

/* ---------- (а) запрос документа ---------- */

function DocumentForm({options}: {options: RequestFormOptions}) {
  const userEmail = useAuthStore((s) => s.user?.email)
  const now = new Date()
  const [type, setType] = useState("")
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [email, setEmail] = useState(userEmail ?? "")
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<FormError>(NO_ERROR)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setErr(NO_ERROR)
    try {
      await requestsApi.sendDocument({
        type: type as DocumentRequestType,
        month: Number(month),
        year: Number(year),
        email,
      })
      toast.success("Заявление отправлено")
    } catch (e) {
      setErr(handleFormError(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="p-5 md:p-6">
      <ErrorBanner message={err.banner} />
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <Field label="Документ" required error={firstError(err, "type")} className="sm:col-span-2">
          <SelectField
            value={type}
            onChange={setType}
            options={options.document_types}
            placeholder="Выберите документ"
            invalid={!!firstError(err, "type")}
          />
        </Field>
        <Field label="Месяц" required error={firstError(err, "month")}>
          <SelectField
            value={month}
            onChange={setMonth}
            options={MONTHS.map((label, i) => ({value: String(i + 1), label}))}
            invalid={!!firstError(err, "month")}
          />
        </Field>
        <Field label="Год" required error={firstError(err, "year")} hint={`От 2012 до ${now.getFullYear()}`}>
          <Input
            type="number"
            min={2012}
            max={now.getFullYear()}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-invalid={!!firstError(err, "year")}
          />
        </Field>
        <Field label="Email для отправки" required error={firstError(err, "email")} className="sm:col-span-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.kz"
            aria-invalid={!!firstError(err, "email")}
          />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={sending || !type} className="bg-brand hover:bg-brand/90 h-10 px-5 text-white">
            {sending ? "Отправка…" : "Отправить заявление"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/* ---------- (б) изменение настроек услуг ---------- */

type Change = "" | "open" | "close"

function SettingsForm({options}: {options: RequestFormOptions}) {
  const [addresses, setAddresses] = useState("")
  const [contact, setContact] = useState("")
  const [telephony, setTelephony] = useState("")
  const [internet, setInternet] = useState("")
  const [phoneOptions, setPhoneOptions] = useState<Partial<Record<string, Change>>>({})
  const [wifi, setWifi] = useState("")
  const [unlimited, setUnlimited] = useState("")
  const [prepaid, setPrepaid] = useState("")
  const [comment, setComment] = useState("")
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<FormError>(NO_ERROR)

  // «Не менять» — пустое значение, в payload не попадает
  const withKeep = (list: Option[]): Option[] => [{value: "", label: "Не менять"}, ...list]

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setErr(NO_ERROR)

    const chosen = Object.fromEntries(Object.entries(phoneOptions).filter(([, v]) => v)) as Partial<
      Record<PhoneOptionKey, "open" | "close">
    >
    const payload: ServiceSettingsPayload = {addresses, contact}
    if (telephony) payload.telephony = telephony as SuspendResume
    if (internet) payload.internet = internet as SuspendResume
    if (Object.keys(chosen).length) payload.phone_options = chosen
    if (wifi) payload.wifi_setup = wifi as WifiSetup
    if (unlimited) payload.unlimited_speed = unlimited as UnlimitedSpeed
    if (prepaid) payload.prepaid_speed = prepaid as PrepaidSpeed
    if (comment.trim()) payload.comment = comment.trim()

    try {
      await requestsApi.sendServiceSettings(payload)
      toast.success("Заявление отправлено")
    } catch (e) {
      setErr(handleFormError(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="p-5 md:p-6">
      <ErrorBanner message={err.banner} />
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Адреса подключения" required error={firstError(err, "addresses")} className="sm:col-span-2">
            <Textarea
              value={addresses}
              onChange={(e) => setAddresses(e.target.value)}
              rows={2}
              maxLength={2000}
              aria-invalid={!!firstError(err, "addresses")}
            />
          </Field>
          <Field
            label="Контактное лицо и телефон"
            required
            error={firstError(err, "contact")}
            className="sm:col-span-2"
          >
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={500}
              placeholder="Иван Иванов, +7 701 000 00 00"
              aria-invalid={!!firstError(err, "contact")}
            />
          </Field>
        </div>

        <p className="text-muted-foreground text-sm">Заполните только то, что нужно изменить.</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Телефония" error={firstError(err, "telephony")}>
            <SelectField
              value={telephony}
              onChange={setTelephony}
              options={withKeep(options.service_availability_changes)}
            />
          </Field>
          <Field label="Интернет" error={firstError(err, "internet")}>
            <SelectField
              value={internet}
              onChange={setInternet}
              options={withKeep(options.service_availability_changes)}
            />
          </Field>
          <Field label="Настройка Wi-Fi" error={firstError(err, "wifi_setup")}>
            <SelectField value={wifi} onChange={setWifi} options={withKeep(options.wifi_setups)} />
          </Field>
          <span className="hidden sm:block" />
          <Field label="Скорость безлимитного тарифа" error={firstError(err, "unlimited_speed")}>
            <SelectField value={unlimited} onChange={setUnlimited} options={withKeep(options.unlimited_speeds)} />
          </Field>
          <Field label="Скорость и объём предоплаченного тарифа" error={firstError(err, "prepaid_speed")}>
            <SelectField value={prepaid} onChange={setPrepaid} options={withKeep(options.prepaid_speeds)} />
          </Field>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Phone className="text-muted-foreground size-4" /> Опции телефонии
          </h3>
          <div className="border-border divide-border divide-y rounded-lg border">
            {options.phone_options.map((o) => (
              <div key={o.value} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <span>{o.label}</span>
                  {o.is_paid_call && <Badge tone="warning">платные звонки</Badge>}
                </div>
                <Segmented
                  value={phoneOptions[o.value] ?? ""}
                  onChange={(v) => setPhoneOptions((s) => ({...s, [o.value]: v as Change}))}
                  options={withKeep(options.phone_option_changes)}
                />
              </div>
            ))}
          </div>
          {firstError(err, "phone_options") && (
            <p className="text-destructive mt-1.5 text-xs">{firstError(err, "phone_options")}</p>
          )}
        </div>

        <Field label="Комментарий" error={firstError(err, "comment")}>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={2000} />
        </Field>

        <Button type="submit" disabled={sending} className="bg-brand hover:bg-brand/90 h-10 px-5 text-white">
          {sending ? "Отправка…" : "Отправить заявление"}
        </Button>
      </form>
    </Card>
  )
}

/** Переключатель из 2–3 вариантов в одну строку («Не менять / Открыть / Закрыть»). */
function Segmented({value, onChange, options}: {value: string; onChange: (v: string) => void; options: Option[]}) {
  return (
    <div className="bg-muted inline-flex rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- (в) отключение услуги ---------- */

function DisconnectionForm() {
  const {data: dashboard, error, loading, reload} = useApi(() => dashboardApi.get())
  const [service, setService] = useState("")
  const [confirm, setConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<FormError>(NO_ERROR)

  const services = dashboard?.services ?? []
  const selected = services.find((s) => `${s.tariff_id}:${s.account_name_id}` === service)

  async function send() {
    if (!selected) return
    setSending(true)
    setErr(NO_ERROR)
    try {
      await requestsApi.sendDisconnection({tariff_id: selected.tariff_id, account_name_id: selected.account_name_id})
      toast.success("Заявление на отключение отправлено")
      setService("")
    } catch (e) {
      setErr(handleFormError(e))
    } finally {
      setSending(false)
      setConfirm(false)
    }
  }

  if (loading && !dashboard)
    return (
      <Card className="space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
      </Card>
    )
  if (error && !dashboard)
    return (
      <Card>
        <ErrorState error={error} onRetry={reload} />
      </Card>
    )

  return (
    <Card className="p-5 md:p-6">
      <ErrorBanner message={err.banner} />
      <div className="space-y-5">
        <Field
          label="Услуга для отключения"
          required
          error={firstError(err, "tariff_id") ?? firstError(err, "account_name_id")}
          hint={services.length ? undefined : "У вас нет активных услуг"}
        >
          <SelectField
            value={service}
            onChange={setService}
            options={services.map((s) => ({
              value: `${s.tariff_id}:${s.account_name_id}`,
              label: `${s.name} — ${s.tariff_name}`,
            }))}
            placeholder="Выберите услугу"
            disabled={!services.length}
          />
        </Field>
        <Button variant="destructive" className="h-10 px-5" disabled={!selected} onClick={() => setConfirm(true)}>
          <PowerOff /> Подать заявление на отключение
        </Button>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Отключить услугу?</DialogTitle>
            <DialogDescription>
              Сотрудникам уйдёт заявление на отключение услуги «{selected?.name}». Отменить его из кабинета нельзя.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)} disabled={sending}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={send} disabled={sending}>
              {sending ? "Отправка…" : "Отключить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
