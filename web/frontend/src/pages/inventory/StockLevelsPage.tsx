import React, { useState, useEffect } from 'react';
import {
    Activity,
    Search,
    Filter,
    Package,
    AlertTriangle,
    TrendingUp,
    RefreshCw,
    Download,
    Plus,
    Edit,
    Trash2,
    X
} from 'lucide-react';
import { stockBalanceService, type StockBalanceDto } from '../../services/stockBalanceService';
import { itemService, type ItemDto } from '../../services/itemService';
import warehouseService, { type WarehouseDto } from '../../services/warehouseService';
import toast from 'react-hot-toast';



const StockLevelsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stocks, setStocks] = useState<StockBalanceDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseFilter] = useState<number | 'all'>('all');

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

    const openCreate = () => {
        setCurrentStock({
            itemId: undefined,
            warehouseId: undefined,
            quantityOnHand: 0,
            quantityReserved: 0,
            averageCost: 0
        });
        setShowModal(true);
    };

    const filteredStocks = stocks.filter(s => {
        const matchesSearch = (s.itemNameAr?.includes(searchTerm) || false) ||
            (s.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        const matchesWarehouse = warehouseFilter === 'all' || s.warehouseId === warehouseFilter;
        return matchesSearch && matchesWarehouse;
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="w-6 h-6 text-brand-primary" />
                        أرصدة المخزون
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">مراقبة مستويات المخزون والقيم المالية في جميع المستودعات</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="p-3 bg-slate-50 text-slate-500 hover:text-brand-primary hover:bg-blue-50 rounded-xl transition-all">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={openCreate} className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-brand-primary/20 transition-all">
                        <Plus className="w-5 h-5" /> إضافة رصيد يدوي
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 bg-white text-brand-primary border-2 border-brand-primary rounded-xl font-bold hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package className="w-5 h-5" /></div>
                        <span className="text-slate-500 font-medium">إجمالي الأصناف</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{stocks.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                        <span className="text-slate-500 font-medium">قيمة المخزون</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {stocks.reduce((acc, s) => acc + (s.quantityOnHand * s.averageCost), 0).toLocaleString()}
                        <span className="text-xs text-slate-400 mr-1">ج.م</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                        <span className="text-slate-500 font-medium">نواقص (قريب من Min)</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">0</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                        <span className="text-slate-500 font-medium">حركة اليوم</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800">--</div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="بحث باسم الصنف أو الكود..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        />
                    </div>
                    <button className="px-4 py-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 flex items-center gap-2 font-medium">
                        <Filter className="w-5 h-5" /> تصفية
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50/50 text-slate-500 text-sm font-bold">
                            <tr>
                                <th className="px-6 py-4">الصنف</th>
                                <th className="px-6 py-4">المستودع</th>
                                <th className="px-6 py-4 text-center">الرصيد الفعلي</th>
                                <th className="px-6 py-4 text-center">المحجوز</th>
                                <th className="px-6 py-4 text-center">المتاح</th>
                                <th className="px-6 py-4 text-center">متوسط التكلفة</th>
                                <th className="px-6 py-4 text-center">الإجمالي</th>
                                <th className="px-6 py-4 text-center">أدوات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStocks.map((stock) => (
                                <tr key={stock.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{stock.itemNameAr}</div>
                                        <div className="text-xs text-slate-400 font-mono">{stock.itemCode}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{stock.warehouseNameAr}</td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-800 bg-slate-50/50">{stock.quantityOnHand}</td>
                                    <td className="px-6 py-4 text-center text-amber-600 font-medium">{stock.quantityReserved}</td>
                                    <td className="px-6 py-4 text-center text-emerald-600 font-bold">{stock.availableQty}</td>
                                    <td className="px-6 py-4 text-center text-slate-600">{stock.averageCost.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center font-bold text-brand-primary">{((stock.quantityOnHand || 0) * (stock.averageCost || 0)).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center text-xs text-slate-400">
                                        {stock.lastMovementDate ? new Date(stock.lastMovementDate).toLocaleDateString('ar-EG') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => openEdit(stock)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => stock.id && handleDelete(stock.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStocks.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400 italic">لا توجد بيانات مطابقة</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Management Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">
                                {currentStock.id ? 'تعديل رصيد مخزن' : 'إضافة رصيد مخزني جديد'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-600">الصنف</label>
                                    <select
                                        value={currentStock.itemId || ''}
                                        disabled={!!currentStock.id}
                                        onChange={(e) => setCurrentStock({ ...currentStock, itemId: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-brand-primary outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="">اختر صنف...</option>
                                        {items.map(item => (
                                            <option key={item.id} value={item.id}>{item.itemNameAr}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-600">المستودع</label>
                                    <select
                                        value={currentStock.warehouseId || ''}
                                        disabled={!!currentStock.id}
                                        onChange={(e) => setCurrentStock({ ...currentStock, warehouseId: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-brand-primary outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="">اختر مستودع...</option>
                                        {warehouses.map(wh => (
                                            <option key={wh.id} value={wh.id}>{wh.warehouseNameAr}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-600">الرصيد الفعلي</label>
                                        <input
                                            type="number"
                                            value={currentStock.quantityOnHand || 0}
                                            onChange={(e) => setCurrentStock({ ...currentStock, quantityOnHand: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-brand-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-600">المحجوز</label>
                                        <input
                                            type="number"
                                            value={currentStock.quantityReserved || 0}
                                            onChange={(e) => setCurrentStock({ ...currentStock, quantityReserved: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-brand-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-600">متوسط التكلفة</label>
                                    <input
                                        type="number"
                                        value={currentStock.averageCost || 0}
                                        onChange={(e) => setCurrentStock({ ...currentStock, averageCost: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-brand-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-8 py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 hover:bg-slate-100 transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockLevelsPage;
