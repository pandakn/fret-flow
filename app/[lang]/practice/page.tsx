import { Navbar } from "@/components/layout/Navbar"
import { LearnPracticeEntry } from "@/components/practice/LearnPracticeEntry"
import {
  createLearnExercise,
  parseLearnPracticeParams,
} from "@/lib/learn-practice"
import { isLocale } from "@/lib/i18n/locales"
import { resolveScaleRoutePracticeRequest } from "@/lib/scale-route-practice"

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ lang }, query] = await Promise.all([params, searchParams])
  const practiceParams = parseLearnPracticeParams(query)
  const routeRequested =
    query.kind === "scaleRoute" ||
    (Array.isArray(query.kind) && query.kind.includes("scaleRoute"))
  const routeRequest = routeRequested
    ? resolveScaleRoutePracticeRequest(query)
    : null
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <LearnPracticeEntry
          key={JSON.stringify(query)}
          invalidRoute={Boolean(
            routeRequested && routeRequest && !routeRequest.ok
          )}
          reviewRequest={
            typeof query.reviewSkill === "string" &&
            typeof query.reviewKey === "string"
              ? { skillId: query.reviewSkill, key: query.reviewKey }
              : undefined
          }
          initialExercise={
            routeRequest?.ok
              ? routeRequest.value
              : routeRequested
                ? null
                : practiceParams && isLocale(lang)
                  ? createLearnExercise(practiceParams, lang)
                  : null
          }
        />
      </main>
    </div>
  )
}
