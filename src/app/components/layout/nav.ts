import {CreditCard, FileText, Headset, Home, Satellite, Send, Users} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{className?: string}>
  /** Только для пользователей с `is_user_manager` (раздел «Пользователи»). */
  managerOnly?: boolean
}

/** Разделы кабинета — единый список для шапки и нижней навигации. Профиль — в меню пользователя. */
export const navItems: NavItem[] = [
  {label: "Главная", href: "/", icon: Home},
  {label: "Платежи", href: "/payments", icon: CreditCard},
  {label: "Документы", href: "/invoices", icon: FileText},
  {label: "Заявки", href: "/tickets", icon: Headset},
  {label: "Заявления", href: "/requests", icon: Send},
  {label: "OneWeb", href: "/oneweb", icon: Satellite},
  {label: "Пользователи", href: "/users", icon: Users, managerOnly: true},
]

export const isNavActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href)
