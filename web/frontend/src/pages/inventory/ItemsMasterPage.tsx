import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Edit2, Trash2, Package, Download, Upload,
    RefreshCw, CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, DollarSign, Layers,
    Tag, Box, TrendingUp, TrendingDown, AlertTriangle,
    Barcode, ShoppingCart, ShoppingBag, Percent, Scale,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { itemService, type ItemDto } from '../../services/itemService';
import { stockBalanceService } from '../../services/stockBalanceService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatNumber } from '../../utils/format';
import { toast } from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number | string;
    label: string;
    trend?: { value: string; isUp: boolean };
    color: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
}> = ({ icon: Icon, value, label, trend, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        danger: 'bg-rose-100 text-rose-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                        ${trend.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trend.value}
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
        </div>
    );
};

// Filter Badge Component
const FilterBadge: React.FC<{
    label: string;
    onRemove: () => void;
}> = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 
        text-brand-primary text-sm rounded-lg">
        {label}
        <button onClick={onRemove} className="hover:bg-brand-primary/20 rounded-full p-0.5">
            <XCircle className="w-3.5 h-3.5" />
        </button>
    </span>
);

// Item Type Badge
const ItemTypeBadge: React.FC<{ type?: string }> = ({ type }) => {
    const config: Record<string, { label: string; className: string }> = {
        'RAW_MATERIAL': { label: 'مادة خام', className: 'bg-amber-50 text-amber-700 border-amber-200' },
        'FINISHED_GOOD': { label: 'منتج نهائي', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        'SEMI_FINISHED': { label: 'نصف مصنع', className: 'bg-blue-50 text-blue-700 border-blue-200' },
        'SPARE_PART': { label: 'قطعة غيار', className: 'bg-purple-50 text-purple-700 border-purple-200' },
        'CONSUMABLE': { label: 'مستهلك', className: 'bg-slate-50 text-slate-700 border-slate-200' },
    };

    const { label, className } = config[type || ''] || { label: type || '-', className: 'bg-slate-50 text-slate-600 border-slate-200' };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${className}`}>
            {label}
        </span>
    );
};

// Stock Status Badge
const StockStatusBadge: React.FC<{
    currentStock?: number;
    minLevel?: number;
    maxLevel?: number;
    reorderLevel?: number;
}> = ({ currentStock = 0, minLevel = 0, maxLevel = 0, reorderLevel = 0 }) => {
    let status: { label: string; className: string; icon: React.ElementType };

    if (currentStock <= 0) {
        status = { label: 'نفذ', className: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle };
    } else if (currentStock <= minLevel) {
        status = { label: 'حرج', className: 'bg-rose-50 text-rose-600 border-rose-200', icon: AlertTriangle };
    } else if (currentStock <= reorderLevel) {
        status = { label: 'منخفض', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle };
    } else if (maxLevel > 0 && currentStock >= maxLevel) {
        status = { label: 'مرتفع', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: TrendingUp };
    } else {
        status = { label: 'متوفر', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    }

    const StatusIcon = status.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border ${status.className}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
        </span>
    );
};

// Item Row Component
const ItemRow: React.FC<{
    item: ItemDto;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    canDelete: boolean;
    index: number;
}> = ({ item, onEdit, onDelete, onView, canDelete, index }) => {
    // Calculate profit margin
    const profitMargin = item.lastSalePrice && item.lastPurchasePrice
        ? ((item.lastSalePrice - item.lastPurchasePrice) / item.lastPurchasePrice * 100).toFixed(1)
        : null;

    return (
        <tr
            className="group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0"
            style={{
                animationDelay: `${index * 30}ms`,
                animation: 'fadeInUp 0.3s ease-out forwards'
            }}
        >
            {/* كود الصنف والباركود */}
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                        rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Barcode className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                        <span className="font-mono font-bold text-brand-primary text-sm block">{item.itemCode || '—'}</span>
                        {item.barcode && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                <Barcode className="w-3 h-3" />
                                <span className="font-mono">{item.barcode}</span>
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* العلامة التجارية / Grade */}
            <td className="px-4 py-4">
                {item.grade ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                        <Tag className="w-3.5 h-3.5" />
                        {item.grade}
                    </span>
                ) : (
                    <span className="text-slate-400 text-sm">—</span>
                )}
            </td>

            {/* Item Name */}
            <td className="px-4 py-4">
                <div className="max-w-[200px]">
                    <p className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors truncate">
                        {item.itemNameAr}
                    </p>
                    {item.itemNameEn && (
                        <p className="text-xs text-slate-400 truncate" dir="ltr">{item.itemNameEn}</p>
                    )}
                </div>
            </td>

            {/* MFR */}
            <td className="px-4 py-4">
                {item.gradeName ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/10 text-brand-primary 
                        text-xs font-medium rounded-lg" title="معدل تدفق الذوبان (Melt Flow Rate)">
                        <Layers className="w-3.5 h-3.5" />
                        {item.gradeName}
                    </span>
                ) : (
                    <span className="text-slate-400 text-sm">—</span>
                )}
            </td>

            {/* Category & Type */}
            <td className="px-4 py-4">
                <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 
                        text-slate-600 text-xs rounded-lg">
                        <Tag className="w-3 h-3" />
                        {item.categoryName || '-'}
                    </span>
                    <div>
                        <ItemTypeBadge type={item.itemType} />
                    </div>
                </div>
            </td>

            {/* Unit */}
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                        <Box className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-600">{item.unitName || '-'}</span>
                </div>
            </td>

            {/* Stock Levels */}
            <td className="px-4 py-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-800">
                            {formatNumber(item.currentStock ?? 0)}
                        </span>
                        <StockStatusBadge
                            currentStock={item.currentStock}
                            minLevel={item.minStockLevel}
                            maxLevel={item.maxStockLevel}
                            reorderLevel={item.reorderLevel}
                        />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            أدنى: {item.minStockLevel || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            طلب: {item.reorderLevel || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            أقصى: {item.maxStockLevel || 0}
                        </span>
                    </div>
                </div>
            </td>

            {/* Prices */}
            <td className="px-4 py-4">
                <div className="space-y-1">
                    {/* USD Purchase Price */}
                    {item.purchasePriceUsd ? (
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-emerald-100 rounded text-emerald-700">
                                <DollarSign className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-bold text-emerald-700">
                                ${formatNumber(item.purchasePriceUsd)}
                            </span>
                        </div>
                    ) : null}
                    {/* EGP Purchase Price */}
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-600">
                            {item.lastPurchasePrice != null ? formatNumber(item.lastPurchasePrice) : '---'}
                        </span>
                    </div>
                </div>
            </td>

            {/* Sale Price & Margin */}
            <td className="px-4 py-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold text-emerald-600">
                            {item.lastSalePrice != null ? formatNumber(item.lastSalePrice) : '---'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        {profitMargin && (
                            <div className="flex items-center gap-1">
                                <Percent className="w-3 h-3 text-slate-400" />
                                <span className={`text-[10px] font-semibold ${parseFloat(profitMargin) >= (item.targetProfitMarginPercentage || 0) ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {profitMargin}% فعلي
                                </span>
                            </div>
                        )}
                        {item.targetProfitMarginPercentage && (
                            <div className="flex items-center gap-1 opacity-60">
                                <TrendingUp className="w-3 h-3 text-brand-primary" />
                                <span className="text-[10px] font-bold text-brand-primary">
                                    {item.targetProfitMarginPercentage}% مستهدف
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* Flags */}
            <td className="px-4 py-4">
                <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded
                        ${item.isSellable ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        <ShoppingBag className="w-3 h-3" />
                        {item.isSellable ? 'للبيع' : 'لا يباع'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded
                        ${item.isPurchasable ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <ShoppingCart className="w-3 h-3" />
                        {item.isPurchasable ? 'للشراء' : 'لا يشترى'}
                    </span>
                </div>
            </td>

            {/* Status */}
            <td className="px-4 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border
                    ${item.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {item.isActive ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            نشط
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3.5 h-3.5" />
                            غير نشط
                        </>
                    )}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={onView}
                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                            rounded-lg transition-all duration-200"
                        title="عرض التفاصيل"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                            rounded-lg transition-all duration-200"
                        title="تعديل"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={canDelete ? onDelete : undefined}
                        disabled={!canDelete}
                        className={`p-2 rounded-lg transition-all duration-200 ${canDelete
                            ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                            : 'text-slate-300 cursor-not-allowed opacity-60'
                            }`}
                        title={canDelete ? 'حذف' : 'لا يمكن الحذف: يوجد كمية في المخزون. يجب أن تكون الكمية صفراً.'}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// Loading Skeleton
const TableSkeleton: React.FC = () => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse border-b border-slate-100">
                <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="space-y-1">
                            <div className="h-4 w-20 bg-slate-200 rounded" />
                            <div className="h-3 w-16 bg-slate-100 rounded" />
                        </div>
                    </div>
                </td>
                <td className="px-4 py-4">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                </td>
                <td className="px-4 py-4"><div className="h-6 w-20 bg-slate-100 rounded-lg" /></td>
                <td className="px-4 py-4"><div className="h-7 w-14 bg-slate-100 rounded-lg" /></td>
                <td className="px-4 py-4">
                    <div className="h-6 w-20 bg-slate-100 rounded-lg mb-1" />
                    <div className="h-5 w-16 bg-slate-100 rounded-lg" />
                </td>
                <td className="px-4 py-4"><div className="h-4 w-14 bg-slate-100 rounded" /></td>
                <td className="px-4 py-4">
                    <div className="h-5 w-16 bg-slate-100 rounded mb-1" />
                    <div className="h-3 w-24 bg-slate-50 rounded" />
                </td>
                <td className="px-4 py-4">
                    <div className="h-4 w-16 bg-slate-100 rounded mb-1" />
                    <div className="h-3 w-14 bg-slate-50 rounded" />
                </td>
                <td className="px-4 py-4">
                    <div className="h-4 w-16 bg-slate-100 rounded mb-1" />
                    <div className="h-3 w-12 bg-slate-50 rounded" />
                </td>
                <td className="px-4 py-4">
                    <div className="h-5 w-12 bg-slate-100 rounded mb-1" />
                    <div className="h-5 w-12 bg-slate-100 rounded" />
                </td>
                <td className="px-4 py-4"><div className="h-7 w-14 bg-slate-100 rounded-lg" /></td>
                <td className="px-4 py-4">
                    <div className="flex gap-1 justify-center">
                        <div className="h-8 w-8 bg-slate-100 rounded-lg" />
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
        <td colSpan={12} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm ? <Search className="w-12 h-12 text-slate-400" /> : <Package className="w-12 h-12 text-slate-400" />}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm ? 'لا توجد نتائج' : 'لا توجد أصناف'}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchTerm
                        ? `لم يتم العثور على أصناف تطابق "${searchTerm}"`
                        : 'ابدأ بإضافة أصناف جديدة لإدارة المخزون والمنتجات'}
                </p>
                {!searchTerm && (
                    <button
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white 
                            rounded-xl font-medium hover:bg-brand-primary/90 transition-colors
                            shadow-lg shadow-brand-primary/30"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة صنف جديد
                    </button>
                )}
            </div>
        </td>
    </tr>
);

const ItemsMasterPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out' | 'available'>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const [itemResponse, stockResponse] = await Promise.all([
                itemService.getAllItems(),
                stockBalanceService.getAllBalances()
            ]);

            if (itemResponse.data) {
                const combinedItems = itemResponse.data.map(item => {
                    const itemStocks = stockResponse.data?.filter(s => s.itemId === item.id) || [];
                    const totalStock = itemStocks.reduce((sum, s) => sum + (s.quantityOnHand || 0), 0);
                    return { ...item, currentStock: totalStock };
                });
                setItems(combinedItems);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('فشل في تحميل قائمة الأصناف والارصدة');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        const idToDelete = itemToDelete;
        setIsDeleting(true);
        try {
            await itemService.deleteItem(idToDelete);
            setItems(prev => prev.filter(i => i.id !== idToDelete));
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            toast.success('تم حذف الصنف نهائياً', { icon: '🗑️' });
            await fetchItems();
            setItems(prev => prev.filter(i => i.id !== idToDelete));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل في حذف الصنف');
        } finally {
            setIsDeleting(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterType('all');
        setFilterCategory('all');
        setFilterStock('all');
        setCurrentPage(1);
    };

    // Filtered Items
    const filteredItems = useMemo(() => {
        const filtered = items.filter(item => {
            // Search filter
            const matchesSearch =
                item.itemNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.grade && item.grade.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.itemNameEn && item.itemNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.gradeName != null && String(item.gradeName).includes(searchTerm));

            // Status filter
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && item.isActive) ||
                (filterStatus === 'inactive' && !item.isActive);

            // Type filter
            const matchesType = filterType === 'all' || item.itemType === filterType;

            // Category filter
            const matchesCategory = filterCategory === 'all' || item.categoryName === filterCategory;

            // Stock filter
            let matchesStock = true;
            if (filterStock !== 'all') {
                const stock = item.currentStock || 0;
                const min = item.minStockLevel || 0;
                if (filterStock === 'out') matchesStock = stock <= 0;
                else if (filterStock === 'low') matchesStock = stock > 0 && stock <= min;
                else if (filterStock === 'available') matchesStock = stock > min;
            }

            return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesStock;
        });
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [items, searchTerm, filterStatus, filterType, filterCategory, filterStock]);

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterType, filterCategory, filterStock]);

    // Stats
    const stats = useMemo(() => {
        const sellable = items.filter(i => i.isSellable).length;
        const purchasable = items.filter(i => i.isPurchasable).length;
        const lowStock = items.filter(i => {
            const stock = i.currentStock || 0;
            const min = i.minStockLevel || 0;
            return stock > 0 && stock <= min;
        }).length;
        const outOfStock = items.filter(i => (i.currentStock || 0) <= 0).length;
        const totalValue = items.reduce((sum, i) => sum + ((i.currentStock || 0) * (i.standardCost || i.lastPurchasePrice || 0)), 0);
        const avgMargin = items.reduce((sum, i) => {
            if (i.lastSalePrice && i.lastPurchasePrice && i.lastPurchasePrice > 0) {
                return sum + ((i.lastSalePrice - i.lastPurchasePrice) / i.lastPurchasePrice * 100);
            }
            return sum;
        }, 0) / (items.filter(i => i.lastSalePrice && i.lastPurchasePrice).length || 1);

        return {
            total: items.length,
            active: items.filter(i => i.isActive).length,
            sellable,
            purchasable,
            lowStock,
            outOfStock,
            totalValue,
            avgMargin: avgMargin.toFixed(1)
        };
    }, [items]);

    // Get unique categories for filter
    const categories = useMemo(() => {
        return [...new Set(items.map(i => i.categoryName).filter(Boolean))];
    }, [items]);

    const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterCategory !== 'all' || filterStock !== 'all';

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
                            <Package className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">إدارة الأصناف</h1>
                            <p className="text-white/70 text-lg">إدارة بيانات المواد الخام والمنتجات والقطع</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
                            transition-colors duration-200" title="تصدير">
                            <Download className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
                            transition-colors duration-200" title="استيراد">
                            <Upload className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/inventory/items/new')}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary 
                                rounded-xl font-bold hover:bg-white/90 transition-all duration-300
                                shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            <span>إضافة صنف</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatCard
                    icon={Package}
                    value={stats.total}
                    label="إجمالي الأصناف"
                    color="primary"
                />
                <StatCard
                    icon={CheckCircle2}
                    value={stats.active}
                    label="صنف نشط"
                    trend={{ value: `${Math.round((stats.active / stats.total) * 100) || 0}%`, isUp: true }}
                    color="success"
                />
                <StatCard
                    icon={AlertTriangle}
                    value={stats.lowStock}
                    label="مخزون منخفض"
                    color="warning"
                />
                <StatCard
                    icon={XCircle}
                    value={stats.outOfStock}
                    label="نفذ من المخزون"
                    color="danger"
                />
                <StatCard
                    icon={DollarSign}
                    value={`${(stats.totalValue / 1000).toFixed(0)}K`}
                    label="قيمة المخزون"
                    color="purple"
                />
                <StatCard
                    icon={Percent}
                    value={`${stats.avgMargin}%`}
                    label="متوسط هامش الربح"
                    trend={{ value: stats.avgMargin + '%', isUp: parseFloat(stats.avgMargin) > 0 }}
                    color="success"
                />
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث بالعلامة التجارية/Grade، الاسم، الباركود، أو MFR..."
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

                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                            {[
                                { value: 'all', label: 'الكل' },
                                { value: 'active', label: 'نشط' },
                                { value: 'inactive', label: 'غير نشط' },
                            ].map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setFilterStatus(filter.value as typeof filterStatus)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${filterStatus === filter.value
                                            ? 'bg-white text-brand-primary shadow-sm'
                                            : 'text-slate-600 hover:text-slate-800'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {/* Stock Filter */}
                        <select
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value as typeof filterStock)}
                            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm
                                focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none"
                        >
                            <option value="all">كل المخزون</option>
                            <option value="available">متوفر</option>
                            <option value="low">منخفض</option>
                            <option value="out">نفذ</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm
                                focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none"
                        >
                            <option value="all">جميع الأنواع</option>
                            <option value="RAW_MATERIAL">مادة خام</option>
                            <option value="FINISHED_GOOD">منتج نهائي</option>
                            <option value="SEMI_FINISHED">نصف مصنع</option>
                            <option value="SPARE_PART">قطعة غيار</option>
                            <option value="CONSUMABLE">مستهلك</option>
                        </select>

                        {/* Category Filter */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm
                                focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none"
                        >
                            <option value="all">جميع التصنيفات</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchItems}
                            disabled={loading}
                            className="p-3 rounded-xl border border-slate-200 text-slate-600 
                                hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                                disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <span className="text-sm text-slate-500">الفلاتر النشطة:</span>
                        {searchTerm && (
                            <FilterBadge
                                label={`بحث: ${searchTerm}`}
                                onRemove={() => setSearchTerm('')}
                            />
                        )}
                        {filterStatus !== 'all' && (
                            <FilterBadge
                                label={`الحالة: ${filterStatus === 'active' ? 'نشط' : 'غير نشط'}`}
                                onRemove={() => setFilterStatus('all')}
                            />
                        )}
                        {filterStock !== 'all' && (
                            <FilterBadge
                                label={`المخزون: ${filterStock === 'available' ? 'متوفر' : filterStock === 'low' ? 'منخفض' : 'نفذ'}`}
                                onRemove={() => setFilterStock('all')}
                            />
                        )}
                        {filterType !== 'all' && (
                            <FilterBadge
                                label={`النوع: ${filterType}`}
                                onRemove={() => setFilterType('all')}
                            />
                        )}
                        {filterCategory !== 'all' && (
                            <FilterBadge
                                label={`التصنيف: ${filterCategory}`}
                                onRemove={() => setFilterCategory('all')}
                            />
                        )}
                        <button
                            onClick={clearFilters}
                            className="text-sm text-slate-500 hover:text-slate-700 mr-auto"
                        >
                            مسح الكل
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                        <span className="text-slate-600">
                            عرض <span className="font-bold text-slate-800">{filteredItems.length}</span> من{' '}
                            <span className="font-bold text-slate-800">{items.length}</span> صنف
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Info className="w-4 h-4" />
                        <span>اسحب الجدول أفقياً لعرض المزيد من البيانات</span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1400px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <Barcode className="w-4 h-4" />
                                        كود الصنف
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        العلامة التجارية / Grade
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        اسم الصنف
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4" />
                                        MFR
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        التصنيف / النوع
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <Box className="w-4 h-4" />
                                        الوحدة
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <Scale className="w-4 h-4" />
                                        المخزون
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        التكلفة
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        سعر البيع
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4" />
                                        الخصائص
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right text-xs font-semibold text-slate-600 uppercase">الحالة</th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : paginatedItems.length > 0 ? (
                                paginatedItems.map((item, index) => (
                                    <ItemRow
                                        key={item.id}
                                        item={item}
                                        onEdit={() => navigate(`/dashboard/inventory/items/${item.id}`)}
                                        onDelete={() => item.id && handleDeleteClick(item.id)}
                                        onView={() => navigate(`/dashboard/inventory/items/${item.id}`)}
                                        canDelete={(item.currentStock ?? 0) <= 0}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <EmptyState searchTerm={searchTerm} onAdd={() => navigate('/dashboard/inventory/items/new')} />
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && filteredItems.length > itemsPerPage && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="text-sm text-slate-500">
                            صفحة <span className="font-bold text-slate-700">{currentPage}</span> من{' '}
                            <span className="font-bold text-slate-700">{totalPages}</span>
                            {' '}(<span className="font-medium">{paginatedItems.length}</span> من {filteredItems.length} صنف)
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-primary 
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronsRight className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-primary 
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let page: number;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all
                                                ${currentPage === page
                                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                                                    : 'text-slate-600 hover:bg-white hover:text-brand-primary'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-primary 
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-primary 
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronsLeft className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف صنف نهائياً"
                message="هل أنت متأكد من حذف هذا الصنف؟ سيتم حذفه من النظام نهائياً. الحذف مسموح فقط عندما تكون الكمية في المخزون صفراً."
                confirmText="حذف نهائياً"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default ItemsMasterPage;