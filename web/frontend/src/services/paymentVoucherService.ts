import apiClient from './apiClient';

// Types
export interface PaymentVoucherDto {
    paymentVoucherId?: number;
    voucherNumber: string;
    voucherDate: string;
    supplierId?: number;
    payeeName?: string;
    paymentMethod: 'cash' | 'bank' | 'cheque' | 'bank_transfer';

    cashRegisterId?: number;
    bankAccountId?: number;
    chequeId?: number;
    currency?: string;
    exchangeRate?: number;
    amount: number;
    cashAmount?: number;
    bankAmount?: number;
    chequeAmount?: number;
    bankTransferAmount?: number;
    isSplitPayment?: boolean;
    amountInWords?: string;

    referenceType?: string;
    referenceId?: number;
    description?: string;
    status?: string;
    approvalStatus?: string;
    journalEntryId?: number;
    notes?: string;
    preparedByUserId?: number;
    supplierNameAr?: string;
    supplierNameEn?: string;
    approvedByFinanceManager?: string;
    financeManagerApprovalDate?: string;
    approvedByGeneralManager?: string;
    generalManagerApprovalDate?: string;
    paidBy?: string;
    paidDate?: string;
    allocations?: PaymentVoucherAllocationDto[];
}

export interface PaymentVoucherAllocationDto {
    allocationId?: number;
    paymentVoucherId?: number;
    supplierInvoiceId: number;
    allocatedAmount: number;
    allocationDate?: string;
    notes?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    invoiceTotal?: number;
    invoiceSubTotal?: number;
    invoiceTaxAmount?: number;
    invoiceDiscountAmount?: number;
    invoiceTaxPercentage?: number;
    invoiceDiscountPercentage?: number;
    invoiceDeliveryCost?: number;
    invoiceOtherCosts?: number;
    poNumber?: string;
    poTotal?: number;
    poSubTotal?: number;
    poTaxAmount?: number;
    poDiscountAmount?: number;
    poTaxPercentage?: number;
    poDiscountPercentage?: number;
    poShippingCost?: number;
    poOtherCosts?: number;
    grnNumber?: string;
    grnTotal?: number;
    grnSubTotal?: number;
    grnTaxAmount?: number;
    grnDiscountAmount?: number;
    grnTaxPercentage?: number;
    grnDiscountPercentage?: number;
    grnShippingCost?: number;
    grnOtherCosts?: number;
    variancePercentage?: number;
    isValid?: boolean;
}

export interface InvoiceComparisonData {
    supplierInvoiceId: number;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceTotal: number;
    invoiceSubTotal?: number;
    invoiceTaxAmount?: number;
    invoiceDiscountAmount?: number;
    invoiceTaxPercentage?: number;
    invoiceDiscountPercentage?: number;
    invoiceDeliveryCost?: number;
    invoiceOtherCosts?: number;
    poNumber?: string;
    poTotal?: number;
    poSubTotal?: number;
    poTaxAmount?: number;
    poDiscountAmount?: number;
    poTaxPercentage?: number;
    poDiscountPercentage?: number;
    poShippingCost?: number;
    poOtherCosts?: number;
    grnNumber?: string;
    grnTotal?: number;
    grnSubTotal?: number;
    grnTaxAmount?: number;
    grnDiscountAmount?: number;
    grnTaxPercentage?: number;
    grnDiscountPercentage?: number;
    grnShippingCost?: number;
    grnOtherCosts?: number;
    returnTotal?: number;
    returnSubTotal?: number;
    variancePercentage?: number;
    isValid?: boolean;
    paidAmount?: number;
    remainingAmount?: number;
    currency?: string;
    items?: InvoiceItemComparison[];


}

export interface InvoiceItemComparison {
    itemName: string;
    poQuantity?: number;
    grnQuantity?: number;
    returnedQuantity?: number;
    invoiceQuantity?: number;
    poUnitPrice?: number;
    poDiscountPercentage?: number;
    poTaxPercentage?: number;
    grnUnitPrice?: number;
    returnUnitPrice?: number;
    invoiceUnitPrice?: number;
    poLineTotal?: number;
    grnLineTotal?: number;
    returnLineTotal?: number;
    invoiceLineTotal?: number;
    isMatch?: boolean;
}

