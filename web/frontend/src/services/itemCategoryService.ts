import apiClient from './apiClient';

export interface ItemCategoryDto {
    id?: number;
    categoryCode: string;
    categoryNameAr: string;
    categoryNameEn: string;
    parentCategoryId?: number;
    parentCategoryName?: string;
    description?: string;
    isActive: boolean;
    createdAt?: string;
}

export const itemCategoryService = {
    getAllCategories: async () => {
        const response = await apiClient.get<{ data: ItemCategoryDto[] }>('/inventory/categories');
        return response.data;
    },

    getActiveCategories: async () => {
        const response = await apiClient.get<{ data: ItemCategoryDto[] }>('/inventory/categories/active');
        return response.data;
    },

    getCategoryById: async (id: number) => {
        const response = await apiClient.get<{ data: ItemCategoryDto }>(`/inventory/categories/${id}`);
        return response.data;
    },

    createCategory: async (category: ItemCategoryDto) => {
        const response = await apiClient.post<{ data: ItemCategoryDto }>('/inventory/categories', category);
        return response.data;
    },

    updateCategory: async (id: number, category: ItemCategoryDto) => {
        const response = await apiClient.put<{ data: ItemCategoryDto }>(`/inventory/categories/${id}`, category);
        return response.data;
    },

    deleteCategory: async (id: number) => {
        const response = await apiClient.delete<{ success: boolean }>(`/inventory/categories/${id}`);
        return response.data;
    }
};
