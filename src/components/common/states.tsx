import type { ReactNode } from "react";
import { Construction, Inbox } from "lucide-react";
import { PageHeader } from "./PageHeader";

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="text-muted-foreground">{icon ?? <Inbox className="size-8" />}</div>
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle="This module is part of the upcoming rollout." />
      <EmptyState
        icon={<Construction className="size-8" />}
        title="Coming soon"
        description="The foundation, design system, and reference modules are in place — this module will follow the same patterns."
      />
    </div>
  );
}
