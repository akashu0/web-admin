// src/pages/FAQ/FAQTable.tsx
import { useState, useEffect } from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
} from '@tanstack/react-table';

import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IFAQ } from '@/types/faq';

interface FAQTableProps {
    data: IFAQ[];
    onEdit: (faq: IFAQ) => void;
    onDelete: (id: string) => void;
    onView: (faq: IFAQ) => void;
    onSelectionChange?: (selectedIds: string[]) => void;
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    setTotalPages: (totalPages: number) => void;
}

export const FAQTable = ({
    data,
    onEdit,
    onDelete,
    onView,
    onSelectionChange,
}: FAQTableProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const columns: ColumnDef<IFAQ>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'title',
            header: 'Title',
            cell: ({ row }) => (
                <div className="max-w-md font-medium">
                    {row.getValue('title')}
                </div>
            ),
        },
        {
            accessorKey: 'entityType',
            header: 'Entity Type',
            cell: ({ row }) => (
                <Badge variant="outline">{row.getValue('entityType')}</Badge>
            ),
        },
        {
            accessorKey: 'questions',
            header: 'Questions',
            cell: ({ row }) => {
                const questions = row.getValue('questions') as IFAQ['questions'];
                return (
                    <div className="text-center">
                        <Badge variant="secondary">
                            {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const statusConfig = {
                    active: {
                        label: 'Active',
                        className: 'bg-green-100 text-green-800 hover:bg-green-100',
                    },
                    inactive: {
                        label: 'Inactive',
                        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
                    },
                    draft: {
                        label: 'Draft',
                        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
                    },
                };

                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

                return (
                    <Badge variant="secondary" className={config.className}>
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'language',
            header: 'Language',
            cell: ({ row }) => (
                <div className="text-center uppercase text-sm text-zinc-600">
                    {row.getValue('language')}
                </div>
            ),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Last Updated',
            cell: ({ row }) => {
                const date = new Date(row.getValue('updatedAt'));
                return (
                    <div className="text-sm text-zinc-600">
                        {date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const faq = row.original;

                return (
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
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
        },
    });

    // Notify parent about selection changes
    useEffect(() => {
        const selectedIds = table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id);
        onSelectionChange?.(selectedIds);
    }, [rowSelection, onSelectionChange, table]);

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
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
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No FAQs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-500">
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};