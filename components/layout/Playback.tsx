"use client"

import { useState } from "react"
import { usePlayback } from "./hooks/usePlayback"
import { cn } from "@/lib/utils"
import type { NoteName } from "@/types/music"

interface PlaybackProps {
  root: NoteName
  scaleId: string
}

export function Playback({ root, scaleId }: PlaybackProps) {
  const [bpm, setBpm] = useState(80)
  const [loop, setLoop] = useState(false)
  const { playing, toggle } = usePlayback({ root, scaleId, bpm, loop })

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
      <button
        onClick={toggle}
        className="flex w-full items-center justify-center gap-2 rounded-md text-[13px] font-bold transition-opacity hover:opacity-85"
        style={{
          padding: "9px",
          backgroundColor: "var(--accent)",
          color: "var(--accent-foreground)",
          fontFamily: "var(--font-sans)",
        }}
        type="button"
        aria-pressed={playing}
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
        {playing ? "Stop" : "Play scale"}
      </button>
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className="text-[9px] tracking-[0.12em] uppercase"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
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
        <button
          onClick={() => setLoop((l) => !l)}
          className={cn(
            "rounded-md transition-colors",
            loop
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--muted)] hover:text-[var(--text)]"
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
        </button>
      </div>
    </section>
  )
}
