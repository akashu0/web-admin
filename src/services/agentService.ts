// services/agentService.ts
import type {
    AgentByIdResponse,
    AgentActivityListResponse,
    AgentListResponse,
    AgentSessionListResponse,
    AgentStatus,
} from '@/types/agent';
import { apiClient } from './api';

export const agentService = {
    async getAllAgents(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: AgentStatus;
    }): Promise<AgentListResponse> {
        try {
            const response = await apiClient.get<AgentListResponse>('/agent-portal/admin/agents', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching agents:', error);
            throw error;
        }
    },

    async getAgentById(id: string): Promise<AgentByIdResponse> {
        try {
            const response = await apiClient.get<AgentByIdResponse>(`/agent-portal/admin/agents/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching agent:', error);
            throw error;
        }
    },

    async getAgentSessions(
        id: string,
        params?: { page?: number; limit?: number }
    ): Promise<AgentSessionListResponse> {
        try {
            const response = await apiClient.get<AgentSessionListResponse>(
                `/agent-portal/admin/agents/${id}/sessions`,
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching agent sessions:', error);
            throw error;
        }
    },

    async getAgentActivity(
        id: string,
        params?: { page?: number; limit?: number }
    ): Promise<AgentActivityListResponse> {
        try {
            const response = await apiClient.get<AgentActivityListResponse>(
                `/agent-portal/admin/agents/${id}/activity`,
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching agent activity:', error);
            throw error;
        }
    },
};
