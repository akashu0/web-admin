// components/CountryForm/tabs/ReferencesTab.tsx
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { University } from '@/types/university';
import type { Course, } from '@/types/course';
import { universityService } from '@/services/universityService';
import { courseService } from '@/services/courseService';
import { visaService } from '@/services/visaService';
import type { Visa } from '@/types/visa';

interface ReferencesTabProps {
    form: any;
}

export function ReferencesTab({ form }: ReferencesTabProps) {
    const [universities, setUniversities] = useState<University[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [visaProcesses, setVisaProcesses] = useState<Visa[]>([]);

    const [universitySearch, setUniversitySearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);

    const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingVisa, setIsLoadingVisa] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        fetchVisaProcesses();
        fetchUniversities();
        fetchCourses();
    }, []);

    // useEffect(() => {
    //     if (universitySearch || showUniversityDropdown) {
    //         fetchUniversities();
    //     }
    // }, [universitySearch]);

    // useEffect(() => {
    //     if (courseSearch || showCourseDropdown) {
    //         fetchCourses();
    //     }
    // }, [courseSearch]);

    const fetchUniversities = async () => {
        try {
            setIsLoadingUniversities(true);
            const response = await universityService.getAllUniversities({
                search: universitySearch,
                limit: 50,
            });
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
            const response = await courseService.getAllCourses({
                search: courseSearch,
                limit: 50,
            });

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
            const response = await visaService.getAllVisas({
                limit: 100,
            });
            setVisaProcesses(response.data);
        } catch (error) {
            console.error('Error fetching visa processes:', error);
        } finally {
            setIsLoadingVisa(false);
        }
    };

    const filteredUniversities = universities.filter(u =>
        u.name.toLowerCase().includes(universitySearch.toLowerCase())
    );



    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Reference Links</h3>

            {/* Visa Process Documents */}
            <form.Field name="visaProcessDocuments">
                {(field: any) => (
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Visa Process Documents
                        </label>
                        <select
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                            disabled={isLoadingVisa}
                        >
                            <option value="">
                                {isLoadingVisa ? 'Loading...' : 'Select Visa Process'}
                            </option>
                            {visaProcesses.map((visa) => (
                                <option key={visa._id} value={visa._id}>
                                    {visa?.country}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </form.Field>

            {/* Top Universities */}
            <form.Field name="topUniversities">
                {(field: any) => (
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Top Universities
                        </label>
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search universities..."
                                    value={universitySearch}
                                    onChange={(e) => setUniversitySearch(e.target.value)}
                                    onFocus={() => setShowUniversityDropdown(true)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                                />
                            </div>

                            {showUniversityDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {isLoadingUniversities ? (
                                        <div className="px-4 py-3 text-center text-gray-500">
                                            Loading universities...
                                        </div>
                                    ) : filteredUniversities.length > 0 ? (
                                        filteredUniversities.map((university) => {
                                            const isSelected = field.state.value.includes(university._id);
                                            return (
                                                <div
                                                    key={university._id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            field.handleChange(
                                                                field.state.value.filter((id: string) => id !== university._id)
                                                            );
                                                        } else {
                                                            field.handleChange([...field.state.value, university._id]);
                                                        }
                                                    }}
                                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-gray-50 text-gray-700' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{university.name}</span>
                                                        {isSelected && <span className="text-gray-600">✓</span>}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-3 text-center text-gray-500">
                                            No universities found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Universities */}
                        {field.state.value.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {field.state.value.map((id: string) => {
                                    const university = universities.find(u => u._id === id);
                                    return university ? (
                                        <span
                                            key={id}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {university.name}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    field.handleChange(
                                                        field.state.value.filter((selectedId: string) => selectedId !== id)
                                                    );
                                                }}
                                                className="hover:text-gray-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>
                )}
            </form.Field>

            {/* Top Courses */}
            <form.Field name="topCourses">
                {(field: any) => (
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Top Courses
                        </label>
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                    onFocus={() => setShowCourseDropdown(true)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                                />
                            </div>

                            {showCourseDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {isLoadingCourses ? (
                                        <div className="px-4 py-3 text-center text-gray-500">
                                            Loading courses...
                                        </div>
                                    ) : courses.length > 0 ? (
                                        courses.map((course) => {
                                            const isSelected = field.state.value.includes(course._id);
                                            return (
                                                <div
                                                    key={course._id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            field.handleChange(
                                                                field.state.value.filter((id: string) => id !== course._id)
                                                            );
                                                        } else {
                                                            field.handleChange([...field.state.value, course._id]);
                                                        }
                                                    }}
                                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-gray-50 text-gray-700' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{course?.courseName}</span>
                                                        {isSelected && <span className="text-gray-600">✓</span>}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-3 text-center text-gray-500">
                                            No courses found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Courses */}
                        {field.state.value.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {field.state.value.map((id: string) => {
                                    const course = courses.find(c => c._id === id);
                                    return course ? (
                                        <span
                                            key={id}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {course?.courseName}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    field.handleChange(
                                                        field.state.value.filter((selectedId: string) => selectedId !== id)
                                                    );
                                                }}
                                                className="hover:text-gray-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>
                )}
            </form.Field>

            {/* Click outside to close dropdowns */}
            {(showUniversityDropdown || showCourseDropdown) && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => {
                        setShowUniversityDropdown(false);
                        setShowCourseDropdown(false);
                    }}
                />
            )}
        </div>
    );
}