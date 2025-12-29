import React, { useState, useEffect } from "react";
import { X, MapPin, Globe, DollarSign, BookOpen } from "lucide-react";
import { learningCenterService } from "@/services/learningCenterService"; // Adjust path as needed
import type { LearningCenter } from "@/types/learningCenter";
// import type { EGLearningCenter } from "../LearningCenter/LearningCenterList";

interface StudyCentersSectionProps {
    data: string[]; // Already selected center IDs
    onSave: (data: string[]) => void;
    onNext: () => void;
}

const StudyCentersSection: React.FC<StudyCentersSectionProps> = ({
    data,
    onSave,
    onNext,
}) => {


    const [selectedCenterIds, setSelectedCenterIds] = useState<string[]>(data || []);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modalCenter, setModalCenter] = useState<LearningCenter | null>(null);
    const [centers, setCenters] = useState<LearningCenter[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all learning centers on mount
    useEffect(() => {
        fetchCenters();
    }, []);

    // Initialize selected centers from props
    useEffect(() => {
        if (data && data.length > 0) {
            setSelectedCenterIds(data);
        }
    }, [data]);

    const fetchCenters = async () => {
        try {
            setIsLoading(true);
            const fetchedCenters = await learningCenterService.getAllLearningCenters();
            setCenters(fetchedCenters);
        } catch (error) {
            console.error("Error fetching learning centers:", error);
        } finally {
            setIsLoading(false);
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

    const handleSave = () => {
        onSave(selectedCenterIds);
        onNext();
    };

    const selectedCenters = centers.filter((center) =>
        selectedCenterIds.includes(center.id)
    );

    const getModeIcon = (mode: string) => {
        if (mode.toLowerCase().includes("online")) return "🌐";
        if (mode.toLowerCase().includes("onsite")) return "🏢";
        if (mode.toLowerCase().includes("hybrid")) return "🔄";
        return "📚";
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Select Study Centers</h3>

                {/* Dropdown Selection */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-gray-700">
                            {isLoading
                                ? "Loading centers..."
                                : selectedCenterIds.length > 0
                                    ? `${selectedCenterIds.length} center(s) selected`
                                    : "Choose learning centers"}
                        </span>
                        <svg
                            className={`w-5 h-5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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

                    {dropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                            {isLoading ? (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                    Loading learning centers...
                                </div>
                            ) : centers.length === 0 ? (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                    No learning centers available
                                </div>
                            ) : (
                                centers.map((center) => (
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
                                            </div>
                                        </div>
                                    </label>
                                ))
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
                                    {/* <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-purple-600" />
                                        <span>{center.programs.length} Programs</span>
                                    </div> */}
                                </div>

                                <div className="mt-3 text-xs text-purple-600 font-medium">
                                    Click for details →
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {modalCenter && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
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

                        <div className="p-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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