"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { summarizeSession } from "@/lib/practice/scoring"
import {
  getCurrentStreak,
  getPracticeMinutes,
  getSkillRatings,
} from "@/lib/practice/statistics"
import { usePracticeStore } from "@/components/practice/hooks/usePracticeStore"
import { PracticeCalendar } from "./PracticeCalendar"
import { FretboardHeatmap } from "./FretboardHeatmap"
import { PersonalBests } from "./PersonalBests"
import { MasteryMilestones } from "./MasteryMilestones"
import { FretboardPathProgress } from "./FretboardPathProgress"

export function ProgressDashboard() {
  const { document, hydrated, exportData, importData } = usePracticeStore()
  const [importMessage, setImportMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const sessions = document.sessions.filter(
    (session) => session.status === "completed"
  )
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const ratings = getSkillRatings(sessions)
  const skillRows = [...new Set(ratings.map((rating) => rating.skill))]
    .map((skill) => {
      const values = ratings.filter((rating) => rating.skill === skill)
      return {
        skill,
        strength: Math.round(
          values.reduce((sum, value) => sum + value.strength, 0) / values.length
        ),
      }
    })
    .toSorted((a, b) => a.strength - b.strength)

  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = window.document.createElement("a")
    anchor.href = url
    anchor.download = "fretflow-practice.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }
  const handleImport = async (file: File | undefined) => {
    if (!file) return
    const success = importData(await file.text())
    setImportMessage(
      success
        ? "Practice data imported."
        : "That file is not valid FretFlow practice data."
    )
  }

  const summaryCards = [
    { label: "Current streak", value: `${getCurrentStreak(sessions)} days` },
    {
      label: "Last 7 days",
      value: `${getPracticeMinutes(sessions, weekAgo)} min`,
    },
    { label: "Completed", value: String(sessions.length) },
    {
      label: "Daily missions",
      value: String(sessions.filter((session) => session.challenge).length),
    },
  ]

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b pb-8">
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase">
            Practice record
          </p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
            Progress that points to the next rep.
          </h1>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            aria-label="Import FretFlow practice data"
            className="sr-only"
            type="file"
            accept="application/json"
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Import
          </Button>
          <Button variant="outline" onClick={download}>
            Export
          </Button>
        </div>
      </header>
      <p aria-live="polite" className="sr-only">
        {importMessage}
      </p>
      <dl className="grid grid-cols-2 gap-px overflow-hidden border bg-border lg:grid-cols-4">
        {summaryCards.map((item) => (
          <div key={item.label} className="bg-background p-5">
            <dt className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums">
              {hydrated ? item.value : "—"}
            </dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Practice consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <PracticeCalendar sessions={sessions} />
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Personal bests</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonalBests sessions={sessions} />
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Mastery milestones</CardTitle>
          <p className="text-sm text-muted-foreground">
            Skill evidence, not participation points. Verified marks use answers
            or timing recorded by the app.
          </p>
        </CardHeader>
        <CardContent>
          <MasteryMilestones sessions={sessions} />
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Fretboard mastery path</CardTitle>
          <p className="text-sm text-muted-foreground">
            Durable progress from verified recall, coverage, and response time.
          </p>
        </CardHeader>
        <CardContent>
          <FretboardPathProgress sessions={sessions} />
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Fretboard recall map</CardTitle>
          <p className="text-sm text-muted-foreground">
            Red positions need attention; green positions are consistently
            recalled.
          </p>
        </CardHeader>
        <CardContent>
          <FretboardHeatmap sessions={sessions} />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Skill strength</CardTitle>
          </CardHeader>
          <CardContent>
            {skillRows.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Skill ratings appear after your first answered drill.
              </p>
            ) : (
              <ul className="space-y-4">
                {skillRows.map((row) => (
                  <li key={row.skill}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize">
                        {row.skill.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="font-mono">{row.strength}/100</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${row.strength}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No completed sessions yet.
              </p>
            ) : (
              <ul className="divide-y">
                {sessions
                  .toReversed()
                  .slice(0, 6)
                  .map((session) => {
                    const summary = summarizeSession(session)
                    return (
                      <li
                        key={session.id}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{session.exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.startedAt).toLocaleDateString()} ·{" "}
                            {Math.round(session.elapsedMs / 60000)} min
                          </p>
                        </div>
                        <span className="font-mono text-sm">
                          {Math.round(summary.accuracy * 100)}%
                        </span>
                      </li>
                    )
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
