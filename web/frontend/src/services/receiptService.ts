import apiClient from './apiClient';

/**
 * إيصال الدفع / سند القبض (Payment Receipt)
 * API متوقع: GET/POST /sales/receipts, GET /sales/receipts/:id
 */

export type ReceiptType = 'FROM_CUSTOMER' | 'FROM_EMPLOYEE' | 'GENERAL_INCOME' | 'OTHER';
export type PaymentMethod = 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'PROMISSORY_NOTE';

export interface ReceiptDto {
    id?: number;
    receiptNumber?: string;
    receiptDate: string;
    receiptType: ReceiptType;
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
    receivedAmount: number;
    paymentMethod: PaymentMethod;
    chequeNo?: string;
    chequeBank?: string;
    bankAccountNo?: string;
    bankName?: string;
    transferRef?: string;
    promissoryNo?: string;
    promissoryDueDate?: string;
    currency?: string;
    notes?: string;
    status?: string;
}

const _api = '/sales/receipts';

export const receiptService = {
    getAll: async (): Promise<ReceiptDto[]> => {
        try {
            const res = await apiClient.get<{ data?: ReceiptDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },
    getById: async (id: number): Promise<ReceiptDto | null> => {
        try {
            const res = await apiClient.get<{ data?: ReceiptDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    create: async (dto: ReceiptDto): Promise<ReceiptDto | null> => {
        const res = await apiClient.post<{ data?: ReceiptDto }>(_api, dto);
        return (res.data as any)?.data ?? null;
    },
};
