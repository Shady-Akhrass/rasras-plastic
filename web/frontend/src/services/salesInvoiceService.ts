import apiClient from './apiClient';

/**
 * فاتورة المبيعات (Sales Invoice)
 * API: GET/POST /sales/invoices, GET /sales/invoices/:id
 * تُنشأ من إذن الصرف أو أمر البيع.
 */

export interface SalesInvoiceItemDto {
    id?: number;
    salesInvoiceId?: number;
    issueItemId?: number;
    itemId: number;
    itemCode?: string;
    itemNameAr?: string;
    itemNameEn?: string;
    description?: string;
    quantity: number;
    unitId: number;
    unitNameAr?: string;
    unitPrice: number;
    unitCost?: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxPercentage?: number;
    taxAmount?: number;
    totalPrice: number;
    grossProfit?: number;
}

export interface SalesInvoiceDto {
    id?: number;
    invoiceNumber?: string;
    invoiceDate: string;
    dueDate: string;
    salesOrderId?: number;
    soNumber?: string;
    issueNoteId?: number;
    issueNoteNumber?: string;
    customerId: number;
    customerNameAr?: string;
    customerCode?: string;
    salesRepId?: number;
    currency?: string;
    exchangeRate?: number;
    subTotal?: number;
    discountPercentage?: number;
    discountAmount?: number;
    taxAmount?: number;
    shippingCost?: number;
    totalAmount?: number;
    paidAmount?: number;
    remainingAmount?: number;
    status?: string;
    eInvoiceStatus?: string;
    eInvoiceUUID?: string;
    paymentTerms?: string;
    notes?: string;
    createdAt?: string;
    createdBy?: number;
    updatedAt?: string;
    updatedBy?: number;
    items: SalesInvoiceItemDto[];
}

const _api = '/sales/invoices';

// Legacy interface for backward compatibility with existing pages
export interface LegacySalesInvoiceItemDto {
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

export interface LegacySalesInvoiceDto {
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
    items: LegacySalesInvoiceItemDto[];
}

// Mapping functions
const mapToLegacyItem = (item: SalesInvoiceItemDto): LegacySalesInvoiceItemDto => ({
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

const mapFromLegacyItem = (item: LegacySalesInvoiceItemDto): SalesInvoiceItemDto => ({
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

const mapToLegacy = (dto: SalesInvoiceDto): LegacySalesInvoiceDto => ({
    id: dto.id,
    invoiceNumber: dto.invoiceNumber,
    invoiceDate: dto.invoiceDate,
    saleOrderId: dto.salesOrderId,
    saleOrderNumber: dto.soNumber,
    materialIssueId: dto.issueNoteId,
    materialIssueNumber: dto.issueNoteNumber,
    customerId: dto.customerId,
    customerNameAr: dto.customerNameAr,
    customerNameEn: undefined,
    dueDate: dto.dueDate,
    paymentTerms: dto.paymentTerms,
    currency: dto.currency,
    exchangeRate: dto.exchangeRate,
    subTotal: dto.subTotal,
    discountPercent: dto.discountPercentage,
    discountAmount: dto.discountAmount,
    taxPercent: undefined,
    taxAmount: dto.taxAmount,
    totalAmount: dto.totalAmount,
    paidAmount: dto.paidAmount,
    balanceAmount: dto.remainingAmount,
    status: dto.status,
    notes: dto.notes,
    items: dto.items.map(mapToLegacyItem),
});

const mapFromLegacy = (dto: LegacySalesInvoiceDto): SalesInvoiceDto => ({
    id: dto.id,
    invoiceNumber: dto.invoiceNumber,
    invoiceDate: dto.invoiceDate,
    dueDate: dto.dueDate || new Date().toISOString().split('T')[0],
    salesOrderId: dto.saleOrderId,
    soNumber: dto.saleOrderNumber,
    issueNoteId: dto.materialIssueId,
    issueNoteNumber: dto.materialIssueNumber,
    customerId: dto.customerId,
    customerNameAr: dto.customerNameAr,
    customerCode: undefined,
    salesRepId: undefined,
    currency: dto.currency,
    exchangeRate: dto.exchangeRate,
    subTotal: dto.subTotal,
    discountPercentage: dto.discountPercent,
    discountAmount: dto.discountAmount,
    taxAmount: dto.taxAmount,
    shippingCost: 0,
    totalAmount: dto.totalAmount,
    paidAmount: dto.paidAmount,
    remainingAmount: dto.balanceAmount,
    status: dto.status,
    paymentTerms: dto.paymentTerms,
    notes: dto.notes,
    items: dto.items.map(mapFromLegacyItem),
});

export const salesInvoiceService = {
    getAll: async (): Promise<SalesInvoiceDto[]> => {
        try {
            const res = await apiClient.get<{ data?: SalesInvoiceDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },
    getById: async (id: number): Promise<SalesInvoiceDto | LegacySalesInvoiceDto | null> => {
        try {
            const res = await apiClient.get<{ data?: SalesInvoiceDto }>(`${_api}/${id}`);
            const dto = (res.data as any)?.data ?? null;
            // Return in legacy format for backward compatibility
            return dto ? mapToLegacy(dto) : null;
        } catch {
            return null;
        }
    },
    create: async (dto: SalesInvoiceDto | LegacySalesInvoiceDto): Promise<SalesInvoiceDto | null> => {
        const payload = 'qty' in (dto.items?.[0] || {}) ? mapFromLegacy(dto as LegacySalesInvoiceDto) : dto as SalesInvoiceDto;
        const res = await apiClient.post<{ data?: SalesInvoiceDto }>(_api, payload);
        return (res.data as any)?.data ?? null;
    },
    update: async (id: number, dto: SalesInvoiceDto | LegacySalesInvoiceDto): Promise<SalesInvoiceDto | null> => {
        try {
            const payload = 'qty' in (dto.items?.[0] || {}) ? mapFromLegacy(dto as LegacySalesInvoiceDto) : dto as SalesInvoiceDto;
            const res = await apiClient.put<{ data?: SalesInvoiceDto }>(`${_api}/${id}`, payload);
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
    // Legacy methods that return legacy format
    getAllLegacy: async (): Promise<LegacySalesInvoiceDto[]> => {
        const dtos = await salesInvoiceService.getAll();
        return dtos.map(mapToLegacy);
    },
    getByIdLegacy: async (id: number): Promise<LegacySalesInvoiceDto | null> => {
        const dto = await salesInvoiceService.getById(id);
        return dto ? mapToLegacy(dto) : null;
    },
};
