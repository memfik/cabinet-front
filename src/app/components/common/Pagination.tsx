"use client"

import {ChevronLeft, ChevronRight} from "lucide-react"
import {Button} from "@/components/ui/button"
import type {PaginationMeta} from "@/lib/api/types"

/** Пагинация Laravel: «21–40 из 45» и кнопки назад/вперёд. */
export function Pagination({meta, onPage}: {meta: PaginationMeta; onPage: (page: number) => void}) {
  if (meta.last_page <= 1) return null
  return (
    <div className="border-border flex items-center justify-between gap-3 border-t px-5 py-3">
      <span className="text-muted-foreground text-sm">
        {meta.from}–{meta.to} из {meta.total}
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
          aria-label="Назад"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPage(meta.current_page + 1)}
          aria-label="Вперёд"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
