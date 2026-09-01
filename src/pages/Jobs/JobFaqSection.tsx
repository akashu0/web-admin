import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/services/api";
import { faqService } from "@/services/faqservice";
import { vacancyService } from "@/services/vacancyService";
import type { IFAQ } from "@/types/faq";
import { NotLiveWarning } from "@/components/common/reference-status";
import { showsOnWebsite } from "@/lib/publishing";
import { useSectionGuard } from "@/hooks/use-unsaved-changes";

/**
 * The FAQ shown alongside a published job.
 *
 * The one editable thing on this page besides the publish control, and
 * deliberately so: the CRM owns what the opening SAYS, web-admin owns how it
 * reads once it is live. The API keeps the same split — this writes through
 * `PATCH /vacancies/review/{id}/faq`, which the CRM's job patch cannot reach.
 *
 * Only FAQs with entityType "Job" are offered. Attaching a university's FAQ to a
 * vacancy would work at the database level and read as nonsense on the board.
 */
export function JobFaqSection({
    vacancyId,
    faqId,
    onSaved,
}: {
    vacancyId: string;
    faqId?: string;
    onSaved: () => void;
}) {
    const [faqs, setFaqs] = useState<IFAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState(faqId ?? "");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await faqService.getAllFAQs({ entityType: "Job", limit: 200 });
                if (!cancelled) setFaqs(response.data ?? []);
            } catch (error) {
                if (!cancelled) toast.error(apiErrorMessage(error, "Could not load the Job FAQs"));
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const submit = async () => {
        setIsSaving(true);
        try {
            await vacancyService.setFaq(vacancyId, selected);
            toast.success(selected ? "FAQ attached to this job" : "FAQ removed from this job");
            onSaved();
        } catch (error) {
            const message = apiErrorMessage(error, "Could not save the FAQ");
            toast.error(message);
            // Rethrown so the unsaved-changes guard cannot treat a failed save
            // as a saved one and let the navigation through.
            throw new Error(message);
        } finally {
            setIsSaving(false);
        }
    };

    useSectionGuard({
        id: "job.faq",
        label: "Job FAQ",
        value: selected,
        onSave: submit,
        onRestore: setSelected,
    });

    const chosen = faqs.find((f) => f._id === selected);

    return (
        <div className="space-y-2">
            <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={isLoading || isSaving}
                className="w-full rounded-lg border border-input px-4 py-2 focus:border-primary focus:ring-2 focus:ring-ring"
            >
                <option value="">
                    {isLoading ? "Loading…" : faqs.length ? "No FAQ" : "No Job FAQs created yet"}
                </option>
                {faqs.map((faq) => (
                    <option key={faq._id} value={faq._id}>
                        {faq.title}
                        {showsOnWebsite(faq.status) ? "" : ` — ${faq.status}`}
                    </option>
                ))}
            </select>

            {selected && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-accent p-3">
                    <span className="flex-1 text-sm">{chosen?.title ?? "Selected FAQ"}</span>
                    <button
                        type="button"
                        onClick={() => setSelected("")}
                        className="text-muted-foreground hover:text-foreground"
                        title="Remove selection"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* The id is attached but names a FAQ this list does not hold — it was
                deleted, or its entity type was changed after it was attached. */}
            {selected && !isLoading && !chosen && (
                <p className="text-sm text-muted-foreground">
                    The attached FAQ is no longer available under Job FAQs. Choose another, or
                    clear it.
                </p>
            )}

            {chosen && !showsOnWebsite(chosen.status) && (
                <NotLiveWarning kind="FAQ" status={chosen.status} where="FAQs" />
            )}

            {!isLoading && faqs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Create one under FAQs with the entity type <strong>Job</strong>, and it will
                    appear here.
                </p>
            )}

            <div className="flex justify-end">
                <Button
                    size="sm"
                    onClick={() => void submit().catch(() => {})}
                    disabled={isSaving || isLoading || selected === (faqId ?? "")}
                >
                    {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    Save FAQ
                </Button>
            </div>
        </div>
    );
}
