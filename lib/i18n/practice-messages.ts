import type { NoteName } from "@/types/music"
import { CHROMATIC } from "../notes"
import { getKeyLabel } from "../theory/spelling"
import type { Locale } from "./locales"

const THAI_COPY: Record<string, string> = {
  "Deliberate practice": "ฝึกซ้อมอย่างมีเป้าหมาย",
  "Turn fretboard knowledge into playing you can measure.":
    "เปลี่ยนความรู้เรื่อง Fretboard ให้เป็นทักษะที่วัดผลได้จริง",
  session: "เซสชัน",
  sessions: "เซสชัน",
  "Loading practice history…": "กำลังโหลดประวัติการฝึกซ้อม…",
  "Today’s practice": "ฝึกซ้อมวันนี้",
  "Start where you are today.": "เริ่มจากจุดที่คุณอยู่ในวันนี้",
  "A small, focused way to begin.": "เริ่มต้นด้วยการฝึกสั้น ๆ ที่มีเป้าหมาย",
  "Replay quick warmup": "ฝึกวอร์มอัปสั้น ๆ อีกครั้ง",
  "Start quick warmup": "เริ่มวอร์มอัปสั้น ๆ",
  "Build a full set": "จัดชุดฝึกเต็มรูปแบบ",
  "Warmup logged today. You can replay it whenever you like.":
    "บันทึกการวอร์มอัปของวันนี้แล้ว คุณจะฝึกซ้ำเมื่อไรก็ได้",
  "Even a short session counts as practice.": "ฝึกสั้น ๆ ก็ถือว่าได้ฝึกแล้ว",
  "Plan a full set": "วางแผนชุดฝึกเต็มรูปแบบ",
  "Next routine block": "ไปแบบฝึกถัดไป",
  "Explore at your pace": "เลือกฝึกตาม Rhythm ของคุณ",
  "More ways to practice": "วิธีฝึกเพิ่มเติม",
  "Fretboard mastery path": "เส้นทางพัฒนา Fretboard",
  "Choose an individual drill": "เลือกแบบฝึกเดี่ยว",
  "Focused work": "ฝึกแบบเจาะจง",
  "Choose a drill": "เลือกแบบฝึก",
  "Start drill": "เริ่มแบบฝึก",
  "Saved exercises": "แบบฝึกที่บันทึกไว้",
  "Fretboard recall": "ทบทวน Note Positions บน Fretboard",
  "Tempo ladder": "ไต่ระดับ Tempo",
  "Technique builder": "ฝึกเทคนิค",
  "Chord changes": "Chord Changes",
  "Ear training": "Ear Training",
  "Rhythm lock": "จับ Rhythm",
  "Position links": "Position Links",
  "Theory construction": "สร้างความเข้าใจทฤษฎี",
  "Accuracy + response time": "ความแม่นยำและเวลาตอบสนอง",
  "Comfortable + best BPM": "Tempo ที่ถนัดและ BPM สูงสุด",
  "Clean rounds by BPM": "รอบที่เล่นชัดเจนตาม BPM",
  "Clean changes": "การเปลี่ยน Chord ที่ชัดเจน",
  "Recognition accuracy": "ความแม่นยำในการจำแนกเสียง",
  "Offset + consistency": "ความคลาดเคลื่อนและความสม่ำเสมอ",
  "Sequence accuracy": "ความแม่นยำของลำดับ Note",
  Ready: "พร้อม",
  Back: "กลับ",
  "Start session": "เริ่มเซสชัน",
  "Active session": "เซสชันที่กำลังฝึก",
  Resume: "ฝึกต่อ",
  Pause: "พักชั่วคราว",
  End: "จบ",
  "Mastery checkpoint": "แบบทดสอบความชำนาญ",
  "Path review": "ทบทวนเส้นทาง",
  "Adaptive review": "ทบทวนตามผลการฝึก",
  Paused: "พักชั่วคราว",
  "Take a breath": "พักหายใจสักครู่",
  "Resume session": "ฝึกเซสชันต่อ",
  "Question {current} / {total}": "ข้อ {current} / {total}",
  "Construction · {current}/{total}": "สร้างความเข้าใจ · {current}/{total}",
  "Practice record": "บันทึกการฝึกซ้อม",
  "Progress that points to the next rep.":
    "ความก้าวหน้าที่ช่วยชี้เป้าหมายในการฝึกครั้งต่อไป",
  "Import FretFlow practice data": "นำเข้าข้อมูลการฝึก FretFlow",
  Import: "นำเข้า",
  Export: "ส่งออก",
  "Practice data imported.": "นำเข้าข้อมูลการฝึกซ้อมแล้ว",
  "That file is not valid FretFlow practice data.":
    "ไฟล์นี้ไม่ใช่ข้อมูลการฝึก FretFlow ที่ถูกต้อง",
  "Current streak": "ฝึกต่อเนื่อง",
  "Last 7 days": "7 วันที่ผ่านมา",
  Completed: "เสร็จสิ้น",
  "Daily missions": "ภารกิจประจำวัน",
  days: "วัน",
  min: "นาที",
  "Practice consistency": "ความสม่ำเสมอในการฝึก",
  "Personal bests": "สถิติส่วนตัว",
  "Mastery milestones": "หมุดหมายความชำนาญ",
  "Fretboard recall map": "Fretboard Recall Map",
  "Skill strength": "ระดับทักษะ",
  "Recent sessions": "เซสชันล่าสุด",
  "Skill evidence, not participation points. Verified marks use answers or timing recorded by the app.":
    "วัดจากทักษะที่แสดงให้เห็น ไม่ใช่แค่การเข้าร่วม หมุดหมายที่ยืนยันแล้วใช้คำตอบหรือ Rhythm ที่แอปบันทึก",
  "Durable progress from verified recall, coverage, and response time.":
    "ความก้าวหน้าที่วัดจากการจำ Position ความครอบคลุม และเวลาตอบสนองที่ยืนยันได้",
  "Red positions need attention; green positions are consistently recalled.":
    "Position สีแดงควรฝึกเพิ่ม ส่วน Position สีเขียวจำได้สม่ำเสมอ",
  "Skill ratings appear after your first answered drill.":
    "ระดับทักษะจะแสดงหลังจากตอบแบบฝึกครั้งแรก",
  "No completed sessions yet.": "ยังไม่มีเซสชันที่เสร็จสิ้น",
  "Three missions. One useful session.": "สามภารกิจ หนึ่งเซสชันที่คุ้มค่า",
  "Daily signal": "เป้าหมายประจำวัน",
  "of 3 daily missions complete": "จาก 3 ภารกิจประจำวันเสร็จแล้ว",
  "{count} of 3 daily missions complete":
    "เสร็จแล้ว {count} จาก 3 ภารกิจประจำวัน",
  "Goal cleared": "บรรลุเป้าหมายแล้ว",
  Attempted: "ฝึกแล้ว",
  Goal: "เป้าหมาย",
  Variation: "รูปแบบฝึก",
  "Best today:": "สถิติวันนี้:",
  About: "ประมาณ",
  "Reroll today's wildcard mission": "สุ่มภารกิจเสริมของวันนี้ใหม่",
  "One wildcard reroll per day": "สุ่มภารกิจเสริมใหม่ได้วันละครั้ง",
  Replay: "ฝึกซ้ำ",
  "Start mission": "เริ่มภารกิจ",
  "Daily set complete. Three different skills, one stronger practice day.":
    "ทำชุดฝึกประจำวันครบแล้ว ได้ฝึกสามทักษะในหนึ่งวันที่มีคุณภาพ",
  "Adaptive routine": "ชุดฝึกปรับตามผลของคุณ",
  "Today’s set": "ชุดฝึกวันนี้",
  "Today’s focus:": "เป้าหมายวันนี้:",
  ". Shuffle the supporting drills to keep this skill in the set.":
    " สุ่มแบบฝึกเสริมเพื่อคงทักษะนี้ไว้ในชุดฝึก",
  "Shuffle set": "สุ่มชุดฝึกใหม่",
  "Today’s focus": "เป้าหมายวันนี้",
  "Save routine": "บันทึกชุดฝึก",
  "Start routine": "เริ่มชุดฝึก",
  "Drill setup": "ตั้งค่าแบบฝึก",
  "What do you want to recall?": "ต้องการฝึกจำอะไร?",
  note: "Note",
  root: "Root",
  interval: "Interval",
  "Prompt direction": "รูปแบบคำถาม",
  "Find notes": "หา Note",
  "Name positions": "ระบุ Position",
  Mixed: "ผสม",
  "Fret range": "ช่วง Fret",
  "Frets 0–{fret}": "Fret 0–{fret}",
  Strings: "Strings",
  "String 1 is the low E string.": "String 1 คือ Low E String",
  "Daily signal · {day}": "เป้าหมายประจำวัน · {day}",
  "01 · Tune-up": "01 · วอร์มอัป",
  "02 · Weak spot": "02 · จุดที่ควรฝึก",
  "03 · Wildcard": "03 · ภารกิจเสริม",
  Steady: "สม่ำเสมอ",
  Stretch: "ท้าทายขึ้น",
  Bold: "ท้าทายมาก",
  "about {minutes} min": "ประมาณ {minutes} นาที",
  "Today’s practice · {day}": "ฝึกซ้อมวันนี้ · {day}",
  "Session complete": "เซสชันเสร็จสิ้น",
  "Session ended": "จบเซสชันแล้ว",
  Time: "เวลา",
  Accuracy: "ความแม่นยำ",
  Attempts: "จำนวนครั้ง",
  "Avg response": "เวลาตอบเฉลี่ย",
  "Best clean": "รอบที่ดีที่สุด",
  "Take this into your next session": "นำสิ่งนี้ไปใช้ในเซสชันถัดไป",
  "Mission cleared": "ผ่านภารกิจแล้ว",
  "Baseline recorded": "บันทึกค่าพื้นฐานแล้ว",
  "Stage mastered": "ผ่านระดับนี้แล้ว",
  "Checkpoint recorded": "บันทึกผลทดสอบแล้ว",
  "Path evidence updated": "อัปเดตผลเส้นทางแล้ว",
  "Milestone earned": "ได้รับหมุดหมายแล้ว",
  "Back to practice": "กลับไปฝึกซ้อม",
  "Continue to next stage": "ไปยังระดับถัดไป",
  "Review weak targets": "ทบทวนจุดที่ยังไม่แม่น",
  "Back to path": "กลับไปยังเส้นทาง",
  "Make it music": "นำไปเล่นเป็นเพลง",
  "Optional · play it in context": "เพิ่มเติม · ลองเล่นในบริบทจริง",
  "Try four bars, then continue whenever you're ready.":
    "ลองเล่นสี่ Bar แล้วไปต่อเมื่อพร้อม",
  "click is optional": "เปิด Click ก็ได้",
  "Stop click": "หยุด Click",
  "Start click": "เริ่ม Click",
  "View session summary": "ดูสรุปเซสชัน",
  "This is free play; it does not affect your exercise score.":
    "ช่วงนี้เล่นได้อย่างอิสระและไม่มีผลต่อคะแนนแบบฝึก",
  "Lock into the pulse": "จับ Rhythm ให้มั่นคง",
  "Tap · Space": "Tap Rhythm · Space",
  "Finish rhythm test": "จบ Rhythm Test",
  "One-minute changes": "เปลี่ยน Chord หนึ่งนาที",
  "Count only changes where both chords ring clearly.":
    "นับเฉพาะครั้งที่เปลี่ยน Chord ได้ชัดเจนทั้งสอง Chord",
  Missed: "พลาด",
  "Clean change": "เปลี่ยนได้ชัดเจน",
  "Finish set": "จบชุดฝึก",
  "What interval do you hear?": "คุณได้ยิน Interval อะไร?",
  "Reference root:": "Reference Root:",
  "Play interval": "เล่น Interval",
  "Minor 2nd": "Minor 2nd",
  "Major 2nd": "Major 2nd",
  "Minor 3rd": "Minor 3rd",
  "Major 3rd": "Major 3rd",
  "Perfect 4th": "Perfect 4th",
  "Perfect 5th": "Perfect 5th",
  "Beat indicator": "Beat Indicator",
  Tempo: "Tempo",
  "Click volume": "Click Volume",
  "Tap tempo": "Tap Tempo",
  "Gap every 4th bar": "เว้น Click ทุก Bar ที่ 4",
  "Clean round": "รอบที่เล่นชัดเจน",
  "Finish workout": "จบการฝึก",
  "Play {repetitions} repetitions. Two clean rounds raise the tempo; two misses reduce it.":
    "เล่นซ้ำ {repetitions} ครั้ง หากเล่นชัดเจนสองรอบจะเพิ่ม Tempo หากพลาดสองรอบจะลด Tempo",
  Clean: "ชัดเจน",
  Finish: "จบ",
  "Position {from} → {to}": "Position {from} → {to}",
  "What comes after {note}?": "Note ใดอยู่ถัดจาก {note}?",
  "Continue the {root} {scale} sequence across the position boundary.":
    "เล่นลำดับ Note {scale} ใน Key {root} ต่อข้ามขอบเขต Position",
  "Count in · ": "Count In · ",
  "BPM · ": "BPM · ",
  target: "เป้าหมาย",
  "Down–up evenly on every note": "ดีดลง–ขึ้นให้สม่ำเสมอทุก Note",
  "Keep hammer-ons and pull-offs equal in volume":
    "คุมความดังของ Hammer-on และ Pull-off ให้เท่ากัน",
  "Lead each string change with the planned pick stroke":
    "เริ่มเปลี่ยน String ด้วยทิศทาง Pick ที่วางแผนไว้",
  "Play 1–2–3, 2–3–4 through the scale": "เล่น 1–2–3, 2–3–4 ไปตาม Scale",
  "Let each note speak without bleeding into the next":
    "เล่นแต่ละ Note ให้ชัดโดยไม่ให้เสียงทับกัน",
  "Alternate picking": "Alternate Picking",
  "Complete a session to set your first benchmark.":
    "ฝึกให้จบหนึ่งเซสชันเพื่อสร้างสถิติแรกของคุณ",
  "Last 28 practice days": "ประวัติการฝึก 28 วันล่าสุด",
  Less: "น้อย",
  More: "มาก",
  "Scrollable fretboard recall heatmap":
    "แผนที่ความแม่นยำบน Fretboard เลื่อนได้",
  "not practiced": "ยังไม่ได้ฝึก",
  "practice days": "วันที่ฝึก",
  "Mastery marks": "หมุดหมายความชำนาญ",
  "Your first mastery mark appears when a measured skill crosses its threshold.":
    "หมุดหมายแรกจะแสดงเมื่อทักษะที่วัดผลได้ถึงเกณฑ์",
  "Closest next": "หมุดหมายถัดไป",
  "No timing sample": "ยังไม่มี Timing Sample",
  "Target coverage": "ความครอบคลุมเป้าหมาย",
  "due for review": "รายการที่ถึงเวลาทบทวน",
  Earned: "ได้รับแล้ว",
  "Current stage": "ระดับปัจจุบัน",
  Locked: "ยังไม่ปลดล็อก",
  "Continue review": "ทบทวนต่อ",
  "Check mastery": "ตรวจความชำนาญ",
  "Checkpoints sample the whole stage without hiding free practice.":
    "แบบทดสอบจะสุ่มเนื้อหาทั้งระดับ โดยยังเลือกฝึกอย่างอิสระได้",
  "Fretboard path · Stage {current} of {total}":
    "Fretboard Path · Stage {current} จาก {total}",
  "target coverage: {current}% of {target}% required":
    "ความครอบคลุมเป้าหมาย: {current}% จาก {target}% ที่ต้องการ",
  "{value}% accuracy": "ความแม่นยำ {value}%",
  "{current}/{total} sessions": "{current}/{total} เซสชัน",
  "{count} targets due": "มี {count} จุดที่ถึงเวลาทบทวน",
  "{mastered} mastered · {shaky} shaky · {review} not yet covered":
    "แม่นแล้ว {mastered} จุด · ยังไม่มั่นใจ {shaky} จุด · ยังไม่ครอบคลุม {review} จุด",
  "{value}% coverage": "ครอบคลุม {value}%",
  "{count} measured sessions": "วัดผลแล้ว {count} เซสชัน",
  "of {target}% required": "จาก {target}% ที่ต้องการ",
  "Stage {order}": "ระดับ {order}",
  "Which note is {interval} in {chord}?":
    "Note ใดเป็น {interval} ใน Chord {chord}?",
  "Which note is {interval} above {root}?":
    "Note ใดอยู่สูงกว่า {root} เป็นระยะ {interval}?",
  "Correct — {note}": "ถูกต้อง — {note}",
  "{note} is not the requested target": "{note} ไม่ใช่ Note เป้าหมาย",
  "That position is {note}": "Position นั้นคือ Note {note}",
  "Choose the note name": "เลือกชื่อ Note",
  "Choose a position on the fretboard": "เลือก Position บน Fretboard",
  "Note choices": "ตัวเลือกชื่อ Note",
  "Name the note at string {string}, fret {fret}":
    "ระบุ Note ที่ String {string} Fret {fret}",
  "on string {string}": "ที่ String {string}",
  "the root {root}": "Root {root}",
  "every {note}": "Note {note} ทุก Position",
  "Continue after {note}": "เล่นต่อจาก Note {note}",
  "Find {label}": "หา {label}",
  "Accuracy improved by {value} points since the last attempt.":
    "ความแม่นยำเพิ่มขึ้น {value} จุดจากครั้งก่อน",
  "Your clean tempo rose by {value} BPM since the last attempt.":
    "Tempo ที่เล่นชัดเจนเพิ่มขึ้น {value} BPM จากครั้งก่อน",
  "Your timing spread narrowed by {value} ms since the last attempt.":
    "Timing Spread ลดลง {value} ms จากครั้งก่อน",
  "You recorded {count} {unit} to guide your next practice.":
    "คุณบันทึกผล {count} {unit} เพื่อใช้วางแผนการฝึกครั้งต่อไป",
  attempt: "ครั้ง",
  attempts: "ครั้ง",
  "Next time, find the same notes on a different string.":
    "ครั้งหน้า ลองหา Note เดิมบน String อื่น",
  "Next time, begin at your last comfortable tempo and aim for one clean step.":
    "ครั้งหน้า เริ่มจาก Tempo ที่ถนัดล่าสุด แล้วลองเพิ่มอีกหนึ่งระดับ",
  "Next time, keep the motion relaxed before raising the tempo.":
    "ครั้งหน้า ผ่อนคลายการเคลื่อนไหวให้ได้ก่อนเพิ่ม Tempo",
  "Next time, use the same chord changes in a simple four-beat groove.":
    "ครั้งหน้า ลองใช้ Chord Changes เดิมใน Four-beat Groove แบบง่าย ๆ",
  "Next time, sing the interval before choosing an answer.":
    "ครั้งหน้า ลองร้อง Interval ก่อนเลือกคำตอบ",
  "Next time, keep the pulse going when the click drops out.":
    "ครั้งหน้า รักษา Pulse ต่อไปแม้ Click จะหายไป",
  "Next time, play the connection in both directions.":
    "ครั้งหน้า ลองเล่นเชื่อม Position ไปทั้งสองทิศทาง",
  "Next time, find one of today's answers on the guitar.":
    "ครั้งหน้า ลองหา Note คำตอบข้อหนึ่งบนกีตาร์",
  "Starts a useful baseline for adapting future daily sets.":
    "เริ่มเก็บข้อมูลพื้นฐานเพื่อปรับชุดฝึกประจำวันในอนาคต",
  "Selected from your lowest-strength or least-practiced skill.":
    "เลือกจากทักษะที่ยังไม่แข็งแรงหรือฝึกน้อยที่สุด",
  "A short confidence-building start before the harder work.":
    "เริ่มสั้น ๆ เพื่อสร้างความมั่นใจก่อนฝึกส่วนที่ยากขึ้น",
  "A contrasting skill and constraint to keep today’s set varied.":
    "เพิ่มทักษะและเงื่อนไขที่ต่างออกไปเพื่อให้ชุดฝึกวันนี้หลากหลาย",
  "Fretboard foundations": "Fretboard Foundations",
  "Clear coordinates": "ระบุ Position ได้แม่นยำ",
  "Open ears": "หูพร้อมฟัง",
  "In the pocket": "จับ Rhythm ได้ลงตัว",
  "Clean handoff": "เปลี่ยน Chord ได้ชัดเจน",
  "Triple digits": "Tempo สามหลัก",
  "Three discoveries": "สามวันแห่งการค้นพบ",
  "Landmark notes": "Landmark Notes",
  Landmarks: "จุดสังเกต",
  "Natural-note map": "Natural-note Map",
  "Natural map": "Natural Notes",
  "Chromatic map": "Chromatic Map",
  "Interval map": "Interval Map",
  Intervals: "Interval",
  "Master the landmark-notes stage with verified recall.":
    "จดจำ Landmark Notes ได้ผ่านแบบฝึกที่ตรวจคำตอบ",
  "Reach 90% in an app-verified fretboard recall session.":
    "ทำความแม่นยำให้ถึง 90% ในเซสชันทบทวน Fretboard ที่แอปตรวจคำตอบ",
  "Reach 85% in an app-verified ear training session.":
    "ทำความแม่นยำให้ถึง 85% ในเซสชัน Ear Training ที่แอปตรวจคำตอบ",
  "Reduce app-verified timing spread to 75ms or less.":
    "ลดความคลาดเคลื่อนของ Rhythm ที่แอปตรวจให้เหลือไม่เกิน 75ms",
  "Record 20 clean chord changes in one session.":
    "เปลี่ยน Chord ได้ชัดเจน 20 ครั้งในหนึ่งเซสชัน",
  "Complete a clean round at 120 BPM.": "เล่นหนึ่งรอบได้ชัดเจนที่ 120 BPM",
  "Complete daily missions on three different days.":
    "ทำภารกิจประจำวันให้เสร็จในสามวัน",
  "Name open strings and the main fret markers without hints.":
    "ระบุ String เปิดและ Fret หลักโดยไม่ใช้คำใบ้",
  "Landmarks give you fast reference points for every later shape and interval.":
    "Landmarks ช่วยให้หา Reference ได้เร็วเมื่อต้องเล่น Chord Shapes และ Intervals",
  "Recall natural notes in both directions across frets 0–12.":
    "จำ Natural Notes ไปทั้งสองทิศทางในช่วง Fret 0–12",
  "Natural notes turn the neck into a readable map instead of a set of boxes.":
    "Natural Notes ช่วยให้มอง Fretboard เป็นแผนที่แทนการจำเป็นช่อง ๆ",
  "Add sharps and recall every note class across frets 0–12.":
    "เพิ่ม Sharp Notes และจดจำทุก Note บน Fret 0–12",
  "Chromatic fluency removes hesitation when keys and positions change.":
    "ความคล่องในการจำ NoteChromatic ช่วยลดความลังเลเมื่อเปลี่ยน Key หรือ Position",
  "Find scale intervals from rotating roots across the neck.":
    "หา Scale Intervals จาก Root ที่เปลี่ยนไปทั่ว Fretboard",
  "Intervals connect fretboard recall to chords, scales, and improvisation.":
    "Intervals เชื่อมการจำ Fretboard เข้ากับ Chords, Scales และ Improvisation",
  "Recall notes at the boundaries between adjacent playing areas.":
    "จดจำ Note บริเวณรอยต่อระหว่าง Position เล่นที่อยู่ติดกัน",
  "Boundary notes help you leave familiar boxes without losing your place.":
    "Note บริเวณรอยต่อช่วยให้เล่นออกจากช่องที่คุ้นเคยได้โดยไม่หลง Position",
  "Find the target before the board gives it away.":
    "หา Note เป้าหมายก่อนกระดานจะแสดง Position",
  "Bank two clean rounds to move the tempo upward.":
    "เล่นให้ชัดเจนสองรอบเพื่อเพิ่ม Tempo",
  "Build a short run of controlled, repeatable rounds.":
    "สร้างชุดรอบสั้น ๆ ที่ควบคุมได้และเล่นซ้ำได้",
  "Keep the chain alive with clean, ringing changes.":
    "เปลี่ยน Chord ให้ชัดเจนและเสียงต่อเนื่อง",
  "Decode a compact set of guitar intervals by ear.":
    "แยกแยะ Guitar Intervals ชุดสั้น ๆ ด้วยการฟัง",
  "Settle the taps into a tighter rhythmic pocket.":
    "เคาะ Rhythm ให้สม่ำเสมอและลงตัวขึ้น",
  "Carry the scale cleanly across a position boundary.":
    "เล่น Scale ให้ต่อเนื่องข้าม Position Boundary",
  "Build the answer before the choices distract you.":
    "ลองสร้างคำตอบก่อนตัวเลือกจะทำให้ไขว้เขว",
  "Reach ": "ทำให้ถึง ",
  "Hit ": "ทำให้ได้ ",
  accuracy: "ความแม่นยำ",
  response: "เวลาตอบสนอง",
  "timing spread": "Timing Spread",
  "clean rounds": "รอบที่เล่นชัดเจน",
  "clean changes": "การเปลี่ยน Chord ที่ชัดเจน",
  "gap click": "Gap Click",
  "steady click": "Steady Click",
  signals: "เสียงทดสอบ",
  bars: "Bars",
  positions: "Positions",
  "interval builds": "Interval Builds",
  "Tune-up": "วอร์มอัป",
  "Weak spot": "จุดที่ควรฝึก",
  Wildcard: "ภารกิจเสริม",
  "Move {name} up": "เลื่อน {name} ขึ้น",
  "Move {name} down": "เลื่อน {name} ลง",
  logged: "บันทึกแล้ว",
  "{name} · {modifier}. About {duration} minutes to get moving.":
    "{name} · {modifier} ใช้เวลาประมาณ {duration} นาทีเพื่อเริ่มต้น",
  minutes: "นาที",
  coverage: "ความครอบคลุม",
  "String {string}, fret {fret}: {accuracy}%":
    "String {string} Fret {fret}: {accuracy}%",
  "String {string}, fret {fret}: not practiced":
    "String {string} Fret {fret}: ยังไม่ได้ฝึก",
  "{date}, {minutes} minutes practiced": "{date} ฝึกไป {minutes} นาที",
  "{date}: {minutes} minutes": "{date}: {minutes} นาที",
  "{bpm} BPM · click is optional": "{bpm} BPM · เปิด Click หรือไม่ก็ได้",
  quarters: "Quarter Notes",
  eighths: "Eighth Notes",
  triplets: "Triplets",
  sixteenths: "Sixteenth Notes",
  syncopation: "Syncopation",
  clean: "ชัดเจน",
  total: "ทั้งหมด",
  taps: "Taps",
  open: "Open",
  barre: "Barre",
  "up-neck": "Up-neck",
  legato: "Legato",
  arpeggio: "Arpeggio",
  "response time": "Response Time",
  "timing variability": "Timing Variability",
  "app-verified": "App-verified",
  "self-reported": "Self-reported",
}

