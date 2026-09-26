import { cn } from "@/lib/utils"
import type { PracticeSession } from "@/types/practice"
import { getLocalDayKey } from "@/lib/practice/statistics"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { practiceCopy } from "@/lib/i18n/practice-messages"

export function PracticeCalendar({ sessions }: { sessions: readonly PracticeSession[] }) {
  const { locale } = useI18n()
  const minutesByDay = new Map<string, number>()
  sessions.forEach((session) => {
    const key = getLocalDayKey(session.startedAt)
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + session.elapsedMs / 60000)
  })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Array.from({ length: 28 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (27 - index))
    const key = getLocalDayKey(date)
    return { key, date, minutes: Math.round(minutesByDay.get(key) ?? 0) }
  })

  return (
    <div>
      <div className="grid grid-cols-7 gap-2" role="list" aria-label={practiceCopy(locale, "Last 28 practice days")}>
        {days.map((day) => (
          <div
            key={day.key}
            role="listitem"
            title={`${day.date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US")}: ${day.minutes} ${practiceCopy(locale, "minutes")}`}
            aria-label={practiceCopy(locale, "{date}, {minutes} minutes practiced", {
              date: day.date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US"),
              minutes: day.minutes,
            })}
            className={cn(
              "aspect-square min-h-8 border",
              day.minutes === 0 && "bg-muted/30",
              day.minutes > 0 && day.minutes < 10 && "bg-[var(--color-deg4)]/25",
              day.minutes >= 10 && day.minutes < 20 && "bg-[var(--color-deg4)]/55",
              day.minutes >= 20 && "bg-[var(--color-deg4)]"
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 font-mono text-[10px] text-muted-foreground">
        <span>{practiceCopy(locale, "Less")}</span><span className="size-3 border bg-muted/30" /><span className="size-3 bg-[var(--color-deg4)]/25" /><span className="size-3 bg-[var(--color-deg4)]/55" /><span className="size-3 bg-[var(--color-deg4)]" /><span>{practiceCopy(locale, "More")}</span>
      </div>
    </div>
  )
}
