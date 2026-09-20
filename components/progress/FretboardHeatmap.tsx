import { cn } from "@/lib/utils"
import type { PracticeSession } from "@/types/practice"

export function FretboardHeatmap({ sessions }: { sessions: readonly PracticeSession[] }) {
  const positions = new Map<string, { correct: number; total: number }>()
  sessions.forEach((session) => session.attempts.forEach((attempt) => {
    const { string, fret } = attempt.target
    if (string === undefined || fret === undefined) return
    const key = `${string}-${fret}`
    const current = positions.get(key) ?? { correct: 0, total: 0 }
    current.total += 1
    current.correct += attempt.correct ? 1 : 0
    positions.set(key, current)
  }))

  return (
    <div
      className="overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label="Scrollable fretboard recall heatmap"
    >
      <div className="min-w-[680px]">
        <div className="mb-2 grid grid-cols-[32px_repeat(13,1fr)] gap-1 font-mono text-[9px] text-muted-foreground">
          <span />{Array.from({ length: 13 }, (_, fret) => <span key={fret} className="text-center">{fret}</span>)}
        </div>
        <div className="space-y-1">
          {Array.from({ length: 6 }, (_, visualString) => {
            const string = 5 - visualString
            return <div key={string} className="grid grid-cols-[32px_repeat(13,1fr)] gap-1"><span className="self-center font-mono text-[9px] text-muted-foreground">S{6 - string}</span>{Array.from({ length: 13 }, (_, fret) => {
              const value = positions.get(`${string}-${fret}`)
              const accuracy = value ? value.correct / value.total : null
              return <span key={fret} title={value ? `String ${string + 1}, fret ${fret}: ${Math.round((accuracy ?? 0) * 100)}%` : `String ${string + 1}, fret ${fret}: not practiced`} className={cn("h-6 border", accuracy === null && "bg-muted/25", accuracy !== null && accuracy < 0.5 && "bg-[var(--destructive)]/70", accuracy !== null && accuracy >= 0.5 && accuracy < 0.8 && "bg-[var(--color-root)]/55", accuracy !== null && accuracy >= 0.8 && "bg-[var(--color-deg4)]/70")} />
            })}</div>
          })}
        </div>
      </div>
    </div>
  )
}
