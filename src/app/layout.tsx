import type {Metadata} from "next"
import {Geist} from "next/font/google"
import {cookies} from "next/headers"
import {ThemeRegistry} from "./components/layout/ThemeRegistry"
import {TooltipProvider} from "@/components/ui/tooltip"
import {Toaster} from "@/components/ui/sonner"
import {I18nProvider} from "@/i18n"
import {getServerLocale} from "@/i18n/server"
import {translate} from "@/i18n/core"
import {cn} from "@/lib/utils"
import "./globals.css"

const geist = Geist({subsets: ["latin"], variable: "--font-sans"})

export async function generateMetadata(): Promise<Metadata> {
  const title = translate(await getServerLocale(), "common.appName")
  return {title, description: title, icons: {icon: "/icon.svg"}}
}

/**
 * Корневой layout. Тема читается из cookie на СЕРВЕРЕ и сразу попадает в
 * разметку — иначе на первом кадре мелькнёт светлая тема.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const isDark = cookieStore.get("theme")?.value === "dark"
  const locale = await getServerLocale()

  return (
    <html
      lang={locale}
      data-theme={isDark ? "dark" : "light"}
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body suppressHydrationWarning>
        <I18nProvider initial={locale}>
          <ThemeRegistry initialDark={isDark}>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position="bottom-center" richColors />
          </ThemeRegistry>
        </I18nProvider>
      </body>
    </html>
  )
}
