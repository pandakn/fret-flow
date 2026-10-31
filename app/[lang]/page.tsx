import { Explorer } from "@/components/explorer/Explorer"
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
        "",
        "FretFlow — ฝึกกีตาร์และเรียนทฤษฎีดนตรี",
        "แผนผังคอกีตาร์แบบโต้ตอบสำหรับสเกล คอร์ด และอาร์เพจจิโอ พร้อมบทเรียนและแบบฝึกช่วยพัฒนาทักษะกีตาร์อย่างเป็นระบบ"
      )
    : pageMetadata(
        locale,
        "",
        "FretFlow — Guitar Fretboard, Scales & Practice",
        "Explore an interactive guitar fretboard for scales, chords, and arpeggios. Learn music theory with guided lessons, focused practice, and progress tracking."
      )
}

export default function FretFlowPage() {
  return <Explorer />
}
