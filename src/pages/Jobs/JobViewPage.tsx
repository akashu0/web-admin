import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, FileEdit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DrawerSection, Field, FieldGrid, StatChip } from "@/components/common/detail";
import { apiErrorMessage } from "@/services/api";
import { vacancyService } from "@/services/vacancyService";
import type { Vacancy, VacancyPublishStatus } from "@/types/vacancy";
import { JobFaqSection } from "./JobFaqSection";

/**
 * One job, for the person deciding whether to publish it.
 *
 * Read-only apart from the publish control and the FAQ. Job content is authored
 * in the CRM, and letting web-admin edit it too would mean the same opening
 * could say different things in two places with no way to tell which was
 * current. Which FAQ it carries is not job content — it is a publishing
 * decision, so it belongs here and nowhere else.
 *
 * There is no employer anywhere on this page. Not hidden — absent: the API's
 * redacted projection does not carry it, and `Vacancy` here has no field for it.
 */
export function JobViewPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();

    const { data: job, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["vacancy", id],
        queryFn: () => vacancyService.getOne(id),
        enabled: Boolean(id),
    });

    const setStatus = async (status: VacancyPublishStatus) => {
        try {
            await vacancyService.bulkUpdateStatus([id], status);
            toast.success(status === "published" ? "Job published" : "Job moved to draft");
            refetch();
        } catch (err) {
            toast.error(apiErrorMessage(err, "Failed to update status"));
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError || !job) {
        return (
            <div className="space-y-4">
                <BackButton onClick={() => navigate("/jobs")} />
                <Card className="p-8 text-center">
                    <p className="font-medium">Could not load this job</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {apiErrorMessage(error, "It may have been deleted.")}
                    </p>
                </Card>
            </div>
        );
    }

    const published = job.publishStatus === "published";

    return (
        <div className="space-y-4">
            <BackButton onClick={() => navigate("/jobs")} />

            <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="truncate text-xl font-semibold">{job.title}</h1>
                            <Badge tone={published ? "green" : "neutral"}>
                                {published ? "Published" : "Draft"}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {[job.vacancyId, job.jobType, [job.city, job.country].filter(Boolean).join(", ")]
                                .filter(Boolean)
                                .join(" · ")}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {published ? (
                            <Button variant="outline" onClick={() => setStatus("draft")}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Move to Draft
                            </Button>
                        ) : (
                            <Button onClick={() => setStatus("published")}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Publish
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatChip label="Needed" value={job.requiredCount || "—"} />
                    <StatChip label="Pay" value={payLabel(job)} />
                    <StatChip label="Visa" value={job.visa?.type || "—"} />
                    <StatChip label="Processing" value={job.package?.processingTime || "—"} />
                </div>
            </Card>

            {/* space-y-5 because DrawerSection has no margin of its own — it
                relies on DrawerBody's spacing, which a plain Card does not give. */}
            <Card className="space-y-5 p-5">
                <DrawerSection title="The role">
                    <FieldGrid>
                        <Field label="Job title" value={job.title} />
                        <Field label="Job type" value={job.jobType} />
                        <Field label="Job location" value={job.location} />
                        <Field label="City" value={job.city} />
                        <Field label="Country" value={job.country} />
                        <Field label="Hiring timeline" value={job.hiringTimeline} />
                        <Field label="Required candidates" value={job.requiredCount || undefined} />
                    </FieldGrid>
                </DrawerSection>

                <DrawerSection title="Pay">
                    <FieldGrid>
                        <Field label="Shown as" value={job.pay?.showBy === "exact" ? "Exact amount" : "Range"} />
                        <Field label="Currency" value={job.pay?.currency} />
                        {job.pay?.showBy === "exact" ? (
                            <Field label="Exact amount" value={job.pay?.exactAmount} />
                        ) : (
                            <>
                                <Field label="Minimum" value={job.pay?.minAmount} />
                                <Field label="Maximum" value={job.pay?.maxAmount} />
                            </>
                        )}
                        <Field label="Rate" value={job.pay?.rate} />
                    </FieldGrid>
                </DrawerSection>

                <DrawerSection title="Visa">
                    <FieldGrid>
                        <Field label="Visa type" value={job.visa?.type} />
                        <Field label="Visa duration" value={job.visa?.duration} />
                        <Field label="Depends" value={yesNo(job.visa?.depends)} />
                    </FieldGrid>
                </DrawerSection>

                <DrawerSection title="Package">
                    <FieldGrid>
                        <Field label="Package (fees)" value={job.package?.fees} />
                        <Field label="Processing time" value={job.package?.processingTime} />
                    </FieldGrid>
                </DrawerSection>

                <DrawerSection title="FAQ">
                    <JobFaqSection
                        vacancyId={job.vacancyId}
                        faqId={job.faqId}
                        onSaved={() => { void refetch(); }}
                    />
                </DrawerSection>

                <DrawerSection title="Documents required">
                    {job.documents?.length ? (
                        <ul className="grid gap-1.5 sm:grid-cols-2">
                            {job.documents.map((d, i) => (
                                <li
                                    key={d.key || `custom-${i}`}
                                    className="flex items-center justify-between gap-2 text-sm"
                                >
                                    <span className="truncate">{d.label}</span>
                                    {/* An unanswered row reads as "—", not as a No: on a
                                        draft those are different facts. */}
                                    <Badge tone={d.required === "yes" ? "green" : "neutral"}>
                                        {yesNo(d.required)}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No documents listed.</p>
                    )}
                </DrawerSection>
            </Card>
        </div>
    );
}

function BackButton({ onClick }: { onClick: () => void }) {
    return (
        <Button variant="ghost" size="sm" onClick={onClick} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to jobs
        </Button>
    );
}

const yesNo = (v?: string): string => (v === "yes" ? "Yes" : v === "no" ? "No" : "—");

function payLabel(job: Vacancy): string {
    const p = job.pay;
    if (!p) return "—";
    const amount =
        p.showBy === "exact" ? p.exactAmount : [p.minAmount, p.maxAmount].filter(Boolean).join(" – ");
    if (!amount) return "—";
    return [p.currency, amount, p.rate].filter(Boolean).join(" ");
}
