import apiClient from './apiClient';

export interface SupplierInvoiceDto {
    id?: number;
    invoiceNumber: string;
    supplierInvoiceNo: string;
    invoiceDate: string;
    dueDate: string;
    poId?: number;
    grnId?: number;
    grnNumber?: string;
    supplierId: number;
    supplierNameAr?: string;
    currency: string;
    exchangeRate?: number;
    subTotal: number;
    discountAmount?: number;
    taxAmount?: number;
    deliveryCost?: number;
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
    }
};
