import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MapPin,
    Calendar,
    Trophy,
    Users,
    Globe,
    GraduationCap,
    DollarSign,
    FileText,
    Heart,
    Image as ImageIcon,
    CheckCircle2
} from "lucide-react";
import type { University } from "@/types/university";

interface ViewUniversityModalProps {
    university: University | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewUniversityModal({
    university,
    open,
    onOpenChange,
}: ViewUniversityModalProps) {
    if (!university) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-[85vw] xl:max-w-[75vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
                {/* Header Section with Banner */}
                <div className="relative">
                    {university.bannerUrl ? (
                        <div className="h-48 w-full overflow-hidden">
                            <img
                                src={university.bannerUrl}
                                alt={`${university.name} banner`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                        </div>
                    ) : (
                        <div className="h-48 w-full bg-linear-to-br from-purple-600 to-blue-600" />
                    )}

                    {/* Logo and Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-end gap-4">
                            {university.logoUrl ? (
                                <div className="h-20 w-20 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white shrink-0">
                                    <img
                                        src={university.logoUrl}
                                        alt={university.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-20 w-20 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center shrink-0">
                                    <span className="text-2xl font-bold text-purple-600">
                                        {university.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 pb-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <DialogTitle className="text-2xl font-bold text-white drop-shadow-lg">
                                            {university.name}
                                        </DialogTitle>
                                        <p className="text-white/90 mt-1 drop-shadow">
                                            {university.fullName}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={university.status === "published" ? "default" : "secondary"}
                                        className={
                                            university.status === "published"
                                                ? "bg-green-500 text-white hover:bg-green-600"
                                                : "bg-yellow-500 text-white hover:bg-yellow-600"
                                        }
                                    >
                                        {university.status === "published" ? "Published" : "Draft"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 px-6 pb-6">
                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-6">
                        {university.rank && (
                            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                <div className="flex items-center gap-2 text-purple-600 mb-1">
                                    <Trophy className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase">Rank</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-900">#{university.rank}</p>
                            </div>
                        )}

                        {university.totalStudents && (
                            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Users className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase">Students</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">{university.totalStudents}</p>
                            </div>
                        )}

                        {university.founded && (
                            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase">Founded</span>
                                </div>
                                <p className="text-2xl font-bold text-green-900">{university.founded}</p>
                            </div>
                        )}

                        {university.internationalStudents && (
                            <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                <div className="flex items-center gap-2 text-orange-600 mb-1">
                                    <Globe className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase">International</span>
                                </div>
                                <p className="text-2xl font-bold text-orange-900">{university.internationalStudents}</p>
                            </div>
                        )}
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-gray-100">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="fees" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Fees
                            </TabsTrigger>
                            <TabsTrigger value="admissions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Admissions
                            </TabsTrigger>
                            <TabsTrigger value="studentLife" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Heart className="h-4 w-4 mr-2" />
                                Student Life
                            </TabsTrigger>
                            <TabsTrigger value="courses" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Courses
                            </TabsTrigger>
                            <TabsTrigger value="gallery" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Gallery
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6 mt-6">
                            {/* Location Card */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-semibold text-gray-900">
                                        {university.city}, {university.country}
                                    </p>
                                    {university.location && (
                                        <p className="text-gray-600">{university.location}</p>
                                    )}
                                </div>
                            </div>

                            {/* About Section */}
                            {university.about && (
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About the University</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{university.about}</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Fees Tab */}
                        <TabsContent value="fees" className="space-y-4 mt-6">
                            {university.fees && university.fees.length > 0 ? (
                                <div className="grid gap-4">
                                    {university.fees.map((fee, index) => (
                                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xl font-bold capitalize text-gray-900">
                                                    {fee.level}
                                                </h3>
                                                <Badge variant="outline" className="text-lg px-3 py-1">
                                                    {fee.currency}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                                    <p className="text-sm font-semibold text-blue-600 mb-1">
                                                        Tuition Fee
                                                    </p>
                                                    <p className="text-2xl font-bold text-blue-900">
                                                        {fee.tuitionFee}
                                                    </p>
                                                </div>

                                                {fee.applicationFee && (
                                                    <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                                        <p className="text-sm font-semibold text-purple-600 mb-1">
                                                            Application Fee
                                                        </p>
                                                        <p className="text-2xl font-bold text-purple-900">
                                                            {fee.applicationFee}
                                                        </p>
                                                    </div>
                                                )}

                                                {fee.duration && (
                                                    <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                                        <p className="text-sm font-semibold text-green-600 mb-1">
                                                            Duration
                                                        </p>
                                                        <p className="text-2xl font-bold text-green-900">
                                                            {fee.duration}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No fee information available</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Admissions Tab */}
                        <TabsContent value="admissions" className="space-y-6 mt-6">
                            {university.admissions ? (
                                <>
                                    {/* Undergraduate */}
                                    {university.admissions.undergraduate && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                                                <GraduationCap className="h-6 w-6 text-purple-600" />
                                                Undergraduate Admissions
                                            </h3>

                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                                                {university.admissions.undergraduate.acceptanceRate && (
                                                    <div className="text-center p-4 bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                        <p className="text-xs font-semibold text-green-600 mb-1">
                                                            Acceptance Rate
                                                        </p>
                                                        <p className="text-2xl font-bold text-green-900">
                                                            {university.admissions.undergraduate.acceptanceRate}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.undergraduate.sat && (
                                                    <div className="text-center p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                        <p className="text-xs font-semibold text-blue-600 mb-1">SAT</p>
                                                        <p className="text-2xl font-bold text-blue-900">
                                                            {university.admissions.undergraduate.sat}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.undergraduate.act && (
                                                    <div className="text-center p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                        <p className="text-xs font-semibold text-purple-600 mb-1">ACT</p>
                                                        <p className="text-2xl font-bold text-purple-900">
                                                            {university.admissions.undergraduate.act}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.undergraduate.toefl && (
                                                    <div className="text-center p-4 bg-linear-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                                                        <p className="text-xs font-semibold text-orange-600 mb-1">TOEFL</p>
                                                        <p className="text-2xl font-bold text-orange-900">
                                                            {university.admissions.undergraduate.toefl}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.undergraduate.ielts && (
                                                    <div className="text-center p-4 bg-linear-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                                                        <p className="text-xs font-semibold text-pink-600 mb-1">IELTS</p>
                                                        <p className="text-2xl font-bold text-pink-900">
                                                            {university.admissions.undergraduate.ielts}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {university.admissions.undergraduate.requirements &&
                                                university.admissions.undergraduate.requirements.length > 0 && (
                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            Requirements
                                                        </p>
                                                        <ul className="space-y-2">
                                                            {university.admissions.undergraduate.requirements.map(
                                                                (req, idx) => (
                                                                    <li key={idx} className="flex items-start gap-2">
                                                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                                        <span className="text-sm text-gray-700">{req}</span>
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    {/* Postgraduate */}
                                    {university.admissions.postgraduate && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                                                <GraduationCap className="h-6 w-6 text-blue-600" />
                                                Postgraduate Admissions
                                            </h3>

                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                                                {university.admissions.postgraduate.acceptanceRate && (
                                                    <div className="text-center p-4 bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                        <p className="text-xs font-semibold text-green-600 mb-1">
                                                            Acceptance Rate
                                                        </p>
                                                        <p className="text-2xl font-bold text-green-900">
                                                            {university.admissions.postgraduate.acceptanceRate}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.postgraduate.gre && (
                                                    <div className="text-center p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                        <p className="text-xs font-semibold text-blue-600 mb-1">GRE</p>
                                                        <p className="text-2xl font-bold text-blue-900">
                                                            {university.admissions.postgraduate.gre}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.postgraduate.gpa && (
                                                    <div className="text-center p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                        <p className="text-xs font-semibold text-purple-600 mb-1">GPA</p>
                                                        <p className="text-2xl font-bold text-purple-900">
                                                            {university.admissions.postgraduate.gpa}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.postgraduate.toefl && (
                                                    <div className="text-center p-4 bg-linear-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                                                        <p className="text-xs font-semibold text-orange-600 mb-1">TOEFL</p>
                                                        <p className="text-2xl font-bold text-orange-900">
                                                            {university.admissions.postgraduate.toefl}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.postgraduate.ielts && (
                                                    <div className="text-center p-4 bg-linear-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                                                        <p className="text-xs font-semibold text-pink-600 mb-1">IELTS</p>
                                                        <p className="text-2xl font-bold text-pink-900">
                                                            {university.admissions.postgraduate.ielts}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {university.admissions.postgraduate.requirements &&
                                                university.admissions.postgraduate.requirements.length > 0 && (
                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            Requirements
                                                        </p>
                                                        <ul className="space-y-2">
                                                            {university.admissions.postgraduate.requirements.map(
                                                                (req, idx) => (
                                                                    <li key={idx} className="flex items-start gap-2">
                                                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                                        <span className="text-sm text-gray-700">{req}</span>
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    {/* PhD */}
                                    {university.admissions.phd && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                                                <GraduationCap className="h-6 w-6 text-indigo-600" />
                                                PhD Admissions
                                            </h3>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                                {university.admissions.phd.gre && (
                                                    <div className="text-center p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                        <p className="text-xs font-semibold text-blue-600 mb-1">GRE</p>
                                                        <p className="text-2xl font-bold text-blue-900">
                                                            {university.admissions.phd.gre}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.phd.gpa && (
                                                    <div className="text-center p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                        <p className="text-xs font-semibold text-purple-600 mb-1">GPA</p>
                                                        <p className="text-2xl font-bold text-purple-900">
                                                            {university.admissions.phd.gpa}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.admissions.phd.researchProposalRequired !== undefined && (
                                                    <div className="text-center p-4 bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                        <p className="text-xs font-semibold text-green-600 mb-1">
                                                            Research Proposal
                                                        </p>
                                                        <p className="text-2xl font-bold text-green-900">
                                                            {university.admissions.phd.researchProposalRequired
                                                                ? "Required"
                                                                : "Not Required"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {university.admissions.phd.requirements &&
                                                university.admissions.phd.requirements.length > 0 && (
                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            Requirements
                                                        </p>
                                                        <ul className="space-y-2">
                                                            {university.admissions.phd.requirements.map((req, idx) => (
                                                                <li key={idx} className="flex items-start gap-2">
                                                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                                                    <span className="text-sm text-gray-700">{req}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No admissions information available</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Student Life Tab */}
                        <TabsContent value="studentLife" className="space-y-4 mt-6">
                            {university.studentLife ? (
                                <>
                                    {university.studentLife.overview && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                                                <Heart className="h-5 w-5 text-red-600" />
                                                Overview
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                {university.studentLife.overview}
                                            </p>
                                        </div>
                                    )}

                                    {university.studentLife.stats && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-lg font-semibold mb-6 text-gray-900">Campus Statistics</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {university.studentLife.stats.studentOrganizations && (
                                                    <div className="text-center p-6 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                        <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                                        <p className="text-sm text-purple-600 font-semibold mb-1">
                                                            Student Organizations
                                                        </p>
                                                        <p className="text-3xl font-bold text-purple-900">
                                                            {university.studentLife.stats.studentOrganizations}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.studentLife.stats.varsitySports && (
                                                    <div className="text-center p-6 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                        <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                                        <p className="text-sm text-blue-600 font-semibold mb-1">
                                                            Varsity Sports
                                                        </p>
                                                        <p className="text-3xl font-bold text-blue-900">
                                                            {university.studentLife.stats.varsitySports}
                                                        </p>
                                                    </div>
                                                )}
                                                {university.studentLife.stats.studentFacultyRatio && (
                                                    <div className="text-center p-6 bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                        <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                                        <p className="text-sm text-green-600 font-semibold mb-1">
                                                            Student-Faculty Ratio
                                                        </p>
                                                        <p className="text-3xl font-bold text-green-900">
                                                            {university.studentLife.stats.studentFacultyRatio}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {university.studentLife.athletics && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                                                <Trophy className="h-5 w-5 text-yellow-600" />
                                                Athletics
                                            </h3>
                                            {university.studentLife.athletics.division && (
                                                <div className="inline-block bg-linear-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg px-6 py-3">
                                                    <p className="text-sm text-yellow-600 font-semibold mb-1">Division</p>
                                                    <p className="text-2xl font-bold text-yellow-900">
                                                        {university.studentLife.athletics.division}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No student life information available</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Courses Tab */}
                        <TabsContent value="courses" className="mt-6">
                            {university.courses && university.courses.length > 0 ? (
                                <div className="grid gap-3">
                                    {university.courses.map((courseId, index) => (
                                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow hover:border-purple-300">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                                                    <GraduationCap className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <p className="text-sm font-mono text-gray-700">{String(courseId)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No courses linked yet</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Gallery Tab */}
                        <TabsContent value="gallery" className="mt-6">
                            {university.galleryUrls && university.galleryUrls.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {university.galleryUrls.map((url, index) => (
                                        <div key={index} className="group relative aspect-video overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                                            <img
                                                src={url}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No gallery images available</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}