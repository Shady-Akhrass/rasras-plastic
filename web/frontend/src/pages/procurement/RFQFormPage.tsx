import React, { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save, Trash2, Package, Truck, FileText,
    ArrowRight, Sparkles, X, RefreshCw, DollarSign,
    Hash, Layers, ClipboardList, CheckCircle2, Check, Search, Users, Eye,
    AlertCircle, Zap, Link2, ChevronDown, BadgeDollarSign
} from 'lucide-react';
import purchaseService, { type RFQ, type RFQItem, type Supplier } from '../../services/purchaseService';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';
import { approvalService } from '../../services/approvalService';
import { formatNumber } from '../../utils/format';
import toast from 'react-hot-toast';

// ─── Shared Styles/Components ──────────────────────────────────────────────

/**
 * Hook for managing optimistic UI actions with loading and error states
 */
function useOptimisticAction() {
    const [isPending, setIsPending] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const execute = useCallback(async <T,>(
        tasks: (() => Promise<T>)[],
        options?: {
            onSuccess?: (result: T, index: number) => void;
            onError?: (error: any, index: number) => void;
            delayBetween?: number;
        }
    ): Promise<{ successes: number; failures: { index: number; error: any }[] }> => {
        setIsPending(true);
        setProgress({ current: 0, total: tasks.length });

        const failures: { index: number; error: any }[] = [];
        let successes = 0;

        for (let i = 0; i < tasks.length; i++) {
            try {
                const result = await tasks[i]();
                successes++;
                options?.onSuccess?.(result, i);
            } catch (error) {
                failures.push({ index: i, error });
                options?.onError?.(error, i);
            }
            setProgress({ current: i + 1, total: tasks.length });

            if (i < tasks.length - 1 && options?.delayBetween) {
                await new Promise(r => setTimeout(r, options.delayBetween));
            }
        }

        setIsPending(false);
        setProgress({ current: 0, total: 0 });
        return { successes, failures };
    }, []);

    return { isPending, progress, execute };
}

