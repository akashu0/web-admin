import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { initials } from "@/lib/utils";

/** Standard drawer header: avatar/initials, title, status pill, subtitle. */
export function DrawerHeader({
  title,
  subtitle,
  statusLabel,
  statusTone = "neutral",
  square,
}: {
  title: string;
  subtitle?: string;
  statusLabel?: string;
  statusTone?: BadgeProps["tone"];
  square?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border p-5 pr-12">
      <Avatar className={square ? "size-12 rounded-xl" : "size-12"}>
        <AvatarFallback className={square ? "rounded-xl text-sm" : "text-sm"}>
          {initials(title)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <SheetTitle className="truncate text-lg font-semibold">{title}</SheetTitle>
        <SheetDescription asChild>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {statusLabel && (
              <Badge tone={statusTone} dot>
                {statusLabel}
              </Badge>
            )}
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        </SheetDescription>
      </div>
    </div>
  );
}

export function DrawerBody({ children }: { children: ReactNode }) {
  return <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">{children}</div>;
}

export function DrawerSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        {action}
      </div>
      {children}
    </div>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 text-sm">{children}</div>;
}

export function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="mt-0.5 truncate font-medium">{value || "—"}</div>
    </div>
  );
}

export function StatChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function DrawerFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-t border-border bg-muted/40 p-4">{children}</div>
  );
}
