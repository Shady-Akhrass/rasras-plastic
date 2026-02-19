import apiClient from './apiClient';

/**
 * عرض سعر للعميل (Sales Quotation)
 * API: GET/POST /sales/quotations, GET /sales/quotations/:id
 */

export interface SalesQuotationItemDto {
    id?: number;
    salesQuotationId?: number;
    itemId: number;
    itemCode?: string;
    itemNameAr?: string;
    itemNameEn?: string;
    description?: string;
    quantity: number;
    unitId: number;
    unitNameAr?: string;
    unitPrice: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxPercentage?: number;
    taxAmount?: number;
    totalPrice: number;
    notes?: string;
}

export interface SalesQuotationDto {
    id?: number;
    quotationNumber?: string;
    quotationDate: string;
    validUntilDate?: string;
    customerId: number;
    customerNameAr?: string;
    customerCode?: string;
    contactId?: number;
    salesRepId?: number;
    currency?: string;
    exchangeRate?: number;
    priceListId?: number;
    priceListName?: string;
    subTotal?: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxAmount?: number;
    totalAmount?: number;
    paymentTerms?: string;
    deliveryTerms?: string;
    status?: string;
    approvalStatus?: string;
    sentDate?: string;
    acceptedDate?: string;
    rejectedReason?: string;
    notes?: string;
    termsAndConditions?: string;
    createdAt?: string;
    createdBy?: number;
    updatedAt?: string;
    updatedBy?: number;
    requestId?: number;
    deliveryCost?: number;
    otherCosts?: number;
    items: SalesQuotationItemDto[];
}

const _api = '/sales/quotations';

