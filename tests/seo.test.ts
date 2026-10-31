import assert from "node:assert/strict"
import { describe, test } from "node:test"
import sitemap from "../app/sitemap"
import robots from "../app/robots"
import { LESSON_IDS } from "../lib/i18n/lessons"
import { languageAlternates, pageMetadata, SITE_URL } from "../lib/seo"

describe("SEO metadata", () => {
  test("uses self-referencing canonicals and reciprocal language URLs", () => {
    const path = "/learn/intervals"
    const languages = languageAlternates(path)
    for (const locale of ["en", "th"] as const) {
      const metadata = pageMetadata(locale, path, "Title", "Description")
      assert.equal(metadata.alternates?.canonical, `${SITE_URL}/${locale}${path}`)
      assert.deepEqual(metadata.alternates?.languages, languages)
    }
  })

  test("sitemap contains both locales for public pages and lessons", () => {
    const entries = sitemap()
    assert.equal(entries.length, 2 * (4 + LESSON_IDS.length))
    assert.ok(entries.some((entry) => entry.url === `${SITE_URL}/th/learn/intervals`))
    assert.ok(entries.every((entry) => !entry.url.endsWith("/progress")))
    assert.deepEqual(robots().sitemap, `${SITE_URL}/sitemap.xml`)
  })
})
