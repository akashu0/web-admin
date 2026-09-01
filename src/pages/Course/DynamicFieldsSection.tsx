
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { DynamicFieldBuilder } from '@/components/common/DynamicFieldBuilder';
import type { DynamicField } from '@/types/course';
import { toast } from 'sonner';
import { useSectionGuard } from '@/hooks/use-unsaved-changes';

interface DynamicFieldsSectionProps {
    data: DynamicField[];
    onSave: (data: DynamicField[]) => Promise<void> | void;
    onNext?: () => void;
}

export function DynamicFieldsSection({
    data,
    onSave,
    onNext,
}: DynamicFieldsSectionProps) {
    const [fields, setFields] = useState<DynamicField[]>(data || []);

    const submit = async () => {
        await onSave(fields);
    };

    useSectionGuard({
        id: 'course.dynamicFields',
        label: 'Additional Fields',
        value: fields,
        onSave: submit,
        onRestore: setFields,
    });

    const handleSave = async () => {
        try {
            await submit();
            onNext?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not save this section');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Settings className="h-8 w-8 text-foreground" />
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Additional Fields</h2>
                    <p className="text-sm text-muted-foreground">Optional: Add any custom fields specific to this course</p>
                </div>
            </div>

            <DynamicFieldBuilder fields={fields} onChange={setFields} />

            <div className="flex justify-end gap-4 pt-6 border-t mt-8">
                <Button type="button" onClick={handleSave} className="bg-primary hover:bg-primary">
                    Save Additional Fields
                </Button>
            </div>
        </div>
    );
}