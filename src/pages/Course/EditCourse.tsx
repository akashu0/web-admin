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
    Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { courseService } from "@/services/courseService";
import type { CourseFormData, CourseSection } from "@/types/course";
import { CourseOverviewSection } from "./CourseOverviewSection";
import StudyCentersSection from "./StudyCentersSection";
import { DocumentsRequiredSection } from "./DocumentsRequiredSection";
import { VisaProcessSection } from "./VisaProcessSection";
import { CareerOpportunitiesSection } from "./CareerOpportunitiesSection";
import { DynamicFieldsSection } from "./DynamicFieldsSection";


interface SidebarItem {
    id: CourseSection;
    label: string;
    icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
    { id: "overview", label: "Course Overview", icon: <FileText className="h-4 w-4" /> },
    { id: "studyCenters", label: "Study Centers", icon: <MapPin className="h-4 w-4" /> },
    { id: "documents", label: "Documents Required", icon: <FileCheck className="h-4 w-4" /> },
    { id: "visa", label: "Visa Process", icon: <Globe className="h-4 w-4" /> },
    { id: "career", label: "Career Opportunities", icon: <Briefcase className="h-4 w-4" /> },
    // { id: "brochure", label: "Brochure", icon: <Settings className="h-4 w-4" /> },
    { id: "dynamicFields", label: "Additional Fields", icon: <Settings className="h-4 w-4" /> },
];

export default function EditCourse() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [courseData, setCourseData] = useState<CourseFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<CourseSection>("overview");
    const [isPublishing, setIsPublishing] = useState(false);

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
                brochure: response?.brochure || [],
                overview: {
                    ...response.overview,
                    durationYears: response.overview.durationYears || 0,
                    durationMonths: response.overview.durationMonths || 0,
                    dynamicFields: response.overview.dynamicFields || [],
                },
                universityId: response.universityId || ""
            };

            setCourseData(normalizedData);
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
                case "documents":
                    await courseService.updateDocumentsRequired(slug!, data);
                    break;
                case "visa":
                    await courseService.updateVisaProcess(slug!, data);
                    break;
                case "career":
                    await courseService.updateCareerOpportunities(slug!, data);
                    break;
                case "studyCenters":
                    await courseService.updateStudyCenters(slug!, data);
                    break;
                case "brochure":
                    await courseService.updateBrochure(slug!, data);
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
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-gray-500">Course not found</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Edit Course</h2>
                    <p className="text-sm text-gray-500 mt-1 truncate" title={courseData.overview.courseName}>
                        {courseData.overview.courseName}
                    </p>
                </div>

                <nav className="p-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                activeSection === item.id
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
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
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {sidebarItems.find(item => item.id === activeSection)?.label}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Update course information and publish when ready
                            </p>
                        </div>

                        <Button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className={cn(
                                "gap-2",
                                courseData.status === "published"
                                    ? "bg-gray-600 hover:bg-gray-700"
                                    : "bg-green-600 hover:bg-green-700"
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
                    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {activeSection === "overview" && (
                            <CourseOverviewSection
                                data={courseData.overview}
                                onSave={(data) => handleSectionUpdate("overview", data)}
                                onNext={() => setActiveSection("studyCenters")}
                            />
                        )}
                        {activeSection === "studyCenters" && (
                            <StudyCentersSection
                                data={courseData.studyCenters?.map(center => center.centerId) || []}
                                universityId={courseData.universityId || ""}
                                onSave={(centerIds, universityId) => {
                                    // Prepare payload with only non-empty values
                                    const payload: any = {};

                                    if (centerIds && centerIds.length > 0) {
                                        payload.studyCenters = centerIds;
                                    }

                                    if (universityId && universityId.trim() !== "") {
                                        payload.universityId = universityId;
                                    }

                                    // Only call handleSectionUpdate if there's data to send
                                    if (Object.keys(payload).length > 0) {
                                        handleSectionUpdate("studyCenters", payload);
                                    } else {
                                        // If nothing selected, show a message or just proceed
                                        console.log("No study centers or university selected");
                                        setActiveSection("documents"); // or show validation message
                                    }
                                }}
                                onNext={() => setActiveSection("documents")}
                            />
                        )}

                        {activeSection === "documents" && (
                            <DocumentsRequiredSection
                                data={courseData.documentsRequired}
                                onSave={(data) => handleSectionUpdate("documents", data)}
                                onNext={() => setActiveSection("visa")}
                            />
                        )}

                        {activeSection === "visa" && (
                            <VisaProcessSection
                                data={courseData.visaProcess}
                                onSave={(data) => handleSectionUpdate("visa", data)}
                                onNext={() => setActiveSection("career")}
                            />
                        )}

                        {activeSection === "career" && (
                            <CareerOpportunitiesSection
                                data={courseData.careerOpportunities}
                                onSave={(data) => handleSectionUpdate("career", data)}
                                onNext={() => setActiveSection("dynamicFields")}
                            />
                        )}

                        {/* 
                        {activeSection === "brochure" && courseData.brochure && (
                            <BrochureSection
                                data={courseData.brochure || []}
                                onSave={(data) => handleSectionUpdate("brochure", data)}
                                onNext={() => setActiveSection("dynamicFields")}
                                courseSlug={slug!}
                            />
                        )} */}

                        {activeSection === "dynamicFields" && (
                            <DynamicFieldsSection
                                data={courseData.dynamicFields || []}
                                onSave={(data) => handleSectionUpdate("dynamicFields", data)}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}