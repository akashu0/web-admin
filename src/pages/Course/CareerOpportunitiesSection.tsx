"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import type { CareerOpportunity } from '@/types/course';
import { RichTextEditor } from '@/components/common/RichTextEditor';

interface CareerOpportunitiesSectionProps {
    data: CareerOpportunity[];
    onSave: (data: CareerOpportunity[]) => void;
    onNext: () => void;
}

export function CareerOpportunitiesSection({
    data,
    onSave,
    onNext,
}: CareerOpportunitiesSectionProps) {
    const [careers, setCareers] = useState<CareerOpportunity[]>(
        data.length > 0
            ? data
            : [{
                id: Date.now().toString(),
                title: '',
                description: '',
                averageSalary: '',
            }]
    );

    const handleCareerChange = (
        index: number,
        field: keyof CareerOpportunity,
        value: string
    ) => {
        const updatedCareers = [...careers];
        updatedCareers[index] = {
            ...updatedCareers[index],
            [field]: value,
        };
        setCareers(updatedCareers);
    };

    const addCareer = () => {
        setCareers([
            ...careers,
            {
                id: Date.now().toString(),
                title: '',
                description: '',
                averageSalary: '',
            },
        ]);
    };

    const removeCareer = (index: number) => {
        if (careers.length > 1) {
            setCareers(careers.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        const hasEmptyTitles = careers.some(career => !career.title.trim());
        const hasEmptyDescriptions = careers.some(career => !career.description.trim());

        if (hasEmptyTitles || hasEmptyDescriptions) {
            alert('Please fill in all job titles and descriptions');
            return;
        }

        onSave(careers);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <Briefcase className="h-8 w-8 text-gray-900" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Career Opportunities</h2>
                        <p className="text-sm text-gray-600">Potential career paths after completing this course</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {careers.map((career, index) => (
                        <Card key={career.id} className="p-6 bg-white border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Career Path {index + 1}
                                </h3>
                                {careers.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCareer(index)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor={`title-${index}`}>
                                        Job Title *
                                    </Label>
                                    <Input
                                        id={`title-${index}`}
                                        value={career.title}
                                        onChange={(e) =>
                                            handleCareerChange(index, 'title', e.target.value)
                                        }
                                        placeholder="e.g., Business Analyst, Marketing Manager, UX Designer"
                                        className="mt-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Job Description *</Label>
                                    <div className="mt-2">
                                        <RichTextEditor
                                            content={career.description}
                                            onChange={(content) =>
                                                handleCareerChange(index, 'description', content)
                                            }
                                            placeholder="Describe the role, responsibilities, and skills required..."
                                            minHeight="120px"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor={`salary-${index}`}>
                                        Average Salary (Optional)
                                    </Label>
                                    <Input
                                        id={`salary-${index}`}
                                        value={career.averageSalary}
                                        onChange={(e) =>
                                            handleCareerChange(index, 'averageSalary', e.target.value)
                                        }
                                        placeholder="e.g., £40,000 - £60,000 per year"
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addCareer}
                        className="w-full border-dashed border-2"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Career Path
                    </Button>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                    Save & Continue
                </Button>
            </div>
        </form>
    );
}