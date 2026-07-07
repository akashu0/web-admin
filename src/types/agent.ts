// types/agent.ts

export type AgentStatus =
    | 'not-verified'
    | 'pending'
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'rejected';

export type ActorType = 'agent' | 'employee';

export interface IAgentSummary {
    _id: string;
    firstName: string;
    lastName: string;
    emailid: string;
    phoneNumber: string;
    status: AgentStatus;
    lastLoginAt: string | null;
    createdAt: string;
}

export interface IAgentSession {
    _id: string;
    agentId: string;
    actorId: string;
    actorType: ActorType;
    actorName: string;
    loginAt: string;
    logoutAt: string | null;
    endReason: 'logout' | 'expired' | null;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    updatedAt: string;
}

export interface IAgentActivity {
    _id: string;
    agentId: string;
    actorId: string;
    actorType: ActorType;
    method: string;
    path: string;
    statusCode: number;
    label: string;
    createdAt: string;
    updatedAt: string;
}

export interface IPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface AgentListResponse {
    success: boolean;
    data: IAgentSummary[];
    pagination: IPagination;
}

export interface AgentByIdResponse {
    success: boolean;
    data: IAgentSummary;
    message?: string;
}

export interface AgentSessionListResponse {
    success: boolean;
    data: IAgentSession[];
    pagination: IPagination;
}

export interface AgentActivityListResponse {
    success: boolean;
    data: IAgentActivity[];
    pagination: IPagination;
}
