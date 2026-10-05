import auth from "./auth"
import common from "./common"
import home from "./home"
import invoices from "./invoices"
import oneweb from "./oneweb"
import payments from "./payments"
import profile from "./profile"
import requests from "./requests"
import services from "./services"
import shell from "./shell"
import tickets from "./tickets"
import users from "./users"
import widgets from "./widgets"
import type {Entry} from "./types"

export const MESSAGES = {
  common,
  shell,
  auth,
  home,
  payments,
  invoices,
  oneweb,
  services,
  widgets,
  tickets,
  requests,
  users,
  profile,
}

/** `раздел.ключ` — опечатка в ключе или его отсутствие в словаре ловится компилятором. */
export type MessageKey = {
  [N in keyof typeof MESSAGES]: `${N}.${Extract<keyof (typeof MESSAGES)[N], string>}`
}[keyof typeof MESSAGES]

export const lookup = (key: string): Entry | undefined => {
  const dot = key.indexOf(".")
  const ns = MESSAGES[key.slice(0, dot) as keyof typeof MESSAGES] as Record<string, Entry> | undefined
  return ns?.[key.slice(dot + 1)]
}
