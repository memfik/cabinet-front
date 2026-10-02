"use client"

import {useState} from "react"
import {Download, FileText, Loader2} from "lucide-react"
import {toast} from "sonner"
import {Page, Card, CardHeader} from "@/app/components/common/Page"
import {LottieAnimation} from "@/app/components/common/LottieAnimation"
import {Badge, type Tone} from "@/app/components/common/Badge"
import {EmptyState, ErrorState, ListSkeleton} from "@/app/components/common/States"
import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {invoicesApi, saveFile, type Invoice, type InvoiceDocumentType} from "@/lib/api/invoices"
import {errMsg} from "@/lib/api/errors"
import {useApi} from "@/lib/hooks/useApi"
import {formatDate, formatMoney} from "@/lib/format"

const typeTone: Record<InvoiceDocumentType, Tone> = {
  "account-notice": "neutral",
  invoice: "brand",
  "one-time-invoice": "warning",
  "correction-invoice": "danger",
}

/** Счета и счета-фактуры за текущий год (GET /invoices) с загрузкой PDF. */
export default function InvoicesPage() {
  const {data, error, loading, reload} = useApi(() => invoicesApi.list())
  const [downloading, setDownloading] = useState<number | null>(null)

  async function download(inv: Invoice) {
    setDownloading(inv.id)
    try {
      saveFile(await invoicesApi.downloadPdf(inv.id))
    } catch (e) {
      // ошибка blob-ответа приходит как Blob — текст бэка недоступен, поэтому общий fallback
      toast.error(errMsg(e, "Не удалось скачать документ. Попробуйте позже."))
    } finally {
      setDownloading(null)
    }
  }

  const DownloadButton = ({inv}: {inv: Invoice}) => (
    <Button variant="outline" size="sm" disabled={downloading === inv.id} onClick={() => download(inv)}>
      {downloading === inv.id ? <Loader2 className="animate-spin" /> : <Download />} PDF
    </Button>
  )

  return (
    <Page
      title="Документы"
      description="Счета и счета-фактуры с начала текущего года"
      illustration={<LottieAnimation src="/videos/documents.json" className="h-44 w-64" />}
    >
      <Card>
        <CardHeader title="Документы" />
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !data ? (
          <ListSkeleton />
        ) : !data?.length ? (
          <EmptyState
            icon={FileText}
            title="Документов пока нет"
            description="Здесь появятся счета и счета-фактуры за текущий год."
          />
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">№</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Период</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead className="pr-5 text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="pl-5 font-medium">{inv.number}</TableCell>
                      <TableCell>
                        {inv.document_type_label ? (
                          <Badge tone={inv.document_type ? typeTone[inv.document_type] : "neutral"}>
                            {inv.document_type_label}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(inv.period_start)} — {formatDate(inv.period_end)}
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap tabular-nums">
                        {formatMoney(inv.amount)}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <DownloadButton inv={inv} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="divide-border divide-y md:hidden">
              {data.map((inv) => (
                <li key={inv.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">№ {inv.number}</p>
                    <p className="text-muted-foreground text-xs">
                      {inv.document_type_label ?? "Документ"} · {formatDate(inv.period_start)} —{" "}
                      {formatDate(inv.period_end)}
                    </p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">{formatMoney(inv.amount)}</p>
                  </div>
                  <DownloadButton inv={inv} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </Page>
  )
}
