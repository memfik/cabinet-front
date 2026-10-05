import {defineNamespace} from "./types"

export default defineNamespace({
  description: {
    ru: "Спутниковый интернет: тариф и остаток трафика",
    en: "Satellite internet: plan and remaining traffic",
    kk: "Спутниктік интернет: тариф және трафик қалдығы",
  },
  noProductsTitle: {
    ru: "У вас нет продуктов OneWeb",
    en: "You have no OneWeb products",
    kk: "Сізде OneWeb өнімдері жоқ",
  },
  noProductsDescription: {
    ru: "Раздел появится, когда к договору подключат спутниковую связь.",
    en: "This section will appear once satellite service is connected to your contract.",
    kk: "Шартқа спутниктік байланыс қосылған кезде бөлім пайда болады.",
  },
  product: {ru: "Продукт", en: "Product", kk: "Өнім"},
  period: {ru: "Период", en: "Period", kk: "Кезең"},
  current: {ru: "Текущий", en: "Current", kk: "Ағымдағы"},
  tariff: {ru: "Тариф", en: "Plan", kk: "Тариф"},
  unlimitedBadge: {ru: "Безлимит", en: "Unlimited", kk: "Шектеусіз"},
  noDataTitle: {ru: "Нет данных за период", en: "No data for this period", kk: "Кезең бойынша деректер жоқ"},
  noDataDescription: {ru: "Выберите другой месяц.", en: "Select another month.", kk: "Басқа айды таңдаңыз."},
  used: {ru: "Израсходовано: {value}", en: "Used: {value}", kk: "Жұмсалды: {value}"},
  unlimitedTitle: {ru: "Безлимитный тариф", en: "Unlimited plan", kk: "Шектеусіз тариф"},
  unlimitedDescription: {
    ru: "Безлимитный тариф: ограничений по объёму нет.",
    en: "Unlimited plan: there is no data cap.",
    kk: "Шектеусіз тариф: көлемге шектеу жоқ.",
  },
  typeMain: {ru: "Основной пакет", en: "Main package", kk: "Негізгі пакет"},
  typeOverage: {ru: "Дополнительный пакет", en: "Additional package", kk: "Қосымша пакет"},
  remainingOf: {ru: "из {size} {units}", en: "of {size} {units}", kk: "{size} {units} ішінен"},
})
