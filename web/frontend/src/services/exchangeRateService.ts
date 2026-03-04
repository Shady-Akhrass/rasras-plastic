import apiClient from './apiClient';

const API_URL = '/finance/exchange-rates';

export interface ExchangeRate {
    id: number;
    rate: number;
    recordedAt: string;
    currencyCode: string;
}

export const exchangeRateService = {
    recordRate: async (rate: number) => {
        const response = await apiClient.post<ExchangeRate>(API_URL, rate, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    getLatestRate: async () => {
        const response = await apiClient.get<number>(`${API_URL}/latest`);
        return response.data;
    },

    getHistory: async () => {
        const response = await apiClient.get<ExchangeRate[]>(`${API_URL}/history`);
        return response.data;
    },

    getEffectiveRate: async (sellingDays = 7, safetyFactor = 1.5) => {
        const response = await apiClient.get<number>(`${API_URL}/effective`, {
            params: { sellingDays, safetyFactor }
        });
        return response.data;
    },

    getBufferPercentage: async (sellingDays = 7, safetyFactor = 1.5) => {
        const response = await apiClient.get<number>(`${API_URL}/buffer`, {
            params: { sellingDays, safetyFactor }
        });
        return response.data;
    }
};
