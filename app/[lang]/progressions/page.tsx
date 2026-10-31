import { notFound } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { ProgressionLab } from "@/components/progressions/ProgressionLab"
import { isLocale } from "@/lib/i18n/locales"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : "en"
  return locale === "th"
    ? pageMetadata(
        locale,
        "/progressions",
        "ฝึกคอร์ดโปรเกรสชัน | FretFlow",
        "สำรวจและฝึกคอร์ดโปรเกรสชันบนคอกีตาร์"
      )
    : pageMetadata(
        locale,
        "/progressions",
        "Guitar Chord Progressions | FretFlow",
        "Explore and practice chord progressions on the guitar fretboard."
      )
}

export default async function ProgressionsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <ProgressionLab />
      </main>
    </div>
  )
}
