import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    FileText,
    Pencil,
    RefreshCcw,
    Plane,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { EmptyState } from "@/components/common/states";
import { StatChip } from "@/components/common/detail";
import { visaService } from "@/services/visaService";
import type { VisaDocument, VisaStep } from "@/types/visa";

/**
 * Read-only view of one country's visa process.
 *
 * No tabs: a visa is four short lists, and stacking them means the whole process
 * can be read in one scroll — which is what someone checking a country actually
 * wants.
 */
export function VisaViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: visa, isLoading, isError } = useQuery({
        queryKey: ["visas", "detail", id],
        queryFn: () => visaService.getVisaById(id!),
        enabled: Boolean(id),
    });

    if (isLoading) return <PageLoader />;

    if (isError || !visa) {
        return (
            <div>
                <PageHeader
                    title="Visa not found"
                    actions={
                        <Button variant="outline" onClick={() => navigate("/visas")}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Visas
                        </Button>
                    }
                />
                <EmptyState
                    title="Could not load this visa"
                    description={`No record answered for "${id}".`}
                />
            </div>
        );
    }

    const steps = [...(visa.visaSteps ?? [])].sort(
        (a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0),
    );

    return (
        <div>
            <PageHeader
                title={`${visa.country} visa`}
                subtitle="Fees, requirements, process and renewal"
                actions={
                    <>
                        <Button variant="outline" onClick={() => navigate("/visas")}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                        {/* The visa editor is a modal on the list, so editing means
                            going back with the record in hand. */}
                        <Button onClick={() => navigate("/visas", { state: { editVisa: visa } })}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </Button>
                    </>
                }
            />

            <Card className="mb-4 flex flex-wrap items-center gap-3 p-4">
                <Plane className="size-5 text-primary" />
                <span className="text-lg font-semibold">{visa.country}</span>
                <Badge tone={visa.status === "active" ? "green" : "neutral"} dot>
                    {visa.status === "active" ? "Active" : "Inactive"}
                </Badge>
            </Card>

            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatChip
                    label="Visa fee"
                    value={[visa.visaFee, visa.currency].filter(Boolean).join(" ") || "—"}
                />
                <StatChip
                    label="Processing time"
                    value={
                        <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {[visa.visaProcessingTime, visa.visaProcessingTimeUnit]
                                .filter(Boolean)
                                .join(" ") || "—"}
                        </span>
                    }
                />
                <StatChip label="Success rate" value={visa.visaSuccessRate || "—"} />
                <StatChip label="Renewal cost" value={visa.visaRenewalCost || "—"} />
            </div>

            <div className="space-y-4">
                <DocumentList
                    title="Required documents"
                    icon={<FileText className="size-4" />}
                    docs={visa.visaDocuments}
                    emptyLabel="No documents listed"
                />

                <Card className="p-5">
                    <SectionTitle icon={<Plane className="size-4" />} title="Process" />
                    {steps.length ? (
                        <ol className="space-y-3">
                            {steps.map((s: VisaStep, i: number) => (
                                <li key={i} className="flex gap-3">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                                        {s.stepNumber ?? i + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">{s.title}</p>
                                        {s.description && (
                                            <p className="text-sm text-muted-foreground">{s.description}</p>
                                        )}
                                        {s.estimatedDays ? (
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                ~{s.estimatedDays} days
                                            </p>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-sm text-muted-foreground">No steps recorded.</p>
                    )}
                </Card>

                <DocumentList
                    title="Renewal documents"
                    icon={<RefreshCcw className="size-4" />}
                    docs={visa.renewalDocuments}
                    emptyLabel="No renewal documents listed"
                />
            </div>
        </div>
    );
}

function DocumentList({
    title,
    icon,
    docs,
    emptyLabel,
}: {
    title: string;
    icon: React.ReactNode;
    docs?: VisaDocument[];
    emptyLabel: string;
}) {
    return (
        <Card className="p-5">
            <SectionTitle icon={icon} title={`${title}${docs?.length ? ` (${docs.length})` : ""}`} />
            {docs?.length ? (
                <ul className="divide-y divide-border">
                    {docs.map((d, i) => (
                        <li key={i} className="flex flex-wrap items-start justify-between gap-3 py-3">
                            <span className="flex min-w-0 items-start gap-2">
                                <CheckCircle2
                                    className={
                                        d.isMandatory
                                            ? "mt-0.5 size-4 shrink-0 text-primary"
                                            : "mt-0.5 size-4 shrink-0 text-muted-foreground"
                                    }
                                />
                                <span className="min-w-0">
                                    <span className="text-sm font-medium">{d.name}</span>
                                    {d.description && (
                                        <span className="block text-sm text-muted-foreground">
                                            {d.description}
                                        </span>
                                    )}
                                </span>
                            </span>
                            <Badge tone={d.isMandatory ? "green" : "neutral"}>
                                {d.isMandatory ? "Mandatory" : "Optional"}
                            </Badge>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">{emptyLabel}</p>
            )}
        </Card>
    );
}

function SectionTitle({ icon, title }: { icon?: React.ReactNode; title: string }) {
    return (
        <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {icon}
            {title}
        </h3>
    );
}
