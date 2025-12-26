"use client";

import { useForm, useFieldArray } from 'react-hook-form';
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

import { Loader2 } from 'lucide-react';
import type { CourseOverview } from '@/types/course';
import { ImageUpload } from '@/components/common/ImageUpload';

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

    const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<CourseOverview>({
        defaultValues: data,
    });

    // Dynamic fields array
    useFieldArray({
        control,
        name: 'dynamicFields',
    });

    const courseName = watch('courseName');
    const description = watch('description');
    const courseImage = watch('courseImage');

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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>

                <div className="space-y-6">
                    {/* Course Image */}
                    <div>
                        <Label>Course Image</Label>
                        <div className="mt-2">
                            <ImageUpload
                                value={courseImage}
                                onChange={(file) => setValue('courseImage', file)}
                                onRemove={() => setValue('courseImage', null)}
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
                            <p className="text-sm text-red-600 mt-1">{errors.courseName.message}</p>
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
                            <p className="text-sm text-red-600 mt-1">{errors.headingDescription.message}</p>
                        )}
                    </div>

                    {/* Slug */}
                    <div>
                        <Label htmlFor="slug">Slug (URL-friendly) *</Label>
                        <Input
                            id="slug"
                            {...register('slug', { required: 'Slug is required' })}
                            placeholder="auto-generated-from-name"
                            className="mt-2 bg-gray-50"
                            readOnly
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Description *</Label>
                        <div className="mt-2">
                            {/* <RichTextEditor
                content={description}
                onChange={(content) => setValue('description', content)}
                placeholder="Detailed course description..."
              /> */}
                        </div>
                    </div>

                    {/* Duration Section */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Years */}
                        <div>
                            <Label htmlFor="durationYears">Years</Label>
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

                        {/* Months */}
                        <div>
                            <Label htmlFor="durationMonths">Months</Label>
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

                    {/* Study Mode */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <Label htmlFor="studyMode">Study Mode *</Label>
                            <Select
                                value={watch('studyMode')}
                                onValueChange={(value) => setValue('studyMode', value as 'online' | 'offline' | 'hybrid')}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="studyModeType">Study Mode Type *</Label>
                            <Select
                                value={watch('studyModeType')}
                                onValueChange={(value) => setValue('studyModeType', value as 'fast-track' | 'regular')}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="fast-track">Fast Track</SelectItem>
                                    <SelectItem value="regular">Regular</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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

                    {/* Next Intake */}
                    <div>
                        <Label htmlFor="nextIntake">Next Intake *</Label>
                        <Input
                            id="nextIntake"
                            type="date"
                            {...register('nextIntake', { required: 'Next intake is required' })}
                            className="mt-2"
                            disabled={isSubmitting}
                        />
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
                            <SelectContent className="bg-white">
                                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                                <SelectItem value="postgraduate">Postgraduate</SelectItem>
                                <SelectItem value="diploma">Diploma</SelectItem>
                                <SelectItem value="certificate">Certificate</SelectItem>
                                <SelectItem value="doctorate">Doctorate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-800"
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