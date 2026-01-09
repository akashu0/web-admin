import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import type { University } from "@/types/university";

interface CreateColumnsProps {
    onEdit: (university: University) => void;
    onDelete: (id: string) => void;
    onView?: (university: University) => void;
}

export const createColumns = ({
    onEdit,
    onDelete,
    onView,
}: CreateColumnsProps): ColumnDef<University>[] => [
        {
            id: "select",
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
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "logoUrl",
            header: "Logo",
            cell: ({ row }) => {
                const logoUrl = row.getValue("logo") as string;
                return (
                    <div className="flex items-center justify-center">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={row.original.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium">
                                {row.original.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "name",
            header: "University Name",
            cell: ({ row }) => (
                <div className="max-w-xs">
                    <div className="font-medium text-gray-900">{row.getValue("name")}</div>
                    <div className="text-sm text-gray-500 truncate">
                        {row.original.fullName}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">{row.original.city}</div>
                    <div className="text-gray-500">{row.original.country}</div>
                </div>
            ),
        },
        {
            accessorKey: "rank",
            header: "Ranking",
            cell: ({ row }) => {
                const rank = row.getValue("rank") as string;
                return rank ? (
                    <Badge variant="secondary" className="font-mono">
                        #{rank}
                    </Badge>
                ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                );
            },
        },
        {
            accessorKey: "totalStudents",
            header: "Students",
            cell: ({ row }) => {
                const total = row.getValue("totalStudents") as string;
                const international = row.original.internationalStudents;
                return (
                    <div className="text-sm">
                        <div className="font-medium text-gray-900">{total || "N/A"}</div>
                        {international && (
                            <div className="text-gray-500 text-xs">
                                {international} international
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "founded",
            header: "Founded",
            cell: ({ row }) => {
                const founded = row.getValue("founded") as string;
                return (
                    <div className="text-sm text-gray-900">{founded || "N/A"}</div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge
                        variant={status === "published" ? "default" : "secondary"}
                        className={
                            status === "published"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                    >
                        {status === "published" ? "Published" : "Draft"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const university = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onView && (
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        onView(university);
                                    }}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    onEdit(university);
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    onDelete(university._id);
                                }}
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