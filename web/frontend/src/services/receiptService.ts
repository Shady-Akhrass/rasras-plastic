import apiClient from './apiClient';

/**
 * إيصال الدفع / سند القبض (Payment Receipt)
 * API: GET/POST /sales/receipts, GET /sales/receipts/:id
 */

export type PaymentMethod = 'Cash' | 'Cheque' | 'BankTransfer' | 'PromissoryNote';

export interface PaymentReceiptAllocationDto {
    id?: number;
    receiptVoucherId?: number;
    salesInvoiceId: number;
    invoiceNumber?: string;
    allocatedAmount: number;
    allocationDate?: string;
    notes?: string;
}

export interface PaymentReceiptDto {
    id?: number;
    voucherNumber?: string;
    voucherDate: string;
    customerId?: number;
    customerNameAr?: string;
    customerCode?: string;
    payerName?: string;
    paymentMethod: PaymentMethod;
    cashRegisterId?: number;
    bankAccountId?: number;
    chequeId?: number;
    currency?: string;
    exchangeRate?: number;
    amount: number;
    amountInWords?: string;
    referenceType?: string;
    referenceId?: number;
    description?: string;
    status?: string;
    journalEntryId?: number;
    receivedByUserId?: number;
    receivedByUserName?: string;
    postedByUserId?: number;
    postedByUserName?: string;
    postedDate?: string;
    notes?: string;
    createdAt?: string;
    createdBy?: number;
    updatedAt?: string;
    updatedBy?: number;
    allocations?: PaymentReceiptAllocationDto[];
}

const _api = '/sales/receipts';

export const receiptService = {
    getAll: async (): Promise<PaymentReceiptDto[]> => {
        try {
            const res = await apiClient.get<{ data?: PaymentReceiptDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },
    getById: async (id: number): Promise<PaymentReceiptDto | null> => {
        try {
            const res = await apiClient.get<{ data?: PaymentReceiptDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    create: async (dto: PaymentReceiptDto): Promise<PaymentReceiptDto | null> => {
        const res = await apiClient.post<{ data?: PaymentReceiptDto }>(_api, dto);
        return (res.data as any)?.data ?? null;
    },
    update: async (id: number, dto: PaymentReceiptDto): Promise<PaymentReceiptDto | null> => {
        try {
            const res = await apiClient.put<{ data?: PaymentReceiptDto }>(`${_api}/${id}`, dto);
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
};

// Legacy interface for backward compatibility
export type ReceiptType = 'FROM_CUSTOMER' | 'FROM_EMPLOYEE' | 'GENERAL_INCOME' | 'OTHER';
export interface ReceiptDto extends PaymentReceiptDto {
    receiptNumber?: string;
    receiptType?: ReceiptType;
    depositorName?: string;
    depositorIdNo?: string;
    depositorPhone?: string;
    invoiceId?: number;
    invoiceNumber?: string;
    invoiceDate?: string;
    saleOrderNumber?: string;
    invoiceTotal?: number;
    earlyDiscount?: number;
    refundOrReturn?: number;
    receivedAmount?: number;
    chequeNo?: string;
    chequeBank?: string;
    bankAccountNo?: string;
    bankName?: string;
    transferRef?: string;
    promissoryNo?: string;
    promissoryDueDate?: string;
}
