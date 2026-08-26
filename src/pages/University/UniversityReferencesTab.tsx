import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Course } from '@/types/course';
import { courseService } from '@/services/courseService';
import { visaService } from '@/services/visaService';
import type { Visa } from '@/types/visa';
import { universityService } from '@/services/universityService';
import { faqService } from '@/services/faqservice';
import type { IFAQ } from '@/types/faq'; // Make sure you have this type

interface UniversityReferencesTabProps {
    slug: string;
    initialData: {
        visa: string;
        courses: string[];
        faq?: string; // Add FAQ to initial data
    };
    onSuccess: () => void;
}

/**
 * Whether the website will actually render this reference.
 *
 * `resolveUniversityRefs` on the API fetches the visa and the FAQ with
 * publicOnly, so a draft or inactive one is dropped from the payload and the
 * site hides that whole tab. Attaching one used to look like it worked and did
 * nothing — this is the same rule the server applies, spelled out for the editor.
 */
const showsOnWebsite = (status?: string) =>
    !status || status === 'active' || status === 'published';

function NotLiveWarning({ kind, status, where }: { kind: string; status?: string; where: string }) {
    return (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            This {kind} is <strong>{status}</strong>, so it will not appear on the website.
            Publish it in the {where} menu.
        </p>
    );
}

