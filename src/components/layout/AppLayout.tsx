import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ScrollRootContext } from "./scroll-root";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { UnsavedChangesProvider } from "@/app/unsaved-changes";

export const AppLayout = () => {
  const mainRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ScrollRootContext.Provider value={mainRef}>
     <UnsavedChangesProvider>
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
          {/* `relative` is load-bearing: overflow only clips absolutely
              positioned descendants when this element is their containing
              block. Without it every `sr-only` span in a table row (one per
              row-actions button) escaped the clip and stretched the DOCUMENT to
              the full list height — giving the page a second scrollbar that
              scrolled through thousands of pixels of nothing. */}
          <main ref={mainRef} className="relative flex-1 overflow-y-auto p-4 lg:p-5">
            <Outlet />
          </main>
        </div>
      </div>
     </UnsavedChangesProvider>
    </ScrollRootContext.Provider>
  );
};
