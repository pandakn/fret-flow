"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { usePracticeStore } from "@/components/practice/hooks/usePracticeStore"
import { lessons, type LessonId } from "@/lib/i18n/lessons"
import { learningCopy } from "@/lib/i18n/learning"
import { localePath } from "@/lib/i18n/locales"
import { getLesson, isSkillId } from "@/lib/learning/catalog"
import { learningPracticeHref, learningReviewHref } from "@/lib/learning/links"
import { getObjectiveProgress } from "@/lib/learning/objective-progress"
import { getKeyLabel } from "@/lib/theory/spelling"

export function ObjectiveProgress({
  lessonId,
  compact = false,
  quickCheckHref,
  practiceHref,
}: {
  lessonId: LessonId
  compact?: boolean
  quickCheckHref?: string
  practiceHref?: string
}) {
  const { locale } = useI18n()
  const { document, hydrated } = usePracticeStore()
  const progress = useMemo(
    () =>
      getObjectiveProgress(document.sessions).find((item) =>
        getLesson(lessonId)?.objectiveIds.some((id) => id === item.objectiveId)
      ),
    [document.sessions, lessonId]
  )
  if (!hydrated || !progress) return null
  const copy = learningCopy[locale]
  const status =
    progress.status === "no-check"
      ? copy.noCheckYet
      : progress.status === "needs-practice"
        ? copy.needsPractice
        : copy.checkPassedStatus
  if (compact)
    return (
      <span className="mt-4 inline-flex flex-wrap gap-2 font-mono text-[11px] text-[var(--muted-foreground)]">
        <span>{status}</span>
        {progress.dueTargets.length > 0 ? (
          <span>
            · {copy.reviewDue} ({progress.dueTargets.length})
          </span>
        ) : null}
      </span>
    )

  const due = progress.dueTargets[0]
  const dueContext = due
    ? copy.dueContext
        .replace(
          "{skill}",
          isSkillId(due.skillId) ? copy.skillNames[due.skillId] : due.skillId
        )
        .replace("{key}", getKeyLabel(due.assignment.context.key))
    : null
  const dueDetail =
    due?.target.string !== undefined && due.target.fret !== undefined
      ? copy.duePosition
          .replace("{string}", String(due.target.string))
          .replace("{fret}", String(due.target.fret))
      : due?.key.startsWith("diatonic:")
        ? copy.dueDegree.replace("{degree}", due.key.split(":").at(-1) ?? "")
        : due?.target.interval
          ? copy.dueInterval.replace("{interval}", due.target.interval)
          : null
  const href = due
    ? learningReviewHref(locale, due)
    : progress.status === "check-passed"
      ? (practiceHref ??
        (progress.latestCheck
          ? learningPracticeHref(
              locale,
              progress.latestCheck.assignment,
              "guided-practice"
            )
          : null))
      : (quickCheckHref ??
        (progress.latestCheck
          ? learningPracticeHref(
              locale,
              progress.latestCheck.assignment,
              "quick-check"
            )
          : localePath(locale, `/learn/${lessonId}`)))
  const action = due
    ? copy.reviewTarget
    : progress.status === "check-passed"
      ? copy.continuePractice
      : progress.latestCheck || quickCheckHref
        ? copy.startQuickCheck
        : copy.openLesson

  return (
    <div className="space-y-3 border-l-2 border-[var(--color-root)] bg-[var(--surface2)] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs font-medium">
          {lessons[locale][lessonId].title} · {status}
        </p>
        {due ? (
          <span className="font-mono text-xs text-[var(--color-root)]">
            {copy.reviewDue} ({progress.dueTargets.length})
          </span>
        ) : null}
      </div>
      {progress.latestCheck ? (
        <p className="text-xs text-[var(--muted-foreground)]">
          {copy.latestCheck
            .replace("{correct}", String(progress.latestCheck.correct))
            .replace("{attempts}", String(progress.latestCheck.attempts))
            .replace(
              "{date}",
              new Date(progress.latestCheck.completedAt).toLocaleDateString(
                locale === "th" ? "th-TH" : "en-US"
              )
            )}
        </p>
      ) : null}
      <p className="text-xs text-[var(--muted-foreground)]">
        {copy.guidedCount.replace("{count}", String(progress.guidedSessions))} ·{" "}
        {copy.applicationCount.replace(
          "{count}",
          String(progress.applications)
        )}
      </p>
      {dueContext ? (
        <p className="text-xs text-[var(--muted-foreground)]">{dueContext}</p>
      ) : null}
      {dueDetail ? (
        <p className="text-xs text-[var(--muted-foreground)]">{dueDetail}</p>
      ) : null}
      {href ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href}>{action}</Link>
        </Button>
      ) : null}
    </div>
  )
}
