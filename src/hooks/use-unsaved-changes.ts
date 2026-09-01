import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useWatch, type FieldValues, type SubmitHandler, type UseFormReturn } from "react-hook-form";
import { deepEqual } from "@/lib/deep-equal";

/**
 * One editor section that currently holds unsaved edits.
 *
 * `save` and `discard` are referentially stable — `useSectionGuard` keeps the
 * real callbacks in a ref and registers wrappers, so a section re-rendering on
 * every keystroke does not re-register itself on every keystroke.
 */
export interface Registration {
  label: string;
  dirty: boolean;
  save?: () => Promise<void> | void;
  discard?: () => void;
}

export interface UnsavedContextValue {
  register: (id: string, reg: Registration) => void;
  unregister: (id: string) => void;
  /**
   * The single entry point for every in-page transition — section rails, tabs,
   * modal closes, Sign Out. Runs `action` immediately when nothing is dirty,
   * otherwise asks first. Route changes are caught by the blocker instead.
   */
  requestLeave: (action: () => void) => void;
  dirtyEntry: Registration | null;
}

export const UnsavedContext = createContext<UnsavedContextValue | null>(null);

export function useUnsavedContext(): UnsavedContextValue {
  const ctx = useContext(UnsavedContext);
  if (!ctx) {
    throw new Error("useUnsavedContext must be used inside <UnsavedChangesProvider>");
  }
  return ctx;
}

/** `{ dirty, entry }` for anything that just wants to render the edit-mode state. */
export function useUnsavedChanges() {
  const { dirtyEntry } = useUnsavedContext();
  return { dirty: dirtyEntry !== null, entry: dirtyEntry };
}

/**
 * Registers one section with the guard.
 *
 * `value` is whatever the section currently holds — `useWatch({ control })` for
 * a react-hook-form section, the state object for a useState one. Dirtiness is
 * "differs from the snapshot taken when this section became live", which is
 * exactly what Discard restores. It is deliberately NOT react-hook-form's
 * `formState.isDirty`: the existing `setValue` calls (intake toggles, image
 * pickers) omit `shouldDirty`, so isDirty stays false through real edits.
 */
export function useSectionGuard<T>({
  id,
  label,
  value,
  onSave,
  onRestore,
  ready = true,
}: {
  id: string;
  label: string;
  value: T;
  /**
   * The section's submit. Must THROW on failure — a save that did not happen
   * must never let the navigation through.
   */
  onSave?: () => Promise<void> | void;
  /** Put the section back to the snapshot it started from. */
  onRestore?: (baseline: T) => void;
  /**
   * False while this form is not live — still fetching what it edits, or, for a
   * modal, closed. Nothing is dirty while it is false, and the baseline is
   * re-taken the moment it turns true. A section that seeds its state from an
   * effect would otherwise read as dirty from its first render, before anyone
   * had touched it.
   */
  ready?: boolean;
}) {
  const { register, unregister } = useUnsavedContext();

  const latest = useRef({ onSave, onRestore, value });
  useEffect(() => {
    latest.current = { onSave, onRestore, value };
  });

  const [baseline, setBaseline] = useState<T>(value);
  const wasReady = useRef(ready);
  useEffect(() => {
    // Re-snapshot on every false -> true edge: a section that has finished
    // loading, or a modal reopened after being closed. Taken in an effect, so
    // the value it captures is the one the seeding render produced.
    if (ready && !wasReady.current) setBaseline(latest.current.value);
    wasReady.current = ready;
  }, [ready]);

  const dirty = ready && !deepEqual(baseline, value);

  const hasSave = Boolean(onSave);
  const save = useCallback(async () => {
    await latest.current.onSave?.();
  }, []);
  const discard = useCallback(() => {
    latest.current.onRestore?.(baseline);
  }, [baseline]);

  useEffect(() => {
    register(id, { label, dirty, save: hasSave ? save : undefined, discard });
  }, [register, id, label, dirty, hasSave, save, discard]);

  useEffect(() => () => unregister(id), [unregister, id]);

  return { dirty };
}

/**
 * `useSectionGuard` for the react-hook-form sections. Dirtiness comes from the
 * live values rather than `formState.isDirty`, Save runs the form's own
 * validation first, and Discard is a `reset` back to what was loaded.
 */
export function useRhfSectionGuard<T extends FieldValues>({
  id,
  label,
  form,
  submit,
  ready,
}: {
  id: string;
  label: string;
  form: UseFormReturn<T>;
  submit: SubmitHandler<T>;
  ready?: boolean;
}) {
  const value = useWatch({ control: form.control }) as T;

  const save = useCallback(async () => {
    // handleSubmit resolves even when validation fails, so record whether the
    // handler actually ran and turn "it did not" into a throw.
    let submitted = false;
    await form.handleSubmit(async (values) => {
      await submit(values);
      submitted = true;
    })();
    if (!submitted) {
      throw new Error("Some fields still need attention. Fix them, then save.");
    }
  }, [form, submit]);

  return useSectionGuard<T>({
    id,
    label,
    value,
    ready,
    onSave: save,
    onRestore: (baseline) => form.reset(baseline),
  });
}

/**
 * Wraps a dialog's `onOpenChange` so that closing it — including by clicking the
 * backdrop or pressing Escape — asks first when the form inside holds unsaved
 * input. Opening is never blocked.
 */
export function useGuardedDialog(onOpenChange: (open: boolean) => void) {
  const { requestLeave } = useUnsavedContext();
  return useCallback(
    (open: boolean) => {
      if (open) {
        onOpenChange(true);
        return;
      }
      requestLeave(() => onOpenChange(false));
    },
    [onOpenChange, requestLeave],
  );
}
