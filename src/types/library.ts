export const LIBRARY_CATEGORIES = [
    'Textbooks',
    'Past Papers',
    'Video Masterclasses',
    'Case Studies',
    'Revision Guides',
    'Global Journals',
] as const;

export const LIBRARY_LEVELS = [
    'Diploma / Foundation',
    'Undergraduate',
    'Postgraduate',
] as const;

export interface ILibraryResource {
    _id: string;
    title: string;
    description?: string;
    category: string;
    academicLevel: string;
    type?: string;
    author?: string;
    rating?: number;
    fileUrl?: string;
    thumbnail?: string;
    featured: boolean;
    downloadCount: number;
    status: 'active' | 'inactive' | 'draft';
    createdAt: string;
    updatedAt: string;
}
