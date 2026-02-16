import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save, ArrowRight, Package, Truck, AlertCircle, Info, Calendar,
    DollarSign, Hash, RefreshCw, X, Star, Clock, Tag, CheckCircle2,
    ChevronRight, Sparkles, Link2, FileText
} from 'lucide-react';
import { supplierService, type SupplierItemDto, type SupplierDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { formatNumber } from '../../utils/format';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import toast from 'react-hot-toast';

// Form Input Component
const FormInput: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    required?: boolean;
    type?: string;
    step?: string;
    hint?: string;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, type = 'text', step, hint }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-200
                        ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    required={required}
                    step={step}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
            </div>
            {hint && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {hint}
                </p>
            )}
        </div>
    );
};

// Form Select Component
const FormSelect: React.FC<{
    label: string;
    value: number | string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    options: { value: number | string; label: string; subtitle?: string }[];
    placeholder?: string;
    required?: boolean;
    loading?: boolean;
}> = ({ label, value, onChange, icon: Icon, options, placeholder, required, loading }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-200
                        ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    required={required}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none 
                        appearance-none bg-white cursor-pointer
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused
                            ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 hover:border-slate-300'}`}
                >
                    {placeholder && <option value={0}>{placeholder}</option>}
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {loading ? (
                    <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary animate-spin" />
                ) : (
                    <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90" />
                )}
            </div>
        </div>
    );
};

// Toggle Card Component
const ToggleCard: React.FC<{
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon: React.ElementType;
    activeColor?: string;
}> = ({ label, description, checked, onChange, icon: Icon, activeColor = 'emerald' }) => {
    const colorClasses: Record<string, { bg: string; text: string; activeBg: string }> = {
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', activeBg: 'bg-emerald-500' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-600', activeBg: 'bg-amber-500' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600', activeBg: 'bg-blue-500' },
    };

    const colors = colorClasses[activeColor] || colorClasses.emerald;

    return (
        <div
            onClick={() => onChange(!checked)}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer
                transition-all duration-300 group
                ${checked
                    ? `${colors.bg.replace('100', '50')} border-${activeColor}-200`
                    : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    ${checked
                        ? `${colors.bg} ${colors.text}`
                        : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'
                    }`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className={`font-bold transition-colors ${checked ? colors.text : 'text-slate-700'}`}>
                        {label}
                    </div>
                    <div className="text-xs text-slate-500">{description}</div>
                </div>
            </div>
            <div
                className={`relative w-14 h-7 rounded-full transition-colors duration-300
                    ${checked ? colors.activeBg : 'bg-slate-300'}`}
            >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300
                    ${checked ? 'right-1' : 'left-1'}`} />
            </div>
        </div>
    );
};

