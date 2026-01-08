// components/CountryList.tsx
import { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Globe,
    MapPin,
    Eye
} from 'lucide-react';
import { countryService } from '@/services/countryService';
import type { ICountry } from '@/types/country';
import { CountryForm } from './CountryForm';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

export default function CountryList() {
    const navigate = useNavigate();
    const [countries, setCountries] = useState<ICountry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);



    useEffect(() => {
        fetchCountries();
    }, [currentPage, searchTerm]);

    const fetchCountries = async () => {
        try {
            setIsLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                ...(searchTerm && { search: searchTerm }),
            };

            const response = await countryService.getAllCountries(params);
            setCountries(response.data || []);
            if (response.pagination) {
                setTotalPages(response.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
            setCountries([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (country: ICountry) => {
        navigate(`/countries/edit/${country._id}`);
    };

    const handleView = (country: ICountry) => {
        navigate(`/countries/view/${country.slug}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this country?')) return;

        try {
            await countryService.deleteCountry(id);
            fetchCountries();
        } catch (error) {
            console.error('Error deleting country:', error);
            alert('Failed to delete country');
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        fetchCountries();
    };

    const columnHelper = createColumnHelper<ICountry>();

    const columns = [
        columnHelper.accessor('name', {
            header: 'Country',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        {info.row.original.logo ? (
                            <img src={info.row.original.logo} alt={info.getValue()} className="w-full h-full object-cover rounded" />
                        ) : (
                            <span className="text-gray-600 font-semibold text-xs">{info.row.original.code}</span>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{info.getValue()}</div>
                        <div className="text-sm text-gray-500">{info.row.original.code}</div>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('capital', {
            header: 'Capital',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{info.getValue()}</span>
                </div>
            ),
        }),
        columnHelper.accessor('continent', {
            header: 'Continent',
            cell: (info) => <span className="text-gray-900">{info.getValue()}</span>,
        }),
        columnHelper.accessor('spokenLanguages', {
            header: 'Language',
            cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
        }),
        columnHelper.accessor('currency', {
            header: 'Currency',
            cell: (info) => <span className="font-mono text-gray-900">{info.getValue()}</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}
                >
                    {info.getValue()}
                </span>
            ),
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
                    <button
                        onClick={() => handleEdit(info.row.original)}
                        className="p-2 text-purple-600 hover:bg-purple-50 cursor-pointer rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(info.row.original._id)}
                        className="p-2 text-red-600 hover:bg-red-50 cursor-pointer rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data: countries,
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
                                <Globe className="w-8 h-8 text-black" />
                                Country Management
                            </h1>
                            <p className="text-gray-600 mt-2">Manage study abroad destinations</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-black text-white rounded-lg hover:bg-black transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Country
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search countries..."
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
                ) : countries.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No countries found</h3>
                        <p className="text-gray-600 mb-6">Get started by adding your first country</p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg  transition-colors"
                        >
                            Add Country
                        </button>
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
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <CountryForm
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}