import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, Globe, Search, GraduationCap } from "lucide-react";
import type { University } from "@/types/university";
import { universityService } from "@/services/universityService";

interface StudyCentersSectionProps {
    data: string[];
    universityId?: string;
    onSave: (data: string[], universityId?: string) => void;
    onNext: () => void;
}

const StudyCentersSection: React.FC<StudyCentersSectionProps> = ({
    data,
    universityId,
    onSave,
    onNext,
}) => {
    const [selectedUniversityId, setSelectedUniversityId] = useState<string>(universityId || "");
    const [universityDropdownOpen, setUniversityDropdownOpen] = useState(false);
    const [universities, setUniversities] = useState<University[]>([]);
    const [isUniversitiesLoading, setIsUniversitiesLoading] = useState(false);
    const [universitySearchQuery, setUniversitySearchQuery] = useState("");

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (universityId) {
            setSelectedUniversityId(universityId);
        }
    }, [universityId]);

    const searchUniversities = async (query: string) => {
        try {
            setIsUniversitiesLoading(true);
            const params = { limit: 20, search: query };
            const fetchedUniversities = await universityService.getAllUniversities(params);
            setUniversities(fetchedUniversities.data);
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

    const handleUniversitySelect = (universityId: string) => {
        setSelectedUniversityId(universityId);
        setUniversityDropdownOpen(false);
    };

    const handleSave = () => {
        onSave(data, selectedUniversityId);
        onNext();
    };

    const selectedUniversity = universities.find((uni) => uni._id === selectedUniversityId);

    return (
        <div className="space-y-6">
            {/* University Selection */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Select University (Optional)</h3>

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
                                : selectedUniversity
                                    ? selectedUniversity.name
                                    : "Choose a university"}
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
                                {/* Clear Selection Option */}
                                {selectedUniversityId && (
                                    <button
                                        onClick={() => handleUniversitySelect("")}
                                        className="w-full px-4 py-3 hover:bg-muted text-left border-b text-sm text-muted-foreground italic"
                                    >
                                        Clear selection
                                    </button>
                                )}

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
                                            onClick={() => handleUniversitySelect(university._id)}
                                            className={`w-full flex items-start px-4 py-3 hover:bg-accent cursor-pointer border-b last:border-b-0 text-left ${selectedUniversityId === university._id ? 'bg-accent' : ''
                                                }`}
                                        >
                                            <div className="flex-1">
                                                <div
                                                    className={`font-medium ${selectedUniversityId === university._id
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

                                            {selectedUniversityId === university._id && (
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

                {/* Selected University Display */}
                {selectedUniversity && (
                    <div className="mt-3 p-4 bg-accent border border-primary/30 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-primary" />
                            <div>
                                <div className="font-semibold text-foreground">{selectedUniversity.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {selectedUniversity.city && selectedUniversity.country && (
                                        <span>{selectedUniversity.city}, {selectedUniversity.country}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedUniversityId("")}
                            className="p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
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
