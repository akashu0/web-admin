import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceTable, type Column } from "@/components/common/ResourceTable";
import type { SortState } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { CommissionDrawer, type DrawerMode } from "./Commissiondrawer";
import { CommissionTierDisplay } from "./Commissiontierdisplay";
import {
    useInfiniteCommissions,
    useCreateCommission,
    useUpdateCommission,
    useDeleteCommission,
} from "../../../hooks/useCommissions";
import {
    type PartnerCommission,
    type CommissionFormValues,
    type CourseType,
} from "../../../types/commission";

const COURSE_TYPES: CourseType[] = [
    "bachelors",
    "masters",
    "phd",
    "certifications_ps",
    "diploma_fopg",
    "diploma",
];

/** View / Edit / Delete for one row; delete asks for a second click in place. */
const RowActions = ({
    onView,
    onEdit,
    onDelete,
}: {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={onView}>
                View
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit
            </Button>
            {confirmDelete ? (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={onDelete}
                    >
                        Confirm
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                        ✕
                    </Button>
                </>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                >
                    Delete
                </Button>
            )}
        </div>
    );
};

export const CommissionList = () => {
    const [search, setSearch] = useState("");
    const [country, setCountry] = useState("");
    const debouncedSearch = useDebounce(search);

    // Drawer state
    const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
    const [selectedCommission, setSelectedCommission] = useState<PartnerCommission | null>(null);
    const [sort, setSort] = useState<SortState>();

    // Queries - infinite scroll: each page is fetched in sequence and appended.
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteCommissions({
        limit: 20,
        search: debouncedSearch,
        country: country || undefined,
        // In the query key, so a header click starts a fresh list rather than
        // appending differently-ordered pages to the ones already loaded.
        sort: sort?.field,
        dir: sort?.dir,
    });

    // Flatten the paginated responses into a single list, and read the total
    // from the most recent page (it's the same across pages for a given query).
    const commissions = useMemo(
        () => data?.pages.flatMap((p) => p.data) ?? [],
        [data]
    );
    const total = data?.pages[data.pages.length - 1]?.total ?? 0;

    // The scroll container is AppLayout's <main>, which the shared hook observes.
    const sentinelRef = useInfiniteScroll(() => fetchNextPage(), {
        hasMore: Boolean(hasNextPage),
        loading: isFetchingNextPage,
    });

    const createMutation = useCreateCommission();
    const updateMutation = useUpdateCommission();
    const deleteMutation = useDeleteCommission();

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    // ── Drawer open helpers ───────────────────────────────────────────────────

    const openCreate = () => {
        setSelectedCommission(null);
        setDrawerMode("create");
    };

    const openView = (c: PartnerCommission) => {
        setSelectedCommission(c);
        setDrawerMode("view");
    };

    const openEdit = (c: PartnerCommission) => {
        setSelectedCommission(c);
        setDrawerMode("edit");
    };

    const closeDrawer = () => setDrawerMode(null);

    // ── Submit handlers ───────────────────────────────────────────────────────

    const handleSubmit = async (values: CommissionFormValues) => {
        if (drawerMode === "create") {
            await createMutation.mutateAsync(values);
        } else if (drawerMode === "edit" && selectedCommission) {
            await updateMutation.mutateAsync({
                id: selectedCommission._id,
                data: values,
            });
        }
        closeDrawer();
    };

    const handleDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    const columns: Column<PartnerCommission>[] = useMemo(() => [
        {
            key: "university",
            header: "University",
            render: (commission) => (
                <div className="min-w-0">
                    <p className="truncate font-semibold">{commission.universityName}</p>
                    {(commission.location || commission.country) && (
                        <p className="truncate text-xs text-muted-foreground">
                            {[commission.location, commission.country].filter(Boolean).join(", ")}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "linked",
            sortable: false,
            header: "Status",
            render: (commission) => (
                <Badge tone={commission.universityRef ? "green" : "neutral"}>
                    {commission.universityRef ? "Linked" : "Standalone"}
                </Badge>
            ),
        },
        {
            key: "bachelors",
            sortable: false,
            header: "Bachelors",
            render: (commission) => <CommissionTierDisplay tier={commission.bachelors} compact />,
        },
        {
            key: "masters",
            sortable: false,
            header: "Masters",
            render: (commission) => <CommissionTierDisplay tier={commission.masters} compact />,
        },
        {
            key: "others",
            sortable: false,
            header: "Others",
            render: (commission) => {
                const offered = COURSE_TYPES.filter((ct) => commission[ct]?.ranges?.length);
                const others = offered.filter((ct) => ct !== "bachelors" && ct !== "masters");
                return offered.length > 2 ? (
                    <span className="text-muted-foreground">+{others.length} more</span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                );
            },
        },
        {
            key: "intakes",
            sortable: false,
            header: "Intakes",
            render: (commission) => (
                <span className="text-muted-foreground">{commission.intakes ?? "—"}</span>
            ),
        },
        {
            key: "actions",
            sortable: false,
            header: "",
            align: "right",
            render: (commission) => (
                <RowActions
                    onView={() => openView(commission)}
                    onEdit={() => openEdit(commission)}
                    onDelete={() => handleDelete(commission._id)}
                />
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []);

    return (
        <div>
            <PageHeader
                title="Partner Commissions"
                subtitle={`${total} records — a university's own commission is edited on its Commission tab`}
                actions={<Button onClick={openCreate}>+ Add commission</Button>}
            />

            {/* Filters */}
            <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search university..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Input
                    placeholder="Filter by country..."
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-48"
                />
                {(search || country) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearch("");
                            setCountry("");
                        }}
                    >
                        Clear filters
                    </Button>
                )}
                <span className="ml-auto pr-1 text-xs text-muted-foreground">
                    {commissions.length} of {total}
                </span>
            </Card>

            {isError && (
                <Card className="mb-4 border-destructive/30 bg-destructive/5 p-3 text-destructive">
                    Failed to load commissions. Please try again.
                </Card>
            )}

            <Card className="overflow-hidden">
                <ResourceTable
                    columns={columns}
                    rows={commissions}
                    isLoading={isLoading}
                    sort={sort}
                    onSort={setSort}
                    sentinelRef={sentinelRef}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    emptyTitle="No commissions yet"
                    emptyDescription="A university's commission is added on its own Commission tab."
                />
            </Card>

            {/* Drawer */}
            <CommissionDrawer
                mode={drawerMode ?? "view"}
                commission={selectedCommission}
                isOpen={drawerMode !== null}
                onClose={closeDrawer}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};
