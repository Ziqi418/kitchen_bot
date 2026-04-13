import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

const messages = {
  en,
  zh
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh', // default to Chinese
  fallbackLocale: 'en',
  messages
})

export default i18n