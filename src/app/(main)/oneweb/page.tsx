"use client"

import {useState} from "react"
import {Infinity as InfinityIcon, Satellite} from "lucide-react"
import {Page, Card, CardHeader} from "@/app/components/common/Page"
import {LottieAnimation} from "@/app/components/common/LottieAnimation"
import {Badge} from "@/app/components/common/Badge"
import {EmptyState, ErrorState, Skeleton} from "@/app/components/common/States"
import {Field} from "@/app/components/common/Field"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {oneWebApi, type OneWebPackage} from "@/lib/api/oneweb"
import {useApi} from "@/lib/hooks/useApi"
import {formatDateTime, toDateInput} from "@/lib/format"
import {useI18n} from "@/i18n"
import {cn} from "@/lib/utils"

/** Спутниковый интернет OneWeb: продукты договора и остаток трафика (GET /oneweb/products, …/usage). */
export default function OneWebPage() {
  const {t} = useI18n()
  const products = useApi(() => oneWebApi.listProducts())
  const [selected, setSelected] = useState<string | null>(null)
  const [month, setMonth] = useState("") // YYYY-MM; пусто — текущий период

  const list = products.data?.products ?? []
  const productId = selected ?? list[0]?.product_id ?? null

  const usage = useApi(
    () => (productId ? oneWebApi.getUsage(productId, month || undefined) : Promise.resolve(null)),
    [productId, month]
  )

  return (
    <Page
      title="OneWeb"
      description={t("oneweb.description")}
      illustration={<LottieAnimation src="/videos/satellite.json" />}
    >
      {products.error ? (
        <Card>
          <ErrorState error={products.error} onRetry={products.reload} />
        </Card>
      ) : products.loading && !products.data ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon={Satellite}
            title={t("oneweb.noProductsTitle")}
            description={t("oneweb.noProductsDescription")}
          />
        </Card>
      ) : (
        <>
          <Card className="mb-4 grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-start">
            <Field label={t("oneweb.product")}>
              <div className="flex flex-wrap gap-2">
                {list.map((p) => {
                  const active = p.product_id === productId
                  return (
                    <button
                      key={p.product_id}
                      onClick={() => setSelected(p.product_id)}
                      aria-pressed={active}
                      className={cn(
                        "flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
                        active
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-border text-foreground/80 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Satellite className="size-4" />
                      {p.product_id}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label={t("oneweb.period")}>
              <div className="flex items-center gap-2">
                <Input
                  type="month"
                  value={month}
                  max={toDateInput(new Date()).slice(0, 7)}
                  onChange={(e) => setMonth(e.target.value)}
                  className="h-11 w-full md:w-48"
                />
                <Button
                  variant={month ? "outline" : "secondary"}
                  className="h-11 px-4"
                  disabled={!month}
                  onClick={() => setMonth("")}
                >
                  {t("oneweb.current")}
                </Button>
              </div>
            </Field>
          </Card>

          <Card>
            <CardHeader
              title={usage.data?.tariff_name ?? t("oneweb.tariff")}
              actions={usage.data?.is_unlimited && <Badge tone="brand">{t("oneweb.unlimitedBadge")}</Badge>}
            />
            {usage.error ? (
              <ErrorState error={usage.error} onRetry={usage.reload} />
            ) : usage.loading && !usage.data ? (
              <div className="space-y-4 p-5">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : !usage.data || usage.data.tariff_name === null ? (
              <EmptyState
                icon={Satellite}
                title={t("oneweb.noDataTitle")}
                description={t("oneweb.noDataDescription")}
              />
            ) : usage.data.is_unlimited ? (
              <EmptyState
                icon={InfinityIcon}
                title={
                  usage.data.used
                    ? t("oneweb.used", {value: `${usage.data.used} ${usage.data.used_units ?? ""}`.trim()})
                    : t("oneweb.unlimitedTitle")
                }
                description={t("oneweb.unlimitedDescription")}
              />
            ) : (
              <ul className={cn("divide-border divide-y transition-opacity", usage.loading && "opacity-60")}>
                {usage.data.packages.map((p, i) => (
                  <PackageRow key={i} pkg={p} />
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </Page>
  )
}

/** Пакет трафика: остаток из объёма и полоса прогресса. */
function PackageRow({pkg}: {pkg: OneWebPackage}) {
  const {t} = useI18n()
  const typeName =
    pkg.type === "main" ? t("oneweb.typeMain") : pkg.type === "overage" ? t("oneweb.typeOverage") : pkg.type_label
  const size = Number(pkg.size)
  const remaining = Number(pkg.remaining)
  const pct = size > 0 ? Math.max(0, Math.min(100, (remaining / size) * 100)) : 0
  const low = pct < 15
  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">{typeName}</span>
        <span className="text-sm tabular-nums">
          <span className="font-semibold">{pkg.remaining ?? "—"}</span>
          <span className="text-muted-foreground">
            {" "}
            {t("oneweb.remainingOf", {size: pkg.size ?? "—", units: pkg.units})}
          </span>
        </span>
      </div>
      <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full transition-all", low ? "bg-destructive" : "bg-brand")}
          style={{width: `${pct}%`}}
        />
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        {formatDateTime(pkg.starts_at)} — {formatDateTime(pkg.ends_at)}
      </p>
    </li>
  )
}
