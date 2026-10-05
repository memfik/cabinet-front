"use client"

import Link from "next/link"
import {ArrowRight, Headset, Plus} from "lucide-react"
import {ticketsApi} from "@/lib/api/tickets"
import {useApi} from "@/lib/hooks/useApi"
import {formatDate} from "@/lib/format"
import {useI18n} from "@/i18n"
import {TicketStatusBadge} from "@/app/(main)/tickets/TicketStatusBadge"
import {WidgetCard} from "./WidgetCard"

/** Статусы, в которых заявка уже не в работе. */
const DONE = new Set(["resolved", "closed"])

/** Открытые заявки среди последних 20 (первая страница списка, от новых к старым). */
export function TicketsWidget() {
  const {t: tt, tn} = useI18n()
  const {data, error, loading, reload} = useApi(() => ticketsApi.list())
  const open = data?.data.filter((t) => !DONE.has(t.status.name)) ?? []
  const latest = open.slice(0, 3)

  return (
    <WidgetCard
      title={tt("tickets.widgetTitle")}
      icon={Headset}
      onReload={reload}
      loading={loading && !data}
      refreshing={loading && !!data}
      staleError={!!error && !!data}
      error={error && !data ? tt("tickets.widgetLoadError") : null}
    >
      {data && (
        <>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {open.length}
            <span className="text-muted-foreground ml-2 text-sm font-medium">
              {tn("tickets.widgetInProgress", open.length)}
            </span>
          </p>

          {latest.length > 0 ? (
            <ul className="divide-border mt-3 divide-y">
              {latest.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tickets/${t.id}`}
                    className="hover:bg-muted/50 -mx-2 block rounded-lg px-2 py-2 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{t.number}</span>
                      <TicketStatusBadge status={t.status} />
                    </div>
                    <p className="mt-1 truncate text-sm">{t.subject}</p>
                    <p className="text-muted-foreground text-xs">{formatDate(t.created_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm">{tt("tickets.widgetAllClosed")}</p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 text-sm font-medium">
            <Link
              href="/tickets"
              className="text-brand inline-flex items-center gap-1 underline-offset-4 hover:underline"
            >
              {tt("tickets.widgetAll")} <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/tickets/new"
              className="text-brand inline-flex items-center gap-1 underline-offset-4 hover:underline"
            >
              <Plus className="size-3.5" /> {tt("tickets.widgetNew")}
            </Link>
          </div>
        </>
      )}
    </WidgetCard>
  )
}
