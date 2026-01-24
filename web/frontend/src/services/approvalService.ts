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

export const approvalService = {
    getPendingRequests: async (userId: number) => {
        const response = await apiClient.get<{ data: ApprovalRequestDto[] }>('/approvals/pending', {
            params: { userId }
        });
        return response.data;
    },

    takeAction: async (requestId: number, userId: number, action: 'Approved' | 'Rejected', comments?: string) => {
        const response = await apiClient.post('/approvals/' + requestId + '/action', null, {
            params: { userId, action, comments }
        });
        return response.data;
    }
};
