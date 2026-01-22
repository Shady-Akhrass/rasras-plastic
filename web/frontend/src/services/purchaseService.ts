import apiClient from './apiClient';

export interface PurchaseRequisitionItem {
    id?: number;
    prId?: number;
    itemId: number;
    itemNameAr?: string;
    itemNameEn?: string;
    itemCode?: string;
    requestedQty: number;
    unitId: number;
    unitName?: string;
    estimatedUnitPrice?: number;
    estimatedTotalPrice?: number;
    requiredDate?: string;
    specifications?: string;
    notes?: string;
}

export interface PurchaseRequisition {
    id?: number;
    prNumber?: string;
    prDate?: string;
    requestedByDeptId: number;
    requestedByDeptName?: string;
    requestedByUserId: number;
    requestedByUserName?: string;
    requiredDate?: string;
    priority: string;
    status?: string;
    totalEstimatedAmount?: number;
    justification?: string;
    approvedByUserId?: number;
    approvedByUserName?: string;
    approvedDate?: string;
    rejectionReason?: string;
    notes?: string;
    items: PurchaseRequisitionItem[];
    createdAt?: string;
    createdBy?: number;
}

const purchaseService = {
    getAllPRs: async () => {
        const response = await apiClient.get<{ data: PurchaseRequisition[] }>('/procurement/pr');
        return response.data.data;
    },

    getPRById: async (id: number) => {
        const response = await apiClient.get<{ data: PurchaseRequisition }>(`/procurement/pr/${id}`);
        return response.data.data;
    },

    createPR: async (pr: PurchaseRequisition) => {
        const response = await apiClient.post<{ data: PurchaseRequisition }>('/procurement/pr', pr);
        return response.data.data;
    },

    updatePR: async (id: number, pr: PurchaseRequisition) => {
        const response = await apiClient.put<{ data: PurchaseRequisition }>(`/procurement/pr/${id}`, pr);
        return response.data.data;
    }
};

export default purchaseService;
