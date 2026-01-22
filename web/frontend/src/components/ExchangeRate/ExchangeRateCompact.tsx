import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

const ExchangeRateCompact = () => {
    const [rate, setRate] = useState<number | null>(null);
    const [previousRate, setPreviousRate] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                // Get previous rate from localStorage
                const storedRate = localStorage.getItem('compactExchangeRate');
                if (storedRate) {
                    setPreviousRate(parseFloat(storedRate));
                }

                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (!response.ok) throw new Error('Failed to fetch');
                
                const data = await response.json();
                const currentRate = data.rates.EGP;
                
                setRate(currentRate);
                
                // Save for next comparison
                localStorage.setItem('compactExchangeRate', currentRate.toString());
                setError(false);
            } catch (err) {
                console.error('Error fetching exchange rate:', err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRate();
        const interval = setInterval(fetchRate, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

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
            hover:bg-white/20 transition-colors cursor-default" title="سعر صرف الدولار مقابل الجنيه المصري">
            <DollarSign className="w-4 h-4" />
            <div className="flex items-baseline gap-1">
                <span className="font-bold">{rate.toFixed(2)}</span>
                <span className="text-xs opacity-70">ج.م</span>
            </div>
            {change !== 0 && (
                <div className={`flex items-center text-xs ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="mr-0.5">{Math.abs(change).toFixed(2)}</span>
                </div>
            )}
        </div>
    );
};

export default ExchangeRateCompact;