import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, Globe, Search, GraduationCap, Building2, HelpCircle } from "lucide-react";
import type { University } from "@/types/university";
import { universityService } from "@/services/universityService";
import { studyCenterService, type StudyCenter } from "@/services/studyCenterService";
import { faqService } from "@/services/faqservice";
import type { IFAQ } from "@/types/faq";
import { toast } from "sonner";
import { useSectionGuard } from "@/hooks/use-unsaved-changes";

interface StudyCentersSectionProps {
    /** The course's `studyCenters[].centerId` list. */
    data: string[];
    /** The course's universities, first = primary. */
    universityIds?: string[];
    faqs?: string;
    onSave: (
        centerIds: string[],
        universityIds: string[],
        faqs?: string,
    ) => Promise<void> | void;
    onNext: () => void;
}

const StudyCentersSection: React.FC<StudyCentersSectionProps> = ({
    data,
    universityIds,
    faqs,
    onSave,
    onNext,
}) => {
    const [selectedUniversityIds, setSelectedUniversityIds] = useState<string[]>(universityIds ?? []);
    // Names for the selected chips, cached by id: a university that is selected
    // but not in the current search results still has to render as its name.
    const [universityDetails, setUniversityDetails] = useState<Record<string, University>>({});
    const [isResolvingUniversities, setIsResolvingUniversities] = useState(false);
    const [universityDropdownOpen, setUniversityDropdownOpen] = useState(false);
    const [universities, setUniversities] = useState<University[]>([]);
    const [isUniversitiesLoading, setIsUniversitiesLoading] = useState(false);
    const [universitySearchQuery, setUniversitySearchQuery] = useState("");

    const [selectedCenterIds, setSelectedCenterIds] = useState<string[]>(data ?? []);
    const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
    const [centers, setCenters] = useState<StudyCenter[]>([]);
    const [isCentersLoading, setIsCentersLoading] = useState(false);
    const [centerSearchQuery, setCenterSearchQuery] = useState("");
    // Names for the selected chips. A centre that is selected but not in the
    // current search results still has to render as its name, so every centre
    // this component has ever seen is cached here by id.
    const [centerDetails, setCenterDetails] = useState<Record<string, StudyCenter>>({});
    const [isResolvingCenters, setIsResolvingCenters] = useState(false);

    const [selectedFaqId, setSelectedFaqId] = useState<string>(faqs || "");
    const [faqOptions, setFaqOptions] = useState<IFAQ[]>([]);
    const [isFaqsLoading, setIsFaqsLoading] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const centerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Resolve the ids the course already stores into university documents, so
    // the chips read as names on first paint rather than as hex strings.
    useEffect(() => {
        const ids = universityIds ?? [];
        setSelectedUniversityIds(ids);
        if (!ids.length) {
            setIsResolvingUniversities(false);
            return;
        }
        let cancelled = false;
        setIsResolvingUniversities(true);
        universityService
            .getByIds(ids)
            .then((resolved) => {
                if (cancelled) return;
                setUniversityDetails((prev) => ({
                    ...prev,
                    ...Object.fromEntries(resolved.map((u) => [u._id, u])),
                }));
            })
            .finally(() => {
                if (!cancelled) setIsResolvingUniversities(false);
            });
        return () => {
            cancelled = true;
        };
        // A fresh array on every parent render; the ids are what matter.
    }, [JSON.stringify(universityIds ?? [])]);

    useEffect(() => {
        setSelectedFaqId(faqs || "");
    }, [faqs]);

    // Resolve the ids the course already stores into centre documents, so the
    // chips read as names on first paint rather than as hex strings.
    useEffect(() => {
        const ids = data ?? [];
        setSelectedCenterIds(ids);
        if (!ids.length) {
            setIsResolvingCenters(false);
            return;
        }
        let cancelled = false;
        setIsResolvingCenters(true);
        studyCenterService
            .getByIds(ids)
            .then((resolved) => {
                if (cancelled) return;
                setCenterDetails((prev) => ({
                    ...prev,
                    ...Object.fromEntries(resolved.map((c) => [c._id, c])),
                }));
            })
            .finally(() => {
                if (!cancelled) setIsResolvingCenters(false);
            });
        return () => {
            cancelled = true;
        };
        // `data` is a fresh array on every parent render; the ids are what matter.
    }, [JSON.stringify(data ?? [])]);

    // Only Course FAQ sets — getFAQDropdown() is unfiltered and would offer the
    // University, Country and Job question sets too.
    useEffect(() => {
        let cancelled = false;
        setIsFaqsLoading(true);
        faqService
            .getAllFAQs({ entityType: "Course", limit: 200 })
            .then((res) => {
                if (!cancelled) setFaqOptions(res.data ?? []);
            })
            .catch((error) => {
                console.error("Error fetching course FAQs:", error);
                if (!cancelled) setFaqOptions([]);
            })
            .finally(() => {
                if (!cancelled) setIsFaqsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const searchUniversities = async (query: string) => {
        try {
            setIsUniversitiesLoading(true);
            const params = { limit: 20, search: query };
            const fetchedUniversities = await universityService.getAllUniversities(params);
            const rows = fetchedUniversities.data ?? [];
            setUniversities(rows);
            setUniversityDetails((prev) => ({
                ...prev,
                ...Object.fromEntries(rows.map((u) => [u._id, u])),
            }));
        } catch (error) {
            console.error("Error fetching universities:", error);
        } finally {
            setIsUniversitiesLoading(false);
        }
    };

    useEffect(() => {
        if (!universityDropdownOpen) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            searchUniversities(universitySearchQuery);
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [universitySearchQuery, universityDropdownOpen]);

    const handleUniversityDropdownOpen = () => {
        const newOpen = !universityDropdownOpen;
        setUniversityDropdownOpen(newOpen);
        if (newOpen && universities.length === 0) {
            searchUniversities("");
        }
    };

    /**
     * Universities are a MULTI-select: one course runs at several partner
     * universities. Order is kept — the first is the primary, which is what the
     * API mirrors into `universityId`.
     */
    const toggleUniversity = (id: string) => {
        setSelectedUniversityIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const searchCenters = async (query: string) => {
        try {
            setIsCentersLoading(true);
            const fetched = await studyCenterService.getAllStudyCenters({
                limit: 20,
                search: query,
            });
            const rows = fetched.data ?? [];
            setCenters(rows);
            setCenterDetails((prev) => ({
                ...prev,
                ...Object.fromEntries(rows.map((c) => [c._id, c])),
            }));
        } catch (error) {
            console.error("Error fetching study centres:", error);
        } finally {
            setIsCentersLoading(false);
        }
    };

    useEffect(() => {
        if (!centerDropdownOpen) return;

        if (centerDebounceRef.current) clearTimeout(centerDebounceRef.current);

        centerDebounceRef.current = setTimeout(() => {
            searchCenters(centerSearchQuery);
        }, 400);

        return () => {
            if (centerDebounceRef.current) clearTimeout(centerDebounceRef.current);
        };
    }, [centerSearchQuery, centerDropdownOpen]);

    const handleCenterDropdownOpen = () => {
        const newOpen = !centerDropdownOpen;
        setCenterDropdownOpen(newOpen);
        if (newOpen && centers.length === 0) {
            searchCenters("");
        }
    };

    /** Centres are a MULTI-select — the website renders one card per centre. */
    const toggleCenter = (centerId: string) => {
        setSelectedCenterIds((prev) =>
            prev.includes(centerId) ? prev.filter((id) => id !== centerId) : [...prev, centerId],
        );
    };

    const submit = async () => {
        await onSave(selectedCenterIds, selectedUniversityIds, selectedFaqId);
    };

    // One value covering all three fields: the section saves them together, so
    // a change to any of them is what "unsaved" means here.
    useSectionGuard({
        id: "course.studyCenters",
        label: "University",
        value: {
            universityIds: selectedUniversityIds,
            faqs: selectedFaqId,
            centerIds: selectedCenterIds,
        },
        onSave: submit,
        onRestore: (baseline) => {
            setSelectedUniversityIds(baseline.universityIds);
            setSelectedFaqId(baseline.faqs);
            setSelectedCenterIds(baseline.centerIds);
        },
        ready: !isResolvingCenters && !isResolvingUniversities,
    });

    const handleSave = async () => {
        try {
            await submit();
            onNext();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save this section");
        }
    };


    return (
        <div className="space-y-6">
            {/* University Selection */}
            <div>
                <h3 className="text-lg font-semibold mb-1">Universities (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    One course can be offered at several partner universities. They appear on the
                    public course page in this order, and the first one is treated as the primary
                    wherever a single university is needed (an application is for one university).
                </p>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => handleUniversityDropdownOpen()}
                        disabled={isUniversitiesLoading}
                        className="w-full px-4 py-3 border border-input rounded-lg bg-card text-left flex items-center justify-between hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-foreground flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-primary" />
                            {isUniversitiesLoading
                                ? "Loading universities..."
                                : selectedUniversityIds.length
                                    ? `${selectedUniversityIds.length} universit${selectedUniversityIds.length === 1 ? "y" : "ies"} selected`
                                    : "Choose universities"}
                        </span>
                        <svg
                            className={`w-5 h-5 transition-transform ${universityDropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {universityDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-hidden">
                            {/* Search Input */}
                            <div className="sticky top-0 bg-card border-b border-border p-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, country, or city..."
                                        value={universitySearchQuery}
                                        onChange={(e) => setUniversitySearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                        autoFocus
                                    />
                                    {universitySearchQuery && (
                                        <button
                                            onClick={() => setUniversitySearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable List */}
                            <div className="overflow-y-auto max-h-64">
                                {isUniversitiesLoading ? (
                                    <div className="px-4 py-3 text-muted-foreground text-center">
                                        Loading universities...
                                    </div>
                                ) : universities.length === 0 ? (
                                    <div className="px-4 py-3 text-muted-foreground text-center">
                                        {universitySearchQuery ? "No matching universities found" : "No universities available"}
                                    </div>
                                ) : (
                                    universities?.map((university) => (
                                        <button
                                            key={university._id}
                                            type="button"
                                            onClick={() => toggleUniversity(university._id)}
                                            className={`w-full flex items-start px-4 py-3 hover:bg-accent cursor-pointer border-b last:border-b-0 text-left ${selectedUniversityIds.includes(university._id) ? 'bg-accent' : ''
                                                }`}
                                        >
                                            <div className="flex-1">
                                                <div
                                                    className={`font-medium ${selectedUniversityIds.includes(university._id)
                                                        ? 'text-primary'
                                                        : 'text-foreground'
                                                        }`}
                                                >
                                                    {university.name}
                                                </div>

                                                <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                                                    {university.city && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {university.city}
                                                        </span>
                                                    )}
                                                    {university.country && (
                                                        <span className="flex items-center gap-1">
                                                            <Globe className="w-3 h-3" />
                                                            {university.country}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {selectedUniversityIds.includes(university._id) && (
                                                <div className="ml-2 text-primary">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Results Count */}
                            {!isUniversitiesLoading && universities.length > 0 && (
                                <div className="sticky bottom-0 bg-muted border-t border-border px-4 py-2 text-xs text-muted-foreground">
                                    Showing {universities.length} of {universities.length} universities
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected universities, in the stored order. */}
                {selectedUniversityIds.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {selectedUniversityIds.map((id, index) => {
                            const uni = universityDetails[id];
                            return (
                                <div
                                    key={id}
                                    className="p-4 bg-accent border border-primary/30 rounded-lg flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                                        <div className="min-w-0">
                                            <div className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
                                                <span className="truncate">
                                                    {uni?.name ??
                                                        (isResolvingUniversities
                                                            ? "Loading..."
                                                            : "University no longer available")}
                                                </span>
                                                {index === 0 && (
                                                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-medium">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {[uni?.city, uni?.country].filter(Boolean).join(", ")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedUniversityIds((prev) => [
                                                        id,
                                                        ...prev.filter((x) => x !== id),
                                                    ])
                                                }
                                                className="px-2 py-1 rounded-md text-xs font-medium text-primary hover:bg-primary/10"
                                            >
                                                Make primary
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => toggleUniversity(id)}
                                            aria-label={`Remove ${uni?.name ?? "university"}`}
                                            className="p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Study Centre Selection */}
            <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-1">Study Centres (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    The public course page renders one card per centre, plus that centre's
                    programmes, fees and visa detail. Leave this empty and those sections do
                    not appear.
                </p>

                <div className="relative">
                    <button
                        type="button"
                        onClick={handleCenterDropdownOpen}
                        className="w-full px-4 py-3 border border-input rounded-lg bg-card text-left flex items-center justify-between hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <span className="text-foreground flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            {selectedCenterIds.length
                                ? `${selectedCenterIds.length} centre${selectedCenterIds.length === 1 ? "" : "s"} selected`
                                : "Choose study centres"}
                        </span>
                        <svg
                            className={`w-5 h-5 transition-transform ${centerDropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {centerDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-hidden">
                            <div className="sticky top-0 bg-card border-b border-border p-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, country, or city..."
                                        value={centerSearchQuery}
                                        onChange={(e) => setCenterSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                                        autoFocus
                                    />
                                    {centerSearchQuery && (
                                        <button
                                            onClick={() => setCenterSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-64">
                                {isCentersLoading ? (
                                    <div className="px-4 py-3 text-muted-foreground text-center">
                                        Loading study centres...
                                    </div>
                                ) : centers.length === 0 ? (
                                    <div className="px-4 py-3 text-muted-foreground text-center">
                                        {centerSearchQuery
                                            ? "No matching study centres found"
                                            : "No study centres available"}
                                    </div>
                                ) : (
                                    centers.map((center) => {
                                        const isSelected = selectedCenterIds.includes(center._id);
                                        return (
                                            <button
                                                key={center._id}
                                                type="button"
                                                onClick={() => toggleCenter(center._id)}
                                                className={`w-full flex items-start px-4 py-3 hover:bg-accent cursor-pointer border-b last:border-b-0 text-left ${isSelected ? "bg-accent" : ""}`}
                                            >
                                                <div className="flex-1">
                                                    <div
                                                        className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}
                                                    >
                                                        {center.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                                                        {center.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {center.location}
                                                            </span>
                                                        )}
                                                        {center.country && (
                                                            <span className="flex items-center gap-1">
                                                                <Globe className="w-3 h-3" />
                                                                {center.country}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <div className="ml-2 text-primary">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Selected centres */}
                {selectedCenterIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {selectedCenterIds.map((centerId) => {
                            const center = centerDetails[centerId];
                            return (
                                <span
                                    key={centerId}
                                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-accent border border-primary/30 rounded-full text-sm"
                                >
                                    <Building2 className="w-3.5 h-3.5 text-primary" />
                                    <span className="font-medium text-foreground">
                                        {center?.name ??
                                            (isResolvingCenters ? "Loading..." : "Centre no longer available")}
                                    </span>
                                    {center?.country && (
                                        <span className="text-muted-foreground">{center.country}</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => toggleCenter(centerId)}
                                        className="p-0.5 rounded-full text-destructive hover:bg-destructive/20"
                                        aria-label={`Remove ${center?.name ?? "centre"}`}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FAQ set */}
            <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-1">FAQs (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    A question set shown at the bottom of the public course page. Create and edit
                    the sets themselves under FAQs; only sets saved with entity type{" "}
                    <span className="font-medium">Course</span> are listed here.
                </p>

                <div className="relative">
                    <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
                    <select
                        value={selectedFaqId}
                        onChange={(e) => setSelectedFaqId(e.target.value)}
                        disabled={isFaqsLoading}
                        className="w-full pl-11 pr-4 py-3 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    >
                        <option value="">
                            {isFaqsLoading ? "Loading FAQs..." : "No FAQ set"}
                        </option>
                        {faqOptions.map((faq) => (
                            <option key={faq._id} value={faq._id}>
                                {faq.title}
                                {faq.questions?.length ? ` (${faq.questions.length} questions)` : ""}
                                {faq.status !== "active" ? ` — ${faq.status}` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* The public page reads published records only, so an inactive
                    set is linked here and renders nowhere. Say so rather than
                    letting it look saved and working. */}
                {selectedFaqId &&
                    faqOptions.find((f) => f._id === selectedFaqId)?.status !== "active" && (
                        <p className="mt-2 text-sm text-destructive">
                            This FAQ set is not active, so it will not appear on the website until
                            it is activated.
                        </p>
                    )}
                {!isFaqsLoading && faqOptions.length === 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        No Course FAQ sets exist yet — create one under FAQs first.
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors font-medium"
                >
                    Save & Continue
                </button>
            </div>
        </div>
    );
};

export default StudyCentersSection;
