import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { universityService } from "@/services/universityService";
import { BasicInfoSection } from "./BasicInfoSection";
import { FeeSection } from "./FeeSection";
import { AdmissionsSection } from "./AdmissionsSection";
import { StudentLifeSection } from "./StudentLifeSection";
import { ImagesSection } from "./ImagesSection";
import { MediaSection } from "./Mediasection";
import { UniversityReferencesTab } from "./UniversityReferencesTab";


export function EditUniversity() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [universityData, setUniversityData] = useState<any>(null);

    // Load university data
    useEffect(() => {
        const loadUniversity = async () => {
            if (!slug) return;

            try {
                setIsLoading(true);
                const university = await universityService.getUniversityBySlug(slug);
                setUniversityData(university.data);
            } catch (error: any) {
                console.error("Error loading university:", error);
                toast.error("Failed to load university data");
                navigate("/universities");
            } finally {
                setIsLoading(false);
            }
        };

        loadUniversity();
    }, [slug, navigate]);

    const handleSectionUpdate = (sectionName: string) => {
        toast.success(`${sectionName} updated successfully`);
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!universityData) {
        return null;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/universities")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Universities
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit University</h1>
                        <p className="text-gray-600 mt-1">
                            Update university information section by section
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="fees">Fees</TabsTrigger>
                    <TabsTrigger value="admissions">Admissions</TabsTrigger>
                    <TabsTrigger value="studentLife">Student Life</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="refrences">Refrences</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                    <BasicInfoSection
                        slug={slug!}
                        initialData={universityData}
                        onSuccess={() => handleSectionUpdate("Basic Information")}
                    />
                </TabsContent>

                <TabsContent value="fees" className="space-y-4 mt-4">
                    <FeeSection
                        slug={slug!}
                        initialData={universityData.fees || []}
                        onSuccess={() => handleSectionUpdate("Fee Structure")}
                    />
                </TabsContent>

                <TabsContent value="admissions" className="space-y-6 mt-4">
                    <AdmissionsSection
                        slug={slug!}
                        initialData={universityData.admissions || {}}
                        onSuccess={() => handleSectionUpdate("Admissions")}
                    />
                </TabsContent>

                <TabsContent value="studentLife" className="space-y-4 mt-4">
                    <StudentLifeSection
                        slug={slug!}
                        initialData={universityData.studentLife || {}}
                        onSuccess={() => handleSectionUpdate("Student Life")}
                    />
                </TabsContent>

                <TabsContent value="images" className="space-y-4 mt-4">
                    <ImagesSection
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
                        slug={slug!}
                        initialData={{
                            youtubeVideoUrl: universityData.youtubeVideoUrl || "",
                        }}
                        onSuccess={() => handleSectionUpdate("Media")}
                    />
                </TabsContent>
                <TabsContent value="refrences" className="space-y-4 mt-4">
                    <UniversityReferencesTab
                        slug={slug!}
                        initialData={{
                            visa: universityData.visa || "",
                            courses: universityData.courses || "",
                        }}
                        onSuccess={() => handleSectionUpdate("Media")}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}