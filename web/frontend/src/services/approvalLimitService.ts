import apiClient from './apiClient';

const APPROVAL_LIMITS_API_URL = '/approval-limits';

export interface ApprovalLimitDto {
    id: number;
    activityType: string;
    roleId: number;
    roleCode: string;
    roleNameAr: string;
    minAmount?: number;
    maxAmount?: number | null;
    minPercentage?: number;
    maxPercentage?: number | null;
    isActive: boolean;
}

export interface ApprovalLimitUpdateDto {
    minAmount?: number;
    maxAmount?: number | null;
    minPercentage?: number;
    maxPercentage?: number | null;
    isActive?: boolean;
}

export const approvalLimitService = {
    getAll: (activityType?: string) => {
        const params = activityType ? { activityType } : {};
        return apiClient.get<ApprovalLimitDto[]>(APPROVAL_LIMITS_API_URL, { params });
    },
    getByRole: (roleId: number) =>
        apiClient.get<ApprovalLimitDto[]>(`${APPROVAL_LIMITS_API_URL}/role/${roleId}`),
    getById: (id: number) =>
        apiClient.get<ApprovalLimitDto>(`${APPROVAL_LIMITS_API_URL}/${id}`),
    update: (id: number, dto: ApprovalLimitUpdateDto) =>
        apiClient.put<ApprovalLimitDto>(`${APPROVAL_LIMITS_API_URL}/${id}`, dto),
};
