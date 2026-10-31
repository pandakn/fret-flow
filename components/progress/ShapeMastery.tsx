"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePracticeStore } from "@/components/practice/hooks/usePracticeStore"
import { useI18n } from "@/components/i18n/LocaleProvider"
import {
  CIRCLE_KEYS,
  KEY_LABELS,
  SHAPE_GROUPS,
  dailyShapeChallenge,
  masteryKey,
  type ShapeGroup,
} from "@/lib/practice/shape-mastery"
import { getCagedMajorShapes } from "@/lib/theory/caged"
import { getLocalDayKey } from "@/lib/practice/statistics"
import { cn } from "@/lib/utils"

export function ShapeMastery() {
  const { locale } = useI18n()
  const th = locale === "th"
  const { document, hydrated, storageError, setShapeMastery } =
    usePracticeStore()
  const [group, setGroup] = useState<ShapeGroup>("caged")
  const [quality, setQuality] = useState("major")
  const [challenge, setChallenge] =
    useState<ReturnType<typeof dailyShapeChallenge>>()
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [result, setResult] = useState<"correct" | "incorrect">()
  const mastery = document.shapeMastery ?? {}
  const suggested = dailyShapeChallenge(mastery, getLocalDayKey(new Date()))
  const labels = {
    caged: "CAGED",
    scale: th ? "สเกล" : "Scale",
    triad: "Triad",
  }
  const statusLabels = th
    ? ["ยังไม่ฝึก", "กำลังฝึก", "คล่องแล้ว"]
    : ["Not started", "Learning", "Mastered"]
  const disabled = !hydrated || !!storageError
  const position =
    challenge &&
    getCagedMajorShapes(challenge.key, { min: 0, max: 15 }).find(
      (item) => item.shape === challenge.shape
    )
  const check = () => {
    if (!challenge || !position) return
    const correct = position.frets.every(
      (fret, string) => (selected[string] ?? null) === fret
    )
    setResult(correct ? "correct" : "incorrect")
    const id = masteryKey("caged", challenge.shape, challenge.key)
    if (!correct || mastery[id]?.status !== "mastered")
      setShapeMastery(id, "learning")
  }
  return (
    <section aria-labelledby="shape-mastery-heading" className="space-y-4">
      <div>
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Shape × key
        </p>
        <h2 id="shape-mastery-heading" className="mt-1 text-2xl font-semibold">
          {th ? "แผนที่ฝึกทุกคีย์" : "Shape mastery map"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {th
            ? "ประเมินตัวเองในแต่ละช่อง เป้าหมายคือวางรูปได้ภายใน 3 วินาที"
            : "Track your own assessment in each cell. Aim to find each shape within 3 seconds."}
        </p>
      </div>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {th
              ? "โจทย์วันนี้ · CAGED major"
              : "Today's challenge · CAGED major"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {th
              ? "เลือกจากช่องที่ยังไม่ฝึกก่อน แล้วทบทวนช่องที่เก่าที่สุด"
              : "Prioritizes unpracticed cells, then the oldest review."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!challenge ? (
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-lg font-medium">
                {suggested.shape}-shape ·{" "}
                {KEY_LABELS[CIRCLE_KEYS.indexOf(suggested.key)]}
              </p>
              <Button
                disabled={disabled}
                onClick={() => {
                  setChallenge(suggested)
                  setSelected({})
                  setResult(undefined)
                }}
              >
                {th ? "เริ่มโจทย์" : "Start challenge"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-medium">
                {th ? "วาง" : "Place"} {challenge.shape}-shape ·{" "}
                {KEY_LABELS[CIRCLE_KEYS.indexOf(challenge.key)]} major
              </p>
              <p className="text-sm text-muted-foreground">
                {th
                  ? "เลือกหนึ่งเฟรตต่อสาย เว้นสายที่ไม่เล่น ใช้รูปตำแหน่งต่ำสุดในช่วงเฟรต 0–15"
                  : "Select one fret per sounding string; leave muted strings empty. Use the lowest complete shape within frets 0–15."}
              </p>
              <div className="overflow-x-auto">
                <div className="min-w-[700px] space-y-1">
                  {[5, 4, 3, 2, 1, 0].map((string) => (
                    <div
                      key={string}
                      className="grid grid-cols-[2rem_repeat(16,minmax(0,1fr))] gap-1"
                    >
                      <span className="self-center font-mono text-xs">
                        {6 - string}
                      </span>
                      {Array.from({ length: 16 }, (_, fret) => (
                        <button
                          key={fret}
                          type="button"
                          aria-label={`${th ? "สาย" : "String"} ${6 - string}, ${th ? "เฟรต" : "fret"} ${fret}`}
                          aria-pressed={selected[string] === fret}
                          onClick={() =>
                            setSelected((current) => {
                              const next = { ...current }
                              if (next[string] === fret) delete next[string]
                              else next[string] = fret
                              return next
                            })
                          }
                          className={cn(
                            "h-8 border text-xs hover:bg-muted focus-visible:outline-2",
                            selected[string] === fret &&
                              "border-foreground bg-foreground text-background"
                          )}
                        >
                          {fret}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button disabled={disabled || !position} onClick={check}>
                  {th ? "ตรวจคำตอบ" : "Check shape"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setChallenge(undefined)
                    setResult(undefined)
                  }}
                >
                  {th ? "โจทย์อื่น" : "Another challenge"}
                </Button>
                <span role="status" className="text-sm">
                  {result === "correct"
                    ? th
                      ? "ถูกต้อง"
                      : "Correct"
                    : result === "incorrect"
                      ? th
                        ? "ยังไม่ตรง ลองอีกครั้ง"
                        : "Not quite. Try again."
                      : ""}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SHAPE_GROUPS) as ShapeGroup[]).map((item) => (
          <Button
            key={item}
            variant={group === item ? "default" : "outline"}
            onClick={() => setGroup(item)}
          >
            {labels[item]}
          </Button>
        ))}
        {group === "triad" &&
          ["major", "minor", "diminished", "augmented"].map((item) => (
            <Button
              key={item}
              size="sm"
              variant={quality === item ? "secondary" : "ghost"}
              onClick={() => setQuality(item)}
            >
              {item}
            </Button>
          ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {th
          ? "○ ยังไม่ฝึก · ◐ กำลังฝึก · ● คล่องแล้ว · กดช่องเพื่อเปลี่ยนสถานะ"
          : "○ Not started · ◐ Learning · ● Mastered · Select a cell to change its status"}
      </p>
      <div className="overflow-x-auto border">
        <table className="w-full min-w-[760px] border-collapse text-center text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th scope="col" className="p-3 text-left">
                {th ? "รูป / ความคืบหน้า" : "Shape / progress"}
              </th>
              {KEY_LABELS.map((key) => (
                <th key={key} scope="col" className="p-2 font-mono text-xs">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHAPE_GROUPS[group].map((shape) => {
              const count = CIRCLE_KEYS.filter(
                (key) =>
                  mastery[masteryKey(group, shape, key, quality)]?.status ===
                  "mastered"
              ).length
              return (
                <tr key={shape} className="border-t">
                  <th
                    scope="row"
                    className="p-3 text-left font-medium whitespace-nowrap"
                  >
                    {group === "caged"
                      ? `${shape}-shape`
                      : group === "scale"
                        ? `${th ? "ตำแหน่ง" : "Position"} ${shape}`
                        : shape}{" "}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {Math.round((count / 12) * 100)}%
                    </span>
                  </th>
                  {CIRCLE_KEYS.map((key, index) => {
                    const id = masteryKey(group, shape, key, quality)
                    const status = mastery[id]?.status
                    const statusIndex =
                      status === "mastered" ? 2 : status === "learning" ? 1 : 0
                    return (
                      <td key={key} className="p-1">
                        <button
                          type="button"
                          disabled={disabled}
                          aria-label={`${shape}, ${KEY_LABELS[index]}: ${statusLabels[statusIndex]}`}
                          title={`${KEY_LABELS[index]}: ${statusLabels[statusIndex]}`}
                          onClick={() =>
                            setShapeMastery(
                              id,
                              status === undefined
                                ? "learning"
                                : status === "learning"
                                  ? "mastered"
                                  : undefined
                            )
                          }
                          className={cn(
                            "size-9 border text-lg hover:border-foreground focus-visible:outline-2 disabled:opacity-50",
                            status === "learning" && "bg-muted",
                            status === "mastered" &&
                              "border-[var(--color-root)] bg-[var(--color-root)] text-black"
                          )}
                        >
                          {["○", "◐", "●"][statusIndex]}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        {th
          ? "ฝึกทีละรูปตามลำดับในตาราง แล้วสัปดาห์ละครั้งเลือกหนึ่งคีย์ไล่ทุกรูป เริ่มหา root บนสาย 6 และ 5 ก่อน"
          : "Work across one row in circle-of-fourths order. Once a week, work down one key. Find the root on strings 6 and 5 first."}
      </p>
    </section>
  )
}
