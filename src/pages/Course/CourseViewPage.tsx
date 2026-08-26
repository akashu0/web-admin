import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Briefcase,
    Clock,
    DollarSign,
    Download,
    FileText,
    GraduationCap,
    MapPin,
    Pencil,
    Plane,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { EmptyState } from "@/components/common/states";
import { Field, FieldGrid, StatChip } from "@/components/common/detail";
import { courseService } from "@/services/courseService";
import { visaService } from "@/services/visaService";
import type {
    Brochure,
    CareerOpportunity,
    DocumentRequired,
    DynamicField,
    FeeStructure,
    VisaProcess,
} from "@/types/course";

/** The fee rows worth showing, in the order the editor asks for them. */
type FeeKey = Extract<keyof FeeStructure, string>;

const FEE_FIELDS: { key: FeeKey; label: string }[] = [
    { key: "tuitionFee", label: "Tuition" },
    { key: "applicationFee", label: "Application" },
    { key: "admissionFee", label: "Admission" },
    { key: "visaFee", label: "Visa" },
    { key: "administrationFee", label: "Administration" },
    { key: "accommodationFee", label: "Accommodation" },
    { key: "transportationFee", label: "Transportation" },
    { key: "assessmentFee", label: "Assessment" },
    { key: "examFee", label: "Exam" },
];

/**
 * Read-only view of one course, by slug, so it can be linked to and read
 * without the risk of an accidental edit.
 */
