import apiClient from './apiClient';

export interface ItemDto {
    id?: number;
    itemCode: string;
    itemNameAr: string;
    itemNameEn?: string;
    gradeName?: string;
    categoryId: number;
    categoryName?: string;
    unitId: number;
    unitName?: string;
    barcode?: string;
    description?: string;
    technicalSpecs?: string;
    minStockLevel?: number;
    maxStockLevel?: number;
    reorderLevel?: number;
    avgMonthlyConsumption?: number;
    standardCost?: number;
    lastPurchasePrice?: number;
    replacementPrice?: number;
    lastSalePrice?: number;
    defaultVatRate?: number;
    imagePath?: string;
    isActive: boolean;
    isSellable: boolean;
    isPurchasable: boolean;
    currentStock?: number;
    itemType?: string;
    createdAt?: string;
}

export const itemService = {
    getAllItems: async () => {
        const response = await apiClient.get<{ data: ItemDto[] }>('/inventory/items');
        return response.data;
    },

    getActiveItems: async () => {
        const response = await apiClient.get<{ data: ItemDto[] }>('/inventory/items/active');
        return response.data;
    },

    getItemById: async (id: number) => {
        const response = await apiClient.get<{ data: ItemDto }>(`/inventory/items/${id}`);
        return response.data;
    },

    createItem: async (item: ItemDto) => {
        const response = await apiClient.post<{ data: ItemDto }>('/inventory/items', item);
        return response.data;
    },

    updateItem: async (id: number, item: ItemDto) => {
        const response = await apiClient.put<{ data: ItemDto }>(`/inventory/items/${id}`, item);
        return response.data;
    },

    deleteItem: async (id: number) => {
        const response = await apiClient.delete<{ success: boolean }>(`/inventory/items/${id}`);
        return response.data;
    }
};
