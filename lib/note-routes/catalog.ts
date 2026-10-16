import type { ScaleRouteSelection } from "@/types/note-routes"

export const ROUTE_REVISION = "pentatonic-v1" as const
export const ROUTE_PAIR_ID = "neighbor-boxes" as const
export const ROUTE_PLACEMENT_ID = "movable" as const

export const SHAPE_OFFSETS = {
  "shape-a": [
    [0, 3],
    [0, 2],
    [0, 2],
    [0, 2],
    [0, 3],
    [0, 3],
  ],
  "shape-b": [
    [3, 5],
    [2, 5],
    [2, 5],
    [2, 4],
    [3, 5],
    [3, 5],
  ],
} as const

export const CONNECTION = [
  [0, 0],
  [0, 3],
  [1, 0],
  [1, 2],
  [2, 0],
  [2, 2],
  [3, 0],
  [3, 2],
  [3, 4],
  [4, 3],
  [4, 5],
  [5, 3],
  [5, 5],
] as const

export const supportsRouteSelection = (selection: ScaleRouteSelection) =>
  selection.revision === ROUTE_REVISION &&
  selection.pairId === ROUTE_PAIR_ID &&
  selection.placementId === ROUTE_PLACEMENT_ID
