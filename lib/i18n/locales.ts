export const LOCALES = ["en", "th"] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

export const isLocale = (value: string): value is Locale =>
  LOCALES.some((locale) => locale === value)

export const localePath = (locale: Locale, path = ""): string => {
  if (!path || path === "/") return `/${locale}`
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`
}
