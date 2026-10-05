/**
 * Мок бэка для вёрстки: включается NEXT_PUBLIC_API_MOCK=true и подменяет адаптер axios,
 * поэтому сеть не нужна, а весь код (интерсепторы, типы, разбор ошибок) работает как обычно.
 * Данные живут в памяти — обновление страницы сбрасывает изменения.
 *
 * Чтобы увидеть ошибки: логин/пароль `wrong` → 401; период платежей > 90 дней → 422;
 * почта `fail@…` в заявлении на документ → 503; удаление субпользователя с id 3 → 409.
 */
import {AxiosError, type AxiosResponse, type InternalAxiosRequestConfig} from "axios"
import type {User} from "./auth"
import type {Dashboard} from "./dashboard"
import type {Invoice} from "./invoices"
import type {CallStatistics} from "./services"
import type {OneWebUsage} from "./oneweb"
import type {Ticket, TicketDetails, TicketFormOptions} from "./tickets"
import type {PaymentHistory} from "./payments"
import type {RequestFormOptions} from "./requests"
import type {Paginated} from "./types"

const DELAY_MS = 350
const TZ = "+05:00"

// ---------- утилиты дат ----------
const pad = (n: number) => String(n).padStart(2, "0")
const dateOnly = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const daysAgo = (n: number, h = 12, m = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${dateOnly(d)}T${pad(h)}:${pad(m)}:00${TZ}`
}
const dayDiff = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000

// ---------- данные ----------
const me: User = {
  type: "users",
  id: 1,
  parent_id: null,
  username: "ivanov@example.kz",
  email: "ivanov@example.kz",
  dogid: "004211",
  first_name: "Алексей",
  last_name: "Иванов",
  position: "Директор",
  phone: "+7 701 123 45 67",
  timezone: "Asia/Almaty",
  is_user_manager: true,
  is_registration_complete: true,
  roles: ["login"],
  permissions: {update: true, delete: false},
}

const dashboard: Dashboard = {
  type: "dashboards",
  has_contract: true,
  account_number: "004211",
  contract_id: 88214,
  contract_code: "ДГ-2023/1187",
  client_name: "ТОО «Альфа Телеком Сервис»",
  is_company: true,
  account_manager: "Сергеева Динара",
  balance: "944580.75",
  services: [
    {
      tariff_id: 101,
      account_name_id: 5001,
      name: "Телефония, номер 8 (727) 111-22-33",
      tariff_name: "Бизнес-линия",
      category: "telephony",
      has_statistics: true,
    },
    {
      tariff_id: 101,
      account_name_id: 5002,
      name: "Телефония, номер 8 (727) 111-22-34",
      tariff_name: "Бизнес-линия",
      category: "telephony",
      has_statistics: true,
    },
    {
      tariff_id: 202,
      account_name_id: 5003,
      name: "Интернет, безлимит 100 Мбит/с",
      tariff_name: "Корпоративный 100",
      category: "internet",
      has_statistics: false,
    },
    {
      tariff_id: 303,
      account_name_id: 5004,
      name: "Виртуальная АТС",
      tariff_name: "vPBX Стандарт",
      category: "other",
      has_statistics: false,
    },
  ],
}

const payments = [
  [1, "500000.00", "Касса №2", "Оплата по счёту 1187"],
  [3, "120000.00", "Kaspi Pay", null],
  [6, "75500.50", "Halyk Bank", "Пополнение баланса"],
  [9, "300000.00", "Касса №1", null],
  [13, "45080.25", "Kaspi Pay", "За интернет"],
  [17, "210000.00", "Halyk Bank", "Оплата по счёту 1152"],
  [22, "18000.00", "Kaspi Pay", null],
  [24, "60000.00", "Касса №2", "Аванс"],
].map(([d, amount, operator, comment], i) => ({
  bill_id: 7000 + i,
  credited_at: daysAgo(d as number, 9 + i, 15),
  amount: amount as string,
  operator: operator as string,
  comment: comment as string | null,
}))

const invoiceTypes = [
  ["account-notice", "Счёт-извещение"],
  ["invoice", "Счёт-фактура"],
  ["one-time-invoice", "Разовая счёт-фактура"],
  ["correction-invoice", "Корректировочная счёт-фактура"],
] as const

const invoices: Invoice[] = Array.from({length: 14}, (_, i) => {
  const [document_type, document_type_label] = invoiceTypes[i % 4]
  const start = new Date(new Date().getFullYear(), Math.max(0, new Date().getMonth() - Math.floor(i / 2)), 1)
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
  return {
    type: "invoices",
    id: 9000 + i,
    number: String(1187 - i * 3),
    document_type,
    document_type_label,
    period_start: dateOnly(start),
    period_end: dateOnly(end),
    amount: (150000 + i * 23456.78).toFixed(2),
  }
})

const statuses = [
  {id: 1, name: "new", label: "Новая"},
  {id: 2, name: "in_progress", label: "В работе"},
  {id: 3, name: "waiting", label: "Ожидает ответа клиента"},
  {id: 4, name: "resolved", label: "Решена"},
  {id: 5, name: "closed", label: "Закрыта"},
]
const subjects = [
  "Нет доступа в интернет",
  "Плохое качество связи",
  "Не проходят входящие звонки",
  "Низкая скорость",
  "Обрыв канала",
  "Не работает Wi-Fi",
]

const tickets: Ticket[] = Array.from({length: 45}, (_, i) => ({
  type: "tickets",
  id: 205100 + (45 - i),
  number: `INC-${205100 + (45 - i)}`,
  subject: subjects[i % subjects.length],
  status: statuses[i % statuses.length],
  created_at: daysAgo(i * 2, 10, 30),
}))

const staffMsg = (id: number, body: string, at: string) => ({
  id,
  sent_at: at,
  from_email: "support@example.kz",
  from_name: "Служба поддержки",
  to_email: me.email,
  cc_email: null,
  subject: "Re: заявка",
  body,
  has_attachments: false,
  attachments: [],
  from_staff: true,
})

const ticketMessages = new Map<number, TicketDetails["messages"]>()

const mockAttachments = (form: FormData | null) => {
  const files = (form?.getAll("attachments[]") ?? []).filter((f): f is File => f instanceof File)
  return {has_attachments: files.length > 0, attachments: files.map((f, i) => ({id: Date.now() + i, name: f.name, size_kb: Math.round(f.size / 102.4) / 10, is_available: true}))}
}

function ticketDetails(t: Ticket): TicketDetails {
  if (!ticketMessages.has(t.id)) {
    ticketMessages.set(t.id, [
      staffMsg(t.id * 10 + 2, "<p>Добрый день! Проблема передана инженеру, ожидайте.</p>", daysAgo(1, 14, 5)),
      {
        ...staffMsg(t.id * 10 + 1, `<p>${t.subject}. Прошу разобраться.</p>`, daysAgo(2, 10, 40)),
        from_email: me.email,
        from_name: "Алексей Иванов",
        to_email: "support@example.kz",
        from_staff: false,
        has_attachments: true,
        attachments: [
          {id: t.id * 10 + 1, name: "screenshot.png", size_kb: 214.5, is_available: true},
          {id: t.id * 10 + 2, name: "dump-large.zip", size_kb: null, is_available: false},
        ],
      },
    ])
  }
  return {
    ...t,
    description: `${t.subject}. Проблема наблюдается с утра, перезагрузка оборудования не помогла.`,
    contact: {name: "Алексей Иванов", phone: "+7 701 123 45 67", email: me.email},
    branch: "Алматы",
    symptom: "Нет связи",
    services: ["Интернет"],
    additional_services: ["Виртуальная АТС"],
    resource: "10.20.30.40",
    downtime_started_at: daysAgo(2, 8, 0),
    reacted_at: daysAgo(2, 9, 30),
    messages: ticketMessages.get(t.id)!,
  }
}

const ticketOptions: TicketFormOptions = {
  services: [
    {id: 1, name: "Интернет"},
    {id: 2, name: "Телефония"},
    {id: 3, name: "Виртуальная АТС"},
  ],
  additional_services: [
    {id: 11, name: "Статический IP"},
    {id: 12, name: "Wi-Fi"},
  ],
  symptoms: [
    {id: 1, name: "Нет связи"},
    {id: 2, name: "Низкая скорость"},
    {id: 3, name: "Плохое качество"},
  ],
  branches: [
    {id: 1, name: "Алматы"},
    {id: 2, name: "Астана"},
    {id: 3, name: "Шымкент"},
  ],
}

const opt = (value: string, label: string) => ({value, label})
const requestOptions: RequestFormOptions = {
  document_types: [opt("detalization", "Детализация по трафику Интернет"), opt("invoice", "Счёт на оплату")],
  service_availability_changes: [opt("suspend", "Временное отключение"), opt("resume", "Возобновление")],
  phone_options: [
    {...opt("long-distance", "Междугородняя связь «8»"), is_paid_call: true},
    {...opt("international", "Международная связь «810»"), is_paid_call: true},
    {...opt("directory", "Справочная служба «169»"), is_paid_call: false},
    {...opt("hotline", "Горячая линия"), is_paid_call: false},
    {...opt("international-pin", "Международная связь через ПИН-код"), is_paid_call: false},
    {...opt("forward-on-busy", "Переадресация при занятости"), is_paid_call: false},
    {...opt("caller-id", "АОН"), is_paid_call: false},
    {...opt("caller-id-restriction", "Анти-АОН"), is_paid_call: false},
    {...opt("unconditional-forward", "Безусловная переадресация"), is_paid_call: false},
    {...opt("call-waiting", "Уведомление о поступлении вызова"), is_paid_call: false},
  ],
  phone_option_changes: [opt("open", "Открыть"), opt("close", "Закрыть")],
  wifi_setups: [opt("initial", "Первичная"), opt("repeat", "Повторная")],
  unlimited_speeds: ["128-kbps", "256-kbps", "512-kbps", "1-mbps", "2-mbps", "4-mbps", "8-mbps", "10-mbps"]
    .map((v) => opt(v, v.replace("-", " ")))
    .concat(opt("other", "Другое")),
  prepaid_speeds: [
    opt("128-kbps-100-mb", "128 kbps 100 Mb"),
    opt("1-mbps-1-gb", "1 mbps 1 Gb"),
    opt("8-mbps-100-gb", "8 mbps 100 Gb"),
    opt("other", "Другое"),
  ],
}

let subUsers: User[] = [
  {...me, id: 2, parent_id: 1, username: "petrov@example.kz", email: "petrov@example.kz", first_name: "Пётр", last_name: "Петров", position: "Бухгалтер", is_user_manager: false, permissions: {update: true, delete: true}},
  {...me, id: 3, parent_id: 1, username: "sidorova@example.kz", email: "sidorova@example.kz", first_name: "Анна", last_name: "Сидорова", position: "Офис-менеджер", is_user_manager: true, permissions: {update: true, delete: true}},
]
let nextSubUserId = 10

// ---------- роутер ----------
type Body = Record<string, unknown>
interface Ctx {
  params: Record<string, string>
  query: Record<string, string | undefined>
  body: Body
  form: FormData | null
}
class HttpError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    public headers: Record<string, string> = {}
  ) {
    super(String((data as {message?: string})?.message ?? status))
  }
}
const fail = (status: number, message: string, errors?: Record<string, string[]>) => {
  throw new HttpError(status, errors ? {message, errors} : {message})
}

type Handler = (c: Ctx) => unknown
const routes: {method: string; re: RegExp; keys: string[]; handler: Handler; status?: number}[] = []
function route(method: string, path: string, handler: Handler, status = 200) {
  const keys: string[] = []
  const re = new RegExp("^" + path.replace(/\{(\w+)\}/g, (_, k) => (keys.push(k), "([^/]+)")) + "$")
  routes.push({method, re, keys, handler, status})
}

route("POST", "auth/login", ({body}) => {
  if (body.login === "wrong" || body.password === "wrong") fail(401, "Неправильный логин или пароль.")
  const expires = new Date(Date.now() + 14 * 86_400_000)
  return {
    type: "auth-tokens",
    token: "1|mock-token",
    token_type: "Bearer",
    expires_at: `${dateOnly(expires)}T12:00:00${TZ}`,
    user: me,
  }
})
route("POST", "auth/logout", () => null, 204)
route("POST", "auth/forgot-password", () => null, 204)
route("POST", "auth/reset-password", ({body}) => {
  if (body.password !== body.password_confirmation)
    fail(422, "Пароли не совпадают.", {password: ["Пароли не совпадают."]})
  return null
}, 204)
route("PUT", "auth/password", ({body}) => {
  if (body.current_password === "wrong")
    fail(422, "Текущий пароль указан неверно.", {current_password: ["Текущий пароль указан неверно."]})
  return null
}, 204)
route("GET", "me", () => me)
route("GET", "dashboard", () => dashboard)

route("GET", "payments", ({query}) => {
  const to = query.to ?? dateOnly(new Date())
  const from = query.from ?? dateOnly(new Date(Date.now() - 25 * 86_400_000))
  if (dayDiff(from, to) > 90) fail(422, "Период не может быть длиннее 90 дней.", {from: ["Период не может быть длиннее 90 дней."]})
  const list = payments.filter((p) => p.credited_at.slice(0, 10) >= from && p.credited_at.slice(0, 10) <= to)
  const total = list.reduce((s, p) => s + Number(p.amount), 0).toFixed(2)
  return {type: "payment-histories", has_contract: true, from, to, total, payments: list} satisfies PaymentHistory
})

route("GET", "invoices", () => invoices)
route("GET", "invoices/{billId}/pdf", ({params}) => {
  if (!invoices.some((i) => String(i.id) === params.billId)) fail(404, "Документ не найден в вашем договоре.")
  const pdf = "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF"
  return new Blob([pdf], {type: "application/pdf"})
})

route("GET", "services/{tariffId}/{accountNameId}/calls", ({params, query}) => {
  const svc = dashboard.services.find((s) => String(s.tariff_id) === params.tariffId && String(s.account_name_id) === params.accountNameId)
  if (!svc?.has_statistics) fail(404, "Услуга не найдена в вашем договоре.")
  const to = query.to ?? dateOnly(new Date())
  const from = query.from ?? dateOnly(new Date(Date.now() - 25 * 86_400_000))
  if (dayDiff(from, to) > 30) fail(422, "Период не может быть длиннее 30 дней.", {from: ["Период не может быть длиннее 30 дней."]})
  const calls = Array.from({length: 12}, (_, i) => ({
    called_at: daysAgo(24 - i * 2, 9 + (i % 8), (i * 7) % 60),
    caller_number: "87271112233",
    called_number: i % 3 ? `8701${1000000 + i * 12345}` : `8727${2000000 + i * 4321}`,
    duration_seconds: 30 + i * 47,
    cost: (12.5 + i * 8.4).toFixed(2),
  })).filter((c) => c.called_at.slice(0, 10) >= from && c.called_at.slice(0, 10) <= to)
  return {
    type: "call-statistics",
    from,
    to,
    total_duration_seconds: calls.reduce((s, c) => s + c.duration_seconds, 0),
    total_cost: calls.reduce((s, c) => s + Number(c.cost), 0).toFixed(2),
    calls,
  } satisfies CallStatistics
})

route("GET", "oneweb/products", () => ({type: "oneweb-products", products: [{product_id: "SC-000123"}, {product_id: "SC-000456"}]}))
route("GET", "oneweb/products/{productId}/usage", ({params, query}) => {
  if (!["SC-000123", "SC-000456"].includes(params.productId)) fail(404, "Услуга не найдена в вашем договоре.")
  const unlimited = params.productId === "SC-000456"
  return {
    type: "oneweb-usage",
    product_id: params.productId,
    month: query.month ?? null,
    tariff_name: unlimited ? "OneWeb Unlimited" : "OneWeb 500 GB",
    is_unlimited: unlimited,
    used: unlimited ? "842.7" : "187.6",
    used_units: "GB",
    packages: unlimited
      ? []
      : [
          {type: "main", type_label: "Основной пакет", size: "500", remaining: "312.4", units: "GB", starts_at: daysAgo(12), ends_at: daysAgo(-18)},
          {type: "overage", type_label: "Дополнительный пакет", size: "100", remaining: "100", units: "GB", starts_at: daysAgo(5), ends_at: daysAgo(-25)},
        ],
  } satisfies OneWebUsage
})

route("GET", "tickets/options", () => ticketOptions)
route("GET", "tickets", ({query}) => {
  let list = tickets
  if (query.number) list = list.filter((t) => t.id === 205100 + Number(query.number) || String(t.id).includes(query.number!))
  if (query.from) list = list.filter((t) => (t.created_at ?? "").slice(0, 10) >= query.from!)
  if (query.to) list = list.filter((t) => (t.created_at ?? "").slice(0, 10) <= query.to!)
  const per = 20
  const page = Math.max(1, Number(query.page) || 1)
  const last = Math.max(1, Math.ceil(list.length / per))
  const url = (p: number) => `/api/tickets?page=${p}`
  return {
    data: list.slice((page - 1) * per, page * per),
    links: {first: url(1), last: url(last), prev: page > 1 ? url(page - 1) : null, next: page < last ? url(page + 1) : null},
    meta: {
      current_page: page,
      from: list.length ? (page - 1) * per + 1 : null,
      last_page: last,
      path: "/api/tickets",
      per_page: per,
      to: list.length ? Math.min(page * per, list.length) : null,
      total: list.length,
      links: Array.from({length: last}, (_, i) => ({url: url(i + 1), label: String(i + 1), active: i + 1 === page})),
    },
  } satisfies Paginated<Ticket>
})
route("POST", "tickets", ({body}) => {
  const errors: Record<string, string[]> = {}
  for (const f of ["subject", "description", "contact_name", "contact_phone", "contact_email", "detected_at"])
    if (!body[f]) errors[f] = ["Поле обязательно для заполнения."]
  if (!Array.isArray(body.services) || !body.services.length) errors.services = ["Выберите хотя бы одну услугу."]
  if (Object.keys(errors).length) fail(422, Object.values(errors)[0][0], errors)
  const id = 205100 + tickets.length + 1
  const t: Ticket = {type: "tickets", id, number: `INC-${id}`, subject: String(body.subject), status: statuses[0], created_at: daysAgo(0, new Date().getHours(), new Date().getMinutes())}
  tickets.unshift(t)
  return ticketDetails(t)
}, 201)
route("GET", "tickets/{ticketId}", ({params}) => {
  const t = tickets.find((x) => String(x.id) === params.ticketId)
  return t ? ticketDetails(t) : fail(404, "Заявка не найдена.")
})
route("POST", "tickets/{ticketId}/messages", ({params, form}) => {
  const t = tickets.find((x) => String(x.id) === params.ticketId)
  if (!t) fail(404, "Заявка не найдена.")
  const message = String(form?.get("message") ?? "")
  const subject = String(form?.get("subject") ?? "")
  if (!message || !subject) fail(422, "Поле обязательно.", {...(subject ? {} : {subject: ["Поле тема обязательно."]}), ...(message ? {} : {message: ["Поле сообщение обязательно."]})})
  const msgs = ticketDetails(t!).messages
  const id = Date.now()
  msgs.unshift({...staffMsg(id, `<p>${message.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`, daysAgo(0, new Date().getHours(), new Date().getMinutes())), subject, from_email: me.email, from_name: "Алексей Иванов", from_staff: false, ...mockAttachments(form)})
  return {type: "ticket-messages", id}
}, 201)

route("GET", "tickets/{ticketId}/attachments/{attachmentId}", ({params}) => {
  const found = ticketMessages.get(Number(params.ticketId))?.flatMap((x) => x.attachments).find((a) => String(a.id) === params.attachmentId)
  if (!found?.is_available) fail(404, "Файл не найден.")
  return new Blob([`mock: ${found!.name}`], {type: "application/octet-stream"})
})

route("GET", "requests/options", () => requestOptions)
route("POST", "requests/document", ({body}) => {
  if (String(body.email).startsWith("fail@")) fail(503, "Не удалось отправить заявление, попробуйте позже.")
  return null
}, 204)
route("POST", "requests/service-settings", ({body}) => {
  const errors: Record<string, string[]> = {}
  if (!body.addresses) errors.addresses = ["Поле адреса подключения обязательно."]
  if (!body.contact) errors.contact = ["Поле контактное лицо обязательно."]
  if (Object.keys(errors).length) fail(422, Object.values(errors)[0][0], errors)
  return null
}, 204)
route("POST", "requests/disconnection", ({body}) => {
  if (!dashboard.services.some((s) => s.tariff_id === body.tariff_id && s.account_name_id === body.account_name_id)) fail(404, "Услуга не найдена в вашем договоре.")
  return null
}, 204)

route("GET", "sub-users", () => subUsers)
route("POST", "sub-users", ({body}) => {
  if (!body.email) fail(422, "Поле email адрес обязательно.", {email: ["Поле email адрес обязательно."]})
  if (subUsers.some((u) => u.email === body.email)) fail(422, "Такой email уже занят.", {email: ["Такой email уже занят."]})
  const u: User = {...me, id: nextSubUserId++, parent_id: 1, username: String(body.email), email: String(body.email), first_name: (body.first_name as string) ?? null, last_name: (body.last_name as string) ?? null, position: (body.position as string) ?? null, is_user_manager: !!body.is_user_manager, permissions: {update: true, delete: true}}
  subUsers.push(u)
  return u
}, 201)
const findSub = (id: string) => subUsers.find((u) => String(u.id) === id) ?? fail(404, "Пользователь не найден.")
route("GET", "sub-users/{id}", ({params}) => findSub(params.id))
const updateSub: Handler = ({params, body}) => {
  const u = findSub(params.id)
  Object.assign(u, {email: body.email, username: body.email, first_name: body.first_name ?? null, last_name: body.last_name ?? null, position: body.position ?? null, is_user_manager: !!body.is_user_manager})
  return u
}
route("PUT", "sub-users/{id}", updateSub)
route("PATCH", "sub-users/{id}", updateSub)
route("DELETE", "sub-users/{id}", ({params}) => {
  findSub(params.id)
  if (params.id === "3") fail(409, "Пользователя нельзя удалить: на него ссылаются заявки или заказы.")
  subUsers = subUsers.filter((u) => String(u.id) !== params.id)
  return null
}, 204)

// ---------- адаптер ----------
export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await new Promise((r) => setTimeout(r, DELAY_MS))

  const method = (config.method ?? "get").toUpperCase()
  const path = (config.url ?? "").replace(/^\/+/, "").split("?")[0]
  const found = routes.find((r) => r.method === method && r.re.test(path))

  const respond = (status: number, data: unknown, headers: Record<string, string> = {}) =>
    ({data, status, statusText: String(status), headers, config}) as AxiosResponse

  try {
    if (!found) fail(404, "Маршрут не найден (мок).")
    // все маршруты кроме входа/сброса требуют токен — так же, как настоящий бэк
    const open = ["auth/login", "auth/forgot-password", "auth/reset-password"]
    const token = (config.headers as {Authorization?: string}).Authorization
    if (!open.includes(path) && !token) fail(401, "Требуется авторизация.")

    const match = found!.re.exec(path)!
    const params = Object.fromEntries(found!.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]))
    const isForm = typeof FormData !== "undefined" && config.data instanceof FormData
    const body: Body = !isForm && typeof config.data === "string" ? JSON.parse(config.data) : {}
    const data = found!.handler({
      params,
      query: (config.params ?? {}) as Ctx["query"],
      body,
      form: isForm ? (config.data as FormData) : null,
    })
    return respond(found!.status ?? 200, data ?? "")
  } catch (e) {
    if (!(e instanceof HttpError)) throw e
    throw new AxiosError(e.message, String(e.status), config, null, respond(e.status, e.data, e.headers))
  }
}
