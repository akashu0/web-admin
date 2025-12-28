// components/shared/DynamicFieldBuilder.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import type { DynamicField } from '@/types/course';

interface DynamicFieldBuilderProps {
    fields: DynamicField[];
    onChange: (fields: DynamicField[]) => void;
}

export const DynamicFieldBuilder: React.FC<DynamicFieldBuilderProps> = ({
    fields,
    onChange,
}) => {
    const addField = () => {
        const newField: DynamicField = {
            id: Date.now().toString(),
            fieldName: '',
            fieldValue: '',
            label: '',
            fieldType: 'text',
            order: 0
        };
        onChange([...fields, newField]);
    };

    const updateField = (index: number, key: keyof DynamicField, value: string) => {
        const updatedFields = [...fields];
        updatedFields[index] = {
            ...updatedFields[index],
            [key]: value,
        };
        onChange(updatedFields);
    };

    const removeField = (index: number) => {
        const updatedFields = fields.filter((_, i) => i !== index);
        onChange(updatedFields);
    };

    return (
        <div className="space-y-4">
            {fields.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                    <p className="text-gray-500 mb-4">No additional fields added yet</p>
                    <Button
                        type="button"
                        onClick={addField}
                        variant="outline"
                        className="mx-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Field
                    </Button>
                </Card>
            ) : (
                <>
                    {fields.map((field, index) => (
                        <Card key={field.id} className="p-4 bg-white border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Field {index + 1}
                                </h3>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeField(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`fieldName-${index}`}>Field Name *</Label>
                                    <Input
                                        id={`fieldName-${index}`}
                                        value={field.fieldName}
                                        onChange={(e) => updateField(index, 'fieldName', e.target.value)}
                                        placeholder="e.g., Entry Requirements, Course Duration"
                                        className="mt-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor={`fieldValue-${index}`}>Field Value *</Label>
                                    <Input
                                        id={`fieldValue-${index}`}
                                        value={field.fieldValue}
                                        onChange={(e) => updateField(index, 'fieldValue', e.target.value)}
                                        placeholder="e.g., Bachelor's Degree, 2 Years"
                                        className="mt-2"
                                        required
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Button
                        type="button"
                        onClick={addField}
                        variant="outline"
                        className="w-full border-dashed border-2"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Field
                    </Button>
                </>
            )}
        </div>
    );
};