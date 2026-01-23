import apiClient from './apiClient';

export interface SupplierDto {
    id?: number;
    supplierCode?: string;
    supplierNameAr: string;
    supplierNameEn?: string;
    supplierType?: string;
    taxRegistrationNo?: string;
    commercialRegNo?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    fax?: string;
    email?: string;
    website?: string;
    contactPerson?: string;
    contactPhone?: string;
    paymentTermDays?: number;
    creditLimit?: number;
    currency?: string;
    bankName?: string;
    bankAccountNo?: string;
    iban?: string;
    rating?: string;
    isApproved?: boolean;
    isActive?: boolean;
    notes?: string;
    createdAt?: string;
    createdBy?: number;
    updatedBy?: number;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
    approvalNotes?: string;
    approvalDate?: string;
    approvedBy?: number;
}

export interface SupplierItemDto {
    id?: number;
    supplierId: number;
    itemId: number;
    itemNameAr?: string;
    itemCode?: string;
    supplierItemCode?: string;
    lastPrice?: number;
    lastPriceDate?: string;
    leadTimeDays?: number;
    minOrderQty?: number;
    isPreferred?: boolean;
    isActive?: boolean;
}

export interface SupplierBankDto {
    id?: number;
    supplierId: number;
    bankName: string;
    bankAccountNo: string;
    iban?: string;
    swift?: string;
    currency?: string;
    isDefault?: boolean;
}

export interface SupplierOutstandingDto {
    id: number;
    supplierCode: string;
    supplierNameAr: string;
    creditLimit: number;
    totalInvoiced: number;
    totalPaid: number;
    currentBalance: number;
    currency: string;
    lastPaymentDate?: string;
}

export const supplierService = {
    getAllSuppliers: async () => {
        const response = await apiClient.get<{ data: SupplierDto[] }>('/suppliers');
        return response.data;
    },

    getSupplierById: async (id: number) => {
        const response = await apiClient.get<{ data: SupplierDto }>(`/suppliers/${id}`);
        return response.data;
    },

    createSupplier: async (dto: SupplierDto) => {
        const response = await apiClient.post<{ data: SupplierDto }>('/suppliers', dto);
        return response.data;
    },

    updateSupplier: async (id: number, dto: SupplierDto) => {
        const response = await apiClient.put<{ data: SupplierDto }>(`/suppliers/${id}`, dto);
        return response.data;
    },

    deleteSupplier: async (id: number) => {
        const response = await apiClient.delete<{ success: boolean }>(`/suppliers/${id}`);
        return response.data;
    },

    getSupplierItems: async (supplierId: number) => {
        const response = await apiClient.get<{ data: SupplierItemDto[] }>(`/suppliers/${supplierId}/items`);
        return response.data;
    },

    getAllSupplierItems: async () => {
        const response = await apiClient.get<{ data: SupplierItemDto[] }>('/suppliers/items-master');
        return response.data;
    },

    linkItem: async (dto: SupplierItemDto) => {
        const response = await apiClient.post<{ data: SupplierItemDto }>('/suppliers/link-item', dto);
        return response.data;
    },

    unlinkItem: async (id: number) => {
        const response = await apiClient.delete<{ success: boolean }>(`/suppliers/unlink-item/${id}`);
        return response.data;
    },

    getSupplierBanks: async (supplierId: number) => {
        const response = await apiClient.get<{ data: SupplierBankDto[] }>(`/suppliers/${supplierId}/banks`);
        return response.data;
    },

    addBank: async (dto: SupplierBankDto) => {
        const response = await apiClient.post<{ data: SupplierBankDto }>('/suppliers/add-bank', dto);
        return response.data;
    },

    removeBank: async (id: number) => {
        const response = await apiClient.delete<{ success: boolean }>(`/suppliers/remove-bank/${id}`);
        return response.data;
    },

    submitForApproval: async (id: number) => {
        const response = await apiClient.post<{ data: SupplierDto }>(`/suppliers/${id}/submit`);
        return response.data;
    },

    approveSupplier: async (id: number, userId: number, notes?: string) => {
        const response = await apiClient.post<{ data: SupplierDto }>(`/suppliers/${id}/approve`, null, {
            params: { userId, notes }
        });
        return response.data;
    },

    rejectSupplier: async (id: number, userId: number, notes: string) => {
        const response = await apiClient.post<{ data: SupplierDto }>(`/suppliers/${id}/reject`, null, {
            params: { userId, notes }
        });
        return response.data;
    },

    getOutstandingSummary: async () => {
        const response = await apiClient.get<{ data: SupplierOutstandingDto[] }>('/suppliers/outstanding-summary');
        return response.data;
    }
};
