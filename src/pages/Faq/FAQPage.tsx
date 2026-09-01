// src/pages/FAQ/FAQPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { PageHeader } from '../../components/common/PageHeader';
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
import { FAQ_ENTITY_TYPES } from '@/types/faq';
import { faqService } from '@/services/faqservice';
import { FAQTable } from './FAQTable';
import type { SortState } from '@/components/ui/table';
import { FAQFormDialog } from './FAQFormDialog';
import { FAQViewDialog } from './FAQViewDialog';

const LIMIT = 20;

export const FAQPage = () => {
    const [faqs, setFaqs] = useState<IFAQ[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
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
    const [sort, setSort] = useState<SortState>();

    // Infinite scroll state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const isReset = useRef(true);
    const loadingRef = useRef(false);

    // Reset to page 1 whenever filters change
    useEffect(() => {
        isReset.current = true;
        setPage(1);
    }, [entityType, status, sort]);

    useEffect(() => {
        fetchFAQs(page, !isReset.current);
        isReset.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, entityType, status, sort]);

    const fetchFAQs = async (pageNum: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            const filters: any = { page: pageNum, limit: LIMIT };
            // Only add filters if not 'all'
            if (entityType && entityType !== 'all') filters.entityType = entityType;
            if (status && status !== 'all') filters.status = status;
            if (sort) { filters.sort = sort.field; filters.dir = sort.dir; }

            const response = await faqService.getAllFAQs(filters);
            setFaqs((prev) => (append ? [...prev, ...response.data] : response.data));
            if (response.pagination) {
                const { totalPages, hasNextPage, total: totalCount } = response.pagination;
                setHasMore(hasNextPage ?? pageNum < totalPages);
                setTotal(totalCount);
            } else {
                setHasMore(false);
            }
        } catch (error: any) {
            // An empty list, not a fabricated one: a demo row in an admin table
            // reads as real content and hid this endpoint being wrong for weeks.
            console.error('Failed to fetch FAQs:', error);
            if (!append) {
                setFaqs([]);
            }
            setHasMore(false);
            toast.error(error.response?.data?.message || 'Failed to fetch FAQs');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            loadingRef.current = false;
        }
    };

    const refetch = () => {
        isReset.current = true;
        if (page === 1) {
            fetchFAQs(1, false);
        } else {
            setPage(1);
        }
    };

    const handleLoadMore = useCallback(() => {
        if (loadingRef.current || !hasMore) return;
        setPage((p) => p + 1);
    }, [hasMore]);

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
            refetch();
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
            refetch();
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
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete FAQs');
        }
    };

    const handleBulkStatusUpdate = async (newStatus: 'active' | 'inactive') => {
        try {
            await faqService.bulkUpdateStatus(selectedIds, newStatus);
            toast.success(`${selectedIds.length} FAQs ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            setSelectedIds([]);
            refetch();
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
        <div>
            <PageHeader
                title="FAQs"
                subtitle="Manage frequently asked questions for universities, courses, and countries"
                actions={
                    <Button onClick={() => setShowFormDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add FAQ
                    </Button>
                }
            />

            {/* Filters */}
            <Card className="mb-4 flex flex-wrap items-end gap-3 p-3">
                <div className="w-48">
                    <Label className="mb-1.5 block text-xs text-muted-foreground">Entity Type</Label>
                    <Select value={entityType} onValueChange={setEntityType}>
                        <SelectTrigger>
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {FAQ_ENTITY_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-48">
                    <Label className="mb-1.5 block text-xs text-muted-foreground">Status</Label>
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

                <Button variant="outline" onClick={refetch}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>

                <span className="ml-auto pr-1 text-xs text-muted-foreground">
                    {faqs.length} of {total}
                </span>
            </Card>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <Card className="mb-4 flex items-center gap-2 bg-accent/40 p-3">
                    <span className="font-medium">{selectedIds.length} selected</span>
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
                </Card>
            )}

            {/* Table */}
            <Card className="overflow-hidden">
                <FAQTable
                    data={faqs}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                    onView={handleView}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    loading={loading}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    onLoadMore={handleLoadMore}
                    sort={sort}
                    onSort={setSort}
                />
            </Card>

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