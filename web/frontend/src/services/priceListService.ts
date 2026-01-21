import apiClient from './apiClient';

const API_URL = '/inventory/price-lists';

export interface PriceListItemDto {
    id?: number;
    priceListId?: number;
    itemId: number;
    itemNameAr?: string;
    itemCode?: string;
    unitPrice: number;
    minQty?: number;
    maxQty?: number;
    discountPercentage?: number;
}

export interface PriceListDto {
    id?: number;
    priceListName: string;
    listType: string; // SELLING, BUYING
    currency?: string;
    validFrom?: string;
    validTo?: string;
    isActive: boolean;
    items?: PriceListItemDto[];
}

export const priceListService = {
    getAllPriceLists: () => apiClient.get<PriceListDto[]>(API_URL),
    getPriceListById: (id: number) => apiClient.get<PriceListDto>(`${API_URL}/${id}`),
    createPriceList: (data: PriceListDto) => apiClient.post<PriceListDto>(API_URL, data),
    updatePriceList: (id: number, data: PriceListDto) => apiClient.put<PriceListDto>(`${API_URL}/${id}`, data),
    deletePriceList: (id: number) => apiClient.delete(`${API_URL}/${id}`),
};
