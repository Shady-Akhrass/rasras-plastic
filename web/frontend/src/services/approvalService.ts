import apiClient from './apiClient';

export interface ApprovalRequestDto {
    id: number;
    workflowName: string;
    documentType: string;
    documentId: number;
    documentNumber: string;
    requestedByName: string;
    requestedDate: string;
    currentStepName: string;
    totalAmount: number;
    priority: string;
    status: string;
}

/** صف سجل الاعتمادات — من اعتمد ومتى */
export interface ApprovalAuditDto {
    actionId: number;
    requestId: number;
    documentType: string;
    documentId: number;
    documentNumber: string;
    workflowName: string;
    stepName: string;
    actionType: string;
    actionByUser: string;
    actionDate: string;
    comments?: string;
    totalAmount?: number;
    requestStatus: string;
}

export const approvalService = {
    getPendingRequests: async (userId: number) => {
        const response = await apiClient.get<{ data: ApprovalRequestDto[] }>('/approvals/pending', {
            params: { userId }
        });
        return response.data;
    },

    getPendingCount: async (userId: number): Promise<number> => {
        try {
            const response = await apiClient.get<{ data: ApprovalRequestDto[] }>('/approvals/pending', {
                params: { userId }
            });
            return response.data?.data?.length || 0;
        } catch {
            return 0;
        }
    },

    takeAction: async (requestId: number, userId: number, action: 'Approved' | 'Rejected', comments?: string, warehouseId?: number) => {
        const params: Record<string, string | number> = { userId, action };
        if (comments) params.comments = comments;
        if (warehouseId) params.warehouseId = warehouseId;
        const response = await apiClient.post('/approvals/' + requestId + '/action', null, { params });
        return response.data;
    },

    getRecentAudit: async (limit = 100): Promise<ApprovalAuditDto[]> => {
        const response = await apiClient.get<{ data: ApprovalAuditDto[] }>('/approvals/audit', { params: { limit } });
        return response.data?.data ?? [];
    }
};
