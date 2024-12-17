import { currentLocale, Locale } from './config'

const dictionaries = {
  ja: () => import('./ja.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale = currentLocale) => dictionaries[locale]?.() ?? dictionaries.ja()
