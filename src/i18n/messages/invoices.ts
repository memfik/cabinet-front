import {defineNamespace} from "./types"

export default defineNamespace({
  title: {ru: "Документы", en: "Documents", kk: "Құжаттар"},
  description: {
    ru: "Счета и счета-фактуры с начала текущего года",
    en: "Invoices and tax invoices since the beginning of this year",
    kk: "Ағымдағы жыл басынан бергі шоттар мен шот-фактуралар",
  },
  downloadFailed: {
    ru: "Не удалось скачать документ. Попробуйте позже.",
    en: "Could not download the document. Please try again later.",
    kk: "Құжатты жүктеу мүмкін болмады. Кейінірек қайталап көріңіз.",
  },
  emptyTitle: {ru: "Документов пока нет", en: "No documents yet", kk: "Құжаттар әзірге жоқ"},
  emptyDescription: {
    ru: "Здесь появятся счета и счета-фактуры за текущий год.",
    en: "Invoices and tax invoices for the current year will appear here.",
    kk: "Мұнда ағымдағы жылғы шоттар мен шот-фактуралар пайда болады.",
  },
  colType: {ru: "Тип", en: "Type", kk: "Түрі"},
  colPeriod: {ru: "Период", en: "Period", kk: "Кезең"},
  colAmount: {ru: "Сумма", en: "Amount", kk: "Сома"},
  document: {ru: "Документ", en: "Document", kk: "Құжат"},
  typeAccountNotice: {ru: "Извещение", en: "Account notice", kk: "Хабарлама"},
  typeInvoice: {ru: "Счёт-фактура", en: "Tax invoice", kk: "Шот-фактура"},
  typeOneTimeInvoice: {ru: "Разовый счёт", en: "One-time invoice", kk: "Бір реттік шот"},
  typeCorrectionInvoice: {ru: "Корректировочный счёт-фактура", en: "Correction invoice", kk: "Түзету шот-фактурасы"},
})