export interface SupplierWithInvoices {
    supplierId: number;
    nameAr: string;
    nameEn: string;
    code: string;
    pendingInvoices: InvoiceComparisonData[];
    totalOutstanding: number;
}

export interface GRNDto {
    id?: number;
    grnNumber?: string;
    grnDate?: string;
    poId: number;
    poNumber?: string;
    supplierId: number;
    supplierNameAr?: string;
    totalReceivedQty?: number;
    status?: string;
}

export interface PurchaseOrderDto {
    id?: number;
    poNumber?: string;
    poDate?: string;
    supplierId: number;
    supplierNameAr?: string;
    totalAmount: number;
    status?: string;
}

// Payment Voucher Service
export const paymentVoucherService = {
    // Get all payment vouchers
    getAllVouchers: async (): Promise<PaymentVoucherDto[]> => {
        const response = await apiClient.get<{ data: PaymentVoucherDto[] }>('/finance/payment-vouchers');
        return response.data.data || [];
    },

    // Get payment voucher by ID
    getVoucherById: async (id: number): Promise<PaymentVoucherDto> => {
        const response = await apiClient.get<{ data: PaymentVoucherDto }>(`/finance/payment-vouchers/${id}`);
        return response.data.data;
    },

    // Create payment voucher
    createVoucher: async (voucher: PaymentVoucherDto): Promise<PaymentVoucherDto> => {
        const response = await apiClient.post<{ data: PaymentVoucherDto }>('/finance/payment-vouchers', voucher);
        return response.data.data;
    },

    // Update payment voucher
    updateVoucher: async (id: number, voucher: PaymentVoucherDto): Promise<PaymentVoucherDto> => {
        const response = await apiClient.put<{ data: PaymentVoucherDto }>(`/finance/payment-vouchers/${id}`, voucher);
        return response.data.data;
    },

    // Delete payment voucher
    deleteVoucher: async (id: number): Promise<void> => {
        await apiClient.delete(`/finance/payment-vouchers/${id}`);
    },

    // Get suppliers with pending invoices for payment
    getSuppliersWithPendingInvoices: async (): Promise<SupplierWithInvoices[]> => {
        try {
            const response = await apiClient.get<{ data: SupplierWithInvoices[] }>('/finance/payment-vouchers/suppliers-with-pending-invoices');
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch suppliers with pending invoices:', error);
            return [];
        }
    },

    // Get invoice comparison data for a supplier
    getInvoiceComparison: async (supplierId: number): Promise<InvoiceComparisonData[]> => {
        try {
            const response = await apiClient.get<{ data: InvoiceComparisonData[] }>(`/finance/payment-vouchers/invoice-comparison/${supplierId}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch invoice comparison:', error);
            return [];
        }
    },

    // Get all unpaid invoices (Approved but not paid)
    getUnpaidInvoices: async (): Promise<InvoiceComparisonData[]> => {
        try {
            const response = await apiClient.get<{ data: InvoiceComparisonData[] }>('/finance/payment-vouchers/unpaid-invoices');
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch unpaid invoices:', error);
            return [];
        }
    },

    // Get all GRNs
    getAllGRNs: async (): Promise<GRNDto[]> => {
        try {
            const response = await apiClient.get<{ data: GRNDto[] }>('/inventory/grn');
            return (response.data as { data?: GRNDto[] })?.data ?? [];
        } catch (error) {
            console.error('Failed to fetch GRNs:', error);
            return [];
        }
    },

    // Get all Purchase Orders
    getAllPurchaseOrders: async (): Promise<PurchaseOrderDto[]> => {
        try {
            const response = await apiClient.get<{ data: PurchaseOrderDto[] }>('/procurement/purchase-orders');
            return (response.data as { data?: PurchaseOrderDto[] })?.data ?? [];
        } catch (error) {
            console.error('Failed to fetch purchase orders:', error);
            return [];
        }
    },

    // Calculate variance between PO, GRN, and Invoice totals
    calculateVariance: (poTotal: number, grnTotal: number): number => {
        if (poTotal === 0) return 0;
        const variance = Math.abs((grnTotal - poTotal) / poTotal * 100);
        return variance;
    },

    // Validate invoice matching
    validateInvoiceMatching: (comparison: InvoiceComparisonData): boolean => {
        const { poTotal, grnTotal, invoiceTotal } = comparison;

        if (!poTotal || !grnTotal || !invoiceTotal) return false;

        const variance = Math.abs((grnTotal - poTotal) / poTotal * 100);
        const invoiceVariance = Math.abs((invoiceTotal - grnTotal) / grnTotal * 100);

        // Allow up to 10% variance
        return variance <= 10 && invoiceVariance <= 10;
    },

    // Auto-populate payment voucher from invoice
    autoPopulateFromInvoice: (invoice: InvoiceComparisonData): PaymentVoucherDto => {
        return {
            voucherNumber: '',
            voucherDate: new Date().toISOString().split('T')[0],
            supplierId: undefined, // Will be set when supplier is selected
            paymentMethod: 'cash',
            currency: 'EGP',
            exchangeRate: 1,
            amount: invoice.invoiceTotal,
            description: `دفعة عن فاتورة رقم ${invoice.invoiceNumber}`,
            allocations: [{
                supplierInvoiceId: invoice.supplierInvoiceId,
                allocatedAmount: invoice.invoiceTotal,
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.invoiceDate,
                invoiceTotal: invoice.invoiceTotal,
                invoiceSubTotal: invoice.invoiceSubTotal,
                invoiceTaxAmount: invoice.invoiceTaxAmount,
                invoiceDiscountAmount: invoice.invoiceDiscountAmount,
                invoiceDeliveryCost: invoice.invoiceDeliveryCost,
                invoiceOtherCosts: invoice.invoiceOtherCosts,
                poNumber: invoice.poNumber,
                poTotal: invoice.poTotal,
                poSubTotal: invoice.poSubTotal,
                poTaxAmount: invoice.poTaxAmount,
                poDiscountAmount: invoice.poDiscountAmount,
                poShippingCost: invoice.poShippingCost,
                poOtherCosts: invoice.poOtherCosts,
                grnNumber: invoice.grnNumber,
                grnTotal: invoice.grnTotal,
                grnSubTotal: invoice.grnSubTotal,
                grnTaxAmount: invoice.grnTaxAmount,
                grnDiscountAmount: invoice.grnDiscountAmount,
                grnShippingCost: invoice.grnShippingCost,
                grnOtherCosts: invoice.grnOtherCosts,
                variancePercentage: invoice.variancePercentage,
                isValid: invoice.isValid
            }]
        };
    },

    // ───── Workflow Actions ─────

    // Finance Manager approval
    approveFinanceManager: async (id: number, approvedBy: string): Promise<PaymentVoucherDto> => {
        const response = await apiClient.post(`/payment-vouchers/${id}/approve-finance`, null, {
            params: { approvedBy }
        });
        return response.data;
    },

    // General Manager approval
    approveGeneralManager: async (id: number, approvedBy: string): Promise<PaymentVoucherDto> => {
        const response = await apiClient.post(`/payment-vouchers/${id}/approve-general`, null, {
            params: { approvedBy }
        });
        return response.data;
    },

    // Process payment (mark as paid)
    processPayment: async (id: number, paidBy: string): Promise<PaymentVoucherDto> => {
        const response = await apiClient.post(`/payment-vouchers/${id}/process-payment`, null, {
            params: { paidBy }
        });
        return response.data;
    },

    // Reject voucher
    rejectVoucher: async (id: number, rejectedBy: string, reason: string): Promise<PaymentVoucherDto> => {
        const response = await apiClient.post(`/payment-vouchers/${id}/reject`, null, {
            params: { rejectedBy, reason }
        });
        return response.data;
    },

    // Cancel voucher
    cancelVoucher: async (id: number, cancelledBy: string, reason: string): Promise<PaymentVoucherDto> => {
        const response = await apiClient.post(`/payment-vouchers/${id}/cancel`, null, {
            params: { cancelledBy, reason }
        });
        return response.data;
    },

    // Download voucher PDF
    downloadVoucherPdf: async (id: number, voucherNumber: string): Promise<void> => {
        try {
            const response = await apiClient.get<{ data: any }>(`/finance/payment-vouchers/${id}/pdf`, {
                responseType: 'blob'
            });

            // @ts-ignore
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PaymentVoucher_${voucherNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download voucher PDF:', error);
            throw error;
        }
    }
};

export default paymentVoucherService;
