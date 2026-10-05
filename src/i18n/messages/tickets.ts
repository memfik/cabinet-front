import {defineNamespace} from "./types"

export default defineNamespace({
  // Список
  listTitle: {ru: "Заявки (K-ticket)", en: "Tickets (K-ticket)", kk: "Өтінімдер (K-ticket)"},
  listDescription: {
    ru: "Обращения по проблемам с услугами",
    en: "Requests about service issues",
    kk: "Қызметтерге қатысты мәселелер бойынша өтініштер",
  },
  newTicket: {ru: "Новая заявка", en: "New ticket", kk: "Жаңа өтінім"},
  numberLabel: {ru: "Номер заявки", en: "Ticket number", kk: "Өтінім нөмірі"},
  reset: {ru: "Сбросить", en: "Reset", kk: "Тазалау"},
  nothingFound: {ru: "Ничего не найдено", en: "Nothing found", kk: "Ештеңе табылмады"},
  noTickets: {ru: "Заявок пока нет", en: "No tickets yet", kk: "Өтінімдер әлі жоқ"},
  changeFilters: {
    ru: "Измените фильтры или сбросьте их.",
    en: "Change the filters or reset them.",
    kk: "Сүзгілерді өзгертіңіз немесе тазалаңыз.",
  },
  createIfProblem: {
    ru: "Создайте заявку, если возникла проблема с услугой.",
    en: "Create a ticket if you have a problem with a service.",
    kk: "Қызметке қатысты мәселе туындаса, өтінім жасаңыз.",
  },
  colNumber: {ru: "Номер", en: "Number", kk: "Нөмір"},
  colSubject: {ru: "Тема", en: "Subject", kk: "Тақырып"},
  colStatus: {ru: "Статус", en: "Status", kk: "Күйі"},
  colCreated: {ru: "Создана", en: "Created", kk: "Жасалған"},

  // Статусы
  statusNew: {ru: "Новая", en: "New", kk: "Жаңа"},
  statusInProgress: {ru: "В работе", en: "In progress", kk: "Жұмыста"},
  statusWaiting: {ru: "Ожидание", en: "Waiting", kk: "Күтуде"},
  statusResolved: {ru: "Решена", en: "Resolved", kk: "Шешілді"},
  statusClosed: {ru: "Закрыта", en: "Closed", kk: "Жабылды"},

  // Виджет
  widgetTitle: {ru: "Открытые заявки", en: "Open tickets", kk: "Ашық өтінімдер"},
  widgetLoadError: {
    ru: "Не удалось загрузить заявки",
    en: "Failed to load tickets",
    kk: "Өтінімдерді жүктеу мүмкін болмады",
  },
  widgetInProgress: {
    ru: ["заявка в работе", "заявки в работе", "заявок в работе"],
    en: ["ticket in progress", "tickets in progress", "tickets in progress"],
    kk: "өтінім жұмыста",
  },
  widgetAllClosed: {ru: "Все обращения закрыты.", en: "All requests are closed.", kk: "Барлық өтініштер жабылған."},
  widgetAll: {ru: "Все заявки", en: "All tickets", kk: "Барлық өтінімдер"},
  widgetNew: {ru: "Новая", en: "New", kk: "Жаңа"},

  // Создание
  newTitle: {ru: "Новая заявка", en: "New ticket", kk: "Жаңа өтінім"},
  newDescription: {
    ru: "Опишите проблему — мы передадим её инженерам",
    en: "Describe the problem and we will pass it to our engineers",
    kk: "Мәселені сипаттаңыз — біз оны инженерлерге береміз",
  },
  toList: {ru: "К списку", en: "Back to list", kk: "Тізімге"},
  sectionProblem: {ru: "Проблема", en: "Problem", kk: "Мәселе"},
  fieldSubject: {ru: "Тема", en: "Subject", kk: "Тақырып"},
  fieldSymptom: {ru: "Характер проблемы", en: "Problem type", kk: "Мәселенің сипаты"},
  fieldBranch: {ru: "Филиал", en: "Branch", kk: "Филиал"},
  fieldServices: {ru: "Услуги", en: "Services", kk: "Қызметтер"},
  servicesMain: {ru: "Основные", en: "Main", kk: "Негізгі"},
  servicesAdditional: {ru: "Дополнительные", en: "Additional", kk: "Қосымша"},
  fieldDescription: {ru: "Описание", en: "Description", kk: "Сипаттама"},
  fieldResource: {ru: "Ресурс", en: "Resource", kk: "Ресурс"},
  resourceHint: {
    ru: "IP-адрес, адрес подключения и т.п.",
    en: "IP address, connection address, etc.",
    kk: "IP-мекенжай, қосылу мекенжайы және т.б.",
  },
  fieldDetectedAt: {ru: "Проблема обнаружена", en: "Problem detected", kk: "Мәселе анықталған уақыт"},
  fieldDowntimeStart: {ru: "Начало простоя", en: "Downtime start", kk: "Тоқтап қалудың басталуы"},
  sectionContact: {ru: "Контактное лицо", en: "Contact person", kk: "Байланыс тұлғасы"},
  fieldName: {ru: "Имя", en: "Name", kk: "Аты"},
  fieldPhone: {ru: "Телефон", en: "Phone", kk: "Телефон"},
  fieldEmail: {ru: "Email", en: "Email", kk: "Email"},
  cancel: {ru: "Отмена", en: "Cancel", kk: "Бас тарту"},
  sending: {ru: "Отправка…", en: "Sending…", kk: "Жіберілуде…"},
  createTicket: {ru: "Создать заявку", en: "Create ticket", kk: "Өтінім жасау"},
  created: {ru: "Заявка {number} создана.", en: "Ticket {number} created.", kk: "{number} өтінімі жасалды."},
  createFailed: {
    ru: "Не удалось создать заявку.",
    en: "Failed to create the ticket.",
    kk: "Өтінімді жасау мүмкін болмады.",
  },

  // Заявка
  ticketTitle: {ru: "Заявка", en: "Ticket", kk: "Өтінім"},
  notFound: {ru: "Заявка не найдена", en: "Ticket not found", kk: "Өтінім табылмады"},
  toTicketList: {ru: "К списку заявок", en: "Back to tickets", kk: "Өтінімдер тізіміне"},
  sectionDescription: {ru: "Описание", en: "Description", kk: "Сипаттама"},
  conversation: {ru: "Переписка ({n})", en: "Conversation ({n})", kk: "Хат алмасу ({n})"},
  noMessages: {ru: "Сообщений пока нет", en: "No messages yet", kk: "Хабарламалар әлі жоқ"},
  replyWillAppear: {
    ru: "Ответ исполнителя появится здесь.",
    en: "The assignee's reply will appear here.",
    kk: "Орындаушының жауабы осында пайда болады.",
  },
  support: {ru: "Поддержка", en: "Support", kk: "Қолдау қызметі"},
  you: {ru: "Вы", en: "You", kk: "Сіз"},
  hasAttachments: {ru: "Есть вложения", en: "Has attachments", kk: "Тіркемелер бар"},

  // Реквизиты
  sectionDetails: {ru: "Реквизиты", en: "Details", kk: "Деректемелер"},
  detCreated: {ru: "Создана", en: "Created", kk: "Жасалған"},
  detContact: {ru: "Контакт", en: "Contact", kk: "Байланыс"},
  detBranch: {ru: "Филиал", en: "Branch", kk: "Филиал"},
  detSymptom: {ru: "Характер проблемы", en: "Problem type", kk: "Мәселенің сипаты"},
  detServices: {ru: "Услуги", en: "Services", kk: "Қызметтер"},
  detResource: {ru: "Ресурс", en: "Resource", kk: "Ресурс"},
  detDetected: {ru: "Обнаружена", en: "Detected", kk: "Анықталған"},
  detDowntime: {ru: "Начало простоя", en: "Downtime start", kk: "Тоқтап қалудың басталуы"},

  // Вложения
  sizeMb: {ru: "МБ", en: "MB", kk: "МБ"},
  sizeKb: {ru: "КБ", en: "KB", kk: "КБ"},
  downloadFailed: {
    ru: "Не удалось скачать файл. Попробуйте позже.",
    en: "Failed to download the file. Please try again later.",
    kk: "Файлды жүктеп алу мүмкін болмады. Кейінірек қайталап көріңіз.",
  },
  fileTooLarge: {
    ru: "Файл слишком большой и не сохранён",
    en: "The file is too large and was not saved",
    kk: "Файл тым үлкен, сондықтан сақталмаған",
  },
  notSaved: {ru: "не сохранён", en: "not saved", kk: "сақталмаған"},

  // Форма ответа
  replyTitle: {ru: "Написать в заявку", en: "Reply to ticket", kk: "Өтінімге жазу"},
  fieldYourName: {ru: "Ваше имя", en: "Your name", kk: "Сіздің атыңыз"},
  optional: {ru: "Необязательно", en: "Optional", kk: "Міндетті емес"},
  fieldMessage: {ru: "Сообщение", en: "Message", kk: "Хабарлама"},
  filesHint: {
    ru: "До {max} файлов по 1953 КБ: {types}",
    en: "Up to {max} files of 1953 KB each: {types}",
    kk: "1953 КБ-қа дейінгі {max} файлға дейін: {types}",
  },
  attachFiles: {ru: "Прикрепить файлы", en: "Attach files", kk: "Файл тіркеу"},
  removeFile: {ru: "Убрать {name}", en: "Remove {name}", kk: "{name} файлын алып тастау"},
  fileTypeUnsupported: {
    ru: "«{name}»: тип файла не поддерживается",
    en: "“{name}”: file type is not supported",
    kk: "«{name}»: файл түрі қолдау таппайды",
  },
  fileOverSize: {
    ru: "«{name}»: больше 1953 КБ",
    en: "“{name}”: larger than 1953 KB",
    kk: "«{name}»: 1953 КБ-тан асады",
  },
  maxFiles: {ru: "Не больше {max} файлов", en: "No more than {max} files", kk: "{max} файлдан аспауы керек"},
  send: {ru: "Отправить", en: "Send", kk: "Жіберу"},
  sent: {ru: "Сообщение отправлено.", en: "Message sent.", kk: "Хабарлама жіберілді."},
  sendFailed: {
    ru: "Не удалось отправить сообщение.",
    en: "Failed to send the message.",
    kk: "Хабарламаны жіберу мүмкін болмады.",
  },
})
