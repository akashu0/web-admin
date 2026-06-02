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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-gray-700 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
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
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                            {/* Search Input */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, country, or city..."
                                        value={universitySearchQuery}
                                        onChange={(e) => setUniversitySearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        autoFocus
                                    />
                                    {universitySearchQuery && (
                                        <button
                                            onClick={() => setUniversitySearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                        className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b text-sm text-gray-600 italic"
                                    >
                                        Clear selection
                                    </button>
                                )}

                                {isUniversitiesLoading ? (
                                    <div className="px-4 py-3 text-gray-500 text-center">
                                        Loading universities...
                                    </div>
                                ) : universities.length === 0 ? (
                                    <div className="px-4 py-3 text-gray-500 text-center">
                                        {universitySearchQuery ? "No matching universities found" : "No universities available"}
                                    </div>
                                ) : (
                                    universities?.map((university) => (
                                        <button
                                            key={university._id}
                                            onClick={() => handleUniversitySelect(university._id)}
                                            className={`w-full flex items-start px-4 py-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0 text-left ${selectedUniversityId === university._id ? 'bg-purple-50' : ''
                                                }`}
                                        >
                                            <div className="flex-1">
                                                <div
                                                    className={`font-medium ${selectedUniversityId === university._id
                                                        ? 'text-purple-700'
                                                        : 'text-gray-900'
                                                        }`}
                                                >
                                                    {university.name}
                                                </div>

                                                <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
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
                                                <div className="ml-2 text-purple-600">
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
                                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
                                    Showing {universities.length} of {universities.length} universities
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected University Display */}
                {selectedUniversity && (
                    <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                            <div>
                                <div className="font-semibold text-gray-900">{selectedUniversity.name}</div>
                                <div className="text-sm text-gray-600">
                                    {selectedUniversity.city && selectedUniversity.country && (
                                        <span>{selectedUniversity.city}, {selectedUniversity.country}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedUniversityId("")}
                            className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
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
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition-colors font-medium"
                >
                    Save & Continue
                </button>
            </div>
        </div>
    );
};

export default StudyCentersSection;
