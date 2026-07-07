// pages/Agent/ApplicationList.tsx
// Global list of agent-submitted student applications, newest first.
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Mail, Phone, MapPin, UserRound, Clock } from 'lucide-react';
import { agentService } from '@/services/agentService';
import type { ApplicationStatus, IAgentApplication, IApplicationAgent } from '@/types/agent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusStyles: Record<ApplicationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    'sent-to-crm': 'bg-green-100 text-green-800',
    'crm-sync-failed': 'bg-red-100 text-red-800',
    abandoned: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
};

const STATUS_FILTERS: Array<{ label: string; value: ApplicationStatus | undefined }> = [
    { label: 'All', value: undefined },
    { label: 'Pending', value: 'pending' },
    { label: 'Sent to CRM', value: 'sent-to-crm' },
    { label: 'Sync Failed', value: 'crm-sync-failed' },
    { label: 'Completed', value: 'completed' },
];

function formatDateTime(value: string) {
    return new Date(value).toLocaleString();
}

function timeAgo(value: string) {
    const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

function isPopulatedAgent(agent: IAgentApplication['agentId']): agent is IApplicationAgent {
    return typeof agent === 'object' && agent !== null && '_id' in agent;
}

export default function ApplicationList() {
    const [applications, setApplications] = useState<IAgentApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [status, setStatus] = useState<ApplicationStatus | undefined>(undefined);

    const isReset = useRef(true);
    const loadingRef = useRef(false);

    useEffect(() => {
        isReset.current = true;
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    useEffect(() => {
        fetchApplications(page, !isReset.current);
        isReset.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, status]);

    const fetchApplications = async (pageNum: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }
            const response = await agentService.getAllApplications({ page: pageNum, limit: 20, status });
            setApplications((prev) => (append ? [...prev, ...(response.data || [])] : response.data || []));
            if (response.pagination) {
                setHasMore(response.pagination.hasNextPage);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            if (!append) setApplications([]);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            loadingRef.current = false;
        }
    };

    const handleScroll = useCallback(() => {
        if (loadingRef.current || !hasMore) return;
        const scrollTop = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 300;
        if (scrollTop >= threshold) {
            setPage((p) => p + 1);
        }
    }, [hasMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                            <p className="mt-1 text-gray-600">
                                Student applications submitted by agents — newest first
                                {total > 0 && <span className="text-gray-400"> · {total} total</span>}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {STATUS_FILTERS.map((f) => (
                                <Button
                                    key={f.label}
                                    variant={status === f.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatus(f.value)}
                                >
                                    {f.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12 bg-white rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                    </div>
                ) : applications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
                        <p className="text-gray-600">Applications submitted by agents will appear here</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {applications.map((application) => {
                                const student = application.userId;
                                const agent = isPopulatedAgent(application.agentId) ? application.agentId : null;
                                return (
                                    <li key={application._id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-gray-900">
                                                        {student
                                                            ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || 'Unnamed student'
                                                            : 'Student not found'}
                                                    </span>
                                                    <Badge className={`${statusStyles[application.status] || 'bg-gray-100 text-gray-800'} border-transparent`}>
                                                        {application.status}
                                                    </Badge>
                                                    {student?.studentId && (
                                                        <span className="text-xs text-gray-500 font-mono">{student.studentId}</span>
                                                    )}
                                                </div>

                                                {student && (
                                                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                                        {student.email && (
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="w-3 h-3" /> {student.email}
                                                            </span>
                                                        )}
                                                        {student.mobile && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="w-3 h-3" /> {student.mobile}
                                                            </span>
                                                        )}
                                                        {student.country && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" /> {student.country}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="mt-1 text-sm text-gray-700">
                                                    {application.center} — {application.courseLabel || application.course}
                                                </div>

                                                {agent && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                                        <UserRound className="w-3 h-3" />
                                                        Submitted by{' '}
                                                        <Link
                                                            to={`/agents/${agent._id}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {agent.firstName} {agent.lastName}
                                                        </Link>
                                                    </div>
                                                )}

                                                {application.status === 'crm-sync-failed' && application.crmSyncError && (
                                                    <div className="mt-1 text-xs text-red-600">
                                                        CRM sync error: {application.crmSyncError}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1 text-sm font-medium text-gray-900">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {timeAgo(application.createdAt)}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">{formatDateTime(application.createdAt)}</div>
                                                {application.crmApplicationId && (
                                                    <div className="text-xs text-gray-400 font-mono mt-1">
                                                        CRM ID: {application.crmApplicationId}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
                            {isLoadingMore ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                            ) : !hasMore && applications.length > 0 ? (
                                <span className="text-sm text-gray-500">All {total} applications loaded</span>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
