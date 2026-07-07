// pages/Agent/AgentDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Mail, Phone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { agentService } from '@/services/agentService';
import type { IAgentSummary, AgentStatus } from '@/types/agent';
import { AgentSessionsTab } from './AgentSessionsTab';
import { AgentActivityTab } from './AgentActivityTab';
import { AgentApplicationsTab } from './AgentApplicationsTab';

const statusStyles: Record<AgentStatus, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'not-verified': 'bg-gray-100 text-gray-800',
    inactive: 'bg-slate-100 text-slate-800',
    suspended: 'bg-orange-100 text-orange-800',
    rejected: 'bg-red-100 text-red-800',
};

function formatDate(value: string | null) {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
}

export default function AgentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [agent, setAgent] = useState<IAgentSummary | null>(null);

    useEffect(() => {
        const loadAgent = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const response = await agentService.getAgentById(id);
                setAgent(response.data);
            } catch (error) {
                console.error('Error loading agent:', error);
                navigate('/agents');
            } finally {
                setIsLoading(false);
            }
        };

        loadAgent();
    }, [id, navigate]);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!agent) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/agents')} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Agents
                    </Button>

                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {agent.firstName} {agent.lastName}
                                </h1>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[agent.status] || 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {agent.status}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-6 text-gray-600 flex-wrap">
                                <span className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {agent.emailid}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {agent.phoneNumber}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Last login: {formatDate(agent.lastLoginAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="applications" className="w-full">
                    <TabsList>
                        <TabsTrigger value="applications">Applications</TabsTrigger>
                        <TabsTrigger value="sessions">Login Sessions</TabsTrigger>
                        <TabsTrigger value="activity">Activity Log</TabsTrigger>
                    </TabsList>

                    <TabsContent value="applications" className="mt-4">
                        <AgentApplicationsTab agentId={agent._id} />
                    </TabsContent>

                    <TabsContent value="sessions" className="mt-4">
                        <AgentSessionsTab agentId={agent._id} />
                    </TabsContent>

                    <TabsContent value="activity" className="mt-4">
                        <AgentActivityTab agentId={agent._id} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
