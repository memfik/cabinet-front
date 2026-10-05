import {defineNamespace} from "./types"

export default defineNamespace({
  title: {ru: "Статистика звонков", en: "Call statistics", kk: "Қоңыраулар статистикасы"},
  description: {
    ru: "Только платные звонки, стоимость с НДС 12%. Период — не более 30 дней.",
    en: "Paid calls only, cost includes 12% VAT. The period is up to 30 days.",
    kk: "Тек ақылы қоңыраулар, құны ҚҚС 12%-бен. Кезең — 30 күннен аспайды.",
  },
  backHome: {ru: "На главную", en: "Back to home", kk: "Басты бетке"},
  paidCalls: {ru: "Платных звонков", en: "Paid calls", kk: "Ақылы қоңыраулар"},
  totalDuration: {ru: "Общая длительность", en: "Total duration", kk: "Жалпы ұзақтығы"},
  totalCost: {ru: "Общая стоимость", en: "Total cost", kk: "Жалпы құны"},
  calls: {ru: "Звонки", en: "Calls", kk: "Қоңыраулар"},
  emptyTitle: {ru: "Платных звонков нет", en: "No paid calls", kk: "Ақылы қоңыраулар жоқ"},
  emptyDescription: {
    ru: "За выбранный период платных звонков не было.",
    en: "There were no paid calls in the selected period.",
    kk: "Таңдалған кезеңде ақылы қоңыраулар болған жоқ.",
  },
  colDateTime: {ru: "Дата и время", en: "Date and time", kk: "Күні мен уақыты"},
  colFrom: {ru: "Откуда", en: "From", kk: "Қайдан"},
  colTo: {ru: "Куда", en: "To", kk: "Қайда"},
  colDuration: {ru: "Длительность", en: "Duration", kk: "Ұзақтығы"},
  colCost: {ru: "Стоимость", en: "Cost", kk: "Құны"},
})
