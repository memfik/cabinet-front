"use client"

import {AlertCircle, Inbox, RefreshCw} from "lucide-react"
import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"
import type {ApiError} from "@/lib/api/errors"

export function Skeleton({className}: {className?: string}) {
  return <div className={cn("bg-muted animate-pulse rounded-md", className)} />
}

/** Скелетон таблицы/списка: `rows` строк. */
export function ListSkeleton({rows = 5}: {rows?: number}) {
  return (
    <div className="divide-border divide-y">
      {Array.from({length: rows}, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

/** Пустое состояние. */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ComponentType<{className?: string}>
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="bg-muted text-muted-foreground mb-3 flex size-12 items-center justify-center rounded-full">
        <Icon className="size-6" />
      </span>
      <p className="font-medium">{title}</p>
      {description && <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/**
 * Ошибка загрузки. 503 — внешняя система недоступна: текст бэка уже подсказывает повторить позже,
 * поэтому просто показываем его и даём кнопку «Повторить».
 */
export function ErrorState({error, onRetry}: {error: ApiError; onRetry?: () => void}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="bg-destructive/10 text-destructive mb-3 flex size-12 items-center justify-center rounded-full">
        <AlertCircle className="size-6" />
      </span>
      <p className="font-medium">
        {error.status === 503 ? "Сервис временно недоступен" : "Не удалось загрузить данные"}
      </p>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{error.message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw /> Повторить
        </Button>
      )}
    </div>
  )
}
