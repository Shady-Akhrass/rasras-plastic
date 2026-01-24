import apiClient from './apiClient';
// Basic API Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PurchaseReturnItemDto {
    id?: number;
    itemId: number;
    itemNameAr?: string;
    grnItemId?: number;
    returnedQty: number;
    unitId: number;
    unitNameAr?: string;
    unitPrice: number;
    taxPercentage: number;
    taxAmount: number;
    totalPrice: number;
    returnReason?: string;
    lotNumber?: string;
}

export interface PurchaseReturnDto {
    id?: number;
    returnNumber: string;
    returnDate: string;
    grnId?: number;
    grnNumber?: string;
    supplierInvoiceId?: number;
    supplierInvoiceNo?: string;
    supplierId: number;
    supplierNameAr?: string;
    warehouseId: number;
    warehouseNameAr?: string;
    returnReason: string;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    status?: string;
    items: PurchaseReturnItemDto[];
}

export const purchaseReturnService = {
    getAllReturns: async () => {
        const response = await apiClient.get<ApiResponse<PurchaseReturnDto[]>>('/procurement/returns');
        return response.data;
    },

    getReturnById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<PurchaseReturnDto>>(`/procurement/returns/${id}`);
        return response.data;
    },

    createReturn: async (dto: PurchaseReturnDto) => {
        const response = await apiClient.post<ApiResponse<PurchaseReturnDto>>('/procurement/returns', dto);
        return response.data;
    }
};

export default purchaseReturnService;
