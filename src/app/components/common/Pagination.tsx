"use client"

import {ChevronLeft, ChevronRight} from "lucide-react"
import {Button} from "@/components/ui/button"
import type {PaginationMeta} from "@/lib/api/types"
import {useI18n} from "@/i18n"

/** Пагинация Laravel: «21–40 из 45» и кнопки назад/вперёд. */
export function Pagination({meta, onPage}: {meta: PaginationMeta; onPage: (page: number) => void}) {
  const {t} = useI18n()
  if (meta.last_page <= 1) return null
  return (
    <div className="border-border flex items-center justify-between gap-3 border-t px-5 py-3">
      <span className="text-muted-foreground text-sm">
        {t("common.pageRange", {from: meta.from, to: meta.to, total: meta.total})}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">
          {meta.current_page} / {meta.last_page}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={meta.current_page <= 1}
          onClick={() => onPage(meta.current_page - 1)}
          aria-label={t("common.previous")}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPage(meta.current_page + 1)}
          aria-label={t("common.next")}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
