// src/pages/FAQ/FAQTable.tsx
import { useMemo } from 'react';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ResourceTable, type Column } from '@/components/common/ResourceTable';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { formatDate } from '@/lib/utils';
import type { IFAQ } from '@/types/faq';
import type { SortState } from '@/components/ui/table';

interface FAQTableProps {
    data: IFAQ[];
    onEdit: (faq: IFAQ) => void;
    onDelete: (id: string) => void;
    onView: (faq: IFAQ) => void;
    /**
     * Selection is owned by the page, not by this table: a bulk action clears it
     * there, and internal state would keep showing rows as checked afterwards.
     */
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    loading?: boolean;
    hasMore: boolean;
    loadingMore: boolean;
    onLoadMore: () => void;
    /** Owned by the page for the same reason the selection is: it is a query. */
    sort?: SortState;
    onSort: (next: SortState) => void;
}

export const FAQTable = ({
    data,
    onEdit,
    onDelete,
    onView,
    selectedIds,
    onSelectionChange,
    loading,
    hasMore,
    loadingMore,
    onLoadMore,
    sort,
    onSort,
}: FAQTableProps) => {
    const sentinelRef = useInfiniteScroll(onLoadMore, { hasMore, loading: Boolean(loadingMore) });

    const allSelected = data.length > 0 && selectedIds.length === data.length;

    const columns: Column<IFAQ>[] = useMemo(() => [
        {
            key: 'select',
            sortable: false,
            header: (
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={(value) =>
                        onSelectionChange(value ? data.map((f) => f._id) : [])
                    }
                    aria-label="Select all"
                />
            ),
            render: (faq) => (
                <Checkbox
                    checked={selectedIds.includes(faq._id)}
                    onCheckedChange={() =>
                        onSelectionChange(
                            selectedIds.includes(faq._id)
                                ? selectedIds.filter((id) => id !== faq._id)
                                : [...selectedIds, faq._id],
                        )
                    }
                    aria-label="Select row"
                />
            ),
        },
        {
            key: 'title',
            header: 'Title',
            render: (faq) => <div className="max-w-md font-medium">{faq.title}</div>,
        },
        {
            key: 'entityType',
            header: 'Entity Type',
            render: (faq) => <Badge tone="primary">{faq.entityType}</Badge>,
        },
        {
            key: 'questions',
            sortable: false,
            header: 'Questions',
            align: 'center',
            render: (faq) => (
                <Badge tone="neutral">
                    {faq.questions.length} {faq.questions.length === 1 ? 'Question' : 'Questions'}
                </Badge>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (faq) => (
                <Badge tone={faq.status === 'active' ? 'green' : faq.status === 'draft' ? 'red' : 'neutral'}>
                    {faq.status === 'active' ? 'Active' : faq.status === 'inactive' ? 'Inactive' : 'Draft'}
                </Badge>
            ),
        },
        {
            key: 'updatedAt',
            header: 'Last Updated',
            render: (faq) => (
                <span className="text-muted-foreground">{formatDate(faq.updatedAt)}</span>
            ),
        },
        {
            key: 'actions',
            sortable: false,
            header: 'Actions',
            align: 'right',
            render: (faq) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(faq)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(faq)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(faq._id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [allSelected, data, selectedIds, onSelectionChange]);

    return (
        <ResourceTable
            columns={columns}
            rows={data}
            isLoading={loading}
            sort={sort}
            onSort={onSort}
            sentinelRef={sentinelRef}
            isFetchingNextPage={loadingMore}
            hasNextPage={hasMore}
            emptyTitle="No FAQs found"
            emptyDescription="Get started by creating your first FAQ."
        />
    );
};
