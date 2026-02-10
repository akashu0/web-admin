import { useEffect, useState, useMemo } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    type SortingState
} from '@tanstack/react-table';
import * as Dialog from '@radix-ui/react-dialog'; // Using Radix for the detail view
import { fetchAllEnquiries } from '@/services/enquireyservice';

interface IEnquiry {
    _id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    programInterested: string;
    additionalComments?: string;
    consent: boolean;
    createdAt: string;
}

const columnHelper = createColumnHelper<IEnquiry>();

export default function EnquiryList() {
    const [data, setData] = useState<IEnquiry[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedEnquiry, setSelectedEnquiry] = useState<IEnquiry | null>(null);

    useEffect(() => {
        fetchAllEnquiries().then(setData).catch(console.error);
    }, []);

    const columns = useMemo(() => [
        columnHelper.display({
            id: 'rowNumber',
            header: '#',
            cell: (info) => info.row.index + 1,
        }),
        columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
            id: 'fullName',
            header: 'Name',
        }),
        columnHelper.accessor('email', { header: 'Email' }),
        columnHelper.accessor('mobileNumber', { header: 'Mobile' }),
        columnHelper.accessor('programInterested', { header: 'Program' }),
        columnHelper.accessor('createdAt', {
            header: 'Date',
            cell: info => new Date(info.getValue()).toLocaleDateString(),
        }),
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="p-8 bg-white min-h-screen text-black">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-black pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Enquiry Ledger</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Administrative View</p>
                </div>
                <input
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    className="p-3 border-2 border-black rounded-none bg-white focus:bg-black focus:text-white transition-all w-full md:w-72 outline-none placeholder:text-gray-400"
                    placeholder="FILTER RECORDS..."
                />
            </div>

            {/* Table Section */}
            <div className="border-2 border-black overflow-hidden bg-white">
                <table className="min-w-full divide-y divide-black">
                    <thead className="text-black">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest cursor-pointer"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? '↑' : '↓') : '•'}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className="hover:bg-gray-100 cursor-pointer transition-colors group"
                                onClick={() => setSelectedEnquiry(row.original)}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-4 text-sm font-medium border-r border-gray-100 last:border-0">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Radix UI Dialog for Details */}
            <Dialog.Root open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white border-4 border-black p-8 z-[51] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-start mb-6">
                            <Dialog.Title className="text-2xl font-black uppercase">Enquiry Details</Dialog.Title>
                            <Dialog.Close className="text-2xl hover:scale-125 transition-transform">✕</Dialog.Close>
                        </div>

                        {selectedEnquiry && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">First Name</p>
                                        <p className="font-bold">{selectedEnquiry.firstName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Last Name</p>
                                        <p className="font-bold">{selectedEnquiry.lastName || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Program Interested</p>
                                        <p className="inline-block bg-black text-white px-2 py-1 text-sm">{selectedEnquiry.programInterested}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Contact</p>
                                        <p className="text-sm italic">{selectedEnquiry.email}</p>
                                        <p className="text-sm">{selectedEnquiry.mobileNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Additional Comments</p>
                                        <p className="text-sm bg-gray-50 p-3 border-l-4 border-black italic">
                                            "{selectedEnquiry.additionalComments || 'No comments provided.'}"
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedEnquiry(null)}
                                    className="w-full bg-black text-white font-bold py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                >
                                    Close Record
                                </button>
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}