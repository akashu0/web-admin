
import { useEffect, useState } from "react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search,
    Loader2,
} from "lucide-react";

import { DeleteCenterDialog } from "./DeleteCenterDialog";
import { useNavigate } from "react-router-dom";
import { learningCenterService } from "@/services/learningCenterService";

/* ================= TYPES ================= */

export interface EGLearningCenter {
    id: string;
    name: string;
    location: string;
    country: string;
    currency: string;
    createdAt: string;
}

/* ================= COMPONENT ================= */

export default function LearningCenterList() {
    const navigate = useNavigate();
    const [centers, setCenters] = useState<EGLearningCenter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [deletingCenter, setDeletingCenter] =
        useState<EGLearningCenter | null>(null);

    /* ================= FETCH ================= */

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        try {
            setIsLoading(true);
            const data = await learningCenterService.getAllLearningCenters();
            setCenters(data);
        } catch (error) {
            console.error("Error fetching learning centers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditCenter = (center: EGLearningCenter) => {
        navigate(`/learning-centers/edit/${center.id}`);
    };

    /* ================= COLUMNS ================= */

    const columns: ColumnDef<EGLearningCenter>[] = [
        {
            accessorKey: "name",
            header: "Center Name",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "location",
            header: "Location",
        },
        {
            accessorKey: "country",
            header: "Country",
        },
        {
            accessorKey: "currency",
            header: "Currency",
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue<boolean>("isActive");
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status === true
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {status ? "Active" : "Inactive"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const center = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCenter(center)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeletingCenter(center)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    /* ================= TABLE ================= */

    const table = useReactTable({
        data: centers,
        columns,
        state: { sorting, columnFilters },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    /* ================= UI ================= */


    const handleAddCenter = () => {
        navigate("/learning-centers/new");
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            EG Learning Centers
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage all EG learning centers
                        </p>
                    </div>
                    <Button onClick={handleAddCenter}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Center
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search by center name..."
                        value={
                            (table.getColumn("name")?.getFilterValue() as string) ?? ""
                        }
                        onChange={(e) =>
                            table.getColumn("name")?.setFilterValue(e.target.value)
                        }
                        className="pl-9"
                    />
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-white shadow">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((group) => (
                                <TableRow key={group.id}>
                                    {group.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <Loader2 className="inline h-6 w-6 animate-spin text-purple-600" />
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No learning centers found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>


            {/* Delete */}
            <DeleteCenterDialog
                isOpen={!!deletingCenter}
                center={deletingCenter}
                onClose={() => setDeletingCenter(null)}
                onSuccess={fetchCenters}
            />
        </div>
    );
}
