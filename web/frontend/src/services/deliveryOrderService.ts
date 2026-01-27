import apiClient from './apiClient';

/**
 * أمر التوصيل (Delivery Order)
 * API متوقع: GET/POST /sales/delivery-orders, GET /sales/delivery-orders/:id
 * مرتبط بأمر البيع SO.
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
    deliveryDate: string;
    saleOrderId: number;
    saleOrderNumber?: string;
    customerId: number;
    customerNameAr?: string;
    customerNameEn?: string;
    deliveryAddress?: string;
    deliveryPlace?: string;
    driverName?: string;
    vehicleNo?: string;
    status?: string;
    notes?: string;
    items: DeliveryOrderItemDto[];
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
    create: async (dto: DeliveryOrderDto): Promise<DeliveryOrderDto | null> => {
        const res = await apiClient.post<{ data?: DeliveryOrderDto }>(_api, dto);
        return (res.data as any)?.data ?? null;
    },
};
