// components/CountryList.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { ResourceTable, type Column } from '@/components/common/ResourceTable';
import { FilterSelect } from '@/components/common/FilterSelect';
import { useDebounce } from '@/hooks/use-debounce';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { countryService } from '@/services/countryService';
import type { ICountry } from '@/types/country';
import { CountryForm } from './CountryForm';

export default function CountryList() {
    const navigate = useNavigate();
    const [countries, setCountries] = useState<ICountry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchTerm = useDebounce(searchInput);
    const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
    const [continent, setContinent] = useState<string | undefined>();
    // Continents the records actually carry, so the filter never offers one
    // with nothing behind it.
    const [continents, setContinents] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const isReset = useRef(true);
    const loadingRef = useRef(false);

    useEffect(() => {
        countryService
            .getFacets()
            .then((f) => setContinents(f.continents ?? []))
            .catch(() => setContinents([]));
    }, []);

    // Reset to page 1 whenever a filter changes
    useEffect(() => {
        isReset.current = true;
        setPage(1);
    }, [searchTerm, status, continent]);

    useEffect(() => {
        fetchCountries(page, !isReset.current);
        isReset.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm, status, continent]);

    const fetchCountries = async (pageNum: number, append: boolean) => {
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
                status,
                ...(searchTerm && { search: searchTerm }),
                ...(continent && { continent }),
            };

            const response = await countryService.getAllCountries(params);
            setCountries((prev) => (append ? [...prev, ...(response.data || [])] : response.data || []));
            if (response.pagination) {
                setHasMore(response.pagination.hasNextPage);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
            if (!append) setCountries([]);
            // Without this the scroll sentinel refires the failed request forever.
            setHasMore(false);
            toast.error('Failed to fetch countries');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            loadingRef.current = false;
        }
    };

    const refetch = () => {
        isReset.current = true;
        if (page === 1) {
            fetchCountries(1, false);
        } else {
            setPage(1);
        }
    };

    // The scroll container is AppLayout's <main>, which the shared hook observes.
    const sentinelRef = useInfiniteScroll(() => setPage((p) => p + 1), {
        hasMore,
        loading: isLoadingMore || isLoading,
    });

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
            toast.success('Country deleted');
            refetch();
        } catch (error) {
            console.error('Error deleting country:', error);
            toast.error('Failed to delete country');
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        refetch();
    };

    const columns: Column<ICountry>[] = useMemo(() => [
        {
            key: 'name',
            header: 'Country',
            render: (country) => (
                <div className="flex items-center gap-3">
                    {country.logo ? (
                        <img
                            src={country.logo}
                            alt=""
                            className="size-9 rounded-md border border-border object-cover"
                        />
                    ) : (
                        <div className="flex size-9 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                            {country.name?.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <span className="font-medium">{country.name}</span>
                </div>
            ),
        },
        {
            key: 'capital',
            header: 'Capital',
            render: (country) => (
                <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span>{country.capital}</span>
                </div>
            ),
        },
        {
            key: 'continent',
            header: 'Continent',
            render: (country) => <span>{country.continent}</span>,
        },
        {
            key: 'currency',
            header: 'Currency',
            render: (country) => <span className="font-mono">{country.currency}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: (country) => (
                <Badge tone={country.status === 'published' ? 'green' : 'neutral'}>
                    {country.status}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (country) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" title="View" onClick={() => handleView(country)}>
                        <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(country)}>
                        <Edit className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(country._id)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []);

    return (
        <div>
            <PageHeader
                title="Countries"
                subtitle="Manage study abroad destinations"
                actions={
                    <Button onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Country
                    </Button>
                }
            />

            <Card className="mb-4 flex flex-wrap items-end gap-3 p-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search countries..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <FilterSelect
                    label="Status"
                    value={status}
                    onChange={(v) => setStatus((v as typeof status) ?? 'all')}
                    options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'published', label: 'Published' },
                        { value: 'draft', label: 'Draft' },
                    ]}
                    allLabel="All Status"
                    className="w-[150px]"
                />
                <FilterSelect
                    label="Continent"
                    value={continent}
                    onChange={setContinent}
                    options={continents}
                    allLabel="All Continents"
                    className="w-[160px]"
                />

                {(searchInput || continent || status !== 'all') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchInput('');
                            setContinent(undefined);
                            setStatus('all');
                        }}
                    >
                        <X className="mr-1 h-4 w-4" />
                        Clear filters
                    </Button>
                )}

                <span className="ml-auto pb-2 pr-1 text-xs text-muted-foreground">
                    {countries.length} of {total}
                </span>
            </Card>

            <Card className="overflow-hidden">
                <ResourceTable
                    columns={columns}
                    rows={countries}
                    isLoading={isLoading}
                    sentinelRef={sentinelRef}
                    isFetchingNextPage={isLoadingMore}
                    hasNextPage={hasMore}
                    emptyTitle="No countries found"
                    emptyDescription="Get started by adding your first country."
                />
            </Card>

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