// ─── Progress Bar ───────────────────────────────────────────────────────────
const SubmitProgress: React.FC<{ current: number; total: number; isPending: boolean }> = ({ current, total, isPending }) => {
    if (!isPending || total <= 1) return null;
    const pct = total > 0 ? (current / total) * 100 : 0;
    return (
        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-brand-primary">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري إنشاء الطلبات...
                </div>
                <span className="text-sm font-bold text-brand-primary">{formatNumber(current)}/{formatNumber(total)}</span>
            </div>
            <div className="h-2 bg-brand-primary/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

// ─── Price Update Banner ────────────────────────────────────────────────────
const PriceUpdateBanner: React.FC<{ count: number; visible: boolean }> = ({ count, visible }) => {
    if (!visible || count === 0) return null;
    return (
        <div className="bg-gradient-to-l from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-4 
            flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-2.5 bg-emerald-100 rounded-xl animate-bounce">
                <BadgeDollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
                <span className="text-emerald-700 font-semibold">تم تحديث الأسعار تلقائياً — </span>
                <span className="text-emerald-800 font-black">{formatNumber(count)} صنف</span>
                <span className="text-emerald-700 font-semibold"> تم ملء أسعاره من كتالوج المورد</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 rounded-lg border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">تلقائي</span>
            </div>
        </div>
    );
};

// ─── Multi Select Dropdown ──────────────────────────────────────────────────
const MultiSelectDropdown: React.FC<{
    label: string;
    options: { value: number; label: string; code?: string }[];
    selectedValues: number[];
    onChange: (values: number[]) => void;
    icon?: React.ElementType;
    placeholder?: string;
    required?: boolean;
    loading?: boolean;
    disabled?: boolean;
}> = ({ label, options, selectedValues, onChange, icon: Icon, placeholder, required, loading, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt.code && opt.code.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [options, searchTerm]);

    const toggleOption = (value: number) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const selectAll = () => onChange(filteredOptions.map(opt => opt.value));
    const deselectAll = () => onChange([]);

    const selectedLabels = options
        .filter(opt => selectedValues.includes(opt.value))
        .map(opt => opt.label);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isOpen ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-200 z-10
                        ${isOpen ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none
                        text-right bg-white flex items-center justify-between
                        ${Icon ? 'pr-12' : ''}
                        ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'cursor-pointer'}
                        ${isOpen
                            ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <div className="flex-1 truncate">
                        {selectedValues.length === 0 ? (
                            <span className="text-slate-400">{placeholder || 'اختر...'}</span>
                        ) : selectedValues.length === 1 ? (
                            <span className="text-slate-800 font-medium">{selectedLabels[0]}</span>
                        ) : (
                            <span className="text-slate-800 font-medium">
                                تم اختيار {formatNumber(selectedValues.length)} مورد
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedValues.length > 0 && (
                            <span className="px-2.5 py-1 bg-brand-primary text-white text-xs font-bold rounded-lg shadow-sm">
                                {formatNumber(selectedValues.length)}
                            </span>
                        )}
                        {loading ? (
                            <RefreshCw className="w-4 h-4 text-brand-primary animate-spin" />
                        ) : (
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200
                                ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                    </div>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 
                            shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-3 border-b border-slate-100">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="بحث في الموردين..."
                                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 
                                            focus:border-brand-primary outline-none text-sm bg-slate-50 focus:bg-white transition-all"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className="text-xs text-slate-500 font-medium">
                                    {formatNumber(filteredOptions.length)} مورد متاح
                                </span>
                                <div className="flex gap-1">
                                    <button type="button" onClick={selectAll}
                                        className="px-3 py-1.5 text-xs font-bold text-brand-primary 
                                            hover:bg-brand-primary/10 rounded-lg transition-colors">
                                        تحديد الكل
                                    </button>
                                    <button type="button" onClick={deselectAll}
                                        className="px-3 py-1.5 text-xs font-bold text-slate-500 
                                            hover:bg-slate-100 rounded-lg transition-colors">
                                        إلغاء الكل
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(opt => {
                                        const isSelected = selectedValues.includes(opt.value);
                                        return (
                                            <div key={opt.value} onClick={() => toggleOption(opt.value)}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
                                                    ${isSelected
                                                        ? 'bg-brand-primary/5 border-r-4 border-brand-primary'
                                                        : 'hover:bg-slate-50 border-r-4 border-transparent'}`}>
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center
                                                    transition-all duration-200
                                                    ${isSelected
                                                        ? 'bg-brand-primary border-brand-primary text-white scale-110'
                                                        : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`font-medium text-sm ${isSelected ? 'text-brand-primary' : 'text-slate-800'}`}>
                                                        {opt.label}
                                                    </div>
                                                    {opt.code && <div className="text-xs text-slate-400 font-mono">{opt.code}</div>}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-400 text-sm">لا توجد نتائج</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedValues.length > 0 && !disabled && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {options
                        .filter(opt => selectedValues.includes(opt.value))
                        .slice(0, 5)
                        .map(opt => (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 
                                    text-brand-primary text-xs font-bold rounded-xl border border-brand-primary/10"
                            >
                                {opt.label}
                                <button type="button"
                                    onClick={(e) => { e.stopPropagation(); toggleOption(opt.value); }}
                                    className="hover:bg-brand-primary/20 rounded-full p-0.5 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    {selectedValues.length > 5 && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                            +{selectedValues.length - 5} آخرين
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Form Input ─────────────────────────────────────────────────────────────
const FormInput: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    required?: boolean;
    type?: string;
    disabled?: boolean;
    min?: string;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, type = 'text', disabled, min }) => {
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
                    type={type} value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder} required={required} disabled={disabled} min={min}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none
                        ${Icon ? 'pr-12' : ''}
                        ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                />
            </div>
        </div>
    );
};

// ─── Form Textarea ──────────────────────────────────────────────────────────
const FormTextarea: React.FC<{
    label: string; value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string; rows?: number; disabled?: boolean;
}> = ({ label, value, onChange, icon: Icon, placeholder, rows = 3, disabled }) => {
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
                <textarea value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder} rows={rows} disabled={disabled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none resize-none
                        ${Icon ? 'pr-12' : ''}
                        ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                />
            </div>
        </div>
    );
};

// ─── Item Row ───────────────────────────────────────────────────────────────
const ItemRow: React.FC<{
    item: RFQItem;
    index: number;
    items: ItemDto[];
    units: UnitDto[];
    usedItemIds: number[];
    supplierPrice?: number;
    disabled?: boolean;
    lockItemFields?: boolean;
    priceJustUpdated?: boolean;
    onUpdate: (field: keyof RFQItem, value: any) => void;
    onRemove: () => void;
}> = ({
    item, index, items, units, usedItemIds, supplierPrice,
    disabled, lockItemFields, priceJustUpdated, onUpdate, onRemove
}) => {
        const availableItems = items.filter(i => i.id === item.itemId || !usedItemIds.includes(i.id!));
        const lineTotal = (item.estimatedPrice || 0) * (item.requestedQty || 0);
        const selectedItemName = items.find(i => i.id === item.itemId)?.itemNameAr;

        return (
            <div
                className="relative group transition-all duration-300"
                style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.4s ease-out forwards',
                    opacity: 0
                }}
            >
                <div className={`p-5 rounded-2xl border-2 transition-all duration-300
                ${priceJustUpdated
                        ? 'bg-emerald-50/30 border-emerald-200 shadow-lg shadow-emerald-500/10'
                        : disabled
                            ? 'bg-slate-50/50 border-slate-100'
                            : 'bg-white border-slate-100 hover:shadow-lg hover:border-brand-primary/20 group-hover:bg-gradient-to-l group-hover:from-brand-primary/[0.02] group-hover:to-transparent'
                    }`}>

                    <div className="absolute -right-2 -top-2 w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-primary/80 
                    text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-brand-primary/30
                    group-hover:scale-110 transition-transform">
                        {formatNumber(index + 1)}
                    </div>

                    {!disabled && !lockItemFields && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="absolute -left-2 -top-2 w-8 h-8 bg-white border border-slate-200 text-slate-400 
                            hover:text-rose-500 hover:border-rose-200 rounded-xl flex items-center justify-center
                            shadow-sm hover:shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                        <div className="md:col-span-3 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                                <Package className="w-3 h-3" /> الصنف
                            </label>
                            <select
                                value={item.itemId}
                                disabled={disabled || lockItemFields}
                                onChange={(e) => onUpdate('itemId', parseInt(e.target.value))}
                                className={`w-full px-3 py-2.5 rounded-xl border-2 border-slate-200
                                focus:border-brand-primary outline-none text-sm font-medium transition-all
                                ${disabled || lockItemFields ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white hover:border-slate-300'}`}
                            >
                                <option value={0}>اختر صنف...</option>
                                {availableItems.map(i => (
                                    <option key={i.id} value={i.id}>{i.itemNameAr} ({i.itemCode})</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                                <Hash className="w-3 h-3" /> الكمية
                            </label>
                            <input
                                type="number"
                                value={item.requestedQty}
                                disabled={disabled || lockItemFields}
                                onChange={(e) => onUpdate('requestedQty', parseFloat(e.target.value))}
                                className={`w-full px-3 py-2.5 rounded-xl border-2 border-slate-200
                                focus:border-brand-primary outline-none text-sm font-bold transition-all
                                ${disabled || lockItemFields ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white hover:border-slate-300'}`}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                                <Layers className="w-3 h-3" /> الوحدة
                            </label>
                            <select
                                value={item.unitId}
                                disabled={disabled || lockItemFields}
                                onChange={(e) => onUpdate('unitId', parseInt(e.target.value))}
                                className={`w-full px-3 py-2.5 rounded-xl border-2 border-slate-200
                                focus:border-brand-primary outline-none text-sm font-medium transition-all
                                ${disabled || lockItemFields ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white hover:border-slate-300'}`}
                            >
                                <option value={0}>الوحدة...</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>{u.unitNameAr}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                                <DollarSign className="w-3 h-3" /> السعر المتوقع
                                {supplierPrice && (
                                    <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold normal-case">
                                        كتالوج
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={item.estimatedPrice || ''}
                                    disabled={disabled}
                                    onChange={(e) => onUpdate('estimatedPrice', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className={`w-full px-3 py-2.5 rounded-xl border-2 outline-none text-sm font-bold transition-all
                                    ${priceJustUpdated
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/10 ring-2 ring-emerald-200'
                                            : supplierPrice
                                                ? 'border-emerald-200 bg-emerald-50/50 focus:border-emerald-400 text-emerald-700'
                                                : 'border-slate-200 focus:border-brand-primary ' + (disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white hover:border-slate-300')
                                        }`}
                                    min="0"
                                    step="0.01"
                                />
                                {priceJustUpdated && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                        <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-3 space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                                <FileText className="w-3 h-3" /> مواصفات
                            </label>
                            <input
                                type="text"
                                value={item.specifications || ''}
                                disabled={disabled}
                                onChange={(e) => onUpdate('specifications', e.target.value)}
                                placeholder={disabled ? '' : "اختياري..."}
                                className={`w-full px-3 py-2.5 rounded-xl border-2 border-slate-200
                                focus:border-brand-primary outline-none text-sm font-medium transition-all
                                ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white hover:border-slate-300'}`}
                            />
                        </div>
                    </div>

                    {lineTotal > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                {selectedItemName && <span className="font-medium text-slate-500">{selectedItemName}</span>}
                            </span>
                            <span className={`text-sm font-bold ${priceJustUpdated ? 'text-emerald-600' : 'text-brand-primary'}`}>
                                {formatNumber(lineTotal)} EGP
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

// ─── Item Skeleton ──────────────────────────────────────────────────────────
const ItemSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border-2 border-slate-100 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 space-y-2"><div className="h-3 w-12 bg-slate-200 rounded" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
                    <div className="md:col-span-2 space-y-2"><div className="h-3 w-10 bg-slate-200 rounded" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
                    <div className="md:col-span-2 space-y-2"><div className="h-3 w-10 bg-slate-200 rounded" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
                    <div className="md:col-span-2 space-y-2"><div className="h-3 w-16 bg-slate-200 rounded" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
                    <div className="md:col-span-3 space-y-2"><div className="h-3 w-12 bg-slate-200 rounded" /><div className="h-10 bg-slate-100 rounded-xl" /></div>
                </div>
            </div>
        ))}
    </div>
);

// ─── Loading Skeleton ───────────────────────────────────────────────────────
const FormSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-slate-200 rounded-3xl" />
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-2"><div className="h-4 w-20 bg-slate-200 rounded" /><div className="h-12 bg-slate-100 rounded-xl" /></div>
                ))}
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
            <ItemSkeleton count={2} />
        </div>
    </div>
);

// ─── Main Page Component ────────────────────────────────────────────────────────
const RFQFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;

    const queryParams = new URLSearchParams(location.search);
    const prIdFromUrl = queryParams.get('prId');
    const isView = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');

    const submitAction = useOptimisticAction();
    const [_isPending, startTransition] = useTransition();

    // State
    const [loading, setLoading] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [supplierItems, setSupplierItems] = useState<SupplierItemDto[]>([]);
    const [loadingSupplierItems, setLoadingSupplierItems] = useState(false);
    const [availablePRs, setAvailablePRs] = useState<{ id: number; prNumber: string; items: any[] }[]>([]);
    // Multi-supplier selection
    const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]);

    // Price highlight tracking
    const [priceUpdatedItemIds, setPriceUpdatedItemIds] = useState<Set<number>>(new Set());
    const [priceUpdateCount, setPriceUpdateCount] = useState(0);
    const [showPriceBanner, setShowPriceBanner] = useState(false);

    const [formData, setFormData] = useState<Omit<RFQ, 'supplierId'>>({
        rfqDate: new Date().toISOString().split('T')[0],
        responseDueDate: '',
        notes: '',
        items: []
    });

    const [optimisticPR, setOptimisticPR] = useState<{ id: number; prNumber: string } | null>(null);

    useEffect(() => {
        loadDependencies();
        if (isEdit) {
            loadRFQ(parseInt(id!));
        } else if (prIdFromUrl) {
            loadPRData(parseInt(prIdFromUrl));
        }
    }, [id, prIdFromUrl]);

    const loadDependencies = async () => {
        try {
            const [suppliersData, itemsData, unitsData, prsData] = await Promise.all([
                purchaseService.getAllSuppliers(),
                itemService.getAllItems(),
                unitService.getAllUnits(),
                purchaseService.getAllPRs()
            ]);
            setSuppliers(suppliersData);
            setItems(itemsData.data || []);
            setUnits(unitsData.data || []);

            const approvedPRs = prsData.filter((pr: any) =>
                pr.status === 'Approved' && !pr.hasActiveOrders
            );
            setAvailablePRs(approvedPRs.map((pr: any) => ({
                id: pr.id,
                prNumber: pr.prNumber,
                items: pr.items || []
            })));
        } catch (error) {
            console.error('Failed to load dependencies:', error);
            toast.error('فشل تحميل البيانات الأساسية');
        }
    };

    const loadPRData = async (prId: number) => {
        const selectedPR = availablePRs.find(pr => pr.id === prId);
        if (selectedPR) {
            setOptimisticPR({ id: selectedPR.id, prNumber: selectedPR.prNumber });
            setFormData(prev => ({
                ...prev, prId: selectedPR.id, prNumber: selectedPR.prNumber,
                notes: prev.notes || `تم الإنشاء بناءً على طلب شراء: ${selectedPR.prNumber} `,
            }));
        }

        try {
            setLoadingItems(true);
            const pr = await purchaseService.getPRById(prId);
            if (pr) {
                const newItems = pr.items.map(pi => ({
                    itemId: pi.itemId,
                    requestedQty: pi.requestedQty,
                    unitId: pi.unitId,
                    specifications: pi.specifications || '',
                    estimatedPrice: pi.estimatedUnitPrice || 0
                }));

                startTransition(() => {
                    setFormData(prev => ({
                        ...prev, prId: pr.id, prNumber: pr.prNumber,
                        notes: prev.notes || `تم الإنشاء بناءً على طلب شراء: ${pr.prNumber} `,
                        items: newItems
                    }));
                    setOptimisticPR(null);
                });

                if (supplierItems.length > 0) {
                    applySupplierPricesToItems(supplierItems, newItems);
                }

                toast.success('تم تحميل بيانات طلب الشراء', { icon: '📋' });
            }
        } catch (error) {
            console.error('Failed to load PR data:', error);
            setOptimisticPR(null);
            toast.error('فشل تحميل بيانات طلب الشراء');
        } finally {
            setLoadingItems(false);
        }
    };

    const loadRFQ = async (rfqId: number) => {
        try {
            setLoading(true);
            const data = await purchaseService.getRFQById(rfqId);
            setSelectedSupplierIds([data.supplierId]);
            setFormData(data);
        } catch (error) {
            console.error('Failed to load RFQ:', error);
            navigate('/dashboard/procurement/rfq');
        } finally {
            setLoading(false);
        }
    };

    // ─── Apply supplier catalog prices ──────────────────────────────────────
    const applySupplierPricesToItems = useCallback((
        catalogItems: SupplierItemDto[],
        targetItems?: RFQItem[]
    ) => {
        setFormData(prev => {
            const itemsToUpdate = targetItems || prev.items;
            if (itemsToUpdate.length === 0 || catalogItems.length === 0) return prev;

            const priceMap = new Map<number, number>();
            catalogItems.forEach(si => {
                if (si.itemId && si.lastPrice && si.lastPrice > 0) {
                    priceMap.set(si.itemId, si.lastPrice);
                }
            });

            let updatedCount = 0;
            const updatedIds = new Set<number>();

            const newItems = (targetItems ? itemsToUpdate : prev.items).map(item => {
                const catalogPrice = priceMap.get(item.itemId);
                if (catalogPrice && catalogPrice > 0) {
                    updatedCount++;
                    updatedIds.add(item.itemId);
                    return { ...item, estimatedPrice: catalogPrice };
                }
                return item;
            });

            if (updatedCount > 0) {
                setPriceUpdatedItemIds(updatedIds);
                setPriceUpdateCount(updatedCount);
                setShowPriceBanner(true);

                toast.success(
                    `تم تحديث أسعار ${formatNumber(updatedCount)} صنف تلقائياً من كتالوج المورد`,
                    { icon: '💰', duration: 3000 }
                );

                setTimeout(() => {
                    setPriceUpdatedItemIds(new Set());
                    setShowPriceBanner(false);
                }, 4000);

                return { ...prev, items: newItems };
            }

            return prev;
        });
    }, [formatNumber]);
    const handleSuppliersChange = async (supplierIds: number[]) => {
        setSelectedSupplierIds(supplierIds);

        if (supplierIds.length === 0) {
            setSupplierItems([]);
            setFormData(prev => ({
                ...prev,
                items: prev.items.map(item => ({ ...item, estimatedPrice: undefined }))
            }));
            return;
        }

        // Load catalog items for the first selected supplier (for price suggestions)
        try {
            setLoadingSupplierItems(true);
            const result = await supplierService.getSupplierItems(supplierIds[0]);
            const fetchedItems = result.data || [];

            startTransition(() => {
                setSupplierItems(fetchedItems);
            });

            if (fetchedItems.length > 0) {
                applySupplierPricesToItems(fetchedItems);
            }
        } catch (error) {
            console.error('Failed to load supplier items:', error);
        }
    };
    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handlePRChange = (val: string) => {
        if (val) {
            loadPRData(parseInt(val));
        } else {
            setFormData(prev => ({ ...prev, prId: undefined, prNumber: undefined, items: [] }));
            setOptimisticPR(null);
        }
    };

    const updateItem = (index: number, field: keyof RFQItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) newItems[index].unitId = selectedItem.unitId;

            const supplierItem = supplierItems.find(si => si.itemId === value);
            if (supplierItem?.lastPrice) {
                newItems[index].estimatedPrice = supplierItem.lastPrice;
                setPriceUpdatedItemIds(prev => new Set([...prev, value]));
                setTimeout(() => {
                    setPriceUpdatedItemIds(prev => {
                        const next = new Set(prev);
                        next.delete(value);
                        return next;
                    });
                }, 2000);
            }
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const getSupplierPrice = (itemId: number): number | undefined => {
        return supplierItems.find(si => si.itemId === itemId)?.lastPrice;
    };

    // ─── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();

        if (selectedSupplierIds.length === 0) {
            toast.error('يرجى اختيار مورد واحد على الأقل');
            return;
        }

        if (!formData.prId) {
            toast.error('يرجى اختيار طلب شراء (PR)');
            return;
        }

        if (formData.items.length === 0) {
            toast.error('يرجى إضافة بند واحد على الأقل');
            return;
        }

        if (isEdit) {
            try {
                const toastId = toast.loading('جاري تحديث الطلب...');
                await purchaseService.updateRFQ(parseInt(id!), {
                    ...formData, supplierId: selectedSupplierIds[0]
                } as RFQ);
                toast.success('تم تحديث طلب عرض السعر بنجاح', { id: toastId, icon: '🎉' });
                navigate('/dashboard/procurement/rfq');
            } catch (error) {
                console.error('Failed to update RFQ:', error);
                toast.error('حدث خطأ أثناء تحديث البيانات');
            }
            return;
        }

        const tasks = selectedSupplierIds.map(supplierId => () =>
            purchaseService.createRFQ({ ...formData, supplierId } as RFQ)
        );

        const { successes } = await submitAction.execute(tasks, {
            delayBetween: 100,
            onSuccess: (_, index) => {
                const name = suppliers.find(s => s.id === selectedSupplierIds[index])?.supplierNameAr;
                if (selectedSupplierIds.length > 1) {
                    toast.success(`تم إنشاء طلب لـ ${name}`, { duration: 2000 });
                }
            },
            onError: (_, index) => {
                const name = suppliers.find(s => s.id === selectedSupplierIds[index])?.supplierNameAr;
                toast.error(`فشل إنشاء طلب لـ ${name}`);
            }
        });

        if (successes > 0) {
            toast.success(`تم إنشاء ${formatNumber(successes)} طلب عرض سعر بنجاح`, { icon: '🎉', duration: 4000 });
            navigate('/dashboard/procurement/rfq');
        }
    };

    const handleApprovalAction = async (action: 'Approved' | 'Rejected') => {
        if (!approvalId) return;
        try {
            setProcessing(true);
            const toastId = toast.loading('جاري تنفيذ الإجراء...');
            await approvalService.takeAction(parseInt(approvalId), 1, action);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب', { id: toastId });
            navigate('/dashboard/procurement/approvals');
        } catch (error) {
            console.error('Failed to take action:', error);
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setProcessing(false);
        }
    };

    // ─── Computed ────────────────────────────────────────────────────────────
    const supplierOptions = suppliers.map(s => ({ value: s.id!, label: s.supplierNameAr, code: s.supplierCode }));

    const totalEstimated = useMemo(() =>
        formData.items.reduce((sum, i) => sum + ((i.estimatedPrice || 0) * (i.requestedQty || 0)), 0),
        [formData.items]);

    const totalQty = useMemo(() =>
        formData.items.reduce((sum, i) => sum + (i.requestedQty || 0), 0),
        [formData.items]);

    const displayPRNumber = optimisticPR?.prNumber || formData.prNumber;

    if (loading) return <FormSkeleton />;

    return (
        <div className="space-y-6">
            <style>{`
    @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
    }
    `}</style>

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl shadow-brand-primary/20">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/dashboard/procurement/rfq')}
                            className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all
                                border border-white/10 hover:scale-105 active:scale-95">
                            <ArrowRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                            <ClipboardList className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black mb-1 tracking-tight">
                                {isView ? `عرض طلب عرض سعر #${formData.rfqNumber}`
                                    : isEdit ? `تعديل طلب عرض سعر #${formData.rfqNumber}`
                                        : 'إنشاء طلب عرض سعر جديد'}
                            </h1>
                            <p className="text-white/60 text-base">
                                {isView ? 'عرض تفاصيل الطلب والبنود'
                                    : isEdit ? 'تعديل تفاصيل الطلب والبنود المطلوبة'
                                        : 'اختر طلب الشراء والموردين - سيتم إنشاء طلب منفصل لكل مورد'}
                            </p>
                        </div>
                    </div >

                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate('/dashboard/procurement/rfq')}
                            className="px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-xl 
                                font-bold hover:bg-white/20 transition-all border border-white/10
                                hover:scale-105 active:scale-95">
                            <X className="w-5 h-5 inline-block ml-2" />
                            {isView ? 'خروج' : 'إلغاء'}
                        </button>

                        {!isView && (
                            <button onClick={handleSubmit}
                                disabled={submitAction.isPending || formData.items.length === 0}
                                className="flex items-center gap-2 px-8 py-3.5 bg-white text-brand-primary 
                                    rounded-xl font-bold hover:bg-white/95 transition-all
                                    shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5
                                    active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
                                {submitAction.isPending ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span>
                                    {submitAction.isPending
                                        ? `جاري الإنشاء (${formatNumber(submitAction.progress.current)}/${formatNumber(submitAction.progress.total)})`
                                        : isEdit ? 'حفظ التعديلات'
                                            : selectedSupplierIds.length > 1
                                                ? `إنشاء ${formatNumber(selectedSupplierIds.length)} طلبات`
                                                : 'حفظ الطلب'}
                                </span>
                            </button >
                        )}

                        {
                            isView && (
                                <div className="flex items-center gap-3">
                                    {approvalId && (
                                        <>
                                            <button onClick={() => handleApprovalAction('Approved')} disabled={processing}
                                                className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-xl
                                                font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95
                                                disabled:opacity-50 disabled:cursor-not-allowed">
                                                {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                <span>اعتماد</span>
                                            </button>
                                            <button onClick={() => handleApprovalAction('Rejected')} disabled={processing}
                                                className="flex items-center gap-2 px-6 py-3.5 bg-rose-500 text-white rounded-xl
                                                font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95
                                                disabled:opacity-50 disabled:cursor-not-allowed">
                                                {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                                                <span>رفض</span>
                                            </button>
                                        </>
                                    )}
                                    <div className="flex items-center gap-2 px-5 py-3.5 bg-amber-500/20 text-white rounded-xl 
                                    border border-white/20 backdrop-blur-sm">
                                        <Eye className="w-5 h-5" />
                                        <span className="font-bold text-sm">عرض فقط</span>
                                    </div>
                                </div>
                            )
                        }
                    </div >
                </div >
            </div >

            {/* ── Submit Progress ─────────────────────────────────────── */}
            <SubmitProgress current={submitAction.progress.current} total={submitAction.progress.total} isPending={submitAction.isPending} />

            {/* ── Price Update Banner ─────────────────────────────────── */}
            <PriceUpdateBanner count={priceUpdateCount} visible={showPriceBanner} />

            {/* ── Multi-supplier banner ───────────────────────────────── */}
            {!isEdit && selectedSupplierIds.length > 1 && !submitAction.isPending && (
                <div className="bg-gradient-to-l from-amber-50 to-amber-50/50 border border-amber-200 rounded-2xl p-4
                    flex items-center gap-4 animate-in fade-in duration-300">
                    <div className="p-2.5 bg-amber-100 rounded-xl">
                        <Users className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <span className="text-amber-700 font-semibold">سيتم إنشاء </span>
                        <span className="text-amber-800 font-black text-lg">{formatNumber(selectedSupplierIds.length)}</span>
                        <span className="text-amber-700 font-semibold"> طلب عرض سعر منفصل — واحد لكل مورد محدد</span>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-lg border border-amber-200">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">إنشاء تلقائي</span>
                    </div>
                </div>
            )}

            {/* ── PR Link Badge ────────────────────────────────────────── */}
            {displayPRNumber && (
                <div className={`border rounded-2xl p-4 flex items-center gap-3 transition-all duration-300
                    ${optimisticPR ? 'bg-blue-50 border-blue-200 animate-pulse' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className={`p-2 rounded-xl ${optimisticPR ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                        {optimisticPR
                            ? <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                            : <Link2 className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div>
                        <span className={`font-semibold ${optimisticPR ? 'text-blue-700' : 'text-emerald-700'}`}>
                            {optimisticPR ? 'جاري تحميل بيانات طلب الشراء: ' : 'مرتبط بطلب شراء: '}
                        </span>
                        <span className={`font-black ${optimisticPR ? 'text-blue-800' : 'text-emerald-800'}`}>
                            #{displayPRNumber}
                        </span>
                    </div>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>

                {/* ──── Section 1: PR Selection (FIRST) ────────────────── */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2.5 bg-purple-100 rounded-xl">
                            <ClipboardList className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">طلب الشراء المرجعي</h2>
                            <p className="text-sm text-slate-500">اختر طلب الشراء لتحميل البنود المطلوبة تلقائياً</p>
                        </div>
                        {!isView && (
                            <div className="mr-auto flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
                                <Zap className="w-3.5 h-3.5 text-purple-500" />
                                <span className="text-xs font-bold text-purple-600">الخطوة الأولى</span>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                            <Package className={`w-5 h-5 transition-colors ${formData.prId ? 'text-brand-primary' : 'text-slate-400'}`} />
                        </div>
                        <select
                            value={formData.prId || ''}
                            onChange={(e) => handlePRChange(e.target.value)}
                            disabled={isView}
                            required
                            className={`w-full pr-12 pl-4 py-4 rounded-xl border-2 outline-none font-medium text-base transition-all
                                appearance-none cursor-pointer
                                ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70 border-slate-200' :
                                    formData.prId
                                        ? 'border-brand-primary/30 bg-brand-primary/[0.03] hover:border-brand-primary/50'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-brand-primary focus:bg-white focus:shadow-lg focus:shadow-brand-primary/10'
                                }`}
                        >
                            <option value="">اختر طلب شراء معتمد...</option>
                            {availablePRs.map(pr => (
                                <option key={pr.id} value={pr.id}>
                                    #{pr.prNumber} — {formatNumber(pr.items.length)} صنف
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    {!formData.prId && !isView && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <p className="text-sm text-slate-500">
                                اختر طلب شراء معتمد لتحميل البنود تلقائياً. البنود سيتم نسخها من طلب الشراء مباشرة.
                            </p>
                        </div>
                    )}
                </div>

                {/* ──── Section 2: Suppliers & Details ──────────────────── */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2.5 bg-brand-primary/10 rounded-xl">
                            <FileText className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">معلومات الطلب</h2>
                            <p className="text-sm text-slate-500">حدد الموردين وتواريخ الطلب — اختيار المورد سيملأ الأسعار تلقائياً</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2">
                            <MultiSelectDropdown
                                label={isEdit ? 'المورد' : 'الموردين'}
                                options={supplierOptions}
                                selectedValues={selectedSupplierIds}
                                onChange={handleSuppliersChange}
                                icon={Truck}
                                placeholder="اختر المورد أو الموردين..."
                                required
                                loading={loadingSupplierItems}
                                disabled={isView}
                            />
                            {loadingSupplierItems && (
                                <p className="text-xs text-brand-primary flex items-center gap-1 mt-2 animate-pulse">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    جاري تحميل كتالوج المورد وتحديث الأسعار...
                                </p>
                            )}
                            {!loadingSupplierItems && supplierItems.length > 0 && selectedSupplierIds.length === 1 && (
                                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
                                    <Sparkles className="w-3 h-3" />
                                    هذا المورد لديه {supplierItems.length} صنف — تم ملء الأسعار المتاحة تلقائياً
                                </p>
                            )}
                            {!loadingSupplierItems && supplierItems.length === 0 && selectedSupplierIds.length === 1 && (
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                                    <AlertCircle className="w-3 h-3" />
                                    لا يوجد كتالوج أسعار لهذا المورد — أدخل الأسعار يدوياً
                                </p>
                            )}
                        </div>

                        <FormInput label="تاريخ الطلب" type="date"
                            value={formData.rfqDate?.split('T')[0] || ''}
                            onChange={(v) => setFormData(prev => ({ ...prev, rfqDate: v }))}
                            min={new Date().toISOString().split('T')[0]}
                            required disabled={isView} />
                        <FormInput label="تاريخ استحقاق الرد" type="date"
                            value={formData.responseDueDate || ''}
                            onChange={(v) => setFormData(prev => ({ ...prev, responseDueDate: v }))}
                            min={new Date().toISOString().split('T')[0]} disabled={isView} />
                    </div>

                    {/* PR Selection */}
                    <div className="mt-6">
                        <FormTextarea label="ملاحظات" value={formData.notes || ''}
                            onChange={(v) => setFormData(prev => ({ ...prev, notes: v }))}
                            icon={FileText} placeholder={isView ? '' : "أي ملاحظات إضافية على طلب عرض السعر..."}
                            rows={2} disabled={isView} />
                    </div>
                </div >

                {/* ──── Section 3: Items ────────────────────────────────── */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-brand-primary/10 rounded-xl">
                                <Package className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">الأصناف والبنود</h2>
                                <p className="text-sm text-slate-500">
                                    {formData.items.length > 0
                                        ? `${formatNumber(formData.items.length)} بند — محمّل من طلب الشراء`
                                        : 'سيتم تحميل البنود من طلب الشراء المختار'}
                                </p>
                            </div>
                        </div>
                        {formData.items.length > 0 && totalEstimated > 0 && (
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                                <DollarSign className="w-4 h-4 text-brand-primary" />
                                <span className="text-sm font-black text-brand-primary">
                                    {formatNumber(totalEstimated)} EGP
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {loadingItems ? (
                            <ItemSkeleton count={optimisticPR ? availablePRs.find(p => p.id === optimisticPR.id)?.items.length || 3 : 3} />
                        ) : formData.items.length > 0 ? (
                            formData.items.map((item, index) => (
                                <ItemRow
                                    key={`${item.itemId}-${index}`}
                                    item={item}
                                    index={index}
                                    items={items}
                                    units={units}
                                    usedItemIds={formData.items.map(i => i.itemId).filter(iid => iid !== 0)}
                                    supplierPrice={getSupplierPrice(item.itemId)}
                                    disabled={isView}
                                    lockItemFields={!isEdit}
                                    priceJustUpdated={priceUpdatedItemIds.has(item.itemId)}
                                    onUpdate={(field, value) => updateItem(index, field, value)}
                                    onRemove={() => removeItem(index)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-slate-100">
                                    <Package className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد بنود</h3>
                                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                                    اختر <span className="font-bold text-brand-primary">طلب شراء (PR)</span> من الأعلى وسيتم تحميل جميع البنود المعتمدة تلقائياً
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ──── Summary ─────────────────────────────────────────── */}
                {formData.items.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <ClipboardList className="w-5 h-5 text-brand-primary" />
                            </div>
                            <h3 className="font-bold text-lg">ملخص الطلب</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck className="w-4 h-4 text-brand-primary" />
                                    <span className="text-xs text-white/50 font-medium">الموردين</span>
                                </div>
                                <div className="text-2xl font-black">{formatNumber(selectedSupplierIds.length)}</div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-white/50 font-medium">البنود</span>
                                </div>
                                <div className="text-2xl font-black">{formatNumber(formData.items.length)}</div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Hash className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-white/50 font-medium">الكميات</span>
                                </div>
                                <div className="text-2xl font-black">{formatNumber(totalQty)}</div>
                            </div>

                            {totalEstimated > 0 && (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs text-white/50 font-medium">القيمة التقديرية</span>
                                    </div>
                                    <div className="text-2xl font-black text-brand-primary">
                                        {formatNumber(totalEstimated)}
                                        <span className="text-xs font-medium text-white/40 mr-1">EGP</span>
                                    </div>
                                </div>
                            )}

                            {!isEdit && selectedSupplierIds.length > 1 && (
                                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ClipboardList className="w-4 h-4 text-blue-400" />
                                        <span className="text-xs text-blue-300/70 font-medium">طلبات ستُنشأ</span>
                                    </div>
                                    <div className="text-2xl font-black text-blue-400">
                                        {formatNumber(selectedSupplierIds.length)}
                                        <span className="text-xs font-medium text-blue-300/50 mr-1">طلب</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default RFQFormPage;