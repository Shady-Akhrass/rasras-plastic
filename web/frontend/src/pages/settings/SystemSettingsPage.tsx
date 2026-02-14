import React, { useEffect, useState } from 'react';
import { RefreshCw, Settings } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

interface SystemSettingDto {
    id: number;
    settingKey: string;
    settingValue: string;
    description: string;
    category: string;
    dataType: 'String' | 'Number' | 'Boolean';
}

const SystemSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/settings');
            if (response.data.data) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('فشل تحميل الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: string) => {
        try {
            setSaving(key);
            const response = await apiClient.put(`/settings/${key}`, { value });
            if (response.data.success) {
                toast.success('تم حفظ الإعداد بنجاح');
                setSettings(prev => prev.map(s => s.settingKey === key ? { ...s, settingValue: value } : s));
            }
        } catch (error) {
            console.error('Error updating setting:', error);
            toast.error('فشل تحديث الإعداد');
        } finally {
            setSaving(null);
        }
    };

    const groupedSettings = settings.reduce((acc, setting) => {
        const category = setting.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(setting);
        return acc;
    }, {} as Record<string, SystemSettingDto[]>);

    const renderInput = (setting: SystemSettingDto) => {
        if (setting.dataType === 'Boolean') {
            return (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleUpdate(setting.settingKey, setting.settingValue === 'true' ? 'false' : 'true')}
                        disabled={saving === setting.settingKey}
                        className={`w-12 h-6 rounded-full transition-colors relative ${setting.settingValue === 'true' ? 'bg-brand-primary' : 'bg-slate-200'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${setting.settingValue === 'true' ? 'left-1' : 'right-1'}`} />
                    </button>
                    <span className="text-sm text-slate-600 font-medium">
                        {setting.settingValue === 'true' ? 'مفعل' : 'غير مفعل'}
                    </span>
                </div>
            );
        }

        if (setting.settingKey === 'DefaultCurrency') {
            return (
                <div className="flex gap-2">
                    <select
                        value={setting.settingValue}
                        onChange={(e) => handleUpdate(setting.settingKey, e.target.value)}
                        disabled={saving === setting.settingKey}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all bg-white"
                    >
                        <option value="EGP">EGP (ج.م)</option>
                        <option value="USD">USD ($)</option>
                        <option value="SAR">SAR (ر.س)</option>
                    </select>
                </div>
            );
        }

        return (
            <div className="flex gap-2">
                <input
                    type={setting.dataType === 'Number' ? 'number' : 'text'}
                    defaultValue={setting.settingValue}
                    onBlur={(e) => {
                        if (e.target.value !== setting.settingValue) {
                            handleUpdate(setting.settingKey, e.target.value);
                        }
                    }}
                    disabled={saving === setting.settingKey}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
                />
            </div>
        );

    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-readex">إعدادات النظام</h1>
                    <p className="text-slate-500 mt-1 font-readex">التحكم في متغيرات النظام</p>
                </div>
                <button
                    onClick={fetchSettings}
                    disabled={loading}
                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedSettings).map(([category, items]) => (
                    <div key={category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 font-readex">{category}</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {items.map((setting) => (
                                <div key={setting.id} className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        {setting.description || setting.settingKey}
                                    </label>
                                    {renderInput(setting)}
                                    <p className="text-xs text-slate-400 font-mono">{setting.settingKey}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {Object.keys(groupedSettings).length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-500">
                        <Settings className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>لا توجد إعدادات لعرضها</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemSettingsPage;
