import apiClient from './apiClient';

const API_URL = '/inventory';

export interface QualityParameterDto {
    id?: number;
    parameterCode: string;
    parameterNameAr: string;
    parameterNameEn?: string;
    unit?: string;
    dataType: string;
    description?: string;
    standardValue?: number;
    minValue?: number;
    maxValue?: number;
    isActive: boolean;
    createdAt?: string;
}

export interface ItemQualitySpecDto {
    id?: number;
    itemId: number;
    parameterId: number;
    parameterNameAr?: string;
    parameterNameEn?: string;
    unit?: string;
    dataType?: string;
    targetValue?: number;
    minValue?: number;
    maxValue?: number;
    isRequired: boolean;
}

export const qualityService = {
    // Parameters
    getAllParameters: () => apiClient.get<QualityParameterDto[]>(`${API_URL}/quality-parameters`),
    getActiveParameters: () => apiClient.get<QualityParameterDto[]>(`${API_URL}/quality-parameters/active`),
    createParameter: (data: QualityParameterDto) => apiClient.post<QualityParameterDto>(`${API_URL}/quality-parameters`, data),
    updateParameter: (id: number, data: QualityParameterDto) => apiClient.put<QualityParameterDto>(`${API_URL}/quality-parameters/${id}`, data),
    deleteParameter: (id: number) => apiClient.delete(`${API_URL}/quality-parameters/${id}`),

    // Specs
    getSpecsByItem: (itemId: number) => apiClient.get<ItemQualitySpecDto[]>(`${API_URL}/item-quality-specs/item/${itemId}`),
    createSpec: (data: ItemQualitySpecDto) => apiClient.post<ItemQualitySpecDto>(`${API_URL}/item-quality-specs`, data),
    updateSpec: (id: number, data: ItemQualitySpecDto) => apiClient.put<ItemQualitySpecDto>(`${API_URL}/item-quality-specs/${id}`, data),
    deleteSpec: (id: number) => apiClient.delete(`${API_URL}/item-quality-specs/${id}`),

    // Inspections
    recordInspection: (grnId: number, data: any) => apiClient.post(`${API_URL}/quality-inspection/${grnId}`, data),
};
