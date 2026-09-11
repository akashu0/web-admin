import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NotLiveWarning } from "@/components/common/reference-status";
import { useSectionGuard } from "@/hooks/use-unsaved-changes";
import { showsOnWebsite } from "@/lib/publishing";
import { apiErrorMessage } from "@/services/api";
import { vacancyService } from "@/services/vacancyService";
import { CommissionTierField } from "@/pages/University/Commission/Commissiontierfield";
import {
    AUDIENCE_LABELS,
    emptyCommissionForm,
    toCommissionFormValues,
    type CommissionAudience,
    type VacancyCommissionFormValues,
    type VacancyPublishStatus,
} from "@/types/vacancy";

/**
 * What eG earns on THIS job, edited in place.
 *
 * Two of them, one per audience: the B2C Incentive tab (agents) and the B2B
 * Incentive tab (part-timers). Same component, different `audience` — the API
 * stores one card per job per audience and upserts, so there is no create/edit
 * distinction to make here.
 *
 * It is the second thing on this page web-admin owns outright, after the FAQ.
 * The CRM writes what the opening SAYS; what eG earns on it is a commercial
 * decision the CRM never sees, which is why this writes through its own route
 * rather than through any job-content save.
 *
 * Flat, not levelled. The university's card is split six ways by course level
 * and a job has no equivalent axis; where a job needs tiering it goes on each
 * range's label — "1-5", "6-15" — which is what that field was always for.
 */
export function JobCommissionSection({
    vacancyId,
    publishStatus,
    audience,
}: {
    vacancyId: string;
    /** For the not-live warning — a card on a draft is read by nobody. */
    publishStatus: VacancyPublishStatus;
    audience: CommissionAudience;
}) {
    const qc = useQueryClient();
    const label = `${AUDIENCE_LABELS[audience]} Incentive`;

    /*
     * Nested under this job's key rather than a shared ["commissions"] prefix.
     * The university tab invalidates ["commissions"] wholesale after every save,
     * which would throw away job cards it knows nothing about; and with no
     * cross-job commission list, the grouping would buy nothing anyway.
     */
    const queryKey = ["vacancy", vacancyId, "commission", audience];

    const { data: card, isLoading, isError } = useQuery({
        queryKey,
        queryFn: () => vacancyService.getCommission(vacancyId, audience),
    });

    const save = useMutation({
        mutationFn: (values: VacancyCommissionFormValues) =>
            vacancyService.saveCommission(vacancyId, values, audience),
        onSuccess: () => {
            toast.success(`${label} saved`);
            // Only this card. Saving an incentive changes nothing on the job
            // itself, so the job query is deliberately left alone.
            qc.invalidateQueries({ queryKey });
        },
        onError: (err) => toast.error(apiErrorMessage(err, `Failed to save the ${label}`)),
    });

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <Card className="border-destructive/30 bg-destructive/5 p-3 text-destructive">
                Failed to load the {label} for this job.
            </Card>
        );
    }

    return (
        <Card className="space-y-4 p-5">
            {!showsOnWebsite(publishStatus) && (
                <NotLiveWarning
                    kind="job"
                    status={publishStatus}
                    surface="agent and part-time portals"
                    // Not "publish it in the Jobs menu": this job is published
                    // by the button at the top of this very page.
                    hint="Use Publish at the top of this page."
                />
            )}

            <CommissionCardForm
                // The form seeds its state once, so a remount is what makes a
                // save show the stored card — normalisation dropped the blank
                // rows, and the editor should show what the server kept.
                key={card?.updatedAt ?? "new"}
                guardId={`job.commission.${audience}`}
                guardLabel={label}
                initialValues={card ? toCommissionFormValues(card) : undefined}
                isSubmitting={save.isPending}
                onSubmit={async (values) => {
                    await save.mutateAsync(values);
                }}
            />
        </Card>
    );
}

/**
 * The card itself, and the unsaved-changes guard that protects it.
 *
 * Separate from the data wrapper because the guard needs the live form state,
 * and because `onSubmit` MUST be allowed to reject — see below.
 */
function CommissionCardForm({
    guardId,
    guardLabel,
    initialValues,
    isSubmitting = false,
    onSubmit,
}: {
    guardId: string;
    guardLabel: string;
    initialValues?: VacancyCommissionFormValues;
    isSubmitting?: boolean;
    /** Must reject on failure — the guard reads a resolved promise as saved. */
    onSubmit: (values: VacancyCommissionFormValues) => Promise<void>;
}) {
    const [values, setValues] = useState<VacancyCommissionFormValues>(
        initialValues ?? emptyCommissionForm(),
    );

    const set = <K extends keyof VacancyCommissionFormValues>(
        key: K,
        val: VacancyCommissionFormValues[K],
    ) => setValues((prev) => ({ ...prev, [key]: val }));

    const submit = async () => {
        // Rethrown rather than swallowed, so the guard cannot treat a failed
        // save as a saved one and let the navigation — and the edits — go.
        // The mutation's onError has already shown the toast.
        await onSubmit(values);
    };

    /*
     * No `ready` flag: the section renders this only once the fetch has
     * settled, and the state is seeded synchronously from `initialValues`, so
     * the first render already holds the loaded card. Discard is what
     * `onRestore` puts back.
     */
    useSectionGuard({
        id: guardId,
        label: guardLabel,
        value: values,
        onSave: submit,
        onRestore: setValues,
    });

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Leave this empty if the job pays no incentive. Add one rate with no label
                for a flat fee, or several labelled <strong>1-5</strong>, <strong>6-15</strong>{" "}
                and so on to tier it by how many candidates are placed.
            </p>

            {/* The university's editor, reused as-is. Without `onCopyToLevels`
                it renders exactly this flat card and knows nothing of courses. */}
            <CommissionTierField
                label="Incentive per placement"
                value={values.tier}
                onChange={(tier) => set("tier", tier)}
            />

            <div className="space-y-1.5">
                <Label htmlFor={`${guardId}-bonus`}>Additional bonus</Label>
                <Input
                    id={`${guardId}-bonus`}
                    placeholder="e.g. 3 or more placements — extra 200 EUR each"
                    value={values.additionalBonus}
                    onChange={(e) => set("additionalBonus", e.target.value)}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor={`${guardId}-notes`}>Important notes to partner</Label>
                <Textarea
                    id={`${guardId}-notes`}
                    rows={5}
                    placeholder="Anything the partner must know before putting candidates forward…"
                    value={values.importantNotes}
                    onChange={(e) => set("importantNotes", e.target.value)}
                />
            </div>

            <div className="flex justify-end">
                {/* The rejection is swallowed HERE and only here: this click has
                    already been reported by the toast, and an unhandled
                    rejection would reach the console for nothing. The guard
                    still sees the real one, because it calls `submit` itself. */}
                <Button onClick={() => void submit().catch(() => {})} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    Save {guardLabel}
                </Button>
            </div>
        </div>
    );
}
