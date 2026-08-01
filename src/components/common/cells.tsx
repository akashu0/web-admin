import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

/** Avatar + primary/secondary text — the standard identity cell. */
export function NameCell({
  name,
  sub,
  size = 8,
}: {
  name?: string;
  sub?: string;
  size?: 8 | 9;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className={size === 9 ? "size-9" : "size-8"}>
        <AvatarFallback className="text-[10px]">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium">{name ?? "—"}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export function MoneyCell({ amount, currency }: { amount?: number; currency?: string }) {
  if (amount == null) return <>—</>;
  return (
    <span className="font-semibold tabular-nums">
      {currency ? `${currency} ` : ""}
      {amount.toLocaleString()}
    </span>
  );
}
