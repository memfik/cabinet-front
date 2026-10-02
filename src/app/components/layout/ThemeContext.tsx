"use client"

import {createContext, useContext, useState, useEffect, useRef, ReactNode} from "react"

interface ThemeContextType {
  isDark: boolean
  toggleTheme: (event?: {clientX: number; clientY: number}) => void
  setDark: (v: boolean, event?: {clientX: number; clientY: number}) => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  setDark: () => {},
})

/** Доступ к теме. Значение персистится в cookie. */
export function useAppTheme() {
  return useContext(ThemeContext)
}

type WithViewTransition = Document & {
  startViewTransition?: (cb: () => void) => {finished: Promise<void>}
}

/**
 * Тема. Начальное значение приходит с сервера (прочитано из cookie в корневом
 * layout), поэтому первый кадр уже правильный. Смена пишет cookie — так выбор
 * переживает перезагрузку и не мигает при следующем заходе.
 */
export function ThemeContextProvider({children, initialDark = false}: {children: ReactNode; initialDark?: boolean}) {
  const [isDark, setIsDark] = useState(initialDark)
  const busy = useRef(false)

  useEffect(() => {
    document.cookie = `theme=${isDark ? "dark" : "light"};path=/;max-age=31536000`
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
    document.documentElement.style.colorScheme = isDark ? "dark" : "light"
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  // Смена темы раскрывается кругом из точки клика — как в use-theme-transition
  // у kezdesu-front. Координаты уезжают в CSS как --theme-x/--theme-y, а сам
  // переход рисует ::view-transition-new(root) в globals.css. Где API нет или
  // включено «уменьшить движение» — тема просто переключается, без анимации.
  const applyDark = (next: boolean, event?: {clientX: number; clientY: number}) => {
    const doc = document as WithViewTransition
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (busy.current || reduced || typeof doc.startViewTransition !== "function") {
      setIsDark(next)
      return
    }

    const x = event ? (event.clientX / window.innerWidth) * 100 : 50
    const y = event ? (event.clientY / window.innerHeight) * 100 : 50
    document.documentElement.style.setProperty("--theme-x", `${x}%`)
    document.documentElement.style.setProperty("--theme-y", `${y}%`)

    busy.current = true
    const transition = doc.startViewTransition(() => setIsDark(next))
    transition.finished.finally(() => {
      busy.current = false
    })
  }

  // Печать всегда светлая — @media print не достаёт до dark:-утилит с зашитыми цветами
  // (только до CSS-переменных), поэтому на время печати снимаем .dark/data-theme с <html>
  // целиком, а после печати возвращаем как было. isDarkRef — чтобы afterprint видел
  // актуальное значение, а не то, что было при подписке на события.
  const isDarkRef = useRef(isDark)
  useEffect(() => {
    isDarkRef.current = isDark
  }, [isDark])

  useEffect(() => {
    const goLight = () => {
      document.documentElement.classList.remove("dark")
      document.documentElement.setAttribute("data-theme", "light")
      document.documentElement.style.colorScheme = "light"
    }
    const restore = () => {
      const dark = isDarkRef.current
      document.documentElement.classList.toggle("dark", dark)
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light")
      document.documentElement.style.colorScheme = dark ? "dark" : "light"
    }
    window.addEventListener("beforeprint", goLight)
    window.addEventListener("afterprint", restore)
    return () => {
      window.removeEventListener("beforeprint", goLight)
      window.removeEventListener("afterprint", restore)
    }
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme: (event) => applyDark(!isDark, event),
        setDark: applyDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
