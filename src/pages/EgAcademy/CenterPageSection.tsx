import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImageUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { centerPageService } from "@/services/centerPageService";
import { CENTER_ICONS } from "@/types/centerPage";
import type { CenterPage } from "@/types/centerPage";
import { apiErrorMessage } from "@/services/api";

/**
 * One section of a centre page, described rather than hand-written.
 *
 * A centre page has nine sections and about forty fields. Written out as nine
 * forms that is ~800 lines of the same input three dozen times; described as
 * blocks it is this file plus a short spec per section, and every section gets
 * the same save behaviour, the same repeater controls and the same icon picker
 * for free. The spec lives in centerPageSpec.ts.
 */

export type CPFieldKind = "text" | "textarea" | "icon" | "image";

export interface CPField {
  key: string;
  label: string;
  kind?: CPFieldKind;
  placeholder?: string;
  hint?: string;
}

export type CPBlock =
  | { kind: "fields"; under?: string; title?: string; fields: CPField[] }
  /** `under: null` means the section's value IS the array (stats, faqs). */
  | { kind: "list"; under: string | null; title: string; itemLabel: string; fields: CPField[] };

interface Props {
  slug: string;
  /** The document key this section is stored under — "hero", "faqs", … */
  sectionKey: keyof CenterPage | "meta";
  /** Sent instead of sectionKey when a "section" is really a few loose fields. */
  patch?: (value: any) => Partial<CenterPage>;
  initial: any;
  blocks: CPBlock[];
  description?: string;
  onSaved: (page: CenterPage) => void;
}

const emptyItem = (fields: CPField[]) =>
  Object.fromEntries(fields.map((f) => [f.key, ""]));

export function CenterPageSection({
  slug,
  sectionKey,
  patch,
  initial,
  blocks,
  description,
  onSaved,
}: Props) {
  const isArraySection = blocks.some((b) => b.kind === "list" && b.under === null);
  const [value, setValue] = useState<any>(initial ?? (isArraySection ? [] : {}));
  const [isSaving, setIsSaving] = useState(false);

  // Switching sections swaps `initial` under a mounted form; without this the
  // second section shows the first one's values.
  useEffect(() => {
    setValue(initial ?? (isArraySection ? [] : {}));
  }, [initial, isArraySection]);

  const setField = (under: string | undefined, key: string, next: string) => {
    setValue((prev: any) => {
      if (!under) return { ...(prev ?? {}), [key]: next };
      return { ...(prev ?? {}), [under]: { ...(prev?.[under] ?? {}), [key]: next } };
    });
  };

  const rowsOf = (under: string | null): any[] =>
    (under === null ? value : value?.[under]) ?? [];

  const setRows = (under: string | null, rows: any[]) => {
    setValue((prev: any) => (under === null ? rows : { ...(prev ?? {}), [under]: rows }));
  };

  const save = async () => {
    try {
      setIsSaving(true);
      const body = patch ? patch(value) : ({ [sectionKey]: value } as Partial<CenterPage>);
      const updated = await centerPageService.saveSection(slug, body);
      onSaved(updated);
      toast.success("Section saved");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save this section"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {description && <p className="text-[13px] text-muted-foreground">{description}</p>}

      {blocks.map((block, bi) =>
        block.kind === "fields" ? (
          <div key={bi} className="space-y-4">
            {block.title && (
              <h3 className="text-sm font-semibold text-foreground">{block.title}</h3>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {block.fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={(block.under ? value?.[block.under] : value)?.[field.key] ?? ""}
                  onChange={(next) => setField(block.under, field.key, next)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div key={bi} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{block.title}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setRows(block.under, [...rowsOf(block.under), emptyItem(block.fields)])
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add {block.itemLabel}
              </Button>
            </div>

            {rowsOf(block.under).length === 0 && (
              <p className="rounded-lg border border-dashed border-border p-4 text-[13px] text-muted-foreground">
                No {block.itemLabel.toLowerCase()} yet — the website leaves this part of the
                page out entirely.
              </p>
            )}

            {rowsOf(block.under).map((row: any, ri: number) => {
              const rows = rowsOf(block.under);
              const update = (key: string, next: string) => {
                const copy = [...rows];
                copy[ri] = { ...copy[ri], [key]: next };
                setRows(block.under, copy);
              };
              const move = (to: number) => {
                if (to < 0 || to >= rows.length) return;
                const copy = [...rows];
                [copy[ri], copy[to]] = [copy[to], copy[ri]];
                setRows(block.under, copy);
              };
              return (
                <div key={ri} className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {block.itemLabel} {ri + 1}
                    </span>
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" title="Move up"
                        onClick={() => move(ri - 1)} disabled={ri === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" title="Move down"
                        onClick={() => move(ri + 1)} disabled={ri === rows.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button" variant="ghost" size="icon" title="Remove"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setRows(block.under, rows.filter((_, i) => i !== ri))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {block.fields.map((field) => (
                      <FieldInput
                        key={field.key}
                        field={field}
                        value={row?.[field.key] ?? ""}
                        onChange={(next) => update(field.key, next)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ),
      )}

      <div className="flex justify-end border-t border-border pt-4">
        <Button onClick={save} disabled={isSaving}>
          {isSaving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />Save section</>
          )}
        </Button>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: CPField;
  value: string;
  onChange: (next: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file?: File | null) => {
    if (!file) return;
    try {
      setIsUploading(true);
      onChange(await centerPageService.uploadImage(file));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not upload that image"));
    } finally {
      setIsUploading(false);
    }
  };

  const wide = field.kind === "textarea" || field.kind === "image";

  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <Label className="mb-1.5 block text-[13px]">{field.label}</Label>

      {field.kind === "textarea" ? (
        <Textarea rows={4} value={value} placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)} />
      ) : field.kind === "icon" ? (
        <Select value={value || "__none__"}
          onValueChange={(v) => onChange(v === "__none__" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Pick an icon" /></SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="__none__">Default (globe)</SelectItem>
            {CENTER_ICONS.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.kind === "image" ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input value={value} placeholder="https://…"
              onChange={(e) => onChange(e.target.value)} />
            <Button asChild variant="outline" disabled={isUploading}>
              <label className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageUp className="h-4 w-4" />
                )}
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => upload(e.target.files?.[0])} />
              </label>
            </Button>
          </div>
          {value && (
            <img src={value} alt="" className="h-28 w-full rounded-md border border-border object-cover" />
          )}
        </div>
      ) : (
        <Input value={value} placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)} />
      )}

      {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
    </div>
  );
}
