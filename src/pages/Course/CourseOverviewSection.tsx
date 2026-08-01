"use client";

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import type { CourseOverview } from '@/types/course';
import { LEVEL_OPTIONS, INTAKE_OPTIONS, STREAM_OPTIONS } from '@/types/course';
import { ImageUpload } from '@/components/common/ImageUpload';
import { Textarea } from '@/components/ui/textarea';

interface CourseOverviewSectionProps {
    data: CourseOverview;
    onSave: (data: CourseOverview) => Promise<void>;
    onNext: () => void;
}

export function CourseOverviewSection({
    data,
    onSave,
    onNext,
}: CourseOverviewSectionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CourseOverview>({
        defaultValues: {
            ...data,
            intakes: data.intakes ?? [],
        },
    });

    const courseName = watch('courseName');
    const courseImage = watch('courseImage');
    const selectedIntakes = watch('intakes') ?? [];

    // Auto-generate slug
    useEffect(() => {
        if (courseName) {
            const slug = courseName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            setValue('slug', slug);
        }
    }, [courseName, setValue]);

    const toggleIntake = (intake: string) => {
        const current = selectedIntakes ?? [];
        if (current.includes(intake)) {
            setValue('intakes', current.filter((i) => i !== intake));
        } else {
            setValue('intakes', [...current, intake]);
        }
    };

    const onSubmit = async (formData: CourseOverview) => {
        try {
            setIsSubmitting(true);
            await onSave(formData);
            onNext();
        } catch (error) {
            console.error('Error saving course:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Course Overview</h2>

                <div className="space-y-6">
                    {/* Course Image */}
                    <div>
                        <Label>Course Image</Label>
                        <div className="mt-2">
                            <ImageUpload
                                value={courseImage}
                                onChange={(file) => setValue('courseImage', file)}
                                onRemove={() => setValue('courseImage', null)}
                                ratioHint="16:9 (e.g., 1280 x 720 px)"
                            />
                        </div>
                    </div>

                    {/* Course Name */}
                    <div>
                        <Label htmlFor="courseName">Course Name *</Label>
                        <Input
                            id="courseName"
                            {...register('courseName', { required: 'Course name is required' })}
                            placeholder="e.g., Master of Business Administration"
                            className="mt-2"
                            disabled={isSubmitting}
                        />
                        {errors.courseName && (
                            <p className="text-sm text-destructive mt-1">{errors.courseName.message}</p>
                        )}
                    </div>

                    {/* Heading Description */}
                    <div>
                        <Label htmlFor="headingDescription">Heading Description *</Label>
                        <Input
                            id="headingDescription"
                            {...register('headingDescription', { required: 'Heading description is required' })}
                            placeholder="Short compelling description"
                            className="mt-2"
                            disabled={isSubmitting}
                        />
                        {errors.headingDescription && (
                            <p className="text-sm text-destructive mt-1">{errors.headingDescription.message}</p>
                        )}
                    </div>

                    {/* Slug */}
                    <div>
                        <Label htmlFor="slug">Slug (URL-friendly) *</Label>
                        <Input
                            id="slug"
                            {...register('slug', { required: 'Slug is required' })}
                            placeholder="auto-generated-from-name"
                            className="mt-2 bg-muted"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Course Description *</Label>
                        <div className="mt-2">
                            <Textarea
                                id="description"
                                {...register('description', { required: 'Description is required' })}
                                placeholder="Detailed course description..."
                                className="mt-2"
                                disabled={isSubmitting}
                                rows={5}
                            />
                        </div>
                    </div>

                    {/* Duration Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="durationYears">Duration - Years</Label>
                            <Input
                                id="durationYears"
                                type="number"
                                min="0"
                                {...register('durationYears', { valueAsNumber: true })}
                                placeholder="1"
                                className="mt-2"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <Label htmlFor="durationMonths">Duration - Months</Label>
                            <Input
                                id="durationMonths"
                                type="number"
                                min="0"
                                max="11"
                                {...register('durationMonths', { valueAsNumber: true })}
                                placeholder="6"
                                className="mt-2"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Class Delivery Mode */}
                    <div>
                        <Label htmlFor="studyMode">Class Delivery Mode *</Label>
                        <Select
                            value={watch('studyMode')}
                            onValueChange={(value) => setValue('studyMode', value as 'online' | 'on-campus' | 'hybrid')}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select delivery mode" />
                            </SelectTrigger>
                            <SelectContent className="bg-card">
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="on-campus">On Campus</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Awarded By */}
                    <div>
                        <Label htmlFor="awardedBy">Awarded By *</Label>
                        <Input
                            id="awardedBy"
                            {...register('awardedBy', { required: 'Awarded by is required' })}
                            placeholder="e.g., University of London"
                            className="mt-2"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Intakes */}
                    <div>
                        <Label>Intakes</Label>
                        <p className="text-xs text-muted-foreground mt-1 mb-2">Select all applicable intake months</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {INTAKE_OPTIONS.map((intake) => {
                                const isSelected = selectedIntakes.includes(intake);
                                return (
                                    <button
                                        key={intake}
                                        type="button"
                                        onClick={() => toggleIntake(intake)}
                                        disabled={isSubmitting}
                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                            isSelected
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-card text-foreground border-input hover:border-input'
                                        }`}
                                    >
                                        {intake}
                                        {isSelected && <X className="w-3 h-3" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Level */}
                    <div>
                        <Label htmlFor="level">Level *</Label>
                        <Select
                            value={watch('level')}
                            onValueChange={(value) => setValue('level', value)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent className="bg-card">
                                {LEVEL_OPTIONS.map((level) => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* University Type */}
                    <div>
                        <Label htmlFor="universityType">University Type</Label>
                        <Select
                            value={watch('universityType') ?? ''}
                            onValueChange={(value) => setValue('universityType', value as 'Public' | 'Private')}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select university type" />
                            </SelectTrigger>
                            <SelectContent className="bg-card">
                                <SelectItem value="Public">Public</SelectItem>
                                <SelectItem value="Private">Private</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stream */}
                    <div>
                        <Label htmlFor="stream">Stream</Label>
                        <Select
                            value={watch('stream') ?? ''}
                            onValueChange={(value) => setValue('stream', value)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select stream" />
                            </SelectTrigger>
                            <SelectContent className="bg-card max-h-60">
                                {STREAM_OPTIONS.map((stream) => (
                                    <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                    type="submit"
                    className="bg-primary hover:bg-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Save & Continue'
                    )}
                </Button>
            </div>
        </form>
    );
}
