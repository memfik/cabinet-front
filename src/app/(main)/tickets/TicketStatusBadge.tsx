import {Badge, type Tone} from "@/app/components/common/Badge"
import type {TicketStatus} from "@/lib/api"
import {useI18n, type MessageKey} from "@/i18n"

/** Цвет по системному названию статуса; незнакомые статусы — нейтральные. */
const TONES: Record<string, Tone> = {
  new: "brand",
  in_progress: "warning",
  waiting: "warning",
  resolved: "success",
  closed: "neutral",
}

/** Переводимые названия известных статусов; остальные показываем как пришли с бэка. */
const LABELS: Record<string, MessageKey> = {
  new: "tickets.statusNew",
  in_progress: "tickets.statusInProgress",
  waiting: "tickets.statusWaiting",
  resolved: "tickets.statusResolved",
  closed: "tickets.statusClosed",
}

export function TicketStatusBadge({status}: {status: TicketStatus}) {
  const {t} = useI18n()
  const key = LABELS[status.name]
  return <Badge tone={TONES[status.name] ?? "neutral"}>{key ? t(key) : (status.label ?? status.name)}</Badge>
}
