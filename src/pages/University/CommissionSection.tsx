import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { commissionService } from "@/services/commissionService";
import { apiErrorMessage } from "@/services/api";
import { CommissionForm } from "./Commission/Commissionform";
import { toFormValues, type CommissionFormValues } from "@/types/commission";

/**
 * The partner commission for THIS university, edited in place.
 *
 * One record per university, upserted by the API — so there is no create/edit
 * distinction here, and an imported record that was never linked gets adopted
 * (and linked) by the first save rather than duplicated.
 */
export function CommissionSection({
    slug,
    audience,
    onSuccess,
}: {
    slug: string;
    /** "parttimer" for the part-timer rate card; omitted = the agent card. */
    audience?: "agent" | "parttimer";
    onSuccess?: () => void;
}) {
    const qc = useQueryClient();

    const { data: commission, isLoading, isError } = useQuery({
        queryKey: ["commissions", "university", slug, audience ?? "agent"],
        queryFn: () => commissionService.getForUniversity(slug, audience),
    });

    const save = useMutation({
        mutationFn: (values: CommissionFormValues) =>
            commissionService.saveForUniversity(slug, values, audience),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["commissions"] });
            onSuccess?.();
        },
        onError: (err) => toast.error(apiErrorMessage(err, "Failed to save commission")),
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
                Failed to load the commission for this university.
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CommissionForm
                // The form seeds its state once, so a remount is what makes a
                // save (or a cancel) show the stored record again.
                key={commission?.updatedAt ?? "new"}
                universityLocked
                mode={commission ? "edit" : "create"}
                initialValues={commission ? toFormValues(commission) : undefined}
                isSubmitting={save.isPending}
                onSubmit={async (values) => {
                    await save.mutateAsync(values);
                }}
                // Nothing to cancel out of in a tab — reset to what is stored.
                onCancel={() =>
                    qc.invalidateQueries({ queryKey: ["commissions", "university", slug, audience ?? "agent"] })
                }
            />
        </Card>
    );
}
