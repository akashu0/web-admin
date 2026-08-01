import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, GraduationCap, MapPin, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { EmptyState } from "@/components/common/states";
import { Field, FieldGrid, StatChip } from "@/components/common/detail";
import { egAcademyCourseService } from "@/services/egAcademyCourseService";
import type {
    EgAcademyFeeStructure,
    EgAcademyLearningCenter,
} from "@/types/egAcademyCourse";

/** The fee lines a centre can carry, in the order the editor asks for them. */
const FEE_FIELDS: { key: keyof EgAcademyFeeStructure; label: string }[] = [
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
 * Read-only view of one academy course.
 *
 * An academy course is an overview plus a fee table PER learning centre, so the
 * centres are the body of the page rather than a tab — the fees are the thing
 * that differs between them and the reason to open this at all.
 */
export function EgAcademyCourseViewPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const { data: course, isLoading, isError } = useQuery({
        queryKey: ["academy-courses", "detail", slug],
        queryFn: () => egAcademyCourseService.getCourseBySlug(slug!),
        enabled: Boolean(slug),
    });

    if (isLoading) return <PageLoader />;

    if (isError || !course) {
        return (
            <div>
                <PageHeader
                    title="Course not found"
                    actions={
                        <Button variant="outline" onClick={() => navigate("/eg-academy/courses")}>
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

    const o = course.overview;
    const duration = [
        o.durationYears ? `${o.durationYears} yr` : null,
        o.durationMonths ? `${o.durationMonths} mo` : null,
    ]
        .filter(Boolean)
        .join(" ");
    const centres = course.learningCenters ?? [];

    return (
        <div>
            <PageHeader
                title={o.courseName}
                subtitle={[o.awardedBy && `Awarded by ${o.awardedBy}`, o.level]
                    .filter(Boolean)
                    .join(" · ")}
                actions={
                    <>
                        <Button variant="outline" onClick={() => navigate("/eg-academy/courses")}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                        <Button onClick={() => navigate(`/eg-academy/courses/${course.slug}`)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </Button>
                    </>
                }
            />

            <Card className="mb-4 flex flex-wrap items-center gap-4 p-4">
                {typeof o.courseImage === "string" && o.courseImage ? (
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
                        <Badge tone={course.status === "published" ? "green" : "neutral"} dot>
                            {course.status === "published" ? "Published" : "Draft"}
                        </Badge>
                        {o.studyMode && <Badge tone="primary">{o.studyMode}</Badge>}
                        {o.stream && <Badge tone="neutral">{o.stream}</Badge>}
                    </div>
                    {o.headingDescription && (
                        <p className="mt-2 text-sm text-muted-foreground">{o.headingDescription}</p>
                    )}
                    <p className="mt-1 truncate text-xs text-muted-foreground">/{course.slug}</p>
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
                <StatChip label="Learning centres" value={centres.length} />
            </div>

            <div className="space-y-4">
                <Card className="p-5">
                    <SectionTitle title="Course details" />
                    <FieldGrid>
                        <Field label="Awarded by" value={o.awardedBy} />
                        <Field label="Level" value={o.level} />
                        <Field label="Stream" value={o.stream} />
                        <Field label="Study mode" value={o.studyMode} />
                    </FieldGrid>
                    {o.description && (
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
                            {o.description}
                        </p>
                    )}
                </Card>

                {centres.length ? (
                    centres.map((centre: EgAcademyLearningCenter, i: number) => (
                        <Card key={centre._id ?? i} className="p-5">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="flex items-center gap-2 font-semibold">
                                    <MapPin className="size-4 text-primary" />
                                    {[centre.city, centre.country].filter(Boolean).join(", ")}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    {centre.continent && <Badge tone="neutral">{centre.continent}</Badge>}
                                    {centre.feeStructure?.tuitionFeeType && (
                                        <Badge tone="primary">{centre.feeStructure.tuitionFeeType}</Badge>
                                    )}
                                    {centre.feeStructure?.currency && (
                                        <Badge tone="red">{centre.feeStructure.currency}</Badge>
                                    )}
                                </div>
                            </div>
                            {centre.feeStructure ? (
                                <>
                                    <FieldGrid>
                                        {FEE_FIELDS.filter((f) => {
                                            const v = centre.feeStructure?.[f.key];
                                            return v !== undefined && v !== null && v !== "";
                                        }).map((f) => (
                                            <Field
                                                key={f.key}
                                                label={f.label}
                                                value={`${centre.feeStructure?.currency ?? ""} ${
                                                    centre.feeStructure?.[f.key]
                                                }`.trim()}
                                            />
                                        ))}
                                        {centre.feeStructure.scholarshipPercentage && (
                                            <Field
                                                label="Scholarship"
                                                value={centre.feeStructure.scholarshipPercentage}
                                            />
                                        )}
                                    </FieldGrid>
                                    {(centre.feeStructure.otherFees ?? []).length > 0 && (
                                        <div className="mt-4">
                                            <SectionTitle title="Other fees" />
                                            <FieldGrid>
                                                {centre.feeStructure.otherFees!.map((f, idx) => (
                                                    <Field key={idx} label={f.fieldName} value={f.fieldValue} />
                                                ))}
                                            </FieldGrid>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No fee structure for this centre yet.
                                </p>
                            )}
                        </Card>
                    ))
                ) : (
                    <EmptyState
                        icon={<MapPin className="size-8" />}
                        title="No learning centres"
                        description="Add them on the Learning Centers tab of the editor."
                    />
                )}
            </div>
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
