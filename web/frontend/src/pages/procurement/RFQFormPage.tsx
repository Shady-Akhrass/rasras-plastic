import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Plus, Save, Trash2, Package, Truck, Calendar, FileText,
    ArrowRight, Sparkles, X, RefreshCw, ChevronRight, DollarSign,
    Hash, Layers, ClipboardList, CheckCircle2, Check, Search, Users, Eye
} from 'lucide-react';
import purchaseService, { type RFQ, type RFQItem, type Supplier } from '../../services/purchaseService';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';
import { approvalService } from '../../services/approvalService';
import toast from 'react-hot-toast';

// Multi Select Dropdown Component
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

    const selectAll = () => {
        onChange(filteredOptions.map(opt => opt.value));
    };

    const deselectAll = () => {
        onChange([]);
    };

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

                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none 
                        text-right bg-white flex items-center justify-between
                        ${Icon ? 'pr-12' : ''}
                        ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'cursor-pointer'}
                        ${isOpen
                            ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 hover:border-slate-300'}`}
                >
                    <div className="flex-1 truncate">
                        {selectedValues.length === 0 ? (
                            <span className="text-slate-400">{placeholder || 'اختر...'}</span>
                        ) : selectedValues.length === 1 ? (
                            <span className="text-slate-800">{selectedLabels[0]}</span>
                        ) : (
                            <span className="text-slate-800">
                                تم اختيار {selectedValues.length} مورد
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedValues.length > 0 && (
                            <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full">
                                {selectedValues.length}
                            </span>
                        )}
                        {loading ? (
                            <RefreshCw className="w-5 h-5 text-brand-primary animate-spin" />
                        ) : (
                            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200
                                ${isOpen ? '-rotate-90' : 'rotate-90'}`} />
                        )}
                    </div>
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-slate-200 
                            shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Search */}
                            <div className="p-3 border-b border-slate-100">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="بحث في الموردين..."
                                        className="w-full pr-10 pl-4 py-2 rounded-lg border border-slate-200 
                                            focus:border-brand-primary outline-none text-sm"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <span className="text-xs text-slate-500">
                                    {filteredOptions.length} مورد متاح
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAll}
                                        className="px-2 py-1 text-xs font-semibold text-brand-primary 
                                            hover:bg-brand-primary/10 rounded transition-colors"
                                    >
                                        تحديد الكل
                                    </button>
                                    <button
                                        type="button"
                                        onClick={deselectAll}
                                        className="px-2 py-1 text-xs font-semibold text-slate-500 
                                            hover:bg-slate-100 rounded transition-colors"
                                    >
                                        إلغاء الكل
                                    </button>
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="max-h-64 overflow-y-auto">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(opt => {
                                        const isSelected = selectedValues.includes(opt.value);
                                        return (
                                            <div
                                                key={opt.value}
                                                onClick={() => toggleOption(opt.value)}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
                                                    ${isSelected
                                                        ? 'bg-brand-primary/5 border-r-4 border-brand-primary'
                                                        : 'hover:bg-slate-50 border-r-4 border-transparent'}`}
                                            >
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center
                                                    transition-all duration-200
                                                    ${isSelected
                                                        ? 'bg-brand-primary border-brand-primary text-white'
                                                        : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`font-medium ${isSelected ? 'text-brand-primary' : 'text-slate-800'}`}>
                                                        {opt.label}
                                                    </div>
                                                    {opt.code && (
                                                        <div className="text-xs text-slate-400 font-mono">{opt.code}</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-400 text-sm">
                                        لا توجد نتائج
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Selected Suppliers Tags */}
            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {options
                        .filter(opt => selectedValues.includes(opt.value))
                        .slice(0, 5)
                        .map(opt => (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-brand-primary/10 
                                    text-brand-primary text-xs font-semibold rounded-lg"
                            >
                                {opt.label}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(opt.value);
                                    }}
                                    className="hover:bg-brand-primary/20 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    {selectedValues.length > 5 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                            +{selectedValues.length - 5} آخرين
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

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

// Form Multi-Select Component (قائمة منسدلة بداخلها اختيار من متعدد)
const FormMultiSelect: React.FC<{
    label: string;
    value: number[];
    onChange: (value: number[]) => void;
    icon?: React.ElementType;
    options: { value: number; label: string }[];
    placeholder?: string;
    required?: boolean;
}> = ({ label, value, onChange, icon: Icon, options, placeholder, required }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = (id: number) => {
        if (value.includes(id)) {
            onChange(value.filter(v => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    const selectedLabels = options.filter(o => value.includes(o.value)).map(o => o.label);
    const displayText = value.length === 0
        ? (placeholder || 'اختر الموردين...')
        : value.length === 1
            ? selectedLabels[0]
            : `تم اختيار ${value.length} مورد`;

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(prev => !prev)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-right transition-all outline-none flex items-center justify-between
                        ${Icon ? 'pr-12' : ''}
                        ${isOpen ? 'border-brand-primary bg-white shadow-lg' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}
                        ${value.length > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}
                >
                    <span className="truncate">{displayText}</span>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {Icon && (
                    <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                )}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white rounded-xl border-2 border-slate-200 shadow-xl max-h-56 overflow-y-auto py-2">
                        {options.length === 0 ? (
                            <p className="px-4 py-2 text-slate-400 text-sm">{placeholder || 'لا توجد خيارات'}</p>
                        ) : (
                            options.map(opt => (
                                <label
                                    key={opt.value}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={value.includes(opt.value)}
                                        onChange={() => toggle(opt.value)}
                                        className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span className="font-medium text-slate-800">{opt.label}</span>
                                </label>
                            ))
                        )}
                    </div>
                )}
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
    disabled?: boolean;
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
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    rows={rows}
                    disabled={disabled}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none resize-none
                        ${Icon ? 'pr-12' : ''}
                        ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : ''}
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
    usedItemIds: number[];
    supplierPrice?: number;
    disabled?: boolean;
    onUpdate: (field: keyof RFQItem, value: any) => void;
    onRemove: () => void;
    readOnly?: boolean;
}> = ({ item, index, items, units, supplierPrice, onUpdate, onRemove, readOnly }) => (
    <div
        className="p-5 bg-white rounded-2xl border-2 border-slate-100 relative group 
            transition-all duration-300 hover:shadow-lg hover:border-brand-primary/20"
        style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        {/* Remove Button - مخفي في وضع القراءة فقط (من طلب شراء) */}
        {!readOnly && (
            <button
                type="button"
                onClick={onRemove}
                className="absolute -left-3 -top-3 p-2.5 bg-rose-100 text-rose-600 rounded-xl 
                    opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg 
                    hover:scale-110 hover:bg-rose-500 hover:text-white"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        )}

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
                    onChange={(e) => !readOnly && onUpdate('itemId', parseInt(e.target.value))}
                    disabled={readOnly}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 font-medium transition-all
                        ${readOnly ? 'border-slate-100 bg-slate-50 cursor-not-allowed text-slate-600' : 'border-slate-200 focus:border-brand-primary outline-none bg-white'}`}
                >
                    <option value={0}>اختر صنف...</option>
                    {items.map(i => (
                        <option key={i.id} value={i.id}>{i.itemNameAr} ({i.grade || i.itemCode || ''})</option>
                    ))}
                </select>
            </div>

            {/* Quantity - غير قابلة للتعديل */}
            <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" />
                    الكمية
                </label>
                <input
                    type="number"
                    value={item.requestedQty}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 cursor-not-allowed text-slate-600 font-medium"
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
                    onChange={(e) => !readOnly && onUpdate('unitId', parseInt(e.target.value))}
                    disabled={readOnly}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 font-medium transition-all
                        ${readOnly ? 'border-slate-100 bg-slate-50 cursor-not-allowed text-slate-600' : 'border-slate-200 focus:border-brand-primary outline-none bg-white'}`}
                >
                    <option value={0}>الوحدة...</option>
                    {units.map(u => (
                        <option key={u.id} value={u.id}>{u.unitNameAr}</option>
                    ))}
                </select>
            </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        الوحدة
                    </label>
                    <select
                        value={item.unitId}
                        disabled={disabled}
                        onChange={(e) => onUpdate('unitId', parseInt(e.target.value))}
                        className={`w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 
                        focus:border-brand-primary outline-none font-medium transition-all
                        ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                    >
                        <option value={0}>الوحدة...</option>
                        {units.map(u => (
                            <option key={u.id} value={u.id}>{u.unitNameAr}</option>
                        ))}
                    </select>
                </div>

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
                        disabled={disabled}
                        onChange={(e) => onUpdate('estimatedPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none font-medium transition-all
                        ${supplierPrice
                                ? 'border-emerald-200 bg-emerald-50/50 focus:border-emerald-400'
                                : 'border-slate-200 focus:border-brand-primary ' + (disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white')}`}
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
                    onChange={(e) => !readOnly && onUpdate('specifications', e.target.value)}
                    readOnly={readOnly}
                    disabled={readOnly}
                    placeholder="اختياري..."
                    className={`w-full px-4 py-2.5 rounded-xl border-2 font-medium transition-all
                        ${readOnly ? 'border-slate-100 bg-slate-50 cursor-not-allowed text-slate-600' : 'border-slate-200 focus:border-brand-primary outline-none bg-white'}`}
                />
            </div>
        </div>
    );
};

// Empty Items State
const EmptyItemsState: React.FC<{ onAdd: () => void; hideAddButton?: boolean }> = ({ onAdd, hideAddButton }) => (
    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Package className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">لا توجد بنود مضافة</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            {hideAddButton
                ? 'الأصناف تُحمَّل من طلب الشراء المعتمد فقط ولا يمكن إضافتها أو تعديلها'
                : 'ابدأ بالضغط على زر إضافة صنف لإضافة بنود طلب عرض السعر'}
        </p>
        {!hideAddButton && (
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
        )}
    </div>
);

// Loading Skeleton
const FormSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    const isView = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [supplierItems, setSupplierItems] = useState<SupplierItemDto[]>([]);
    const [loadingSupplierItems, setLoadingSupplierItems] = useState(false);
    const [supplierIds, setSupplierIds] = useState<number[]>([]);

    // Changed to support multiple suppliers
    const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]);

    const [formData, setFormData] = useState<Omit<RFQ, 'supplierId'>>({
        rfqDate: new Date().toISOString().split('T')[0],
        responseDueDate: '',
        notes: '',
        items: []
    });

    useEffect(() => {
        let cancelled = false;
        loadDependencies();
        if (isEdit) {
            loadRFQ(parseInt(id!));
        } else if (prIdFromUrl) {
            loadPRData(parseInt(prIdFromUrl), () => !cancelled);
        }
        return () => { cancelled = true; };
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
            // Filter only approved PRs
            const approvedPRs = prsData.filter((pr: any) => pr.status === 'Approved');
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

    const loadPRData = async (prId: number, shouldShowToast?: () => boolean) => {
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
                if (!shouldShowToast || shouldShowToast()) {
                    toast.success('تم تحميل بيانات طلب الشراء', { icon: '📋' });
                }
            }
        } catch (error) {
            console.error('Failed to load PR data:', error);
            if (!shouldShowToast || shouldShowToast()) {
                toast.error('فشل تحميل بيانات طلب الشراء');
            }
        } finally {
            setLoading(false);
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

    // Handle supplier selection change
    const handleSuppliersChange = async (supplierIds: number[]) => {
        setSelectedSupplierIds(supplierIds);

        if (supplierIds.length === 0) {
            setSupplierItems([]);
            return;
        }

        // Load supplier items for the first selected supplier (for suggestions)
        if (supplierIds.length > 0) {
            try {
                setLoadingSupplierItems(true);
                const result = await supplierService.getSupplierItems(supplierIds[0]);
                const fetchedItems = result.data || [];
                setSupplierItems(fetchedItems);
            } catch (error) {
                console.error('Failed to load supplier items:', error);
            } finally {
                setLoadingSupplierItems(false);
            }
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

    // Submit - Create RFQ for each selected supplier
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hasSuppliers = prIdFromUrl
            ? supplierIds.length > 0
            : formData.supplierId > 0;

        if (!hasSuppliers) {
            toast.error(prIdFromUrl ? 'يرجى اختيار مورد واحد على الأقل' : 'يرجى اختيار مورد');
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
            } else if (prIdFromUrl && supplierIds.length > 0) {
                const idsToCreate = supplierIds;
                let created = 0;
                for (const sid of idsToCreate) {
                    await purchaseService.createRFQ({
                        ...formData,
                        supplierId: sid,
                        items: formData.items
                    });
                    created++;
                }
                toast.success(`تم إنشاء ${created} طلب عرض سعر بنجاح`, { icon: '🎉' });
                navigate('/dashboard/procurement/rfq');
            } else {
                await purchaseService.createRFQ(formData);
                toast.success('تم حفظ طلب عرض السعر بنجاح', { icon: '🎉' });
                navigate('/dashboard/procurement/rfq');
            }
        } catch (error) {
            console.error('Failed to save RFQ:', error);
            toast.error('حدث خطأ أثناء حفظ البيانات');
        } finally {
            setSaving(false);
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

    const supplierOptions = suppliers.map(s => ({
        value: s.id!,
        label: s.supplierNameAr,
        code: s.supplierCode
    }));

    if (loading) return <FormSkeleton />;

    return (
        <div className="space-y-6">
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

            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white">
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
                            <p className="text-white/70 text-lg">
                                {isEdit
                                    ? 'تعديل تفاصيل الطلب والبنود المطلوبة'
                                    : 'اختر الموردين وأدخل البنود المطلوبة - سيتم إنشاء طلب منفصل لكل مورد'}
                            </p>
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
                            {isView ? 'خروج' : 'إلغاء'}
                        </button>
                        {!isView && (
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
                                <span>
                                    {saving
                                        ? 'جاري الحفظ...'
                                        : isEdit
                                            ? 'حفظ التعديلات'
                                            : selectedSupplierIds.length > 1
                                                ? `إنشاء ${selectedSupplierIds.length} طلبات`
                                                : 'حفظ الطلب'}
                                </span>
                            </button>
                        )}
                        {isView && (
                            <div className="flex items-center gap-3">
                                {approvalId && (
                                    <>
                                        <button
                                            onClick={() => handleApprovalAction('Approved')}
                                            disabled={processing}
                                            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl 
                                                font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95
                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            <span>اعتماد</span>
                                        </button>
                                        <button
                                            onClick={() => handleApprovalAction('Rejected')}
                                            disabled={processing}
                                            className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl 
                                                font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95
                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                                            <span>رفض</span>
                                        </button>
                                    </>
                                )}
                                <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                    <Eye className="w-5 h-5" />
                                    <span className="font-bold">وضع العرض فقط</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!isEdit && selectedSupplierIds.length > 1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                        <Users className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <span className="text-amber-700 font-semibold">سيتم إنشاء </span>
                        <span className="text-amber-800 font-bold">{selectedSupplierIds.length} طلب عرض سعر</span>
                        <span className="text-amber-700 font-semibold"> منفصل - واحد لكل مورد محدد، بنفس البنود والتفاصيل</span>
                    </div>
                </div>
            )}

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
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-brand-primary/10 rounded-xl">
                            <FileText className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">معلومات الطلب</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {prIdFromUrl ? (
                            <div className="md:col-span-2">
                                <FormMultiSelect
                                    label="الموردون (اختيار من متعدد)"
                                    value={supplierIds}
                                    onChange={setSupplierIds}
                                    icon={Truck}
                                    options={supplierOptions}
                                    placeholder="اختر الموردين..."
                                    required
                                />
                            </div>
                        ) : (
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
                        )}

                        <FormInput
                            label="تاريخ الطلب"
                            type="date"
                            value={formData.rfqDate?.split('T')[0] || ''}
                            onChange={(v) => setFormData(prev => ({ ...prev, rfqDate: v }))}
                            icon={Calendar}
                            required
                            disabled={isView}
                        />

                        <FormInput
                            label="تاريخ استحقاق الرد"
                            type="date"
                            value={formData.responseDueDate || ''}
                            onChange={(v) => setFormData(prev => ({ ...prev, responseDueDate: v }))}
                            icon={Calendar}
                            disabled={isView}
                        />
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-500" />
                            طلب الشراء (PR) <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={formData.prId || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val) loadPRData(parseInt(val));
                                else setFormData(prev => ({ ...prev, prId: undefined, prNumber: undefined, items: [] }));
                            }}
                            disabled={isView}
                            required
                            className={`w-full px-4 py-3 rounded-xl border-2 border-slate-200 
                                focus:border-brand-primary outline-none bg-white font-medium transition-all
                                ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : ''}`}
                        >
                            <option value="">اختر طلب شراء...</option>
                            {availablePRs.map(pr => (
                                <option key={pr.id} value={pr.id}>
                                    #{pr.prNumber} ({pr.items.length} صنف)
                                </option>
                            ))}
                        </select>
                        {formData.prNumber && (
                            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
                                <CheckCircle2 className="w-3 h-3" />
                                مرتبط بطلب شراء: #{formData.prNumber}
                            </p>
                        )}
                    </div>

                    <div className="mt-6">
                        <FormTextarea
                            label="ملاحظات"
                            value={formData.notes || ''}
                            onChange={(v) => setFormData(prev => ({ ...prev, notes: v }))}
                            icon={FileText}
                            placeholder={isView ? '' : "أي ملاحظات إضافية..."}
                            rows={2}
                            disabled={isView}
                        />
                    </div>
                </div>

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
                        {!prIdFromUrl && (
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
                        )}
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <ItemRow
                                key={index}
                                item={item}
                                index={index}
                                items={items}
                                units={units}
                                usedItemIds={formData.items.map(i => i.itemId).filter(id => id !== 0)}
                                supplierPrice={getSupplierPrice(item.itemId)}
                                disabled={isView}
                                onUpdate={(field, value) => updateItem(index, field, value)}
                                onRemove={() => removeItem(index)}
                                readOnly={!!prIdFromUrl}
                            />
                        ))}

                        {formData.items.length === 0 && (
                            <EmptyItemsState onAdd={addItem} hideAddButton={!!prIdFromUrl} />
                        )}
                    </div>
                </div>

                {formData.items.length > 0 && (
                    <div className="bg-gradient-to-l from-brand-primary/5 to-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Truck className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-medium">عدد الموردين</div>
                                    <div className="text-lg font-bold text-slate-800">{selectedSupplierIds.length}</div>
                                </div>
                            </div>

                            <div className="w-px h-10 bg-slate-200" />

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Package className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-medium">إجمالي البنود</div>
                                    <div className="text-lg font-bold text-slate-800">{formData.items.length}</div>
                                </div>
                            </div>

                            <div className="w-px h-10 bg-slate-200" />

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Hash className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-medium">إجمالي الكميات</div>
                                    <div className="text-lg font-bold text-slate-800">
                                        {formData.items.reduce((sum, i) => sum + (i.requestedQty || 0), 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {formData.items.some(i => i.estimatedPrice) && (
                                <>
                                    <div className="w-px h-10 bg-slate-200" />
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 font-medium">القيمة التقديرية</div>
                                            <div className="text-lg font-bold text-brand-primary">
                                                {formData.items
                                                    .reduce((sum, i) => sum + ((i.estimatedPrice || 0) * (i.requestedQty || 0)), 0)
                                                    .toLocaleString()} EGP
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {!isEdit && selectedSupplierIds.length > 1 && (
                                <>
                                    <div className="w-px h-10 bg-slate-200" />
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <ClipboardList className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 font-medium">طلبات سيتم إنشاؤها</div>
                                            <div className="text-lg font-bold text-blue-600">
                                                {selectedSupplierIds.length} طلب
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default RFQFormPage;