"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

interface CollapsiblePanelProps {
  side: "left" | "right"
  open: boolean
  onOpenChange: (open: boolean) => void
  width: number
  collapsedWidth?: number
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

  return (
    <aside
      className={cn("flex flex-col overflow-hidden", className)}
      style={{ width: open ? width : collapsedWidth, ...style }}
    >
      <Collapsible
        open={open}
        onOpenChange={onOpenChange}
        className="flex h-full flex-col"
      >
        <div
          className={cn(
            "flex shrink-0 p-2",
            isLeft ? "justify-start" : "justify-end"
          )}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[var(--muted-foreground)] hover:text-[var(--text)]"
              aria-label={
                open ? `Collapse ${side} panel` : `Expand ${side} panel`
              }
            >
              <Icon className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="flex-1 overflow-y-auto data-[state=closed]:overflow-hidden">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </aside>
  )
}
