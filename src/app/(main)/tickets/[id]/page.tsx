"use client"

import {useRef, useState} from "react"
import Link from "next/link"
import {useParams} from "next/navigation"
import {ArrowLeft, Download, Loader2, Paperclip, X, SearchX} from "lucide-react"
import {toast} from "sonner"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Page, Card, CardHeader} from "@/app/components/common/Page"
import {EmptyState, ErrorState, Skeleton} from "@/app/components/common/States"
import {Field} from "@/app/components/common/Field"
import {Badge} from "@/app/components/common/Badge"
import {errFields, errMsg, errStatus, saveFile, ticketsApi, type TicketAttachment, type TicketDetails} from "@/lib/api"
import {useApi} from "@/lib/hooks/useApi"
import {useAuthStore} from "@/lib/stores/authStore"
import {formatDateTime} from "@/lib/format"
import {cn} from "@/lib/utils"
import {tr, useI18n} from "@/i18n"
import {TicketStatusBadge} from "../TicketStatusBadge"

const MAX_FILES = 5
const MAX_SIZE = 1953 * 1024
const ALLOWED = "pdf jpg jpeg png gif txt csv doc docx xls xlsx odt ods zip rar 7z log".split(" ")

const sizeLabel = (b: number) =>
  b >= 1024 * 1024
    ? `${(b / 1024 / 1024).toFixed(1)} ${tr("tickets.sizeMb")}`
    : `${Math.ceil(b / 1024)} ${tr("tickets.sizeKb")}`

