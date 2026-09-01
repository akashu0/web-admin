import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/services/api";
import { Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { universityService } from "@/services/universityService";
import { WEBSITE_URL, openUniversityPage } from "@/lib/website";
import { useUnsavedContext, useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { UnsavedBar } from "@/components/common/UnsavedBar";
import { BasicInfoSection } from "./BasicInfoSection";
import { FeeSection } from "./FeeSection";
import { AdmissionsSection } from "./AdmissionsSection";
import { StudentLifeSection } from "./StudentLifeSection";
import { WhyChooseSection } from "./WhyChooseSection";
import { ReviewsSection } from "./ReviewsSection";
import { ImagesSection } from "./ImagesSection";
import { MediaSection } from "./Mediasection";
import { UniversityReferencesTab } from "./UniversityReferencesTab";
import { CommissionSection } from "./CommissionSection";


export function EditUniversity() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [universityData, setUniversityData] = useState<any>(null);
    // Bumped on every reload and used as the sections' `key`. They seed
    // react-hook-form `defaultValues` once, so without a new key a re-fetch
    // would update this component and leave the forms showing the old values.
    const [version, setVersion] = useState(0);
    // Radix unmounts the inactive tab's content, so switching tab throws away
    // whatever was typed in this one — the same loss as navigating away, asked
    // the same way. That needs the tabs controlled.
    const [activeTab, setActiveTab] = useState("basic");
    const { requestLeave } = useUnsavedContext();
    const { dirty } = useUnsavedChanges();

    const loadUniversity = useCallback(async () => {
        if (!slug) return;
        const university = await universityService.getUniversityBySlug(slug);
        setUniversityData(university.data);
        setVersion((v) => v + 1);
    }, [slug]);

    useEffect(() => {
        setIsLoading(true);
        loadUniversity()
            .catch((error: any) => {
                console.error("Error loading university:", error);
                toast.error(apiErrorMessage(error, "Failed to load university data"));
                navigate("/universities");
            })
            .finally(() => setIsLoading(false));
    }, [loadUniversity, navigate]);

    // Re-read after every section save. A section PATCH replaces its whole field,
    // so what the server now holds is the only honest thing to show — a form that
    // keeps rendering what you typed hides anything the save dropped until the
    // next visit, which is what made this feel like "the data isn't saving".
    const handleSectionUpdate = async (sectionName: string) => {
        toast.success(`${sectionName} updated successfully`);
        try {
            await loadUniversity();
        } catch (error: any) {
            console.error("Error reloading university:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!universityData) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => requestLeave(() => navigate("/universities"))}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Universities
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Edit University</h1>
                        <p className="text-muted-foreground mt-1">
                            {universityData.status === "draft"
                                ? "Draft — not on the website yet"
                                : "Published — live on the website"}
                        </p>
                    </div>
                </div>

                {/* The saved record as the site renders it. A draft goes through
                    a signed preview link; published is just the public URL. */}
                {WEBSITE_URL && (
                    <Button
                        variant="outline"
                        onClick={() => openUniversityPage(universityData)}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {universityData.status === "draft" ? "Preview draft" : "View on website"}
                    </Button>
                )}
            </div>

            <UnsavedBar />

            <Tabs
                value={activeTab}
                onValueChange={(next) => requestLeave(() => setActiveTab(next))}
                className="w-full"
            >
                <TabsList className={cn("grid w-full grid-cols-11", dirty && "opacity-60")}>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="whyChoose">Why Choose</TabsTrigger>
                    <TabsTrigger value="fees">Fees</TabsTrigger>
                    <TabsTrigger value="admissions">Admissions</TabsTrigger>
                    <TabsTrigger value="studentLife">Student Life</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="commission">Commission</TabsTrigger>
                    <TabsTrigger value="ptCommission">PT Commission</TabsTrigger>
                    <TabsTrigger value="refrences">Refrences</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                    <BasicInfoSection
                        key={version}
                        slug={slug!}
                        initialData={universityData}
                        onSuccess={() => handleSectionUpdate("Basic Information")}
                    />
                </TabsContent>

                <TabsContent value="whyChoose" className="space-y-4 mt-4">
                    <WhyChooseSection
                        key={version}
                        slug={slug!}
                        initialData={universityData.whyChoose || {}}
                        onSuccess={() => handleSectionUpdate("Why Choose")}
                    />
                </TabsContent>

                <TabsContent value="fees" className="space-y-4 mt-4">
                    <FeeSection
                        key={version}
                        slug={slug!}
                        initialData={universityData.fees || []}
                        onSuccess={() => handleSectionUpdate("Fee Structure")}
                    />
                </TabsContent>

                <TabsContent value="admissions" className="space-y-6 mt-4">
                    <AdmissionsSection
                        key={version}
                        slug={slug!}
                        initialData={universityData.admissions || {}}
                        onSuccess={() => handleSectionUpdate("Admissions")}
                    />
                </TabsContent>

                <TabsContent value="studentLife" className="space-y-4 mt-4">
                    <StudentLifeSection
                        key={version}
                        slug={slug!}
                        initialData={universityData.studentLife || {}}
                        onSuccess={() => handleSectionUpdate("Student Life")}
                    />
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4 mt-4">
                    <ReviewsSection
                        key={version}
                        slug={slug!}
                        initialData={universityData.reviews || []}
                        onSuccess={() => handleSectionUpdate("Student Reviews")}
                    />
                </TabsContent>

                <TabsContent value="images" className="space-y-4 mt-4">
                    <ImagesSection
                        key={version}
                        slug={slug!}
                        initialData={{
                            logoUrl: universityData.logo,
                            bannerUrl: universityData.banner,
                            galleryUrls: universityData.galleryUrls || [],
                        }}
                        onSuccess={() => handleSectionUpdate("Images")}
                    />
                </TabsContent>

                <TabsContent value="media" className="space-y-4 mt-4">
                    <MediaSection
                        key={version}
                        slug={slug!}
                        initialData={{
                            youtubeVideoUrl: universityData.youtubeVideoUrl || "",
                        }}
                        onSuccess={() => handleSectionUpdate("Media")}
                    />
                </TabsContent>
                <TabsContent value="commission" className="space-y-4 mt-4">
                    <CommissionSection
                        slug={slug!}
                        onSuccess={() => handleSectionUpdate("Partner Commission")}
                    />
                </TabsContent>

                {/* The part-timer rate card — same editor, different audience. */}
                <TabsContent value="ptCommission" className="space-y-4 mt-4">
                    <CommissionSection
                        slug={slug!}
                        audience="parttimer"
                        onSuccess={() => handleSectionUpdate("Part-timer Commission")}
                    />
                </TabsContent>

                <TabsContent value="refrences" className="space-y-4 mt-4">
                    <UniversityReferencesTab
                        key={version}
                        slug={slug!}
                        initialData={{
                            visa: universityData.visa || "",
                            courses: universityData.courses || [],
                            faq: universityData.faqs || "",
                        }}
                        onSuccess={() => handleSectionUpdate("References")}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}