import apiClient from './apiClient';

// Basic API Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface StockBalanceDto {
    id?: number;
    itemId: number;
    itemCode?: string;
    grade?: string;
    itemNameAr?: string;
    warehouseId: number;
    warehouseNameAr?: string;
    quantityOnHand: number;
    quantityReserved: number;
    availableQty?: number;
    averageCost: number;
    lastMovementDate?: string;
}

export const stockBalanceService = {
    getAllBalances: async () => {
        const response = await apiClient.get<ApiResponse<StockBalanceDto[]>>('/inventory/stocks');
        return response.data;
    },

    /** أرصدة المخزن (أصناف ذات رصيد > 0 فقط) - للقوائم المنسدلة في التحويل */
    getBalancesByWarehouse: async (warehouseId: number): Promise<StockBalanceDto[]> => {
        const response = await apiClient.get<ApiResponse<StockBalanceDto[]>>(`/inventory/stocks?warehouseId=${warehouseId}`);
        return (response.data as any)?.data ?? [];
    },

    getBalanceById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<StockBalanceDto>>(`/inventory/stocks/${id}`);
        return response.data;
    },

    createBalance: async (dto: StockBalanceDto) => {
        const response = await apiClient.post<ApiResponse<StockBalanceDto>>('/inventory/stocks', dto);
        return response.data;
    },

    updateBalance: async (id: number, dto: StockBalanceDto) => {
        const response = await apiClient.put<ApiResponse<StockBalanceDto>>(`/inventory/stocks/${id}`, dto);
        return response.data;
    },

    deleteBalance: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<void>>(`/inventory/stocks/${id}`);
        return response.data;
    },

    getPeriodicReport: async (month: number, year: number, warehouseId?: number): Promise<PeriodicReportRow[]> => {
        const params = new URLSearchParams({ month: String(month), year: String(year) });
        if (warehouseId) params.append('warehouseId', String(warehouseId));
        const response = await apiClient.get<ApiResponse<PeriodicReportRow[]>>(`/inventory/stocks/reports/periodic?${params}`);
        return (response.data as any)?.data ?? [];
    }
};

export interface PeriodicReportRow {
    itemId: number;
    itemCode?: string;
    itemNameAr?: string;
    grade?: string;
    warehouseId: number;
    warehouseNameAr?: string;
    openingQty: number;
    additionsQty: number;
    issuesQty: number;
    closingQty: number;
    averageCost: number;
    openingValue: number;
    additionsValue: number;
    issuesValue: number;
    closingValue: number;
    minStockLevel?: number;
}

export default stockBalanceService;