// Section Card Component
const SectionCard: React.FC<{
    title: string;
    icon: React.ElementType;
    iconColor?: string;
    children: React.ReactNode;
}> = ({ title, icon: Icon, iconColor = 'text-brand-primary', children }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className={`p-2 rounded-xl bg-brand-primary/10`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        {children}
    </div>
);



const SupplierItemFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const isEdit = !!id;

    // State

    const [saving, setSaving] = useState(false);
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [loadingItems, setLoadingItems] = useState(true);

    const [formData, setFormData] = useState<SupplierItemDto>({
        supplierId: 0,
        itemId: 0,
        supplierItemCode: '',
        lastPrice: 0,
        lastPriceDate: new Date().toISOString().split('T')[0],
        leadTimeDays: 0,
        minOrderQty: 0,
        isPreferred: false,
        isActive: true
    });

    // Load Data
    useEffect(() => {
        loadSuppliers();
        loadItems();
    }, []);

    const loadSuppliers = async () => {
        try {
            setLoadingSuppliers(true);
            const data = await supplierService.getAllSuppliers();
            setSuppliers(data.data || []);
        } catch (error) {
            console.error('Failed to load suppliers:', error);
            toast.error('فشل تحميل قائمة الموردين');
        } finally {
            setLoadingSuppliers(false);
        }
    };

    const loadItems = async () => {
        try {
            setLoadingItems(true);
            const data = await itemService.getActiveItems();
            setItems(data.data || []);
        } catch (error) {
            console.error('Failed to load items:', error);
            toast.error('فشل تحميل قائمة الأصناف');
        } finally {
            setLoadingItems(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.supplierId || !formData.itemId) {
            toast.error('يرجى اختيار المورد والصنف');
            return;
        }

        try {
            setSaving(true);
            await supplierService.linkItem(formData);
            toast.success('تم ربط الصنف بالمورد بنجاح', { icon: '🎉' });
            navigate('/dashboard/procurement/suppliers/items');
        } catch (error: any) {
            console.error('Failed to save supplier item:', error);
            toast.error(error.response?.data?.message || 'فشل حفظ البيانات');
        } finally {
            setSaving(false);
        }
    };

    const supplierOptions = suppliers.map(s => ({
        value: s.id!,
        label: `${s.supplierNameAr} (${s.supplierCode})`
    }));

    const itemOptions = items.map(i => ({
        value: i.id!,
        label: `${i.itemNameAr} (${i.itemCode})`
    }));

    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
    const selectedItem = items.find(i => i.id === formData.itemId);



    return (
        <div className="space-y-6">
            {/* Custom Styles */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Link2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isEdit ? 'تعديل ارتباط صنف' : 'ربط صنف جديد بمورد'}
                            </h1>
                            <p className="text-white/70 text-lg">تحديد الأسعار وشروط التوريد الخاصة بالمورد</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl 
                                font-bold hover:bg-white/20 transition-all border border-white/20"
                        >
                            <X className="w-5 h-5 inline-block ml-2" />
                            إلغاء
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-brand-primary 
                                rounded-xl font-bold hover:bg-white/90 transition-all
                                shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {saving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{saving ? 'جاري الحفظ...' : 'حفظ الارتباط'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Card - Shows when both supplier and item are selected */}
            {selectedSupplier && selectedItem && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 
                    rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <Sparkles className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-emerald-600 font-medium mb-1">معاينة الارتباط</div>
                            <div className="flex items-center gap-3 text-slate-800 font-bold">
                                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">
                                    {selectedSupplier.supplierNameAr}
                                </span>
                                <Link2 className="w-5 h-5 text-emerald-500" />
                                <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">
                                    {selectedItem.itemNameAr}
                                </span>
                            </div>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Selection Section */}
                <div className="lg:col-span-2">
                    <SectionCard title="بيانات الربط الأساسية" icon={Info}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect
                                label="المورد"
                                value={formData.supplierId}
                                onChange={(v) => setFormData({ ...formData, supplierId: parseInt(v) })}
                                icon={Truck}
                                options={supplierOptions}
                                placeholder="اختر المورد..."
                                required
                                loading={loadingSuppliers}
                            />

                            <FormSelect
                                label="الصنف"
                                value={formData.itemId}
                                onChange={(v) => setFormData({ ...formData, itemId: parseInt(v) })}
                                icon={Package}
                                options={itemOptions}
                                placeholder="اختر الصنف من المخزن..."
                                required
                                loading={loadingItems}
                            />
                        </div>
                    </SectionCard>
                </div>

                {/* Pricing Section */}
                <SectionCard title="الأسعار والكميات" icon={DollarSign} iconColor="text-emerald-600">
                    <div className="space-y-5">
                        <FormInput
                            label="آخر سعر توريد"
                            type="number"
                            step="0.0001"
                            value={formData.lastPrice || ''}
                            onChange={(v) => setFormData({ ...formData, lastPrice: parseFloat(v) || 0 })}
                            icon={DollarSign}
                            placeholder="0.0000"
                            hint={`السعر بـ (${getCurrencyLabel(selectedSupplier?.currency || defaultCurrency)}) للوحدة الواحدة`}
                        />

                        <FormInput
                            label="تاريخ آخر سعر"
                            type="date"
                            value={formData.lastPriceDate || ''}
                            onChange={(v) => setFormData({ ...formData, lastPriceDate: v })}
                            icon={Calendar}
                        />

                        <FormInput
                            label="أقل كمية طلب"
                            type="number"
                            step="0.001"
                            value={formData.minOrderQty || ''}
                            onChange={(v) => setFormData({ ...formData, minOrderQty: parseFloat(v) || 0 })}
                            icon={Hash}
                            placeholder="0.000"
                            hint="الحد الأدنى للكمية التي يقبلها المورد"
                        />
                    </div>
                </SectionCard>

                {/* Additional Details Section */}
                <SectionCard title="بيانات إضافية" icon={FileText} iconColor="text-amber-600">
                    <div className="space-y-5">
                        <FormInput
                            label="كود الصنف عند المورد"
                            value={formData.supplierItemCode || ''}
                            onChange={(v) => setFormData({ ...formData, supplierItemCode: v })}
                            icon={Tag}
                            placeholder="مثلاً: SUP-XP123"
                            hint="الكود المستخدم في نظام المورد"
                        />

                        <FormInput
                            label="مدة التوريد (بالأيام)"
                            type="number"
                            value={formData.leadTimeDays || ''}
                            onChange={(v) => setFormData({ ...formData, leadTimeDays: parseInt(v) || 0 })}
                            icon={Clock}
                            placeholder="0"
                            hint="المدة المتوقعة من تاريخ الطلب حتى الاستلام"
                        />
                    </div>
                </SectionCard>

                {/* Settings Section */}
                <div className="lg:col-span-2">
                    <SectionCard title="الإعدادات" icon={AlertCircle} iconColor="text-blue-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ToggleCard
                                label="مورد مفضل لهذا الصنف"
                                description="سيظهر هذا المورد كخيار أول في نظام عروض الأسعار"
                                checked={formData.isPreferred || false}
                                onChange={(v) => setFormData({ ...formData, isPreferred: v })}
                                icon={Star}
                                activeColor="amber"
                            />

                            <ToggleCard
                                label="ارتباط نشط"
                                description="يمكن استخدام هذا الارتباط في المشتريات"
                                checked={formData.isActive || false}
                                onChange={(v) => setFormData({ ...formData, isActive: v })}
                                icon={CheckCircle2}
                                activeColor="emerald"
                            />
                        </div>
                    </SectionCard>
                </div>
            </form>

            {/* Summary Footer */}
            {((formData.lastPrice || 0) > 0 || (formData.minOrderQty || 0) > 0 || (formData.leadTimeDays || 0) > 0) && (
                <div className="bg-gradient-to-l from-brand-primary/5 to-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-6">
                        {(formData.lastPrice || 0) > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-medium">آخر سعر</div>
                                    <div className="text-lg font-bold text-slate-800">
                                        {formatNumber(formData.lastPrice ?? 0)} {getCurrencyLabel(selectedSupplier?.currency || defaultCurrency)}
                                        {selectedSupplier?.currency && selectedSupplier.currency !== defaultCurrency && (
                                            <span className="text-xs text-slate-400 mr-2">
                                                (≈ {formatNumber(convertAmount(formData.lastPrice || 0, selectedSupplier.currency))} {getCurrencyLabel(defaultCurrency)})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(formData.lastPrice || 0) > 0 && (formData.minOrderQty || 0) > 0 && (
                            <div className="w-px h-10 bg-slate-200" />
                        )}

                        {(formData.minOrderQty || 0) > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Hash className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-medium">أقل كمية</div>
                                    <div className="text-lg font-bold text-slate-800">
                                        {formatNumber(formData.minOrderQty ?? 0)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(formData.minOrderQty || 0) > 0 && (formData.leadTimeDays || 0) > 0 && (
                            <div className="w-px h-10 bg-slate-200" />
                        )}

                        {(formData.leadTimeDays || 0) > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-medium">مدة التوريد</div>
                                    <div className="text-lg font-bold text-slate-800">
                                        {formData.leadTimeDays} يوم
                                    </div>
                                </div>
                            </div>
                        )}

                        {(formData.lastPrice || 0) > 0 && (formData.minOrderQty || 0) > 0 && (
                            <>
                                <div className="w-px h-10 bg-slate-200" />
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">قيمة أقل طلب</div>
                                        <div className="text-lg font-bold text-brand-primary">
                                            {formatNumber((formData.lastPrice ?? 0) * (formData.minOrderQty ?? 0))} {getCurrencyLabel(selectedSupplier?.currency || defaultCurrency)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierItemFormPage;