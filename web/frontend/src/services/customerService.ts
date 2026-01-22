import apiClient from './apiClient';

export interface CustomerContact {
    id?: number;
    customerId?: number;
    contactName: string;
    jobTitle?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    isPrimary: boolean;
    isActive?: boolean;
}

export interface Customer {
    id?: number;
    customerCode: string;
    customerNameAr: string;
    customerNameEn?: string;
    customerType?: string;
    customerClass?: string;
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
    currentBalance?: number;
    currency?: string;
    salesRepId?: number;
    salesRepName?: string;
    priceListId?: number;
    priceListName?: string;
    discountPercentage?: number;
    isApproved?: boolean;
    isActive?: boolean;
    notes?: string;
    createdAt?: string;
    contacts?: CustomerContact[];
}

const customerService = {
    getAllCustomers: async () => {
        const response = await apiClient.get<{ data: Customer[] }>('/crm/customers');
        return response.data.data;
    },

    getActiveCustomers: async () => {
        const response = await apiClient.get<{ data: Customer[] }>('/crm/customers/active');
        return response.data.data;
    },

    getCustomerById: async (id: number) => {
        const response = await apiClient.get<{ data: Customer }>(`/crm/customers/${id}`);
        return response.data.data;
    },

    createCustomer: async (customer: Customer) => {
        const response = await apiClient.post<{ data: Customer }>('/crm/customers', customer);
        return response.data.data;
    },

    updateCustomer: async (id: number, customer: Customer) => {
        const response = await apiClient.put<{ data: Customer }>(`/crm/customers/${id}`, customer);
        return response.data.data;
    },

    deleteCustomer: async (id: number) => {
        await apiClient.delete(`/crm/customers/${id}`);
    }
};

export default customerService;
