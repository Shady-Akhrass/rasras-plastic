import apiClient from './apiClient';

export interface StockAdjustmentItemDto {
    id?: number;
    itemId: number;
    itemCode?: string;
    itemNameAr?: string;
    unitId: number;
    unitNameAr?: string;
    systemQty: number;
    actualQty: number;
    adjustmentQty?: number;
    unitCost?: number;
    adjustmentValue?: number;
    notes?: string;
}

export interface StockAdjustmentDto {
    id?: number;
    adjustmentNumber?: string;
    adjustmentDate?: string;
    warehouseId: number;
    warehouseNameAr?: string;
    adjustmentType?: string;
    reason?: string;
    status?: string;
    approvedByUserId?: number;
    approvedDate?: string;
    postedDate?: string;
    notes?: string;
    createdAt?: string;
    createdBy?: number;
    items?: StockAdjustmentItemDto[];
}

const _api = '/inventory/adjustments';

export const stockAdjustmentService = {
    getAll: async (): Promise<StockAdjustmentDto[]> => {
        const res = await apiClient.get<{ data?: StockAdjustmentDto[] }>(_api);
        return (res.data as any)?.data ?? [];
    },
    getById: async (id: number): Promise<StockAdjustmentDto | null> => {
        const res = await apiClient.get<{ data?: StockAdjustmentDto }>(`${_api}/${id}`);
        return (res.data as any)?.data ?? null;
    },
    getByWarehouse: async (warehouseId: number): Promise<StockAdjustmentDto[]> => {
        const res = await apiClient.get<{ data?: StockAdjustmentDto[] }>(`${_api}/warehouse/${warehouseId}`);
        return (res.data as any)?.data ?? [];
    },
    createCount: async (
        warehouseId: number,
        countType: string,
        countDate?: string,
        userId?: number
    ): Promise<StockAdjustmentDto | null> => {
        const params = new URLSearchParams({ warehouseId: String(warehouseId), countType });
        if (countDate) params.append('countDate', countDate);
        if (userId) params.append('userId', String(userId));
        const res = await apiClient.post<{ data?: StockAdjustmentDto }>(`${_api}/count?${params}`);
        return (res.data as any)?.data ?? null;
    },
    updateCountItems: async (
        id: number,
        items: StockAdjustmentItemDto[],
        userId?: number
    ): Promise<StockAdjustmentDto | null> => {
        const url = userId != null ? `${_api}/${id}/items?userId=${userId}` : `${_api}/${id}/items`;
        const res = await apiClient.put<{ data?: StockAdjustmentDto }>(url, items);
        return (res.data as any)?.data ?? null;
    },
    approve: async (id: number, userId?: number): Promise<StockAdjustmentDto | null> => {
        const url = userId != null ? `${_api}/${id}/approve?userId=${userId}` : `${_api}/${id}/approve`;
        const res = await apiClient.post<{ data?: StockAdjustmentDto }>(url);
        return (res.data as any)?.data ?? null;
    },
    getVarianceReport: async (): Promise<StockAdjustmentDto[]> => {
        const res = await apiClient.get<{ data?: StockAdjustmentDto[] }>(`${_api}/variance-report`);
        return (res.data as any)?.data ?? [];
    },
};

export default stockAdjustmentService;
