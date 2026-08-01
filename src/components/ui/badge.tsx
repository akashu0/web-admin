import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
 * Status pill — WHITE + PURPLE palette only. Semantics are conveyed by
 * intensity, not hue: filled purple = done/positive, soft purple = active/info,
 * grey = pending/neutral, outline = attention. The tone names are kept for API
 * stability across the app but all map onto this purple/grey scale.
 */
const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap leading-tight",
  {
    variants: {
      tone: {
        // grey / neutral
        neutral: "bg-muted text-muted-foreground",
        gray: "bg-muted text-muted-foreground",
        // soft purple (active / informational)
        primary: "bg-accent text-accent-foreground",
        blue: "bg-accent text-accent-foreground",
        violet: "bg-accent text-accent-foreground",
        cyan: "bg-accent text-accent-foreground",
        amber: "bg-accent text-accent-foreground",
        // filled purple (done / positive)
        green: "bg-primary text-primary-foreground",
        // outline purple (attention / exception)
        red: "border border-primary/40 bg-transparent text-primary",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

const dotColor: Record<NonNullable<VariantProps<typeof badgeVariants>["tone"]>, string> = {
  neutral: "bg-muted-foreground",
  gray: "bg-muted-foreground",
  primary: "bg-primary",
  blue: "bg-primary",
  violet: "bg-primary",
  cyan: "bg-primary",
  amber: "bg-primary",
  green: "bg-primary-foreground",
  red: "bg-primary",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone = "neutral", dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", dotColor[tone ?? "neutral"])}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { badgeVariants };
