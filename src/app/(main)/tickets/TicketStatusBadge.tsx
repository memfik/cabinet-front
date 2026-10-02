import {Badge, type Tone} from "@/app/components/common/Badge"
import type {TicketStatus} from "@/lib/api"

/** Цвет по системному названию статуса; незнакомые статусы — нейтральные. */
const TONES: Record<string, Tone> = {
  new: "brand",
  in_progress: "warning",
  waiting: "warning",
  resolved: "success",
  closed: "neutral",
}

export function TicketStatusBadge({status}: {status: TicketStatus}) {
  return <Badge tone={TONES[status.name] ?? "neutral"}>{status.label ?? status.name}</Badge>
}
