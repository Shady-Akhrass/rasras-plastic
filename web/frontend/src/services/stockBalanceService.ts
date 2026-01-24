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
    }
};

export default stockBalanceService;
