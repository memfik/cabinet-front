"use client"

import {useState} from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {Plus, Search} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Page, Card} from "@/app/components/common/Page"
import {EmptyState, ErrorState, ListSkeleton} from "@/app/components/common/States"
import {Field} from "@/app/components/common/Field"
import {DateRange} from "@/app/components/common/DateRange"
import {Pagination} from "@/app/components/common/Pagination"
import {ticketsApi} from "@/lib/api"
import {useApi} from "@/lib/hooks/useApi"
import {formatDateTime} from "@/lib/format"
import {TicketStatusBadge} from "./TicketStatusBadge"

/** Список заявок договора: фильтры по номеру и периоду, страницы по 20. */
export default function TicketsPage() {
  const router = useRouter()
  const [number, setNumber] = useState("")
  const [range, setRange] = useState({from: "", to: ""})
  const [page, setPage] = useState(1)

  const {data, error, loading, reload} = useApi(
    () =>
      ticketsApi.list({
        number: number ? Number(number) : undefined,
        from: range.from || undefined,
        to: range.to || undefined,
        page,
      }),
    [number, range.from, range.to, page]
  )

  const tickets = data?.data ?? []
  const filtered = !!(number || range.from || range.to)

  return (
    <Page
      title="Заявки"
      description="Обращения по проблемам с услугами"
      actions={
        <Button
          render={<Link href="/tickets/new" />}
          nativeButton={false}
          className="bg-brand hover:bg-brand/90 h-11 w-full px-3.5 text-white sm:h-9 sm:w-auto"
        >
          <Plus /> Новая заявка
        </Button>
      }
    >
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-start gap-3">
          <Field label="Номер заявки" className="w-full sm:w-auto">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                inputMode="numeric"
                placeholder="205105"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value.replace(/\D/g, ""))
                  setPage(1)
                }}
                className="h-11 w-full pl-8 sm:w-44"
              />
            </div>
          </Field>
          <DateRange
            from={range.from}
            to={range.to}
            onChange={(r) => {
              setRange(r)
              setPage(1)
            }}
          />
          {filtered && (
            <Button
              variant="ghost"
              className="h-11 w-full sm:mt-[26px] sm:w-auto"
              onClick={() => {
                setNumber("")
                setRange({from: "", to: ""})
                setPage(1)
              }}
            >
              Сбросить
            </Button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {error && !data ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data && loading ? (
          <ListSkeleton rows={6} />
        ) : tickets.length === 0 ? (
          <EmptyState
            title={filtered ? "Ничего не найдено" : "Заявок пока нет"}
            description={
              filtered ? "Измените фильтры или сбросьте их." : "Создайте заявку, если возникла проблема с услугой."
            }
            action={
              !filtered && (
                <Button render={<Link href="/tickets/new" />} nativeButton={false} variant="outline">
                  <Plus /> Новая заявка
                </Button>
              )
            }
          />
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {/* Десктоп — таблица */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Номер</TableHead>
                    <TableHead>Тема</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="pr-5 text-right">Создана</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id} className="cursor-pointer" onClick={() => router.push(`/tickets/${t.id}`)}>
                      <TableCell className="pl-5 font-medium">
                        <Link
                          href={`/tickets/${t.id}`}
                          className="text-brand hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.number}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[420px] truncate">{t.subject}</TableCell>
                      <TableCell>
                        <TicketStatusBadge status={t.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground pr-5 text-right whitespace-nowrap">
                        {formatDateTime(t.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Мобильный — карточки */}
            <ul className="divide-border divide-y md:hidden">
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link href={`/tickets/${t.id}`} className="hover:bg-muted/40 flex flex-col gap-1.5 px-5 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-brand text-sm font-semibold">{t.number}</span>
                      <TicketStatusBadge status={t.status} />
                    </div>
                    <p className="text-sm">{t.subject}</p>
                    <p className="text-muted-foreground text-xs">{formatDateTime(t.created_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {data && <Pagination meta={data.meta} onPage={setPage} />}
      </Card>
    </Page>
  )
}
