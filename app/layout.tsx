import { Space_Mono, Syne } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { PracticeProvider } from "@/components/practice/PracticeProvider"

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

export const metadata: Metadata = {
  title: "FretFlow — Guitar practice and fretboard training",
  description: "Explore guitar theory, build practice routines, and track measurable progress.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", syne.variable, spaceMono.variable)}
    >
      <body className="font-sans">
        <ThemeProvider>
          <TooltipProvider>
            <PracticeProvider>{children}</PracticeProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
