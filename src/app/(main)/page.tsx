"use client"

import Link from "next/link"
import {ArrowRight, BarChart3, Building2, FileText, Globe, Headset, Phone, Send, UserRound, Wallet} from "lucide-react"
import {Page, Card, CardHeader} from "@/app/components/common/Page"
import {LottieAnimation} from "@/app/components/common/LottieAnimation"
import {EmptyState, ErrorState, Skeleton} from "@/app/components/common/States"
import {Badge} from "@/app/components/common/Badge"
import {buttonVariants} from "@/components/ui/button"
import {dashboardApi, type DashboardService, type ServiceCategory} from "@/lib/api/dashboard"
import {useApi} from "@/lib/hooks/useApi"
import {useAuthStore} from "@/lib/stores/authStore"
import {formatMoney, isNegative} from "@/lib/format"
import {useI18n, type MessageKey} from "@/i18n"
import {cn} from "@/lib/utils"

const categories: Record<ServiceCategory, {label: MessageKey; icon: typeof Phone}> = {
  telephony: {label: "home.catTelephony", icon: Phone},
  internet: {label: "home.catInternet", icon: Globe},
  other: {label: "home.catOther", icon: Building2},
}

const quickLinks: {href: string; label: MessageKey; icon: typeof Phone}[] = [
  {href: "/payments", label: "home.linkPayments", icon: Wallet},
  {href: "/invoices", label: "home.linkInvoices", icon: FileText},
  {href: "/tickets/new", label: "home.linkNewTicket", icon: Headset},
  {href: "/requests", label: "home.linkRequests", icon: Send},
]

/** Главная: баланс, данные договора и активные услуги (GET /dashboard). */
export default function Home() {
  const {t, tn} = useI18n()
  const user = useAuthStore((s) => s.user)
  const {data, error, loading, reload} = useApi(() => dashboardApi.get())

  return (
    <Page
      title={user?.first_name ? t("home.greeting", {name: user.first_name}) : t("home.titleDefault")}
      description={t("home.description")}
      illustration={<LottieAnimation src="/videos/welcome.json" />}
      illustrationClassName="-my-8 h-52 w-72"
    >
      {error && !data ? (
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      ) : loading && !data ? (
        <DashboardSkeleton />
      ) : data && !data.has_contract ? (
        <Card>
          <EmptyState
            icon={Building2}
            title={t("home.noContractTitle")}
            description={t("home.noContractDescription")}
          />
        </Card>
      ) : data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <BalanceCard balance={data.balance} account={data.account_number} />

          <Card className="lg:col-span-2">
            <CardHeader title={t("home.contract")} />
            <dl className="grid gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-2">
              <Info
                icon={UserRound}
                label={data.is_company ? t("home.company") : t("home.client")}
                value={data.client_name}
              />
              <Info icon={FileText} label={t("home.contractNumber")} value={data.contract_code} />
              <Info icon={Wallet} label={t("home.account")} value={data.account_number} />
              <Info icon={UserRound} label={t("home.manager")} value={data.account_manager} />
            </dl>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader
              title={t("home.activeServices")}
              actions={
                <span className="text-muted-foreground text-sm">{tn("home.servicesCount", data.services.length)}</span>
              }
            />
            {data.services.length === 0 ? (
              <EmptyState title={t("home.noServices")} />
            ) : (
              <ul className="divide-border divide-y">
                {data.services.map((s) => (
                  <ServiceRow key={`${s.tariff_id}-${s.account_name_id}`} service={s} />
                ))}
              </ul>
            )}
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-4">
            {quickLinks.map(({href, label, icon: Icon}) => (
              <Link
                key={href}
                href={href}
                className="bg-card border-border hover:border-brand/40 group flex items-center gap-3 rounded-xl border p-4 transition-colors"
              >
                <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </span>
                <span className="flex-1 text-sm font-medium">{t(label)}</span>
                <ArrowRight className="text-muted-foreground group-hover:text-brand size-4 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </Page>
  )
}

/** Баланс: отрицательный — задолженность, красным. */
function BalanceCard({balance, account}: {balance: string | null; account: string | null}) {
  const {t} = useI18n()
  const debt = isNegative(balance)
  return (
    <Card className="bg-brand border-transparent p-5 text-white">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>{debt ? t("home.debt") : t("home.balance")}</span>
        <Wallet className="size-5" />
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{formatMoney(balance)}</p>
      {debt && <p className="mt-2 inline-block rounded-md bg-white/15 px-2 py-0.5 text-xs">{t("home.topUpHint")}</p>}
      <p className="mt-4 text-xs text-white/70">{t("home.accountNumber", {account: account ?? "—"})}</p>
      <Link
        href="/payments"
        className="mt-1 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
      >
        {t("home.linkPayments")} <ArrowRight className="size-3.5" />
      </Link>
    </Card>
  )
}

function Info({icon: Icon, label, value}: {icon: typeof Phone; label: string; value: string | null}) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="font-medium break-words">{value ?? "—"}</dd>
      </div>
    </div>
  )
}

function ServiceRow({service}: {service: DashboardService}) {
  const {t} = useI18n()
  const {label, icon: Icon} = categories[service.category]
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
      <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1 basis-56">
        <p className="font-medium">{service.name}</p>
        <p className="text-muted-foreground text-sm">{t("home.tariff", {name: service.tariff_name})}</p>
      </div>
      <Badge tone={service.category === "other" ? "neutral" : "brand"}>{t(label)}</Badge>
      {service.has_statistics && (
        <Link
          href={`/services/${service.tariff_id}/${service.account_name_id}`}
          className={cn(buttonVariants({variant: "outline"}), "h-9")}
        >
          <BarChart3 /> {t("home.callStats")}
        </Link>
      )}
    </li>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-44 rounded-xl lg:col-span-2" />
      <Skeleton className="h-64 rounded-xl lg:col-span-3" />
    </div>
  )
}
