import apiClient from './apiClient';

/**
 * إذن تحويل بين مخازن - Transfer Note
 * API: /inventory/transfers
 */

export interface TransferItemDto {
    itemId: number;
    itemNameAr?: string;
    itemCode?: string;
    /** كمية التحويل (يُرسل للـ API كـ requestedQty) */
    quantity: number;
    requestedQty?: number;
    unitId: number;
    unitNameAr?: string;
    lotNumber?: string;
    fromLocationId?: number;
    toLocationId?: number;
    notes?: string;
}

export type TransferReason = 'REDISTRIBUTION' | 'BRANCH_TRANSFER' | 'REORGANIZATION' | 'OTHER';

export interface TransferNoteDto {
    id?: number;
    transferNumber?: string;
    transferDate?: string;
    fromWarehouseId: number;
    fromWarehouseNameAr?: string;
    toWarehouseId: number;
    toWarehouseNameAr?: string;
    reason: TransferReason;
    reasonOther?: string;
    notes?: string;
    status?: string;
    items: TransferItemDto[];
}

const _api = '/inventory/transfers';

export const transferNoteService = {
    getAll: async (): Promise<TransferNoteDto[]> => {
        try {
            const res = await apiClient.get<{ data?: TransferNoteDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },
    getById: async (id: number): Promise<TransferNoteDto | null> => {
        try {
            const res = await apiClient.get<{ data?: TransferNoteDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    create: async (dto: TransferNoteDto): Promise<TransferNoteDto | null> => {
        const payload = {
            ...dto,
            items: (dto.items || []).map((i) => ({
                itemId: i.itemId,
                unitId: i.unitId,
                requestedQty: i.quantity ?? i.requestedQty ?? 0,
                fromLocationId: i.fromLocationId,
                toLocationId: i.toLocationId,
                lotNumber: i.lotNumber,
                notes: i.notes,
            })),
        };
        const res = await apiClient.post<{ data?: TransferNoteDto }>(_api, payload);
        return (res.data as any)?.data ?? null;
    },
    update: async (id: number, dto: TransferNoteDto): Promise<TransferNoteDto | null> => {
        const payload = {
            ...dto,
            items: (dto.items || []).map((i) => ({
                itemId: i.itemId,
                unitId: i.unitId,
                requestedQty: i.quantity ?? i.requestedQty ?? 0,
                fromLocationId: i.fromLocationId,
                toLocationId: i.toLocationId,
                lotNumber: i.lotNumber,
                notes: i.notes,
            })),
        };
        const res = await apiClient.put<{ data?: TransferNoteDto }>(`${_api}/${id}`, payload);
        return (res.data as any)?.data ?? null;
    },
    finalize: async (id: number, userId?: number): Promise<TransferNoteDto | null> => {
        const url = userId != null ? `${_api}/${id}/finalize?userId=${userId}` : `${_api}/${id}/finalize`;
        const res = await apiClient.post<{ data?: TransferNoteDto }>(url);
        return (res.data as any)?.data ?? null;
    },
};

export default transferNoteService;
