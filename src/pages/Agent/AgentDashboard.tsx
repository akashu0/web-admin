// pages/Agent/AgentDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    UserCheck,
    Clock,
    Loader2,
    Activity,
    LogIn,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import { agentService } from '@/services/agentService';
import type { IAgentStats, IMostActiveAgent, AgentStatus } from '@/types/agent';

const statusStyles: Record<AgentStatus, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'not-verified': 'bg-gray-100 text-gray-800',
    inactive: 'bg-slate-100 text-slate-800',
    suspended: 'bg-orange-100 text-orange-800',
    rejected: 'bg-red-100 text-red-800',
};

const MOST_ACTIVE_WINDOW_DAYS = 30;

function formatDate(value: string | null) {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
}

interface StatCard {
    key: string;
    label: string;
    value: number;
    icon: typeof Users;
    accent: string;
}

export default function AgentDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState<IAgentStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const [active, setActive] = useState<IMostActiveAgent[]>([]);
    const [activeLoading, setActiveLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await agentService.getAgentStats();
                if (!cancelled) setStats(res.data);
            } catch {
                if (!cancelled) setStats(null);
            } finally {
                if (!cancelled) setStatsLoading(false);
            }
        })();

        (async () => {
            try {
                const res = await agentService.getMostActiveAgents({
                    days: MOST_ACTIVE_WINDOW_DAYS,
                    limit: 10,
                });
                if (!cancelled) setActive(res.data || []);
            } catch {
                if (!cancelled) setActive([]);
            } finally {
                if (!cancelled) setActiveLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const cards: StatCard[] = [
        {
            key: 'total',
            label: 'Total Agents',
            value: stats?.total ?? 0,
            icon: Users,
            accent: 'bg-blue-50 text-blue-600',
        },
        {
            key: 'active',
            label: 'Active',
            value: stats?.active ?? 0,
            icon: UserCheck,
            accent: 'bg-green-50 text-green-600',
        },
        {
            key: 'pending',
            label: 'Pending',
            value: stats?.pending ?? 0,
            icon: Clock,
            accent: 'bg-yellow-50 text-yellow-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="w-8 h-8 text-black" />
                            Agent Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Overview of agents on the portal and their recent engagement
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/agents/list')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                        View all agents
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.key}
                                className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                    {statsLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-2" />
                                    ) : (
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                                    )}
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.accent}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Most active agents */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-700" />
                        <h2 className="text-lg font-semibold text-gray-900">Most active agents</h2>
                        <span className="text-sm text-gray-500">· last {MOST_ACTIVE_WINDOW_DAYS} days</span>
                    </div>

                    {activeLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                        </div>
                    ) : active.length === 0 ? (
                        <div className="p-12 text-center">
                            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recent activity</h3>
                            <p className="text-gray-600">
                                Agent logins and actions from the last {MOST_ACTIVE_WINDOW_DAYS} days will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logins</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last login</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {active.map((agent, index) => (
                                        <tr
                                            key={agent._id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigate(`/agents/${agent._id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-gray-600 font-semibold text-xs">
                                                            {(agent.firstName?.[0] || '').toUpperCase()}
                                                            {(agent.lastName?.[0] || '').toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {agent.firstName} {agent.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{agent.emailid}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[agent.status] || 'bg-gray-100 text-gray-800'}`}
                                                >
                                                    {agent.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 text-gray-900">
                                                    <LogIn className="w-4 h-4 text-gray-400" />
                                                    {agent.loginCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 text-gray-900">
                                                    <Activity className="w-4 h-4 text-gray-400" />
                                                    {agent.activityCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {formatDate(agent.windowLastLoginAt ?? agent.lastLoginAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
