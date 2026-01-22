import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, RefreshCw, CheckCircle2, XCircle,
    DollarSign, Package, Tag, Save, ChevronRight, Calendar, Coins,
    TrendingUp, TrendingDown, ShoppingCart, FileText, Layers
} from 'lucide-react';
import { priceListService, type PriceListDto, type PriceListItemDto } from '../../services/priceListService';
import { itemService, type ItemDto } from '../../services/itemService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { toast } from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// List Type Badge Component
const ListTypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const config: Record<string, { label: string; icon: React.ElementType; className: string }> = {
        'SELLING': {
            label: 'بيع',
            icon: TrendingUp,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        'BUYING': {
            label: 'شراء',
            icon: TrendingDown,
            className: 'bg-orange-50 text-orange-700 border-orange-200'
        },
    };

    const { label, icon: Icon, className } = config[type] || config['SELLING'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

// Price List Row Component
const PriceListRow: React.FC<{
    list: PriceListDto;
    onEdit: () => void;
    onDelete: () => void;
    index: number;
}> = ({ list, onEdit, onDelete, index }) => (
    <tr
        className="group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        {/* Name */}
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Coins className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">
                    {list.priceListName}
                </span>
            </div>
        </td>

        {/* Type */}
        <td className="px-6 py-4">
            <ListTypeBadge type={list.listType || 'SELLING'} />
        </td>

        {/* Currency */}
        <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 
                text-slate-600 text-sm rounded-lg font-mono">
                <DollarSign className="w-3.5 h-3.5" />
                {list.currency}
            </span>
        </td>

        {/* Valid From */}
        <td className="px-6 py-4">
            <span className="text-slate-600 text-sm">
                {list.validFrom ? new Date(list.validFrom).toLocaleDateString('ar-EG') : <span className="text-slate-300">---</span>}
            </span>
        </td>

        {/* Valid To */}
        <td className="px-6 py-4">
            <span className="text-slate-600 text-sm">
                {list.validTo ? new Date(list.validTo).toLocaleDateString('ar-EG') : <span className="text-slate-300">غير محدد</span>}
            </span>
        </td>

        {/* Items Count */}
        <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 
                text-purple-600 text-sm rounded-lg font-semibold">
                <Package className="w-3.5 h-3.5" />
                {list.items?.length || 0} صنف
            </span>
        </td>

        {/* Status */}
        <td className="px-6 py-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border
                ${list.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {list.isActive ? (
                    <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        نشط
                    </>
                ) : (
                    <>
                        <XCircle className="w-3.5 h-3.5" />
                        معطل
                    </>
                )}
            </span>
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-1">
                <button
                    onClick={onEdit}
                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                        rounded-lg transition-all duration-200"
                    title="تعديل"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                        rounded-lg transition-all duration-200"
                    title="حذف"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </td>
    </tr>
);

// Loading Skeleton
const TableSkeleton: React.FC = () => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse border-b border-slate-100">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="h-4 w-32 bg-slate-200 rounded" />
                    </div>
                </td>
                <td className="px-6 py-4"><div className="h-7 w-16 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4"><div className="h-7 w-16 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4">
                    <div className="flex gap-1 justify-center">
                        <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                        <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                    </div>
                </td>
            </tr>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string; onAdd: () => void }> = ({ searchTerm, onAdd }) => (
    <tr>
        <td colSpan={8} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <Coins className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm ? 'لا توجد نتائج' : 'لا توجد قوائم أسعار'}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchTerm
                        ? `لم يتم العثور على قوائم تطابق "${searchTerm}"`
                        : 'ابدأ بإضافة قوائم أسعار لتعريف أسعار البيع والشراء للأصناف'}
                </p>
                {!searchTerm && (
                    <button
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white 
                            rounded-xl font-medium hover:bg-brand-primary/90 transition-colors
                            shadow-lg shadow-brand-primary/30"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة قائمة جديدة
                    </button>
                )}
            </div>
        </td>
    </tr>
);

