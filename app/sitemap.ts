import type { MetadataRoute } from "next"
import { LOCALES } from "@/lib/i18n/locales"
import { LESSON_IDS } from "@/lib/i18n/lessons"
import { languageAlternates, localizedUrl } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/learn",
    "/practice",
    "/progressions",
    ...LESSON_IDS.map((id) => `/learn/${id}`),
  ]
  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(locale, path),
      alternates: { languages: languageAlternates(path) },
    }))
  )
}
