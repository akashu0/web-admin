import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { universityService } from "@/services/universityService";

const RATING_OPTIONS = ["1", "2", "3", "4", "5"] as const;

const reviewSchema = z.object({
    studentName: z.string().min(1, "Student name is required"),
    rating: z.string().min(1, "Rating is required"),
    comment: z.string().min(1, "Review comment is required"),
    course: z.string().optional(),
});

const reviewsFormSchema = z.object({
    reviews: z.array(reviewSchema),
});

type ReviewsFormData = z.infer<typeof reviewsFormSchema>;

interface ReviewsSectionProps {
    slug: string;
    initialData: any[];
    onSuccess: () => void;
}

export function ReviewsSection({ slug, initialData, onSuccess }: ReviewsSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
    } = useForm<ReviewsFormData>({
        resolver: zodResolver(reviewsFormSchema),
        defaultValues: {
            reviews: (initialData || []).map((r) => ({
                studentName: r.studentName || "",
                rating: r.rating ? String(r.rating) : "5",
                comment: r.comment || "",
                course: r.course || "",
            })),
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "reviews" });

    const addReview = () => {
        append({
            studentName: "",
            rating: "5",
            comment: "",
            course: "",
        });
    };

    const onSubmit = async (data: ReviewsFormData) => {
        try {
            setIsSubmitting(true);
            const payload = {
                reviews: data.reviews.map((r) => ({
                    studentName: r.studentName,
                    rating: Number(r.rating),
                    comment: r.comment,
                    course: r.course || undefined,
                })),
            };
            await universityService.updateReviews(slug, payload);
            onSuccess();
            toast.success("Student reviews saved");
        } catch (error: any) {
            console.error("Error updating reviews:", error);
            toast.error(error.response?.data?.message || "Failed to update reviews");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Student Reviews</CardTitle>
                            <CardDescription>Manage reviews shared by students of this university</CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addReview}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Review
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-5 border rounded-xl space-y-4 bg-muted">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm text-foreground">
                                    Review #{index + 1}
                                </h4>
                                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Student Name *</Label>
                                    <Input
                                        {...register(`reviews.${index}.studentName`)}
                                        placeholder="e.g., John Doe"
                                    />
                                    {errors.reviews?.[index]?.studentName && (
                                        <p className="text-xs text-destructive">{errors.reviews[index]?.studentName?.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Rating *</Label>
                                    <Select
                                        value={watch(`reviews.${index}.rating`) || ""}
                                        onValueChange={(v) => setValue(`reviews.${index}.rating`, v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RATING_OPTIONS.map((r) => (
                                                <SelectItem key={r} value={r}>
                                                    <span className="flex items-center gap-1">
                                                        {r} <Star className="h-3 w-3 fill-tertiary text-tertiary" />
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.reviews?.[index]?.rating && (
                                        <p className="text-xs text-destructive">{errors.reviews[index]?.rating?.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Course (optional)</Label>
                                <Input
                                    {...register(`reviews.${index}.course`)}
                                    placeholder="e.g., MBA"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Review *</Label>
                                <Textarea
                                    {...register(`reviews.${index}.comment`)}
                                    placeholder="What did the student say about the university?"
                                    rows={3}
                                />
                                {errors.reviews?.[index]?.comment && (
                                    <p className="text-xs text-destructive">{errors.reviews[index]?.comment?.message}</p>
                                )}
                            </div>
                        </div>
                    ))}

                    {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-10">
                            No reviews added yet. Click "Add Review" to get started.
                        </p>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Reviews
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
