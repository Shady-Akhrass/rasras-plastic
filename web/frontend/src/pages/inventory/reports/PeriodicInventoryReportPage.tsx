import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, ChevronRight, Download, RefreshCw, Package, Scale } from 'lucide-react';
import stockBalanceService from '../../../services/stockBalanceService';
import type { StockBalanceDto } from '../../../services/stockBalanceService';
import { itemService } from '../../../services/itemService';
import type { ItemDto } from '../../../services/itemService';
import { toast } from 'react-hot-toast';

const PeriodicInventoryReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [balances, setBalances] = useState<StockBalanceDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [balRes, itRes] = await Promise.all([
                stockBalanceService.getAllBalances(),
                itemService.getAllItems()
            ]);
            const bal = (balRes as any)?.data ?? [];
            const it = (itRes as any)?.data ?? [];
            setBalances(Array.isArray(bal) ? bal : []);
            setItems(Array.isArray(it) ? it : []);
        } catch (e) {
            toast.error('فشل تحميل البيانات');
            setBalances([]);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const belowMin = useMemo(() => {
        return items.filter((i) => {
            const b = balances.find((x) => x.itemId === i.id);
            const q = b?.quantityOnHand ?? (i as any).currentStock ?? 0;
            const min = Number(i.minStockLevel) || 0;
            return min > 0 && q < min;
        });
    }, [items, balances]);

    const totalValue = useMemo(() => {
        return balances.reduce((s, b) => s + (Number(b.quantityOnHand) || 0) * (Number(b.averageCost) || 0), 0);
    }, [balances]);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/dashboard/inventory/sections')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 rounded-2xl"><FileDown className="w-10 h-10" /></div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">تقرير المخزون الدوري</h1>
                            <p className="text-white/80">رصيد أول/آخر المدة، الإضافات، المصروفات، والأصناف تحت الحد</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <span className="text-white/80">/</span>
                            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                                {[year, year-1, year-2].map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button onClick={fetchData} disabled={loading} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
                        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl"><Download className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2"><Scale className="w-5 h-5 text-blue-600" /><span className="text-sm text-slate-500">إجمالي الأصناف (رصيد)</span></div>
                    <p className="text-2xl font-bold text-slate-800">{balances.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2"><Package className="w-5 h-5 text-amber-600" /><span className="text-sm text-slate-500">تحت الحد الأدنى</span></div>
                    <p className="text-2xl font-bold text-amber-600">{belowMin.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-2">قيمة المخزون (تقدير)</div>
                    <p className="text-2xl font-bold text-slate-800">{totalValue.toLocaleString('ar-EG', { maximumFractionDigits: 0 })}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-slate-900">تفاصيل الرصيد بالمخزن</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="bg-slate-50 border-b"><th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">كود الصنف</th><th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الصنف</th><th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">المستودع</th><th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الرصيد</th><th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">متوسط التكلفة</th><th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">القيمة</th></tr></thead>
                        <tbody>
                            {loading ? [...Array(5)].map((_, i) => <tr key={i} className="border-b animate-pulse"><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-200 rounded" /></td></tr>) :
                                balances.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500">لا توجد أرصدة أو لم يتم تحميلها من <code>/inventory/stocks</code></td></tr>
                                ) : (
                                    balances.map((b) => (
                                        <tr key={b.id} className="border-b hover:bg-slate-50">
                                            <td className="px-6 py-3 font-mono text-slate-700">{b.itemCode || '—'}</td>
                                            <td className="px-6 py-3">{b.itemNameAr || '—'}</td>
                                            <td className="px-6 py-3">{b.warehouseNameAr || '—'}</td>
                                            <td className="px-6 py-3 font-medium">{(Number(b.quantityOnHand) || 0).toLocaleString()}</td>
                                            <td className="px-6 py-3">{(Number(b.averageCost) || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-3">{(Number(b.quantityOnHand) || 0) * (Number(b.averageCost) || 0).toLocaleString('ar-EG', { maximumFractionDigits: 0 })}</td>
                                        </tr>
                                    ))
                                )}
                        </tbody>
                    </table>
                </div>
            </div>

            {belowMin.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
                    <div className="p-4 border-b border-amber-100 bg-amber-50">
                        <h2 className="font-bold text-amber-800">الأصناف تحت الحد الأدنى</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-slate-50 border-b"><th className="px-6 py-3 text-right text-xs font-semibold">كود الصنف</th><th className="px-6 py-3 text-right text-xs font-semibold">الصنف</th><th className="px-6 py-3 text-right text-xs font-semibold">الحد الأدنى</th><th className="px-6 py-3 text-right text-xs font-semibold">الإجراء</th></tr></thead>
                            <tbody>
                                {belowMin.map((i) => (
                                    <tr key={i.id} className="border-b">
                                        <td className="px-6 py-3 font-mono">{i.itemCode}</td>
                                        <td className="px-6 py-3">{i.itemNameAr}</td>
                                        <td className="px-6 py-3">{i.minStockLevel ?? '—'}</td>
                                        <td className="px-6 py-3"><button onClick={() => navigate(`/dashboard/inventory/items/${i.id}`)} className="text-brand-primary font-medium">فتح</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeriodicInventoryReportPage;
