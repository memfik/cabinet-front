"use client"

import Link from "next/link"
import {ArrowRight, Wallet} from "lucide-react"
import {dashboardApi} from "@/lib/api/dashboard"
import {useApi} from "@/lib/hooks/useApi"
import {formatMoney, isNegative} from "@/lib/format"
import {useI18n} from "@/i18n"
import {cn} from "@/lib/utils"
import {WidgetCard} from "./WidgetCard"

/** Виджет по данным кабинета: баланс, число услуг и менеджер (GET /dashboard, баланс на бэке кешируется 5 минут). */
export function AccountWidget() {
  const {t, tn} = useI18n()
  const {data, error, loading, reload} = useApi(() => dashboardApi.get())
  const debt = isNegative(data?.balance)

  return (
    <WidgetCard
      title={t("widgets.accountTitle")}
      icon={Wallet}
      onReload={reload}
      loading={loading && !data}
      refreshing={loading && !!data}
      staleError={!!error && !!data}
      error={error && !data ? t("widgets.accountError") : null}
    >
      {data && !data.has_contract ? (
        <p className="text-muted-foreground text-sm">{t("widgets.noContract")}</p>
      ) : data ? (
        <>
          <p className="text-muted-foreground text-xs">{debt ? t("widgets.debt") : t("widgets.balance")}</p>
          <p className={cn("mt-0.5 text-2xl font-bold tracking-tight tabular-nums", debt && "text-destructive")}>
            {formatMoney(data.balance)}
          </p>
          <dl className="text-muted-foreground mt-3 space-y-1 text-xs">
            <div className="flex justify-between gap-2">
              <dt>{t("widgets.account")}</dt>
              <dd className="text-foreground font-medium">{data.account_number ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>{t("widgets.activeServices")}</dt>
              <dd className="text-foreground font-medium">{tn("widgets.servicesCount", data.services.length)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>{t("widgets.manager")}</dt>
              <dd className="text-foreground truncate font-medium">{data.account_manager ?? "—"}</dd>
            </div>
          </dl>
          <Link
            href="/payments"
            className="text-brand mt-3 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            {t("widgets.payments")} <ArrowRight className="size-3.5" />
          </Link>
        </>
      ) : null}
    </WidgetCard>
  )
}
