import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, Plus, MoreHorizontal, Pencil, Trash2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceTable, type Column } from "@/components/common/ResourceTable";
import type { SortState } from "@/components/ui/table";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import { visaService } from "@/services/visaService";
import { toast } from "sonner";
import { apiErrorMessage } from "@/services/api";
import { DeleteVisaDialog } from "./DeleteVisaDialog";
import { AddEditVisaModal } from "./AddEditVisaModal";
import type { Visa } from "@/types/visa";

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

const VisaList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [visas, setVisas] = useState<Visa[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [editingVisa, setEditingVisa] = useState<Visa | null>(null);
    const [deletingVisa, setDeletingVisa] = useState<Visa | null>(null);

    // Infinite scroll state
    const [page, setPage] = useState<number>(1);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });

    const isReset = useRef(true);
    const loadingRef = useRef(false);
    const [sort, setSort] = useState<SortState>();

    // The view page's Edit button sends the record back here, because the editor
    // is a modal on this list and a modal has no URL of its own. The state is
    // cleared straight away so a refresh does not reopen it.
    useEffect(() => {
        const incoming = (location.state as { editVisa?: Visa } | null)?.editVisa;
        if (incoming) {
            setEditingVisa(incoming);
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location, navigate]);

    useEffect(() => {
        fetchVisas(page, !isReset.current);
        isReset.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sort]);

    // A new order starts at the first page: page 4 of the old order is rows from
    // the middle of a list nobody has seen.
    useEffect(() => {
        isReset.current = true;
        setPage(1);
    }, [sort]);

    const fetchVisas = async (pageNum: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }
            const response = await visaService.getAllVisas({
                page: pageNum,
                limit: 10,
                ...(sort && { sort: sort.field, dir: sort.dir }),
            });
            setVisas((prev) => (append ? [...prev, ...response.data] : response.data));
            setPagination(response.pagination);
        } catch (error) {
            console.error("Error fetching visas:", error);
            // The previous page's hasNextPage is still true, so leaving it alone
            // lets the scroll sentinel refire this failed request forever — one
            // error toast per intersection.
            setPagination((prev) => ({ ...prev, hasNextPage: false }));
            toast.error(apiErrorMessage(error, "Failed to fetch visas"));
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            loadingRef.current = false;
        }
    };

    const refetch = () => {
        isReset.current = true;
        if (page === 1) {
            fetchVisas(1, false);
        } else {
            setPage(1);
        }
    };

    const sentinelRef = useInfiniteScroll(() => setPage((p) => p + 1), {
        hasMore: pagination.hasNextPage,
        loading: isLoadingMore || isLoading,
    });

    // Country search filters the rows already loaded — the visa endpoint takes no
    // search param, so this stays a client-side narrowing of the current list.
    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? visas.filter((v) => v.country?.toLowerCase().includes(q)) : visas;
    }, [visas, search]);

    const columns: Column<Visa>[] = useMemo(() => [
        {
            key: "country",
            header: "Country",
            render: (visa) => <span className="font-medium">{visa.country}</span>,
        },
        {
            key: "visaFee",
            header: "Visa Fee",
            render: (visa) => (
                <span className="tabular-nums">
                    {visa.currency} {visa.visaFee.toLocaleString()}
                </span>
            ),
        },
        {
            key: "visaSuccessRate",
            header: "Success Rate",
            render: (visa) => <span className="font-medium tabular-nums">{visa.visaSuccessRate}%</span>,
        },
        {
            key: "visaProcessingTime",
            header: "Processing Time",
            render: (visa) => (
                <span>
                    {visa.visaProcessingTime} {visa.visaProcessingTimeUnit}
                </span>
            ),
        },
        {
            key: "visaRenewalCost",
            header: "Renewal Cost",
            render: (visa) => (
                <span className="tabular-nums">
                    {visa.currency} {visa.visaRenewalCost.toLocaleString()}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (visa) => (
                <Badge tone={visa.status === "active" ? "green" : "neutral"}>{visa.status}</Badge>
            ),
        },
        {
            key: "actions",
            sortable: false,
            header: "Actions",
            align: "right",
            render: (visa) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/visas/view/${visa._id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingVisa(visa)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setDeletingVisa(visa)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
        // navigate is stable in react-router v6
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []);

    return (
        <div>
            <PageHeader
                title="Visa Management"
                subtitle="Manage visa requirements and processing details"
                actions={
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Visa
                    </Button>
                }
            />

            <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by country..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <span className="ml-auto pr-1 text-xs text-muted-foreground">
                    {visas.length} of {pagination.total}
                </span>
            </Card>

            <Card className="overflow-hidden">
                <ResourceTable
                    columns={columns}
                    rows={rows}
                    isLoading={isLoading}
                    sort={sort}
                    onSort={setSort}
                    sentinelRef={sentinelRef}
                    isFetchingNextPage={isLoadingMore}
                    hasNextPage={pagination.hasNextPage}
                    emptyTitle="No visas found"
                    emptyDescription={search ? "No country matches that search." : undefined}
                />
            </Card>

            <AddEditVisaModal
                isOpen={isAddModalOpen || !!editingVisa}
                visa={editingVisa}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingVisa(null);
                }}
                onSuccess={refetch}
            />

            <DeleteVisaDialog
                isOpen={!!deletingVisa}
                visa={deletingVisa}
                onClose={() => setDeletingVisa(null)}
                onSuccess={refetch}
            />
        </div>
    );
};

export default VisaList;
