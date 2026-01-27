import apiClient from './apiClient';

/**
 * إذن صرف - Material Issue Note
 * الواجهة البرمجية: يفترض أن يكون المتاح لاحقاً مثلاً:
 *   GET  /inventory/material-issues
 *   GET  /inventory/material-issues/:id
 *   POST /inventory/material-issues
 */

export interface MaterialIssueItemDto {
    itemId: number;
    itemNameAr?: string;
    itemCode?: string;
    requestedQty: number;
    issuedQty: number;
    unitId: number;
    unitNameAr?: string;
    lotNumber?: string;
    locationId?: number;
    notes?: string;
}

export type IssueType = 'SALE_ORDER' | 'PRODUCTION' | 'PROJECT' | 'INTERNAL';

export interface MaterialIssueDto {
    id?: number;
    issueNumber?: string;
    issueDate?: string;
    issueType: IssueType;
    referenceNo?: string;
    warehouseId: number;
    warehouseNameAr?: string;
    receiverName?: string;
    receiverPhone?: string;
    receiverAddress?: string;
    deliveryMethod?: 'PICKUP' | 'COMPANY_DELIVERY' | 'EXTERNAL_SHIPPING';
    driverName?: string;
    vehicleNo?: string;
    transportOrderNo?: string;
    notes?: string;
    status?: string;
    items: MaterialIssueItemDto[];
}

const _api = '/inventory/material-issues';

export const materialIssueService = {
    getAll: async (): Promise<MaterialIssueDto[]> => {
        try {
            const res = await apiClient.get<{ data?: MaterialIssueDto[] }>(_api);
            return (res.data as any)?.data ?? [];
        } catch {
            return [];
        }
    },
    getById: async (id: number): Promise<MaterialIssueDto | null> => {
        try {
            const res = await apiClient.get<{ data?: MaterialIssueDto }>(`${_api}/${id}`);
            return (res.data as any)?.data ?? null;
        } catch {
            return null;
        }
    },
    create: async (dto: MaterialIssueDto): Promise<MaterialIssueDto | null> => {
        const res = await apiClient.post<{ data?: MaterialIssueDto }>(_api, dto);
        return (res.data as any)?.data ?? null;
    }
};

export default materialIssueService;
