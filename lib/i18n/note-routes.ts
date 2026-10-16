import type { Locale } from "@/lib/i18n/locales"
import type { ScaleRouteSnapshot } from "@/types/note-routes"

const en = {
  title: "Guided routes",
  scaleMajor: "major pentatonic",
  scaleMinor: "minor pentatonic",
  shapeA: "Shape A",
  shapeB: "Shape B",
  connection: "Connection",
  ascending: "Ascending",
  descending: "Descending",
  chooseShape: "Route",
  routeStudy: "Study the route",
  routeCheck: "Route check",
  practiceRoute: "Practice this route",
  saveRoute: "Save route",
  selectPair: "Neighboring pentatonic boxes",
  fretRange: "Frets {min} to {max}",
  start: "Start",
  ending: "Ending",
  shift: "Position shift",
  shared: "Shared location",
  step: "Step {step}",
  fretValue: "fret {fret}",
  play: "Play",
  stop: "Stop",
  restart: "Restart from beginning",
  tempo: "Tempo",
  loop: "Loop",
  bpm: "{bpm} BPM",
  countIn: "Count-in beat {beat} of 4",
  loading: "Loading guitar sound",
  audioError: "Guitar sound could not load. Visual study still works.",
  retryAudio: "Retry audio",
  fretboardRegion: "Guided route fretboard",
  string: "String {string}",
  candidate: "String {string}, fret {fret}",
  studyCell:
    "String {string}, fret {fret}, {note}, {interval}, route steps {steps}",
  keyboardHelp:
    "Use arrow keys to move between fretboard locations. Press Enter or Space to choose a location.",
  checkIntro:
    "Find the next taught string and fret. Other notes are not accepted as the route location.",
  hintShown: "Hint: the next route location is string {string}, fret {fret}.",
  invalidRoute:
    "This saved route cannot be read. Your history remains preserved.",
  notReported: "not reported",
  current: "Current location: string {string}, fret {fret}",
  findNext: "Choose the next location on the fretboard.",
  hint: "Show hint",
  correct: "Correct route location.",
  exact: "That is the same route location.",
  samePitch: "That is the same pitch in a different register.",
  sameNote: "That note occurs elsewhere, but at a different pitch.",
  scaleTone:
    "That is another note in this pentatonic scale, not the next route location.",
  outsideScale: "That note is outside the selected pentatonic scale.",
  next: "Next transition",
  guitarPractice: "Practice on guitar",
  guitarIntro:
    "Follow the same route on your guitar. Audio does not measure your playing.",
  practiced: "I practiced this route",
  skipped: "Skip guitar practice",
  selfReported: "Guitar participation is self-reported.",
  summary: "Guided route result",
  firstAccuracy: "Unassisted first-answer accuracy",
  unavailable: "Unavailable. No unassisted first answers were recorded.",
  assisted: "Assisted first answers",
  retries: "Retry submissions",
  missed: "Missed transitions",
  answered: "Transitions answered",
  total: "Transitions in this check",
  participation: "Self-reported guitar practice",
  repeatMissed: "Revisit missed transitions",
  repeatAll: "Repeat full route check",
  done: "Done",
  partial: "Partial route check",
  noMisses: "No missed transitions.",
  begin: "Begin the route check",
  positionLinks: "Position links",
  shiftHint: "The connection shifts two frets on the G string.",
  sharedExplanation:
    "These shapes share several locations. This connection crosses at the shared G-string note, then shifts two frets.",
  storageIssue:
    "Practice storage is read-only because the saved data could not be safely loaded or written. The original data has not been replaced. Import a valid practice export to recover.",
} as const
const th: { [K in keyof typeof en]: string } = {
  title: "เส้นทางฝึกแบบมีคำแนะนำ",
  scaleMajor: "เพนทาโทนิกเมเจอร์",
  scaleMinor: "เพนทาโทนิกไมเนอร์",
  shapeA: "รูปแบบ A",
  shapeB: "รูปแบบ B",
  connection: "เส้นทางเชื่อม",
  ascending: "ไล่ขึ้น",
  descending: "ไล่ลง",
  chooseShape: "เส้นทาง",
  routeStudy: "ศึกษาเส้นทาง",
  routeCheck: "ทดสอบเส้นทาง",
  practiceRoute: "ฝึกเส้นทางนี้",
  saveRoute: "บันทึกเส้นทาง",
  selectPair: "กล่องเพนทาโทนิกที่อยู่ติดกัน",
  fretRange: "เฟรต {min} ถึง {max}",
  start: "จุดเริ่ม",
  ending: "จุดจบ",
  shift: "เลื่อนตำแหน่ง",
  shared: "ตำแหน่งร่วม",
  step: "ขั้นที่ {step}",
  fretValue: "เฟรต {fret}",
  play: "เล่น",
  stop: "หยุด",
  restart: "เริ่มใหม่จากต้นทาง",
  tempo: "ความเร็ว",
  loop: "เล่นวน",
  bpm: "{bpm} BPM",
  countIn: "นับจังหวะ {beat} จาก 4",
  loading: "กำลังโหลดเสียงกีตาร์",
  audioError: "โหลดเสียงกีตาร์ไม่ได้ แต่ยังศึกษาเส้นทางด้วยภาพได้",
  retryAudio: "ลองเสียงอีกครั้ง",
  fretboardRegion: "เฟรตบอร์ดเส้นทางฝึก",
  string: "สาย {string}",
  candidate: "สาย {string} เฟรต {fret}",
  studyCell:
    "สาย {string} เฟรต {fret} โน้ต {note} ช่วงเสียง {interval} ขั้นเส้นทาง {steps}",
  keyboardHelp:
    "ใช้ปุ่มลูกศรเพื่อเลื่อนไปตามตำแหน่งบนเฟรตบอร์ด กด Enter หรือ Space เพื่อเลือกตำแหน่ง",
  checkIntro:
    "หาสายและเฟรตถัดไปตามเส้นทางที่เรียน ตำแหน่งโน้ตอื่นใช้แทนตำแหน่งในเส้นทางไม่ได้",
  hintShown: "คำใบ้: ตำแหน่งเส้นทางถัดไปคือสาย {string} เฟรต {fret}",
  invalidRoute: "อ่านเส้นทางที่บันทึกไว้นี้ไม่ได้ ประวัติของคุณยังคงอยู่",
  notReported: "ไม่ได้รายงาน",
  current: "ตำแหน่งปัจจุบัน: สาย {string} เฟรต {fret}",
  findNext: "เลือกตำแหน่งถัดไปบนเฟรตบอร์ด",
  hint: "แสดงคำใบ้",
  correct: "ตำแหน่งเส้นทางถูกต้อง",
  exact: "ตำแหน่งเส้นทางถูกต้อง",
  samePitch: "เป็นเสียงเดียวกันแต่อยู่คนละช่วงเสียง",
  sameNote: "เป็นโน้ตเดียวกันที่ตำแหน่งอื่น แต่ระดับเสียงต่างกัน",
  scaleTone: "เป็นโน้ตอื่นในเพนทาโทนิก ไม่ใช่ตำแหน่งถัดไปของเส้นทาง",
  outsideScale: "โน้ตนี้อยู่นอกเพนทาโทนิกที่เลือก",
  next: "ไปยังช่วงถัดไป",
  guitarPractice: "ฝึกกับกีตาร์",
  guitarIntro:
    "เล่นตามเส้นทางเดียวกันบนกีตาร์ เสียงในแอปไม่ได้ตรวจวัดการเล่นของคุณ",
  practiced: "ฉันฝึกเส้นทางนี้แล้ว",
  skipped: "ข้ามการฝึกกีตาร์",
  selfReported: "การฝึกกีตาร์เป็นข้อมูลที่ผู้ใช้แจ้งเอง",
  summary: "ผลเส้นทางฝึก",
  firstAccuracy: "ความแม่นยำของคำตอบแรกที่ไม่มีคำใบ้",
  unavailable: "ไม่มีข้อมูล เนื่องจากไม่มีคำตอบแรกที่ไม่ได้รับความช่วยเหลือ",
  assisted: "คำตอบแรกที่มีคำใบ้",
  retries: "จำนวนครั้งที่ลองใหม่",
  missed: "ช่วงเส้นทางที่ตอบผิด",
  answered: "ช่วงเส้นทางที่ตอบแล้ว",
  total: "ช่วงทั้งหมดในการทดสอบนี้",
  participation: "การฝึกกีตาร์ที่ผู้ใช้แจ้งเอง",
  repeatMissed: "ทบทวนช่วงที่ตอบผิด",
  repeatAll: "ทดสอบเส้นทางทั้งหมดอีกครั้ง",
  done: "เสร็จสิ้น",
  partial: "ทดสอบเส้นทางบางส่วน",
  noMisses: "ไม่มีช่วงที่ตอบผิด",
  begin: "เริ่มทดสอบเส้นทาง",
  positionLinks: "เชื่อมตำแหน่ง",
  shiftHint: "เส้นทางเชื่อมเลื่อนสองเฟรตบนสาย G",
  sharedExplanation:
    "รูปแบบทั้งสองมีตำแหน่งร่วมกันหลายจุด เส้นทางนี้ผ่านโน้ตร่วมบนสาย G แล้วเลื่อนสองเฟรต",
  storageIssue:
    "พื้นที่จัดเก็บข้อมูลฝึกซ้อมเป็นแบบอ่านอย่างเดียว เพราะไม่สามารถโหลดหรือบันทึกข้อมูลเดิมได้อย่างปลอดภัย ข้อมูลต้นฉบับยังไม่ถูกเขียนทับ นำเข้าไฟล์สำรองข้อมูลที่ถูกต้องเพื่อกู้คืน",
}
export const noteRouteCopy = { en, th } satisfies Record<
  Locale,
  { [K in keyof typeof en]: string }
>

export function routeText(
  locale: Locale,
  key: keyof typeof en,
  values: Record<string, string | number> = {}
): string {
  return noteRouteCopy[locale][key].replace(/\{(\w+)\}/g, (_, name: string) =>
    String(values[name] ?? "")
  )
}
export function getScaleRouteDisplayText(
  snapshot: ScaleRouteSnapshot,
  locale: Locale
) {
  const scale = routeText(
    locale,
    snapshot.selection.scaleId === "pentatonic_minor"
      ? "scaleMinor"
      : "scaleMajor"
  )
  return {
    name: `${snapshot.selection.root} ${scale}`,
    description: routeText(locale, "routeStudy"),
  }
}
