import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, FileText } from 'lucide-react';
import type { DocumentRequired } from '@/types/course';
import {
    CUSTOM_CATEGORY,
    DEFAULT_COURSE_DOCUMENTS,
    DEFAULT_DOCUMENT_NAMES,
} from './courseDocumentDefaults';
import { toast } from 'sonner';
import { useSectionGuard } from '@/hooks/use-unsaved-changes';

interface DocumentsRequiredSectionProps {
    data: DocumentRequired[];
    onSave: (data: DocumentRequired[]) => Promise<void> | void;
    onNext: () => void;
}

/** A stored row keyed by document name, for seeding the default list. */
type StoredByName = Map<string, DocumentRequired>;

/**
 * The default rows, in catalogue order, each carrying whatever the course has
 * already stored for it.
 *
 * A course that has never been edited gets every default switched OFF: the
 * editor decides which apply, and switching them all on by default would put
 * fourteen documents on every course page without anyone choosing them.
 */
function seedDefaults(stored: StoredByName): DocumentRequired[] {
    return DEFAULT_COURSE_DOCUMENTS.flatMap((group) =>
        group.documents.map((def) => {
            const existing = stored.get(def.documentName);
            return {
                id: existing?.id ?? `default:${def.documentName}`,
                documentName: def.documentName,
                description: existing?.description ?? def.description ?? '',
                isMandatory: existing?.isMandatory ?? def.isMandatory,
                category: group.category,
                // Absent means active — a legacy row that predates the flag was
                // added on purpose, so it stays on.
                isActive: existing ? existing.isActive !== false : false,
            };
        }),
    );
}

/**
 * Anything stored that is not in the catalogue: documents an editor added by
 * hand, and anything a previous version of this form saved.
 */
function seedCustom(data: DocumentRequired[]): DocumentRequired[] {
    return data
        .filter((d) => !DEFAULT_DOCUMENT_NAMES.has(d.documentName))
        .map((d) => ({
            ...d,
            id: d.id ?? `custom:${d.documentName}`,
            category: d.category || CUSTOM_CATEGORY,
            isActive: d.isActive !== false,
        }));
}

