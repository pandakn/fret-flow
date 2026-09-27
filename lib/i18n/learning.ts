import type { Locale } from "./locales"
import type { ExerciseTemplateId, SkillId } from "@/lib/learning/catalog"

type LearningCopy = {
  quickCheck: string
  guidedPractice: string
  review: string
  checkIntro: string
  checkPassed: string
  checkRetry: string
  lessonSuggestion: string
  lessonSuggestionReason: string
  selfReportedReason: string
  continuePractice: string
  createPrompt: string
  createPrompts: Partial<Record<SkillId, string>>
  createDone: string
  createAgain: string
  createRecorded: string
  verifiedLabel: string
  selfReportedLabel: string
  skillEvidence: string
  objectiveProgress: string
  noCheckYet: string
  needsPractice: string
  checkPassedStatus: string
  reviewDue: string
  latestCheck: string
  guidedCount: string
  applicationCount: string
  startQuickCheck: string
  openLesson: string
  reviewTarget: string
  dueContext: string
  duePosition: string
  dueDegree: string
  dueInterval: string
  countIn: string
  countInBeat: string
  changeEveryBar: string
  beatOfBar: string
  guidedTempo: string
  decreaseTempo: string
  increaseTempo: string
  groovePrompt: string
  skillNames: Record<SkillId, string>
  names: Record<ExerciseTemplateId, string>
  descriptions: Record<ExerciseTemplateId, string>
}