const EXACT_TEXT: Record<string, string> = {
  "Fretboard recall": "ทบทวน Note Positions บน Fretboard",
  "Tempo ladder": "ไต่ระดับ Tempo",
  "Alternate picking": "Alternate Picking",
  "One-minute changes": "เปลี่ยน Chord หนึ่งนาที",
  "Interval ear training": "Interval Ear Training",
  "Rhythm lock": "จับ Rhythm",
  "Connect positions": "Position Links",
  "Build the interval": "สร้าง Interval",
  "Locate notes and intervals without visual hints.":
    "หา Notes และ Intervals โดยไม่มี visual hints",
  "Build clean speed one repeatable step at a time.":
    "เพิ่ม Tempo อย่างชัดเจนทีละขั้นที่เล่นซ้ำได้",
  "Develop even attacks with a controlled scale sequence.":
    "ฝึก Picking ให้สม่ำเสมอด้วย Scale Sequence ที่ควบคุมได้",
  "Measure clean changes between a focused chord pair.":
    "วัดการเปลี่ยน Chord คู่ที่กำหนดให้ชัดเจน",
  "Recognize intervals played with a guitar sound.":
    "ฟังและจำแนก Interval จากเสียงกีตาร์",
  "Tap against the pulse and reduce timing variation.":
    "เคาะตาม Rhythm หลักและลดความคลาดเคลื่อน",
  "Continue a scale across adjacent fretboard positions.":
    "เล่น Scale ต่อเนื่องผ่าน Position ที่อยู่ติดกันบน Fretboard",
  "Construct intervals and chords from a given root.":
    "สร้าง Interval และ Chord จาก Root ที่กำหนด",
  "Climb the click": "Climb the Click",
  "Clean streak": "เล่นชัดต่อเนื่อง",
  "Chord combo": "Chord Combo",
  "Interval signal": "Interval Signal",
  "Pulse lock": "Rhythm Lock",
  "Position relay": "Position Relay",
  "Theory forge": "Theory Forge",
  "Note recall": "Note Recall",
  "Root recall": "Root Recall",
  "Interval recall": "Interval Recall",
  major: "Major",
  "natural minor": "Natural Minor",
  "major pentatonic": "Major Pentatonic",
  "minor pentatonic": "Minor Pentatonic",
  blues: "Blues",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
  "harmonic minor": "Harmonic Minor",
  "alternate picking": "Alternate Picking",
  "string crossing": "String Crossing",
  "scale sequence": "Scale Sequence",
  "Play a riff you know at a comfortable tempo. Keep it musical and let every note land with the click.":
    "เล่น Riff ที่คุ้นเคยด้วย Tempo ที่ถนัด รักษาความเป็นดนตรีและให้ทุก Note ลงพร้อม Click",
  "Play {repetitions} clean repetitions at {bpm} BPM":
    "เล่นซ้ำ {repetitions} ครั้งให้ชัดเจนที่ {bpm} BPM",
  "Tap {pattern}": "เคาะ Rhythm {pattern}",
  "Name the interval": "ระบุชื่อ Interval",
  landmarks: "จุดสังเกต",
  "natural map": "Natural Notes",
  "chromatic map": "Chromatic Map",
  "interval map": "Interval Map",
  "position links": "Position Links",
}

