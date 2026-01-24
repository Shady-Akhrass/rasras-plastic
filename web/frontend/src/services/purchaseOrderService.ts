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
    createPO: async (po: PurchaseOrderDto) => {
        const response = await apiClient.post<{ data: PurchaseOrderDto }>('/procurement/po', po);
        return response.data.data;
    }
};
