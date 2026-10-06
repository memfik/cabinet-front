"use client"

import {useEffect} from "react"
import {Header} from "./Header"
import {BottomNav} from "./BottomNav"
import {Sidebar} from "./Sidebar"
import {RightBar} from "./RightBar"
import {useProfileStore} from "@/lib/stores/profileStore"

/**
 * Оболочка всех защищённых страниц: левая колонка (десктоп) или шапка + нижняя навигация (мобильная), контент.
 *
 * На монтировании тянет профиль — стор ленивый, поэтому при переходах между
 * страницами повторных запросов не будет.
 */
export function ClientShell({children}: {children: React.ReactNode}) {
  const fetchProfile = useProfileStore((s) => s.fetch)

  useEffect(() => {
    fetchProfile()
  }, [])

  return (
    <div className="relative flex h-screen overflow-hidden app-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 lg:hidden">
          <Header />
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        <div className="contents">
          <BottomNav />
        </div>
      </div>
      <RightBar />
    </div>
  )
}
