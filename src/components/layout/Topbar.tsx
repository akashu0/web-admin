import { Menu } from "lucide-react";
import { ThemeToggle } from "@/app/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { initials } from "@/lib/utils";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const name = user?.name ?? "Staff";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-3 lg:px-5">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />

        <div className="ml-1 flex items-center gap-2.5 border-l border-border pl-3">
          {/* Name and role stacked and right-aligned: the eye lands on the edge
              of the bar, and the role answers "signed in as what". */}
          <div className="hidden text-right leading-tight sm:block">
            <p className="max-w-[160px] truncate text-[13px] font-semibold">{name}</p>
            {user?.role && (
              <p className="max-w-[160px] truncate text-[11px] text-muted-foreground">
                {user.role}
              </p>
            )}
          </div>
          <Avatar className="size-8">
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
