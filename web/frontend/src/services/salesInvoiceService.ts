import apiClient from './apiClient';

/**
 * فاتورة المبيعات (Sales Invoice)
 * API متوقع: GET/POST /sales/invoices, GET /sales/invoices/:id
 * تُنشأ من إذن الصرف أو أمر البيع.
 */

export interface SalesInvoiceItemDto {
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

export interface SalesInvoiceDto {
    id?: number;
    invoiceNumber?: string;
    invoiceDate: string;
    saleOrderId?: number;
    saleOrderNumber?: string;
    materialIssueId?: number;
    materialIssueNumber?: string;
    customerId: number;
    customerNameAr?: string;
    customerNameEn?: string;
    dueDate?: string;
    paymentTerms?: string;
    currency?: string;
    exchangeRate?: number;
    subTotal?: number;
    discountPercent?: number;
    discountAmount?: number;
    taxPercent?: number;
    taxAmount?: number;
    totalAmount?: number;
    paidAmount?: number;
    balanceAmount?: number;
    status?: string;
    notes?: string;
    items: SalesInvoiceItemDto[];
}

const _api = '/sales/invoices';

export const salesInvoiceService = {
    getAll: async (): Promise<SalesInvoiceDto[]> => {
        try {
            const res = await apiClient.get<{ data?: SalesInvoiceDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },
    getById: async (id: number): Promise<SalesInvoiceDto | null> => {
        try {
            const res = await apiClient.get<{ data?: SalesInvoiceDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    create: async (dto: SalesInvoiceDto): Promise<SalesInvoiceDto | null> => {
        const res = await apiClient.post<{ data?: SalesInvoiceDto }>(_api, dto);
        return (res.data as any)?.data ?? null;
    },
};
