// pages/Agent/AgentApplicationsTab.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { agentService } from '@/services/agentService';
import type { ApplicationStatus, IAgentApplication } from '@/types/agent';
import { Badge } from '@/components/ui/badge';

function formatDate(value?: string) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

const statusStyles: Record<ApplicationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    'sent-to-crm': 'bg-green-100 text-green-800',
    'crm-sync-failed': 'bg-red-100 text-red-800',
    abandoned: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
};

interface AgentApplicationsTabProps {
    agentId: string;
}

export function AgentApplicationsTab({ agentId }: AgentApplicationsTabProps) {
    const [applications, setApplications] = useState<IAgentApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const isReset = useRef(true);
    const loadingRef = useRef(false);

    useEffect(() => {
        isReset.current = true;
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentId]);

    useEffect(() => {
        fetchApplications(page, !isReset.current);
        isReset.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, agentId]);

    const fetchApplications = async (pageNum: number, append: boolean) => {
        if (loadingRef.current || !agentId) return;
        loadingRef.current = true;
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }
            const response = await agentService.getAgentApplications(agentId, { page: pageNum, limit: 20 });
            setApplications((prev) => (append ? [...prev, ...(response.data || [])] : response.data || []));
            if (response.pagination) {
                setHasMore(response.pagination.hasNextPage);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching agent applications:', error);
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12 bg-white rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">Student applications submitted by this agent will appear here</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {applications.map((application) => {
                    const student = application.userId;
                    return (
                        <li key={application._id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-gray-900">
                                            {student ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || 'Unnamed student' : 'Student not found'}
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

                                    {application.status === 'crm-sync-failed' && application.crmSyncError && (
                                        <div className="mt-1 text-xs text-red-600">
                                            CRM sync error: {application.crmSyncError}
                                        </div>
                                    )}
                                </div>

                                <div className="text-sm text-gray-500 whitespace-nowrap text-right">
                                    <div>{formatDate(application.createdAt)}</div>
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
    );
}
