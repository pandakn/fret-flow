"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Compass, RotateCcw, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  buildDailyMissions,
  getBestMissionSession,
  getChallengeValue,
  getMissionSessions,
  isChallengeGoalMet,
  normalizeDailyChallengeState,
} from "@/lib/practice/challenges"
import { summarizeSession } from "@/lib/practice/scoring"
import { getLocalDayKey } from "@/lib/practice/statistics"
import { cn } from "@/lib/utils"
import type { DailyMission } from "@/types/practice"
import { usePracticeStore } from "./hooks/usePracticeStore"
import { useI18n } from "@/components/i18n/LocaleProvider"
import {
  localizeChallengeGoal,
  localizeChallengeValue,
  localizePracticeText,
  practiceCopy,
} from "@/lib/i18n/practice-messages"

const SLOT_LABELS: Record<DailyMission["slot"], string> = {
  warmup: "01 · Tune-up",
  weakSpot: "02 · Weak spot",
  wildcard: "03 · Wildcard",
}

const DIFFICULTY_LABELS: Record<DailyMission["difficulty"], string> = {
  steady: "Steady",
  stretch: "Stretch",
  bold: "Bold",
}

export function DailyMissionBoard({
  onStart,
}: {
  onStart: (mission: DailyMission) => void
}) {
  const { locale } = useI18n()
  const { document, hydrated, rerollWildcard } = usePracticeStore()
  const [dayKey, setDayKey] = useState(() => getLocalDayKey(new Date()))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDayKey(getLocalDayKey(new Date()))
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const dailyState = normalizeDailyChallengeState(
    document.dailyChallengeState,
    dayKey
  )
  const missions = useMemo(
    () =>
      buildDailyMissions({
        sessions: document.sessions,
        state: dailyState,
        dayKey,
      }),
    [dailyState, dayKey, document.sessions]
  )
  const completedCount = missions.filter(
    (mission) => getMissionSessions(document.sessions, mission.id).length > 0
  ).length
  const wildcard = missions.find((mission) => mission.slot === "wildcard")
  const wildcardComplete = wildcard
    ? getMissionSessions(document.sessions, wildcard.id).length > 0
    : false

  return (
    <section aria-labelledby="daily-missions-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            {practiceCopy(locale, "Daily signal · {day}", { day: dayKey })}
          </p>
          <h2
            id="daily-missions-heading"
            className="mt-1 text-2xl font-semibold"
          >
            {practiceCopy(locale, "Three missions. One useful session.")}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex gap-1.5"
            role="img"
            aria-label={practiceCopy(locale, "{count} of 3 daily missions complete", {
              count: completedCount,
            })}
          >
            {missions.map((mission) => (
              <span
                key={mission.id}
                className={cn(
                  "h-1.5 w-9 bg-muted transition-colors motion-reduce:transition-none",
                  getMissionSessions(document.sessions, mission.id).length >
                    0 && "bg-[var(--color-root)]"
                )}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {hydrated ? `${completedCount}/3` : "—/3"}
          </span>
        </div>
      </div>

      <div className="grid gap-px overflow-hidden border bg-border lg:grid-cols-3">
        {missions.map((mission) => {
          const sessions = getMissionSessions(document.sessions, mission.id)
          const bestSession = getBestMissionSession(document.sessions, mission)
          const bestSummary = bestSession
            ? summarizeSession(bestSession)
            : undefined
          const bestValue = bestSummary
            ? getChallengeValue(bestSummary, mission.goal)
            : null
          const goalMet = bestSummary
            ? isChallengeGoalMet(bestSummary, mission.goal)
            : false
          const complete = sessions.length > 0

          return (
            <Card
              key={mission.id}
              className={cn(
                "rounded-none border-0 shadow-none",
                complete && "bg-muted/25"
              )}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.14em] uppercase">
                  <span className="text-muted-foreground">
                    {practiceCopy(locale, SLOT_LABELS[mission.slot])}
                  </span>
                  <span
                    className={cn(
                      "border px-2 py-1",
                      goalMet && "border-[var(--color-root)]"
                    )}
                  >
                    {complete
                      ? goalMet
                        ? practiceCopy(locale, "Goal cleared")
                        : practiceCopy(locale, "Attempted")
                      : practiceCopy(locale, DIFFICULTY_LABELS[mission.difficulty])}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-xl leading-tight">
                    {localizePracticeText(locale, mission.title.split(" · ").at(-1) ?? mission.title)}
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {localizePracticeText(locale, mission.description)}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3 border-y py-4 text-sm">
                  <div className="flex gap-3">
                    <Target
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="sr-only">{practiceCopy(locale, "Goal")}</p>
                      <p className="font-medium">
                        {localizeChallengeGoal(locale, mission.goal)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-muted-foreground">
                    <Compass
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="sr-only">{practiceCopy(locale, "Variation")}</p>
                      <p>{localizePracticeText(locale, mission.modifierLabel)}</p>
                    </div>
                  </div>
                </div>

                <p className="min-h-10 text-xs leading-relaxed text-muted-foreground">
                  {localizePracticeText(locale, mission.reason)}
                </p>

                {bestValue !== null ? (
                  <p
                    className="flex items-center gap-2 text-sm"
                    aria-live="polite"
                  >
                    <Check className="size-4" aria-hidden="true" />
                    {practiceCopy(locale, "Best today:")}{" "}
                    {localizeChallengeValue(
                      locale,
                      bestValue,
                      mission.goal.metric,
                      mission.goal.metric === "cleanCount"
                        ? mission.goal.label
                        : undefined
                    )}
                  </p>
                ) : (
                  <p className="font-mono text-xs text-muted-foreground">
                    {practiceCopy(locale, "about {minutes} min", { minutes: mission.durationMinutes })}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant={complete ? "outline" : "default"}
                    onClick={() => onStart(mission)}
                  >
                    {practiceCopy(locale, complete ? "Replay" : "Start mission")}
                  </Button>
                  {mission.slot === "wildcard" ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={practiceCopy(locale, "Reroll today's wildcard mission")}
                      title={practiceCopy(locale, "One wildcard reroll per day")}
                      disabled={
                        dailyState.wildcardRerolls >= 1 || wildcardComplete
                      }
                      onClick={() => rerollWildcard(dayKey)}
                    >
                      <RotateCcw aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {completedCount === 3 ? (
        <p
          className="border-l-2 border-[var(--color-root)] bg-muted/40 px-4 py-3 text-sm"
          role="status"
        >
          {practiceCopy(locale, "Daily set complete. Three different skills, one stronger practice day.")}
        </p>
      ) : null}
    </section>
  )
}
