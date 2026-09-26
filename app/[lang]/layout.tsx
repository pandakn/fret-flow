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
        title: "FretFlow — เรียนรู้ทฤษฎีดนตรีและฝึกกีตาร์",
        description:
          "สำรวจคอกีตาร์ เรียนรู้ทฤษฎีดนตรี และฝึกซ้อมอย่างมีเป้าหมาย",
      }
    : {
        title: "FretFlow — Guitar practice and music theory",
        description:
          "Explore guitar theory, build practice routines, and track progress.",
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
