import type { Locale } from "./locales"

export const LESSON_IDS = [
  "intervals",
  "triads",
  "caged",
  "diatonic",
  "progressions",
  "sevenths",
] as const

export type LessonId = (typeof LESSON_IDS)[number]

export const isLessonId = (value: string): value is LessonId =>
  LESSON_IDS.some((id) => id === value)

type LessonCopy = {
  title: string
  eyebrow: string
  summary: string
  learn: string
  visualize: string
  hear: string
  practice: string
}

export const lessons: Record<Locale, Record<LessonId, LessonCopy>> = {
  en: {
    intervals: {
      title: "Intervals",
      eyebrow: "01 / Distance between notes",
      summary:
        "Start with a root. Every other note has a distance and a sound.",
      learn:
        "An interval measures the distance from a root in semitones. The same interval appears in many places on the neck. Select one, then compare its color and sound with the root.",
      visualize:
        "Change the interval. The outlined root stays fixed while matching notes appear across the neck.",
      hear: "Listen to the root followed by the selected interval.",
      practice: "Find a root and name notes at a chosen interval above it.",
    },

    triads: {
      title: "Triads & chord construction",
      eyebrow: "02 / Stack three tones",
      summary: "Build a chord from its root, third, and fifth.",
      learn:
        "A major triad uses R–3–5; a minor triad uses R–♭3–5. Change the third to hear how the chord changes, then find those tones in a playable voicing.",
      visualize:
        "Select major or minor. The fretboard shows every chord tone; the outlined notes form one playable voicing.",
      hear: "Hear the notes one by one, then together as a chord.",
      practice: "Build a triad by identifying its third and fifth.",
    },

    caged: {
      title: "CAGED system",
      eyebrow: "03 / Five connected shapes",
      summary: "Follow one major chord through C, A, G, E, and D shapes.",
      learn:
        "CAGED names five familiar open-chord shapes. Move them to a new root and they reveal the same major chord in different places. Watch the root notes as you step from one shape to the next.",
      visualize:
        "Choose a shape. Its chord tones stand out from the full major-chord map.",
      hear: "Play the selected shape and pick through its tones.",
      practice:
        "Find the root notes inside this shape, then use fretboard recall.",
    },

    diatonic: {
      title: "Diatonic harmony",
      eyebrow: "04 / Chords inside a key",
      summary: "Build seven chords using only notes from one major scale.",
      learn:
        "Start on each scale degree and take every other note: 1–3–5. The seven resulting triads belong to the key. Add one more stacked note to make seventh chords.",
      visualize:
        "Choose a key and degree. The fretboard follows that chord while the degree list keeps the whole key in view.",
      hear: "Compare the selected chord with its neighbors in the key.",
      practice: "Construct a chord from a key and scale degree.",
    },

    progressions: {
      title: "Roman numerals & progressions",
      eyebrow: "05 / Harmony in motion",
      summary: "Use Roman numerals to move a progression to any key.",
      learn:
        "Roman numerals describe a chord's place in a key. Uppercase means major; lowercase means minor; ° means diminished. I–V–vi–IV keeps the same relationships when you change keys.",
      visualize:
        "Pick a progression and select a step to see that chord on the fretboard.",
      hear: "Listen to the chords in sequence, then change key and hear the pattern again.",
      practice: "Try changing between two chords from the progression.",
    },

    sevenths: {
      title: "7th chords, voicings & arpeggios",
      eyebrow: "06 / Add one more tone",
      summary: "Add a seventh, choose a voicing, and turn it into an arpeggio.",
      learn:
        "A seventh chord stacks one more third above a triad. Its voicing chooses where those tones sit on the guitar. An arpeggio plays the voicing one note at a time.",
      visualize:
        "Select a seventh quality and a playable voicing. Follow the highlighted chord tones.",
      hear: "Compare the full chord with the notes picked in order.",
      practice: "Build a seventh chord, then play its chord tones evenly.",
    },
  },

  th: {
    intervals: {
      title: "Intervals",
      eyebrow: "01 / ระยะห่างระหว่างโน้ต",
      summary:
        "เริ่มจาก Root แล้วดูว่าโน้ตแต่ละตัวอยู่ห่างออกไปเป็น Interval อะไรและให้เสียงแบบไหน",
      learn:
        "Interval คือระยะห่างจาก Root โดยวัดเป็น Semitone โดย Interval เดียวกันสามารถพบได้หลายตำแหน่งบน Fretboard ลองเลือก Interval แล้วเปรียบเทียบตำแหน่งและเสียงกับ Root",
      visualize:
        "เปลี่ยน Interval แล้วดูตำแหน่งโน้ตบน Fretboard โดย Root จะอยู่ตำแหน่งเดิม ส่วนโน้ตที่ตรงกับ Interval ที่เลือกจะถูกแสดงขึ้นมา",
      hear: "ฟังเสียง Root แล้วตามด้วย Interval ที่เลือก",
      practice:
        "เลือก Root แล้วลองหาโน้ตที่อยู่ตาม Interval ที่กำหนดบน Fretboard",
    },

    triads: {
      title: "Triads & Chord Construction",
      eyebrow: "02 / สร้าง Chord จาก 3 โน้ต",
      summary: "สร้าง Triad จาก Root, Third และ Fifth",
      learn:
        "Major Triad ใช้สูตร R–3–5 ส่วน Minor Triad ใช้ R–♭3–5 ลองเปลี่ยน Third เพื่อฟังความแตกต่างระหว่าง Major และ Minor แล้วหา Chord Tones เหล่านั้นใน Voicing ที่เล่นได้จริง",
      visualize:
        "เลือก Major หรือ Minor แล้วดู Chord Tones ทั้งหมดบน Fretboard โดยตำแหน่งที่ถูกเน้นจะแสดง Voicing ที่สามารถเล่นได้",
      hear: "ฟัง Chord Tones ทีละโน้ต แล้วฟังพร้อมกันเป็น Chord",
      practice:
        "เลือก Root แล้วลองสร้าง Triad โดยหา Third และ Fifth ให้ถูกต้อง",
    },

    caged: {
      title: "CAGED System",
      eyebrow: "03 / 5 Chord Shapes ที่เชื่อมกัน",
      summary:
        "ดู Major Chord เดียวกันผ่าน C, A, G, E และ D Shapes บน Fretboard",
      learn:
        "CAGED System มาจาก Open Chord Shapes 5 แบบ ได้แก่ C, A, G, E และ D เมื่อนำแต่ละ Shape ไปวางบน Root ใหม่ จะได้ Major Chord เดียวกันในตำแหน่งต่าง ๆ บน Fretboard ลองสังเกตตำแหน่ง Root ขณะเลื่อนจาก Shape หนึ่งไปอีก Shape",
      visualize:
        "เลือก CAGED Shape แล้วดู Chord Tones ของ Shape นั้นเทียบกับ Major Chord ทั้งหมดบน Fretboard",
      hear: "ฟังเสียง Chord จาก Shape ที่เลือก แล้วเล่น Chord Tones ทีละโน้ต",
      practice:
        "หา Root Notes ภายใน CAGED Shape แล้วลองจำตำแหน่งเหล่านั้นบน Fretboard",
    },

    diatonic: {
      title: "Diatonic Harmony",
      eyebrow: "04 / Chords ภายใน Key",
      summary: "สร้าง Chords ทั้ง 7 ตัวโดยใช้เฉพาะโน้ตจาก Major Scale เดียวกัน",
      learn:
        "เริ่มจากแต่ละ Scale Degree แล้วซ้อนโน้ตแบบเว้นหนึ่งตัวเป็น 1–3–5 จะได้ Triads ทั้ง 7 ตัวใน Key นั้น หากเพิ่ม Third อีกหนึ่งชั้น จะได้ 7th Chords",
      visualize:
        "เลือก Key และ Scale Degree แล้วดู Chord นั้นบน Fretboard พร้อมกับ Chords ตัวอื่น ๆ ที่อยู่ใน Key เดียวกัน",
      hear: "ฟัง Chord ที่เลือกแล้วเปรียบเทียบกับ Chords อื่นใน Key เดียวกัน",
      practice: "เลือก Key และ Scale Degree แล้วลองสร้าง Chord ให้ถูกต้อง",
    },

    progressions: {
      title: "Roman Numerals & Chord Progressions",
      eyebrow: "05 / การเคลื่อนที่ของ Harmony",
      summary:
        "ใช้ Roman Numerals เพื่อเข้าใจและย้าย Chord Progression ไปยัง Key อื่น",
      learn:
        "Roman Numerals ใช้บอกตำแหน่งของ Chord ภายใน Key โดยตัวพิมพ์ใหญ่หมายถึง Major ตัวพิมพ์เล็กหมายถึง Minor และ ° หมายถึง Diminished เช่น I–V–vi–IV จะยังคงความสัมพันธ์เดิมเมื่อเปลี่ยนไปเล่นใน Key อื่น",
      visualize:
        "เลือก Chord Progression แล้วเลือกแต่ละ Chord เพื่อดู Chord Tones บน Fretboard",
      hear: "ฟัง Chords ตามลำดับของ Progression แล้วลองเปลี่ยน Key เพื่อฟังความสัมพันธ์เดิมในเสียงที่ต่างออกไป",
      practice:
        "เลือก Chords สองตัวจาก Progression แล้วฝึกเปลี่ยนระหว่าง Chords ให้ลื่นไหล",
    },

    sevenths: {
      title: "7th Chords, Voicings & Arpeggios",
      eyebrow: "06 / เพิ่ม Seventh เข้าไปใน Chord",
      summary:
        "เพิ่ม Seventh ให้ Triad เลือก Voicing แล้วนำ Chord Tones ไปเล่นเป็น Arpeggio",
      learn:
        "7th Chord เกิดจากการเพิ่ม Third อีกหนึ่งชั้นบน Triad ส่วน Voicing คือการเลือกว่าจะแจก Chord Tones เหล่านั้นไว้ตำแหน่งไหนบนกีตาร์ และ Arpeggio คือการนำ Chord Tones มาเล่นทีละโน้ต",
      visualize:
        "เลือกประเภทของ 7th Chord และ Voicing แล้วดู Chord Tones ที่ถูกเน้นบน Fretboard",
      hear: "ฟังเสียง Chord แบบเล่นพร้อมกัน แล้วเปรียบเทียบกับการเล่น Chord Tones เรียงทีละโน้ตเป็น Arpeggio",
      practice:
        "สร้าง 7th Chord แล้วลองเล่น Chord Tones ของมันเป็น Arpeggio ให้จังหวะสม่ำเสมอ",
    },
  },
}