export function UniversityReferencesTab({ slug, initialData, onSuccess }: UniversityReferencesTabProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [visaProcesses, setVisaProcesses] = useState<Visa[]>([]);
    const [faqs, setFaqs] = useState<IFAQ[]>([]); // Separate state for FAQs

    // Form state
    const [selectedVisa, setSelectedVisa] = useState<string>(initialData.visa || '');
    const [selectedCourses, setSelectedCourses] = useState<string[]>(initialData.courses || []);
    const [selectedFAQ, setSelectedFAQ] = useState<string>(initialData.faq || ''); // Add FAQ state

    const [courseSearch, setCourseSearch] = useState('');
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);

    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingVisa, setIsLoadingVisa] = useState(false);
    const [isLoadingFAQ, setIsLoadingFAQ] = useState(false); // Add loading state for FAQ
    const [isSaving, setIsSaving] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        fetchVisaProcesses();
        fetchCourses();
        fetchFAQs(); // Add FAQ fetch
    }, []);

    // Update when initialData changes
    useEffect(() => {
        setSelectedVisa(initialData.visa || '');
        setSelectedCourses(initialData.courses || []);
        setSelectedFAQ(initialData.faq || ''); // Add FAQ
    }, [initialData]);

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

    const fetchFAQs = async () => {
        try {
            setIsLoadingFAQ(true);
            const response = await faqService.getFAQDropdown();
            setFaqs(response.data); // Use separate state for FAQs
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setIsLoadingFAQ(false);
        }
    };

    // Handle course search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses();
        }, 300);

        return () => clearTimeout(timer);
    }, [courseSearch]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await universityService.updateReferences(slug, {
                visa: selectedVisa,
                courses: selectedCourses,
                faqs: selectedFAQ,
            });

            onSuccess();
        } catch (error: any) {
            console.error('Error saving references:', error);
            toast.error(error.response?.data?.message || 'Failed to save references');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCourse = (courseId: string) => {
        if (selectedCourses.includes(courseId)) {
            setSelectedCourses(selectedCourses.filter(id => id !== courseId));
        } else {
            setSelectedCourses([...selectedCourses, courseId]);
        }
    };

    const removeCourse = (courseId: string) => {
        setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Reference Links</h3>

            {/* Visa Process Documents */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Visa Process Documents
                </label>
                <div className="space-y-2">
                    <select
                        value={selectedVisa}
                        onChange={(e) => setSelectedVisa(e.target.value)}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                        disabled={isLoadingVisa}
                    >
                        <option value="">
                            {isLoadingVisa ? 'Loading...' : 'Select Visa Process'}
                        </option>
                        {visaProcesses.map((visa) => (
                            <option key={visa._id} value={visa._id}>
                                {visa.country}
                                {showsOnWebsite(visa.status) ? '' : ` — ${visa.status}`}
                            </option>
                        ))}
                    </select>

                    {/* Show selected visa with remove option */}
                    {selectedVisa && (
                        <div className="flex items-center gap-2 p-3 bg-accent border border-primary/30 rounded-lg">
                            <span className="flex-1 text-sm text-foreground">
                                {visaProcesses.find(v => v._id === selectedVisa)?.country || 'Selected Visa'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedVisa('')}
                                className="text-muted-foreground hover:text-foreground"
                                title="Remove selection"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {selectedVisa &&
                        !showsOnWebsite(visaProcesses.find(v => v._id === selectedVisa)?.status) && (
                            <NotLiveWarning
                                kind="visa process"
                                status={visaProcesses.find(v => v._id === selectedVisa)?.status}
                                where="Visas"
                            />
                        )}
                </div>
            </div>

            {/* FAQ Section */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    FAQ
                </label>
                <div className="space-y-2">
                    <select
                        value={selectedFAQ}
                        onChange={(e) => setSelectedFAQ(e.target.value)}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                        disabled={isLoadingFAQ}
                    >
                        <option value="">
                            {isLoadingFAQ ? 'Loading...' : 'Select FAQ'}
                        </option>
                        {faqs.map((faq) => (
                            <option key={faq._id} value={faq._id}>
                                {faq.title}
                                {showsOnWebsite(faq.status) ? '' : ` — ${faq.status}`}
                            </option>
                        ))}
                    </select>

                    {/* Show selected FAQ with remove option */}
                    {selectedFAQ && (
                        <div className="flex items-center gap-2 p-3 bg-accent border border-primary/30 rounded-lg">
                            <span className="flex-1 text-sm text-foreground">
                                {faqs.find(f => f._id === selectedFAQ)?.title || 'Selected FAQ'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedFAQ('')}
                                className="text-muted-foreground hover:text-foreground"
                                title="Remove selection"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {selectedFAQ &&
                        !showsOnWebsite(faqs.find(f => f._id === selectedFAQ)?.status) && (
                            <NotLiveWarning
                                kind="FAQ"
                                status={faqs.find(f => f._id === selectedFAQ)?.status}
                                where="FAQ"
                            />
                        )}
                </div>
            </div>

            {/* Top Courses */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Top Courses
                </label>
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            onFocus={() => setShowCourseDropdown(true)}
                            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-primary"
                        />
                    </div>

                    {showCourseDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {isLoadingCourses ? (
                                <div className="px-4 py-3 text-center text-muted-foreground">
                                    Loading courses...
                                </div>
                            ) : courses.length > 0 ? (
                                courses.map((course) => {
                                    const isSelected = selectedCourses.includes(course._id);
                                    return (
                                        <div
                                            key={course._id}
                                            onClick={() => toggleCourse(course._id)}
                                            className={`px-4 py-2 cursor-pointer hover:bg-accent transition-colors ${isSelected ? 'bg-accent text-primary' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    {course.overview?.courseName ?? '(untitled course)'}
                                                    {showsOnWebsite(course.status) ? '' : (
                                                        <span className="text-amber-700"> — {course.status}</span>
                                                    )}
                                                </span>
                                                {isSelected && (
                                                    <span className="text-primary font-semibold">✓</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-3 text-center text-muted-foreground">
                                    {courseSearch ? 'No courses found' : 'Start typing to search courses'}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected Courses */}
                {selectedCourses.length > 0 && (
                    <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground">
                            {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
                        </p>
                        {selectedCourses.some(
                            (id) => !showsOnWebsite(courses.find(c => c._id === id)?.status)
                        ) && (
                            <NotLiveWarning kind="course" status="not published" where="Courses" />
                        )}
                        <div className="flex flex-wrap gap-2">
                            {selectedCourses.map((id) => {
                                const course = courses.find(c => c._id === id);
                                return course ? (
                                    <span
                                        key={id}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-primary rounded-full text-sm"
                                    >
                                        {course.overview?.courseName ?? '(untitled course)'}
                                        <button
                                            type="button"
                                            onClick={() => removeCourse(id)}
                                            className="hover:text-primary transition-colors"
                                            title="Remove course"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSaving ? 'Saving...' : 'Save References'}
                </button>
            </div>

            {/* Click outside to close dropdowns */}
            {showCourseDropdown && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowCourseDropdown(false)}
                />
            )}
        </div>
    );
}