export function DocumentsRequiredSection({
    data,
    onSave,
    onNext,
}: DocumentsRequiredSectionProps) {
    const storedByName = useMemo<StoredByName>(
        () => new Map((data ?? []).map((d) => [d.documentName, d])),
        [data],
    );

    const [defaults, setDefaults] = useState<DocumentRequired[]>(() => seedDefaults(storedByName));
    const [custom, setCustom] = useState<DocumentRequired[]>(() => seedCustom(data ?? []));

    const patchDefault = (index: number, patch: Partial<DocumentRequired>) =>
        setDefaults((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));

    const patchCustom = (index: number, patch: Partial<DocumentRequired>) =>
        setCustom((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));

    const addCustom = () =>
        setCustom((prev) => [
            ...prev,
            {
                id: `custom:${Date.now()}`,
                documentName: '',
                description: '',
                isMandatory: false,
                category: CUSTOM_CATEGORY,
                isActive: true,
            },
        ]);

    const removeCustom = (index: number) =>
        setCustom((prev) => prev.filter((_, i) => i !== index));

    const activeCount =
        defaults.filter((d) => d.isActive).length + custom.filter((d) => d.isActive).length;

    /**
     * Throws when the section is not fit to save. The unsaved-changes guard turns
     * that into "you cannot leave yet"; the Save button into a toast.
     */
    const submit = async () => {
        if (custom.some((d) => !d.documentName?.trim())) {
            throw new Error('Give every additional document a name, or remove it');
        }
        // Both lists are saved whole, inactive rows included: an editor who
        // switches a document off and back on should not have to retype its
        // details. The public page is served only the active ones.
        await onSave([...defaults, ...custom]);
    };

    useSectionGuard({
        id: 'course.documents',
        label: 'Documents Required',
        value: { defaults, custom },
        onSave: submit,
        onRestore: (baseline) => {
            setDefaults(baseline.defaults);
            setCustom(baseline.custom);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await submit();
            onNext();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not save this section');
        }
    };

    // The default rows, back in their groups, with the index into `defaults` so a
    // change knows which row it is patching.
    let cursor = 0;
    const grouped = DEFAULT_COURSE_DOCUMENTS.map((group) => ({
        ...group,
        rows: group.documents.map(() => cursor++),
    }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-foreground" />
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Documents Required for Admission
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Switch on the documents this course asks for. {activeCount} shown on the
                        website.
                    </p>
                </div>
            </div>

            {grouped.map((group) => (
                <Card key={group.category}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{group.category}</CardTitle>
                        {group.hint && <CardDescription>{group.hint}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-border">
                            {group.rows.map((index) => {
                                const doc = defaults[index];
                                return (
                                    <div
                                        key={doc.documentName}
                                        className="py-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                                <span className="text-sm font-semibold text-foreground">
                                                    {doc.documentName}
                                                </span>
                                                {doc.isActive && doc.isMandatory && (
                                                    <span className="text-[10px] font-bold bg-accent text-primary px-2 py-0.5 rounded-full">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            <Textarea
                                                value={doc.description ?? ''}
                                                onChange={(e) =>
                                                    patchDefault(index, { description: e.target.value })
                                                }
                                                placeholder={`Details or notes for ${doc.documentName}…`}
                                                rows={2}
                                                disabled={!doc.isActive}
                                                className="resize-none text-sm disabled:opacity-60"
                                            />
                                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!doc.isMandatory}
                                                    disabled={!doc.isActive}
                                                    onChange={(e) =>
                                                        patchDefault(index, { isMandatory: e.target.checked })
                                                    }
                                                    className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-ring"
                                                />
                                                Mandatory
                                            </label>
                                        </div>

                                        <div className="flex flex-col items-center gap-1 pt-1 sm:pt-6 sm:pl-4">
                                            <Switch
                                                checked={!!doc.isActive}
                                                onCheckedChange={(checked) =>
                                                    patchDefault(index, { isActive: checked })
                                                }
                                            />
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {doc.isActive ? 'On' : 'Off'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* ── Custom documents ─────────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">Additional Documents</CardTitle>
                            <CardDescription>
                                Anything this course asks for that is not in the list above.
                            </CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addCustom}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {custom.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No additional documents. Click "Add Another" to add one.
                        </p>
                    )}

                    {custom.map((doc, index) => (
                        <div key={doc.id} className="p-4 border border-border rounded-lg space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor={`custom-name-${index}`}>Document Name *</Label>
                                    <Input
                                        id={`custom-name-${index}`}
                                        value={doc.documentName ?? ''}
                                        onChange={(e) =>
                                            patchCustom(index, { documentName: e.target.value })
                                        }
                                        placeholder="e.g., Medical Certificate"
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-1 pt-7">
                                    <Switch
                                        checked={!!doc.isActive}
                                        onCheckedChange={(checked) =>
                                            patchCustom(index, { isActive: checked })
                                        }
                                    />
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                        {doc.isActive ? 'On' : 'Off'}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCustom(index)}
                                    aria-label={`Remove ${doc.documentName || 'document'}`}
                                    className="mt-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <Textarea
                                value={doc.description ?? ''}
                                onChange={(e) => patchCustom(index, { description: e.target.value })}
                                placeholder="Additional details about this document…"
                                rows={2}
                                className="resize-none text-sm"
                            />

                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!doc.isMandatory}
                                    onChange={(e) => patchCustom(index, { isMandatory: e.target.checked })}
                                    className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-ring"
                                />
                                Mandatory
                            </label>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="submit" className="bg-primary hover:bg-primary">
                    Save &amp; Continue
                </Button>
            </div>
        </form>
    );
}
