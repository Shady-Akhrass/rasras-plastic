import apiClient from './apiClient';

export interface Employee {
    employeeId: number;
    employeeCode: string;
    firstNameAr: string;
    lastNameAr: string;
    firstNameEn: string;
    lastNameEn: string;
    fullNameAr: string;
    fullNameEn: string;
    email: string;
    phone: string;
    mobile: string;
    jobTitle: string;
    departmentId: number;
    departmentNameAr: string;
    hireDate: string;
    isActive: boolean;
    basicSalary: number;
}

export interface Department {
    departmentId: number;
    departmentCode: string;
    departmentNameAr: string;
    departmentNameEn: string;
}

const employeeService = {
    getAll: async (page = 0, size = 20) => {
        const response = await apiClient.get(`/employees?page=${page}&size=${size}`);
        return response.data.data;
    },
    getById: async (id: number) => {
        const response = await apiClient.get(`/employees/${id}`);
        return response.data.data;
    },
    create: async (data: any) => {
        const response = await apiClient.post('/employees', data);
        return response.data.data;
    },
    update: async (id: number, data: any) => {
        const response = await apiClient.put(`/employees/${id}`, data);
        return response.data.data;
    },
    delete: async (id: number) => {
        const response = await apiClient.delete(`/employees/${id}`);
        return response.data;
    },
    getDepartments: async () => {
        const response = await apiClient.get('/employees/departments');
        return response.data.data;
    },
    getByDepartment: async (deptName: string) => {
        const response = await apiClient.get(`/employees/by-department?deptName=${encodeURIComponent(deptName)}`);
        return response.data.data;
    },
    getByRole: async (roleCode: string) => {
        const response = await apiClient.get(`/employees/by-role?roleCode=${encodeURIComponent(roleCode)}`);
        return response.data.data;
    },
    getAllActiveList: async () => {
        const response = await apiClient.get('/employees/list');
        return response.data.data;
    }
};

export default employeeService;
