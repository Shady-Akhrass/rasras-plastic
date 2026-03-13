import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight, Save, Package, Info, Scale, Barcode, DollarSign,
    Settings, Image as ImageIcon, RefreshCw, AlertCircle, CheckCircle2,
    X, Tag, Box, Percent, ShoppingCart, ShoppingBag, FileText,
    Layers, TrendingUp, Calculator, Microscope, Trash2, Plus, Truck, Zap
} from 'lucide-react';
import { itemService, type ItemDto } from '../../services/itemService';
import { itemCategoryService, type ItemCategoryDto } from '../../services/itemCategoryService';
import { unitService, type UnitDto } from '../../services/unitService';
import { qualityService, type QualityParameterDto, type ItemQualitySpecDto } from '../../services/qualityService';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import type { SupplierDto } from '../../services/supplierService';
import { exchangeRateService, type ItemPricingInfo } from '../../services/exchangeRateService';
import { useSystemSettings } from '../../hooks/useSystemSettings';
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
    noContainer?: boolean;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, type = 'text', dir, disabled, hint, colorClass, noContainer }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== null && value !== '' && value !== 0;

    const inputElement = (
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
    );

    if (noContainer) return inputElement;

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </label>
            {inputElement}
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
}> = ({ cost, salePrice }) => {
    const profit = salePrice - cost;
    const margin = cost > 0 ? ((profit / cost) * 100).toFixed(1) : '0';

    return (
        <div className="mt-4 p-4 bg-gradient-to-br from-brand-primary/5 to-white rounded-xl border border-brand-primary/20">
            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-primary" />
                حاسبة الأسعار التلقائية
            </p>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
        </div>
    );
};

const ItemFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id && id !== 'new';
    const { defaultCurrency, baseCurrency } = useSystemSettings();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [categories, setCategories] = useState<ItemCategoryDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'stock' | 'quality' | 'suppliers' | 'settings'>('basic');
    const [hasChanges, setHasChanges] = useState(false);
    const [syncSalePrice, setSyncSalePrice] = useState(false);
    const userEditedPricing = useRef(false);

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
        purchasePriceUsd: 0,
        purchaseExchangeRate: 0,
        targetProfitMarginPercentage: 0,
        isActive: true,
        isSellable: true,
        isPurchasable: true
    });

    const [marketRate, setMarketRate] = useState<number>(0);
    const [itemPricingInfo, setItemPricingInfo] = useState<ItemPricingInfo | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Use consolidated exchangeRateService instead of direct fetch
                const liveRate = await exchangeRateService.fetchLiveRate(baseCurrency, defaultCurrency);

                const [, , latest] = await Promise.all([
                    exchangeRateService.getEffectiveRate(30, 1.5),
                    exchangeRateService.getBufferPercentage(30, 1.5),
                    exchangeRateService.getLatestRate()
                ]);

                // Prioritize liveRate if fetch succeeded, otherwise use backend latest
                const finalMarketRate = liveRate > 0 ? liveRate : latest;
                setMarketRate(finalMarketRate);

                // Fetch per-item pricing info if editing an existing item
                if (isEdit && id) {
                    try {
                        const pricingInfo = await exchangeRateService.getItemPricingInfo(parseInt(id));
                        setItemPricingInfo(pricingInfo);
                    } catch (e) {
                        console.error('Failed to fetch item pricing info', e);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch exchange rates for pricing preview', error);
            }
        };
        if (activeTab === 'pricing') {
            fetchRates();
        }
    }, [activeTab, isEdit, id, baseCurrency, defaultCurrency]);

    // Recalculate prices when USD cost or rate changes to provide initial EGP values
    useEffect(() => {
        if (isEdit && !userEditedPricing.current) return;

        const usd = formData.purchasePriceUsd || 0;
        const rateToUse = (formData.purchaseExchangeRate && formData.purchaseExchangeRate > 0)
            ? formData.purchaseExchangeRate
            : marketRate;

        if (usd > 0 && rateToUse > 0) {
            const purchaseCost = usd * rateToUse;

            // Only auto-fill if the user hasn't started manually overriding these
            setFormData(prev => ({
                ...prev,
                lastPurchasePrice: parseFloat(purchaseCost.toFixed(2)),
                // We only auto-sync replacement price if it was 0 or just initialized
                replacementPrice: prev.replacementPrice === 0 ? parseFloat(purchaseCost.toFixed(2)) : prev.replacementPrice,
                // Sale price will follow via updateForm or a separate check
                purchaseExchangeRate: prev.purchaseExchangeRate === 0 ? rateToUse : prev.purchaseExchangeRate
            }));
        }
    }, [formData.purchasePriceUsd, formData.purchaseExchangeRate, marketRate]);

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
        const usdPrice = Number(formData.purchasePriceUsd) || 0;

        if (usdPrice < 0 || cost < 0 || purchase < 0 || sale < 0 || replacement < 0) {
            return { valid: false, error: 'الأسعار والتكاليف لا يمكن أن تكون سالبة' };
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
        if (field === 'purchasePriceUsd' || field === 'targetProfitMarginPercentage' || field === 'purchaseExchangeRate' || field === 'replacementPrice') {
            userEditedPricing.current = true;
        }

        setFormData(prev => {
            const next = { ...prev, [field]: value };

            // Recalculate Sale Price if replacement or margin changes AND sync is ON
            if (field === 'replacementPrice' || field === 'targetProfitMarginPercentage') {
                if (syncSalePrice) {
                    const replacement = field === 'replacementPrice' ? Number(value) : (prev.replacementPrice || 0);
                    const margin = field === 'targetProfitMarginPercentage' ? Number(value) : (prev.targetProfitMarginPercentage || 0);
                    next.lastSalePrice = parseFloat((replacement * (1 + margin / 100)).toFixed(2));
                }
            }

            // If purchasePriceUsd changed, we also suggest updating replacement for new items
            if (field === 'purchasePriceUsd') {
                const rate = prev.purchaseExchangeRate || marketRate;
                if (rate > 0) {
                    const cost = Number(value) * rate;
                    next.lastPurchasePrice = parseFloat(cost.toFixed(2));
                    // Update replacement if it's currently 0 or matches previous cost (auto-sync)
                    if (!prev.replacementPrice || prev.replacementPrice === parseFloat(((prev.purchasePriceUsd || 0) * rate).toFixed(2))) {
                        next.replacementPrice = parseFloat(cost.toFixed(2));
                        // Only sync sale price if toggle is on
                        if (syncSalePrice) {
                            next.lastSalePrice = parseFloat((next.replacementPrice * (1 + (prev.targetProfitMarginPercentage || 0) / 100)).toFixed(2));
                        }
                    }
                }
            }

            return next;
        });
    };

    const handleManualPriceSync = () => {
        const replacement = formData.replacementPrice || 0;
        const margin = formData.targetProfitMarginPercentage || 0;
        const sale = parseFloat((replacement * (1 + margin / 100)).toFixed(2));
        updateForm('lastSalePrice', sale);
        toast.success('تم تحديث سعر البيع بناءً على التكلفة الاستبدالية');
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
        <div className="w-full space-y-6 pb-24">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Pricing Strategy */}
                            <FormSection
                                title="إستراتيجية التسعير (البيع)"
                                icon={TrendingUp}
                                description="تحديد هامش الربح والضرائب"
                                badge="حماية الأرباح"
                            >
                                <div className="space-y-6">
                                    <FormInput
                                        label="هامش الربح المستهدف (%)"
                                        value={formData.targetProfitMarginPercentage || ''}
                                        onChange={(v) => updateForm('targetProfitMarginPercentage', parseFloat(v) || 0)}
                                        icon={Percent}
                                        type="number"
                                        placeholder="20"
                                        colorClass="border-brand-primary/20 bg-brand-primary/5"
                                        hint="النسبة المئوية للربح فوق التكلفة"
                                    />
                                    <FormInput
                                        label="نسبة الضريبة (VAT %)"
                                        value={formData.defaultVatRate || ''}
                                        onChange={(v) => updateForm('defaultVatRate', parseFloat(v) || 0)}
                                        icon={Percent}
                                        type="number"
                                        placeholder="14"
                                    />
                                </div>
                            </FormSection>

                            {/* Right Column: Purchase Item */}
                            <FormSection
                                title="شراء الصنف (التكلفة)"
                                icon={ShoppingCart}
                                description="بيانات التكلفة بالدولار وسعر الصرف"
                            >
                                <div className="space-y-6">
                                    <FormInput
                                        label="سعر الشراء ($ USD)"
                                        value={formData.purchasePriceUsd || ''}
                                        onChange={(v) => updateForm('purchasePriceUsd', parseFloat(v) || 0)}
                                        icon={DollarSign}
                                        type="number"
                                        placeholder="0.00"
                                        colorClass="border-emerald-200 bg-emerald-50/30"
                                        hint="سعر الشراء من المورد بالدولار"
                                    />
                                    <FormInput
                                        label="سعر صرف الشراء (التاريخي)"
                                        value={formData.purchaseExchangeRate || ''}
                                        onChange={(v) => updateForm('purchaseExchangeRate', parseFloat(v) || 0)}
                                        icon={RefreshCw}
                                        type="number"
                                        placeholder="0.00"
                                        hint="سعر صرف الدولار وقت الشراء الفعلي"
                                    />
                                </div>
                            </FormSection>
                        </div>

                        {/* Simplified Pricing Preview */}
                        {(formData.purchasePriceUsd || 0) > 0 && (formData.purchaseExchangeRate || marketRate) > 0 && (
                            <div className="mt-8 p-6 bg-brand-primary/5 rounded-2xl border-2 border-brand-primary/10 animate-in zoom-in-95 duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                                            <Calculator className="w-5 h-5 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">معاينة التكلفة والبيع</h4>
                                            <p className="text-xs text-slate-500">حساب فوري بناءً على سعر الشراء والعملة</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-400">سعر الصرف المستخدم</div>
                                        <div className="text-lg font-black text-brand-primary">
                                            {(formData.purchaseExchangeRate || marketRate).toFixed(3)}
                                            <span className="text-[10px] mr-1 opacity-60">EGP/$</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="text-xs text-slate-500 mb-1">تكلفة الشراء بالعملة المحلية (EGP)</div>
                                        <div className="text-xl font-bold text-slate-800">
                                            {((formData.purchasePriceUsd || 0) * (formData.purchaseExchangeRate || marketRate)).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                            <span className="text-xs mr-1 font-normal opacity-60">ج.م</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">هذه هي التكلفة التي سيتم بناء الربح عليها لضمان ثبات الهامش.</p>
                                    </div>

                                    <div className="p-4 bg-white rounded-xl border border-brand-primary/20 shadow-sm">
                                        <div className="text-xs text-brand-primary mb-1 font-bold">سعر البيع المقترح (EGP)</div>
                                        <div className="text-xl font-bold text-brand-primary">
                                            {((formData.purchasePriceUsd || 0) * (formData.purchaseExchangeRate || marketRate) * (1 + (formData.targetProfitMarginPercentage || 0) / 100)).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                            <span className="text-xs mr-1 font-normal opacity-60">ج.م</span>
                                        </div>
                                        <div className="text-[10px] text-brand-primary/70 mt-1">بإضافة هامش ربح {formData.targetProfitMarginPercentage}% على التكلفة الفعلية.</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Calculated Prices Summary Row */}
                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

                            <div className="flex items-center gap-2 mb-6 relative">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Calculator className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">الأسعار المحسوبة تلقائياً (EGP)</h4>
                                    <p className="text-[10px] text-slate-500">يتم تحديث هذه الحقول آلياً بناءً على بيانات السوق والشراء</p>
                                </div>
                                <span className="mr-auto text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold flex items-center gap-1">
                                    <RefreshCw className="w-2 h-2" />
                                    تحديث لحظي
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">التكلفة المتوسطة (EGP)</label>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold flex items-center justify-between">
                                        <span>{(formData.standardCost || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                                        <span className="text-[10px] text-slate-400 font-normal">MAC</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">المتوسط المرجح الفعلي في المخزن</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">تكلفة آخر شراء (EGP)</label>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold flex items-center justify-between">
                                        <span>{(formData.lastPurchasePrice || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                                        <ShoppingCart className="w-3.5 h-3.5 text-slate-300" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">بناءً على السعر التاريخي المسجل</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <FormInput
                                            label="السعر الاستبدالي (EGP)"
                                            value={formData.replacementPrice || ''}
                                            onChange={(v) => updateForm('replacementPrice', parseFloat(v) || 0)}
                                            icon={CheckCircle2}
                                            type="number"
                                            placeholder="0.00"
                                            hint="سعر استبدال الأصل بقيمته السوقية الحالية"
                                            colorClass="border-brand-primary/20 bg-brand-primary/5"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setSyncSalePrice(!syncSalePrice)}
                                            className={`p-1 rounded-md transition-colors ${syncSalePrice ? 'bg-brand-primary text-white' : 'bg-slate-200 text-slate-500'}`}
                                            title={syncSalePrice ? 'إيقاف المزامنة التلقائية' : 'تفعيل المزامنة التلقائية مع سعر البيع'}
                                        >
                                            <RefreshCw className={`w-4 h-4 ${syncSalePrice ? 'animate-spin-slow' : ''}`} />
                                        </button>
                                        <span className="text-[10px] text-slate-600 font-medium">
                                            {syncSalePrice ? 'مزامنة سعر البيع مفعلة' : 'مزامنة سعر البيع معطلة'}
                                        </span>
                                        {!syncSalePrice && (
                                            <button
                                                type="button"
                                                onClick={handleManualPriceSync}
                                                className="mr-auto text-[10px] px-2 py-1 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors font-bold flex items-center gap-1"
                                            >
                                                <Zap className="w-3 h-3" />
                                                تحديث السعر الآن
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">سعر البيع الحالي (EGP)</label>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold flex items-center justify-between">
                                        <FormInput
                                            label=""
                                            value={formData.lastSalePrice || ''}
                                            onChange={(v) => updateForm('lastSalePrice', parseFloat(v) || 0)}
                                            type="number"
                                            placeholder="0.00"
                                            noContainer
                                        />
                                        <ShoppingBag className="w-3.5 h-3.5 text-slate-300" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">شامل هامش ربح {formData.targetProfitMarginPercentage || 0}%</p>
                                </div>
                            </div>
                        </div>

                        <PriceCalculator
                            cost={formData.replacementPrice || 0}
                            salePrice={formData.lastSalePrice || 0}
                            vatRate={formData.defaultVatRate || 14}
                        />

                        {/* Per-Item Exchange Rate History */}
                        {isEdit && itemPricingInfo && itemPricingInfo.history && itemPricingInfo.history.length > 0 && (
                            <FormSection
                                title="سجل أسعار الصرف للصنف"
                                icon={TrendingUp}
                                description="تاريخ أسعار الصرف عند كل عملية شراء"
                                badge={`${itemPricingInfo.history.length} سجل`}
                            >
                                <div className="space-y-4">
                                    {/* Buffer Comparison */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <div className="text-xs text-emerald-600 font-bold mb-1">هامش أمان الصنف (Buffer)</div>
                                            <div className="text-2xl font-black text-emerald-700">
                                                {itemPricingInfo.itemBufferPercentage.toFixed(2)}%
                                            </div>
                                            <div className="text-[10px] text-emerald-500 mt-1">محسوب من تاريخ مشتريات هذا الصنف</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="text-xs text-slate-500 font-bold mb-1">هامش أمان السوق (العام)</div>
                                            <div className="text-2xl font-black text-slate-600">
                                                {itemPricingInfo.globalBufferPercentage.toFixed(2)}%
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">محسوب من سجل أسعار الصرف العام</div>
                                        </div>
                                    </div>

                                    {/* History Timeline */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm" dir="rtl">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="py-2 px-3 text-right font-bold text-slate-600">التاريخ</th>
                                                    <th className="py-2 px-3 text-right font-bold text-slate-600">سعر الصرف</th>
                                                    <th className="py-2 px-3 text-right font-bold text-slate-600">سعر الشراء ($)</th>
                                                    <th className="py-2 px-3 text-right font-bold text-slate-600">المصدر</th>
                                                    <th className="py-2 px-3 text-right font-bold text-slate-600">التغير</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemPricingInfo.history.map((entry, idx) => {
                                                    const prev = itemPricingInfo.history[idx + 1];
                                                    const change = prev
                                                        ? ((entry.exchangeRate - prev.exchangeRate) / prev.exchangeRate * 100)
                                                        : 0;
                                                    return (
                                                        <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                            <td className="py-2 px-3 text-slate-600">
                                                                {new Date(entry.recordedAt).toLocaleDateString('ar-EG', {
                                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                                })}
                                                            </td>
                                                            <td className="py-2 px-3 font-bold text-slate-800">
                                                                {entry.exchangeRate.toFixed(4)}
                                                            </td>
                                                            <td className="py-2 px-3 text-emerald-600 font-medium">
                                                                ${entry.purchasePriceUsd?.toFixed(4) || '-'}
                                                            </td>
                                                            <td className="py-2 px-3">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${entry.sourceType === 'INVOICE'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {entry.sourceType === 'INVOICE' ? 'فاتورة' : 'إذن إضافة'}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-3">
                                                                {prev ? (
                                                                    <span className={`font-bold text-xs ${change > 0 ? 'text-rose-600' : change < 0 ? 'text-emerald-600' : 'text-slate-400'
                                                                        }`}>
                                                                        {change > 0 ? '▲' : change < 0 ? '▼' : '—'} {Math.abs(change).toFixed(2)}%
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-300 text-xs">—</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                        <p>هامش أمان الصنف يُحسب تلقائياً من نسبة التغير اليومي في سعر الصرف بين كل عملية شراء والتالية لهذا الصنف تحديداً. إذا لم تتوفر بيانات كافية، يتم استخدام هامش السوق العام.</p>
                                    </div>
                                </div>
                            </FormSection>
                        )}
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
                <div className="fixed bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-96 
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