/** Вложения письма: доступные скачиваются с токеном, недоступные (слишком большие) показываются без ссылки. */
function AttachmentList({ticketId, attachments}: {ticketId: number; attachments: TicketAttachment[]}) {
  const {t} = useI18n()
  const [downloading, setDownloading] = useState<number | null>(null)

  async function download(a: TicketAttachment) {
    setDownloading(a.id)
    try {
      saveFile(await ticketsApi.downloadAttachment(ticketId, a))
    } catch (e) {
      toast.error(errMsg(e, t("tickets.downloadFailed")))
    } finally {
      setDownloading(null)
    }
  }

  return (
    <ul className="mt-2.5 flex flex-wrap gap-2">
      {attachments.map((a) => (
        <li key={a.id} className="max-w-full">
          {a.is_available ? (
            <button
              type="button"
              onClick={() => download(a)}
              disabled={downloading === a.id}
              className="border-border bg-background hover:bg-muted flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors disabled:opacity-60"
            >
              {downloading === a.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
              <span className="truncate">{a.name}</span>
              {a.size_kb != null && (
                <span className="text-muted-foreground shrink-0">{sizeLabel(a.size_kb * 1024)}</span>
              )}
            </button>
          ) : (
            <span
              title={t("tickets.fileTooLarge")}
              className="border-border text-muted-foreground flex max-w-full items-center gap-1.5 rounded-lg border border-dashed px-2.5 py-1.5 text-xs"
            >
              <Paperclip className="size-3.5" />
              <span className="truncate">{a.name}</span>
              <span className="shrink-0">· {t("tickets.notSaved")}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

/** Заявка: реквизиты, описание, переписка и форма ответа. */
export default function TicketPage() {
  const {t} = useI18n()
  const {id} = useParams<{id: string}>()
  const {data: ticket, error, reload} = useApi(() => ticketsApi.get(Number(id)), [id])

  if (error && !ticket) {
    return (
      <Page title={t("tickets.ticketTitle")}>
        <Card>
          {error.status === 404 ? (
            <EmptyState
              icon={SearchX}
              title={t("tickets.notFound")}
              description={error.message}
              action={
                <Button variant="outline" render={<Link href="/tickets" />} nativeButton={false}>
                  {t("tickets.toTicketList")}
                </Button>
              }
            />
          ) : (
            <ErrorState error={error} onRetry={reload} />
          )}
        </Card>
      </Page>
    )
  }

  if (!ticket) {
    return (
      <Page title={t("tickets.ticketTitle")}>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
      </Page>
    )
  }

  return (
    <Page
      title={`${ticket.number}`}
      description={ticket.subject}
      actions={
        <>
          <TicketStatusBadge status={ticket.status} />
          <Button variant="ghost" render={<Link href="/tickets" />} nativeButton={false}>
            <ArrowLeft /> {t("tickets.toList")}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          {ticket.description && (
            <Card>
              <CardHeader title={t("tickets.sectionDescription")} />
              <p className="px-5 py-4 text-sm whitespace-pre-wrap">{ticket.description}</p>
            </Card>
          )}

          <ReplyForm ticket={ticket} onSent={reload} />

          <Card>
            <CardHeader title={t("tickets.conversation", {n: ticket.messages.length})} />
            {ticket.messages.length === 0 ? (
              <EmptyState title={t("tickets.noMessages")} description={t("tickets.replyWillAppear")} />
            ) : (
              <ul className="flex flex-col gap-3 p-4">
                {ticket.messages.map((m) => (
                  <li key={m.id} className={cn("flex", m.from_staff ? "justify-start" : "justify-end")}>
                    <div
                      className={cn(
                        "max-w-[92%] rounded-2xl px-4 py-3 md:max-w-[85%]",
                        m.from_staff ? "bg-muted rounded-tl-sm" : "bg-brand/10 rounded-tr-sm"
                      )}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        <span className="font-semibold">{m.from_name ?? m.from_email ?? "—"}</span>
                        <Badge tone={m.from_staff ? "neutral" : "brand"} className="px-2 py-0 text-[11px]">
                          {m.from_staff ? t("tickets.support") : t("tickets.you")}
                        </Badge>
                        <span className="text-muted-foreground">{formatDateTime(m.sent_at)}</span>
                        {m.has_attachments && (
                          <Paperclip
                            className="text-muted-foreground size-3.5"
                            aria-label={t("tickets.hasAttachments")}
                          />
                        )}
                      </div>
                      {/* body уже очищен на сервере — безопасно вставлять как HTML */}
                      <div
                        className="[&_a]:text-brand text-sm break-words [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{__html: m.body}}
                      />
                      {m.attachments.length > 0 && <AttachmentList ticketId={ticket.id} attachments={m.attachments} />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Details ticket={ticket} />
      </div>
    </Page>
  )
}

/** Реквизиты заявки. */
function Details({ticket}: {ticket: TicketDetails}) {
  const {t} = useI18n()
  const rows: [string, React.ReactNode][] = [
    [t("tickets.detCreated"), formatDateTime(ticket.created_at)],
    [
      t("tickets.detContact"),
      [ticket.contact.name, ticket.contact.phone, ticket.contact.email].filter(Boolean).join(", ") || "—",
    ],
    [t("tickets.detBranch"), ticket.branch ?? "—"],
    [t("tickets.detSymptom"), ticket.symptom ?? "—"],
    [t("tickets.detServices"), [...ticket.services, ...ticket.additional_services].join(", ") || "—"],
    [t("tickets.detResource"), ticket.resource ?? "—"],
    [t("tickets.detDetected"), formatDateTime(ticket.reacted_at)],
    [t("tickets.detDowntime"), formatDateTime(ticket.downtime_started_at)],
  ]
  return (
    <Card className="h-fit">
      <CardHeader title={t("tickets.sectionDetails")} />
      <dl className="divide-border divide-y text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="px-5 py-3">
            <dt className="text-muted-foreground text-xs">{k}</dt>
            <dd className="mt-0.5 break-words">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

/** Ответ в заявку: multipart с вложениями (до 5 файлов по 1953 КБ). */
function ReplyForm({ticket, onSent}: {ticket: TicketDetails; onSent: () => void}) {
  const {t} = useI18n()
  const user = useAuthStore((s) => s.user)
  const fileRef = useRef<HTMLInputElement>(null)
  const [subjectEdit, setSubjectEdit] = useState<string | null>(null)
  const subject = subjectEdit ?? `Re: ${ticket.subject}`
  const [message, setMessage] = useState("")
  const [senderName, setSenderName] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [sending, setSending] = useState(false)

  const err = (k: string) => errors[k]?.[0]
  const fileError = Object.entries(errors).find(([k]) => k.startsWith("attachments"))?.[1][0]
  const defaultName = [user?.first_name, user?.last_name].filter(Boolean).join(" ")

  function addFiles(list: FileList | null) {
    if (!list) return
    const problems: string[] = []
    const next = [...files]
    for (const f of Array.from(list)) {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? ""
      if (!ALLOWED.includes(ext)) problems.push(t("tickets.fileTypeUnsupported", {name: f.name}))
      else if (f.size > MAX_SIZE) problems.push(t("tickets.fileOverSize", {name: f.name}))
      else if (next.length >= MAX_FILES) problems.push(t("tickets.maxFiles", {max: MAX_FILES}))
      else next.push(f)
    }
    setFiles(next)
    setErrors(problems.length ? {attachments: [problems[0]]} : {})
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setErrors({})
    try {
      await ticketsApi.sendMessage(ticket.id, {
        subject,
        message,
        sender_name: senderName || null,
        attachments: files,
      })
      toast.success(t("tickets.sent"))
      setMessage("")
      setFiles([])
      onSent()
    } catch (e) {
      const fields = errFields(e)
      if (errStatus(e) === 422 && Object.keys(fields).length) setErrors(fields)
      else toast.error(errMsg(e, t("tickets.sendFailed")))
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader title={t("tickets.replyTitle")} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("tickets.fieldSubject")} required error={err("subject")}>
            <Input
              value={subject}
              maxLength={255}
              onChange={(e) => setSubjectEdit(e.target.value)}
              aria-invalid={!!err("subject")}
            />
          </Field>
          <Field label={t("tickets.fieldYourName")} error={err("sender_name")} hint={t("tickets.optional")}>
            <Input
              value={senderName}
              maxLength={255}
              placeholder={defaultName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </Field>
        </div>

        <Field label={t("tickets.fieldMessage")} required error={err("message")}>
          <Textarea
            rows={4}
            value={message}
            maxLength={20000}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={!!err("message")}
          />
        </Field>

        <Field error={fileError} hint={t("tickets.filesHint", {max: MAX_FILES, types: ALLOWED.join(", ")})}>
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            accept={ALLOWED.map((x) => `.${x}`).join(",")}
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={files.length >= MAX_FILES}
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip /> {t("tickets.attachFiles")}
            </Button>
            {files.map((f, i) => (
              <span
                key={`${f.name}-${i}`}
                className="bg-muted flex max-w-full items-center gap-1.5 rounded-lg py-1 pr-1 pl-2.5 text-xs"
              >
                <span className="truncate">{f.name}</span>
                <span className="text-muted-foreground shrink-0">{sizeLabel(f.size)}</span>
                <button
                  type="button"
                  onClick={() => setFiles((all) => all.filter((_, j) => j !== i))}
                  className="hover:bg-background rounded p-0.5"
                  aria-label={t("tickets.removeFile", {name: f.name})}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        </Field>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={sending || !message.trim()}
            className="bg-brand hover:bg-brand/90 h-10 px-5 text-white"
          >
            {sending ? t("tickets.sending") : t("tickets.send")}
          </Button>
        </div>
      </form>
    </Card>
  )
}
