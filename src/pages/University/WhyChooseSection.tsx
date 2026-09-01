import { useState } from "react";
import { toast } from "sonner";
import { useSectionGuard } from "@/hooks/use-unsaved-changes";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhyChooseEditor, type WhyChooseValue } from "@/components/common/WhyChooseEditor";
import { universityService } from "@/services/universityService";

interface WhyChooseSectionProps {
    slug: string;
    initialData?: WhyChooseValue;
    onSuccess: () => void;
}

/**
 * University sections PATCH from inside the section and the page only toasts and
 * refetches — same contract as StudentLifeSection.
 */
export function WhyChooseSection({ slug, initialData, onSuccess }: WhyChooseSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [value, setValue] = useState<WhyChooseValue>({
        heading: initialData?.heading ?? "",
        content: initialData?.content ?? "",
    });

    const submit = async () => {
        await universityService.updateWhyChoose(slug, value);
        onSuccess();
    };

    useSectionGuard({
        id: "university.whyChoose",
        label: "Why Choose",
        value,
        onSave: submit,
        onRestore: setValue,
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await submit();
        } catch (error: any) {
            console.error("Error updating why choose:", error);
            toast.error(error.response?.data?.message || "Failed to update why choose");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Why Choose</CardTitle>
                    <CardDescription>
                        The case for choosing this university, in your own words
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <WhyChooseEditor
                        value={value}
                        onChange={setValue}
                        defaultHeading="Why Choose This University"
                        subject="this university"
                    />

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Why Choose
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
