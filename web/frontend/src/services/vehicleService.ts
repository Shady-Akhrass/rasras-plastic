import apiClient from './apiClient';

/**
 * مركبات التوصيل (Delivery Vehicles)
 * API: /sales/vehicles
 */

export interface VehicleDto {
    id?: number;
    vehicleCode?: string;
    plateNumber?: string;
    vehicleType?: string;
    brand?: string;
    model?: string;
    year?: number;
    capacity?: number;
    ownershipType?: string;
    driverId?: number;
    driverName?: string;
    driverPhone?: string;
    licenseExpiry?: string;
    insuranceExpiry?: string;
    isActive?: boolean;
    notes?: string;
    createdAt?: string;
    createdBy?: number;
    updatedAt?: string;
    updatedBy?: number;
}

const _api = '/sales/vehicles';

export const vehicleService = {
    getAll: async (): Promise<VehicleDto[]> => {
        try {
            const res = await apiClient.get<{ data?: VehicleDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },

    getActive: async (): Promise<VehicleDto[]> => {
        try {
            const res = await apiClient.get<{ data?: VehicleDto[] }>(`${_api}/active`);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },

    getById: async (id: number): Promise<VehicleDto | null> => {
        try {
            const res = await apiClient.get<{ data?: VehicleDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    create: async (dto: VehicleDto): Promise<VehicleDto | null> => {
        try {
            const res = await apiClient.post<{ data?: VehicleDto }>(_api, dto);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    update: async (id: number, dto: VehicleDto): Promise<VehicleDto | null> => {
        try {
            const res = await apiClient.put<{ data?: VehicleDto }>(`${_api}/${id}`, dto);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    delete: async (id: number): Promise<boolean> => {
        try {
            await apiClient.delete(`${_api}/${id}`);
            return true;
        } catch {
            return false;
        }
    },
};
