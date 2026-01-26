import apiClient from './apiClient';

/**
 * عرض سعر للعميل (Sales Quotation)
 * API متوقع: GET/POST /sales/quotations, GET /sales/quotations/:id
 * عند 404 يُرجع [] أو null — الواجهة جاهزة للربط لاحقاً.
 */

export interface SalesQuotationItemDto {
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

export interface SalesQuotationDto {
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
    items: SalesQuotationItemDto[];
}

const _api = '/sales/quotations';

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
    create: async (dto: SalesQuotationDto): Promise<SalesQuotationDto | null> => {
        const res = await apiClient.post<{ data?: SalesQuotationDto }>(_api, dto);
        return (res.data as any)?.data ?? null;
    },
    update: async (id: number, dto: SalesQuotationDto): Promise<SalesQuotationDto | null> => {
        try {
            const res = await apiClient.put<{ data?: SalesQuotationDto }>(`${_api}/${id}`, dto);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
};
