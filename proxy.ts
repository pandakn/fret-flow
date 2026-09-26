import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split("/")[1]
  if (isLocale(firstSegment)) return NextResponse.next()

  const preferred = request.cookies.get("ff_locale")?.value
  const locale = preferred && isLocale(preferred) ? preferred : DEFAULT_LOCALE
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
}
