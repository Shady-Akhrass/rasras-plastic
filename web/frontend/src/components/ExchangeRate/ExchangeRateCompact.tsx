import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useSystemSettings } from '../../hooks/useSystemSettings';

const ExchangeRateCompact = () => {
    const [rate, setRate] = useState<number | null>(null);
    const [previousRate, setPreviousRate] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const { defaultCurrency, baseCurrency, getCurrencyLabel } = useSystemSettings();

    useEffect(() => {
        const fetchRate = async () => {
            try {
                // Primary source: External API (using baseCurrency)
                const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
                if (!response.ok) throw new Error('Failed to fetch from external API');

                const data = await response.json();
                const currentRate = data.rates[defaultCurrency] || data.rates.EGP;
                setRate(currentRate);

                // Save to localStorage instead of backend
                const historyKey = `exchange_rate_history_${baseCurrency}_${defaultCurrency}`;
                let history: { rate: number, date: string }[] = JSON.parse(localStorage.getItem(historyKey) || '[]');

                const today = new Date().toISOString().split('T')[0];
                const lastEntry = history.length > 0 ? history[0] : null;

                if (!lastEntry || lastEntry.date !== today) {
                    history.unshift({ rate: currentRate, date: today });
                    history = history.slice(0, 30);
                    localStorage.setItem(historyKey, JSON.stringify(history));
                } else if (lastEntry.rate !== currentRate) {
                    history[0].rate = currentRate;
                    localStorage.setItem(historyKey, JSON.stringify(history));
                }

                // Sync with backend (REMOVED as per user request)
                // await apiClient.post('/finance/exchange-rates', currentRate);

                if (history.length > 1) {
                    setPreviousRate(history[1].rate);
                }

                setError(false);
            } catch (err) {
                console.error('Error fetching exchange rate:', err);
                // Fallback to local storage if external fails
                const historyKey = `exchange_rate_history_${baseCurrency}_${defaultCurrency}`;
                const history: { rate: number, date: string }[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
                if (history.length > 0) {
                    setRate(history[0].rate);
                    if (history.length > 1) setPreviousRate(history[1].rate);
                } else {
                    setError(true);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRate();
        const interval = setInterval(fetchRate, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [defaultCurrency, baseCurrency]);


    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">جاري التحميل...</span>
            </div>
        );
    }

    if (error || !rate) {
        return null;
    }

    const change = previousRate ? rate - previousRate : 0;
    const isPositive = change >= 0;

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg
                hover:bg-white/20 transition-colors cursor-default" title="سعر صرف الدولار مقابل العملة المحلية">
            <DollarSign className="w-4 h-4" />
            <div className="flex items-baseline gap-1">
                <span className="font-bold">{rate}</span>
                <span className="text-xs opacity-70">{getCurrencyLabel(defaultCurrency)}</span>
            </div>

            {change !== 0 && (
                <div className={`flex items-center text-xs ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="mr-0.5">{Math.abs(change)}</span>
                </div>
            )}
        </div>
    );
};

export default ExchangeRateCompact;
