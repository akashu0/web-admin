import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { CommissionDrawer, type DrawerMode } from "./Commissiondrawer";
import { CommissionTierDisplay } from "./Commissiontierdisplay";
import {
    useInfiniteCommissions,
    useCreateCommission,
    useUpdateCommission,
    useDeleteCommission,
    useBulkUpload,
} from "../../../hooks/useCommissions";
import {
    type PartnerCommission,
    type CommissionFormValues,
    type CourseType,
} from "../../../types/commission";

// ── Skeleton row ──────────────────────────────────────────────────────────────

const SkeletonRow = () => (
    <tr className="border-b border-zinc-100">
        {[160, 80, 100, 100, 80, 60].map((w, i) => (
            <td key={i} className="px-4 py-3">
                <div
                    className="h-3.5 bg-zinc-100 rounded animate-pulse"
                    style={{ width: w }}
                />
            </td>
        ))}
    </tr>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
    <tr>
        <td colSpan={7}>
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-200 flex items-center justify-center mb-4 text-xl text-zinc-300">
                    %
                </div>
                <p className="text-sm font-semibold text-zinc-700 mb-1">
                    No commissions yet
                </p>
                <p className="text-xs text-zinc-400 mb-4">
                    Add a commission rate or bulk upload from your Excel export.
                </p>
                <button
                    onClick={onAdd}
                    className="text-xs font-semibold bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                    Add first commission
                </button>
            </div>
        </td>
    </tr>
);

// ── Table row ─────────────────────────────────────────────────────────────────

