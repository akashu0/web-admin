import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    DollarSign,
    Eye,
    GraduationCap,
    Globe,
    Heart,
    Image as ImageIcon,
    MapPin,
    Pencil,
    Percent,
    Star,
    Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { EmptyState } from "@/components/common/states";
import { Field, FieldGrid, StatChip } from "@/components/common/detail";
import { universityService } from "@/services/universityService";
import { commissionService } from "@/services/commissionService";
import { CommissionTierDisplay } from "./Commission/Commissiontierdisplay";
import { FIXED_REQUIREMENTS } from "./AdmissionsSection";
import { COURSE_TYPES, COURSE_TYPE_LABELS, type CourseType } from "@/types/commission";
import type { FeeStructure, UniversityReview } from "@/types/university";

/**
 * Read-only view of one university — everything the editor can write, on one
 * page, at a URL that can be shared.
 *
 * It reads the record by slug rather than taking it as a prop (which is what the
 * old view modal did from a list row): a deep link has to work, and the list row
 * is not guaranteed to carry every section.
 */
export function UniversityViewPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const { data: uni, isLoading, isError } = useQuery({
        queryKey: ["universities", "detail", slug],
        queryFn: async () => (await universityService.getUniversityBySlug(slug!)).data,
        enabled: Boolean(slug),
    });

    // The commission lives in its own collection; the tab is read-only here and
    // edited on the Commission tab of the editor.
    const { data: commission } = useQuery({
        queryKey: ["commissions", "university", slug],
        queryFn: () => commissionService.getForUniversity(slug!),
        enabled: Boolean(slug),
    });

    if (isLoading) return <PageLoader />;

    if (isError || !uni) {
        return (
            <div>
                <PageHeader
                    title="University not found"
                    actions={
                        <Button variant="outline" onClick={() => navigate("/universities")}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Universities
                        </Button>
                    }
                />
                <EmptyState
                    title="Could not load this university"
                    description={`No published or draft record answered for "${slug}".`}
                />
            </div>
        );
    }

    const u = uni;
    const admissions = u.admissions ?? {};
    const custom = u.admissions?.customRequirements ?? [];
    const listed = FIXED_REQUIREMENTS.filter(
        (r) => admissions[r.key]?.required || admissions[r.key]?.details,
    );

    return (
        <div>
            <PageHeader
                title={u.name}
                subtitle={[u.fullName, [u.city, u.country].filter(Boolean).join(", ")]
                    .filter(Boolean)
                    .join(" · ")}
                actions={
                    <>
                        <Button variant="outline" onClick={() => navigate("/universities")}>
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                        <Button onClick={() => navigate(`/universities/edit/${u.slug}`)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                        </Button>
                    </>
                }
            />

            {/* Banner + logo + status */}
            <Card className="mb-4 overflow-hidden p-0">
                <div className="relative h-40 bg-accent">
                    {u.banner && (
                        <img src={u.banner} alt="" className="size-full object-cover" />
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-4 p-4">
                    {u.logo ? (
                        <img
                            src={u.logo}
                            alt=""
                            className="size-16 rounded-xl border border-border object-cover"
                        />
                    ) : (
                        <div className="flex size-16 items-center justify-center rounded-xl border border-border bg-muted text-xl font-bold text-primary">
                            {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={u.status === "published" ? "green" : "neutral"} dot>
                                {u.status === "published" ? "Published" : "Draft"}
                            </Badge>
                            {u.universityType && <Badge tone="primary">{u.universityType}</Badge>}
                            {u.continent && <Badge tone="neutral">{u.continent}</Badge>}
                            {u.feeRange && <Badge tone="red">{u.feeRange}</Badge>}
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">/{u.slug}</p>
                    </div>
                </div>
            </Card>

            {/* Headline numbers */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                <StatChip label="Founded" value={u.founded || "—"} />
                <StatChip label="Students" value={u.totalStudents || "—"} />
                <StatChip label="International" value={u.internationalStudents || "—"} />
                <StatChip label="Rank" value={u.rank || "—"} />
                <StatChip
                    label="Views"
                    value={
                        <span className="flex items-center gap-1">
                            <Eye className="size-3.5" />
                            {u.viewCount ?? 0}
                        </span>
                    }
                />
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="overview">
                        <GraduationCap className="mr-2 size-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="fees">
                        <DollarSign className="mr-2 size-4" />
                        Fees
                    </TabsTrigger>
                    <TabsTrigger value="admissions">Admissions</TabsTrigger>
                    <TabsTrigger value="studentLife">
                        <Heart className="mr-2 size-4" />
                        Student Life
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                        <Star className="mr-2 size-4" />
                        Reviews
                    </TabsTrigger>
                    <TabsTrigger value="media">
                        <ImageIcon className="mr-2 size-4" />
                        Media
                    </TabsTrigger>
                    <TabsTrigger value="commission">
                        <Percent className="mr-2 size-4" />
                        Commission
                    </TabsTrigger>
                </TabsList>

                {/* ── Overview ── */}
                <TabsContent value="overview" className="mt-4 space-y-4">
                    <Card className="p-5">
                        <SectionTitle icon={<MapPin className="size-4" />} title="Location" />
                        <FieldGrid>
                            <Field label="City" value={u.city} />
                            <Field label="Country" value={u.country} />
                            <Field label="Continent" value={u.continent} />
                            <Field label="Address / location" value={u.location} />
                        </FieldGrid>
                    </Card>

                    {(u.streams?.length ?? 0) > 0 && (
                        <Card className="p-5">
                            <SectionTitle icon={<Globe className="size-4" />} title="Streams" />
                            <div className="flex flex-wrap gap-2">
                                {u.streams!.map((s: string) => (
                                    <Badge key={s} tone="primary">
                                        {s}
                                    </Badge>
                                ))}
                            </div>
                        </Card>
                    )}

                    {u.about && (
                        <Card className="p-5">
                            <SectionTitle title="About" />
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                {u.about}
                            </p>
                        </Card>
                    )}
                </TabsContent>

                {/* ── Fees ── */}
                <TabsContent value="fees" className="mt-4 space-y-3">
                    {u.fees?.length ? (
                        u.fees.map((fee: FeeStructure, i: number) => (
                            <Card key={i} className="p-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="font-semibold capitalize">{fee.level || "—"}</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {fee.currency && <Badge tone="neutral">{fee.currency}</Badge>}
                                        {fee.tuitionFeeType && (
                                            <Badge tone="primary">{fee.tuitionFeeType}</Badge>
                                        )}
                                    </div>
                                </div>
                                <FieldGrid>
                                    <Field label="Tuition fee" value={fee.tuitionFee} />
                                    <Field label="Scholarship" value={fee.scholarshipPercentage} />
                                    <Field label="Application fee" value={fee.applicationFee} />
                                    <Field label="Duration" value={fee.duration} />
                                </FieldGrid>
                            </Card>
                        ))
                    ) : (
                        <EmptyState
                            icon={<DollarSign className="size-8" />}
                            title="No fees recorded"
                            description="Add them on the Fees tab of the editor."
                        />
                    )}
                </TabsContent>

                {/* ── Admissions ── */}
                <TabsContent value="admissions" className="mt-4 space-y-3">
                    {listed.length || custom.length ? (
                        <>
                            <Card className="divide-y divide-border p-0">
                                {listed.map((r) => {
                                    const entry = admissions[r.key]!;
                                    return (
                                        <div
                                            key={r.key}
                                            className="flex flex-wrap items-start justify-between gap-3 p-4"
                                        >
                                            <span className="flex items-center gap-2 text-sm font-medium">
                                                <CheckCircle2
                                                    className={
                                                        entry.required
                                                            ? "size-4 text-primary"
                                                            : "size-4 text-muted-foreground"
                                                    }
                                                />
                                                {r.label}
                                            </span>
                                            <div className="flex min-w-0 items-center gap-3">
                                                {entry.details && (
                                                    <span className="truncate text-sm text-muted-foreground">
                                                        {entry.details}
                                                    </span>
                                                )}
                                                <Badge tone={entry.required ? "green" : "neutral"}>
                                                    {entry.required ? "Required" : "Optional"}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </Card>

                            {custom.length > 0 && (
                                <Card className="p-5">
                                    <SectionTitle title="Additional requirements" />
                                    <ul className="space-y-2">
                                        {custom.map((c, i) => (
                                            <li key={i} className="text-sm">
                                                <span className="font-medium">{c.name}</span>
                                                {c.details && (
                                                    <span className="text-muted-foreground"> — {c.details}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}
                        </>
                    ) : (
                        <EmptyState
                            title="No admission requirements recorded"
                            description="Add them on the Admissions tab of the editor."
                        />
                    )}
                </TabsContent>

                {/* ── Student life ── */}
                <TabsContent value="studentLife" className="mt-4 space-y-4">
                    {u.studentLife ? (
                        <>
                            {u.studentLife.overview && (
                                <Card className="p-5">
                                    <SectionTitle title="Campus life" />
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {u.studentLife.overview}
                                    </p>
                                </Card>
                            )}
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <StatChip
                                    label="Organisations"
                                    value={u.studentLife.stats?.studentOrganizations || "—"}
                                />
                                <StatChip
                                    label="Varsity sports"
                                    value={u.studentLife.stats?.varsitySports || "—"}
                                />
                                <StatChip
                                    label="Student : faculty"
                                    value={u.studentLife.stats?.studentFacultyRatio || "—"}
                                />
                                <StatChip
                                    label="Athletics division"
                                    value={u.studentLife.athletics?.division || "—"}
                                />
                            </div>
                        </>
                    ) : (
                        <EmptyState
                            icon={<Trophy className="size-8" />}
                            title="No student life details recorded"
                        />
                    )}
                </TabsContent>

                {/* ── Reviews ── */}
                <TabsContent value="reviews" className="mt-4 space-y-3">
                    {u.reviews?.length ? (
                        u.reviews.map((r: UniversityReview, i: number) => (
                            <Card key={i} className="p-5">
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold">{r.studentName || "Anonymous"}</span>
                                    <span className="flex items-center gap-1 text-sm text-primary">
                                        {r.rating ?? "—"}
                                        <Star className="size-3.5 fill-current" />
                                    </span>
                                </div>
                                <p className="text-sm text-foreground">{r.comment}</p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {[r.course, r.date].filter(Boolean).join(" · ")}
                                </p>
                            </Card>
                        ))
                    ) : (
                        <EmptyState icon={<Star className="size-8" />} title="No reviews yet" />
                    )}
                </TabsContent>

                {/* ── Media ── */}
                <TabsContent value="media" className="mt-4 space-y-4">
                    {u.youtubeVideoUrl && (
                        <Card className="p-5">
                            <SectionTitle title="Video" />
                            <a
                                href={u.youtubeVideoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary underline"
                            >
                                {u.youtubeVideoUrl}
                            </a>
                        </Card>
                    )}
                    {u.galleryUrls?.length ? (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {u.galleryUrls.map((src: string, i: number) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt=""
                                    className="h-32 w-full rounded-card border border-border object-cover"
                                />
                            ))}
                        </div>
                    ) : (
                        !u.youtubeVideoUrl && (
                            <EmptyState icon={<ImageIcon className="size-8" />} title="No media uploaded" />
                        )
                    )}
                </TabsContent>

                {/* ── Commission (read-only; edited on the editor's Commission tab) ── */}
                <TabsContent value="commission" className="mt-4 space-y-4">
                    {commission ? (
                        <>
                            <Card className="p-5">
                                <SectionTitle icon={<Percent className="size-4" />} title="Rates" />
                                <div className="divide-y divide-border">
                                    {COURSE_TYPES.filter(
                                        (ct: CourseType) => commission[ct]?.ranges?.length,
                                    ).map((ct: CourseType) => (
                                        <div
                                            key={ct}
                                            className="grid grid-cols-[140px_1fr] items-start gap-3 py-3"
                                        >
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {COURSE_TYPE_LABELS[ct]}
                                            </span>
                                            <CommissionTierDisplay tier={commission[ct]} />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            <Card className="p-5">
                                <SectionTitle icon={<Calendar className="size-4" />} title="Terms" />
                                <FieldGrid>
                                    <Field label="Intakes" value={commission.intakes} />
                                    <Field label="Tuition fees" value={commission.tuitionFees} />
                                    <Field label="Additional bonus" value={commission.additionalBonus} />
                                    <Field
                                        label="Course restrictions"
                                        value={commission.courseTypeRestrictions}
                                    />
                                </FieldGrid>
                                {commission.importantNotes && (
                                    <p className="mt-4 whitespace-pre-wrap rounded-card border border-border bg-muted/50 p-3 text-sm">
                                        {commission.importantNotes}
                                    </p>
                                )}
                            </Card>
                        </>
                    ) : (
                        <EmptyState
                            icon={<Percent className="size-8" />}
                            title="No commission recorded"
                            description="Add it on the Commission tab of the editor."
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
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
