import apiClient from './apiClient';
import type { GoodsReceiptNoteDto } from './grnService';

export interface SupplierInvoiceDto {
    id?: number;
    invoiceNumber: string;
    supplierInvoiceNo: string;
    invoiceDate: string;
    dueDate: string;
    poId?: number;
    poNumber?: string;
    grnId?: number;
    grnNumber?: string;
    quotationId?: number;
    supplierId: number;
    supplierNameAr?: string;
    currency: string;
    exchangeRate?: number;
    subTotal: number;
    discountAmount?: number;
    taxAmount?: number;
    deliveryCost?: number;
    otherCosts?: number;
    totalAmount: number;
    paidAmount?: number;
    remainingAmount?: number;
    status: string;
    approvalStatus?: string;
    paymentTerms?: string;
    notes?: string;
    items?: SupplierInvoiceItemDto[];
}

export interface SupplierInvoiceItemDto {
    id?: number;
    itemId: number;
    itemNameAr?: string;
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
    grnItemId?: number;
}

export const supplierInvoiceService = {
    getAllInvoices: async () => {
        const response = await apiClient.get<{ data: SupplierInvoiceDto[] }>('/suppliers/invoices');
        return response.data;
    },

    getInvoiceById: async (id: number) => {
        const response = await apiClient.get<{ data: SupplierInvoiceDto }>(`/suppliers/invoices/${id}`);
        return response.data;
    },

    createInvoice: async (invoice: SupplierInvoiceDto) => {
        const response = await apiClient.post<{ data: SupplierInvoiceDto }>('/suppliers/invoices', invoice);
        return response.data;
    },

    approvePayment: async (id: number, userId: number, approved: boolean) => {
        const response = await apiClient.post<{ data: SupplierInvoiceDto }>(`/suppliers/invoices/${id}/approve-payment`, null, {
            params: { userId, approved }
        });
        return response.data;
    },

    downloadPdf: async (id: number) => {
        const response = await apiClient.get<Blob>(`/suppliers/invoices/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },

    deleteInvoice: async (id: number) => {
        await apiClient.post(`/suppliers/invoices/${id}/delete`);
    },

    /**
     * توريدات مكتملة بانتظار الفوترة — للاستخدام في صفحة فواتير الموردين (قسم المالية).
     * يستخدم فقط هذا الـ endpoint (محمي بصلاحية SECTION_FINANCE) وليس /inventory/grn.
     */
    getPendingGRNsForInvoicing: async (): Promise<GoodsReceiptNoteDto[]> => {
        const response = await apiClient.get<{ data?: GoodsReceiptNoteDto[] }>('/suppliers/invoices/pending-grns');
        const body = response.data as { data?: GoodsReceiptNoteDto[] } | GoodsReceiptNoteDto[];
        if (Array.isArray(body)) return body;
        return body?.data ?? [];
    },

    /** جلب إذن إضافة بالـ id لملء نموذج فاتورة — نفس الصلاحية */
    getGRNForInvoice: async (grnId: number): Promise<GoodsReceiptNoteDto | null> => {
        const response = await apiClient.get<{ data: GoodsReceiptNoteDto }>(`/suppliers/invoices/grn/${grnId}`);
        return (response.data as { data?: GoodsReceiptNoteDto })?.data ?? null;
    }
};
