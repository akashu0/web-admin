import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  trendTone = "primary",
  accent = "primary",
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: string;
  trendTone?: BadgeProps["tone"];
  /** Purple-only palette: `solid` fills the icon chip for emphasis. */
  accent?: "primary" | "solid";
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            accent === "solid" ? "bg-primary text-primary-foreground" : "bg-accent text-primary",
          )}
        >
          <Icon className="size-[18px]" />
        </div>
        {trend && <Badge tone={trendTone}>{trend}</Badge>}
      </div>
      <p className="text-[26px] font-bold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
