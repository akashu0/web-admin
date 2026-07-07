// pages/Agent/AgentList.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { agentService } from '@/services/agentService';
import type { IAgentSummary, AgentStatus } from '@/types/agent';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';

const statusStyles: Record<AgentStatus, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'not-verified': 'bg-gray-100 text-gray-800',
    inactive: 'bg-slate-100 text-slate-800',
    suspended: 'bg-orange-100 text-orange-800',
    rejected: 'bg-red-100 text-red-800',
};

function formatDate(value: string | null) {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
}

export default function AgentList() {
    const navigate = useNavigate();
    const [agents, setAgents] = useState<IAgentSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const isReset = useRef(true);
    const loadingRef = useRef(false);

    // Reset to page 1 whenever the search term changes
    useEffect(() => {
        isReset.current = true;
        setPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchAgents(page, !isReset.current);
        isReset.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm]);

    const fetchAgents = async (pageNum: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }
            const params = {
                page: pageNum,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
            };

            const response = await agentService.getAllAgents(params);
            setAgents((prev) => (append ? [...prev, ...(response.data || [])] : response.data || []));
            if (response.pagination) {
                setHasMore(response.pagination.hasNextPage);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
            if (!append) setAgents([]);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            loadingRef.current = false;
        }
    };

    const handleScroll = useCallback(() => {
        if (loadingRef.current || !hasMore) return;
        const scrollTop = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 300;
        if (scrollTop >= threshold) {
            setPage((p) => p + 1);
        }
    }, [hasMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const handleView = (agent: IAgentSummary) => {
        navigate(`/agents/${agent._id}`);
    };

    const columnHelper = createColumnHelper<IAgentSummary>();

    const columns = [
        columnHelper.display({
            id: 'name',
            header: 'Name',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold text-xs">
                            {(info.row.original.firstName?.[0] || '').toUpperCase()}
                            {(info.row.original.lastName?.[0] || '').toUpperCase()}
                        </span>
                    </div>
                    <div className="font-medium text-gray-900">
                        {info.row.original.firstName} {info.row.original.lastName}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('emailid', {
            header: 'Email',
            cell: (info) => <span className="text-gray-900">{info.getValue()}</span>,
        }),
        columnHelper.accessor('phoneNumber', {
            header: 'Phone',
            cell: (info) => <span className="text-gray-900">{info.getValue()}</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[info.getValue()] || 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {info.getValue()}
                </span>
            ),
        }),
        columnHelper.accessor('lastLoginAt', {
            header: 'Last Login',
            cell: (info) => <span className="text-gray-600">{formatDate(info.getValue())}</span>,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleView(info.row.original)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data: agents,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Users className="w-8 h-8 text-black" />
                                Agent Management
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Browse agents and their sub-employees using the agent portal
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search agents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-black-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                    </div>
                ) : agents.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents found</h3>
                        <p className="text-gray-600">Agents will appear here once they register on the agent portal</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleView(row.original)}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className="px-6 py-4 whitespace-nowrap"
                                                    onClick={(e) => {
                                                        if (cell.column.id === 'actions') e.stopPropagation();
                                                    }}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Infinite scroll status */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
                            {isLoadingMore ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                            ) : !hasMore && agents.length > 0 ? (
                                <span className="text-sm text-gray-500">All {total} agents loaded</span>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
