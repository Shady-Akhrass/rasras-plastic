import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight, Save, Package, Info, Scale, Barcode, DollarSign,
    Settings, Image as ImageIcon, RefreshCw, AlertCircle, CheckCircle2,
    X, Tag, Box, Percent, ShoppingCart, ShoppingBag, FileText,
    Layers, TrendingUp, Calculator, Microscope, Trash2, Plus, Truck
} from 'lucide-react';
import { itemService, type ItemDto } from '../../services/itemService';
import { itemCategoryService, type ItemCategoryDto } from '../../services/itemCategoryService';
import { unitService, type UnitDto } from '../../services/unitService';
import { qualityService, type QualityParameterDto, type ItemQualitySpecDto } from '../../services/qualityService';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import type { SupplierDto } from '../../services/supplierService';
import { toast } from 'react-hot-toast';

// Animated Input Component
const FormInput: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    required?: boolean;
    type?: string;
    dir?: string;
    disabled?: boolean;
    hint?: string;
    colorClass?: string;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, type = 'text', dir, disabled, hint, colorClass }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== null && value !== '' && value !== 0;

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
                    disabled={disabled}
                    dir={dir}
                    step={type === 'number' ? '0.01' : undefined}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                        disabled:bg-slate-100 disabled:cursor-not-allowed
                        ${Icon ? 'pr-12' : ''}
                        ${colorClass || ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : hasValue
                                ? 'border-brand-primary/30 bg-brand-primary/5'
                                : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
                {hasValue && !isFocused && type !== 'number' && (
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary" />
                )}
            </div>
            {hint && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {hint}
                </p>
            )}
        </div>
    );
};

// Category Select - يعرض نوع التصنيف (أساسي/فرعي) بخط صغير
const CategoryFormSelect: React.FC<{
    label: string;
    value: number | string;
    onChange: (value: string) => void;
    categories: ItemCategoryDto[];
    icon?: React.ElementType;
    required?: boolean;
    placeholder?: string;
}> = ({ label, value, onChange, categories, icon: Icon, required, placeholder }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const selected = categories.find(c => c.id === value || String(c.id) === String(value));
    const typeLabel = (cat: ItemCategoryDto) => cat.parentCategoryId ? 'فرعي' : 'أساسي';

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 transition-all duration-200
                        ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => { setIsFocused(false); setTimeout(() => setIsOpen(false), 150); }}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none text-right
                        appearance-none bg-white cursor-pointer flex items-center justify-between
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused || isOpen
                            ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 hover:border-slate-300'}`}
                >
                    <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
                        {selected ? selected.categoryNameAr : placeholder}
                    </span>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : 'rotate-[270deg]'}`} />
                </button>
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 py-1 bg-white border-2 border-brand-primary/30 rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); onChange(String(cat.id!)); setIsOpen(false); }}
                                className={`w-full px-4 py-2.5 text-right hover:bg-brand-primary/5 flex flex-col items-end gap-0.5 ${selected?.id === cat.id ? 'bg-brand-primary/10' : ''}`}
                            >
                                <span className="font-medium text-slate-800">{cat.categoryNameAr}</span>
                                <span className="text-[11px] text-slate-400 font-normal">{typeLabel(cat)}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Form Select Component
const FormSelect: React.FC<{
    label: string;
    value: number | string;
    onChange: (value: string) => void;
    options: { value: number | string; label: string }[];
    icon?: React.ElementType;
    required?: boolean;
    placeholder?: string;
}> = ({ label, value, onChange, options, icon: Icon, required, placeholder }) => {
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
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronRight className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400
                    transition-transform duration-200 rotate-90 ${isFocused ? 'rotate-[270deg]' : ''}`} />
            </div>
        </div>
    );
};

// Form Textarea Component
const FormTextarea: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    rows?: number;
}> = ({ label, value, onChange, icon: Icon, placeholder, rows = 3 }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-4 w-5 h-5 transition-all duration-200
                        ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none resize-none
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
            </div>
        </div>
    );
};

