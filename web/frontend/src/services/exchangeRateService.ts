import apiClient from './apiClient';

const API_URL = '/finance/exchange-rates';
const EXTERNAL_API_BASE = 'https://api.exchangerate-api.com/v4/latest';

export interface ExchangeRate {
    id: number;
    rate: number;
    recordedAt: string;
    currencyCode: string;
}

export interface ExchangeRateHistoryEntry {
    id: number;
    itemId: number;
    exchangeRate: number;
    purchasePriceUsd: number;
    sourceType: string; // "GRN" | "INVOICE"
    sourceId: number | null;
    recordedAt: string;
}

export interface ItemPricingInfo {
    history: ExchangeRateHistoryEntry[];
    itemBufferPercentage: number;
    globalBufferPercentage: number;
    currentMarketRate: number;
    effectiveRate: number;
}

export const exchangeRateService = {
    // Primary source: Direct external API call
    fetchLiveRate: async (baseCurrency = 'USD', targetCurrency = 'EGP'): Promise<number> => {
        try {
            const response = await fetch(`${EXTERNAL_API_BASE}/${baseCurrency}`);
            if (!response.ok) throw new Error('Failed to fetch from external API');
            const data = await response.json();
            return data.rates[targetCurrency] || data.rates.EGP || 1;
        } catch (err) {
            console.error('Error fetching live exchange rate:', err);
            // Fallback to local storage or a reasonable default if everything fails
            const historyKey = `exchange_rate_history_${baseCurrency}_${targetCurrency}`;
            const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            return history.length > 0 ? history[0].rate : 50; 
        }
    },

    getLatestRate: async (): Promise<number> => {
        try {
            const response = await apiClient.get<number>(`${API_URL}/latest`);
            return response.data;
        } catch (err) {
            console.warn('Failed to fetch latest rate from backend, using live rate');
            return await exchangeRateService.fetchLiveRate();
        }
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
    },

    getItemPricingInfo: async (itemId: number): Promise<ItemPricingInfo> => {
        const response = await apiClient.get<ItemPricingInfo>(`/inventory/items/${itemId}/pricing-info`);
        return response.data;
    }
};

