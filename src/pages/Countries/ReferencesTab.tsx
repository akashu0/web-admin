// components/CountryForm/tabs/ReferencesTab.tsx
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { University } from '@/types/university';
import type { Course } from '@/types/course';
import { universityService } from '@/services/universityService';
import { courseService } from '@/services/courseService';
import { visaService } from '@/services/visaService';
import type { Visa } from '@/types/visa';
import type { CountryFormValues } from './country-form-values';

interface ReferencesTabProps {
    form: UseFormReturn<CountryFormValues>;
}

/** Searchable multi-select rendered as a dropdown + chips for what's picked. */
function PickerField<T extends { _id: string }>({
    label,
    placeholder,
    emptyText,
    loadingText,
    isLoading,
    options,
    labelOf,
    selected,
    onChange,
}: {
    label: string;
    placeholder: string;
    emptyText: string;
    loadingText: string;
    isLoading: boolean;
    options: T[];
    labelOf: (option: T) => string;
    selected: string[];
    onChange: (ids: string[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);

    const filtered = search
        ? options.filter((o) => labelOf(o).toLowerCase().includes(search.toLowerCase()))
        : options;

    const toggle = (id: string) =>
        onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

    return (
        <div>
            <Label className="mb-2 block">{label}</Label>
            <div className="relative">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setOpen(true)}
                        className="pl-9"
                    />
                </div>

                {open && (
                    <>
                        {/* Click-anywhere-else closes the list. */}
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-drawer">
                            {isLoading ? (
                                <div className="px-4 py-3 text-center text-muted-foreground">{loadingText}</div>
                            ) : filtered.length > 0 ? (
                                filtered.map((option) => {
                                    const isSelected = selected.includes(option._id);
                                    return (
                                        <div
                                            key={option._id}
                                            onClick={() => toggle(option._id)}
                                            className={`flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-accent ${isSelected ? 'bg-accent text-accent-foreground' : ''}`}
                                        >
                                            <span>{labelOf(option)}</span>
                                            {isSelected && <span className="text-primary">✓</span>}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-3 text-center text-muted-foreground">{emptyText}</div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {selected.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {selected.map((id) => {
                        const option = options.find((o) => o._id === id);
                        return option ? (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-secondary-foreground"
                            >
                                {labelOf(option)}
                                <button
                                    type="button"
                                    onClick={() => toggle(id)}
                                    className="hover:text-foreground"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
}

export function ReferencesTab({ form }: ReferencesTabProps) {
    const { watch, setValue } = form;

    const [universities, setUniversities] = useState<University[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [visaProcesses, setVisaProcesses] = useState<Visa[]>([]);

    const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingVisa, setIsLoadingVisa] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                setIsLoadingUniversities(true);
                const response = await universityService.getAllUniversities({ limit: 50 });
                setUniversities(response.data);
            } catch (error) {
                console.error('Error fetching universities:', error);
            } finally {
                setIsLoadingUniversities(false);
            }
        };

        const fetchCourses = async () => {
            try {
                setIsLoadingCourses(true);
                const response = await courseService.getAllCourses({ limit: 50 });
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setIsLoadingCourses(false);
            }
        };

        const fetchVisaProcesses = async () => {
            try {
                setIsLoadingVisa(true);
                const response = await visaService.getAllVisas({ limit: 100 });
                setVisaProcesses(response.data);
            } catch (error) {
                console.error('Error fetching visa processes:', error);
            } finally {
                setIsLoadingVisa(false);
            }
        };

        fetchVisaProcesses();
        fetchUniversities();
        fetchCourses();
    }, []);

    return (
        <div className="space-y-6">
            <h3 className="text-h3 font-semibold">Reference Links</h3>

            {/* Visa Process Documents */}
            <div>
                <Label className="mb-2 block">Visa Process Documents</Label>
                <Select
                    value={watch('visaProcessDocuments') || undefined}
                    onValueChange={(v) => setValue('visaProcessDocuments', v)}
                    disabled={isLoadingVisa}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingVisa ? 'Loading...' : 'Select Visa Process'} />
                    </SelectTrigger>
                    <SelectContent>
                        {visaProcesses.map((visa) => (
                            <SelectItem key={visa._id} value={visa._id}>
                                {visa?.country}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <PickerField
                label="Top Universities"
                placeholder="Search universities..."
                emptyText="No universities found"
                loadingText="Loading universities..."
                isLoading={isLoadingUniversities}
                options={universities}
                labelOf={(u) => u.name}
                selected={watch('topUniversities') ?? []}
                onChange={(ids) => setValue('topUniversities', ids)}
            />

            <PickerField
                label="Top Courses"
                placeholder="Search courses..."
                emptyText="No courses found"
                loadingText="Loading courses..."
                isLoading={isLoadingCourses}
                options={courses}
                labelOf={(c) => c.courseName}
                selected={watch('topCourses') ?? []}
                onChange={(ids) => setValue('topCourses', ids)}
            />
        </div>
    );
}
