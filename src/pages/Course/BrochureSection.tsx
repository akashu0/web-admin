"use client";

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, X, Download, Loader2 } from 'lucide-react';
import type { Brochure } from '@/types/course';
import { courseService } from '@/services/courseService';
import { toast } from 'sonner';

interface BrochureSectionProps {
    data?: Brochure[];
    onSave: (data: Brochure[]) => Promise<void>;
    onNext: () => void;
    courseSlug: string;
}

export function BrochureSection({
    data,
    onSave,
    onNext,
    courseSlug,
}: BrochureSectionProps) {
    const [brochures, setBrochures] = useState<Brochure[]>(data || []);
    const [isUploading, setIsUploading] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewBrochure, setPreviewBrochure] = useState<Brochure | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);




    const validateFile = (file: File): boolean => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF, DOC, and DOCX files are allowed');
            return false;
        }

        if (file.size > maxSize) {
            toast.error('File size must be less than 10MB');
            return false;
        }

        return true;
    };

    const handleFileSelection = (file: File) => {
        if (!validateFile(file)) return;

        // Create preview
        const preview: Brochure = {
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
            fileSize: file.size,
            title: file.name,
            description: '',
        };

        setPreviewFile(file);
        setPreviewBrochure(preview);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    };

    const handleUploadBrochure = async () => {
        if (!previewFile) return;

        setIsUploading(true);
        try {
            // The API appends the brochure and returns the whole course, so the
            // list comes back from the server rather than being guessed here.
            const updated = await courseService.uploadBrochure(previewFile, courseSlug);
            setBrochures(updated.brochure ?? []);
            setPreviewFile(null);
            setPreviewBrochure(null);

            toast.success('Brochure uploaded successfully');
        } catch (error: any) {
            console.error('Upload failed:', error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Failed to upload brochure';
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveBrochure = async (index: number) => {
        try {
            const brochureToRemove = brochures[index];
            if (!brochureToRemove.publicId) {
                toast.error('This brochure predates the media library and cannot be deleted here');
                return;
            }
            const updated = await courseService.deleteBrochure(courseSlug, brochureToRemove.publicId);
            setBrochures(updated.brochure ?? []);
            toast.success('Brochure removed successfully');
        } catch (error: any) {
            console.error('Delete failed:', error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Failed to remove brochure';
            toast.error(errorMessage);
        }
    };

    const cancelPreview = () => {
        if (previewBrochure?.fileUrl) {
            URL.revokeObjectURL(previewBrochure.fileUrl);
        }
        setPreviewFile(null);
        setPreviewBrochure(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await onSave(brochures);
            onNext();
        } catch (error) {
            console.error('Error saving brochures:', error);
            toast.error('Failed to save brochures');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="h-6 w-6 text-foreground" />
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Course Brochure</h2>
                        <p className="text-sm text-muted-foreground">Optional: Upload detailed course brochures (PDF, DOC, DOCX)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Uploaded Brochures */}
                    {brochures.length > 0 && (
                        <div className="space-y-3 mb-4">
                            <Label className="text-sm font-semibold">Uploaded Brochures</Label>
                            {brochures.map((brochure, index) => (
                                <Card key={index} className="p-4 bg-card border-border">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-muted rounded-lg">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground text-sm">{brochure.fileName}</h3>
                                                {brochure.fileSize && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatFileSize(brochure.fileSize)}
                                                    </p>
                                                )}
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(brochure.fileUrl, '_blank')}
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Preview
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveBrochure(index)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Preview Section */}
                    {previewBrochure && (
                        <div className="space-y-3 mb-4">
                            <Label className="text-sm font-semibold">Preview</Label>
                            <Card className="p-4 bg-accent border-primary/30">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-card rounded-lg">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-sm">{previewBrochure.fileName}</h3>
                                            {previewBrochure.fileSize && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatFileSize(previewBrochure.fileSize)}
                                                </p>
                                            )}
                                            <div className="flex gap-2 mt-3">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleUploadBrochure}
                                                    disabled={isUploading}
                                                    className="bg-primary hover:bg-primary"
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            Upload
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={cancelPreview}
                                                    disabled={isUploading}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Upload New Brochure */}
                    {!previewBrochure && (
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">
                                {brochures.length > 0 ? 'Add Another Brochure' : 'Upload Brochure'}
                            </Label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileInput}
                                className="hidden"
                                disabled={isUploading}
                            />

                            <div
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={openFileDialog}
                                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${isDragging ? 'border-input bg-muted' : 'border-border bg-card'}
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-input'}
                `}
                            >
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                                <p className="text-muted-foreground mb-1 text-sm">
                                    {isDragging
                                        ? 'Drop the file here'
                                        : 'Drag & drop a brochure, or click to select'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supports: PDF, DOC, DOCX (Max 10MB)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="submit" className="bg-primary hover:bg-primary">
                    Save & Continue
                </Button>
            </div>
        </form>
    );
}