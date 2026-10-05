"use client"

import {useState} from "react"
import Link from "next/link"
import {useParams} from "next/navigation"
import {ArrowLeft, Clock, PhoneCall, Wallet} from "lucide-react"
import {Page, Card, CardHeader} from "@/app/components/common/Page"
import {DateRange} from "@/app/components/common/DateRange"
import {EmptyState, ErrorState, ListSkeleton} from "@/app/components/common/States"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {servicesApi} from "@/lib/api/services"
import {useApi} from "@/lib/hooks/useApi"
import {useI18n} from "@/i18n"
import {daysAgoInput, formatDateTime, formatDuration, formatMoney, toDateInput} from "@/lib/format"

/** Статистика звонков по услуге телефонии (GET /services/{tariffId}/{accountNameId}/calls): период до 30 дней. */
export default function CallsPage() {
  const {t} = useI18n()
  const {tariffId, accountNameId} = useParams<{tariffId: string; accountNameId: string}>()
  const [range, setRange] = useState({from: daysAgoInput(29), to: toDateInput(new Date())})
  const {data, error, loading, reload} = useApi(
    () => servicesApi.getCalls(Number(tariffId), Number(accountNameId), range),
    [tariffId, accountNameId, range.from, range.to]
  )

  const rangeError =
    error?.status === 422 ? (error.errors.from?.[0] ?? error.errors.to?.[0] ?? error.message) : undefined

  return (
    <Page
      title={t("services.title")}
      description={t("services.description")}
      actions={
        <Link href="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="size-4" /> {t("services.backHome")}
        </Link>
      }
    >
      <Card className="mb-4 p-4">
        <DateRange {...range} onChange={setRange} error={rangeError} presets={[7, 14, 30]} />
      </Card>

      {data && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Stat icon={PhoneCall} label={t("services.paidCalls")} value={String(data.calls.length)} />
          <Stat icon={Clock} label={t("services.totalDuration")} value={formatDuration(data.total_duration_seconds)} />
          <Stat icon={Wallet} label={t("services.totalCost")} value={formatMoney(data.total_cost)} />
        </div>
      )}

      <Card>
        <CardHeader title={t("services.calls")} />
        {error && !rangeError ? (
          // 404 — услуга не из договора; остальное — общая ошибка
          <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} />
        ) : loading && !data ? (
          <ListSkeleton />
        ) : !data?.calls.length ? (
          <EmptyState icon={PhoneCall} title={t("services.emptyTitle")} description={t("services.emptyDescription")} />
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">{t("services.colDateTime")}</TableHead>
                    <TableHead>{t("services.colFrom")}</TableHead>
                    <TableHead>{t("services.colTo")}</TableHead>
                    <TableHead>{t("services.colDuration")}</TableHead>
                    <TableHead className="pr-5 text-right">{t("services.colCost")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.calls.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-5 whitespace-nowrap">{formatDateTime(c.called_at)}</TableCell>
                      <TableCell>{c.caller_number ?? "—"}</TableCell>
                      <TableCell>{c.called_number}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDuration(c.duration_seconds)}</TableCell>
                      <TableCell className="pr-5 text-right font-medium whitespace-nowrap tabular-nums">
                        {formatMoney(c.cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="divide-border divide-y md:hidden">
              {data.calls.map((c, i) => (
                <li key={i} className="px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{c.called_number}</span>
                    <span className="font-semibold tabular-nums">{formatMoney(c.cost)}</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {formatDateTime(c.called_at)} · {formatDuration(c.duration_seconds)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </Page>
  )
}

function Stat({icon: Icon, label, value}: {icon: typeof Clock; label: string; value: string}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-semibold tabular-nums">{value}</p>
      </div>
    </Card>
  )
}
