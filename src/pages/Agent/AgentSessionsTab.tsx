// pages/Agent/AgentSessionsTab.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, LogIn, User } from 'lucide-react';
import { agentService } from '@/services/agentService';
import type { IAgentSession } from '@/types/agent';
import { Badge } from '@/components/ui/badge';

function formatDate(value: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

function formatDuration(loginAt: string, logoutAt: string) {
    const ms = new Date(logoutAt).getTime() - new Date(loginAt).getTime();
    if (Number.isNaN(ms) || ms < 0) return '—';
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0 && minutes === 0) return '<1m';
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
}

function parseUserAgent(userAgent: string | undefined | null) {
    if (!userAgent) return { device: 'Unknown', browser: 'Unknown' };

    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const device = isMobile ? 'Mobile' : 'Desktop';

    let browser = 'Unknown';
    if (/Edg\//i.test(userAgent)) browser = 'Edge';
    else if (/Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent)) browser = 'Chrome';
    else if (/Firefox\//i.test(userAgent)) browser = 'Firefox';
    else if (/Safari\//i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
    else if (/OPR\//i.test(userAgent)) browser = 'Opera';

    return { device, browser };
}

interface AgentSessionsTabProps {
    agentId: string;
}

export function AgentSessionsTab({ agentId }: AgentSessionsTabProps) {
    const [sessions, setSessions] = useState<IAgentSession[]>([]);
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
        fetchSessions(page, !isReset.current);
        isReset.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, agentId]);

    const fetchSessions = async (pageNum: number, append: boolean) => {
        if (loadingRef.current || !agentId) return;
        loadingRef.current = true;
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }
            const response = await agentService.getAgentSessions(agentId, { page: pageNum, limit: 10 });
            setSessions((prev) => (append ? [...prev, ...(response.data || [])] : response.data || []));
            if (response.pagination) {
                setHasMore(response.pagination.hasNextPage);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching agent sessions:', error);
            if (!append) setSessions([]);
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

    if (sessions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No login sessions found</h3>
                <p className="text-gray-600">Sessions will appear here once this agent logs in</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sessions.map((session) => {
                            const isActive = !session.logoutAt;
                            const { device, browser } = parseUserAgent(session.userAgent);
                            return (
                                <tr key={session._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                        {formatDate(session.loginAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        {isActive ? '—' : formatDate(session.logoutAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isActive ? (
                                            <Badge className="bg-green-100 text-green-800 border-transparent">Active</Badge>
                                        ) : (
                                            <span className="text-gray-900">
                                                {formatDuration(session.loginAt, session.logoutAt as string)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {session.actorType === 'employee' ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-900">{session.actorName}</span>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    employee
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <User className="w-4 h-4 text-gray-400" />
                                                Agent (root)
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">
                                        {session.ipAddress || '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                                        {device} · {browser}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
                {isLoadingMore ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                ) : !hasMore && sessions.length > 0 ? (
                    <span className="text-sm text-gray-500">All {total} sessions loaded</span>
                ) : null}
            </div>
        </div>
    );
}
