import type {Locale} from "../config"

/** Строка или формы множественного числа [1 заявка, 2 заявки, 5 заявок] — выбираются по числу в `tn`. */
export type Text = string | readonly [one: string, few: string, many: string]

/** Один ключ — сразу три языка, чтобы перевод не расходился с оригиналом. */
export type Entry = Record<Locale, Text>

/**
 * Раздел словаря. Ключи — без точек (`saveButton`), подстановки — `{name}`,
 * для множественного числа вместо строки передают три формы, число подставляется как `{n}`.
 */
export const defineNamespace = <T extends Record<string, Entry>>(messages: T) => messages
