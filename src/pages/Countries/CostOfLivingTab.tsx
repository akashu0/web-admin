// components/CountryForm/tabs/CostOfLivingTab.tsx
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/common/states';
import type { CountryFormValues } from './country-form-values';

interface CostOfLivingTabProps {
    form: UseFormReturn<CountryFormValues>;
}

/**
 * Tuition and living are the same row shape, so one component covers both —
 * `kind` picks which nested array of the parent cost section it edits.
 */
function CostItemList({
    form,
    costIndex,
    kind,
    label,
    placeholder,
}: {
    form: UseFormReturn<CountryFormValues>;
    costIndex: number;
    kind: 'tuition' | 'living';
    label: string;
    placeholder: string;
}) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `costOfLiving.${costIndex}.${kind}` as const,
    });

    return (
        <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
                <Label>{label}</Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => append({ label: '', currency: 'USD' })}
                >
                    + Add Item
                </Button>
            </div>

            <div className="space-y-2">
                {fields.map((field, itemIndex) => (
                    <div
                        key={field.id}
                        className="grid grid-cols-12 items-end gap-2 rounded-lg border border-border bg-card p-2"
                    >
                        <Input
                            className="col-span-4"
                            placeholder={placeholder}
                            {...form.register(`costOfLiving.${costIndex}.${kind}.${itemIndex}.label`)}
                        />
                        <Input
                            className="col-span-3"
                            type="number"
                            placeholder="Min"
                            {...form.register(`costOfLiving.${costIndex}.${kind}.${itemIndex}.min`, {
                                valueAsNumber: true,
                            })}
                        />
                        <Input
                            className="col-span-3"
                            type="number"
                            placeholder="Max"
                            {...form.register(`costOfLiving.${costIndex}.${kind}.${itemIndex}.max`, {
                                valueAsNumber: true,
                            })}
                        />
                        <Input
                            className="col-span-1"
                            placeholder="USD"
                            maxLength={3}
                            {...form.register(`costOfLiving.${costIndex}.${kind}.${itemIndex}.currency`)}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="col-span-1 text-destructive hover:text-destructive"
                            onClick={() => remove(itemIndex)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CostOfLivingTab({ form }: CostOfLivingTabProps) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'costOfLiving',
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-h3 font-semibold">Cost of Living</h3>
                <Button type="button" onClick={() => append({ tuition: [], living: [], note: '' })}>
                    <Plus className="mr-2 size-4" />
                    Add Cost Section
                </Button>
            </div>

            {fields.map((field, costIndex) => (
                <div key={field.id} className="rounded-lg border border-border bg-muted/40 p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-medium">Cost Section {costIndex + 1}</h4>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => remove(costIndex)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>

                    <CostItemList
                        form={form}
                        costIndex={costIndex}
                        kind="tuition"
                        label="Tuition Costs"
                        placeholder="Label (e.g., Undergraduate)"
                    />

                    <CostItemList
                        form={form}
                        costIndex={costIndex}
                        kind="living"
                        label="Living Costs"
                        placeholder="Label (e.g., Accommodation)"
                    />

                    <div className="space-y-1.5">
                        <Label>Note</Label>
                        <Textarea
                            rows={2}
                            placeholder="Additional notes about costs..."
                            {...form.register(`costOfLiving.${costIndex}.note`)}
                        />
                    </div>
                </div>
            ))}

            {fields.length === 0 && (
                <EmptyState
                    title="No cost sections added yet"
                    description='Click "Add Cost Section" to get started.'
                />
            )}
        </div>
    );
}