export const learningCopy: Record<Locale, LearningCopy> = {
  en: {
    quickCheck: "Quick Check",
    guidedPractice: "Guided practice",
    review: "Review",
    checkIntro: "Answer a few questions to check this skill.",
    checkPassed: "You are ready to practice this skill.",
    checkRetry: "Review this idea, then try another short check.",
    lessonSuggestion: "Review the lesson",
    lessonSuggestionReason:
      "Recent answers suggest this skill needs another look.",
    selfReportedReason:
      "Your recent practice reports suggest this lesson may help.",
    continuePractice: "Continue to practice",
    createPrompt:
      "Make four bars of music using this idea. Play freely, then reflect on what you tried.",
    createPrompts: {
      "interval.construct":
        "Make a four-bar melody in {key}. Use an interval from the drill, then answer it with a different phrase.",
      "triad.construct":
        "Make a four-bar phrase in {key} using notes from the triad you built.",
      "fretboard.root.locate":
        "Play four bars in {key}. Start and finish phrases on roots in different positions.",
      "diatonic.chord.identify":
        "Play four bars in {key} using two chords from the key. Listen to where each chord wants to go.",
      "progression.change":
        "Play four bars in {key}. Change chords each bar, then vary the rhythm.",
      "seventh.construct":
        "Make a four-bar phrase in {key} using the notes of a seventh chord.",
    },
    createDone: "I tried it",
    createAgain: "Try again later",
    createRecorded:
      "Musical application recorded. It does not change your drill score.",
    verifiedLabel: "Checked by the app",
    selfReportedLabel: "Includes self reports",
    skillEvidence: "Skill evidence",
    objectiveProgress: "Lesson progress",
    noCheckYet: "No check yet",
    needsPractice: "Needs practice",
    checkPassedStatus: "Quick Check passed",
    reviewDue: "Review due",
    latestCheck: "Latest check: {correct}/{attempts} · {date}",
    guidedCount: "Guided sessions: {count}",
    applicationCount: "Grooves tried: {count}",
    startQuickCheck: "Take Quick Check",
    openLesson: "Open lesson",
    reviewTarget: "Review due target",
    dueContext: "{skill} · key {key}",
    duePosition: "string {string}, fret {fret}",
    dueDegree: "degree {degree}",
    dueInterval: "interval {interval}",
    countIn: "Count in: one bar, then change chords each bar.",
    countInBeat: "Count in · {beat} of 4",
    changeEveryBar:
      "Play {chord} in this bar. Prepare {next} for the next bar.",
    beatOfBar: "Beat {beat} of 4",
    guidedTempo: "Tempo: {bpm} BPM",
    decreaseTempo: "Decrease tempo",
    increaseTempo: "Increase tempo",
    groovePrompt:
      "Play four bars: {first}, {second}, {first}, {second}. Change on beat one, then try a different strumming pattern.",
    skillNames: {
      "interval.construct": "Build intervals",
      "triad.construct": "Build triads",
      "fretboard.root.locate": "Find root notes",
      "diatonic.chord.identify": "Find chords in a key",
      "progression.change": "Change progression chords",
      "chord.transition": "Change chords cleanly",
      "seventh.construct": "Build seventh chords",
      "fretboard.note.locate": "Find fretboard notes",
      "fretboard.interval.locate": "Find intervals on the fretboard",
      "ear.interval.recognize": "Recognize intervals by ear",
      "rhythm.pulse": "Keep the pulse",
      "technique.tempo": "Play cleanly at tempo",
      "technique.control": "Control playing technique",
      "position.connect": "Connect positions",
      "music.phrase.create": "Create a musical phrase",
    },
    names: {
      "interval-construction": "Build intervals",
      "triad-construction": "Build triads",
      "caged-root-recall": "Find CAGED roots",
      "diatonic-identification": "Find chords in a key",
      "progression-changes": "Play progression changes",
      "seventh-construction": "Build seventh chords",
      "note-recall": "Find fretboard notes",
      "interval-recall": "Find fretboard intervals",
      "interval-ear": "Hear intervals",
      pulse: "Keep the pulse",
      tempo: "Build clean tempo",
      technique: "Practice technique",
      "position-connection": "Connect positions",
    },
    descriptions: {
      "interval-construction":
        "Identify notes at a chosen interval above the root.",
      "triad-construction": "Identify the tones in a triad.",
      "caged-root-recall": "Find root notes in this fret range.",
      "diatonic-identification":
        "Identify chords built on degrees of the major key.",
      "progression-changes":
        "Change cleanly between chords in the progression.",
      "seventh-construction": "Identify the tones in a seventh chord.",
      "note-recall": "Find notes across the fretboard.",
      "interval-recall": "Find intervals above a chosen root.",
      "interval-ear": "Identify intervals by ear.",
      pulse: "Tap steadily with the beat.",
      tempo: "Build speed in clean steps.",
      technique: "Repeat a controlled technique at tempo.",
      "position-connection": "Connect scale positions.",
    },
  },
  th: {
    quickCheck: "เช็กความเข้าใจ",
    guidedPractice: "ฝึกแบบมีแนวทาง",
    review: "ทบทวน",
    checkIntro: "ตอบคำถามสั้น ๆ เพื่อเช็กทักษะนี้",
    checkPassed: "พร้อมฝึกทักษะนี้ต่อแล้ว",
    checkRetry: "ทบทวนบทเรียน แล้วลองเช็กอีกครั้ง",
    lessonSuggestion: "ทบทวนบทเรียน",
    lessonSuggestionReason: "คำตอบล่าสุดแสดงว่าควรทบทวนทักษะนี้อีกครั้ง",
    selfReportedReason: "ผลการฝึกที่บันทึกไว้แสดงว่าบทเรียนนี้อาจช่วยได้",
    continuePractice: "ฝึกต่อ",
    createPrompt:
      "ลองสร้างดนตรีสี่ห้องโดยใช้แนวคิดนี้ แล้วนึกย้อนว่าลองทำอะไรไปบ้าง",
    createPrompts: {
      "interval.construct":
        "สร้างทำนองสี่ห้องในคีย์ {key} ใช้อินเทอร์วัลจากแบบฝึก แล้วตอบด้วยวลีใหม่",
      "triad.construct":
        "สร้างวลีสี่ห้องในคีย์ {key} โดยใช้โน้ตจากไตรแอดที่เพิ่งสร้าง",
      "fretboard.root.locate":
        "เล่นสี่ห้องในคีย์ {key} เริ่มและจบวลีบนรูทในตำแหน่งต่างกัน",
      "diatonic.chord.identify":
        "เล่นสี่ห้องในคีย์ {key} โดยใช้สองคอร์ดในคีย์ แล้วฟังการเคลื่อนของคอร์ด",
      "progression.change":
        "เล่นสี่ห้องในคีย์ {key} เปลี่ยนคอร์ดทุกห้อง แล้วลองเปลี่ยนจังหวะ",
      "seventh.construct":
        "สร้างวลีสี่ห้องในคีย์ {key} โดยใช้โน้ตในคอร์ดเซเวนธ์",
    },
    createDone: "ลองแล้ว",
    createAgain: "ลองใหม่ภายหลัง",
    createRecorded: "บันทึกการนำไปเล่นดนตรีแล้ว โดยไม่กระทบคะแนนแบบฝึก",
    verifiedLabel: "แอปตรวจคำตอบแล้ว",
    selfReportedLabel: "รวมผลที่ประเมินด้วยตนเอง",
    skillEvidence: "ผลการฝึกตามทักษะ",
    objectiveProgress: "ความคืบหน้าบทเรียน",
    noCheckYet: "ยังไม่ได้เช็กความเข้าใจ",
    needsPractice: "ควรฝึกเพิ่ม",
    checkPassedStatus: "ผ่านการเช็กความเข้าใจ",
    reviewDue: "ถึงเวลาทบทวน",
    latestCheck: "ผลเช็กล่าสุด: {correct}/{attempts} · {date}",
    guidedCount: "ครั้งที่ฝึกตามแนวทาง: {count}",
    applicationCount: "ครั้งที่ลองเล่นกรูฟ: {count}",
    startQuickCheck: "เริ่มเช็กความเข้าใจ",
    openLesson: "เปิดบทเรียน",
    reviewTarget: "ทบทวนหัวข้อที่ถึงกำหนด",
    dueContext: "{skill} · คีย์ {key}",
    duePosition: "สาย {string} เฟรต {fret}",
    dueDegree: "ขั้นที่ {degree}",
    dueInterval: "อินเทอร์วัล {interval}",
    countIn: "นับเข้า 1 ห้อง แล้วเปลี่ยนคอร์ดทุกห้อง",
    countInBeat: "นับเข้า · จังหวะที่ {beat} จาก 4",
    changeEveryBar: "เล่น {chord} ในห้องนี้ เตรียม {next} สำหรับห้องถัดไป",
    beatOfBar: "จังหวะที่ {beat} จาก 4",
    guidedTempo: "ความเร็ว: {bpm} BPM",
    decreaseTempo: "ลดความเร็ว",
    increaseTempo: "เพิ่มความเร็ว",
    groovePrompt:
      "เล่นสี่ห้อง: {first}, {second}, {first}, {second} เปลี่ยนคอร์ดที่จังหวะแรก แล้วลองเปลี่ยนรูปแบบการตีคอร์ด",
    skillNames: {
      "interval.construct": "สร้างอินเทอร์วัล",
      "triad.construct": "สร้างไตรแอด",
      "fretboard.root.locate": "หารูทโน้ต",
      "diatonic.chord.identify": "หาคอร์ดในคีย์",
      "progression.change": "เปลี่ยนคอร์ดในโปรเกรสชัน",
      "chord.transition": "เปลี่ยนคอร์ดให้ชัดเจน",
      "seventh.construct": "สร้างคอร์ดเซเวนธ์",
      "fretboard.note.locate": "หาโน้ตบนเฟรตบอร์ด",
      "fretboard.interval.locate": "หาอินเทอร์วัลบนเฟรตบอร์ด",
      "ear.interval.recognize": "ฟังและจำอินเทอร์วัล",
      "rhythm.pulse": "รักษาจังหวะ",
      "technique.tempo": "เล่นชัดเจนตามจังหวะ",
      "technique.control": "ควบคุมเทคนิคการเล่น",
      "position.connect": "เชื่อมตำแหน่ง",
      "music.phrase.create": "สร้างวลีดนตรี",
    },
    names: {
      "interval-construction": "สร้างอินเทอร์วัล",
      "triad-construction": "สร้างไตรแอด",
      "caged-root-recall": "หารูทใน CAGED",
      "diatonic-identification": "หาคอร์ดในคีย์",
      "progression-changes": "ฝึกเปลี่ยนคอร์ด",
      "seventh-construction": "สร้างคอร์ดเซเวนธ์",
      "note-recall": "หาโน้ตบนเฟรตบอร์ด",
      "interval-recall": "หาอินเทอร์วัลบนเฟรตบอร์ด",
      "interval-ear": "ฟังอินเทอร์วัล",
      pulse: "รักษาจังหวะ",
      tempo: "เพิ่มความเร็วอย่างชัดเจน",
      technique: "ฝึกเทคนิค",
      "position-connection": "เชื่อมตำแหน่ง",
    },
    descriptions: {
      "interval-construction": "หาโน้ตตามอินเทอร์วัลที่กำหนดเหนือรูท",
      "triad-construction": "หาโน้ตในไตรแอด",
      "caged-root-recall": "หารูทในช่วงเฟรตนี้",
      "diatonic-identification": "หาคอร์ดตามลำดับขั้นในเมเจอร์คีย์",
      "progression-changes": "ฝึกเปลี่ยนระหว่างคอร์ดในโปรเกรสชันให้ชัดเจน",
      "seventh-construction": "หาโน้ตในคอร์ดเซเวนธ์",
      "note-recall": "หาโน้ตทั่วเฟรตบอร์ด",
      "interval-recall": "หาอินเทอร์วัลเหนือรูทที่เลือก",
      "interval-ear": "ฟังและระบุอินเทอร์วัล",
      pulse: "เคาะตามจังหวะให้สม่ำเสมอ",
      tempo: "เพิ่มความเร็วทีละขั้นโดยเล่นให้ชัดเจน",
      technique: "ฝึกเทคนิคตามจังหวะ",
      "position-connection": "เชื่อมตำแหน่งสเกล",
    },
  },
}
