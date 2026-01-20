import React, { useState, useEffect } from "react";
import { X, MapPin, Globe, DollarSign, BookOpen, Plane, FileText, Search, GraduationCap } from "lucide-react";
import { learningCenterService } from "@/services/learningCenterService";
import type { LearningCenter } from "@/types/learningCenter";
import type { University } from "@/types/university";
import { universityService } from "@/services/universityService";
import type { Visa } from "@/types/visa";

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
    const [selectedCenterIds, setSelectedCenterIds] = useState<string[]>(data || []);
    const [selectedUniversityId, setSelectedUniversityId] = useState<string>(universityId || "");
    const [centersDropdownOpen, setCentersDropdownOpen] = useState(false);
    const [universityDropdownOpen, setUniversityDropdownOpen] = useState(false);
    const [modalCenter, setModalCenter] = useState<LearningCenter | null>(null);
    const [centers, setCenters] = useState<LearningCenter[]>([]);
    const [universities, setUniversities] = useState<University[]>([]);
    const [isCentersLoading, setIsCentersLoading] = useState(false);
    const [isUniversitiesLoading, setIsUniversitiesLoading] = useState(false);
    const [centersSearchQuery, setCentersSearchQuery] = useState("");
    const [universitySearchQuery, setUniversitySearchQuery] = useState("");

    useEffect(() => {
        fetchCenters();
        fetchUniversities();
    }, []);

    useEffect(() => {
        if (data && data.length > 0) {
            setSelectedCenterIds(data);
        }
    }, [data]);

    useEffect(() => {
        if (universityId) {
            setSelectedUniversityId(universityId);
        }
    }, [universityId]);

    const fetchCenters = async () => {
        try {
            setIsCentersLoading(true);
            const params = {
                limit: 100,
            };
            const fetchedCenters = await learningCenterService.getAllLearningCenters(params);
            setCenters(fetchedCenters.data);
        } catch (error) {
            console.error("Error fetching learning centers:", error);
        } finally {
            setIsCentersLoading(false);
        }
    };

    const fetchUniversities = async () => {
        try {
            setIsUniversitiesLoading(true);
            const params = {
                limit: 100,
            };
            const fetchedUniversities = await universityService.getAllUniversities(params);

            setUniversities(fetchedUniversities.data);
        } catch (error) {
            console.error("Error fetching universities:", error);
        } finally {
            setIsUniversitiesLoading(false);
        }
    };

    const handleCenterToggle = (centerId: string) => {
        setSelectedCenterIds((prev) => {
            const newSelection = prev.includes(centerId)
                ? prev.filter((id) => id !== centerId)
                : [...prev, centerId];
            return newSelection;
        });
    };

    const handleRemoveCenter = (centerId: string) => {
        setSelectedCenterIds((prev) => prev.filter((id) => id !== centerId));
    };

    const handleUniversitySelect = (universityId: string) => {
        setSelectedUniversityId(universityId);
        setUniversityDropdownOpen(false);
    };

    const handleSave = () => {

        onSave(selectedCenterIds, selectedUniversityId);
        onNext();
    };

    const selectedCenters = centers.filter((center) =>
        selectedCenterIds.includes(center.id)
    );

    const selectedUniversity = universities.find((uni) => uni._id === selectedUniversityId);

    const getModeIcon = (mode: string) => {
        if (mode.toLowerCase().includes("online")) return "🌐";
        if (mode.toLowerCase().includes("oncampus")) return "🏢";
        if (mode.toLowerCase().includes("hybrid")) return "🔄";
        return "📚";
    };

    const filteredCenters = centers.filter((center) => {
        const query = centersSearchQuery?.toLowerCase();
        return (
            center.name?.toLowerCase().includes(query) ||
            center.country?.toLowerCase().includes(query) ||
            center.level?.toLowerCase().includes(query) ||
            center.location?.toLowerCase().includes(query)
        );
    });

    const filteredUniversities = universities.filter((university) => {
        const query = universitySearchQuery?.toLowerCase();
        return (
            university.name?.toLowerCase().includes(query) ||
            university.country?.toLowerCase().includes(query) ||
            university.city?.toLowerCase().includes(query) ||
            university.state?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            {/* University Selection */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Select University (Optional)</h3>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setUniversityDropdownOpen(!universityDropdownOpen)}
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
                                ) : filteredUniversities.length === 0 ? (
                                    <div className="px-4 py-3 text-gray-500 text-center">
                                        {universitySearchQuery ? "No matching universities found" : "No universities available"}
                                    </div>
                                ) : (
                                    filteredUniversities.map((university) => (
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
                            {!isUniversitiesLoading && filteredUniversities.length > 0 && (
                                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
                                    Showing {filteredUniversities.length} of {universities.length} universities
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

            {/* Study Centers Selection */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Select Study Centers</h3>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setCentersDropdownOpen(!centersDropdownOpen)}
                        disabled={isCentersLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-gray-700">
                            {isCentersLoading
                                ? "Loading centers..."
                                : selectedCenterIds.length > 0
                                    ? `${selectedCenterIds.length} center(s) selected`
                                    : "Choose learning centers"}
                        </span>
                        <svg
                            className={`w-5 h-5 transition-transform ${centersDropdownOpen ? "rotate-180" : ""}`}
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

                    {centersDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                            {/* Search Input */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, country, or level..."
                                        value={centersSearchQuery}
                                        onChange={(e) => setCentersSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        autoFocus
                                    />
                                    {centersSearchQuery && (
                                        <button
                                            onClick={() => setCentersSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable List */}
                            <div className="overflow-y-auto max-h-64">
                                {isCentersLoading ? (
                                    <div className="px-4 py-3 text-gray-500 text-center">
                                        Loading learning centers...
                                    </div>
                                ) : filteredCenters.length === 0 ? (
                                    <div className="px-4 py-3 text-gray-500 text-center">
                                        {centersSearchQuery ? "No matching centers found" : "No learning centers available"}
                                    </div>
                                ) : (
                                    filteredCenters.map((center) => (
                                        <label
                                            key={center.id}
                                            className="flex items-start px-4 py-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCenterIds.includes(center.id)}
                                                onChange={() => handleCenterToggle(center.id)}
                                                className="mt-1 mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {center.name}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {center.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {center.country}
                                                    </span>
                                                    {center.level && (
                                                        <span className="flex items-center gap-1 text-purple-600">
                                                            <BookOpen className="w-3 h-3" />
                                                            {center.level}
                                                        </span>
                                                    )}
                                                    {center.currency && (
                                                        <span className="flex items-center gap-1 text-purple-600">
                                                            <DollarSign className="w-3 h-3" />
                                                            {center.currency}
                                                        </span>
                                                    )}
                                                    {center.visa && (
                                                        <span className="flex items-center gap-1 text-purple-600">
                                                            <Plane className="w-3 h-3" />
                                                            Visa Available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>

                            {/* Results Count */}
                            {!isCentersLoading && filteredCenters.length > 0 && (
                                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
                                    Showing {filteredCenters.length} of {centers.length} centers
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Centers Cards */}
            {selectedCenters.length > 0 && (
                <div>
                    <h4 className="text-md font-semibold mb-3">
                        Selected Centers ({selectedCenters.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedCenters.map((center) => (
                            <div
                                key={center.id}
                                onClick={() => setModalCenter(center)}
                                className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer group"
                            >
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveCenter(center.id);
                                    }}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <h5 className="font-semibold text-gray-900 mb-2 pr-6">
                                    {center.name}
                                </h5>

                                <div className="space-y-1.5 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-purple-600" />
                                        <span>{center.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-purple-600" />
                                        <span>{center.country}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-purple-600" />
                                        <span>{center.currency}</span>
                                    </div>
                                    {center.level && (
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-purple-600" />
                                            <span>{center.level}</span>
                                        </div>
                                    )}
                                    {center.visa && (
                                        <div className="flex items-center gap-2">
                                            <Plane className="w-4 h-4 text-purple-600" />
                                            <span className="text-purple-600 font-medium">
                                                {(center.visa as any).country} Visa
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 text-xs text-purple-600 font-medium">
                                    Click for details →
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal - keeping your existing modal code */}
            {modalCenter && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-xl font-bold text-gray-900">
                                {modalCenter.name}
                            </h3>
                            <button
                                onClick={() => setModalCenter(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <div className="text-xs text-gray-500">Location</div>
                                        <div className="font-medium">{modalCenter.location}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <div className="text-xs text-gray-500">Country</div>
                                        <div className="font-medium">{modalCenter.country}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <div className="text-xs text-gray-500">Currency</div>
                                        <div className="font-medium">{modalCenter.currency}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <div className="text-xs text-gray-500">Programs</div>
                                        <div className="font-medium">
                                            {modalCenter.programs.length}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visa Information Section */}
                            {modalCenter.visa && (
                                <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Plane className="w-5 h-5 text-purple-600" />
                                        Visa Information
                                    </h4>

                                    <div className="bg-white rounded-lg p-4 mb-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <div className="text-xs text-gray-500">Country</div>
                                                <div className="font-semibold text-gray-900">
                                                    {(modalCenter.visa as Visa).country}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Visa Fee</div>
                                                <div className="font-semibold text-gray-900">
                                                    {(modalCenter.visa as Visa).visaFee} {(modalCenter.visa as Visa).currency}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Processing Time</div>
                                                <div className="font-semibold text-gray-900">
                                                    {(modalCenter.visa as Visa).visaProcessingTime} {(modalCenter.visa as Visa).visaProcessingTimeUnit}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Success Rate</div>
                                                <div className="font-semibold text-gray-900">
                                                    {(modalCenter.visa as Visa).visaSuccessRate}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visa Steps */}
                                        {(modalCenter.visa as Visa).visaSteps && (modalCenter.visa as Visa).visaSteps.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-purple-600" />
                                                    Visa Process Steps ({(modalCenter.visa as Visa).visaSteps.length})
                                                </h5>
                                                <div className="space-y-2">
                                                    {(modalCenter.visa as Visa).visaSteps.map((step) => (
                                                        <div key={step._id} className="flex items-start gap-3 bg-gray-50 p-3 rounded">
                                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold shrink-0">
                                                                {step.stepNumber}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                                                                    {step.estimatedDays && (
                                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                                            ~{step.estimatedDays} days
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Visa Documents */}
                                        {(modalCenter.visa as Visa).visaDocuments && (modalCenter.visa as Visa).visaDocuments.length > 0 && (
                                            <div>
                                                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-purple-600" />
                                                    Required Documents ({(modalCenter.visa as Visa).visaDocuments.length})
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {(modalCenter.visa as Visa).visaDocuments.map((doc) => (
                                                        <div key={doc._id} className="flex items-start gap-2 bg-gray-50 p-2 rounded text-sm">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${doc.isMandatory
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {doc.isMandatory ? 'Required' : 'Optional'}
                                                            </span>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{doc.name}</p>
                                                                {doc.description && (
                                                                    <p className="text-xs text-gray-600">{doc.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Programs */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">
                                    Available Programs
                                </h4>
                                <div className="space-y-4">
                                    {modalCenter.programs.map((program, index) => (
                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                        {program.modeType}
                                                    </span>
                                                    <span className="text-2xl">
                                                        {getModeIcon(program.mode)}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {program.mode}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${program.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {program.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                <div>
                                                    <div className="text-xs text-gray-500">Duration</div>
                                                    <div className="font-medium">
                                                        {program.durationYears}Y {program.durationMonths}M
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <div className="text-xs text-gray-500">Support</div>
                                                    <div className="font-medium">{program.support}</div>
                                                </div>
                                            </div>

                                            {/* Fee Structure */}
                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                <h5 className="font-semibold mb-3 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-purple-600" />
                                                    Fee Structure
                                                </h5>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                                    <div>
                                                        <div className="text-gray-500">Tuition Fee</div>
                                                        <div className="font-medium">
                                                            {program.feeStructure.programTuitionFee}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500">Visa Fee</div>
                                                        <div className="font-medium">
                                                            {program.feeStructure.studentVisaFee}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500">Accommodation</div>
                                                        <div className="font-medium">
                                                            {program.feeStructure.accommodation}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500">Airport Transfer</div>
                                                        <div className="font-medium">
                                                            {program.feeStructure.airportTransfer}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500">Tax</div>
                                                        <div className="font-medium">
                                                            {program.feeStructure.tax}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500">Application Fee</div>
                                                        <div className="font-medium">
                                                            {program.feeStructure.applicationFee}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dynamic Fields */}
                                                {program.feeStructure.dynamicFields?.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                                            {program.feeStructure.dynamicFields.map(
                                                                (field, idx) => (
                                                                    <div key={idx}>
                                                                        <div className="text-gray-500">
                                                                            {field.fieldName}
                                                                        </div>
                                                                        <div className="font-medium">
                                                                            {field.fieldValue}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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