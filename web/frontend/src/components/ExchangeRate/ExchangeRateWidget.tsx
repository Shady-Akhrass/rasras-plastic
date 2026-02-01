import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, TrendingDown, RefreshCw,
    AlertCircle, Banknote, ArrowLeftRight
} from 'lucide-react';

interface ExchangeRateData {
    rate: number;
    lastUpdate: string;
    previousRate: number;
}

const ExchangeRateWidget = () => {
    const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Get previous rate from localStorage
    const getPreviousRate = (): number => {
        const stored = localStorage.getItem('previousExchangeRate');
        return stored ? parseFloat(stored) : 0;
    };

    // Save current rate to localStorage
    const saveCurrentRate = (rate: number) => {
        localStorage.setItem('previousExchangeRate', rate.toString());
    };

    const fetchExchangeRate = useCallback(async () => {
        try {
            setIsRefreshing(true);
            setError(null);

            // Using free Exchange Rate API (no API key required)
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

            if (!response.ok) {
                throw new Error('Failed to fetch exchange rate');
            }

            const data = await response.json();
            const currentRate = data.rates.EGP;
            const previousRate = getPreviousRate() || currentRate;

            setExchangeRate({
                rate: currentRate,
                lastUpdate: data.date,
                previousRate: previousRate
            });

            // Save current rate for next comparison
            saveCurrentRate(currentRate);

        } catch (err: any) {
            console.error('Error fetching exchange rate:', err);
            setError('فشل تحميل سعر الصرف');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchExchangeRate();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchExchangeRate]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 
                p-6 rounded-2xl shadow-lg animate-pulse h-full min-h-[280px]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
                    <div className="space-y-2">
                        <div className="w-20 h-4 bg-white/20 rounded"></div>
                        <div className="w-16 h-5 bg-white/20 rounded"></div>
                    </div>
                </div>
                <div className="w-32 h-12 bg-white/20 rounded mt-6"></div>
                <div className="w-24 h-4 bg-white/20 rounded mt-2"></div>
            </div>
        );
    }

    if (error || !exchangeRate) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-rose-200 h-full min-h-[280px]
                    flex flex-col items-center justify-center"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <p className="font-semibold text-slate-800 mb-1">خطأ في التحميل</p>
                    <p className="text-sm text-slate-500 mb-4">{error}</p>
                    <button
                        onClick={fetchExchangeRate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-600 
                            rounded-lg hover:bg-rose-200 transition-colors font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        إعادة المحاولة
                    </button>
                </div>
            </motion.div>
        );
    }

    const change = exchangeRate.rate - exchangeRate.previousRate;
    const changePercent = exchangeRate.previousRate > 0
        ? ((change / exchangeRate.previousRate) * 100)
        : 0;
    const isPositive = change >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 
                p-6 rounded-2xl shadow-lg overflow-hidden group h-full"
        >
            {/* Background Decorations */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

            {/* Dollar Icon Decoration */}
            <div className="absolute top-4 left-4 opacity-10">
                <DollarSign className="w-24 h-24" />
            </div>

            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <ArrowLeftRight className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white/80 text-sm font-medium">سعر الصرف</h3>
                            <p className="text-white text-lg font-bold flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    USD
                                </span>
                                <span className="text-white/50">/</span>
                                <span className="flex items-center gap-1">
                                    <Banknote className="w-4 h-4" />
                                    EGP
                                </span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchExchangeRate}
                        disabled={isRefreshing}
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg 
                            transition-all duration-200 disabled:opacity-50"
                        title="تحديث السعر"
                    >
                        <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Main Rate Display */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">
                            {exchangeRate.rate.toFixed(2)}
                        </span>
                        <span className="text-white/60 text-lg font-medium">ج.م</span>
                    </div>
                    <p className="text-white/70 text-sm mt-1">لكل دولار أمريكي واحد</p>
                </div>

                {/* Change Indicator */}
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg
                        ${isPositive
                            ? 'bg-emerald-400/30 text-white'
                            : 'bg-rose-500/30 text-white'
                        }`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="text-sm font-bold">
                            {isPositive ? '+' : ''}{change.toFixed(4)}
                        </span>
                        {changePercent !== 0 && (
                            <span className="text-xs font-medium opacity-80">
                                ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                            </span>
                        )}
                    </div>

                    <div className="text-left">
                        <p className="text-white/60 text-xs">آخر تحديث</p>
                        <p className="text-white text-sm font-medium">
                            {formatDate(exchangeRate.lastUpdate)}
                        </p>
                    </div>
                </div>

                {/* Source Badge */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <p className="text-white/50 text-xs">
                        المصدر: Exchange Rate API
                    </p>
                    <p className="text-white/50 text-xs">
                        تحديث تلقائي كل 5 دقائق
                    </p>
                </div>
            </div>

            {/* Hover Effect Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </motion.div>
    );
};

export default ExchangeRateWidget;