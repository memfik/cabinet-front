"use client"

import {useState} from "react"
import {Wallet} from "lucide-react"
import {Page, Card, CardHeader} from "@/app/components/common/Page"
import {LottieAnimation} from "@/app/components/common/LottieAnimation"
import {DateRange} from "@/app/components/common/DateRange"
import {EmptyState, ErrorState, ListSkeleton} from "@/app/components/common/States"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {paymentsApi} from "@/lib/api/payments"
import {useApi} from "@/lib/hooks/useApi"
import {daysAgoInput, formatDate, formatDateTime, formatMoney, toDateInput} from "@/lib/format"

/** История платежей (GET /payments): период до 90 дней, по умолчанию последние 25. */
export default function PaymentsPage() {
  const [range, setRange] = useState({from: daysAgoInput(29), to: toDateInput(new Date())})
  const {data, error, loading, reload} = useApi(() => paymentsApi.getHistory(range), [range.from, range.to])

  // 422 (период > 90 дней и т.п.) приходит с ошибкой в поле from — показываем её под фильтром
  const rangeError =
    error?.status === 422 ? (error.errors.from?.[0] ?? error.errors.to?.[0] ?? error.message) : undefined

  return (
    <Page
      title="Платежи"
      description="Зачисления на лицевой счёт. Период — не более 90 дней."
      illustration={<LottieAnimation src="/videos/payment.json" className="h-44 w-64" />}
    >
      <Card className="mb-4 p-4">
        <DateRange {...range} onChange={setRange} error={rangeError} presets={[7, 30, 90]} />
      </Card>

      <Card>
        <CardHeader
          title="Зачисления"
          actions={
            data && (
              <span className="text-sm">
                <span className="text-muted-foreground">Итого: </span>
                <span className="font-semibold tabular-nums">{formatMoney(data.total)}</span>
              </span>
            )
          }
        />
        {error && !rangeError ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !data ? (
          <ListSkeleton />
        ) : !data || !data.has_contract ? (
          <EmptyState icon={Wallet} title="Нет данных" description="У вас нет лицевого счёта, платежей нет." />
        ) : data.payments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Платежей нет"
            description={`За период ${formatDate(data.from)} — ${formatDate(data.to)}`}
          />
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {/* ≥ md — таблица */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Дата</TableHead>
                    <TableHead>Оператор</TableHead>
                    <TableHead>Комментарий</TableHead>
                    <TableHead className="pr-5 text-right">Сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payments.map((p) => (
                    <TableRow key={p.bill_id}>
                      <TableCell className="pl-5 whitespace-nowrap">{formatDateTime(p.credited_at)}</TableCell>
                      <TableCell>{p.operator ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-normal">{p.comment ?? "—"}</TableCell>
                      <TableCell className="pr-5 text-right font-medium whitespace-nowrap tabular-nums">
                        {formatMoney(p.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* < md — карточки */}
            <ul className="divide-border divide-y md:hidden">
              {data.payments.map((p) => (
                <li key={p.bill_id} className="px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold tabular-nums">{formatMoney(p.amount)}</span>
                    <span className="text-muted-foreground text-xs">{formatDateTime(p.credited_at)}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {p.operator ?? "—"}
                    {p.comment && ` · ${p.comment}`}
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
