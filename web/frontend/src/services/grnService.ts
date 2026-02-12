import apiClient from './apiClient';

export interface GRNItemDto {
    id?: number;
    poItemId: number;
    itemId: number;
    itemNameAr?: string;
    orderedQty: number;
    receivedQty: number;
    acceptedQty?: number;
    unitId: number;
    unitNameAr?: string;
    unitCost?: number;
    totalCost?: number;
    rejectedQty?: number;
    lotNumber?: string;
    manufactureDate?: string;
    expiryDate?: string;
    locationId?: number;
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
        return (response.data as { data?: GoodsReceiptNoteDto[] })?.data ?? [];
    },
    getGRNById: async (id: number) => {
        const response = await apiClient.get<{ data: GoodsReceiptNoteDto }>(`/inventory/grn/${id}`);
        return (response.data as { data?: GoodsReceiptNoteDto })?.data ?? null;
    },
    createGRN: async (grn: GoodsReceiptNoteDto) => {
        const response = await apiClient.post<{ data: GoodsReceiptNoteDto }>('/inventory/grn', grn);
        return (response.data as { data?: GoodsReceiptNoteDto })?.data ?? null;
    },
    updateGRN: async (id: number, grn: GoodsReceiptNoteDto) => {
        const response = await apiClient.put<{ data: GoodsReceiptNoteDto }>(`/inventory/grn/${id}`, grn);
        return (response.data as { data?: GoodsReceiptNoteDto })?.data ?? null;
    },
    finalizeStoreIn: async (id: number, userId?: number) => {
        const url = userId != null ? `/inventory/grn/${id}/finalize?userId=${userId}` : `/inventory/grn/${id}/finalize`;
        const response = await apiClient.post<{ data: GoodsReceiptNoteDto }>(url);
        return (response.data as { data?: GoodsReceiptNoteDto })?.data ?? null;
    },
    submitGRN: async (id: number, userId?: number) => {
        const url = userId != null ? `/inventory/grn/${id}/submit?userId=${userId}` : `/inventory/grn/${id}/submit`;
        const response = await apiClient.post<{ data: GoodsReceiptNoteDto }>(url);
        return (response.data as { data?: GoodsReceiptNoteDto })?.data ?? null;
    },
    deleteGRN: async (id: number) => {
        await apiClient.post(`/inventory/grn/${id}/delete`);
    },
};
