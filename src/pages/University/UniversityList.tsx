import type { ColumnDef } from "@tanstack/react-table";
import type { University } from "../../types/university";
import { DataTable } from "../../components/common/DataTable";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

// Mock Data
const data: University[] = [
    { id: "1", name: "Harvard University", country: "USA", ranking: 1, website: "https://harvard.edu" },
    { id: "2", name: "University of Oxford", country: "UK", ranking: 2, website: "https://ox.ac.uk" },
    { id: "3", name: "MIT", country: "USA", ranking: 3, website: "https://mit.edu" },
];

export const UniversityList = () => {
    const navigate = useNavigate();

    const columns: ColumnDef<University>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "country",
            header: "Country",
        },
        {
            accessorKey: "ranking",
            header: "Ranking",
        },
        {
            accessorKey: "website",
            header: "Website",
            cell: ({ row }) => <a href={row.original.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Link</a>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const uni = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/universities/${uni.id}`)}>
                                Edit University
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                                Delete University
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Universities</h2>
                <Button onClick={() => navigate('/universities/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Add University
                </Button>
            </div>
            <DataTable columns={columns} data={data} searchKey="name" />
        </div>
    );
};
