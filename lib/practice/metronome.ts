export const clampBpm = (bpm: number): number =>
  Math.max(30, Math.min(240, Math.round(bpm)))

export const secondsPerBeat = (bpm: number): number => 60 / clampBpm(bpm)

export const secondsPerSubdivision = (
  bpm: number,
  subdivision: number
): number => secondsPerBeat(bpm) / Math.max(1, subdivision)

export const calculateTapTempo = (timestamps: readonly number[]): number | null => {
  if (timestamps.length < 2) return null
  const recent = timestamps.slice(-6)
  const gaps = recent.slice(1).map((time, index) => time - recent[index])
  const valid = gaps.filter((gap) => gap >= 250 && gap <= 2000)
  if (valid.length === 0) return null
  const averageGap = valid.reduce((total, gap) => total + gap, 0) / valid.length
  return clampBpm(60000 / averageGap)
}

export const getNearestBeatOffset = (
  timestampMs: number,
  startedAtMs: number,
  bpm: number,
  subdivision = 1
): number => {
  const interval = secondsPerSubdivision(bpm, subdivision) * 1000
  const elapsed = timestampMs - startedAtMs
  return elapsed - Math.round(elapsed / interval) * interval
}
