import apiClient from './apiClient';
import { vehicleService, type VehicleDto } from './vehicleService';

/**
 * أمر التوصيل (Delivery Order)
 * API: /sales/delivery-orders
 * مرتبط بإذن الصرف (Stock Issue Note)
 */

export interface DeliveryOrderItemDto {
    itemId: number;
    itemNameAr?: string;
    itemCode?: string;
    qty: number;
    unitId: number;
    unitNameAr?: string;
    unitPrice?: number;
    discountPercentage?: number;
    taxAmount?: number;
    totalPrice?: number;
    notes?: string;
}

export interface DeliveryOrderDto {
    id?: number;
    deliveryOrderNumber?: string;
    orderDate?: string;
    issueNoteId: number;
    issueNoteNumber?: string;
    customerId?: number;
    customerNameAr?: string;
    customerCode?: string;
    deliveryAddress?: string;
    zoneId?: number;
    deliveryType?: string;
    vehicleId?: number;
    contractorId?: number;
    driverName?: string;
    driverPhone?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    actualDeliveryDate?: string;
    subTotal?: number;
    discountAmount?: number;
    taxAmount?: number;
    deliveryCost?: number;
    otherCosts?: number;
    totalAmount?: number;
    isCostOnCustomer?: boolean;
    status?: string;
    approvalStatus?: string;
    receiverName?: string;
    receiverPhone?: string;
    receiverSignature?: string;
    podAttachmentPath?: string;
    notes?: string;
    createdAt?: string;
    createdBy?: number;
    updatedAt?: string;
    updatedBy?: number;
    /** للتوافق مع الصفحات القديمة */
    deliveryDate?: string;
    saleOrderId?: number;
    saleOrderNumber?: string;
    deliveryPlace?: string;
    vehicleNo?: string;
    scheduleId?: number;
    selectedScheduleIds?: number[];
    items?: DeliveryOrderItemDto[];
    vehicles?: VehicleDto[];
}

const _api = '/sales/delivery-orders';

export const deliveryOrderService = {
    getAll: async (): Promise<DeliveryOrderDto[]> => {
        try {
            const res = await apiClient.get<{ data?: DeliveryOrderDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },

    getById: async (id: number): Promise<DeliveryOrderDto | null> => {
        try {
            const res = await apiClient.get<{ data?: DeliveryOrderDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    getByIssueNoteId: async (issueNoteId: number): Promise<DeliveryOrderDto[]> => {
        try {
            const res = await apiClient.get<{ data?: DeliveryOrderDto[] }>(`${_api}/by-issue-note/${issueNoteId}`);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },

    createFromIssueNote: async (issueNoteId: number, scheduleId?: number, createdByUserId?: number): Promise<DeliveryOrderDto | null> => {
        try {
            const params = new URLSearchParams();
            if (scheduleId != null) params.append('scheduleId', scheduleId.toString());
            if (createdByUserId != null) params.append('createdByUserId', createdByUserId.toString());
            const qs = params.toString() ? `?${params.toString()}` : '';
            const res = await apiClient.post<{ data?: DeliveryOrderDto }>(`${_api}/from-issue-note/${issueNoteId}${qs}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    create: async (dto: DeliveryOrderDto): Promise<DeliveryOrderDto | null> => {
        try {
            const res = await apiClient.post<{ data?: DeliveryOrderDto }>(_api, dto);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    update: async (id: number, dto: DeliveryOrderDto): Promise<DeliveryOrderDto | null> => {
        try {
            const res = await apiClient.put<{ data?: DeliveryOrderDto }>(`${_api}/${id}`, dto);
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
    submitForApproval: async (id: number): Promise<DeliveryOrderDto | null> => {
        try {
            const res = await apiClient.post<{ data?: DeliveryOrderDto }>(`${_api}/${id}/submit`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    getActiveVehicles: async (): Promise<VehicleDto[]> => {
        try {
            return await vehicleService.getActive();
        } catch {
            return [];
        }
    },
};
