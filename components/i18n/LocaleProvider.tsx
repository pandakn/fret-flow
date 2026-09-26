"use client"

import { createContext, useContext } from "react"
import { messages, type MessageKey } from "@/lib/i18n/messages"
import type { Locale } from "@/lib/i18n/locales"

const LocaleContext = createContext<Locale>("en")

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  )
}

export function useI18n() {
  const locale = useContext(LocaleContext)
  return {
    locale,
    t: (key: MessageKey) => messages[locale][key],
  }
}
