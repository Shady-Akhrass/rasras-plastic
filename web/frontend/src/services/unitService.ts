import apiClient from './apiClient';

export interface UnitDto {
    id?: number;
    unitCode: string;
    unitNameAr: string;
    unitNameEn: string;
    isBaseUnit: boolean;
    baseUnitId?: number;
    baseUnitName?: string;
    conversionFactor: number;
    isActive: boolean;
}

export const unitService = {
    getAllUnits: async () => {
        const response = await apiClient.get<{ data: UnitDto[] }>('/units');
        return response.data;
    },

    getUnitById: async (id: number) => {
        const response = await apiClient.get<{ data: UnitDto }>(`/units/${id}`);
        return response.data;
    },

    createUnit: async (unit: UnitDto) => {
        const response = await apiClient.post<{ data: UnitDto }>('/units', unit);
        return response.data;
    },

    updateUnit: async (id: number, unit: UnitDto) => {
        const response = await apiClient.put<{ data: UnitDto }>(`/units/${id}`, unit);
        return response.data;
    },

    deleteUnit: async (id: number) => {
        const response = await apiClient.delete<{ success: boolean }>(`/units/${id}`);
        return response.data;
    }
};
