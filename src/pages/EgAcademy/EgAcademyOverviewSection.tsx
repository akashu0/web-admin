"use client";

import { useForm } from 'react-hook-form';
import { useRhfSectionGuard } from '@/hooks/use-unsaved-changes';
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
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { ImageUpload } from '@/components/common/ImageUpload';
import {
  LEVEL_OPTIONS,
  INTAKE_OPTIONS,
  STREAM_OPTIONS,
} from '@/types/egAcademyCourse';
import type { EgAcademyOverview } from '@/types/egAcademyCourse';

interface EgAcademyOverviewSectionProps {
  data: EgAcademyOverview;
  onSave: (data: EgAcademyOverview) => Promise<void>;
  onNext?: () => void;
}

export function EgAcademyOverviewSection({
  data,
  onSave,
  onNext,
}: EgAcademyOverviewSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EgAcademyOverview>({
    defaultValues: {
      ...data,
      intakes: data.intakes ?? [],
    },
  });
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const courseImage = watch('courseImage');
  const selectedIntakes = watch('intakes') ?? [];

  // No slug derivation here on purpose — see the read-only box below.
  // Generating one from an effect made the form mutate itself on mount, which
  // the unsaved-changes guard reported as an unsaved edit that no save could
  // clear, because the overview PATCH allowlist has no `slug`.

  const toggleIntake = (intake: string) => {
    const current = selectedIntakes ?? [];
    if (current.includes(intake)) {
      setValue('intakes', current.filter((i) => i !== intake));
    } else {
      setValue('intakes', [...current, intake]);
    }
  };

  // Saves without advancing — "Save & leave" and the sticky bar's Save must not
  // move the employee to the next section behind their back.
  const submit = async (formData: EgAcademyOverview) => {
    await onSave(formData);
  };

  useRhfSectionGuard({
    id: 'academyCourse.overview',
    label: 'Course Overview',
    form,
    submit,
  });

  const onSubmit = async (formData: EgAcademyOverview) => {
    try {
      setIsSubmitting(true);
      await submit(formData);
      if (onNext) onNext();
    } catch (error) {
      console.error('Error saving overview:', error);
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
              placeholder="e.g., Diploma in Business Management"
              className="mt-2"
              disabled={isSubmitting}
            />
            {errors.courseName && (
              <p className="text-sm text-destructive mt-1">{errors.courseName.message}</p>
            )}
          </div>

          {/* Heading Description */}
          <div>
            <Label htmlFor="headingDescription">Heading Description</Label>
            <Input
              id="headingDescription"
              {...register('headingDescription')}
              placeholder="Short compelling description"
              className="mt-2"
              disabled={isSubmitting}
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">Slug (URL-friendly)</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="auto-generated-from-name"
              className="mt-2 bg-muted"
              readOnly
            />
            {/* Read-only, and no longer required: the server derives the slug
                and the section save's allowlist has no `slug`, so an editable
                box was a silent no-op — and the required rule blocked Save
                outright on a course whose overview carries no slug. The value
                is seeded from the course itself in EditEgAcademyCourse. */}
            <p className="mt-1 text-xs text-muted-foreground">
              Generated from the course name. Used in the URL and cannot be changed.
            </p>
          </div>

          {/* Description */}
          <div>
            <Label>Course Description</Label>
            <div className="mt-2">
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Detailed course description..."
                className="mt-2"
                disabled={isSubmitting}
                rows={5}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="durationYears">Duration - Years</Label>
              <Input
                id="durationYears"
                type="number"
                min="0"
                {...register('durationYears')}
                placeholder="1"
                className="mt-2"
                disabled={isSubmitting}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
            <div>
              <Label htmlFor="durationMonths">Duration - Months</Label>
              <Input
                id="durationMonths"
                type="number"
                min="0"
                {...register('durationMonths')}
                placeholder="6"
                className="mt-2"
                disabled={isSubmitting}
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
          </div>

          {/* Class Delivery Mode */}
          <div>
            <Label htmlFor="studyMode">Class Delivery Mode</Label>
            <Select
              value={watch('studyMode') ?? ''}
              onValueChange={(value) =>
                setValue('studyMode', value as 'online' | 'on-campus' | 'hybrid')
              }
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
            <Label htmlFor="awardedBy">Awarded By</Label>
            <Input
              id="awardedBy"
              {...register('awardedBy')}
              placeholder="e.g., Pearson BTEC"
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
            <Label htmlFor="level">Level</Label>
            <Select
              value={watch('level') ?? ''}
              onValueChange={(value) => setValue('level', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {LEVEL_OPTIONS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
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
                  <SelectItem key={stream} value={stream}>
                    {stream}
                  </SelectItem>
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
