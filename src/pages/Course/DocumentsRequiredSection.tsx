
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, FileText } from 'lucide-react';
import type { DocumentRequired } from '@/types/course';

interface DocumentsRequiredSectionProps {
    data: DocumentRequired[];
    onSave: (data: DocumentRequired[]) => void;
    onNext: () => void;
}

export function DocumentsRequiredSection({
    data,
    onSave,
    onNext,
}: DocumentsRequiredSectionProps) {
    const [documents, setDocuments] = useState<DocumentRequired[]>(
        data.length > 0
            ? data
            : [{
                id: Date.now().toString(),
                documentName: '',
                description: '',
                isMandatory: false,
            }]
    );

    const handleDocumentChange = (
        index: number,
        field: keyof DocumentRequired,
        value: string | boolean
    ) => {
        const updatedDocuments = [...documents];
        updatedDocuments[index] = {
            ...updatedDocuments[index],
            [field]: value,
        };
        setDocuments(updatedDocuments);
    };

    const addDocument = () => {
        setDocuments([
            ...documents,
            {
                id: Date.now().toString(),
                documentName: '',
                description: '',
                isMandatory: false,
            },
        ]);
    };

    const removeDocument = (index: number) => {
        if (documents.length > 1) {
            setDocuments(documents.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that all required fields are filled
        const hasEmptyNames = documents.some(doc => !doc.documentName.trim());
        if (hasEmptyNames) {
            alert('Please fill in all document names');
            return;
        }

        onSave(documents);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="h-8 w-8 text-gray-900" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Documents Required</h2>
                        <p className="text-sm text-gray-600">List all documents needed for admission</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {documents.map((document, index) => (
                        <Card key={document.id} className="p-6 bg-white border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Document {index + 1}
                                </h3>
                                {documents.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeDocument(index)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor={`documentName-${index}`}>
                                        Document Name *
                                    </Label>
                                    <Input
                                        id={`documentName-${index}`}
                                        value={document.documentName}
                                        onChange={(e) =>
                                            handleDocumentChange(index, 'documentName', e.target.value)
                                        }
                                        placeholder="e.g., Passport Copy, Academic Transcripts"
                                        className="mt-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor={`description-${index}`}>Description</Label>
                                    <Textarea
                                        id={`description-${index}`}
                                        value={document.description}
                                        onChange={(e) =>
                                            handleDocumentChange(index, 'description', e.target.value)
                                        }
                                        placeholder="Additional details about this document..."
                                        className="mt-2 min-h-[80px]"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`isMandatory-${index}`}
                                        checked={document.isMandatory}
                                        onChange={(e) =>
                                            handleDocumentChange(index, 'isMandatory', e.target.checked)
                                        }
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <Label htmlFor={`isMandatory-${index}`} className="mb-0 cursor-pointer">
                                        This is a mandatory document
                                    </Label>
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addDocument}
                        className="w-full border-dashed border-2"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Document
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