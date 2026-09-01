import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, RefreshCw, Star, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterSelect } from '@/components/common/FilterSelect';
import { ResourceTable, type Column } from '@/components/common/ResourceTable';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDate } from '@/lib/utils';
import { apiErrorMessage } from '@/services/api';
import { studentReviewService } from '@/services/studentReviewService';
import {
    REVIEW_STATUS_LABELS,
    STUDENT_REVIEW_ENTITY_TYPES,
    type IStudentReview,
    type StudentReviewStatus,
} from '@/types/studentReview';

const LIMIT = 20;

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Pending' },
    { value: 'published', label: 'Approved' },
    { value: 'inactive', label: 'Rejected' },
] as const;

const STATUS_TONE: Record<StudentReviewStatus, 'neutral' | 'green' | 'red'> = {
    draft: 'neutral',
    published: 'green',
    inactive: 'red',
};

/**
 * The moderation queue for reviews students wrote on the website.
 *
 * Read and decide, never author: there is no create and no edit here. Rewriting
 * somebody's words and leaving them published under that person's name is the
 * one thing this screen must not be able to do — the service has no method for
 * it either.
 *
 * Staff-written reviews are a different thing entirely and stay where they were,
 * on the University → Reviews tab.
 */
export function ReviewsPage() {
    const [reviews, setReviews] = useState<IStudentReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<IStudentReview | null>(null);

    // Pending by default: anyone opening this page came for the queue, and a
    // list led by reviews that were dealt with weeks ago buries it.
    const [status, setStatus] = useState<string | undefined>('draft');
    const [entityType, setEntityType] = useState<string | undefined>();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const load = useCallback(
        async (pageNum: number, replace: boolean) => {
            try {
                if (replace) {
                    setLoading(true);
                } else {
                    setLoadingMore(true);
                }
                const response = await studentReviewService.list({
                    page: pageNum,
                    limit: LIMIT,
                    status: status as StudentReviewStatus | undefined,
                    entityType: entityType as (typeof STUDENT_REVIEW_ENTITY_TYPES)[number] | undefined,
                    search: debouncedSearch || undefined,
                });
                const rows = response.data ?? [];
                setReviews((prev) => (replace ? rows : [...prev, ...rows]));
                setHasMore(Boolean(response.pagination?.hasNextPage));
                setTotal(response.pagination?.total ?? rows.length);
            } catch (error) {
                toast.error(apiErrorMessage(error, 'Could not load reviews'));
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [status, entityType, debouncedSearch],
    );

    useEffect(() => {
        setPage(1);
        load(1, true);
    }, [load]);

    const loadMore = () => {
        if (loadingMore || !hasMore) return;
        const next = page + 1;
        setPage(next);
        load(next, false);
    };

    const sentinelRef = useInfiniteScroll(loadMore, { hasMore, loading: loadingMore });

    const decide = async (review: IStudentReview, next: StudentReviewStatus) => {
        setBusyId(review._id);
        try {
            await studentReviewService.setStatus(review._id, next);
            toast.success(
                next === 'published'
                    ? 'Review approved — it is now on the website'
                    : next === 'inactive'
                      ? 'Review rejected'
                      : 'Review moved back to pending',
            );
            // Refetch rather than patch in place: with a status filter on, the
            // row it just left no longer belongs in this list.
            load(1, true);
            setPage(1);
        } catch (error) {
            toast.error(apiErrorMessage(error, 'Could not update this review'));
        } finally {
            setBusyId(null);
        }
    };

    const remove = async () => {
        if (!deleting) return;
        setBusyId(deleting._id);
        try {
            await studentReviewService.remove(deleting._id);
            toast.success('Review deleted');
            setDeleting(null);
            load(1, true);
            setPage(1);
        } catch (error) {
            toast.error(apiErrorMessage(error, 'Could not delete this review'));
        } finally {
            setBusyId(null);
        }
    };

    const columns: Column<IStudentReview>[] = [
        {
            key: 'rating',
            header: 'Rating',
            sortable: false,
            className: 'w-[110px]',
            render: (r) => <Stars rating={r.rating} />,
        },
        {
            key: 'comment',
            header: 'Review',
            sortable: false,
            render: (r) => (
                <div className="min-w-0 max-w-xl">
                    <p className="whitespace-pre-line text-sm">{r.comment}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {r.authorName || 'A student'} · {formatDate(r.createdAt)}
                    </p>
                </div>
            ),
        },
        {
            key: 'entityName',
            header: 'About',
            sortable: false,
            render: (r) => (
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.entityName || '—'}</p>
                    <p className="text-xs text-muted-foreground">{r.entityType}</p>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: false,
            render: (r) => (
                <Badge tone={STATUS_TONE[r.status] ?? 'neutral'}>
                    {REVIEW_STATUS_LABELS[r.status] ?? r.status}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: '',
            sortable: false,
            align: 'right',
            render: (r) => (
                <div className="flex items-center justify-end gap-1.5">
                    {busyId === r._id ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            {r.status !== 'published' && (
                                <Button size="sm" onClick={() => decide(r, 'published')}>
                                    <Check className="mr-1.5 size-3.5" />
                                    Approve
                                </Button>
                            )}
                            {r.status !== 'inactive' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => decide(r, 'inactive')}
                                >
                                    <X className="mr-1.5 size-3.5" />
                                    Reject
                                </Button>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeleting(r)}
                                title="Delete permanently"
                            >
                                <Trash2 className="size-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Student Reviews"
                subtitle="Reviews written by students on the website. Approve one and it appears on the page it is about."
                actions={
                    <Button variant="outline" onClick={() => load(1, true)} disabled={loading}>
                        <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                }
            />

            <Card className="mb-4 flex flex-wrap items-end gap-3 p-3">
                <FilterSelect
                    label="Status"
                    value={status}
                    onChange={setStatus}
                    options={STATUS_OPTIONS}
                    allLabel="All statuses"
                />
                <FilterSelect
                    label="About"
                    value={entityType}
                    onChange={setEntityType}
                    options={STUDENT_REVIEW_ENTITY_TYPES}
                    allLabel="Everything"
                />
                <div className="flex min-w-[220px] flex-1 flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Search</Label>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Words in a review, a student, a university…"
                    />
                </div>
                <p className="ml-auto text-sm text-muted-foreground">
                    {total} {total === 1 ? 'review' : 'reviews'}
                </p>
            </Card>

            <ResourceTable
                columns={columns}
                rows={reviews}
                isLoading={loading}
                sentinelRef={sentinelRef}
                isFetchingNextPage={loadingMore}
                hasNextPage={hasMore}
                emptyTitle={status === 'draft' ? 'Nothing waiting' : 'No reviews here'}
                emptyDescription={
                    status === 'draft'
                        ? 'Every review students have sent in has been dealt with.'
                        : 'Try a different status or clear the search.'
                }
            />

            <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes it for good. To take it off the website but keep it on
                            record, reject it instead.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void remove();
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function Stars({ rating }: { rating: number }) {
    return (
        <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={
                        n <= rating
                            ? 'size-3.5 fill-primary text-primary'
                            : 'size-3.5 text-muted-foreground/30'
                    }
                />
            ))}
        </span>
    );
}
