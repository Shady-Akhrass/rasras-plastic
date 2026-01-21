import apiClient from './apiClient';

const ROLES_API_URL = '/roles';
const PERMISSIONS_API_URL = '/permissions';

export interface PermissionDto {
    permissionId: number;
    permissionCode: string;
    permissionNameAr: string;
    permissionNameEn: string;
    moduleName: string;
    actionType: string;
    isActive: boolean;
}

export interface RoleDto {
    roleId?: number;
    roleCode: string;
    roleNameAr: string;
    roleNameEn: string;
    description?: string;
    isActive: boolean;
    permissionIds?: number[];
}

export const roleService = {
    // Roles
    getAllRoles: () => apiClient.get<RoleDto[]>(ROLES_API_URL),
    getRoleById: (id: number) => apiClient.get<RoleDto>(`${ROLES_API_URL}/${id}`),
    createRole: (data: RoleDto) => apiClient.post<RoleDto>(ROLES_API_URL, data),
    updateRole: (id: number, data: RoleDto) => apiClient.put<RoleDto>(`${ROLES_API_URL}/${id}`, data),
    deleteRole: (id: number) => apiClient.delete(`${ROLES_API_URL}/${id}`),
    assignPermissions: (roleId: number, permissionIds: number[]) =>
        apiClient.post(`${ROLES_API_URL}/${roleId}/permissions`, { permissionIds }),

    // Permissions
    getAllPermissions: () => apiClient.get<PermissionDto[]>(PERMISSIONS_API_URL),
};
