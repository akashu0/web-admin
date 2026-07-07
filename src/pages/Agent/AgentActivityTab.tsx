// pages/Agent/AgentActivityTab.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Activity } from 'lucide-react';
import { agentService } from '@/services/agentService';
import type { IAgentActivity } from '@/types/agent';
import { Badge } from '@/components/ui/badge';

function formatDate(value: string) {
    return new Date(value).toLocaleString();
}

function statusBadgeClass(statusCode: number) {
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 text-green-800';
    if (statusCode >= 400) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
}

interface AgentActivityTabProps {
    agentId: string;
}

export function AgentActivityTab({ agentId }: AgentActivityTabProps) {
    const [activities, setActivities] = useState<IAgentActivity[]>([]);
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
        fetchActivity(page, !isReset.current);
        isReset.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, agentId]);

    const fetchActivity = async (pageNum: number, append: boolean) => {
        if (loadingRef.current || !agentId) return;
        loadingRef.current = true;
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }
            const response = await agentService.getAgentActivity(agentId, { page: pageNum, limit: 20 });
            setActivities((prev) => (append ? [...prev, ...(response.data || [])] : response.data || []));
            if (response.pagination) {
                setHasMore(response.pagination.hasNextPage);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching agent activity:', error);
            if (!append) setActivities([]);
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

    if (activities.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No activity found</h3>
                <p className="text-gray-600">Mutating actions taken on the agent portal will appear here</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {activities.map((activity) => (
                    <li key={activity._id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-gray-900">{activity.label}</span>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {activity.actorType === 'employee' ? 'Employee' : 'Agent'}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 font-mono">
                                    <span>{activity.method}</span>
                                    <span className="truncate">{activity.path}</span>
                                    <Badge className={`${statusBadgeClass(activity.statusCode)} border-transparent`}>
                                        {activity.statusCode}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 whitespace-nowrap">
                                {formatDate(activity.createdAt)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
                {isLoadingMore ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                ) : !hasMore && activities.length > 0 ? (
                    <span className="text-sm text-gray-500">All {total} activity entries loaded</span>
                ) : null}
            </div>
        </div>
    );
}
