import apiClient from './apiClient';

/**
 * إذن صرف من المخزن (Stock Issue Note)
 * API: /sales/issue-notes
 */

export interface StockIssueNoteItemDto {
    id?: number;
    stockIssueNoteId?: number;
    soItemId: number;
    itemId: number;
    itemCode?: string;
    itemNameAr?: string;
    itemNameEn?: string;
    requestedQty: number;
    issuedQty: number;
    unitId: number;
    unitNameAr?: string;
    unitCost?: number;
    totalCost?: number;
    lotNumber?: string;
    batchId?: number;
    locationId?: number;
    notes?: string;
}

export interface StockIssueNoteDto {
    id?: number;
    issueNoteNumber?: string;
    issueDate: string;
    salesOrderId: number;
    soNumber?: string;
    customerId?: number;
    customerNameAr?: string;
    customerCode?: string;
    warehouseId: number;
    warehouseNameAr?: string;
    issuedByUserId?: number;
    receivedByName?: string;
    receivedById?: string;
    receivedBySignature?: string;
    vehicleNo?: string;
    driverName?: string;
    status?: string;
    approvalStatus?: string;
    deliveryDate?: string;
    notes?: string;
    createdAt?: string;
    createdBy?: number;
    updatedAt?: string;
    updatedBy?: number;
    items: StockIssueNoteItemDto[];
}

/** تحذير نقص كمية صنف عند التحقق من توفر المخزون */
export interface StockAvailabilityWarningDto {
    itemId: number;
    itemCode?: string;
    itemNameAr?: string;
    unitNameAr?: string;
    requestedQty: number;
    availableQty: number;
    shortfall: number;
}

const _api = '/sales/issue-notes';

export const stockIssueNoteService = {
    getAll: async (): Promise<StockIssueNoteDto[]> => {
        try {
            const res = await apiClient.get<{ data?: StockIssueNoteDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },

    getById: async (id: number): Promise<StockIssueNoteDto | null> => {
        try {
            const res = await apiClient.get<{ data?: StockIssueNoteDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    getBySalesOrderId: async (salesOrderId: number): Promise<StockIssueNoteDto[]> => {
        try {
            const res = await apiClient.get<{ data?: StockIssueNoteDto[] }>(`${_api}/by-order/${salesOrderId}`);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },

    /** التحقق من توفر المخزون قبل إنشاء إذن الصرف (تحذير فقط) */
    checkStockAvailability: async (
        salesOrderId: number,
        warehouseId: number
    ): Promise<StockAvailabilityWarningDto[]> => {
        try {
            const params = new URLSearchParams({
                salesOrderId: String(salesOrderId),
                warehouseId: String(warehouseId),
            });
            const res = await apiClient.get<{ data?: StockAvailabilityWarningDto[] }>(
                `${_api}/check-stock?${params}`
            );
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },

    createFromSalesOrder: async (
        salesOrderId: number,
        warehouseId: number,
        issuedByUserId?: number
    ): Promise<StockIssueNoteDto | null> => {
        try {
            const params = new URLSearchParams({ warehouseId: String(warehouseId) });
            if (issuedByUserId != null) params.append('issuedByUserId', String(issuedByUserId));
            const res = await apiClient.post<{ data?: StockIssueNoteDto }>(
                `${_api}/from-order/${salesOrderId}?${params}`
            );
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    create: async (dto: StockIssueNoteDto): Promise<StockIssueNoteDto | null> => {
        try {
            const res = await apiClient.post<{ data?: StockIssueNoteDto }>(_api, dto);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },

    update: async (id: number, dto: StockIssueNoteDto): Promise<StockIssueNoteDto | null> => {
        try {
            const res = await apiClient.put<{ data?: StockIssueNoteDto }>(`${_api}/${id}`, dto);
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

    approve: async (id: number, approvedByUserId?: number): Promise<StockIssueNoteDto | null> => {
        try {
            const params = approvedByUserId != null ? `?approvedByUserId=${approvedByUserId}` : '';
            const res = await apiClient.post<{ data?: StockIssueNoteDto }>(`${_api}/${id}/approve${params}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    submitForApproval: async (id: number): Promise<StockIssueNoteDto | null> => {
        try {
            const res = await apiClient.post<{ data?: StockIssueNoteDto }>(`${_api}/${id}/submit`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
};
