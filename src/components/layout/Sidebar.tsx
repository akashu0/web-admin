import { NavLink } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";
import { NAV_GROUPS } from "@/app/nav";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-full w-[212px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-2.5 py-4">
      <div className="mb-4 flex items-center gap-2 px-1.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
          <GraduationCap className="size-[18px]" />
        </div>
        <div className="leading-tight">
          <h1 className="text-[15px] font-bold tracking-tight text-brand">eduGuardian</h1>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Content Admin</p>
        </div>
      </div>

      <nav className="hide-scroll flex-1 space-y-3 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-2.5 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[6px] text-[13px] transition-colors",
                      isActive
                        ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-primary" />
                      )}
                      <item.icon className="size-[17px] shrink-0" />
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate">{item.label}</span>
                        {item.hint && (
                          <span className="block truncate text-[10px] font-normal text-muted-foreground">
                            {item.hint}
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-sidebar-border/70 pt-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60"
        >
          <LogOut className="size-[17px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
