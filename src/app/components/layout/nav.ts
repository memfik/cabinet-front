import type {MessageKey} from "@/i18n"
import {CreditCard, FileText, Headset, Home, Satellite, Send, Users} from "lucide-react"

export interface NavItem {
  labelKey: MessageKey
  href: string
  icon: React.ComponentType<{className?: string}>
  /** Только для пользователей с `is_user_manager` (раздел «Пользователи»). */
  managerOnly?: boolean
}

/** Разделы кабинета — единый список для шапки и нижней навигации. Профиль — в меню пользователя. */
export const navItems: NavItem[] = [
  {labelKey: "shell.navHome", href: "/", icon: Home},
  {labelKey: "shell.navPayments", href: "/payments", icon: CreditCard},
  {labelKey: "shell.navDocuments", href: "/invoices", icon: FileText},
  {labelKey: "shell.navTickets", href: "/tickets", icon: Headset},
  {labelKey: "shell.navRequests", href: "/requests", icon: Send},
  {labelKey: "shell.navOneWeb", href: "/oneweb", icon: Satellite},
  {labelKey: "shell.navUsers", href: "/users", icon: Users, managerOnly: true},
]

export const isNavActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href)
