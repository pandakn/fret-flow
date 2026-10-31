import { Space_Mono, Syne } from "next/font/google"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { PracticeProvider } from "@/components/practice/PracticeProvider"
import { LocaleProvider } from "@/components/i18n/LocaleProvider"
import { isLocale, LOCALES } from "@/lib/i18n/locales"
import { SITE_URL } from "@/lib/seo"

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-sans",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  return lang === "th"
    ? {
        metadataBase: new URL(SITE_URL),
        title: "FretFlow — ฝึกกีตาร์และเรียนทฤษฎีดนตรี",
        description:
          "แผนผังคอกีตาร์แบบโต้ตอบสำหรับสเกล คอร์ด และอาร์เพจจิโอ พร้อมบทเรียนและแบบฝึกช่วยพัฒนาทักษะกีตาร์อย่างเป็นระบบ",
        applicationName: "FretFlow",
        openGraph: {
          title: "FretFlow — ฝึกกีตาร์และเรียนทฤษฎีดนตรี",
          description:
            "สำรวจสเกล คอร์ด และอาร์เพจจิโอบนแผนผังคอกีตาร์ พร้อมบทเรียนและแบบฝึกกีตาร์",
          siteName: "FretFlow",
          type: "website",
          locale: "th_TH",
        },
        twitter: {
          card: "summary",
          title: "FretFlow — ฝึกกีตาร์และเรียนทฤษฎีดนตรี",
          description:
            "แผนผังคอกีตาร์แบบโต้ตอบ บทเรียนทฤษฎีดนตรี และแบบฝึกกีตาร์",
        },
        robots: { index: true, follow: true },
      }
    : {
        metadataBase: new URL(SITE_URL),
        title: "FretFlow — Guitar Fretboard, Scales & Practice",
        description:
          "Explore an interactive guitar fretboard for scales, chords, and arpeggios. Learn music theory with guided lessons, focused practice, and progress tracking.",
        applicationName: "FretFlow",
        openGraph: {
          title: "FretFlow — Guitar Fretboard, Scales & Practice",
          description:
            "Explore guitar scales, chords, and arpeggios on an interactive fretboard, then build skills with guided lessons and practice.",
          siteName: "FretFlow",
          type: "website",
          locale: "en_US",
        },
        twitter: {
          card: "summary",
          title: "FretFlow — Guitar Fretboard, Scales & Practice",
          description:
            "Interactive guitar fretboard, music theory lessons, and focused practice tools.",
        },
        robots: { index: true, follow: true },
      }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={cn("antialiased", syne.variable, spaceMono.variable)}
    >
      <body className="font-sans">
        <ThemeProvider>
          <TooltipProvider>
            <LocaleProvider locale={lang}>
              <PracticeProvider>{children}</PracticeProvider>
            </LocaleProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
