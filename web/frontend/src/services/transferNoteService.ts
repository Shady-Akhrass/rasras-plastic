import apiClient from './apiClient';

/**
 * إذن تحويل بين مخازن - Transfer Note
 * الواجهة البرمجية المقترحة لاحقاً:
 *   GET  /inventory/transfers
 *   GET  /inventory/transfers/:id
 *   POST /inventory/transfers
 */

export interface TransferItemDto {
    itemId: number;
    itemNameAr?: string;
    itemCode?: string;
    quantity: number;
    unitId: number;
    unitNameAr?: string;
    lotNumber?: string;
    fromLocationId?: number;
    toLocationId?: number;
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
        const res = await apiClient.post<{ data?: TransferNoteDto }>(_api, dto);
        return (res.data as any)?.data ?? null;
    }
};

export default transferNoteService;