const INTERVAL_LABELS: Record<string, string> = {
  R: "Root",
  b2: "Minor 2nd",
  "2": "Major 2nd",
  b3: "Minor 3rd",
  "3": "Major 3rd",
  "4": "Perfect 4th",
  b5: "Tritone",
  "#4": "Tritone",
  "5": "Perfect 5th",
  b6: "Minor 6th",
  "#5": "Minor 6th",
  "6": "Major 6th",
  b7: "Minor 7th",
  "7": "Major 7th",
}

const practiceText = (locale: Locale, value: string): string => {
  if (locale === "en") return value
  return EXACT_TEXT[value] ?? THAI_COPY[value] ?? value
}

const interpolate = (
  template: string,
  values: Record<string, string | number> = {}
): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match
  )

export const practiceCopy = (
  locale: Locale,
  value: string,
  values?: Record<string, string | number>
): string => {
  const translated = practiceText(locale, value)
  return interpolate(translated, values)
}

/** Translates known generated lesson strings at render time; saved data is untouched. */
export const localizePracticeText = (locale: Locale, value: string): string => {
  if (locale === "en") return value

  const exact = practiceText(locale, value)
  if (exact !== value) return exact

  const displayRoot = (note: string): string =>
    CHROMATIC.includes(note as NoteName) ? getKeyLabel(note as NoteName) : note

  let match = value.match(/^Question (\d+) \/ (\d+)$/)
  if (match)
    return practiceCopy(locale, "Question {current} / {total}", {
      current: match[1],
      total: match[2],
    })
  match = value.match(/^Construction · (\d+)\/(\d+)$/)
  if (match)
    return practiceCopy(locale, "Construction · {current}/{total}", {
      current: match[1],
      total: match[2],
    })
  match = value.match(/^Find (.+)$/)
  if (match)
    return practiceCopy(locale, "Find {label}", {
      label: localizePracticeText(locale, match[1]),
    })
  match = value.match(/^(b2|b3|b5|b6|b7|#4|#5|R|2|3|4|5|6|7) of (.+)$/)
  if (match) return `${INTERVAL_LABELS[match[1]] ?? match[1]} ของ ${match[2]}`
  match = value.match(/^the root (.+)$/)
  if (match) return `Root ${match[1]}`
  match = value.match(/^every (.+)$/)
  if (match) return `Note ${match[1]} ทุก Position`
  match = value.match(/^Name the note at string (\d+), fret (\d+)$/)
  if (match)
    return practiceCopy(
      locale,
      "Name the note at string {string}, fret {fret}",
      { string: match[1], fret: match[2] }
    )
  match = value.match(/^Which note is (.+) in (.+) chord\?$/)
  if (match)
    return practiceCopy(locale, "Which note is {interval} in {chord}?", {
      interval: INTERVAL_LABELS[match[1]] ?? match[1],
      chord: match[2],
    })
  match = value.match(/^Which note is (.+) above (.+)\?$/)
  if (match)
    return practiceCopy(locale, "Which note is {interval} above {root}?", {
      interval: INTERVAL_LABELS[match[1]] ?? match[1],
      root: match[2],
    })
  match = value.match(/^Continue after (.+)$/)
  if (match)
    return practiceCopy(locale, "Continue after {note}", { note: match[1] })
  match = value.match(/^What comes after (.+)\?$/)
  if (match)
    return practiceCopy(locale, "What comes after {note}?", { note: match[1] })
  match = value.match(/^Correct — (.+)$/)
  if (match) return practiceCopy(locale, "Correct — {note}", { note: match[1] })
  match = value.match(/^That position is (.+)$/)
  if (match)
    return practiceCopy(locale, "That position is {note}", { note: match[1] })
  match = value.match(/^(.+) is not the requested target$/)
  if (match)
    return practiceCopy(locale, "{note} is not the requested target", {
      note: match[1],
    })
  match = value.match(/^\d+ BPM start · (gap click|steady click)$/)
  if (match) return value.replace(match[1], practiceCopy(locale, match[1]))
  match = value.match(/^\+(\d+) points over your recent baseline$/)
  if (match) return `+${match[1]} จุดจากค่าพื้นฐานล่าสุด`
  match = value.match(/^(\d+)ms tighter than your recent baseline$/)
  if (match) return `${match[1]}ms แม่นยำกว่าค่าพื้นฐานล่าสุด`
  match = value.match(/^\+(\d+) over your recent baseline$/)
  if (match) return `+${match[1]} จากค่าพื้นฐานล่าสุด`
  match = value.match(/^(\d+) BPM · (\d+) bars$/)
  if (match)
    return `${match[1]} BPM · ${match[2]} ${practiceCopy(locale, "bars")}`
  match = value.match(/^(.+) · (\d+) BPM · (\d+) bars$/)
  if (match)
    return `${practiceCopy(locale, match[1])} · ${match[2]} BPM · ${match[3]} ${practiceCopy(locale, "bars")}`
  match = value.match(/^(.+) root · (\d+) interval builds$/)
  if (match)
    return `${displayRoot(match[1])} ${practiceCopy(locale, "root")} · ${match[2]} ${practiceCopy(locale, "interval builds")}`
  match = value.match(/^Strings (.+) · frets (.+)$/)
  if (match)
    return `${practiceCopy(locale, "Strings")} ${match[1]} · ${practiceCopy(locale, "Fret range").toLowerCase()} ${match[2]}`
  match = value.match(/^(.+) reference · (\d+) signals$/)
  if (match)
    return `${displayRoot(match[1])} ${practiceCopy(locale, "root")} · ${match[2]} ${practiceCopy(locale, "signals")}`
  match = value.match(/^(.+) · positions (\d+) → (\d+)$/)
  if (match)
    return `${localizePracticeText(locale, match[1])} · ${practiceCopy(locale, "positions")} ${match[2]} → ${match[3]}`
  match = value.match(/^([A-G](?:#|b)?) (.+)$/)
  if (match) {
    const scale = practiceText(locale, match[2].toLowerCase())
    if (scale !== match[2].toLowerCase())
      return `${displayRoot(match[1])} ${scale}`
  }
  match = value.match(/^(.+) · clean changes only$/)
  if (match) return `${match[1]} · ${practiceCopy(locale, "clean changes")}`
  match = value.match(/^(.+) note hunt$/)
  if (match) return `หา Note ${match[1]}`
  match = value.match(/^(.+) (.+) · (.+)$/)
  if (match) {
    const technique = practiceText(locale, match[3])
    const scale = practiceText(locale, match[2].toLowerCase())
    return `${match[1]} ${scale} · ${technique}`
  }
  match = value.match(
    /^Improvise a short phrase in (.+) (.+)\. Use (.+) in one bar, then answer it with a different phrase\.$/
  )
  if (match)
    return practiceCopy(
      locale,
      "Improvise a short phrase in {root} {scale}. Use {technique} in one bar, then answer it with a different phrase.",
      {
        root: match[1],
        scale: practiceText(locale, match[2].toLowerCase()),
        technique: practiceText(locale, match[3].toLowerCase()),
      }
    )
  match = value.match(
    /^Make a short melody in (.+) (.+)\. Start in position (\d+), cross into position (\d+), and return\.$/
  )
  if (match)
    return practiceCopy(
      locale,
      "Make a short melody in {root} {scale}. Start in position {from}, cross into position {to}, and return.",
      {
        root: match[1],
        scale: practiceText(locale, match[2].toLowerCase()),
        from: match[3],
        to: match[4],
      }
    )
  match = value.match(
    /^Play a simple groove with (.+) and (.+)\. Change chords every bar, then try a different strumming pattern\.$/
  )
  if (match)
    return practiceCopy(
      locale,
      "Play a simple groove with {first} and {second}. Change chords every bar, then try a different strumming pattern.",
      {
        first: match[1],
        second: match[2],
      }
    )
  match = value.match(
    /^Play one chord or muted strings using your (.+) rhythm\. Leave space in the third bar, then come back on the beat\.$/
  )
  if (match)
    return practiceCopy(
      locale,
      "Play one chord or muted strings using your {pattern} rhythm. Leave space in the third bar, then come back on the beat.",
      {
        pattern: practiceText(locale, match[1]),
      }
    )

  return value
}

export const localizeChallengeGoal = (
  locale: Locale,
  goal: {
    metric: string
    target: number
    label?: string
  }
): string => {
  if (locale === "en") {
    const verb =
      goal.metric === "responseTime" || goal.metric === "timingVariability"
        ? "Reach"
        : "Hit"
    const value =
      goal.metric === "accuracy"
        ? `${Math.round(goal.target * 100)}% accuracy`
        : goal.metric === "responseTime"
          ? `${(goal.target / 1000).toFixed(1)}s response`
          : goal.metric === "timingVariability"
            ? `${Math.round(goal.target)}ms timing spread`
            : goal.metric === "cleanCount"
              ? `${Math.round(goal.target)} ${goal.label ?? "clean rounds"}`
              : `${Math.round(goal.target)} BPM`
    return `${verb} ${value}`
  }

  const verb =
    goal.metric === "responseTime" || goal.metric === "timingVariability"
      ? "ทำให้ถึง"
      : "ทำให้ได้"
  const value =
    goal.metric === "accuracy"
      ? `${Math.round(goal.target * 100)}% ${practiceCopy(locale, "accuracy")}`
      : goal.metric === "responseTime"
        ? `${(goal.target / 1000).toFixed(1)}s ${practiceCopy(locale, "response")}`
        : goal.metric === "timingVariability"
          ? `${Math.round(goal.target)}ms ${practiceCopy(locale, "timing spread")}`
          : goal.metric === "cleanCount"
            ? `${Math.round(goal.target)} ${practiceCopy(locale, goal.label ?? "clean rounds")}`
            : `${Math.round(goal.target)} BPM`
  return `${verb} ${value}`
}

export const localizeChallengeValue = (
  locale: Locale,
  value: number,
  metric: string,
  cleanCountLabel = "clean rounds"
): string => {
  if (locale === "en") {
    return metric === "accuracy"
      ? `${Math.round(value * 100)}% accuracy`
      : metric === "responseTime"
        ? `${(value / 1000).toFixed(1)}s response`
        : metric === "timingVariability"
          ? `${Math.round(value)}ms timing spread`
          : metric === "cleanCount"
            ? `${Math.round(value)} ${cleanCountLabel}`
            : `${Math.round(value)} BPM`
  }
  const result =
    metric === "accuracy"
      ? `${Math.round(value * 100)}% ${practiceCopy(locale, "accuracy")}`
      : metric === "responseTime"
        ? `${(value / 1000).toFixed(1)}s ${practiceCopy(locale, "response")}`
        : metric === "timingVariability"
          ? `${Math.round(value)}ms ${practiceCopy(locale, "timing spread")}`
          : metric === "cleanCount"
            ? `${Math.round(value)} ${practiceCopy(locale, cleanCountLabel)}`
            : `${Math.round(value)} BPM`
  return result
}

export const localizePracticeSkill = (
  locale: Locale,
  skill: string
): string => {
  if (locale === "en") return skill.replace(/([A-Z])/g, " $1")
  const labels: Record<string, string> = {
    fretboardRecall: "Fretboard Recall",
    tempoLadder: "ไต่ระดับ Tempo",
    technique: "เทคนิค",
    chordTransition: "Chord Changes",
    earTraining: "Ear Training",
    rhythm: "Rhythm",
    positionConnection: "Position Links",
    construction: "Music Theory",
  }
  return labels[skill] ?? localizePracticeText(locale, skill)
}