// Toggle Switch Component
const ToggleSwitch: React.FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: React.ElementType;
    activeColor?: string;
}> = ({ label, description, checked, onChange, icon: Icon, activeColor = 'bg-brand-primary' }) => (
    <div
        onClick={() => onChange(!checked)}
        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer
            transition-all duration-200 group
            ${checked
                ? 'border-brand-primary/30 bg-brand-primary/5'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
    >
        <div className="flex items-center gap-3">
            {Icon && (
                <div className={`p-2 rounded-lg transition-colors duration-200
                    ${checked ? 'bg-brand-primary/20 text-brand-primary' : 'bg-slate-200 text-slate-500'}`}>
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div>
                <span className={`font-semibold transition-colors duration-200
                    ${checked ? 'text-brand-primary' : 'text-slate-700'}`}>
                    {label}
                </span>
                {description && (
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
        </div>
        <div className={`relative w-14 h-7 rounded-full transition-colors duration-200
            ${checked ? activeColor : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200
                ${checked ? 'right-1' : 'left-1'}`} />
        </div>
    </div>
);

// Form Section Component
const FormSection: React.FC<{
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    description?: string;
    badge?: string;
}> = ({ title, icon: Icon, children, description, badge }) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm 
        transition-all duration-300 hover:shadow-lg hover:border-slate-300">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                        flex items-center justify-center text-brand-primary shadow-sm">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{title}</h3>
                        {description && (
                            <p className="text-xs text-slate-500">{description}</p>
                        )}
                    </div>
                </div>
                {badge && (
                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full">
                        {badge}
                    </span>
                )}
            </div>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

// Stock Level Indicator Component
const StockLevelIndicator: React.FC<{
    min: number;
    reorder: number;
    max: number;
}> = ({ min, reorder, max }) => (
    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-sm font-semibold text-slate-700 mb-3">مؤشر مستويات المخزون</p>
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
            {/* Min zone */}
            <div
                className="absolute h-full bg-rose-400"
                style={{ width: `${(min / (max || 100)) * 100}%` }}
            />
            {/* Reorder zone */}
            <div
                className="absolute h-full bg-amber-400"
                style={{ left: `${(min / (max || 100)) * 100}%`, width: `${((reorder - min) / (max || 100)) * 100}%` }}
            />
            {/* Normal zone */}
            <div
                className="absolute h-full bg-emerald-400"
                style={{ left: `${(reorder / (max || 100)) * 100}%`, right: 0 }}
            />
        </div>
        <div className="flex justify-between mt-2 text-xs">
            <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                حرج (0-{min})
            </span>
            <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                منخفض ({min}-{reorder})
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                متوفر ({reorder}-{max})
            </span>
        </div>
    </div>
);

// Price Calculator Component
const PriceCalculator: React.FC<{
    cost: number;
    salePrice: number;
    vatRate: number;
}> = ({ cost, salePrice, vatRate }) => {
    const profit = salePrice - cost;
    const margin = cost > 0 ? ((profit / cost) * 100).toFixed(1) : '0';
    const priceWithVat = salePrice * (1 + vatRate / 100);

    return (
        <div className="mt-4 p-4 bg-gradient-to-br from-brand-primary/5 to-white rounded-xl border border-brand-primary/20">
            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-primary" />
                حاسبة الأسعار التلقائية
            </p>
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">هامش الربح</p>
                    <p className={`text-lg font-bold ${parseFloat(margin) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {margin}%
                    </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">الربح للوحدة</p>
                    <p className={`text-lg font-bold ${profit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {profit.toFixed(2)}
                    </p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">السعر بالضريبة</p>
                    <p className="text-lg font-bold text-brand-primary">
                        {priceWithVat.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

const ItemFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id && id !== 'new');

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [categories, setCategories] = useState<ItemCategoryDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'stock' | 'quality' | 'suppliers' | 'settings'>('basic');
    const [hasChanges, setHasChanges] = useState(false);

    // Suppliers (الموردون المعتمدون) - مندوب المبيعات لا يرى هذا التبويب (يُخفى حسب الصلاحية لاحقاً)
    const [supplierItems, setSupplierItems] = useState<SupplierItemDto[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<SupplierDto[]>([]);
    const [isAddingSupplier, setIsAddingSupplier] = useState(false);
    const [linkSupplier, setLinkSupplier] = useState<{ supplierId: number; supplierItemCode: string }>({ supplierId: 0, supplierItemCode: '' });
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);

    // Quality Specs State
    const [specs, setSpecs] = useState<ItemQualitySpecDto[]>([]);
    const [availableParams, setAvailableParams] = useState<QualityParameterDto[]>([]);
    const [isAddingSpec, setIsAddingSpec] = useState(false);
    const [newSpec, setNewSpec] = useState<ItemQualitySpecDto>({
        itemId: 0,
        parameterId: 0,
        targetValue: 0,
        minValue: 0,
        maxValue: 0,
        isRequired: false
    });

    const [formData, setFormData] = useState<ItemDto>({
        itemNameAr: '',
        itemNameEn: '',
        grade: '',
        gradeName: '',
        mi2: 0,
        mi21: 0,
        density: 0,
        categoryId: 0,
        unitId: 0,
        barcode: '',
        description: '',
        technicalSpecs: '',
        minStockLevel: 0,
        maxStockLevel: 0,
        reorderLevel: 0,
        avgMonthlyConsumption: 0,
        standardCost: 0,
        lastPurchasePrice: 0,
        replacementPrice: 0,
        lastSalePrice: 0,
        defaultVatRate: 14,
        isActive: true,
        isSellable: true,
        isPurchasable: true
    });

    const [originalData, setOriginalData] = useState<ItemDto | null>(null);

    useEffect(() => {
        fetchInitialData();
        if (isEdit) {
            fetchItem();
        } else {
            setInitialLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (originalData) {
            setHasChanges(JSON.stringify(formData) !== JSON.stringify(originalData));
        }
    }, [formData, originalData]);

    const fetchInitialData = async () => {
        try {
            const [catsRes, unitsRes] = await Promise.all([
                itemCategoryService.getActiveCategories(),
                unitService.getAllUnits()
            ]);
            setCategories(catsRes.data || []);
            setUnits(unitsRes.data || []);

            const paramsRes = await qualityService.getActiveParameters();
            setAvailableParams(paramsRes.data || []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('فشل في تحميل بيانات التصنيفات والوحدات');
        }
    };

    const fetchItem = async () => {
        if (!id) return;
        try {
            setInitialLoading(true);
            const response = await itemService.getItemById(parseInt(id));
            if (response.data) {
                setFormData(response.data);
                setOriginalData(response.data);

                // Fetch existing specs
                const specsRes = await qualityService.getSpecsByItem(parseInt(id));
                setSpecs(specsRes.data || []);

                // الموردون المعتمدون لهذا الصنف
                try {
                    const siRes = await supplierService.getSupplierItemsByItem(parseInt(id));
                    setSupplierItems((siRes as any)?.data ?? []);
                } catch { setSupplierItems([]); }
                try {
                    const supRes = await supplierService.getAllSuppliers();
                    setAllSuppliers((supRes as any)?.data ?? []);
                } catch { setAllSuppliers([]); }
            }
        } catch (error) {
            console.error('Error fetching item:', error);
            toast.error('فشل في تحميل بيانات الصنف');
        } finally {
            setInitialLoading(false);
        }
    };

    /** فحص المدخلات قبل الحفظ */
    const validateForm = (): { valid: boolean; error?: string } => {
        const nameAr = (formData.itemNameAr || '').trim();

        if (!nameAr) return { valid: false, error: 'الاسم العربي مطلوب' };
        if (!formData.categoryId) return { valid: false, error: 'يرجى اختيار التصنيف' };
        if (!formData.unitId) return { valid: false, error: 'يرجى اختيار وحدة القياس' };

        const min = Number(formData.minStockLevel) || 0;
        const reorder = Number(formData.reorderLevel) || 0;
        const max = Number(formData.maxStockLevel) || 0;

        if (min <= 0 || reorder <= 0 || max <= 0) {
            return {
                valid: false,
                error: 'مستويات المخزون (الحد الأدنى، حد إعادة الطلب، الحد الأقصى) مطلوبة ويجب أن تكون أكبر من صفر'
            };
        }
        if (max > 0 && (min > reorder || reorder > max)) {
            return { valid: false, error: 'الحد الأدنى ≤ حد إعادة الطلب ≤ الحد الأقصى' };
        }

        const cost = Number(formData.standardCost) || 0;
        const purchase = Number(formData.lastPurchasePrice) || 0;
        const sale = Number(formData.lastSalePrice) || 0;
        const replacement = Number(formData.replacementPrice) || 0;
        if (cost < 0 || purchase < 0 || sale < 0 || replacement < 0) {
            return { valid: false, error: 'الأسعار والتكاليف لا يمكن أن تكون سالبة' };
        }
        if (cost <= 0 || purchase <= 0 || sale <= 0 || replacement <= 0) {
            return {
                valid: false,
                error: 'الأسعار والتكاليف (التكلفة المعيارية، آخر سعر شراء، آخر سعر بيع، السعر الاستبدالي) مطلوبة ويجب أن تكون أكبر من صفر'
            };
        }

        const vat = Number(formData.defaultVatRate) ?? 14;
        if (vat < 0 || vat > 100) {
            return { valid: false, error: 'نسبة الضريبة يجب أن تكون بين 0 و 100' };
        }

        const avg = Number(formData.avgMonthlyConsumption) || 0;
        if (avg < 0) return { valid: false, error: 'متوسط الاستهلاك الشهري لا يمكن أن يكون سالباً' };

        return { valid: true };
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const { valid, error } = validateForm();
        if (!valid) {
            toast.error(error || 'يرجى تصحيح المدخلات');
            return;
        }

        try {
            setLoading(true);
            if (isEdit && id) {
                await itemService.updateItem(parseInt(id), formData);
                toast.success('تم تحديث الصنف بنجاح', { icon: '🎉' });
            } else {
                await itemService.createItem(formData);
                toast.success('تم إضافة الصنف بنجاح', { icon: '🎉' });
            }
            navigate('/dashboard/inventory/items');
        } catch (error: any) {
            console.error('Error saving item:', error);
            const msg = error.response?.data?.message || error.message || 'فشل في حفظ الصنف';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const updateForm = (field: keyof ItemDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const tabs = [
        { id: 'basic', label: 'المعلومات الأساسية', icon: Info },
        { id: 'pricing', label: 'الأسعار والضرائب', icon: DollarSign },
        { id: 'stock', label: 'المخزون', icon: Scale },
        { id: 'quality', label: 'المواصفات الفنية', icon: Microscope },
        ...(isEdit ? [{ id: 'suppliers' as const, label: 'الموردون المعتمدون', icon: Truck }] : []),
        { id: 'settings', label: 'الإعدادات', icon: Settings },
    ];

    // Loading Skeleton
    if (initialLoading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div>
                            <div className="h-6 w-48 bg-slate-200 rounded mb-2" />
                            <div className="h-4 w-64 bg-slate-100 rounded" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 w-24 bg-slate-200 rounded-xl" />
                        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
                    </div>
                </div>
                <div className="h-14 bg-white rounded-xl border border-slate-200" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-white rounded-2xl border border-slate-200" />
                    <div className="h-64 bg-white rounded-2xl border border-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-6 text-white">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard/inventory/items')}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                                <Package className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {isEdit ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}
                                </h1>
                                <p className="text-white/70">
                                    {isEdit ? `تعديل: ${formData.itemNameAr || formData.grade || formData.itemCode}` : 'أدخل التفاصيل الفنية والمالية للصنف'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard/inventory/items')}
                            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl 
                                transition-colors font-medium flex items-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            إلغاء
                        </button>
                        <button
                            onClick={() => handleSubmit()}
                            disabled={loading || (!hasChanges && isEdit)}
                            className="px-6 py-2.5 bg-white text-brand-primary rounded-xl 
                                flex items-center gap-2 font-bold hover:bg-white/90 
                                transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {isEdit ? 'حفظ التغييرات' : 'إضافة الصنف'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200
                            ${activeTab === tab.id
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit}>
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <FormSection
                            title="المعلومات الأساسية"
                            icon={Info}
                            description="البيانات الرئيسية للصنف"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {isEdit && formData.itemCode && (
                                    <FormInput
                                        label="كود الصنف"
                                        value={formData.itemCode || ''}
                                        onChange={() => { }}
                                        icon={Barcode}
                                        disabled
                                        hint="يُولَّد تلقائياً ولا يمكن تعديله"
                                    />
                                )}
                                <FormInput
                                    label=" الجريد/ Grade"
                                    value={formData.grade || ''}
                                    onChange={(v) => updateForm('grade', v)}
                                    icon={Tag}
                                    placeholder="مثال: HP1106K"

                                />
                                <div className="md:col-span-2">
                                    <FormInput
                                        label="الاسم العربي"
                                        value={formData.itemNameAr}
                                        onChange={(v) => updateForm('itemNameAr', v)}
                                        icon={Package}
                                        placeholder="اسم الصنف باللغة العربية"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <FormInput
                                        label="الاسم الإنجليزي"
                                        value={formData.itemNameEn || ''}
                                        onChange={(v) => updateForm('itemNameEn', v)}
                                        icon={Package}
                                        placeholder="Item name in English"
                                        dir="ltr"
                                    />
                                </div>
                                <FormInput
                                    label="MFR (معدل تدفق الذوبان)"
                                    value={formData.gradeName ?? ''}
                                    onChange={(v) => updateForm('gradeName', v ? parseFloat(v) : undefined)}
                                    icon={Layers}
                                    type="number"
                                    placeholder="مثال: 12"
                                    hint="مقياس لسيولة البلاستيك المصهور"
                                />
                                <FormInput
                                    label="MI2"
                                    value={formData.mi2 || ''}
                                    onChange={(v) => updateForm('mi2', v)}
                                    icon={Scale}
                                    placeholder=" "
                                />
                                <FormInput
                                    label="MI21"
                                    value={formData.mi21 || ''}
                                    onChange={(v) => updateForm('mi21', v)}
                                    icon={Scale}
                                    placeholder=" "
                                />
                                <FormInput
                                    label="Density (الكثافة)"
                                    value={formData.density || ''}
                                    onChange={(v) => updateForm('density', v)}
                                    icon={Scale}
                                    placeholder=" "
                                />
                            </div>
                        </FormSection>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSection
                                title="التصنيف والوحدات"
                                icon={Tag}
                                description="تصنيف الصنف ووحدة القياس"
                            >
                                <div className="space-y-4">
                                    <CategoryFormSelect
                                        label="التصنيف"
                                        value={formData.categoryId || ''}
                                        onChange={(v) => updateForm('categoryId', parseInt(v) || 0)}
                                        categories={categories}
                                        icon={Layers}
                                        required
                                        placeholder="اختر التصنيف"
                                    />
                                    <FormSelect
                                        label="وحدة القياس الأساسية"
                                        value={formData.unitId || ''}
                                        onChange={(v) => updateForm('unitId', parseInt(v))}
                                        icon={Box}
                                        required
                                        placeholder="اختر الوحدة"
                                        options={units.map(unit => ({
                                            value: unit.id!,
                                            label: unit.unitNameAr
                                        }))}
                                    />
                                    <FormInput
                                        label="الباركود"
                                        value={formData.barcode || ''}
                                        onChange={(v) => updateForm('barcode', v)}
                                        icon={Barcode}
                                        placeholder="1234567890123"
                                        hint="رقم الباركود للمسح الضوئي"
                                    />
                                </div>
                            </FormSection>

                            <FormSection
                                title="تفاصيل إضافية"
                                icon={FileText}
                                description="وصف الصنف والمواصفات"
                            >
                                <div className="space-y-4">
                                    <FormTextarea
                                        label="وصف الصنف"
                                        value={formData.description || ''}
                                        onChange={(v) => updateForm('description', v)}
                                        icon={FileText}
                                        placeholder="وصف عام لمجال استخدام الصنف..."
                                        rows={3}
                                    />
                                    <FormTextarea
                                        label="التطبيقات النموذجية"
                                        value={formData.technicalSpecs || ''}
                                        onChange={(v) => updateForm('technicalSpecs', v)}
                                        icon={Settings}
                                        placeholder="الكثافة، درجة الانصهار، الشركة المصنعة..."
                                        rows={3}
                                    />
                                </div>
                            </FormSection>
                        </div>

                        <FormSection
                            title="صورة الصنف"
                            icon={ImageIcon}
                            description="رابط صورة الصنف (اختياري)"
                        >
                            <FormInput
                                label="رابط الصورة"
                                value={formData.imagePath || ''}
                                onChange={(v) => updateForm('imagePath', v)}
                                icon={ImageIcon}
                                placeholder="https://example.com/image.jpg"
                                dir="ltr"
                            />
                            {formData.imagePath && (
                                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-sm text-slate-600 mb-2">معاينة الصورة:</p>
                                    <img
                                        src={formData.imagePath}
                                        alt="معاينة"
                                        className="max-h-32 rounded-lg border border-slate-200"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </FormSection>
                    </div>
                )}

                {/* Pricing Tab */}
                {activeTab === 'pricing' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <FormSection
                            title="الأسعار والتكاليف"
                            icon={DollarSign}
                            description="أسعار الشراء والبيع والتكلفة"
                            badge="ج.م"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="التكلفة المعيارية"
                                    value={formData.standardCost || 0}
                                    onChange={(v) => updateForm('standardCost', parseFloat(v) || 0)}
                                    icon={DollarSign}
                                    type="number"
                                    placeholder="0.00"
                                    required
                                />
                                <FormInput
                                    label="آخر سعر شراء"
                                    value={formData.lastPurchasePrice || 0}
                                    onChange={(v) => updateForm('lastPurchasePrice', parseFloat(v) || 0)}
                                    icon={ShoppingCart}
                                    type="number"
                                    placeholder="0.00"
                                    required
                                />
                                <FormInput
                                    label="آخر سعر بيع"
                                    value={formData.lastSalePrice || 0}
                                    onChange={(v) => updateForm('lastSalePrice', parseFloat(v) || 0)}
                                    icon={ShoppingBag}
                                    type="number"
                                    placeholder="0.00"
                                    required
                                />
                                <FormInput
                                    label="السعر الاستبدالي"
                                    value={formData.replacementPrice || 0}
                                    onChange={(v) => updateForm('replacementPrice', parseFloat(v) || 0)}
                                    icon={TrendingUp}
                                    type="number"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <PriceCalculator
                                cost={formData.standardCost || formData.lastPurchasePrice || 0}
                                salePrice={formData.lastSalePrice || 0}
                                vatRate={formData.defaultVatRate || 0}
                            />

                            {/* تنبيه التقييم المزدوج: فرق كبير بين التكلفة التاريخية وسعر الإحلال */}
                            {(() => {
                                const hist = Number(formData.standardCost) || Number(formData.lastPurchasePrice) || 0;
                                const repl = Number(formData.replacementPrice) || 0;
                                const diffPct = hist > 0 ? Math.abs(repl - hist) / hist : 0;
                                if (diffPct >= 0.15 && (hist > 0 || repl > 0)) {
                                    return (
                                        <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-amber-800">تنبيه: فرق كبير في التقييم المزدوج</p>
                                                <p className="text-sm text-amber-700 mt-1">
                                                    التكلفة التاريخية (محاسبة): {hist.toLocaleString('ar-EG')} — سعر الإحلال (قرارات): {repl.toLocaleString('ar-EG')}.
                                                    الفرق ≈ {(diffPct * 100).toFixed(0)}%. راجع القيم عند الحاجة.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </FormSection>

                        <FormSection
                            title="الضرائب"
                            icon={Percent}
                            description="إعدادات الضريبة الافتراضية"
                        >
                            <div className="max-w-xs">
                                <FormInput
                                    label="نسبة ضريبة القيمة المضافة"
                                    value={formData.defaultVatRate || 14}
                                    onChange={(v) => updateForm('defaultVatRate', parseFloat(v) || 0)}
                                    icon={Percent}
                                    type="number"
                                    placeholder="14"
                                    hint="النسبة الافتراضية للضريبة على هذا الصنف"
                                />
                            </div>
                        </FormSection>
                    </div>
                )}

                {/* Stock Tab */}
                {activeTab === 'stock' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <FormSection
                            title="مستويات المخزون"
                            icon={Scale}
                            description="حدود المخزون للتنبيهات"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="الحد الأدنى"
                                    value={formData.minStockLevel || 0}
                                    onChange={(v) => updateForm('minStockLevel', parseFloat(v) || 0)}
                                    icon={AlertCircle}
                                    type="number"
                                    placeholder="0"
                                    required
                                    hint="تنبيه عند الوصول لهذا المستوى"
                                    colorClass="text-rose-600 font-bold"
                                />
                                <FormInput
                                    label="حد إعادة الطلب"
                                    value={formData.reorderLevel || 0}
                                    onChange={(v) => updateForm('reorderLevel', parseFloat(v) || 0)}
                                    icon={RefreshCw}
                                    type="number"
                                    placeholder="0"
                                    required
                                    hint="مستوى طلب إعادة التوريد"
                                    colorClass="text-amber-600 font-bold"
                                />
                                <FormInput
                                    label="الحد الأقصى"
                                    value={formData.maxStockLevel || 0}
                                    onChange={(v) => updateForm('maxStockLevel', parseFloat(v) || 0)}
                                    icon={TrendingUp}
                                    type="number"
                                    placeholder="0"
                                    required
                                    hint="الحد الأقصى للمخزون"
                                    colorClass="text-emerald-600 font-bold"
                                />
                                <FormInput
                                    label="متوسط الاستهلاك الشهري"
                                    value={formData.avgMonthlyConsumption || 0}
                                    onChange={(v) => updateForm('avgMonthlyConsumption', parseFloat(v) || 0)}
                                    icon={TrendingUp}
                                    type="number"
                                    placeholder="0"
                                    hint="لحساب توقعات الطلب"
                                />
                            </div>

                            <StockLevelIndicator
                                min={formData.minStockLevel || 0}
                                reorder={formData.reorderLevel || 0}
                                max={formData.maxStockLevel || 100}
                            />
                        </FormSection>
                    </div>
                )}

                {/* Quality Specs Tab */}
                {activeTab === 'quality' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 font-readex">
                        <FormSection
                            title="مواصفات الجودة"
                            icon={Microscope}
                            description="تحديد المعايير الفنية المطلوب توفرها في المنتج"
                        >
                            <div className="space-y-4">
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-right">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500">مواصفة الجودة</th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500">القيمة المستهدفة</th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500">المدى (Min-Max)</th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 text-center">إلزامي</th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 text-center">إجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {specs.map((spec) => (
                                                <tr key={spec.id} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 text-sm">
                                                        <p className="font-bold text-slate-900">{spec.parameterNameAr}</p>
                                                        <p className="text-xs text-slate-400">{spec.unit}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{spec.targetValue || '---'}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {spec.dataType === 'NUMERIC' ? (
                                                            <span className="font-readex text-slate-600">
                                                                {spec.minValue} - {spec.maxValue}
                                                            </span>
                                                        ) : '---'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {spec.isRequired ? (
                                                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full">نعم</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full">لا</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (spec.id) {
                                                                    try {
                                                                        await qualityService.deleteSpec(spec.id);
                                                                        setSpecs(specs.filter(s => s.id !== spec.id));
                                                                        toast.success('تم حذف المواصفة');
                                                                    } catch (err) {
                                                                        toast.error('فشل الحذف');
                                                                    }
                                                                }
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {specs.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm font-readex">
                                                        لم يتم إضافة مواصفات جودة لهذا الصنف حتى الآن
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {!isAddingSpec ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingSpec(true)}
                                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl 
                                            text-slate-500 hover:border-brand-primary hover:text-brand-primary 
                                            hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2 font-medium font-readex"
                                    >
                                        <Plus className="w-5 h-5" />
                                        إضافة مواصفة جديدة
                                    </button>
                                ) : (
                                    <div className="p-6 bg-slate-50 rounded-2xl border-2 border-brand-primary/20 space-y-4 animate-in zoom-in-95 duration-200">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                            <h4 className="font-bold text-slate-800 font-readex">إضافة مواصفة فنية</h4>
                                            <button onClick={() => setIsAddingSpec(false)} className="text-slate-400 hover:text-slate-600">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 font-readex">اختر المعامل *</label>
                                                <select
                                                    value={newSpec.parameterId}
                                                    onChange={(e) => setNewSpec({ ...newSpec, parameterId: parseInt(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand-primary/20 font-readex text-right"
                                                    dir="rtl"
                                                >
                                                    <option value="0">اختر...</option>
                                                    {availableParams.map(p => (
                                                        <option key={p.id} value={p.id}>{p.parameterNameAr} ({p.unit})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 font-readex">القيمة المستهدفة</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    value={newSpec.targetValue}
                                                    onChange={(e) => setNewSpec({ ...newSpec, targetValue: parseFloat(e.target.value) || 0 })}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 font-readex"
                                                    placeholder="مثال: 0.95"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 font-readex">الحد الأدنى (Min)</label>
                                                <input
                                                    type="number"
                                                    value={newSpec.minValue}
                                                    onChange={(e) => setNewSpec({ ...newSpec, minValue: parseFloat(e.target.value) || 0 })}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 font-readex"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 font-readex">الحد الأقصى (Max)</label>
                                                <input
                                                    type="number"
                                                    value={newSpec.maxValue}
                                                    onChange={(e) => setNewSpec({ ...newSpec, maxValue: parseFloat(e.target.value) || 0 })}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary/20 font-readex"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                            <input
                                                type="checkbox"
                                                checked={newSpec.isRequired}
                                                onChange={(e) => setNewSpec({ ...newSpec, isRequired: e.target.checked })}
                                                id="required-check-spec"
                                                className="w-4 h-4 text-brand-primary rounded"
                                            />
                                            <label htmlFor="required-check-spec" className="text-sm font-medium text-slate-700 font-readex">هذه المواصفة إلزامية لفحص الجودة</label>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!newSpec.parameterId) {
                                                        toast.error('يرجى اختيار المعامل أولاً');
                                                        return;
                                                    }
                                                    if (!id || id === 'new') {
                                                        toast.error('يرجى حفظ الصنف أولاً قبل إضافة المواصفات');
                                                        return;
                                                    }
                                                    try {
                                                        const res = await qualityService.createSpec({ ...newSpec, itemId: parseInt(id) });
                                                        setSpecs([...specs, res.data]);
                                                        setIsAddingSpec(false);
                                                        setNewSpec({ itemId: 0, parameterId: 0, targetValue: 0, minValue: 0, maxValue: 0, isRequired: false });
                                                        toast.success('تمت إضافة المواصفة بنجاح');
                                                    } catch (err) {
                                                        toast.error('فشل إضافة المواصفة');
                                                    }
                                                }}
                                                className="flex-1 py-2 bg-brand-primary text-white rounded-lg font-bold shadow-lg shadow-brand-primary/20 font-readex"
                                            >
                                                حفظ المواصفة
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingSpec(false)}
                                                className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-lg font-bold font-readex"
                                            >
                                                إلغاء
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FormSection>
                    </div>
                )}

                {/* الموردون المعتمدون (لا يرى مندوب المبيعات هذا التبويب) */}
                {activeTab === 'suppliers' && isEdit && id && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <FormSection
                            title="الموردون المعتمدون لهذا الصنف"
                            icon={Truck}
                            description="إدارة الموردين الذين يوردون هذا الصنف؛ مندوب المبيعات لا يرى الموردين"
                        >
                            <div className="space-y-4">
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-right">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500">المورد</th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500">كود الصنف لدى المورد</th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500">آخر سعر</th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 text-center">مفضل</th>
                                                <th className="px-4 py-3 text-xs font-bold text-slate-500 text-center">إجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {supplierItems.map((si) => (
                                                <tr key={si.id} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-medium text-slate-800">{si.supplierNameAr || `#${si.supplierId}`}</td>
                                                    <td className="px-4 py-3 text-slate-600">{si.supplierItemCode || '—'}</td>
                                                    <td className="px-4 py-3">{si.lastPrice != null ? Number(si.lastPrice).toLocaleString('ar-EG') : '—'}</td>
                                                    <td className="px-4 py-3 text-center">{si.isPreferred ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs">نعم</span> : '—'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (!si.id) return;
                                                                if (!window.confirm('إلغاء ربط هذا المورد بالصنف؟')) return;
                                                                try {
                                                                    await supplierService.unlinkItem(si.id);
                                                                    setSupplierItems(supplierItems.filter(s => s.id !== si.id));
                                                                    toast.success('تم إلغاء الربط');
                                                                } catch {
                                                                    toast.error('فشل إلغاء الربط');
                                                                }
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {supplierItems.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                                                        لا يوجد موردون معتمدون لهذا الصنف حتى الآن
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {!isAddingSupplier ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingSupplier(true)}
                                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Plus className="w-5 h-5" /> إضافة مورد معتمد
                                    </button>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-xl border-2 border-brand-primary/20 space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                            <h4 className="font-bold text-slate-800">ربط مورد بالصنف</h4>
                                            <button type="button" onClick={() => { setIsAddingSupplier(false); setLinkSupplier({ supplierId: 0, supplierItemCode: '' }); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">المورد *</label>
                                                <select
                                                    value={linkSupplier.supplierId || ''}
                                                    onChange={(e) => setLinkSupplier({ ...linkSupplier, supplierId: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                                >
                                                    <option value="">اختر المورد...</option>
                                                    {allSuppliers.filter(s => !supplierItems.some(si => si.supplierId === s.id)).map(s => (
                                                        <option key={s.id} value={s.id}>{s.supplierNameAr} {s.supplierCode ? `(${s.supplierCode})` : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">كود الصنف لدى المورد</label>
                                                <input
                                                    type="text"
                                                    value={linkSupplier.supplierItemCode}
                                                    onChange={(e) => setLinkSupplier({ ...linkSupplier, supplierItemCode: e.target.value })}
                                                    placeholder="اختياري"
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!linkSupplier.supplierId) { toast.error('اختر المورد'); return; }
                                                    if (!id) return;
                                                    setLoadingSuppliers(true);
                                                    try {
                                                        const res = await supplierService.linkItem({ supplierId: linkSupplier.supplierId, itemId: parseInt(id), supplierItemCode: linkSupplier.supplierItemCode || undefined } as any);
                                                        const added = (res as any)?.data ?? res;
                                                        setSupplierItems(prev => [...prev, { ...added, supplierNameAr: allSuppliers.find(s => s.id === linkSupplier.supplierId)?.supplierNameAr }]);
                                                        setIsAddingSupplier(false);
                                                        setLinkSupplier({ supplierId: 0, supplierItemCode: '' });
                                                        toast.success('تم ربط المورد');
                                                    } catch {
                                                        toast.error('فشل ربط المورد');
                                                    } finally {
                                                        setLoadingSuppliers(false);
                                                    }
                                                }}
                                                disabled={loadingSuppliers}
                                                className="flex-1 py-2 bg-brand-primary text-white rounded-lg font-bold disabled:opacity-50"
                                            >
                                                {loadingSuppliers ? 'جاري...' : 'ربط المورد'}
                                            </button>
                                            <button type="button" onClick={() => { setIsAddingSupplier(false); setLinkSupplier({ supplierId: 0, supplierItemCode: '' }); }} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg font-bold">إلغاء</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FormSection>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <FormSection
                            title="حالة الصنف"
                            icon={Settings}
                            description="إعدادات التفعيل والخصائص"
                        >
                            <div className="space-y-4">
                                <ToggleSwitch
                                    label="صنف نشط"
                                    description="يظهر الصنف في العمليات والتقارير"
                                    checked={formData.isActive}
                                    onChange={(v) => updateForm('isActive', v)}
                                    icon={CheckCircle2}
                                    activeColor="bg-emerald-500"
                                />
                                <ToggleSwitch
                                    label="قابل للبيع"
                                    description="يمكن إضافة الصنف في فواتير البيع"
                                    checked={formData.isSellable}
                                    onChange={(v) => updateForm('isSellable', v)}
                                    icon={ShoppingBag}
                                />
                                <ToggleSwitch
                                    label="قابل للشراء"
                                    description="يمكن إضافة الصنف في أوامر الشراء"
                                    checked={formData.isPurchasable}
                                    onChange={(v) => updateForm('isPurchasable', v)}
                                    icon={ShoppingCart}
                                />
                            </div>
                        </FormSection>
                    </div>
                )}
            </form>

            {/* Floating Save Button for Mobile */}
            <div className="fixed bottom-6 left-6 right-6 md:hidden z-50">
                <button
                    onClick={() => handleSubmit()}
                    disabled={loading || (!hasChanges && isEdit)}
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold
                        shadow-xl shadow-brand-primary/30 disabled:opacity-50 
                        flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {isEdit ? 'حفظ التغييرات' : 'إضافة الصنف'}
                </button>
            </div>

            {/* Unsaved Changes Warning */}
            {hasChanges && (
                <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 
                    bg-brand-primary text-white p-4 rounded-xl shadow-xl shadow-brand-primary/30 
                    flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300 z-40
                    md:bottom-6">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium">تغييرات غير محفوظة</p>
                        <p className="text-sm text-white/80">لا تنسَ حفظ التغييرات</p>
                    </div>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading}
                        className="px-4 py-2 bg-white text-brand-primary rounded-lg font-medium 
                            hover:bg-white/90 transition-colors"
                    >
                        حفظ
                    </button>
                </div>
            )}
        </div>
    );
};

export default ItemFormPage;