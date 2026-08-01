import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ScrollRootContext } from "./scroll-root";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export const AppLayout = () => {
  const mainRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ScrollRootContext.Provider value={mainRef}>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[220px] p-0" hideClose>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenu={() => setMobileOpen(true)} />
          <main ref={mainRef} className="flex-1 overflow-y-auto p-4 lg:p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </ScrollRootContext.Provider>
  );
};
