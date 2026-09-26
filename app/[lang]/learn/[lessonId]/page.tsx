import { notFound } from "next/navigation"
import { LessonStudio } from "@/components/learn/LessonStudio"
import { isLocale } from "@/lib/i18n/locales"
import { isLessonId } from "@/lib/i18n/lessons"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lang: string; lessonId: string }>
}) {
  const { lang, lessonId } = await params
  if (!isLocale(lang) || !isLessonId(lessonId)) notFound()
  return <LessonStudio lessonId={lessonId} />
}
