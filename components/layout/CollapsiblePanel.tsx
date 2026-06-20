"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

interface CollapsiblePanelProps {
  side: "left" | "right"
  open: boolean
  onOpenChange: (open: boolean) => void
  width: number
  collapsedWidth?: number
  /** Single key letter for the shortcut, e.g. "b" or "r". Shown as Kbd hint. */
  shortcutKey: string
  /** Platform-aware modifier label. "⌘" for mac, "Ctrl" otherwise. */
  modifier: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function CollapsiblePanel({
  side,
  open,
  onOpenChange,
  width,
  collapsedWidth = 40,
  shortcutKey,
  modifier,
  children,
  className,
  style,
}: CollapsiblePanelProps) {
  const isLeft = side === "left"
  // icon points in the direction the panel will move on click
  const Icon = open
    ? isLeft
      ? ChevronLeft
      : ChevronRight
    : isLeft
      ? ChevronRight
      : ChevronLeft

  const label = open ? `Collapse ${side} panel` : `Expand ${side} panel`

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-out",
        className
      )}
      style={{ width: open ? width : collapsedWidth, ...style }}
    >
      <Collapsible
        open={open}
        onOpenChange={onOpenChange}
        className="flex h-full flex-col"
      >
        <div
          className={cn(
            "flex shrink-0 items-center gap-1.5 p-2",
            isLeft ? "justify-start" : "justify-end"
          )}
        >
          {open && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] text-[var(--muted-foreground)]"
              style={{ fontFamily: "var(--font-mono)" }}
              aria-hidden
            >
              <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-[var(--border-2)] bg-[var(--surface2)] px-1 text-[10px] font-medium text-[var(--muted-foreground)]">
                {modifier}
              </kbd>
              <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-[var(--border-2)] bg-[var(--surface2)] px-1 text-[10px] font-semibold text-[var(--text)]">
                {shortcutKey.toUpperCase()}
              </kbd>
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[var(--muted-foreground)] hover:text-[var(--text)]"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent side={isLeft ? "right" : "left"}>
              {label}
              <span className="ml-1.5 inline-flex items-center gap-0.5">
                <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-background/20 bg-background/10 px-1 text-[9px] font-medium">
                  {modifier}
                </kbd>
                <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-background/20 bg-background/10 px-1 text-[9px] font-semibold">
                  {shortcutKey.toUpperCase()}
                </kbd>
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
        <CollapsibleContent className="flex-1 overflow-y-auto data-[state=closed]:overflow-hidden">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </aside>
  )
}
