import type { MessageKey } from "@/lib/i18n/messages"
import type { ProgressionId } from "@/lib/progressions/catalog"

const PROGRESSION_MESSAGES = {
  pop_15_64: { label: "progPop1564", description: "progPop1564Description" },
  pop_64_15: { label: "progPop6415", description: "progPop6415Description" },
  pop_50s: { label: "progPop50s", description: "progPop50sDescription" },
  pop_oda_royal: {
    label: "progPopOdaRoyal",
    description: "progPopOdaRoyalDescription",
  },
  rnb_doo_wop: { label: "progRnbDooWop", description: "progRnbDooWopDescription" },
  rnb_descend: { label: "progRnbDescend", description: "progRnbDescendDescription" },
  rnb_vamp: { label: "progRnbVamp", description: "progRnbVampDescription" },
  neosoul_2_5_1: {
    label: "progNeoSoul251",
    description: "progNeoSoul251Description",
  },
  neosoul_1_4: {
    label: "progNeoSoul14",
    description: "progNeoSoul14Description",
  },
  neosoul_turnaround: {
    label: "progNeoSoulTurnaround",
    description: "progNeoSoulTurnaroundDescription",
  },
  neosoul_movie: {
    label: "progNeoSoulMovie",
    description: "progNeoSoulMovieDescription",
  },
  blues_12bar: {
    label: "progBlues12bar",
    description: "progBlues12barDescription",
  },
  blues_12bar_quick: {
    label: "progBlues12barQuick",
    description: "progBlues12barQuickDescription",
  },
  blues_minor: {
    label: "progBluesMinor",
    description: "progBluesMinorDescription",
  },
  funk_1_4_vamp: {
    label: "progFunk14Vamp",
    description: "progFunk14VampDescription",
  },
  funk_9ths: { label: "progFunk9ths", description: "progFunk9thsDescription" },
  funk_one_chord: {
    label: "progFunkOneChord",
    description: "progFunkOneChordDescription",
  },
} satisfies Record<ProgressionId, { label: MessageKey; description: MessageKey }>

export const getProgressionLabelKey = (id: ProgressionId): MessageKey =>
  PROGRESSION_MESSAGES[id].label

export const getProgressionDescriptionKey = (id: ProgressionId): MessageKey =>
  PROGRESSION_MESSAGES[id].description