const CommissionRow = ({
    commission,
    onView,
    onEdit,
    onDelete,
}: {
    commission: PartnerCommission;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Show up to 3 offered course types inline
    const offeredTypes = (
        ["bachelors", "masters", "phd", "certifications_ps", "diploma_fopg", "diploma"] as CourseType[]
    ).filter((ct) => commission[ct]?.ranges?.length);

    return (
        <tr className="border-b border-zinc-100 hover:bg-zinc-50/70 transition-colors group">
            {/* University */}
            <td className="px-4 py-3">
                <div className="flex items-start gap-2.5">
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 leading-snug">
                            {commission.universityName}
                        </p>
                        {(commission.location || commission.country) && (
                            <p className="text-xs text-zinc-400 font-mono mt-0.5">
                                {[commission.location, commission.country].filter(Boolean).join(", ")}
                            </p>
                        )}
                    </div>
                </div>
            </td>

            {/* Linked badge */}
            <td className="px-4 py-3">
                {commission.universityRef ? (
                    <span className="text-[10px] font-semibold tracking-widest uppercase bg-zinc-900 text-white px-2 py-0.5 rounded-sm">
                        Linked
                    </span>
                ) : (
                    <span className="text-[10px] font-semibold tracking-widest uppercase border border-zinc-200 text-zinc-400 px-2 py-0.5 rounded-sm">
                        Standalone
                    </span>
                )}
            </td>

            {/* Bachelors */}
            <td className="px-4 py-3">
                <CommissionTierDisplay tier={commission.bachelors} compact />
            </td>

            {/* Masters */}
            <td className="px-4 py-3">
                <CommissionTierDisplay tier={commission.masters} compact />
            </td>

            {/* Other courses count */}
            <td className="px-4 py-3">
                {offeredTypes.length > 2 ? (
                    <span className="text-xs text-zinc-500">
                        +{offeredTypes.filter(ct => ct !== "bachelors" && ct !== "masters").length} more
                    </span>
                ) : (
                    <span className="text-zinc-300 text-xs font-mono">—</span>
                )}
            </td>

            {/* Intakes */}
            <td className="px-4 py-3">
                <span className="text-xs font-mono text-zinc-500">
                    {commission.intakes ?? "—"}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onView}
                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
                    >
                        View
                    </button>
                    <button
                        onClick={onEdit}
                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
                    >
                        Edit
                    </button>
                    {confirmDelete ? (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onDelete}
                                className="text-[11px] font-semibold text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="text-[11px] text-zinc-400 px-1"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="text-[11px] font-semibold text-zinc-300 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

// ── Main list component ───────────────────────────────────────────────────────

export const CommissionList = () => {
    const [search, setSearch] = useState("");
    const [country, setCountry] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Drawer state
    const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
    const [selectedCommission, setSelectedCommission] = useState<PartnerCommission | null>(null);

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
    });

    // Flatten the paginated responses into a single list, and read the total
    // from the most recent page (it's the same across pages for a given query).
    const commissions = useMemo(
        () => data?.pages.flatMap((p) => p.data) ?? [],
        [data]
    );
    const total = data?.pages[data.pages.length - 1]?.total ?? 0;

    // Infinite scroll - this page renders inside MainLayout's <main>, which
    // only has a min-height (not a fixed height), so the window is the real
    // scroll container.
    const handleScroll = useCallback(() => {
        if (isFetchingNextPage || !hasNextPage) return;
        if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 400) {
            fetchNextPage();
        }
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const createMutation = useCreateCommission();
    const updateMutation = useUpdateCommission();
    const deleteMutation = useDeleteCommission();
    const bulkMutation = useBulkUpload();

    const isSubmitting =
        createMutation.isPending ||
        updateMutation.isPending ||
        bulkMutation.isPending;

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

    const openBulk = () => {
        setSelectedCommission(null);
        setDrawerMode("bulk");
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

    const handleBulkUpload = async (records: unknown[]) => {
        await bulkMutation.mutateAsync(records);
        closeDrawer();
    };

    const handleDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    // ── Debounced search ──────────────────────────────────────────────────────

    const handleSearchChange = (val: string) => {
        setSearch(val);
        clearTimeout((window as any).__searchTimer);
        (window as any).__searchTimer = setTimeout(() => {
            setDebouncedSearch(val);
        }, 350);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Page header */}
            <div className="border-b border-zinc-100 bg-white sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                            Partner Commissions
                        </h1>
                        {data && (
                            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                                {total} universities
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={openBulk}
                            className="text-sm font-semibold border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                        >
                            Bulk upload
                        </button>
                        <button
                            onClick={openCreate}
                            className="text-sm font-semibold bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            + Add commission
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3 border-b border-zinc-100">
                <input
                    type="text"
                    placeholder="Search university..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-64 text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 placeholder-zinc-300 focus:outline-none focus:border-zinc-900 transition-colors font-mono"
                />
                <input
                    type="text"
                    placeholder="Filter by country..."
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-48 text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-900 placeholder-zinc-300 focus:outline-none focus:border-zinc-900 transition-colors font-mono"
                />
                {(search || country) && (
                    <button
                        onClick={() => {
                            setSearch("");
                            setCountry("");
                            setDebouncedSearch("");
                        }}
                        className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors font-medium"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                {isError && (
                    <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                        Failed to load commissions. Please try again.
                    </div>
                )}

                <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                                {[
                                    "University",
                                    "Status",
                                    "Bachelors",
                                    "Masters",
                                    "Others",
                                    "Intakes",
                                    "",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-[10px] font-semibold tracking-widest uppercase text-zinc-400"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading &&
                                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

                            {!isLoading && commissions.length === 0 && (
                                <EmptyState onAdd={openCreate} />
                            )}

                            {!isLoading &&
                                commissions.map((commission: PartnerCommission) => (
                                    <CommissionRow
                                        key={commission._id}
                                        commission={commission}
                                        onView={() => openView(commission)}
                                        onEdit={() => openEdit(commission)}
                                        onDelete={() => handleDelete(commission._id)}
                                    />
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Infinite scroll status */}
                {commissions.length > 0 && isFetchingNextPage && (
                    <div className="flex items-center justify-center gap-2 py-4 text-xs text-zinc-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading more commissions...
                    </div>
                )}
                {commissions.length > 0 && !hasNextPage && !isFetchingNextPage && (
                    <p className="text-center text-xs text-zinc-400 mt-4">
                        All {total} commissions loaded
                    </p>
                )}
            </div>

            {/* Drawer */}
            <CommissionDrawer
                mode={drawerMode ?? "view"}
                commission={selectedCommission}
                isOpen={drawerMode !== null}
                onClose={closeDrawer}
                onSubmit={handleSubmit}
                onBulkUpload={handleBulkUpload}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};