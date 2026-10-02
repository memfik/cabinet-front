import {apiClient} from "./client"
import type {DateOnly, DateTime, Paginated} from "./types"

export interface TicketStatus {
  id: number
  /** Системное название. */
  name: string
  /** Название для клиента. */
  label: string | null
}

export interface Ticket {
  type: "tickets"
  id: number
  /** Для показа: `INC-205105`. */
  number: string
  subject: string
  status: TicketStatus
  created_at: DateTime | null
}

export interface TicketMessage {
  id: number
  sent_at: DateTime | null
  from_email: string | null
  from_name: string | null
  to_email: string | null
  cc_email: string | null
  subject: string | null
  /** HTML, очищенный на сервере — можно вставлять как HTML. */
  body: string
  has_attachments: boolean
  /** `true` — ответ сотрудника, `false` — сообщение клиента. */
  from_staff: boolean
}

export interface TicketDetails extends Ticket {
  description: string | null
  contact: {name: string | null; phone: string | null; email: string | null}
  branch: string | null
  symptom: string | null
  services: string[]
  additional_services: string[]
  /** IP, адрес и т.п. */
  resource: string | null
  downtime_started_at: DateTime | null
  reacted_at: DateTime | null
  /** От новых к старым. */
  messages: TicketMessage[]
}

export interface TicketListParams {
  from?: DateOnly
  to?: DateOnly
  /** Число из `INC-205105`. */
  number?: number
  page?: number
}

interface NamedOption {
  id: number
  name: string
}

export interface TicketFormOptions {
  services: NamedOption[]
  additional_services: NamedOption[]
  symptoms: NamedOption[]
  branches: NamedOption[]
}

export interface CreateTicketPayload {
  subject: string
  description: string
  /** id из `services` / `additional_services` справочника, без повторов, минимум одна. */
  services: number[]
  symptom_id: number
  branch_id: number
  contact_name: string
  contact_phone: string
  contact_email: string
  resource?: string | null
  /** Когда обнаружена проблема, не в будущем: `2026-09-30T10:15:00+05:00` или `2026-09-30 10:15`. */
  detected_at: string
  downtime_started_at?: string | null
}

export interface SendTicketMessagePayload {
  subject: string
  message: string
  /** По умолчанию — имя и фамилия пользователя. */
  sender_name?: string | null
  /** До 5 файлов по 1953 КБ: pdf, jpg, jpeg, png, gif, txt, csv, doc, docx, xls, xlsx, odt, ods, zip, rar, 7z, log. */
  attachments?: File[]
}

export const ticketsApi = {
  /** По 20 на страницу, от новых к старым. */
  list: (params?: TicketListParams) => apiClient.get<Paginated<Ticket>>("tickets", {params}).then((r) => r.data),

  /** Справочники для формы создания. */
  getFormOptions: () => apiClient.get<TicketFormOptions>("tickets/options").then((r) => r.data),

  /** `id` без префикса `INC-`. */
  get: (ticketId: number) => apiClient.get<TicketDetails>(`tickets/${ticketId}`).then((r) => r.data),

  create: (payload: CreateTicketPayload) => apiClient.post<TicketDetails>("tickets", payload).then((r) => r.data),

  /** multipart/form-data — из-за файлов. Content-Type с boundary axios проставит сам. */
  sendMessage: (ticketId: number, {attachments, sender_name, ...rest}: SendTicketMessagePayload) => {
    const form = new FormData()
    form.append("subject", rest.subject)
    form.append("message", rest.message)
    if (sender_name) form.append("sender_name", sender_name)
    attachments?.forEach((file) => form.append("attachments[]", file))
    return apiClient.post<{type: "ticket-messages"; id: number}>(`tickets/${ticketId}/messages`, form).then((r) => r.data)
  },
}
