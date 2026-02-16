import axiosInstance from './apiClient';

export interface WarehouseLocationDto {
    id?: number;
    warehouseId: number;
    locationCode: string;
    locationName?: string;
    locationNameAr?: string;
    row?: string;
    shelf?: string;
    bin?: string;
    isActive: boolean;
}

export interface WarehouseDto {
    id?: number;
    warehouseCode: string;
    warehouseNameAr: string;
    warehouseNameEn?: string;
    warehouseType: string;
    address?: string;
    managerId?: number;
    managerName?: string;
    managerDepartmentName?: string;
    phone?: string;
    isActive: boolean;
    createdAt?: string;
    locations?: WarehouseLocationDto[];
}

const warehouseService = {
    getAll: async () => {
        const response = await axiosInstance.get('/inventory/warehouses');
        return response.data;
    },

    getActive: async () => {
        const response = await axiosInstance.get('/inventory/warehouses/active');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await axiosInstance.get(`/inventory/warehouses/${id}`);
        return response.data;
    },

    create: async (data: WarehouseDto) => {
        const response = await axiosInstance.post('/inventory/warehouses', data);
        return response.data;
    },

    update: async (id: number, data: WarehouseDto) => {
        const response = await axiosInstance.put(`/inventory/warehouses/${id}`, data);
        return response.data;
    },

    addLocation: async (data: WarehouseLocationDto) => {
        const response = await axiosInstance.post('/inventory/warehouses/locations', data);
        return response.data;
    },

    updateLocation: async (id: number, data: WarehouseLocationDto) => {
        const response = await axiosInstance.put(`/inventory/warehouses/locations/${id}`, data);
        return response.data;
    },

    getLocations: async (warehouseId: number) => {
        const response = await axiosInstance.get(`/inventory/warehouses/${warehouseId}/locations`);
        return response.data;
    }
};

export default warehouseService;
