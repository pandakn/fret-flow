import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

type FretFlowLogoProps = ComponentPropsWithoutRef<"span">

/**
 * FretFlow's product mark: a bent string arriving at the upper dot of a
 * twelfth-fret inlay, with the second dot held in place below.
 */
export function FretFlowLogo({ className, ...props }: FretFlowLogoProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-(--text)", className)}
      role="img"
      aria-label="FretFlow"
      {...props}
    >
      <svg
        className="h-8 w-11 shrink-0"
        viewBox="0 0 40 30"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M2 5h36M2 11c10-7 25-7 36 0M2 19h36M2 25h36"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        <circle cx="20" cy="7" r="3.25" fill="#dd1923" />
        <circle cx="20" cy="22" r="3.25" fill="#7bab8e" />
      </svg>
    </span>
  )
}
