// pages/Course/EditCourse.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Loader2,
    CheckCircle2,
    FileText,
    FileCheck,
    Globe,
    Briefcase,
    MapPin,
    Settings,
    Sparkles,
    FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { courseService } from "@/services/courseService";
import { useUnsavedContext, useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { UnsavedBar } from "@/components/common/UnsavedBar";
import type { CourseFormData, CourseSection } from "@/types/course";
import { CourseOverviewSection } from "./CourseOverviewSection";
import StudyCentersSection from "./StudyCentersSection";
import { DocumentsRequiredSection } from "./DocumentsRequiredSection";
import { VisaProcessSection } from "./VisaProcessSection";
import { CareerOpportunitiesSection } from "./CareerOpportunitiesSection";
import { WhyChooseSection } from "./WhyChooseSection";
import { DynamicFieldsSection } from "./DynamicFieldsSection";
import DeliveryModeFeeStructure from "./DeliveryModeFeeStructure";
import { BrochureSection } from "./BrochureSection";


interface SidebarItem {
    id: CourseSection;
    label: string;
    icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
    { id: "overview", label: "Course Overview", icon: <FileText className="h-4 w-4" /> },
    { id: "whyChoose", label: "Why Choose", icon: <Sparkles className="h-4 w-4" /> },
    { id: "studyCenters", label: "University", icon: <MapPin className="h-4 w-4" /> },
    { id: "feeStructures", label: "Fee Structure", icon: <Settings className="h-4 w-4" /> },
    { id: "documents", label: "Documents Required", icon: <FileCheck className="h-4 w-4" /> },
    { id: "visa", label: "Visa Process", icon: <Globe className="h-4 w-4" /> },
    { id: "career", label: "Career Opportunities", icon: <Briefcase className="h-4 w-4" /> },
    { id: "brochure", label: "Brochure", icon: <FileDown className="h-4 w-4" /> },
    { id: "dynamicFields", label: "Additional Fields", icon: <Settings className="h-4 w-4" /> },
];

export default function EditCourse() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [courseData, setCourseData] = useState<CourseFormData | null>(null);
    // Bumped on every reload and used as each section's `key`. The sections seed
    // their state once (useState / useForm defaultValues), so without a new key
    // the refetch below updates this component and leaves the forms showing what
    // was typed rather than what the server actually stored.
    const [version, setVersion] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<CourseSection>("overview");
    const [isPublishing, setIsPublishing] = useState(false);
    // Switching section unmounts the current one, so it is a way of losing work
    // exactly like navigating away — it asks the same question.
    const { requestLeave } = useUnsavedContext();
    const { dirty } = useUnsavedChanges();

    useEffect(() => {
        if (!slug) {
            toast.error("Course slug is required");
            navigate("/courses");
            return;
        }
        fetchCourseData();
    }, [slug, navigate]);

    const fetchCourseData = async () => {
        try {
            setIsLoading(true);
            const response = await courseService.getCourseBySlug(slug!);

            const normalizedData: CourseFormData = {
                ...response,
                documentsRequired: response.documentsRequired || [],
                visaProcess: response.visaProcess || [],
                careerOpportunities: response.careerOpportunities || [],
                studyCenters: response.studyCenters || [],
                dynamicFields: response.dynamicFields || [],
                feeStructures: response.feeStructures || [],
                brochure: response?.brochure || [],
                overview: {
                    ...response.overview,
                    durationYears: response.overview.durationYears || "",
                    durationMonths: response.overview.durationMonths || "",
                    dynamicFields: response.overview.dynamicFields || [],
                },
                // The list is the editable truth; the API derives `universityId`
                // from its first entry. A legacy record that has not been
                // through cmd/backfillcourseuniversities carries only the
                // singular field, so fall back to it rather than showing the
                // course as having no university.
                universityIds:
                    response.universityIds?.length
                        ? response.universityIds
                        : response.universityId
                            ? [response.universityId]
                            : [],
                faqs: response.faqs || "",
            };

            setCourseData(normalizedData);
            setVersion((v) => v + 1);
        } catch (error: any) {
            console.error("Error fetching course:", error);
            toast.error(error.response?.data?.message || "Failed to fetch course");
            navigate("/courses");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        try {
            setIsPublishing(true);
            const newStatus = courseData?.status === "published" ? "draft" : "published";
            await courseService.updateCourseStatus(slug!, newStatus);

            setCourseData(prev => prev ? { ...prev, status: newStatus } : null);
            toast.success(`Course ${newStatus === "published" ? "published" : "unpublished"} successfully`);
        } catch (error: any) {
            console.error("Error updating status:", error);
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleSectionUpdate = async (section: CourseSection, data: any) => {
        try {
            switch (section) {
                case "overview":
                    await courseService.updateCourseOverview(slug!, data);
                    break;
                case "feeStructures":
                    await courseService.updateFeeStructure(slug!, data);
                    break;
                case "documents":
                    await courseService.updateDocumentsRequired(slug!, data);
                    break;
                case "visa":
                    await courseService.updateVisaProcess(slug!, data);
                    break;
                case "career":
                    await courseService.updateCareerOpportunities(slug!, data);
                    break;
                case "whyChoose":
                    await courseService.updateWhyChoose(slug!, data);
                    break;
                case "studyCenters":
                    await courseService.updateStudyCenters(slug!, data);
                    break;
                // Brochures are added and removed one at a time by
                // BrochureSection itself — there is no whole-list save, so this
                // case exists only to fall through to the refetch below.
                case "brochure":
                    break;
                case "dynamicFields":
                    await courseService.updateDynamicFields(slug!, data);
                    break;
            }

            toast.success("Section updated successfully");
            await fetchCourseData();
        } catch (error: any) {
            console.error("Error updating section:", error);
            toast.error(error.response?.data?.message || "Failed to update section");
            throw error;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">Course not found</p>
            </div>
        );
    }

    return (
        <div className="-m-4 flex h-[calc(100dvh-3.5rem)] bg-canvas lg:-m-5">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border overflow-y-auto">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Edit Course</h2>
                    <p className="text-sm text-muted-foreground mt-1 truncate" title={courseData.overview.courseName}>
                        {courseData.overview.courseName}
                    </p>
                </div>

                <nav className={cn("p-4 space-y-1 transition-opacity", dirty && "opacity-60")}>
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => requestLeave(() => setActiveSection(item.id))}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                activeSection === item.id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-muted"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="sticky top-0 z-10 bg-card border-b border-border px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {sidebarItems.find(item => item.id === activeSection)?.label}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Update course information and publish when ready
                            </p>
                        </div>

                        <Button
                            onClick={() => requestLeave(handlePublish)}
                            disabled={isPublishing}
                            className={cn(
                                "gap-2",
                                courseData.status === "published"
                                    ? "bg-muted-foreground hover:bg-primary"
                                    : "bg-primary hover:bg-primary/90"
                            )}
                        >
                            {isPublishing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    {courseData.status === "published" ? "Unpublish" : "Publish Course"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="max-w-5xl mx-auto space-y-4">
                    <UnsavedBar />
                    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                        {activeSection === "overview" && (
                            <CourseOverviewSection
                                key={version}
                                data={courseData.overview}
                                onSave={(data) => handleSectionUpdate("overview", data)}
                                onNext={() => setActiveSection("whyChoose")}
                            />
                        )}
                        {activeSection === "whyChoose" && (
                            <WhyChooseSection
                                key={version}
                                data={courseData.whyChoose}
                                onSave={(data) => handleSectionUpdate("whyChoose", data)}
                                onNext={() => setActiveSection("studyCenters")}
                            />
                        )}
                        {activeSection === "studyCenters" && (
                            <StudyCentersSection
                                key={version}
                                data={courseData.studyCenters?.map(center => center.centerId) || []}
                                universityIds={courseData.universityIds || []}
                                faqs={courseData.faqs || ""}
                                // Always saved, including empty values: skipping the
                                // call when nothing was chosen is what made
                                // CLEARING a selection impossible.
                                onSave={(centerIds, universityIds, faqs) =>
                                    handleSectionUpdate("studyCenters", {
                                        universityIds: universityIds ?? [],
                                        faqs: faqs ?? "",
                                        centerIds: centerIds ?? [],
                                    })
                                }
                                onNext={() => setActiveSection("feeStructures")}
                            />
                        )}

                        {activeSection === "feeStructures" && (
                            <DeliveryModeFeeStructure
                                key={version}
                                initialData={courseData.feeStructures || []}
                                onSave={(data) => handleSectionUpdate("feeStructures", data)}
                                onNext={() => setActiveSection("documents")}
                            />
                        )}

                        {activeSection === "documents" && (
                            <DocumentsRequiredSection
                                key={version}
                                data={courseData.documentsRequired}
                                onSave={(data) => handleSectionUpdate("documents", data)}
                                onNext={() => setActiveSection("visa")}
                            />
                        )}

                        {activeSection === "visa" && (
                            <VisaProcessSection
                                key={version}
                                data={courseData.visaProcess}
                                onSave={(data) => handleSectionUpdate("visa", data)}
                                onNext={() => setActiveSection("career")}
                            />
                        )}

                        {activeSection === "career" && (
                            <CareerOpportunitiesSection
                                key={version}
                                data={courseData.careerOpportunities}
                                onSave={(data) => handleSectionUpdate("career", data)}
                                onNext={() => setActiveSection("brochure")}
                            />
                        )}

                        {/* BrochureSection uploads and deletes one file at a
                            time straight to the API, so `onSave` only has to
                            refetch — there is no whole-list PATCH for it. */}
                        {activeSection === "brochure" && (
                            <BrochureSection
                                key={version}
                                data={courseData.brochure || []}
                                onSave={() => handleSectionUpdate("brochure", null)}
                                onNext={() => setActiveSection("dynamicFields")}
                                courseSlug={slug!}
                            />
                        )}

                        {activeSection === "dynamicFields" && (
                            <DynamicFieldsSection
                                key={version}
                                data={courseData.dynamicFields || []}
                                onSave={(data) => handleSectionUpdate("dynamicFields", data)}
                            />
                        )}
                    </div>
                    </div>
                </div>
            </main>
        </div>
    );
}