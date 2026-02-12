import apiClient from './apiClient';

export interface StockMovementItemDto {
    date: string;
    type: string;
    qty: number;
    balance: number;
    ref?: string;
}

export interface PageResult<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const stockMovementService = {
    getPaged: async (params: {
        itemId: number;
        warehouseId?: number;
        fromDate?: string;
        toDate?: string;
        page?: number;
        size?: number;
    }): Promise<PageResult<StockMovementItemDto>> => {
        const response = await apiClient.get<{ data: PageResult<StockMovementItemDto> }>('/stock-movements', {
            params,
        });
        const data = (response.data as { data?: PageResult<StockMovementItemDto> })?.data;
        return (
            data || {
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: params.size ?? 50,
                number: params.page ?? 0,
            }
        );
    },

    downloadExcel: async (params: {
        itemId: number;
        warehouseId?: number;
        fromDate?: string;
        toDate?: string;
    }): Promise<Blob> => {
        const response = await apiClient.get('/stock-movements/export', {
            params,
            responseType: 'blob',
        });
        return response.data as Blob;
    },
};
