import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { IFAQ } from "@/types/faq";
import { Separator } from "@radix-ui/react-select";

interface FAQViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    faq: IFAQ | null;
}

export const FAQViewDialog = ({
    open,
    onOpenChange,
    faq,
}: FAQViewDialogProps) => {
    if (!faq) return null;

    const statusConfig = {
        active: {
            label: 'Active',
            className: 'bg-accent text-primary',
        },
        inactive: {
            label: 'Inactive',
            className: 'bg-muted text-foreground',
        },
        draft: {
            label: 'Draft',
            className: 'bg-muted text-muted-foreground',
        },
    };

    const config = statusConfig[faq.status as keyof typeof statusConfig] || statusConfig.draft;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-[85vw] xl:max-w-[75vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{faq.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Entity Info */}
                    <div className="flex gap-6 flex-wrap">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Entity Type</p>
                            <Badge tone="red" className="text-sm">
                                {faq.entityType}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <Badge tone="neutral" className={config.className}>
                                {config.label}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                            <Badge tone="neutral" className="text-sm">
                                {faq.questions.length} {faq.questions.length === 1 ? 'Question' : 'Questions'}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Questions and Answers */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Questions & Answers</h3>
                        {faq.questions
                            .sort((a, b) => a.order - b.order)
                            .map((item, index) => (
                                <div key={index} className="space-y-3 p-4 bg-muted rounded-lg border border-border">
                                    <div className="flex items-start gap-3">
                                        <Badge tone="red" className="mt-1">
                                            #{item.order}
                                        </Badge>
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground mb-1">Question {index + 1}</p>
                                            <p className="text-base font-semibold text-foreground">
                                                {item.question}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pl-12">
                                        <p className="text-sm text-muted-foreground mb-1">Answer</p>
                                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <Separator />

                    {/* Meta Info */}
                    <div className="space-y-3 bg-muted p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">FAQ ID</p>
                                <p className="font-mono text-xs mt-1 text-foreground">{faq._id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created At</p>
                                <p className="text-sm mt-1 text-foreground">
                                    {new Date(faq.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="text-sm mt-1 text-foreground">
                                    {new Date(faq.updatedAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
