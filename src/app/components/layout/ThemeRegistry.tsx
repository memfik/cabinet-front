"use client"

import {ThemeContextProvider} from "./ThemeContext"

/** Провайдер темы: получает начальные значения с сервера (из cookie) и раздаёт их вниз. */
export function ThemeRegistry({children, initialDark}: {children: React.ReactNode; initialDark: boolean}) {
  return <ThemeContextProvider initialDark={initialDark}>{children}</ThemeContextProvider>
}
