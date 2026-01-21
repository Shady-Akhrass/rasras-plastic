import apiClient from './apiClient';

export interface User {
    userId: number;
    username: string;
    employeeId: number;
    roleId: number;
    roleName: string;
    isActive: boolean;
    isLocked: boolean;
    lastLoginAt: string | null;
}

export interface Role {
    roleId: number;
    roleCode: string;
    roleNameAr: string;
    roleNameEn: string;
}

const userService = {
    getAll: async (page = 0, size = 20) => {
        const response = await apiClient.get(`/users?page=${page}&size=${size}`);
        return response.data.data;
    },
    getById: async (id: number) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data.data;
    },
    create: async (data: any) => {
        const response = await apiClient.post('/users', data);
        return response.data.data;
    },
    update: async (id: number, data: any) => {
        const response = await apiClient.put(`/users/${id}`, data);
        return response.data.data;
    },
    delete: async (id: number) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    },
    resetPassword: async (id: number, newPassword: string) => {
        const response = await apiClient.post(`/users/${id}/reset-password`, newPassword);
        return response.data;
    },
    getRoles: async () => {
        const response = await apiClient.get('/users/roles');
        return response.data.data;
    },
};

export default userService;
