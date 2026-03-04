import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { exchangeRateService } from '../../services/exchangeRateService';

const ExchangeRateCompact = () => {
    const [rate, setRate] = useState<number | null>(null);
    const [previousRate, setPreviousRate] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const { defaultCurrency, getCurrencyLabel } = useSystemSettings();

    useEffect(() => {
        const fetchRate = async () => {
            try {
                // Primary source: External API (as requested)
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (!response.ok) throw new Error('Failed to fetch from external API');

                const data = await response.json();
                const currentRate = data.rates[defaultCurrency] || data.rates.EGP;
                setRate(currentRate);

                // Save to backend and get history for comparison
                await exchangeRateService.recordRate(currentRate);

                const history = await exchangeRateService.getHistory();
                if (history && history.length > 1) {
                    setPreviousRate(history[1].rate); // history[0] is the one we just recorded
                }

                setError(false);
            } catch (err) {
                console.error('Error fetching exchange rate:', err);
                // Fallback to backend latest if external fails
                try {
                    const latest = await exchangeRateService.getLatestRate();
                    if (latest) setRate(latest);
                } catch (beErr) {
                    setError(true);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRate();
        const interval = setInterval(fetchRate, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [defaultCurrency]);


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
