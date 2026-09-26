import { Navbar } from "@/components/layout/Navbar"
import { LearnPracticeEntry } from "@/components/practice/LearnPracticeEntry"
import {
  createLearnExercise,
  parseLearnPracticeParams,
} from "@/lib/learn-practice"
import { isLocale } from "@/lib/i18n/locales"

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ lang }, query] = await Promise.all([params, searchParams])
  const practiceParams = parseLearnPracticeParams(query)
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <LearnPracticeEntry
          initialExercise={
            practiceParams && isLocale(lang)
              ? createLearnExercise(practiceParams, lang)
              : null
          }
        />
      </main>
    </div>
  )
}
