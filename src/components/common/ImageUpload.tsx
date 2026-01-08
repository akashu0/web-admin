// components/ImageUpload.tsx
import { useCallback, useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, FileImage, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ImageUploadProps {
    value?: File | string | null;
    onChange: (file: File | null) => void;
    onRemove?: () => void;
    showPreview?: boolean;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    showPreview = true
}: ImageUploadProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        // Validate file type
        const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP, or GIF)');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return;
        }

        onChange(file);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }, [onChange]);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        if (files.length === 0) return;

        const file = files[0];
        handleFile(file);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        handleFile(file);
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleRemove = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        onChange(null);
        if (onRemove) {
            onRemove();
        }
        // Reset input
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Get display URL (either preview URL for File or string URL)
    const getDisplayUrl = () => {
        if (value instanceof File) {
            return previewUrl || URL.createObjectURL(value);
        }
        return value || null;
    };

    // Get file info
    const getFileInfo = () => {
        if (value instanceof File) {
            return {
                name: value.name,
                size: formatFileSize(value.size),
                type: value.type,
            };
        }
        return {
            name: 'course-image.jpg',
            size: 'Unknown',
            type: 'image/*',
        };
    };

    const displayUrl = getDisplayUrl();
    const fileInfo = getFileInfo();

    if (value) {
        return (
            <>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    {/* Folder-style preview */}
                    <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            {displayUrl && (
                                <img
                                    src={displayUrl}
                                    alt="Uploaded"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <FileImage className="h-4 w-4 text-gray-400 shrink-0" />
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {fileInfo.name}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {fileInfo.size}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {showPreview && displayUrl && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-600 hover:text-gray-900"
                                            onClick={() => setPreviewOpen(true)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={handleRemove}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Upload Status */}
                            <div className="mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-green-100 rounded-full h-1.5">
                                        <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                                    </div>
                                    <span className="text-xs text-green-600 font-medium">Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Dialog */}
                {showPreview && displayUrl && (
                    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Image Preview</DialogTitle>
                            </DialogHeader>
                            <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <img
                                    src={displayUrl}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-medium">File name:</span> {fileInfo.name}</p>
                                <p><span className="font-medium">File size:</span> {fileInfo.size}</p>
                                <p><span className="font-medium">File type:</span> {fileInfo.type}</p>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </>
        );
    }

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}
                hover:border-gray-400
            `}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/webp,image/gif"
                onChange={handleInputChange}
                className="hidden"
            />
            <div className="relative w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">
                {isDragActive
                    ? 'Drop the image here'
                    : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500">
                PNG, JPG, JPEG, WEBP or GIF (MAX. 5MB)
            </p>
        </div>
    );
}