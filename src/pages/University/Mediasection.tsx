import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { universityService } from "@/services/universityService";
import { useRhfSectionGuard } from "@/hooks/use-unsaved-changes";


const mediaSchema = z.object({
    youtubeVideoUrl: z.string().optional(),
});


type MediaFormData = z.infer<typeof mediaSchema>;

interface MediaSectionProps {
    slug: string;
    initialData: {
        youtubeVideoUrl?: string;
    };
    onSuccess: () => void;
}

export function MediaSection({ slug, initialData, onSuccess }: MediaSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<MediaFormData>({
        resolver: zodResolver(mediaSchema),
        defaultValues: {
            youtubeVideoUrl: initialData.youtubeVideoUrl || "",
        },
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = form;

    const youtubeUrl = watch("youtubeVideoUrl");

    // Extract video ID from YouTube URL for preview
    const getYoutubeVideoId = (url: string): string | null => {
        if (!url) return null;
        const match = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        return match ? match[1] : null;
    };

    const videoId = getYoutubeVideoId(youtubeUrl || "");

    /** The save itself. Throws on failure, so the unsaved-changes guard
     *  can refuse to let a failed save through. */
    const submit = async (data: MediaFormData) => {
        await universityService.updateMedia(slug, data);
        onSuccess();
    };

    useRhfSectionGuard({ id: 'university.media', label: 'Media', form, submit });

    const onSubmit = async (data: MediaFormData) => {
        try {
            setIsSubmitting(true);
            await submit(data);
        } catch (error: any) {
            console.error("Error updating media:", error);
            toast.error(error.response?.data?.message || "Failed to update media");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Media</CardTitle>
                    <CardDescription>
                        Add YouTube video link for university introduction or campus tour
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="youtubeVideoUrl" className="flex items-center gap-2">
                            <Youtube className="h-4 w-4 text-destructive" />
                            YouTube Video URL
                        </Label>
                        <Input
                            id="youtubeVideoUrl"
                            {...register("youtubeVideoUrl")}
                            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        />
                        {errors.youtubeVideoUrl && (
                            <p className="text-sm text-destructive">
                                {errors.youtubeVideoUrl.message}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Supported formats: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
                        </p>
                    </div>

                    {/* Video Preview */}
                    {videoId && (
                        <div className="space-y-2">
                            <Label>Preview</Label>
                            <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title="YouTube video preview"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Media
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}