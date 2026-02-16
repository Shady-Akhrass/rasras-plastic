import apiClient from './apiClient';
import type { ApiResponse } from '../types/common';
import type { CustomerRequest } from '../types/sales';

export const customerRequestService = {
    getAllRequests: async (): Promise<ApiResponse<CustomerRequest[]>> => {
        const response = await apiClient.get<ApiResponse<CustomerRequest[]>>('/sales/customer-requests');
        return response.data;
    },

    getRequestById: async (id: number): Promise<ApiResponse<CustomerRequest>> => {
        const response = await apiClient.get<ApiResponse<CustomerRequest>>(`/sales/customer-requests/${id}`);
        return response.data;
    },

    createRequest: async (data: Partial<CustomerRequest>): Promise<ApiResponse<CustomerRequest>> => {
        const response = await apiClient.post<ApiResponse<CustomerRequest>>('/sales/customer-requests', data);
        return response.data;
    },

    updateRequest: async (id: number, data: Partial<CustomerRequest>): Promise<ApiResponse<CustomerRequest>> => {
        const response = await apiClient.put<ApiResponse<CustomerRequest>>(`/sales/customer-requests/${id}`, data);
        return response.data;
    },

    deleteRequest: async (id: number): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete<ApiResponse<void>>(`/sales/customer-requests/${id}`);
        return response.data;
    },

    approveRequest: async (id: number): Promise<ApiResponse<CustomerRequest>> => {
        const response = await apiClient.post<ApiResponse<CustomerRequest>>(`/sales/customer-requests/${id}/approve`);
        return response.data;
    },

    rejectRequest: async (id: number, reason: string): Promise<ApiResponse<CustomerRequest>> => {
        const response = await apiClient.post<ApiResponse<CustomerRequest>>(`/sales/customer-requests/${id}/reject`, { reason });
        return response.data;
    }
};
