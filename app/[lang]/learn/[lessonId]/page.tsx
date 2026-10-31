import { notFound } from "next/navigation"
import { LessonStudio } from "@/components/learn/LessonStudio"
import { isLocale } from "@/lib/i18n/locales"
import { isLessonId, lessons } from "@/lib/i18n/lessons"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; lessonId: string }>
}) {
  const { lang, lessonId } = await params
  if (!isLocale(lang) || !isLessonId(lessonId)) return {}
  const lesson = lessons[lang][lessonId]
  return pageMetadata(
    lang,
    `/learn/${lessonId}`,
    `${lesson.title} | FretFlow`,
    lesson.summary
  )
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lang: string; lessonId: string }>
}) {
  const { lang, lessonId } = await params
  if (!isLocale(lang) || !isLessonId(lessonId)) notFound()
  return <LessonStudio lessonId={lessonId} />
}
