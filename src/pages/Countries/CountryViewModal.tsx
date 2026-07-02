// components/CountryView/CountryViewModal.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Loader2,
    Globe,
    MapPin,
    DollarSign,
    Users,
    BookOpen,
    FileText,
    Edit,
    ArrowLeft,
    GraduationCap,
} from 'lucide-react';
import type { CountryResponse } from '@/types/country';
import { countryService } from '@/services/countryService';

export function CountryViewModal() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [country, setCountry] = useState<CountryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string>('overview');

    useEffect(() => {
        if (slug) {
            fetchCountry(slug);
        }
    }, [slug]);

    const fetchCountry = async (identifier: string) => {
        try {
            setIsLoading(true);
            const response = await countryService.getCountryBySlug(identifier);
            setCountry(response.data);
        } catch (error) {
            console.error('Error fetching country:', error);
            alert('Failed to load country data');
            handleClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        navigate('/countries');
    };

    const handleEdit = () => {
        navigate(`/countries/edit/${country?._id}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-lg p-8 shadow-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading country details...</p>
                </div>
            </div>
        );
    }

    if (!country) {
        return null;
    }

    const sections = [
        { id: 'overview', label: 'Overview', icon: Globe },
        { id: 'costs', label: 'Cost of Living', icon: DollarSign },
        { id: 'references', label: 'References', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Banner */}
            <div className="relative h-64 bg-linear-to-r from-purple-600 to-blue-600">
                {country.banner && (
                    <img
                        src={country.banner}
                        alt={country.name}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-black/40" />

                {/* Navigation */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                    <button
                        onClick={handleClose}
                        className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Countries</span>
                    </button>
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit Country</span>
                    </button>
                </div>

                {/* Country Info Overlay */}
                <div className="absolute bottom-6 left-6 flex items-end gap-4">
                    <div className="text-white mb-2">
                        <h1 className="text-4xl font-bold mb-2">{country.name}</h1>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {country.capital}
                            </span>
                            <span>{country.continent}</span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${country.status === 'published'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-yellow-500 text-white'
                                    }`}
                            >
                                {country.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Section Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
                    <div className="flex border-b">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeSection === section.id
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {section.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {activeSection === 'overview' && <OverviewSection country={country} />}
                    {activeSection === 'costs' && <CostsSection country={country} />}
                    {activeSection === 'references' && <ReferencesSection country={country} />}
                </div>
            </div>
        </div>
    );
}

// Overview Section
function OverviewSection({ country }: { country: CountryResponse }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {country.name}</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{country.about}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard icon={MapPin} label="Capital" value={country.capital} />
                <InfoCard icon={Globe} label="Continent" value={country.continent} />
                <InfoCard icon={DollarSign} label="Currency" value={country.currency} />
                <InfoCard icon={Users} label="Languages" value={country.spokenLanguages} />
                <InfoCard icon={Users} label="Population" value={country.population} />
            </div>
        </div>
    );
}

// Cost of Living Section
function CostsSection({ country }: { country: CountryResponse }) {
    if (!country.costOfLiving || country.costOfLiving.length === 0) {
        return <EmptyState message="No cost of living information available" />;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cost of Living</h2>
            {country.costOfLiving.map((cost, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                    {/* Tuition Costs */}
                    {cost.tuition && cost.tuition.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tuition Fees</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {cost.tuition.map((item, idx) => (
                                    <div key={idx} className="bg-purple-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-600 mb-2">{item.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {item.currency || 'USD'} {item.min?.toLocaleString()} - {item.max?.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Living Costs */}
                    {cost.living && cost.living.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Living Expenses</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {cost.living.map((item, idx) => (
                                    <div key={idx} className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-gray-600 mb-2">{item.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {item.currency || 'USD'} {item.min?.toLocaleString()} - {item.max?.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    {cost.note && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <p className="text-sm text-gray-700">{cost.note}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// References Section


function ReferencesSection({ country }: { country: CountryResponse }) {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">
                References & Resources
            </h2>

            {/* ================= VISA PROCESS ================= */}
            {country.visaProcessDocuments && (
                <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Visa Process
                    </h3>

                    {/* Visa Steps */}
                    {/* {country?.visaProcessDocuments?.visaSteps?.length > 0 && ( */}
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-800 mb-3">
                            Application Steps
                        </h4>

                        <div className="relative border-l-2 border-purple-200 pl-6 space-y-6">
                            {country?.visaProcessDocuments?.visaSteps?.map(
                                (step: any, index: number) => (
                                    <div key={index} className="relative">
                                        <span className="absolute -left-[10px] top-1.5 w-4 h-4 bg-purple-600 rounded-full" />
                                        <h5 className="font-semibold text-gray-900">
                                            {step.title}
                                        </h5>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {step.description}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    {/* )} */}

                    {/* Required Documents */}
                    {/* {country.visaProcessDocuments.requiredDocuments?.length > 0 && ( */}
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">
                            Required Documents
                        </h4>
                        <ul className="space-y-3">
                            {country?.visaProcessDocuments?.visaDocuments?.map(
                                (doc: any, index: number) => (
                                    <li
                                        key={index}
                                        className="flex gap-3 items-start"
                                    >
                                        <span className="mt-1 w-2 h-2 bg-purple-600 rounded-full" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {doc.name}
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                {doc.description}
                                            </p>
                                        </div>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {/* ================= UNIVERSITIES ================= */}
            {/* {country?.topUniversities?.length > 0 && ( */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Top Universities
                </h3>

                <ul className="grid sm:grid-cols-2 gap-4">
                    {country?.topUniversities?.map((uni: any) => (
                        <li
                            key={uni._id}
                            className="flex items-center gap-4 p-3 rounded-md border hover:bg-gray-50"
                        >
                            {uni.logo && (
                                <img
                                    src={uni.logo}
                                    alt={uni.name}
                                    className="w-12 h-12 object-contain"
                                />
                            )}
                            <div>
                                <p className="font-medium text-gray-900">
                                    {uni.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {uni.city} · Rank {uni.rank}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {/* )} */}

            {/* ================= COURSES ================= */}
            {/* {country.topCourses?.length > 0 && ( */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    Popular Courses
                </h3>

                <ul className="space-y-4">
                    {country?.topCourses?.map((course: any) => (
                        <li
                            key={course._id}
                            className="p-4 border rounded-md hover:bg-gray-50"
                        >
                            <p className="font-medium text-gray-900">
                                {course.overview?.courseName}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {course.overview?.courseDescription}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
            {/* )} */}
        </div>
    );
}


// Helper Components
function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-gray-600">{label}</p>
            </div>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{message}</p>
        </div>
    );
}