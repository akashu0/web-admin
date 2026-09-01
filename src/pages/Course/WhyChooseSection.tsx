"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { WhyChooseEditor, type WhyChooseValue } from '@/components/common/WhyChooseEditor';
import { toast } from 'sonner';
import { useSectionGuard } from '@/hooks/use-unsaved-changes';

interface WhyChooseSectionProps {
    data?: WhyChooseValue;
    onSave: (data: WhyChooseValue) => Promise<void> | void;
    onNext: () => void;
}

/**
 * Course sections do not call the API themselves — they hand the value up and
 * EditCourse's handleSectionUpdate does the PATCH. Same contract as
 * CareerOpportunitiesSection.
 */
export function WhyChooseSection({ data, onSave, onNext }: WhyChooseSectionProps) {
    const [value, setValue] = useState<WhyChooseValue>({
        heading: data?.heading ?? '',
        content: data?.content ?? '',
    });

    const submit = async () => {
        await onSave(value);
    };

    useSectionGuard({
        id: 'course.whyChoose',
        label: 'Why Choose',
        value,
        onSave: submit,
        onRestore: setValue,
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-8 w-8 text-foreground" />
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Why Choose</h2>
                    <p className="text-sm text-muted-foreground">
                        The case for choosing this course, in your own words
                    </p>
                </div>
            </div>

            <WhyChooseEditor
                value={value}
                onChange={setValue}
                defaultHeading="Why Choose This Course"
                subject="this course"
            />

            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="submit" className="bg-primary hover:bg-primary">
                    Save &amp; Continue
                </Button>
            </div>
        </form>
    );
}
