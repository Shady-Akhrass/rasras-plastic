import apiClient from './apiClient';

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
    deliveryCost?: number;
    isCostOnCustomer?: boolean;
    status?: string;
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
    items?: DeliveryOrderItemDto[];
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

    createFromIssueNote: async (issueNoteId: number, createdByUserId?: number): Promise<DeliveryOrderDto | null> => {
        try {
            const params = createdByUserId != null ? `?createdByUserId=${createdByUserId}` : '';
            const res = await apiClient.post<{ data?: DeliveryOrderDto }>(`${_api}/from-issue-note/${issueNoteId}${params}`);
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
};
