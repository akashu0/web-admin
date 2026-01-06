// src/pages/FAQ/FAQPage.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';

import { toast } from 'sonner';
import type { IFAQ, CreateFAQInput, UpdateFAQInput } from '@/types/faq';
import { faqService } from '@/services/faqservice';
import { FAQTable } from './FAQTable';
import { FAQFormDialog } from './FAQFormDialog';
import { FAQViewDialog } from './FAQViewDialog';

// Demo FAQ data
const DEMO_FAQ: IFAQ = {
    _id: 'demo-faq-001',
    entityType: 'University',
    title: 'General University Information',
    questions: [
        {
            question: 'What is the acceptance rate for this university?',
            answer: 'The acceptance rate is approximately 15% for undergraduate programs. We receive around 50,000 applications annually and admit roughly 7,500 students. The acceptance rate varies by program, with some competitive programs having lower acceptance rates.',
            order: 1,
        },
    ],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

export const FAQPage = () => {
    const [faqs, setFaqs] = useState<IFAQ[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState<IFAQ | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showBulkDelete, setShowBulkDelete] = useState(false);

    // Dialog states
    const [showFormDialog, setShowFormDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);

    // Filters - use 'all' instead of empty string
    const [entityType, setEntityType] = useState<string>('all');
    const [status, setStatus] = useState<string>('all');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchFAQs();
    }, [page, entityType, status]);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const filters: any = { page, limit: 20 };
            // Only add filters if not 'all'
            if (entityType && entityType !== 'all') filters.entityType = entityType;
            if (status && status !== 'all') filters.status = status;

            const response = await faqService.getAllFAQs(filters);
            setFaqs(response.data);
            if (response.pagination) {
                setTotalPages(response.pagination.totalPages);
            }
        } catch (error: any) {
            // If API fails, show demo data
            console.error('Failed to fetch FAQs, showing demo data:', error);
            setFaqs([DEMO_FAQ]);
            toast.error(error.response?.data?.message || 'Failed to fetch FAQs. Showing demo data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: CreateFAQInput | UpdateFAQInput) => {
        try {
            if (selectedFAQ) {
                // Update existing FAQ
                await faqService.updateFAQ(selectedFAQ._id, data as UpdateFAQInput);
                toast.success('FAQ updated successfully');
            } else {
                // Create new FAQ
                await faqService.createFAQ(data as CreateFAQInput);
                toast.success('FAQ created successfully');
            }
            setShowFormDialog(false);
            setSelectedFAQ(null);
            fetchFAQs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${selectedFAQ ? 'update' : 'create'} FAQ`);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await faqService.deleteFAQ(deleteId);
            toast.success('FAQ deleted successfully');
            setDeleteId(null);
            fetchFAQs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete FAQ');
        }
    };

    const handleBulkDelete = async () => {
        try {
            await faqService.bulkDeleteFAQs(selectedIds);
            toast.success(`${selectedIds.length} FAQs deleted successfully`);
            setShowBulkDelete(false);
            setSelectedIds([]);
            fetchFAQs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete FAQs');
        }
    };

    const handleBulkStatusUpdate = async (newStatus: 'active' | 'inactive') => {
        try {
            await faqService.bulkUpdateStatus(selectedIds, newStatus);
            toast.success(`${selectedIds.length} FAQs ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            setSelectedIds([]);
            fetchFAQs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update FAQ status');
        }
    };

    const handleEdit = (faq: IFAQ) => {
        setSelectedFAQ(faq);
        setShowFormDialog(true);
    };

    const handleView = (faq: IFAQ) => {
        setSelectedFAQ(faq);
        setShowViewDialog(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
                    <p className="text-zinc-500 mt-1">
                        Manage frequently asked questions for universities, courses, and countries
                    </p>
                </div>
                <Button onClick={() => setShowFormDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add FAQ
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="w-48">
                    <label className="text-sm font-medium mb-2 block">Entity Type</label>
                    <Select value={entityType} onValueChange={setEntityType}>
                        <SelectTrigger>
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="University">University</SelectItem>
                            <SelectItem value="Course">Course</SelectItem>
                            <SelectItem value="Country">Country</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-48">
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="All status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button variant="outline" onClick={fetchFAQs}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 p-4 bg-zinc-100 rounded-lg">
                    <span className="text-sm font-medium">
                        {selectedIds.length} selected
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkStatusUpdate('active')}
                    >
                        Activate Selected
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkStatusUpdate('inactive')}
                    >
                        Deactivate Selected
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setShowBulkDelete(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                    </Button>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-zinc-500" />
                </div>
            ) : faqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-zinc-300 rounded-lg">
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold text-zinc-900">No FAQs Found</h3>
                        <p className="text-sm text-zinc-500">
                            Get started by creating your first FAQ
                        </p>
                        <Button onClick={() => setShowFormDialog(true)} className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First FAQ
                        </Button>
                    </div>
                </div>
            ) : (
                <FAQTable
                    data={faqs}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                    onView={handleView}
                    onSelectionChange={setSelectedIds}
                />
            )}

            {/* Dialogs */}
            <FAQFormDialog
                open={showFormDialog}
                onOpenChange={(open) => {
                    setShowFormDialog(open);
                    if (!open) setSelectedFAQ(null);
                }}
                onSubmit={handleSubmit}
                editData={selectedFAQ}
            />

            <FAQViewDialog
                open={showViewDialog}
                onOpenChange={(open) => {
                    setShowViewDialog(open);
                    if (!open) setSelectedFAQ(null);
                }}
                faq={selectedFAQ}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the FAQ.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation */}
            <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.length} FAQs?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all selected FAQs.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete}>
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};