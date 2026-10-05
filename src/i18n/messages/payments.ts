import {defineNamespace} from "./types"

export default defineNamespace({
  title: {ru: "Платежи", en: "Payments", kk: "Төлемдер"},
  description: {
    ru: "Зачисления на лицевой счёт. Период — не более 90 дней.",
    en: "Credits to your account. The period is up to 90 days.",
    kk: "Жеке шотқа түскен төлемдер. Кезең — 90 күннен аспайды.",
  },
  credits: {ru: "Зачисления", en: "Credits", kk: "Түсімдер"},
  total: {ru: "Итого: ", en: "Total: ", kk: "Барлығы: "},
  noDataTitle: {ru: "Нет данных", en: "No data", kk: "Деректер жоқ"},
  noDataDescription: {
    ru: "У вас нет лицевого счёта, платежей нет.",
    en: "You have no account, so there are no payments.",
    kk: "Сізде жеке шот жоқ, төлемдер де жоқ.",
  },
  emptyTitle: {ru: "Платежей нет", en: "No payments", kk: "Төлемдер жоқ"},
  emptyPeriod: {ru: "За период {from} — {to}", en: "For the period {from} — {to}", kk: "{from} — {to} кезеңі үшін"},
  colDate: {ru: "Дата", en: "Date", kk: "Күні"},
  colOperator: {ru: "Оператор", en: "Operator", kk: "Оператор"},
  colComment: {ru: "Комментарий", en: "Comment", kk: "Түсініктеме"},
  colAmount: {ru: "Сумма", en: "Amount", kk: "Сома"},
})
