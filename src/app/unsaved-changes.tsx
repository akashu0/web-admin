import { useCallback, useEffect, useMemo, useState } from "react";
import { useBlocker } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiErrorMessage } from "@/services/api";
import { UnsavedContext, type Registration } from "@/hooks/use-unsaved-changes";

/**
 * Holds the registry of sections with unsaved edits and owns the one dialog
 * that asks about them.
 *
 * Mounted inside AppLayout, which is inside the router: `useBlocker` works only
 * under a data router, which is why main.tsx uses createBrowserRouter.
 */
export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Record<string, Registration>>({});
  // The in-page transition waiting on an answer. Route changes use `blocker`.
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const register = useCallback((id: string, reg: Registration) => {
    setEntries((prev) => {
      const current = prev[id];
      if (
        current &&
        current.dirty === reg.dirty &&
        current.label === reg.label &&
        current.save === reg.save &&
        current.discard === reg.discard
      ) {
        return prev; // nothing changed — do not re-render the tree on a keystroke
      }
      return { ...prev, [id]: reg };
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setEntries((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // Only one section can be dirty at a time — every way of reaching a second one
  // passes through this guard first — so the first dirty entry IS the state.
  const dirtyEntry = useMemo(
    () => Object.values(entries).find((e) => e.dirty) ?? null,
    [entries],
  );
  const isDirty = dirtyEntry !== null;

  // Reload, tab close, or a URL typed into the address bar. The browser shows
  // its own generic prompt here; the wording cannot be customised.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // Catches in-app navigation AND the browser's Back/Forward buttons.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  const requestLeave = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action();
        return;
      }
      // Stored inside a thunk: useState treats a bare function as an updater.
      setPendingAction(() => action);
    },
    [isDirty],
  );

  const open = blocker.state === "blocked" || pendingAction !== null;

  const close = useCallback(() => {
    setSaveError(null);
    setPendingAction(null);
    if (blocker.state === "blocked") blocker.reset();
  }, [blocker]);

  const proceed = useCallback(() => {
    setSaveError(null);
    const action = pendingAction;
    setPendingAction(null);
    if (action) action();
    if (blocker.state === "blocked") blocker.proceed();
  }, [blocker, pendingAction]);

  const handleDiscard = useCallback(() => {
    dirtyEntry?.discard?.();
    proceed();
  }, [dirtyEntry, proceed]);

  const handleSave = useCallback(async () => {
    if (!dirtyEntry?.save) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await dirtyEntry.save();
      proceed();
    } catch (error) {
      // A failed save must never let the navigation through — that is exactly
      // the moment the work would be lost.
      setSaveError(
        apiErrorMessage(
          error,
          error instanceof Error ? error.message : "Could not save. Please try again.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }, [dirtyEntry, proceed]);

  const value = useMemo(
    () => ({ register, unregister, requestLeave, dirtyEntry }),
    [register, unregister, requestLeave, dirtyEntry],
  );

  return (
    <UnsavedContext.Provider value={value}>
      {children}

      <AlertDialog open={open} onOpenChange={(next) => !next && !isSaving && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              {dirtyEntry
                ? `${dirtyEntry.label} has edits that have not been saved yet.`
                : "There are edits that have not been saved yet."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {saveError && <p className="text-sm text-destructive">{saveError}</p>}

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isSaving}>Keep editing</AlertDialogCancel>
            <Button variant="outline" onClick={handleDiscard} disabled={isSaving}>
              Discard changes
            </Button>
            {dirtyEntry?.save && (
              <AlertDialogAction
                onClick={(e) => {
                  // The default action closes the dialog; a save that fails must
                  // leave it open with the reason.
                  e.preventDefault();
                  void handleSave();
                }}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save &amp; leave
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UnsavedContext.Provider>
  );
}
