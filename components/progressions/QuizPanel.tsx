"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import {
  getProgressionById,
  getQuizRound,
  type Progression,
  type ProgressionGenreId,
  type QuizRound,
} from "@/lib/progressions/catalog"
import { cn } from "@/lib/utils"
import { getProgressionLabelKey } from "./progressionMessages"

type QuizScore = { correct: number; total: number }

const SCORE_KEY = "progression-lab-quiz-score"

const parseScore = (raw: string | null): QuizScore => {
  try {
    const parsed = JSON.parse(raw ?? "{}") as Partial<QuizScore>
    return {
      correct: Number(parsed.correct) || 0,
      total: Number(parsed.total) || 0,
    }
  } catch {
    return { correct: 0, total: 0 }
  }
}

export function QuizPanel({
  genre,
  onPlay,
  playing,
}: {
  genre: ProgressionGenreId
  onPlay: (progression: Progression) => void
  playing: boolean
}) {
  const { t } = useI18n()
  const [round, setRound] = useState<QuizRound | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const { value: score, setValue: setScore } = useLocalStorage<QuizScore>({
    key: SCORE_KEY,
    fallback: { correct: 0, total: 0 },
    parse: parseScore,
  })

  const target = round ? getProgressionById(round.targetId) : undefined
  const answered = selectedOption !== null
  const correct = answered && selectedOption === round?.targetId

  const startRound = () => {
    const next = getQuizRound(genre, round?.targetId)
    setRound(next)
    setSelectedOption(null)
    const progression = getProgressionById(next.targetId)
    if (progression) onPlay(progression)
  }

  const answer = (optionId: string) => {
    if (!round || answered) return
    setSelectedOption(optionId)
    setScore({
      correct: score.correct + (optionId === round.targetId ? 1 : 0),
      total: score.total + 1,
    })
  }

  const optionClass = (optionId: string) => {
    if (!answered) {
      return "border-[var(--border-2)] hover:border-[var(--accent)]"
    }
    if (optionId === round?.targetId) {
      return "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
    }
    if (optionId === selectedOption) {
      return "border-[var(--destructive)] bg-[var(--destructive)]/10"
    }
    return "border-[var(--border-2)] opacity-60"
  }

  return (
    <Card className="rounded-xl border-[var(--border-2)] bg-[var(--surface2)]">
      <CardContent className="space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
            {t("quizScore")} {score.correct}/{score.total}
          </p>
          <Button type="button" onClick={startRound} className="rounded-full">
            {round ? t("quizNext") : t("quizStart")}
          </Button>
        </div>

        {round && target ? (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {round.optionIds.map((optionId) => {
                const option = getProgressionById(optionId)
                if (!option) return null
                return (
                  <Button
                    key={optionId}
                    type="button"
                    variant="outline"
                    disabled={playing || answered}
                    className={cn(
                      "h-auto justify-start rounded-lg py-3 text-left",
                      optionClass(optionId)
                    )}
                    onClick={() => answer(optionId)}
                  >
                    {t(getProgressionLabelKey(option.id))}
                  </Button>
                )
              })}
            </div>

            {answered ? (
              <div className="space-y-2 rounded-lg border border-[var(--border-2)] p-4">
                <p
                  className={cn(
                    "font-mono text-[11px] tracking-[0.14em] uppercase",
                    correct
                      ? "text-[var(--accent)]"
                      : "text-[var(--muted-foreground)]"
                  )}
                >
                  {correct ? t("quizCorrect") : t("quizIncorrect")}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {t(getProgressionLabelKey(target.id))} ·{" "}
                  {target.steps
                    .map((step) => step.romanNumeral)
                    .join(" – ")}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onPlay(target)}
                >
                  {t("quizRevealPlay")}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            {t("quizIdle")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
