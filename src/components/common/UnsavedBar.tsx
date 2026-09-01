import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

/**
 * The visible half of edit mode: while a section holds unsaved edits this bar
 * says so and offers the two ways out, so Save and Discard are one click away
 * rather than only reachable by trying to leave and being stopped.
 */
export function UnsavedBar({ className }: { className?: string }) {
  const { dirty, entry } = useUnsavedChanges();
  const [busy, setBusy] = useState(false);

  if (!dirty || !entry) return null;

  const save = async () => {
    if (!entry.save) return;
    setBusy(true);
    try {
      await entry.save();
    } catch {
      // The section's own save handler already surfaces the failure as a toast.
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={
        "flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm dark:border-amber-500/40 dark:bg-amber-500/10 " +
        (className ?? "")
      }
    >
      <span className="size-2 shrink-0 rounded-full bg-amber-500" />
      <span className="font-medium text-amber-900 dark:text-amber-200">
        Unsaved changes in {entry.label}
      </span>
      <span className="text-amber-800/80 dark:text-amber-200/70">
        Save or discard them before leaving this page.
      </span>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => entry.discard?.()} disabled={busy}>
          Discard
        </Button>
        {entry.save && (
          <Button size="sm" onClick={save} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
