"use client"

import {RefreshCw} from "lucide-react"
import {useI18n} from "@/i18n"
import {cn} from "@/lib/utils"
import {Skeleton} from "../../common/States"

/** Оболочка виджета правой колонки: заголовок с иконкой, кнопка обновления, состояния загрузки и ошибки. */
export function WidgetCard({
  title,
  icon: Icon,
  onReload,
  loading,
  error,
  refreshing,
  staleError,
  className,
  children,
}: {
  title: string
  icon: React.ComponentType<{className?: string}>
  onReload?: () => void
  /** Показываем скелетон, только пока данных ещё нет. */
  loading?: boolean
  error?: string | null
  /** Идёт повторная загрузка при уже показанных данных: иконка крутится, кнопка заблокирована. */
  refreshing?: boolean
  /** Повторная загрузка не удалась, на экране прежние данные. */
  staleError?: boolean
  className?: string
  children?: React.ReactNode
}) {
  const {t} = useI18n()
  return (
    <section className={cn("bg-card border-border shrink-0 rounded-2xl border p-4 shadow-md", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4.5" />
          {title}
        </h2>
        {onReload && (
          <button
            onClick={onReload}
            disabled={refreshing}
            aria-label={t("widgets.refresh")}
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground rounded-md p-1 transition-colors disabled:pointer-events-none"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
          </button>
        )}
      </div>
      {error ? (
        <p className="text-muted-foreground py-3 text-sm">{error}</p>
      ) : loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <>
          {children}
          {staleError && !refreshing && <p className="text-destructive mt-3 text-[11px]">{t("widgets.staleError")}</p>}
        </>
      )}
    </section>
  )
}
