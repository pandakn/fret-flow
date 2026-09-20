"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NoteName } from "@/types/music"
import { useState } from "react"
import { type PlaybackStep, usePlayback } from "./hooks/usePlayback"

interface PlaybackControlsProps {
  root: NoteName
  sequence: readonly PlaybackStep[]
  playLabel: string
  unavailableLabel: string
}

export function PlaybackControls({
  root,
  sequence,
  playLabel,
  unavailableLabel,
}: PlaybackControlsProps) {
  const [bpm, setBpm] = useState(80)
  const [loop, setLoop] = useState(false)
  const { playing, toggle } = usePlayback({ root, sequence, bpm, loop })
  const isAvailable = sequence.length > 0
  const buttonLabel = playing
    ? "Stop"
    : isAvailable
      ? playLabel
      : unavailableLabel

  return (
    <section
      className="mt-auto"
      style={{ padding: "14px 16px", borderTop: "1px solid var(--border)" }}
    >
      <div
        className="mb-2.5 text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        Playback
      </div>
      <Button
        onClick={toggle}
        disabled={!isAvailable}
        size="sm"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-md text-[13px] font-bold transition-opacity hover:opacity-85",
          !isAvailable && "cursor-not-allowed opacity-50 hover:opacity-50"
        )}
        style={{
          padding: "9px",
          backgroundColor: "var(--accent)",
          color: "var(--accent-foreground)",
          fontFamily: "var(--font-sans)",
        }}
        type="button"
        aria-pressed={playing}
        aria-label={buttonLabel}
      >
        {playing ? (
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              backgroundColor: "var(--accent-foreground)",
              borderRadius: "1px",
            }}
          />
        ) : (
          <span
            aria-hidden
            style={{
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "4px 0 4px 8px",
              borderColor:
                "transparent transparent transparent var(--accent-foreground)",
            }}
          />
        )}
        {playing ? "Stop" : isAvailable ? playLabel : unavailableLabel}
      </Button>
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className="text-[9px] tracking-[0.12em] uppercase"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          BPM
        </span>
        <input
          type="number"
          value={bpm}
          min={40}
          max={200}
          onChange={(e) =>
            setBpm(Math.max(40, Math.min(200, Number(e.target.value) || 80)))
          }
          className="flex-1 rounded-md outline-none"
          style={{
            backgroundColor: "var(--surface2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            padding: "5px 8px",
          }}
        />
        <Button
          onClick={() => setLoop((currentLoop) => !currentLoop)}
          variant="outline"
          size="xs"
          className={cn(
            "rounded-md transition-colors",
            loop
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--text)]"
          )}
          style={{
            border: "1px solid var(--border-2)",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            padding: "4px 9px",
          }}
          aria-pressed={loop}
          type="button"
        >
          Loop
        </Button>
      </div>
    </section>
  )
}
