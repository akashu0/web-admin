// components/CountryForm/tabs/UspTab.tsx
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { WhyChooseEditor } from '@/components/common/WhyChooseEditor';
import type { CountryFormValues } from './country-form-values';

interface UspTabProps {
    form: UseFormReturn<CountryFormValues>;
}

/**
 * Country tabs are dumb: the page owns the single react-hook-form instance and
 * its "Save Section" button, so this only reads and writes `whyChoose` on it.
 */
export function UspTab({ form }: UspTabProps) {
    // useWatch, not getValues: RichTextEditor is controlled, so the tab has to
    // re-render when the value changes or typing would not stick.
    const whyChoose = useWatch({ control: form.control, name: 'whyChoose' });

    return (
        <WhyChooseEditor
            value={whyChoose ?? {}}
            onChange={(value) =>
                form.setValue('whyChoose', value, { shouldDirty: true })
            }
            defaultHeading="Why Choose This Country"
            subject="this country"
        />
    );
}
