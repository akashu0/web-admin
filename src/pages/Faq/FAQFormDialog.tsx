// src/pages/FAQ/FAQFormDialog.tsx
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { faqFormSchema, type FAQFormData } from '@/lib/validations/faq.validation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { IFAQ, CreateFAQInput, UpdateFAQInput } from '@/types/faq';

interface FAQFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateFAQInput | UpdateFAQInput) => void;
    editData?: IFAQ | null;
    isLoading?: boolean;
}

export const FAQFormDialog = ({
    open,
    onOpenChange,
    onSubmit,
    editData,
    isLoading,
}: FAQFormDialogProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
        control,
    } = useForm<FAQFormData>({
        resolver: zodResolver(faqFormSchema),
        defaultValues: {
            entityType: 'University',
            title: '',
            status: 'draft',
            questions: [{ question: '', answer: '', order: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'questions',
    });

    const entityType = watch('entityType');
    const status = watch('status');

    useEffect(() => {
        if (editData) {
            setValue('entityType', editData.entityType);
            setValue('title', editData.title);
            setValue('status', editData.status);
            setValue('questions', editData.questions);
        } else {
            reset({
                entityType: 'University',
                title: '',
                status: 'draft',
                questions: [{ question: '', answer: '', order: 0 }],
            });
        }
    }, [editData, setValue, reset, open]);

    const handleFormSubmit = (data: FAQFormData) => {
        if (editData) {
            // For update, send only UpdateFAQInput fields
            const updateData: UpdateFAQInput = {
                title: data.title,
                status: data.status,
                questions: data.questions,
            };
            onSubmit(updateData);
        } else {
            // For create, send full CreateFAQInput
            const createData: CreateFAQInput = {
                entityType: data.entityType,
                title: data.title,
                status: data.status,
                questions: data.questions,
            };
            onSubmit(createData);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-[85vw] xl:max-w-[75vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editData ? 'Edit FAQ' : 'Create New FAQ'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Entity Type */}
                    <div className="space-y-2">
                        <Label htmlFor="entityType">Entity Type *</Label>
                        <Select
                            value={entityType}
                            onValueChange={(value) =>
                                setValue('entityType', value as 'University' | 'Course' | 'Country')
                            }
                            disabled={!!editData}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select entity type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="University">University</SelectItem>
                                <SelectItem value="Course">Course</SelectItem>
                                <SelectItem value="Country">Country</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.entityType && (
                            <p className="text-sm text-red-500">{errors.entityType.message}</p>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="Enter FAQ title (e.g., 'Admission Requirements')"
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Status & Language Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    setValue('status', value as 'active' | 'inactive' | 'draft')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-red-500">{errors.status.message}</p>
                            )}
                        </div>


                    </div>

                    {/* Questions Array */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Questions *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ question: '', answer: '', order: fields.length })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                            </Button>
                        </div>

                        {errors.questions && typeof errors.questions === 'object' && !Array.isArray(errors.questions) && 'message' in errors.questions && (
                            <p className="text-sm text-red-500">{errors.questions.message as string}</p>
                        )}

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border border-zinc-200 rounded-lg space-y-4 bg-zinc-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="h-5 w-5 text-zinc-400" />
                                            <span className="font-medium text-sm">Question {index + 1}</span>
                                        </div>
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => remove(index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`questions.${index}.question`}>Question</Label>
                                        <Textarea
                                            {...register(`questions.${index}.question` as const)}
                                            placeholder="Enter question"
                                            rows={2}
                                        />
                                        {errors.questions?.[index]?.question && (
                                            <p className="text-sm text-red-500">
                                                {errors.questions[index]?.question?.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`questions.${index}.answer`}>Answer</Label>
                                        <Textarea
                                            {...register(`questions.${index}.answer` as const)}
                                            placeholder="Enter answer"
                                            rows={4}
                                        />
                                        {errors.questions?.[index]?.answer && (
                                            <p className="text-sm text-red-500">
                                                {errors.questions[index]?.answer?.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`questions.${index}.order`}>Order</Label>
                                        <Input
                                            type="number"
                                            {...register(`questions.${index}.order` as const, { valueAsNumber: true })}
                                            placeholder="0"
                                        />
                                        {errors.questions?.[index]?.order && (
                                            <p className="text-sm text-red-500">
                                                {errors.questions[index]?.order?.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : editData ? 'Update FAQ' : 'Create FAQ'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};