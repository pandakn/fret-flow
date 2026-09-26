import { getPersonalBests } from "@/lib/practice/statistics"
import type { PracticeSession } from "@/types/practice"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { localizePracticeText, practiceCopy } from "@/lib/i18n/practice-messages"

const unit = (metric: string) => metric === "accuracy" ? "%" : metric === "bpm" ? " BPM" : ""

export function PersonalBests({ sessions }: { sessions: readonly PracticeSession[] }) {
  const { locale } = useI18n()
  const bests = getPersonalBests(sessions).slice(0, 6)
  if (bests.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">{practiceCopy(locale, "Complete a session to set your first benchmark.")}</p>
  return <ul className="divide-y">{bests.map((best) => <li key={`${best.exerciseId}-${best.metric}`} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium">{localizePracticeText(locale, best.exerciseName)}</p><p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{localizePracticeText(locale, best.metric.replaceAll("-", " "))} · {localizePracticeText(locale, best.verification)}</p></div><strong className="font-mono text-xl tabular-nums">{best.value}{unit(best.metric)}</strong></li>)}</ul>
}
