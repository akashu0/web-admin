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
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";

import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search,
    Loader2,
} from "lucide-react";

import { visaService } from "../../services/visaService";
import { toast } from "sonner";
import { DeleteVisaDialog } from "./DeleteVisaDialog";
import { AddEditVisaModal } from "./AddEditVisaModal";
import type { Visa } from "@/types/visa";


const VisaList: React.FC = () => {
    const [visas, setVisas] = useState<Visa[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [editingVisa, setEditingVisa] = useState<Visa | null>(null);
    const [deletingVisa, setDeletingVisa] = useState<Visa | null>(null);

    useEffect(() => {
        fetchVisas();
    }, []);

    const fetchVisas = async () => {
        try {
            setIsLoading(true);
            const response = await visaService.getAllVisas();
            setVisas(response.data);
        } catch (error) {
            console.error("Error fetching visas:", error);
            toast.error("Failed to fetch visas");
        } finally {
            setIsLoading(false);
        }
    };

    const columns: ColumnDef<Visa>[] = [
        {
            accessorKey: "country",
            header: "Country",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("country")}</div>
            ),
        },
        {
            accessorKey: "visaFee",
            header: "Visa Fee",
            cell: ({ row }) => {
                const visa = row.original;
                return (
                    <div>
                        {visa.currency} {visa.visaFee.toLocaleString()}
                    </div>
                );
            },
        },
        {
            accessorKey: "visaSuccessRate",
            header: "Success Rate",
            cell: ({ row }) => {
                const rate = row.getValue<number>("visaSuccessRate");
                return <span className="font-medium">{rate}%</span>;
            },
        },
        {
            accessorKey: "visaProcessingTime",
            header: "Processing Time",
            cell: ({ row }) => {
                const visa = row.original;
                return (
                    <div>
                        {visa.visaProcessingTime} {visa.visaProcessingTimeUnit}
                    </div>
                );
            },
        },
        {
            accessorKey: "visaRenewalCost",
            header: "Renewal Cost",
            cell: ({ row }) => {
                const visa = row.original;
                return (
                    <div>
                        {visa.currency} {visa.visaRenewalCost.toLocaleString()}
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue<string>("status");
                return (
                    <Badge variant={status === "active" ? "default" : "secondary"}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const visa = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => setEditingVisa(visa)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeletingVisa(visa)}
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

    const table = useReactTable({
        data: visas,
        columns,
        state: { sorting, columnFilters },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Visa Management</h1>
                        <p className="text-sm text-gray-500">
                            Manage visa requirements and processing details
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Visa
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search by country..."
                        value={
                            (table.getColumn("country")?.getFilterValue() as string) ?? ""
                        }
                        onChange={(e) =>
                            table.getColumn("country")?.setFilterValue(e.target.value)
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
                                    <TableCell colSpan={columns.length} className="text-center">
                                        <Loader2 className="inline h-6 w-6 animate-spin" />
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
                                    <TableCell colSpan={columns.length} className="text-center">
                                        No visas found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AddEditVisaModal
                isOpen={isAddModalOpen || !!editingVisa}
                visa={editingVisa}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingVisa(null);
                }}
                onSuccess={fetchVisas}
            />

            <DeleteVisaDialog
                isOpen={!!deletingVisa}
                visa={deletingVisa}
                onClose={() => setDeletingVisa(null)}
                onSuccess={fetchVisas}
            />
        </div>
    );
};

export default VisaList;
