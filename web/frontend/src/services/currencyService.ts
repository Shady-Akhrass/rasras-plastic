
export interface ExchangeRatesResponse {
    base: string;
    date: string;
    rates: Record<string, number>;
}

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const CACHE_KEY = 'global_exchange_rates';
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export const currencyService = {
    getRates: async (): Promise<Record<string, number>> => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { rates, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TIME) {
                return rates;
            }
        }

        try {
            const response = await fetch(EXCHANGE_RATE_API);
            if (!response.ok) throw new Error('Failed to fetch exchange rates');
            const data: ExchangeRatesResponse = await response.json();

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                rates: data.rates,
                timestamp: Date.now()
            }));

            return data.rates;
        } catch (error) {
            console.error('Currency service error:', error);
            return {};
        }
    },

    convert: (amount: number, from: string, to: string, rates: Record<string, number>): number => {
        if (from === to) return amount;

        // Base is USD in the API we use
        const fromRate = from === 'USD' ? 1 : rates[from];
        const toRate = to === 'USD' ? 1 : rates[to];

        if (!fromRate || !toRate) return amount;

        // Convert to USD first, then to target
        const usdAmount = amount / fromRate;
        return usdAmount * toRate;
    }
};
