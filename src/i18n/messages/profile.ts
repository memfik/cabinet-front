import {defineNamespace} from "./types"

export default defineNamespace({
  title: {ru: "Профиль", en: "Profile", kk: "Профиль"},
  userData: {ru: "Данные пользователя", en: "User details", kk: "Пайдаланушы деректері"},
  name: {ru: "Имя", en: "Name", kk: "Аты-жөні"},
  email: {ru: "Email", en: "Email", kk: "Email"},
  login: {ru: "Логин", en: "Login", kk: "Логин"},
  position: {ru: "Должность", en: "Position", kk: "Лауазымы"},
  phone: {ru: "Телефон", en: "Phone", kk: "Телефон"},
  account: {ru: "Лицевой счёт", en: "Personal account", kk: "Жеке шот"},
  timezone: {ru: "Часовой пояс", en: "Time zone", kk: "Уақыт белдеуі"},
  changePassword: {ru: "Смена пароля", en: "Change password", kk: "Құпия сөзді өзгерту"},
  passwordChanged: {
    ru: "Пароль изменён. Остальные сессии завершены.",
    en: "Password changed. All other sessions have been signed out.",
    kk: "Құпия сөз өзгертілді. Басқа сеанстар аяқталды.",
  },
  currentPassword: {ru: "Текущий пароль", en: "Current password", kk: "Ағымдағы құпия сөз"},
  newPassword: {ru: "Новый пароль", en: "New password", kk: "Жаңа құпия сөз"},
  newPasswordHint: {
    ru: "Не короче 8 символов, должен отличаться от текущего",
    en: "At least 8 characters, must differ from the current one",
    kk: "Кемінде 8 таңба, ағымдағыдан өзгеше болуы керек",
  },
  confirmPassword: {ru: "Повтор нового пароля", en: "Confirm new password", kk: "Жаңа құпия сөзді қайталау"},
  saving: {ru: "Сохранение…", en: "Saving…", kk: "Сақталуда…"},
  submit: {ru: "Сменить пароль", en: "Change password", kk: "Құпия сөзді өзгерту"},
})
