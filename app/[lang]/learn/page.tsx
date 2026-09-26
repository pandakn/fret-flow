import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Card } from "@/components/ui/card"
import { isLocale, localePath } from "@/lib/i18n/locales"
import { messages } from "@/lib/i18n/messages"
import { LESSON_IDS, lessons } from "@/lib/i18n/lessons"

export default async function LearnPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = messages[lang]

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 font-mono text-xs tracking-[0.22em] text-[var(--accent)] uppercase">
            FretFlow / {t.musicTheory}
          </p>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
            {t.learnTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
            {t.learnIntro}
          </p>
          <div className="mt-7 flex flex-wrap gap-2 font-mono text-[10px] tracking-[0.08em] uppercase">
            {[t.learnStep, t.visualizeStep, t.hearStep, t.practiceStep].map(
              (step, index) => (
                <span
                  key={step}
                  className="rounded-full border border-[var(--border-2)] px-3 py-1.5"
                >
                  {String(index + 1).padStart(2, "0")} {step}
                </span>
              )
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {LESSON_IDS.map((id) => {
            const lesson = lessons[lang][id]
            return (
              <Card
                key={id}
                className="group rounded-xl border-[var(--border-2)] bg-[var(--surface2)] p-0 transition-colors hover:border-[var(--accent)]"
              >
                <Link
                  href={localePath(lang, `/learn/${id}`)}
                  className="block h-full p-6 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:p-7"
                  aria-label={`${t.startLesson}: ${lesson.title}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.15em] text-[var(--accent)] uppercase">
                        {lesson.eyebrow}
                      </p>
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                        {lesson.title}
                      </h2>
                    </div>
                    <ArrowUpRight
                      className="mt-1 size-5 shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                    {lesson.summary}
                  </p>
                </Link>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
