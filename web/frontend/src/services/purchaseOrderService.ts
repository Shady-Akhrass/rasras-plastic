import apiClient from './apiClient';

export interface PurchaseOrderItemDto {
    id?: number;
    itemId: number;
    itemNameAr?: string;
    description?: string;
    orderedQty: number;
    unitId: number;
    unitNameAr?: string;
    unitPrice: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxPercentage?: number;
    taxAmount?: number;
    totalPrice: number;
    polymerGrade?: string;
    receivedQty?: number;
    remainingQty?: number;
    status?: string;
}

export interface PurchaseOrderDto {
    id?: number;
    poNumber?: string;
    poDate?: string;
    prId?: number;
    quotationId?: number;
    comparisonId?: number;
    supplierId: number;
    supplierNameAr?: string;
    expectedDeliveryDate?: string;
    shippingMethod?: string;
    shippingTerms?: string;
    paymentTerms?: string;
    paymentTermDays?: number;
    currency?: string;
    exchangeRate?: number;
    subTotal: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxAmount?: number;
    shippingCost?: number;
    otherCosts?: number;
    totalAmount: number;
    status?: string;
    approvalStatus?: string;
    notes?: string;
    termsAndConditions?: string;
    deliveryDays?: number; // Added
    items: PurchaseOrderItemDto[];
}

export const purchaseOrderService = {
    getAllPOs: async () => {
        const response = await apiClient.get<{ data: PurchaseOrderDto[] }>('/procurement/po');
        return response.data.data;
    },
    getPOById: async (id: number) => {
        const response = await apiClient.get<{ data: PurchaseOrderDto }>(`/procurement/po/${id}`);
        return response.data.data;
    },
    getWaitingForArrivalPOs: async () => {
        const response = await apiClient.get<{ data: PurchaseOrderDto[] }>('/procurement/po/waiting');
        return response.data.data;
    },
    createPO: async (po: PurchaseOrderDto) => {
        const response = await apiClient.post<{ data: PurchaseOrderDto }>('/procurement/po', po);
        return response.data.data;
    },
    deletePO: async (id: number) => {
        await apiClient.post(`/procurement/po/${id}/delete`);
    },
    markAsArrived: async (poId: number, userId?: number) => {
        const url = userId != null 
            ? `/procurement/po/${poId}/mark-arrived?userId=${userId}`
            : `/procurement/po/${poId}/mark-arrived`;
        const response = await apiClient.post<{ data: any }>(url);
        return response.data.data;
    }
};
