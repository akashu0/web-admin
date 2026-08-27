"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { WhyChooseEditor, type WhyChooseValue } from '@/components/common/WhyChooseEditor';

interface WhyChooseSectionProps {
    data?: WhyChooseValue;
    onSave: (data: WhyChooseValue) => void;
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(value);
        onNext();
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
