import type { Metadata } from "next"
import { LOCALES, localePath, type Locale } from "@/lib/i18n/locales"

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://fret-flow.heykeem.com").replace(/\/+$/, "")

export function localizedUrl(locale: Locale, path = "") {
  return `${SITE_URL}${localePath(locale, path)}`
}

export function languageAlternates(path = "") {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, localizedUrl(locale, path)])
  )
}

export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string
): Metadata {
  const url = localizedUrl(locale, path)
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url,
      siteName: "FretFlow",
      type: "website",
      locale: locale === "th" ? "th_TH" : "en_US",
    },
    twitter: { card: "summary", title, description },
  }
}
