import {defineNamespace} from "./types"

export default defineNamespace({
  appName: {ru: "Личный кабинет", en: "Customer portal", kk: "Жеке кабинет"},
  genericError: {ru: "Что-то пошло не так", en: "Something went wrong", kk: "Бірдеңе дұрыс болмады"},
  noConnection: {ru: "Нет соединения с сервером", en: "No connection to the server", kk: "Сервермен байланыс жоқ"},
  serviceUnavailable: {
    ru: "Сервис временно недоступен",
    en: "Service temporarily unavailable",
    kk: "Қызмет уақытша қолжетімсіз",
  },
  loadFailed: {ru: "Не удалось загрузить данные", en: "Failed to load data", kk: "Деректерді жүктеу мүмкін болмады"},
  retry: {ru: "Повторить", en: "Retry", kk: "Қайталау"},
  retryAfter: {ru: "Повторите через {sec} сек.", en: "Try again in {sec} s.", kk: "{sec} сек. кейін қайталап көріңіз."},
  select: {ru: "Выберите…", en: "Select…", kk: "Таңдаңыз…"},
  daysShort: {ru: "{n} дн.", en: "{n} d.", kk: "{n} күн"},
  calendar: {ru: "Календарь", en: "Calendar", kk: "Күнтізбе"},
  pickRangeStart: {ru: "Выберите начало периода", en: "Select the start date", kk: "Кезеңнің басын таңдаңыз"},
  pickRangeEnd: {ru: "Теперь выберите конец периода", en: "Now select the end date", kk: "Енді кезеңнің соңын таңдаңыз"},
  period: {ru: "Период", en: "Period", kk: "Кезең"},
  dateFrom: {ru: "С", en: "From", kk: "Бастап"},
  dateTo: {ru: "По", en: "To", kk: "Дейін"},
  pageRange: {ru: "{from}–{to} из {total}", en: "{from}–{to} of {total}", kk: "{from}–{to} / {total}"},
  previous: {ru: "Назад", en: "Back", kk: "Артқа"},
  next: {ru: "Вперёд", en: "Forward", kk: "Алға"},
  durationHms: {ru: "{h} ч {m} мин {s} сек", en: "{h} h {m} min {s} s", kk: "{h} сағ {m} мин {s} сек"},
  durationMs: {ru: "{m} мин {s} сек", en: "{m} min {s} s", kk: "{m} мин {s} сек"},
  durationS: {ru: "{s} сек", en: "{s} s", kk: "{s} сек"},
})
