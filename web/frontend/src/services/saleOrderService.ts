import apiClient from './apiClient';

/**
 * أمر بيع (Sale Order / SO)
 * API متوقع: GET/POST /sales/orders, GET /sales/orders/:id
 * عند 404 يُرجع [] أو null — الواجهة جاهزة للربط لاحقاً.
 */

export interface SaleOrderItemDto {
    itemId: number;
    itemNameAr?: string;
    itemCode?: string;
    qty: number;
    unitId: number;
    unitNameAr?: string;
    unitPrice: number;
    discountPercent?: number;
    total?: number;
}

export interface SaleOrderDto {
    id?: number;
    orderNumber?: string;
    orderDate: string;
    quotationId?: number;
    quotationNumber?: string;
    customerId: number;
    customerNameAr?: string;
    customerNameEn?: string;
    deliveryDate?: string;
    paymentTerms?: string;
    currency?: string;
    exchangeRate?: number;
    subTotal?: number;
    discountPercent?: number;
    discountAmount?: number;
    taxPercent?: number;
    taxAmount?: number;
    totalAmount?: number;
    status?: string;
    notes?: string;
    items: SaleOrderItemDto[];
}

const _api = '/sales/orders';

export const saleOrderService = {
    getAll: async (): Promise<SaleOrderDto[]> => {
        try {
            const res = await apiClient.get<{ data?: SaleOrderDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },
    getById: async (id: number): Promise<SaleOrderDto | null> => {
        try {
            const res = await apiClient.get<{ data?: SaleOrderDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    create: async (dto: SaleOrderDto): Promise<SaleOrderDto | null> => {
        const res = await apiClient.post<{ data?: SaleOrderDto }>(_api, dto);
        return (res.data as any)?.data ?? null;
    },
    update: async (id: number, dto: SaleOrderDto): Promise<SaleOrderDto | null> => {
        try {
            const res = await apiClient.put<{ data?: SaleOrderDto }>(`${_api}/${id}`, dto);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
};
