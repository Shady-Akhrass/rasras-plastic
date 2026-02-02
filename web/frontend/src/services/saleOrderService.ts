import apiClient from './apiClient';

/**
 * أمر بيع (Sale Order / SO)
 * API: GET/POST /sales/orders, GET /sales/orders/:id
 */

export interface SaleOrderItemDto {
    id?: number;
    salesOrderId?: number;
    itemId: number;
    itemCode?: string;
    itemNameAr?: string;
    itemNameEn?: string;
    description?: string;
    orderedQty: number;
    unitId: number;
    unitNameAr?: string;
    unitPrice: number;
    unitCost?: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxPercentage?: number;
    taxAmount?: number;
    totalPrice: number;
    deliveredQty?: number;
    status?: string;
    warehouseId?: number;
    warehouseName?: string;
    notes?: string;
}

export interface SaleOrderDto {
    id?: number;
    soNumber?: string;
    soDate: string;
    salesQuotationId?: number;
    quotationNumber?: string;
    customerId: number;
    customerNameAr?: string;
    customerCode?: string;
    contactId?: number;
    salesRepId?: number;
    shippingAddress?: string;
    expectedDeliveryDate?: string;
    currency?: string;
    exchangeRate?: number;
    priceListId?: number;
    priceListName?: string;
    subTotal?: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxAmount?: number;
    shippingCost?: number;
    totalAmount?: number;
    paymentTerms?: string;
    paymentTermDays?: number;
    status?: string;
    creditCheckStatus?: string;
    creditCheckBy?: number;
    creditCheckDate?: string;
    approvedByUserId?: number;
    approvedDate?: string;
    notes?: string;
    createdAt?: string;
    createdBy?: number;
    updatedAt?: string;
    updatedBy?: number;
    items: SaleOrderItemDto[];
}

const _api = '/sales/orders';

// Legacy interface for backward compatibility with existing pages
export interface LegacySaleOrderItemDto {
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

export interface LegacySaleOrderDto {
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
    items: LegacySaleOrderItemDto[];
}

// Mapping functions
const mapToLegacyItem = (item: SaleOrderItemDto): LegacySaleOrderItemDto => ({
    itemId: item.itemId,
    itemNameAr: item.itemNameAr,
    itemCode: item.itemCode,
    qty: item.orderedQty,
    unitId: item.unitId,
    unitNameAr: item.unitNameAr,
    unitPrice: item.unitPrice,
    discountPercent: item.discountPercentage,
    total: item.totalPrice,
});

const mapFromLegacyItem = (item: LegacySaleOrderItemDto): SaleOrderItemDto => ({
    itemId: item.itemId,
    itemNameAr: item.itemNameAr,
    itemCode: item.itemCode,
    orderedQty: item.qty,
    unitId: item.unitId,
    unitNameAr: item.unitNameAr,
    unitPrice: item.unitPrice,
    discountPercentage: item.discountPercent,
    discountAmount: 0,
    taxPercentage: 0,
    taxAmount: 0,
    totalPrice: item.total || (item.qty * item.unitPrice * (1 - (item.discountPercent || 0) / 100)),
    deliveredQty: 0,
    status: 'Pending',
});

const mapToLegacy = (dto: SaleOrderDto): LegacySaleOrderDto => ({
    id: dto.id,
    orderNumber: dto.soNumber,
    orderDate: dto.soDate,
    quotationId: dto.salesQuotationId,
    quotationNumber: dto.quotationNumber,
    customerId: dto.customerId,
    customerNameAr: dto.customerNameAr,
    customerNameEn: undefined,
    deliveryDate: dto.expectedDeliveryDate,
    paymentTerms: dto.paymentTerms,
    currency: dto.currency,
    exchangeRate: dto.exchangeRate,
    subTotal: dto.subTotal,
    discountPercent: dto.discountPercentage,
    discountAmount: dto.discountAmount,
    taxPercent: undefined,
    taxAmount: dto.taxAmount,
    totalAmount: dto.totalAmount,
    status: dto.status,
    notes: dto.notes,
    items: dto.items.map(mapToLegacyItem),
});

const mapFromLegacy = (dto: LegacySaleOrderDto): SaleOrderDto => ({
    id: dto.id,
    soNumber: dto.orderNumber,
    soDate: dto.orderDate,
    salesQuotationId: dto.quotationId,
    quotationNumber: dto.quotationNumber,
    customerId: dto.customerId,
    customerNameAr: dto.customerNameAr,
    customerCode: undefined,
    contactId: undefined,
    salesRepId: undefined,
    shippingAddress: undefined,
    expectedDeliveryDate: dto.deliveryDate,
    currency: dto.currency,
    exchangeRate: dto.exchangeRate,
    subTotal: dto.subTotal,
    discountPercentage: dto.discountPercent,
    discountAmount: dto.discountAmount,
    taxAmount: dto.taxAmount,
    shippingCost: 0,
    totalAmount: dto.totalAmount,
    paymentTerms: dto.paymentTerms,
    paymentTermDays: undefined,
    status: dto.status,
    notes: dto.notes,
    items: dto.items.map(mapFromLegacyItem),
});

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
    create: async (dto: SaleOrderDto | LegacySaleOrderDto): Promise<SaleOrderDto | null> => {
        const payload = 'qty' in (dto.items?.[0] || {}) ? mapFromLegacy(dto as LegacySaleOrderDto) : dto as SaleOrderDto;
        const res = await apiClient.post<{ data?: SaleOrderDto }>(_api, payload);
        return (res.data as any)?.data ?? null;
    },
    createFromQuotation: async (quotationId: number): Promise<SaleOrderDto | null> => {
        try {
            const res = await apiClient.post<{ data?: SaleOrderDto }>(`${_api}/from-quotation/${quotationId}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    update: async (id: number, dto: SaleOrderDto | LegacySaleOrderDto): Promise<SaleOrderDto | null> => {
        try {
            const payload = 'qty' in (dto.items?.[0] || {}) ? mapFromLegacy(dto as LegacySaleOrderDto) : dto as SaleOrderDto;
            const res = await apiClient.put<{ data?: SaleOrderDto }>(`${_api}/${id}`, payload);
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
    checkCreditLimit: async (id: number): Promise<SaleOrderDto | null> => {
        try {
            const res = await apiClient.post<{ data?: SaleOrderDto }>(`${_api}/${id}/check-credit`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    // Legacy methods that return legacy format
    getAllLegacy: async (): Promise<LegacySaleOrderDto[]> => {
        const dtos = await saleOrderService.getAll();
        return dtos.map(mapToLegacy);
    },
    getByIdLegacy: async (id: number): Promise<LegacySaleOrderDto | null> => {
        const dto = await saleOrderService.getById(id);
        return dto ? mapToLegacy(dto) : null;
    },
};