// Form Input Component
const FormInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    required?: boolean;
    dir?: string;
    type?: string;
    maxLength?: number;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, dir, type = 'text', maxLength }) => {
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
                    dir={dir}
                    maxLength={maxLength}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                        ${Icon ? 'pr-12' : ''}
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
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    options: { value: string; label: string }[];
}> = ({ label, value, onChange, icon: Icon, options }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
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
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400
                    transition-transform duration-200 rotate-90" />
            </div>
        </div>
    );
};

// Toggle Switch Component
const ToggleSwitch: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200
        cursor-pointer hover:bg-slate-100 transition-colors group">
        <span className={`font-semibold transition-colors ${checked ? 'text-brand-primary' : 'text-slate-600'}`}>
            {label}
        </span>
        <div
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200
                ${checked ? 'bg-brand-primary' : 'bg-slate-300'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200
                ${checked ? 'right-1' : 'left-1'}`} />
        </div>
    </label>
);

// Item Line Component for the modal
const ItemLineRow: React.FC<{
    item: PriceListItemDto;
    index: number;
    items: ItemDto[];
    onUpdate: (field: keyof PriceListItemDto, value: any) => void;
    onRemove: () => void;
}> = ({ item, index, items, onUpdate, onRemove }) => (
    <div
        className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-200"
        style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <div className="col-span-5 space-y-2">
            <label className="text-xs font-semibold text-slate-500">الصنف</label>
            <div className="relative">
                <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                    value={item.itemId}
                    onChange={e => onUpdate('itemId', parseInt(e.target.value))}
                    className="w-full pr-10 pl-4 py-2.5 border-2 border-slate-200 rounded-xl outline-none 
                        bg-white text-sm focus:border-brand-primary transition-colors appearance-none"
                >
                    <option value="0">اختر الصنف...</option>
                    {items.filter(i => i.isSellable).map(i => (
                        <option key={i.id} value={i.id}>{i.itemNameAr} ({i.itemCode})</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="col-span-3 space-y-2">
            <label className="text-xs font-semibold text-slate-500">السعر</label>
            <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="number"
                    value={item.unitPrice}
                    onChange={e => onUpdate('unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full pr-10 pl-4 py-2.5 border-2 border-slate-200 rounded-xl outline-none 
                        text-sm focus:border-brand-primary transition-colors"
                    placeholder="0.00"
                    step="0.01"
                />
            </div>
        </div>
        <div className="col-span-3 space-y-2">
            <label className="text-xs font-semibold text-slate-500">أقل كمية</label>
            <div className="relative">
                <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="number"
                    value={item.minQty}
                    onChange={e => onUpdate('minQty', parseFloat(e.target.value) || 0)}
                    className="w-full pr-10 pl-4 py-2.5 border-2 border-slate-200 rounded-xl outline-none 
                        text-sm focus:border-brand-primary transition-colors"
                    placeholder="1"
                />
            </div>
        </div>
        <div className="col-span-1 flex justify-center">
            <button
                type="button"
                onClick={onRemove}
                className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                    rounded-xl transition-all duration-200"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    </div>
);

// Modal Component
const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size?: 'default' | 'large';
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, size = 'default', children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                <div className={`relative bg-white rounded-2xl shadow-2xl w-full 
                    ${size === 'large' ? 'max-w-4xl' : 'max-w-lg'}
                    transform transition-all animate-in fade-in zoom-in-95 duration-200
                    max-h-[90vh] flex flex-col`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-xl">
                                <Coins className="w-5 h-5 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                                rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PriceListsPage: React.FC = () => {
    const [priceLists, setPriceLists] = useState<PriceListDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingList, setEditingList] = useState<PriceListDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState<PriceListDto>({
        priceListName: '',
        listType: 'SELLING',
        currency: 'EGP',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
        isActive: true,
        items: []
    });

    useEffect(() => {
        fetchPriceLists();
        fetchItems();
    }, []);

    const fetchPriceLists = async () => {
        try {
            setLoading(true);
            const response = await priceListService.getAllPriceLists();
            setPriceLists(response.data || []);
        } catch (error) {
            console.error('Error fetching price lists:', error);
            toast.error('فشل تحميل قوائم الأسعار');
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await itemService.getAllItems();
            setItems(response.data || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (editingList?.id) {
                await priceListService.updatePriceList(editingList.id, formData);
                toast.success('تم تحديث قائمة الأسعار بنجاح', { icon: '🎉' });
            } else {
                await priceListService.createPriceList(formData);
                toast.success('تم إضافة قائمة الأسعار بنجاح', { icon: '🎉' });
            }
            setShowModal(false);
            fetchPriceLists();
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل حفظ القائمة');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setListToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!listToDelete) return;
        setIsDeleting(true);
        try {
            await priceListService.deletePriceList(listToDelete);
            toast.success('تم حذف القائمة بنجاح', { icon: '🗑️' });
            setIsDeleteModalOpen(false);
            setListToDelete(null);
            fetchPriceLists();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل حذف القائمة');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (list: PriceListDto) => {
        setEditingList(list);
        setFormData({
            ...list,
            validFrom: list.validFrom ? list.validFrom.split('T')[0] : '',
            validTo: list.validTo ? list.validTo.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingList(null);
        setFormData({
            priceListName: '',
            listType: 'SELLING',
            currency: 'EGP',
            validFrom: new Date().toISOString().split('T')[0],
            validTo: '',
            isActive: true,
            items: []
        });
    };

    const addItemLine = () => {
        setFormData({
            ...formData,
            items: [...(formData.items || []), { itemId: 0, unitPrice: 0, minQty: 0 }]
        });
    };

    const removeItemLine = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items?.filter((_, i) => i !== index)
        });
    };

    const updateItemLine = (index: number, field: keyof PriceListItemDto, value: any) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-populate item data when Item ID changes
        if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) {
                newItems[index] = {
                    ...newItems[index],
                    unitPrice: selectedItem.replacementPrice || selectedItem.lastSalePrice || 0,
                    itemCode: selectedItem.itemCode,
                    itemNameAr: selectedItem.itemNameAr,
                    minQty: 1 // Default min quantity
                };
            }
        }

        setFormData({ ...formData, items: newItems });
    };

    const filteredLists = useMemo(() => {
        return priceLists.filter(list =>
            list.priceListName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [priceLists, searchTerm]);

    const stats = useMemo(() => ({
        total: priceLists.length,
        active: priceLists.filter(p => p.isActive).length,
        selling: priceLists.filter(p => p.listType === 'SELLING').length,
        buying: priceLists.filter(p => p.listType === 'BUYING').length,
    }), [priceLists]);

    const listTypeOptions = [
        { value: 'SELLING', label: 'مبيعات' },
        { value: 'BUYING', label: 'مشتريات' },
    ];

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
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Coins className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">قوائم الأسعار</h1>
                            <p className="text-white/70 text-lg">إدارة أسعار البيع والشراء للأصناف</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary 
                            rounded-xl font-bold hover:bg-white/90 transition-all duration-300
                            shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        <span>قائمة جديدة</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Coins}
                    value={stats.total}
                    label="إجمالي القوائم"
                    color="primary"
                />
                <StatCard
                    icon={CheckCircle2}
                    value={stats.active}
                    label="قائمة نشطة"
                    color="success"
                />
                <StatCard
                    icon={TrendingUp}
                    value={stats.selling}
                    label="قوائم بيع"
                    color="purple"
                />
                <StatCard
                    icon={ShoppingCart}
                    value={stats.buying}
                    label="قوائم شراء"
                    color="warning"
                />
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث في القوائم..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 
                                outline-none bg-slate-50
                                ${isSearchFocused
                                    ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                    : 'border-transparent hover:border-slate-200'}`}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 
                                    rounded-full transition-colors"
                            >
                                <XCircle className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={fetchPriceLists}
                        disabled={loading}
                        className="p-3 rounded-xl border border-slate-200 text-slate-600 
                            hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                            disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredLists.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{priceLists.length}</span> قائمة
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">اسم القائمة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">النوع</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">العملة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">صلاحية من</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">صلاحية إلى</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الأصناف</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredLists.length > 0 ? (
                                filteredLists.map((list, index) => (
                                    <PriceListRow
                                        key={list.id}
                                        list={list}
                                        onEdit={() => openEditModal(list)}
                                        onDelete={() => list.id && handleDeleteClick(list.id)}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    searchTerm={searchTerm}
                                    onAdd={() => { resetForm(); setShowModal(true); }}
                                />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingList ? 'تعديل قائمة أسعار' : 'إنشاء قائمة أسعار جديدة'}
                size="large"
            >
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="اسم القائمة"
                            value={formData.priceListName}
                            onChange={(v) => setFormData({ ...formData, priceListName: v })}
                            icon={Tag}
                            placeholder="قائمة أسعار البيع الرئيسية"
                            required
                        />
                        <FormSelect
                            label="نوع القائمة"
                            value={formData.listType || 'SELLING'}
                            onChange={(v) => setFormData({ ...formData, listType: v as any })}
                            icon={TrendingUp}
                            options={listTypeOptions}
                        />
                        <FormInput
                            label="العملة"
                            value={formData.currency || 'EGP'}
                            onChange={(v) => setFormData({ ...formData, currency: v.toUpperCase() })}
                            icon={DollarSign}
                            placeholder="EGP"
                            maxLength={3}
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="تاريخ البدء"
                            value={formData.validFrom || ''}
                            onChange={(v) => setFormData({ ...formData, validFrom: v })}
                            icon={Calendar}
                            type="date"
                        />
                        <FormInput
                            label="تاريخ الانتهاء"
                            value={formData.validTo || ''}
                            onChange={(v) => setFormData({ ...formData, validTo: v })}
                            icon={Calendar}
                            type="date"
                        />
                        <div className="flex items-end">
                            <ToggleSwitch
                                label="نشطة وصالحة للاستخدام"
                                checked={formData.isActive || false}
                                onChange={(v) => setFormData({ ...formData, isActive: v })}
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <Package className="w-5 h-5 text-brand-primary" />
                                بنود القائمة (الأصناف والأسعار)
                            </h4>
                            <button
                                type="button"
                                onClick={addItemLine}
                                className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary 
                                    hover:bg-brand-primary/10 rounded-xl transition-colors font-semibold"
                            >
                                <Plus className="w-4 h-4" />
                                إضافة صنف
                            </button>
                        </div>

                        <div className="space-y-3">
                            {(formData.items || []).map((item, index) => (
                                <ItemLineRow
                                    key={index}
                                    item={item}
                                    index={index}
                                    items={items}
                                    onUpdate={(field, value) => updateItemLine(index, field, value)}
                                    onRemove={() => removeItemLine(index)}
                                />
                            ))}
                            {(formData.items || []).length === 0 && (
                                <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 
                                    rounded-xl text-slate-400">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm font-medium">لا توجد أصناف في هذه القائمة بعد</p>
                                    <p className="text-xs text-slate-400 mt-1">اضغط "إضافة صنف" للبدء</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 
                                rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] px-4 py-3 bg-brand-primary text-white hover:bg-brand-primary/90 
                                rounded-xl transition-colors font-bold flex items-center justify-center gap-2 
                                shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {editingList ? 'حفظ التعديلات' : 'إنشاء القائمة'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف قائمة أسعار"
                message="هل أنت متأكد من حذف هذه القائمة؟ سيتم حذف كافة الأسعار المرتبطة بها."
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteModalOpen(false)}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default PriceListsPage;