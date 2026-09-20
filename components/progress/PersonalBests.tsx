import { getPersonalBests } from "@/lib/practice/statistics"
import type { PracticeSession } from "@/types/practice"

const unit = (metric: string) => metric === "accuracy" ? "%" : metric === "bpm" ? " BPM" : ""

export function PersonalBests({ sessions }: { sessions: readonly PracticeSession[] }) {
  const bests = getPersonalBests(sessions).slice(0, 6)
  if (bests.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">Complete a session to set your first benchmark.</p>
  return <ul className="divide-y">{bests.map((best) => <li key={`${best.exerciseId}-${best.metric}`} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium">{best.exerciseName}</p><p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{best.metric.replaceAll("-", " ")} · {best.verification}</p></div><strong className="font-mono text-xl tabular-nums">{best.value}{unit(best.metric)}</strong></li>)}</ul>
}
