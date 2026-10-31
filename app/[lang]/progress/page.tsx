import { Navbar } from "@/components/layout/Navbar"
import { ProgressDashboard } from "@/components/progress/ProgressDashboard"
import { isLocale } from "@/lib/i18n/locales"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale = isLocale(lang) ? lang : "en"
  return {
    ...pageMetadata(
      locale,
      "/progress",
      locale === "th"
        ? "ความคืบหน้าการฝึก | FretFlow"
        : "Practice Progress | FretFlow",
      locale === "th"
        ? "ติดตามความคืบหน้าการฝึกกีตาร์ของคุณ"
        : "Track your guitar practice progress."
    ),
    robots: { index: false, follow: true },
  }
}

export default function ProgressPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <ProgressDashboard />
      </main>
    </div>
  )
}
