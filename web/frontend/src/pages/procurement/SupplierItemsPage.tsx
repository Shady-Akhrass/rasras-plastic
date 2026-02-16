import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Package,
    Truck,
    Link2Off,
    ExternalLink,
    RefreshCw,
    Plus,
    AlertCircle,
    X,
    TrendingUp,
    CheckCircle2
} from 'lucide-react';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import { formatNumber } from '../../utils/format';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import toast from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: string | number;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple' | 'blue' | 'rose';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        rose: 'bg-rose-100 text-rose-600'
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

// Table Row Component
const ItemTableRow: React.FC<{
    item: SupplierItemDto;
    index: number;
    onViewSupplier: (id: number) => void;
    onUnlink: (id: number) => void;
    isSelected: boolean;
    onToggleSelect: () => void;
}> = ({ item, index, onViewSupplier, onUnlink, isSelected, onToggleSelect }) => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    return (
        <tr
            className="hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0"
            style={{
                animationDelay: `${index * 30}ms`,
                animation: 'fadeInUp 0.3s ease-out forwards'
            }}
        >
            <td className="px-4 py-4 text-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/40"
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                            {item.itemNameAr}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">#{item.itemCode}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span>{item.supplierId} - (مورد)</span>
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
                    {item.supplierItemCode || '-'}
                </span>
            </td>
            <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-emerald-600">
                        {item.lastPrice ? `${formatNumber(item.lastPrice)} ${getCurrencyLabel(item.currency || defaultCurrency)}` : '-'}
                    </span>
                    {item.lastPrice && item.currency !== defaultCurrency && (
                        <span className="text-[10px] text-slate-400 font-bold">
                            (≈ {formatNumber(convertAmount(item.lastPrice, item.currency || defaultCurrency))} {getCurrencyLabel(defaultCurrency)})
                        </span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 text-center text-sm text-slate-500">
                {item.lastPriceDate || '-'}
            </td>
            <td className="px-6 py-4 text-center text-sm text-slate-600">
                {item.minOrderQty != null ? formatNumber(item.minOrderQty) : '-'}
            </td>
            <td className="px-6 py-4 text-center text-sm text-slate-600">
                {item.leadTimeDays ? `${item.leadTimeDays} يوم` : '-'}
            </td>
            <td className="px-6 py-4 text-center">
                {item.isPreferred ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        مفضل
                    </span>
                ) : (
                    <span className="text-slate-300 text-xs">—</span>
                )}
            </td>
            <td className="px-6 py-4 text-center">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold 
                ${item.isActive
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    {item.isActive ? 'نشط' : 'معطل'}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onViewSupplier(item.supplierId)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="عرض المورد"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onUnlink(item.id!)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="فك الارتباط"
                    >
                        <Link2Off className="w-4 h-4" />
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
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                        <div>
                            <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
                            <div className="h-3 w-20 bg-slate-50 rounded" />
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-full mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-full mx-auto" /></td>
                <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                    </div>
                </td>
            </tr>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <tr>
        <td colSpan={10} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <AlertCircle className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm ? 'لا توجد نتائج' : 'لا توجد ارتباطات'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm
                        ? `لم يتم العثور على أصناف تطابق "${searchTerm}"`
                        : 'جرب كلمات بحث أخرى أو ابدأ بربط صنف جديد بالموردين'}
                </p>
            </div>
        </td>
    </tr>
);

const SupplierItemsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<SupplierItemDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await supplierService.getAllSupplierItems();
            setItems(response.data || []);
            setSelectedIds([]);
        } catch (error) {
            console.error('Failed to fetch supplier items:', error);
            toast.error('فشل تحميل بيانات الأصناف');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUnlink = async () => {
        if (selectedIds.length === 0) {
            toast.error('يرجى اختيار صنف واحد على الأقل لفك الارتباط');
            return;
        }

        const count = selectedIds.length;
        const confirmMessage =
            count === 1
                ? 'هل أنت متأكد من فك ارتباط هذا الصنف من مورده؟'
                : `هل أنت متأكد من فك ارتباط عدد (${count}) من الأصناف من الموردين؟ سيتم تنفيذ العملية دفعة واحدة.`;

        if (!window.confirm(confirmMessage)) return;

        try {
            setLoading(true);
            // تنفيذ فك الارتباط بالتتابع لضمان بساطة التعامل مع الأخطاء
            for (const id of selectedIds) {
                try {
                    await supplierService.unlinkItem(id);
                } catch (err) {
                    console.error('Failed to unlink item:', err);
                }
            }

            toast.success(`تم فك ارتباط ${count} من الأصناف بنجاح`);
            await fetchData();
        } catch (error) {
            console.error('Failed to bulk unlink items:', error);
            toast.error('فشل فك الارتباط الجماعي');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من فك ارتباط هذا المورد بهذا الصنف؟')) return;

        try {
            await supplierService.unlinkItem(id);
            toast.success('تم فك الارتباط بنجاح');
            fetchData();
        } catch (error) {
            console.error('Failed to unlink item:', error);
            toast.error('فشل فك الارتباط');
        }
    };

    const handleViewSupplier = (id: number) => {
        navigate(`/dashboard/procurement/suppliers/${id}`);
    };

    const filteredItems = useMemo(() => {
        const filtered = items.filter(item =>
            item.itemNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplierItemCode?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [items, searchTerm]);

    const stats = useMemo(() => ({
        total: items.length,
        active: items.filter(i => i.isActive).length,
        preferred: items.filter(i => i.isPreferred).length,
    }), [items]);

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
                <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Package className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">سجل أصناف الموردين</h1>
                            <p className="text-white/70 text-lg">إدارة وربط الأصناف بالموردين المعتمدين</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard/procurement/suppliers/items/new')}
                            className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                                hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                                hover:shadow-xl hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            <span>ربط صنف جديد</span>
                        </button>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 
                                transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={Package}
                    value={stats.total}
                    label="إجمالي الارتباطات"
                    color="primary"
                />
                <StatCard
                    icon={CheckCircle2}
                    value={stats.active}
                    label="نشط"
                    color="success"
                />
                <StatCard
                    icon={TrendingUp}
                    value={stats.preferred}
                    label="موردين مفضلين"
                    color="purple"
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث باسم الصنف، الكود، أو كود المورد..."
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
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <button
                            type="button"
                            onClick={handleBulkUnlink}
                            disabled={loading || selectedIds.length === 0}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border
                                ${selectedIds.length > 0 && !loading
                                    ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100'
                                    : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-70'
                                }`}
                            title="فك ارتباط الأصناف المحددة دفعة واحدة"
                        >
                            <Link2Off className="w-4 h-4" />
                            <span>فك ارتباط المحدد</span>
                            {selectedIds.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-white/70 text-xs font-bold">
                                    {selectedIds.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredItems.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{items.length}</span> ارتباط
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const allIds = filteredItems
                                                    .map(i => i.id)
                                                    .filter((id): id is number => id != null);
                                                setSelectedIds(allIds);
                                            } else {
                                                setSelectedIds([]);
                                            }
                                        }}
                                        checked={
                                            filteredItems.length > 0 &&
                                            filteredItems.every(i => i.id && selectedIds.includes(i.id))
                                        }
                                        className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/40"
                                    />
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الصنف</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المورد</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">كود الصنف عند المورد</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">آخر سعر</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">تاريخ السعر</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">أقل كمية</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">مدة التوريد</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">أفضلية</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredItems.length === 0 ? (
                                <EmptyState searchTerm={searchTerm} />
                            ) : (
                                filteredItems.map((item, index) => (
                                    <ItemTableRow
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        onViewSupplier={handleViewSupplier}
                                        onUnlink={handleUnlink}
                                        isSelected={item.id != null && selectedIds.includes(item.id)}
                                        onToggleSelect={() => {
                                            if (item.id == null) return;
                                            setSelectedIds(prev =>
                                                prev.includes(item.id as number)
                                                    ? prev.filter(x => x !== item.id)
                                                    : [...prev, item.id as number]
                                            );
                                        }}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupplierItemsPage;