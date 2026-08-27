"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/common/RichTextEditor';

export interface WhyChooseValue {
    heading?: string;
    content?: string;
}

interface WhyChooseEditorProps {
    value: WhyChooseValue;
    onChange: (value: WhyChooseValue) => void;
    /** Shown as the heading placeholder and used by the website when heading is blank. */
    defaultHeading: string;
    /** What the paragraph is about, e.g. "this course". */
    subject: string;
}

/**
 * The USP block's fields, and nothing else.
 *
 * Purely presentational and fully controlled: no fetching, no service import, no
 * save button. Course, University and Country each wire saving their own way —
 * courses hand the value up to the page, universities PATCH from inside the
 * section, countries write into a shared react-hook-form instance — so the parts
 * they genuinely share are just these two fields.
 */
export function WhyChooseEditor({
    value,
    onChange,
    defaultHeading,
    subject,
}: WhyChooseEditorProps) {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="whyChoose-heading">Heading (optional)</Label>
                <Input
                    id="whyChoose-heading"
                    value={value.heading ?? ''}
                    onChange={(e) => onChange({ ...value, heading: e.target.value })}
                    placeholder={defaultHeading}
                    className="mt-2"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                    Leave blank to use &ldquo;{defaultHeading}&rdquo; on the website.
                </p>
            </div>

            <div>
                <Label>Why Choose Content</Label>
                <div className="mt-2">
                    <RichTextEditor
                        content={value.content ?? ''}
                        onChange={(content) => onChange({ ...value, content })}
                        placeholder={`Write the full paragraph on why a student should choose ${subject}...`}
                        minHeight="260px"
                    />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                    This appears as its own &ldquo;Why Choose&rdquo; section on the public
                    page. Leave it empty and neither the section nor its nav link is shown.
                </p>
            </div>
        </div>
    );
}
