import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Plus, Save, Trash2, Package, Truck, Calendar, FileText,
    ArrowRight, Sparkles, X, RefreshCw, ChevronRight, DollarSign,
    Hash, Layers, ClipboardList, CheckCircle2
} from 'lucide-react';
import purchaseService, { type RFQ, type RFQItem, type Supplier } from '../../services/purchaseService';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';
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
    disabled?: boolean;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, type = 'text', disabled }) => {
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
                    disabled={disabled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                        ${Icon ? 'pr-12' : ''}
                        ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
            </div>
        </div>
    );
};

// Form Select Component
const FormSelect: React.FC<{
    label: string;
    value: number | string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    options: { value: number | string; label: string }[];
    placeholder?: string;
    required?: boolean;
    loading?: boolean;
    helperText?: React.ReactNode;
}> = ({ label, value, onChange, icon: Icon, options, placeholder, required, loading, helperText }) => {
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
            {helperText && (
                <div className="text-xs text-emerald-600 flex items-center gap-1">
                    {helperText}
                </div>
            )}
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

// Item Row Component
const ItemRow: React.FC<{
    item: RFQItem;
    index: number;
    items: ItemDto[];
    units: UnitDto[];
    supplierPrice?: number;
    onUpdate: (field: keyof RFQItem, value: any) => void;
    onRemove: () => void;
}> = ({ item, index, items, units, supplierPrice, onUpdate, onRemove }) => (
    <div
        className="p-5 bg-white rounded-2xl border-2 border-slate-100 relative group 
            transition-all duration-300 hover:shadow-lg hover:border-brand-primary/20"
        style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        {/* Remove Button */}
        <button
            type="button"
            onClick={onRemove}
            className="absolute -left-3 -top-3 p-2.5 bg-rose-100 text-rose-600 rounded-xl 
                opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg 
                hover:scale-110 hover:bg-rose-500 hover:text-white"
        >
            <Trash2 className="w-4 h-4" />
        </button>

        {/* Item Number Badge */}
        <div className="absolute -right-2 -top-2 w-8 h-8 bg-brand-primary text-white rounded-lg
            flex items-center justify-center text-sm font-bold shadow-lg">
            {index + 1}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
            {/* Item Select */}
            <div className="md:col-span-4 space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    الصنف
                </label>
                <select
                    value={item.itemId}
                    onChange={(e) => onUpdate('itemId', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 
                        focus:border-brand-primary outline-none bg-white font-medium transition-all"
                >
                    <option value={0}>اختر صنف...</option>
                    {items.map(i => (
                        <option key={i.id} value={i.id}>{i.itemNameAr} ({i.grade || i.itemCode || ''})</option>
                    ))}
                </select>
            </div>

            {/* Quantity */}
            <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" />
                    الكمية
                </label>
                <input
                    type="number"
                    value={item.requestedQty}
                    onChange={(e) => onUpdate('requestedQty', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 
                        focus:border-brand-primary outline-none bg-white font-medium transition-all"
                    min="0"
                    step="0.01"
                />
            </div>

            {/* Unit */}
            <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    الوحدة
                </label>
                <select
                    value={item.unitId}
                    onChange={(e) => onUpdate('unitId', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 
                        focus:border-brand-primary outline-none bg-white font-medium transition-all"
                >
                    <option value={0}>الوحدة...</option>
                    {units.map(u => (
                        <option key={u.id} value={u.id}>{u.unitNameAr}</option>
                    ))}
                </select>
            </div>

            {/* Estimated Price */}
            <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    السعر المتوقع
                    {supplierPrice && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                            كتالوج
                        </span>
                    )}
                </label>
                <input
                    type="number"
                    value={item.estimatedPrice || ''}
                    onChange={(e) => onUpdate('estimatedPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none font-medium transition-all
                        ${supplierPrice
                            ? 'border-emerald-200 bg-emerald-50/50 focus:border-emerald-400'
                            : 'border-slate-200 bg-white focus:border-brand-primary'}`}
                    min="0"
                    step="0.01"
                />
            </div>

            {/* Specifications */}
            <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    مواصفات
                </label>
                <input
                    type="text"
                    value={item.specifications || ''}
                    onChange={(e) => onUpdate('specifications', e.target.value)}
                    placeholder="اختياري..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 
                        focus:border-brand-primary outline-none bg-white font-medium transition-all"
                />
            </div>
        </div>
    </div>
);

// Empty Items State
const EmptyItemsState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Package className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">لا توجد بنود مضافة</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            ابدأ بالضغط على زر إضافة صنف لإضافة بنود طلب عرض السعر
        </p>
        <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white 
                rounded-xl font-bold hover:bg-brand-primary/90 transition-all
                shadow-lg shadow-brand-primary/30"
        >
            <Plus className="w-5 h-5" />
            إضافة صنف الآن
        </button>
    </div>
);

// Loading Skeleton
const FormSkeleton: React.FC = () => (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                        <div className="h-12 bg-slate-100 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
            <div className="space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
                ))}
            </div>
        </div>
    </div>
);

const RFQFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;

    const queryParams = new URLSearchParams(location.search);
    const prIdFromUrl = queryParams.get('prId');

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [supplierItems, setSupplierItems] = useState<SupplierItemDto[]>([]);
    const [loadingSupplierItems, setLoadingSupplierItems] = useState(false);

    const [formData, setFormData] = useState<RFQ>({
        supplierId: 0,
        rfqDate: new Date().toISOString().split('T')[0],
        responseDueDate: '',
        notes: '',
        items: []
    });

    useEffect(() => {
        loadDependencies();
        if (isEdit) {
            loadRFQ(parseInt(id));
        } else if (prIdFromUrl) {
            loadPRData(parseInt(prIdFromUrl));
        }
    }, [id, prIdFromUrl]);

    const loadDependencies = async () => {
        try {
            const [suppliersData, itemsData, unitsData] = await Promise.all([
                purchaseService.getAllSuppliers(),
                itemService.getAllItems(),
                unitService.getAllUnits()
            ]);
            setSuppliers(suppliersData);
            setItems(itemsData.data || []);
            setUnits(unitsData.data || []);
        } catch (error) {
            console.error('Failed to load dependencies:', error);
            toast.error('فشل تحميل البيانات الأساسية');
        }
    };

    const loadPRData = async (prId: number) => {
        try {
            setLoading(true);
            const pr = await purchaseService.getPRById(prId);
            if (pr) {
                setFormData(prev => ({
                    ...prev,
                    prId: pr.id,
                    prNumber: pr.prNumber,
                    notes: `تم الإنشاء بناءً على طلب شراء: ${pr.prNumber}`,
                    items: pr.items.map(pi => ({
                        itemId: pi.itemId,
                        requestedQty: pi.requestedQty,
                        unitId: pi.unitId,
                        specifications: pi.specifications || ''
                    }))
                }));
                toast.success('تم تحميل بيانات طلب الشراء', { icon: '📋' });
            }
        } catch (error) {
            console.error('Failed to load PR data:', error);
            toast.error('فشل تحميل بيانات طلب الشراء');
        } finally {
            setLoading(false);
        }
    };

    const loadRFQ = async (rfqId: number) => {
        try {
            setLoading(true);
            const data = await purchaseService.getRFQById(rfqId);
            setFormData(data);
        } catch (error) {
            console.error('Failed to load RFQ:', error);
            navigate('/dashboard/procurement/rfq');
        } finally {
            setLoading(false);
        }
    };

    const handleSupplierChange = async (supplierId: number) => {
        setFormData(prev => ({ ...prev, supplierId }));

        if (supplierId === 0) {
            setSupplierItems([]);
            return;
        }

        try {
            setLoadingSupplierItems(true);
            const result = await supplierService.getSupplierItems(supplierId);
            const fetchedItems = result.data || [];
            setSupplierItems(fetchedItems);

            if (fetchedItems.length > 0 && formData.items.length === 0) {
                const autoItems: RFQItem[] = fetchedItems.map(si => {
                    const itemData = items.find(i => i.id === si.itemId);
                    return {
                        itemId: si.itemId,
                        requestedQty: si.minOrderQty || 1,
                        unitId: itemData?.unitId || 0,
                        specifications: si.supplierItemCode ? `كود المورد: ${si.supplierItemCode}` : '',
                        estimatedPrice: si.lastPrice
                    };
                });
                setFormData(prev => ({ ...prev, items: autoItems }));
                toast.success(`تم تحميل ${fetchedItems.length} صنف من كتالوج المورد`, { icon: '📦' });
            }
        } catch (error) {
            console.error('Failed to load supplier items:', error);
        } finally {
            setLoadingSupplierItems(false);
        }
    };

    const addItem = () => {
        const newItem: RFQItem = {
            itemId: 0,
            requestedQty: 1,
            unitId: 0,
            specifications: ''
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, field: keyof RFQItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) {
                newItems[index].unitId = selectedItem.unitId;
            }
            const supplierItem = supplierItems.find(si => si.itemId === value);
            if (supplierItem?.lastPrice) {
                newItems[index].estimatedPrice = supplierItem.lastPrice;
            }
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const getSupplierPrice = (itemId: number): number | undefined => {
        return supplierItems.find(si => si.itemId === itemId)?.lastPrice;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.supplierId === 0) {
            toast.error('يرجى اختيار مورد');
            return;
        }

        if (formData.items.length === 0) {
            toast.error('يرجى إضافة بند واحد على الأقل');
            return;
        }

        try {
            setSaving(true);
            if (isEdit) {
                // Update logic
            } else {
                await purchaseService.createRFQ(formData);
            }
            toast.success('تم حفظ طلب عرض السعر بنجاح', { icon: '🎉' });
            navigate('/dashboard/procurement/rfq');
        } catch (error) {
            console.error('Failed to save RFQ:', error);
            toast.error('حدث خطأ أثناء حفظ البيانات');
        } finally {
            setSaving(false);
        }
    };

    const supplierOptions = suppliers.map(s => ({
        value: s.id!,
        label: `${s.supplierNameAr} (${s.supplierCode})`
    }));

    if (loading) return <FormSkeleton />;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
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
                            onClick={() => navigate('/dashboard/procurement/rfq')}
                            className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <ClipboardList className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isEdit ? `تعديل طلب عرض سعر #${formData.rfqNumber}` : 'إنشاء طلب عرض سعر جديد'}
                            </h1>
                            <p className="text-white/70 text-lg">أدخل تفاصيل الطلب والمورد والبنود المطلوبة</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/procurement/rfq')}
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
                            <span>{saving ? 'جاري الحفظ...' : 'حفظ الطلب'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* PR Reference Badge */}
            {formData.prNumber && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <span className="text-emerald-700 font-semibold">مرتبط بطلب شراء: </span>
                        <span className="text-emerald-800 font-bold">{formData.prNumber}</span>
                    </div>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Basic Info Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-brand-primary/10 rounded-xl">
                            <FileText className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">معلومات الطلب</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="المورد"
                            value={formData.supplierId}
                            onChange={(v) => handleSupplierChange(parseInt(v))}
                            icon={Truck}
                            options={supplierOptions}
                            placeholder="اختر المورد..."
                            required
                            loading={loadingSupplierItems}
                            helperText={supplierItems.length > 0 ? (
                                <>
                                    <Sparkles className="w-3 h-3" />
                                    هذا المورد لديه {supplierItems.length} صنف مسجل في الكتالوج
                                </>
                            ) : undefined}
                        />

                        <FormInput
                            label="تاريخ الطلب"
                            type="date"
                            value={formData.rfqDate?.split('T')[0] || ''}
                            onChange={(v) => setFormData(prev => ({ ...prev, rfqDate: v }))}
                            icon={Calendar}
                            required
                        />

                        <FormInput
                            label="تاريخ استحقاق الرد"
                            type="date"
                            value={formData.responseDueDate || ''}
                            onChange={(v) => setFormData(prev => ({ ...prev, responseDueDate: v }))}
                            icon={Calendar}
                        />

                        <FormTextarea
                            label="ملاحظات"
                            value={formData.notes || ''}
                            onChange={(v) => setFormData(prev => ({ ...prev, notes: v }))}
                            icon={FileText}
                            placeholder="أي ملاحظات إضافية..."
                            rows={1}
                        />
                    </div>
                </div>

                {/* Items Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-xl">
                                <Package className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">الأصناف والبنود</h2>
                                <p className="text-sm text-slate-500">{formData.items.length} بند</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-brand-primary 
                                bg-brand-primary/10 hover:bg-brand-primary hover:text-white
                                rounded-xl font-bold transition-all duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            <span>إضافة صنف</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <ItemRow
                                key={index}
                                item={item}
                                index={index}
                                items={items}
                                units={units}
                                supplierPrice={getSupplierPrice(item.itemId)}
                                onUpdate={(field, value) => updateItem(index, field, value)}
                                onRemove={() => removeItem(index)}
                            />
                        ))}

                        {formData.items.length === 0 && (
                            <EmptyItemsState onAdd={addItem} />
                        )}
                    </div>
                </div>

                {/* Summary Section */}
                {formData.items.length > 0 && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-slate-600">
                                    <span className="font-medium">إجمالي البنود: </span>
                                    <span className="font-bold text-slate-800">{formData.items.length}</span>
                                </div>
                                <div className="w-px h-6 bg-slate-300" />
                                <div className="text-slate-600">
                                    <span className="font-medium">إجمالي الكميات: </span>
                                    <span className="font-bold text-slate-800">
                                        {formData.items.reduce((sum, i) => sum + (i.requestedQty || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                {formData.items.some(i => i.estimatedPrice) && (
                                    <>
                                        <div className="w-px h-6 bg-slate-300" />
                                        <div className="text-slate-600">
                                            <span className="font-medium">القيمة التقديرية: </span>
                                            <span className="font-bold text-brand-primary">
                                                {formData.items
                                                    .reduce((sum, i) => sum + ((i.estimatedPrice || 0) * (i.requestedQty || 0)), 0)
                                                    .toLocaleString()} EGP
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default RFQFormPage;