export function CourseViewPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const { data: course, isLoading, isError } = useQuery({
        queryKey: ["courses", "detail", slug],
        queryFn: () => courseService.getCourseBySlug(slug!),
        enabled: Boolean(slug),
    });

    // The course stores only the visa's id, so the names come from the visa list.
    const { data: visas } = useQuery({
        queryKey: ["visas", "for-course-view"],
        queryFn: () => visaService.getAllVisas({ limit: 200 }),
    });
    const visaById = new Map((visas?.data ?? []).map((v) => [v._id, v]));

    if (isLoading) return <PageLoader />;

    if (isError || !course) {
        return (
            <div>
                <PageHeader
                    title="Course not found"
                    actions={
                        <Button variant="outline" onClick={() => navigate("/courses")}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Courses
                        </Button>
                    }
                />
                <EmptyState
                    title="Could not load this course"
                    description={`No record answered for "${slug}".`}
                />
            </div>
        );
    }

    const c = course;
    const o = c.overview ?? ({} as typeof c.overview);
    const duration = [
        o.durationYears ? `${o.durationYears} yr` : null,
        o.durationMonths ? `${o.durationMonths} mo` : null,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div>
            <PageHeader
                title={o.courseName || "Course"}
                subtitle={[o.awardedBy && `Awarded by ${o.awardedBy}`, o.level]
                    .filter(Boolean)
                    .join(" · ")}
                actions={
                    <>
                        <Button variant="outline" onClick={() => navigate("/courses")}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                        <Button onClick={() => navigate(`/courses/${c.slug}`)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </Button>
                    </>
                }
            />

            <Card className="mb-4 flex flex-wrap items-center gap-4 p-4">
                {o.courseImage && typeof o.courseImage === "string" ? (
                    <img
                        src={o.courseImage}
                        alt=""
                        className="h-20 w-28 rounded-card border border-border object-cover"
                    />
                ) : (
                    <div className="flex h-20 w-28 items-center justify-center rounded-card border border-border bg-muted">
                        <GraduationCap className="size-6 text-muted-foreground" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={c.status === "published" ? "green" : "neutral"} dot>
                            {c.status === "published" ? "Published" : "Draft"}
                        </Badge>
                        {o.studyMode && <Badge tone="primary">{o.studyMode}</Badge>}
                        {o.stream && <Badge tone="neutral">{o.stream}</Badge>}
                        {o.universityType && <Badge tone="red">{o.universityType}</Badge>}
                    </div>
                    {o.headingDescription && (
                        <p className="mt-2 text-sm text-muted-foreground">{o.headingDescription}</p>
                    )}
                    <p className="mt-1 truncate text-xs text-muted-foreground">/{c.slug}</p>
                </div>
            </Card>

            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatChip label="Level" value={o.level || "—"} />
                <StatChip
                    label="Duration"
                    value={
                        <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {duration || "—"}
                        </span>
                    }
                />
                <StatChip label="Intakes" value={o.intakes?.length ? o.intakes.join(", ") : "—"} />
                <StatChip label="Views" value={c.viewCount ?? 0} />
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="fees">
                        <DollarSign className="mr-2 size-4" />
                        Fees
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                        <FileText className="mr-2 size-4" />
                        Documents
                    </TabsTrigger>
                    <TabsTrigger value="visa">
                        <Plane className="mr-2 size-4" />
                        Visa
                    </TabsTrigger>
                    <TabsTrigger value="career">
                        <Briefcase className="mr-2 size-4" />
                        Career
                    </TabsTrigger>
                    <TabsTrigger value="centers">
                        <MapPin className="mr-2 size-4" />
                        Centres
                    </TabsTrigger>
                </TabsList>

                {/* ── Overview ── */}
                <TabsContent value="overview" className="mt-4 space-y-4">
                    <Card className="p-5">
                        <SectionTitle title="Course details" />
                        <FieldGrid>
                            <Field label="Awarded by" value={o.awardedBy} />
                            <Field label="Level" value={o.level} />
                            <Field label="Stream" value={o.stream} />
                            <Field label="Study mode" value={o.studyMode} />
                            <Field label="University type" value={o.universityType} />
                            <Field label="Duration" value={duration} />
                        </FieldGrid>
                    </Card>

                    {o.description && (
                        <Card className="p-5">
                            <SectionTitle title="Description" />
                            <div
                                className="prose prose-sm max-w-none text-sm text-foreground [&_*]:!text-foreground"
                                // The editor stores rich text; it is authored in this
                                // admin by staff, and rendering it as text would show
                                // raw tags on every course.
                                dangerouslySetInnerHTML={{ __html: o.description }}
                            />
                        </Card>
                    )}

                    {(o.dynamicFields?.length ?? 0) + (c.dynamicFields?.length ?? 0) > 0 && (
                        <Card className="p-5">
                            <SectionTitle title="Additional fields" />
                            <FieldGrid>
                                {[...(o.dynamicFields ?? []), ...(c.dynamicFields ?? [])].map(
                                    (f: DynamicField, i: number) => (
                                        <Field
                                            key={i}
                                            label={f.label || f.fieldName}
                                            value={String(f.fieldValue ?? "")}
                                        />
                                    ),
                                )}
                            </FieldGrid>
                        </Card>
                    )}

                    {(c.brochure?.length ?? 0) > 0 && (
                        <Card className="p-5">
                            <SectionTitle title="Brochures" />
                            <ul className="space-y-2">
                                {c.brochure!.map((b: Brochure, i: number) => (
                                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="min-w-0">
                                            <span className="font-medium">{b.title || b.fileName}</span>
                                            {b.description && (
                                                <span className="text-muted-foreground"> — {b.description}</span>
                                            )}
                                        </span>
                                        {b.fileUrl && (
                                            <a
                                                href={b.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex shrink-0 items-center gap-1 text-primary underline"
                                            >
                                                <Download className="size-3.5" />
                                                Open
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </TabsContent>

                {/* ── Fees ── */}
                <TabsContent value="fees" className="mt-4 space-y-3">
                    {c.feeStructures?.length ? (
                        c.feeStructures.map((fee: FeeStructure, i: number) => (
                            <Card key={i} className="p-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="font-semibold">
                                        {fee.tuitionFeeType || "Fee structure"}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {fee.currency && <Badge tone="neutral">{fee.currency}</Badge>}
                                        {fee.scholarshipPercentage && (
                                            <Badge tone="primary">{fee.scholarshipPercentage}</Badge>
                                        )}
                                    </div>
                                </div>
                                <FieldGrid>
                                    {FEE_FIELDS.filter(
                                        (f) => fee[f.key] !== undefined && fee[f.key] !== null && fee[f.key] !== "",
                                    ).map((f) => (
                                        <Field
                                            key={f.key}
                                            label={f.label}
                                            value={`${fee.currency ?? ""} ${fee[f.key]}`.trim()}
                                        />
                                    ))}
                                    {(fee.dynamicFields ?? []).map((d, idx: number) => (
                                        <Field key={idx} label={d.fieldName} value={d.fieldValue} />
                                    ))}
                                </FieldGrid>
                            </Card>
                        ))
                    ) : (
                        <EmptyState
                            icon={<DollarSign className="size-8" />}
                            title="No fee structures recorded"
                            description="Add them on the Fee Structure tab of the editor."
                        />
                    )}
                </TabsContent>

                {/* ── Documents ── */}
                <TabsContent value="documents" className="mt-4">
                    {c.documentsRequired?.length ? (
                        <Card className="divide-y divide-border p-0">
                            {c.documentsRequired.map((d: DocumentRequired, i: number) => (
                                <div key={i} className="flex flex-wrap items-start justify-between gap-3 p-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">{d.documentName}</p>
                                        {d.description && (
                                            <p className="text-sm text-muted-foreground">{d.description}</p>
                                        )}
                                    </div>
                                    <Badge tone={d.isMandatory ? "green" : "neutral"}>
                                        {d.isMandatory ? "Mandatory" : "Optional"}
                                    </Badge>
                                </div>
                            ))}
                        </Card>
                    ) : (
                        <EmptyState icon={<FileText className="size-8" />} title="No documents listed" />
                    )}
                </TabsContent>

                {/* ── Visa ── */}
                <TabsContent value="visa" className="mt-4">
                    {c.visaProcess?.length ? (
                        <Card className="divide-y divide-border p-0">
                            {c.visaProcess.map((v: VisaProcess, i: number) => {
                                const visa = visaById.get(v.visaId);
                                return (
                                    <div key={v.visaId ?? i} className="flex items-center gap-3 p-4">
                                        <Plane className="size-5 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium">
                                                {visa?.country ?? "Linked visa process"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {visa
                                                    ? `${visa.visaSteps?.length ?? 0} steps · ${visa.visaDocuments?.length ?? 0} documents`
                                                    : "This visa record no longer exists"}
                                            </p>
                                        </div>
                                        {visa && (
                                            <Button variant="outline" size="sm"
                                                onClick={() => navigate(`/visas/view/${visa._id}`)}>
                                                Open
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </Card>
                    ) : (
                        <EmptyState icon={<Plane className="size-8" />} title="No visa process linked" />
                    )}
                </TabsContent>

                {/* ── Career ── */}
                <TabsContent value="career" className="mt-4 space-y-3">
                    {c.careerOpportunities?.length ? (
                        c.careerOpportunities.map((job: CareerOpportunity, i: number) => (
                            <Card key={i} className="p-5">
                                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="font-semibold">{job.title}</h3>
                                    {job.averageSalary && (
                                        <Badge tone="primary">{job.averageSalary}</Badge>
                                    )}
                                </div>
                                {job.description && (
                                    <p className="text-sm text-muted-foreground">{job.description}</p>
                                )}
                            </Card>
                        ))
                    ) : (
                        <EmptyState
                            icon={<Briefcase className="size-8" />}
                            title="No career opportunities recorded"
                        />
                    )}
                </TabsContent>

                {/* ── Study centres ── */}
                <TabsContent value="centers" className="mt-4">
                    {c.studyCenters?.length ? (
                        <Card className="divide-y divide-border p-0">
                            {c.studyCenters.map((s, i: number) => (
                                <div key={i} className="flex flex-wrap items-center justify-between gap-3 p-4">
                                    <span className="text-sm font-medium">
                                        {s.name ?? "Centre"}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {[s.location, s.country].filter(Boolean).join(", ")}
                                    </span>
                                </div>
                            ))}
                        </Card>
                    ) : (
                        <EmptyState icon={<MapPin className="size-8" />} title="No study centres linked" />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
        </h3>
    );
}
