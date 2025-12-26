// pages/Course/columns.tsx
// pages/Course/columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/course";

interface ColumnProps {
    onEdit: (course: Course) => void;
    onDelete: (id: string) => void;
}

export const createColumns = ({
    onEdit,
    onDelete,
}: ColumnProps): ColumnDef<Course>[] => [
        {
            id: "imageAndName",
            header: "Course",
            cell: ({ row }) => {
                const course = row.original;
                const imageUrl = course.courseImage || "/placeholder-course.jpg";

                return (
                    <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img
                                src={imageUrl}
                                alt={course.courseName || "Course"}
                                className="object-cover h-full w-full"
                            />
                        </div>
                        <div>
                            <div className="font-medium">{course.courseName || "N/A"}</div>
                            {course.slug && (
                                <div className="text-xs text-gray-500">{course.slug}</div>
                            )}
                        </div>
                    </div>
                );
            },
            enableSorting: false,
        },

        {
            accessorKey: "awardedBy",
            header: "Awarded By",
            cell: ({ row }) => {
                const awardedBy = row.original.awardedBy || "N/A";
                return <div className="text-sm capitalize">{awardedBy}</div>;
            },
        },

        {
            accessorKey: "level",
            header: "Level",
            cell: ({ row }) => {
                const level = row.original.level || "N/A";
                return <div className="text-sm capitalize">{level}</div>;
            },
        },

        {
            accessorKey: "studyMode",
            header: "Study Mode",
            cell: ({ row }) => {
                const studyMode = row.original.studyMode || "N/A";
                return <div className="text-sm capitalize">{studyMode}</div>;
            },
        },

        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status || "draft";
                return (
                    <Badge variant={status === "published" ? "default" : "secondary"}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            },
        },

        {
            id: "actions",
            cell: ({ row }) => {
                const course = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem
                                className="text-gray-600 focus:text-gray-600 cursor-pointer"
                                onClick={() => onEdit(course)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(course._id)}
                                className="text-red-600 focus:text-red-600 cursor-pointer"
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