// Legacy interface for backward compatibility with existing pages
export interface LegacySalesQuotationItemDto {
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

export interface LegacySalesQuotationDto {
    id?: number;
    quotationNumber?: string;
    quotationDate: string;
    validUntil?: string;
    customerId: number;
    customerNameAr?: string;
    customerNameEn?: string;
    priceListId?: number;
    priceListName?: string;
    currency?: string;
    exchangeRate?: number;
    paymentTerms?: string;
    deliveryDays?: number;
    subTotal?: number;
    discountPercent?: number;
    discountAmount?: number;
    taxPercent?: number;
    taxAmount?: number;
    totalAmount?: number;
    status?: string;
    notes?: string;
    requestId?: number;
    deliveryCost?: number;
    otherCosts?: number;
    approvalStatus?: string;
    items: LegacySalesQuotationItemDto[];
}

// Mapping functions
const mapToLegacyItem = (item: SalesQuotationItemDto): LegacySalesQuotationItemDto => ({
    itemId: item.itemId,
    itemNameAr: item.itemNameAr,
    itemCode: item.itemCode,
    qty: item.quantity,
    unitId: item.unitId,
    unitNameAr: item.unitNameAr,
    unitPrice: item.unitPrice,
    discountPercent: item.discountPercentage,
    total: item.totalPrice,
});

const mapFromLegacyItem = (item: LegacySalesQuotationItemDto): SalesQuotationItemDto => ({
    itemId: item.itemId,
    itemNameAr: item.itemNameAr,
    itemCode: item.itemCode,
    quantity: item.qty,
    unitId: item.unitId,
    unitNameAr: item.unitNameAr,
    unitPrice: item.unitPrice,
    discountPercentage: item.discountPercent,
    discountAmount: 0,
    taxPercentage: 0,
    taxAmount: 0,
    totalPrice: item.total || (item.qty * item.unitPrice * (1 - (item.discountPercent || 0) / 100)),
});

const mapToLegacy = (dto: SalesQuotationDto): LegacySalesQuotationDto => ({
    id: dto.id,
    quotationNumber: dto.quotationNumber,
    quotationDate: dto.quotationDate,
    validUntil: dto.validUntilDate,
    customerId: dto.customerId,
    customerNameAr: dto.customerNameAr,
    customerNameEn: undefined,
    priceListId: dto.priceListId,
    priceListName: dto.priceListName,
    currency: dto.currency,
    exchangeRate: dto.exchangeRate,
    paymentTerms: dto.paymentTerms,
    deliveryDays: undefined,
    subTotal: dto.subTotal,
    discountPercent: dto.discountPercentage,
    discountAmount: dto.discountAmount,
    taxPercent: undefined,
    taxAmount: dto.taxAmount,
    totalAmount: dto.totalAmount,
    status: dto.status,
    notes: dto.notes,
    requestId: dto.requestId,
    deliveryCost: dto.deliveryCost,
    otherCosts: dto.otherCosts,
    approvalStatus: dto.approvalStatus,
    items: dto.items.map(mapToLegacyItem),
});

const mapFromLegacy = (dto: LegacySalesQuotationDto): SalesQuotationDto => ({
    id: dto.id,
    quotationNumber: dto.quotationNumber,
    quotationDate: dto.quotationDate,
    validUntilDate: dto.validUntil,
    customerId: dto.customerId,
    customerNameAr: dto.customerNameAr,
    customerCode: undefined,
    contactId: undefined,
    salesRepId: undefined,
    currency: dto.currency,
    exchangeRate: dto.exchangeRate,
    priceListId: dto.priceListId,
    priceListName: dto.priceListName,
    subTotal: dto.subTotal,
    discountPercentage: dto.discountPercent,
    discountAmount: dto.discountAmount,
    taxAmount: dto.taxAmount,
    totalAmount: dto.totalAmount,
    paymentTerms: dto.paymentTerms,
    deliveryTerms: undefined,
    status: dto.status,
    notes: dto.notes,
    requestId: (dto as any).requestId,
    deliveryCost: (dto as any).deliveryCost,
    otherCosts: (dto as any).otherCosts,
    approvalStatus: (dto as any).approvalStatus,
    items: dto.items.map(mapFromLegacyItem),
});

export const salesQuotationService = {
    getAll: async (): Promise<SalesQuotationDto[]> => {
        try {
            const res = await apiClient.get<{ data?: SalesQuotationDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },
    getById: async (id: number): Promise<SalesQuotationDto | null> => {
        try {
            const res = await apiClient.get<{ data?: SalesQuotationDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    create: async (dto: SalesQuotationDto | LegacySalesQuotationDto): Promise<SalesQuotationDto | null> => {
        const payload = 'qty' in (dto.items?.[0] || {}) ? mapFromLegacy(dto as LegacySalesQuotationDto) : dto as SalesQuotationDto;
        const res = await apiClient.post<{ data?: SalesQuotationDto }>(_api, payload);
        return (res.data as any)?.data ?? null;
    },
    update: async (id: number, dto: SalesQuotationDto | LegacySalesQuotationDto): Promise<SalesQuotationDto | null> => {
        try {
            const payload = 'qty' in (dto.items?.[0] || {}) ? mapFromLegacy(dto as LegacySalesQuotationDto) : dto as SalesQuotationDto;
            const res = await apiClient.put<{ data?: SalesQuotationDto }>(`${_api}/${id}`, payload);
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
    convertToSalesOrder: async (id: number): Promise<SalesQuotationDto | null> => {
        try {
            const res = await apiClient.post<{ data?: SalesQuotationDto }>(`${_api}/${id}/convert-to-order`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    submitForApproval: async (id: number): Promise<SalesQuotationDto | null> => {
        try {
            const res = await apiClient.post<{ data?: SalesQuotationDto }>(`${_api}/${id}/submit`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    // Legacy methods that return legacy format
    getAllLegacy: async (): Promise<LegacySalesQuotationDto[]> => {
        const dtos = await salesQuotationService.getAll();
        return dtos.map(mapToLegacy);
    },
    getByIdLegacy: async (id: number): Promise<LegacySalesQuotationDto | null> => {
        const dto = await salesQuotationService.getById(id);
        return dto ? mapToLegacy(dto) : null;
    },
};
