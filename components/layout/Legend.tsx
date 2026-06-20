"use client"

const ITEMS: { family: 1 | 2 | 3 | 4; label: string }[] = [
  { family: 1, label: "Root (1)" },
  { family: 2, label: "2nd / 3rd" },
  { family: 3, label: "4th / 5th" },
  { family: 4, label: "6th / 7th" },
]

const COLOR_BY_FAMILY: Record<1 | 2 | 3 | 4, string> = {
  1: "var(--color-deg1)",
  2: "var(--color-deg2)",
  3: "var(--color-deg3)",
  4: "var(--color-deg4)",
}

export function Legend() {
  return (
    <div
      className="flex flex-wrap items-center gap-[14px] bg-[var(--surface)]"
      style={{ borderTop: "1px solid var(--border)", padding: "10px 32px" }}
    >
      <span
        className="text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        Legend
      </span>
      {ITEMS.map(({ family, label }) => (
        <div
          key={family}
          className="flex items-center gap-[5px] text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div
            className="h-[9px] w-[9px] rounded-full"
            style={{ backgroundColor: COLOR_BY_FAMILY[family] }}
            aria-hidden
          />
          {label}
        </div>
      ))}
    </div>
  )
}
