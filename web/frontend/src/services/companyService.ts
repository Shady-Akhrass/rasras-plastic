import apiClient from './apiClient';

export interface CompanyInfo {
    id?: number;
    companyNameAr: string;
    companyNameEn: string;
    taxRegistrationNo: string;
    commercialRegNo: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    fax: string;
    email: string;
    website: string;
    logoPath: string;
    headerPath: string;
    footerText: string;
    currency: string;
    fiscalYearStartMonth: number;
}

export const companyService = {
    getCompanyInfo: async () => {
        const response = await apiClient.get<{ data: CompanyInfo }>('/company');
        return response.data;
    },

    updateCompanyInfo: async (info: CompanyInfo) => {
        const response = await apiClient.put<{ data: CompanyInfo }>('/company', info);
        return response.data;
    },

    uploadLogo: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ data: { path: string } }>('/company/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    uploadHeader: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ data: { path: string } }>('/company/header', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
