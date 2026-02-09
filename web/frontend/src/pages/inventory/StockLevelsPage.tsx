import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Filter,
    Package,
    AlertTriangle,
    RefreshCw,
    Download,
    Edit,
    Trash2,
    X,
    Boxes,
    DollarSign,
    ArrowUpDown
} from 'lucide-react';
import { stockBalanceService, type StockBalanceDto } from '../../services/stockBalanceService';
import { itemService, type ItemDto } from '../../services/itemService';
import warehouseService, { type WarehouseDto } from '../../services/warehouseService';
import { formatNumber, formatDate } from '../../utils/format';
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
const StockTableRow: React.FC<{
    stock: StockBalanceDto;
    index: number;
    onEdit: (stock: StockBalanceDto) => void;
    onDelete: (id: number) => void;
}> = ({ stock, index, onEdit, onDelete }) => (
    <tr
        className="hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                    <div className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                        {stock.itemNameAr}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{stock.itemCode}</div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">{stock.warehouseNameAr}</td>
        <td className="px-6 py-4 text-center">
            <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm">
                {stock.quantityOnHand}
            </span>
        </td>
        <td className="px-6 py-4 text-center">
            <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-bold text-sm">
                {stock.quantityReserved}
            </span>
        </td>
        <td className="px-6 py-4 text-center">
            <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm">
                {stock.availableQty}
            </span>
        </td>
        <td className="px-6 py-4 text-center text-slate-600 font-medium">
            {formatNumber(stock.averageCost ?? 0)} ج.م
        </td>
        <td className="px-6 py-4 text-center">
            <span className="font-bold text-brand-primary">
                {formatNumber((stock.quantityOnHand ?? 0) * (stock.averageCost ?? 0))} ج.م
            </span>
        </td>
        <td className="px-6 py-4 text-center text-xs text-slate-400">
            {stock.lastMovementDate ? formatDate(stock.lastMovementDate) : '-'}
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={() => onEdit(stock)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="تعديل"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={() => stock.id && onDelete(stock.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
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
                        <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                        <div>
                            <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
                            <div className="h-3 w-20 bg-slate-50 rounded" />
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
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
        <td colSpan={9} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <Boxes className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm ? 'لا توجد نتائج' : 'لا توجد أرصدة مخزنية'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm
                        ? `لم يتم العثور على أرصدة تطابق "${searchTerm}"`
                        : 'لم يتم تسجيل أي أرصدة مخزنية بعد'}
                </p>
            </div>
        </td>
    </tr>
);

const StockLevelsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stocks, setStocks] = useState<StockBalanceDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState<number | 'all'>('all');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentStock, setCurrentStock] = useState<Partial<StockBalanceDto>>({
        itemId: undefined,
        warehouseId: undefined,
        quantityOnHand: 0,
        quantityReserved: 0,
        averageCost: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [stockData, itemData, warehouseData] = await Promise.all([
                stockBalanceService.getAllBalances(),
                itemService.getAllItems(),
                warehouseService.getActive()
            ]);
            setStocks(stockData.data);
            setItems(itemData.data);
            setWarehouses(warehouseData.data);
        } catch (error) {
            console.error(error);
            toast.error('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!currentStock.itemId || !currentStock.warehouseId) {
                toast.error('يرجى اختيار الصنف والمستودع');
                return;
            }
            setSaving(true);
            if (currentStock.id) {
                await stockBalanceService.updateBalance(currentStock.id, currentStock as StockBalanceDto);
                toast.success('تم تحديث الرصيد');
            } else {
                await stockBalanceService.createBalance(currentStock as StockBalanceDto);
                toast.success('تم إضافة الرصيد');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error('فشل عملية الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الرصيد؟')) return;
        try {
            await stockBalanceService.deleteBalance(id);
            toast.success('تم الحذف بنجاح');
            fetchData();
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    const openEdit = (stock: StockBalanceDto) => {
        setCurrentStock(stock);
        setShowModal(true);
    };


    const filteredStocks = useMemo(() => {
        const filtered = stocks.filter(s => {
            const matchesSearch = (s.itemNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                (s.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
            const matchesWarehouse = warehouseFilter === 'all' || s.warehouseId === warehouseFilter;
            return matchesSearch && matchesWarehouse;
        });
        // الأحدث في الأعلى (بالـ id)
        return [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [stocks, searchTerm, warehouseFilter]);

    const stats = useMemo(() => {
        const totalValue = stocks.reduce((acc, s) => acc + ((s.quantityOnHand || 0) * (s.averageCost || 0)), 0);
        const lowStock = stocks.filter(s => (s.quantityOnHand || 0) < 10).length; // Example threshold
        const totalItems = stocks.length;
        const totalQuantity = stocks.reduce((acc, s) => acc + (s.quantityOnHand || 0), 0);

        return {
            totalItems,
            totalValue: formatNumber(totalValue),
            lowStock,
            totalQuantity: formatNumber(totalQuantity)
        };
    }, [stocks]);

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
                            <Boxes className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">أرصدة المخزون</h1>
                            <p className="text-white/70 text-lg">مراقبة مستويات المخزون والقيم المالية في جميع المستودعات</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 
                                transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white 
                                rounded-xl font-bold hover:bg-white/20 transition-all duration-200"
                        >
                            <Download className="w-5 h-5" />
                            <span className="hidden sm:inline">تصدير</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Package}
                    value={stats.totalItems}
                    label="إجمالي الأصناف"
                    color="primary"
                />
                <StatCard
                    icon={DollarSign}
                    value={`${stats.totalValue} ج.م`}
                    label="قيمة المخزون"
                    color="success"
                />
                <StatCard
                    icon={AlertTriangle}
                    value={stats.lowStock}
                    label="نواقص المخزون"
                    color="warning"
                />
                <StatCard
                    icon={ArrowUpDown}
                    value={stats.totalQuantity}
                    label="إجمالي الكميات"
                    color="blue"
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث باسم الصنف أو الكود..."
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

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent
                            hover:border-slate-200 transition-all duration-200">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                value={warehouseFilter}
                                onChange={(e) => setWarehouseFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                            >
                                <option value="all">جميع المستودعات</option>
                                {warehouses.map(wh => (
                                    <option key={wh.id} value={wh.id}>{wh.warehouseNameAr}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredStocks.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{stocks.length}</span> رصيد
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الصنف</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المستودع</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">الرصيد الفعلي</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">المحجوز</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">المتاح</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">متوسط التكلفة</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">الإجمالي</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">آخر حركة</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredStocks.length === 0 ? (
                                <EmptyState searchTerm={searchTerm} />
                            ) : (
                                filteredStocks.map((stock, index) => (
                                    <StockTableRow
                                        key={stock.id}
                                        stock={stock}
                                        index={index}
                                        onEdit={openEdit}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Management Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 
                    animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden 
                        animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">
                                {currentStock.id ? 'تعديل رصيد مخزني' : 'إضافة رصيد مخزني جديد'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">الصنف *</label>
                                    <select
                                        value={currentStock.itemId || ''}
                                        disabled={!!currentStock.id}
                                        onChange={(e) => setCurrentStock({ ...currentStock, itemId: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent 
                                            focus:border-brand-primary outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="">اختر صنف...</option>
                                        {items.map(item => (
                                            <option key={item.id} value={item.id}>{item.itemNameAr}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">المستودع *</label>
                                    <select
                                        value={currentStock.warehouseId || ''}
                                        disabled={!!currentStock.id}
                                        onChange={(e) => setCurrentStock({ ...currentStock, warehouseId: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent 
                                            focus:border-brand-primary outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="">اختر مستودع...</option>
                                        {warehouses.map(wh => (
                                            <option key={wh.id} value={wh.id}>{wh.warehouseNameAr}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600">الرصيد الفعلي</label>
                                        <input
                                            type="number"
                                            value={currentStock.quantityOnHand || 0}
                                            onChange={(e) => setCurrentStock({ ...currentStock, quantityOnHand: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent 
                                                focus:border-brand-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600">المحجوز</label>
                                        <input
                                            type="number"
                                            value={currentStock.quantityReserved || 0}
                                            onChange={(e) => setCurrentStock({ ...currentStock, quantityReserved: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent 
                                                focus:border-brand-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">متوسط التكلفة</label>
                                    <input
                                        type="number"
                                        value={currentStock.averageCost || 0}
                                        onChange={(e) => setCurrentStock({ ...currentStock, averageCost: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent 
                                            focus:border-brand-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold 
                                    shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockLevelsPage;