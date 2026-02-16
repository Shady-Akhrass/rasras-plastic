import { useState, useEffect, useCallback } from 'react';
import { systemService, type SystemSettingDto } from '../services/systemService';
import { currencyService } from '../services/currencyService';

export const useSystemSettings = () => {
    const [settings, setSettings] = useState<SystemSettingDto[]>([]);
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const [settingsRes, ratesRes] = await Promise.all([
                    systemService.getAllSettings(),
                    currencyService.getRates()
                ]);

                if (settingsRes.data) {
                    setSettings(settingsRes.data);
                }
                if (ratesRes) {
                    setRates(ratesRes);
                }
            } catch (error) {
                console.error('Failed to initialize system settings/rates:', error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const getSetting = (key: string) => {
        return settings.find(s => s.settingKey === key)?.settingValue;
    };

    const defaultCurrency = getSetting('DefaultCurrency') || 'EGP';

    const getCurrencyLabel = (currency: string) => {
        const target = currency || defaultCurrency;
        switch (target) {
            case 'EGP': return 'ج.م';
            case 'SAR': return 'ر.س';
            case 'USD': return '$';
            default: return target;
        }
    };

    const convertAmount = useCallback((amount: number, from: string) => {
        if (!amount) return 0;
        const fromCurrency = from || 'EGP'; // Default to EGP if not specified
        return currencyService.convert(amount, fromCurrency, defaultCurrency, rates);
    }, [defaultCurrency, rates]);

    return {
        settings,
        loading,
        getSetting,
        defaultCurrency,
        getCurrencyLabel,
        convertAmount,
        rates
    };
};
