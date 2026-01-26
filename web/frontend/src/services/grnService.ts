import apiClient from './apiClient';

export interface GRNItemDto {
    id?: number;
    poItemId: number;
    itemId: number;
    itemNameAr?: string;
    orderedQty: number;
    receivedQty: number;
    acceptedQty?: number;
    rejectedQty?: number;
    unitId: number;
    unitNameAr?: string;
    unitCost?: number;
    totalCost?: number;
    lotNumber?: string;
    notes?: string;
}

export interface GoodsReceiptNoteDto {
    id?: number;
    grnNumber?: string;
    grnDate?: string;
    poId: number;
    poNumber?: string;
    supplierId: number;
    supplierNameAr?: string;
    warehouseId: number;
    deliveryNoteNo?: string;
    supplierInvoiceNo?: string;
    receivedByUserId: number;
    status?: string;
    approvalStatus?: string;
    totalReceivedQty?: number;
    notes?: string;
    items: GRNItemDto[];
}

export const grnService = {
    getAllGRNs: async () => {
        const response = await apiClient.get<{ data: GoodsReceiptNoteDto[] }>('/inventory/grn');
        return response.data.data;
    },
    getGRNById: async (id: number) => {
        const response = await apiClient.get<{ data: GoodsReceiptNoteDto }>(`/inventory/grn/${id}`);
        return response.data.data;
    },
    createGRN: async (grn: GoodsReceiptNoteDto) => {
        const response = await apiClient.post<{ data: GoodsReceiptNoteDto }>('/inventory/grn', grn);
        return response.data.data;
    },
    finalizeStoreIn: async (id: number, userId: number) => {
        const response = await apiClient.post<{ data: GoodsReceiptNoteDto }>(`/inventory/grn/${id}/finalize`, null, {
            params: { userId }
        });
        return response.data.data;
    },
    submitGRN: async (id: number, userId: number) => {
        const response = await apiClient.post<{ data: GoodsReceiptNoteDto }>(`/inventory/grn/${id}/submit`, null, {
            params: { userId }
        });
        return response.data.data;
    }
};
