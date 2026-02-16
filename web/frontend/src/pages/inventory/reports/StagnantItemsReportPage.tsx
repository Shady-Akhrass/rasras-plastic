import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingDown, ChevronRight, Download, RefreshCw, Package, Search, Calendar
} from 'lucide-react';
import { itemService, type ItemDto } from '../../../services/itemService';
import stockBalanceService, { type StockBalanceDto } from '../../../services/stockBalanceService';
import { toast } from 'react-hot-toast';

type ItemWithStock = ItemDto & {
    currentStock: number;
    lastMovementDate: string | null;
    daysSinceLastMovement: number | null;
};

// أصناف راكدة: رصيد > 0 ولم تُسجّل حركة منذ X يوم (بناءً على lastMovementDate من الأرصدة)
const StagnantItemsReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ItemWithStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [daysThreshold, setDaysThreshold] = useState(90); // فترة عدم الحركة (يوم)
    const [displayLimit, setDisplayLimit] = useState(50);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const [itemResponse, stockResponse] = await Promise.all([
                itemService.getAllItems(),
                stockBalanceService.getAllBalances(),
            ]);

            // دعم أشكال الاستجابة: { data: T[] } أو المصفوفة مباشرة
            const itemsArray: ItemDto[] = Array.isArray((itemResponse as { data?: ItemDto[] })?.data)
                ? (itemResponse as { data: ItemDto[] }).data
                : Array.isArray(itemResponse)
                    ? (itemResponse as unknown as ItemDto[])
                    : [];
            const balances: StockBalanceDto[] = Array.isArray((stockResponse as { data?: StockBalanceDto[] })?.data)
                ? (stockResponse as { data: StockBalanceDto[] }).data
                : Array.isArray(stockResponse)
                    ? (stockResponse as unknown as StockBalanceDto[])
                    : [];

            const now = new Date();
            const combinedItems: ItemWithStock[] = itemsArray.map((item) => {
                const itemStocks = balances.filter((s) => Number(s.itemId) === Number(item.id));
                const totalStock = itemStocks.reduce((sum, s) => sum + (Number(s.quantityOnHand) || 0), 0);

                // حساب آخر تاريخ حركة: أقصى lastMovementDate من أرصدة هذا الصنف
                const movementDates = itemStocks
                    .map((s) => s.lastMovementDate)
                    .filter((d): d is string => d != null && d !== '');
                const lastMovementDate =
                    movementDates.length > 0
                        ? movementDates.reduce((latest, current) =>
                            new Date(current) > new Date(latest) ? current : latest
                        )
                        : null;

                // حساب عدد الأيام منذ آخر حركة
                const daysSinceLastMovement =
                    lastMovementDate
                        ? Math.floor((now.getTime() - new Date(lastMovementDate).getTime()) / (1000 * 60 * 60 * 24))
                        : null;

                return { ...item, currentStock: totalStock, lastMovementDate, daysSinceLastMovement };
            });
            setItems(combinedItems);
        } catch (e) {
            toast.error('فشل تحميل الأصناف والأرصدة');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const totalStagnant = useMemo(() => {
        return items.filter((i) => {
            const stock = i.currentStock ?? 0;
            if (stock <= 0) return false;
            // راكد إذا: لا يوجد تاريخ آخر حركة OR مرّ على آخر حركة >= daysThreshold
            return i.daysSinceLastMovement === null || i.daysSinceLastMovement >= daysThreshold;
        }).length;
    }, [items, daysThreshold]);

    const stagnantAll = useMemo(() => {
        return items
            .filter((i) => {
                const stock = i.currentStock ?? 0;
                if (stock <= 0) return false;
                return i.daysSinceLastMovement === null || i.daysSinceLastMovement >= daysThreshold;
            })
            .sort((a, b) => {
                // ترتيب: الأطول بدون حركة أولاً (null = لا يوجد حركة أبداً يظهر في الأعلى)
                const daysA = a.daysSinceLastMovement ?? Infinity;
                const daysB = b.daysSinceLastMovement ?? Infinity;
                return daysB - daysA;
            });
    }, [items, daysThreshold]);

    const stagnant = useMemo(() => {
        let list = stagnantAll;
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            list = list.filter(
                (i) =>
                    (i.itemNameAr?.toLowerCase().includes(term)) ||
                    (i.grade?.toLowerCase().includes(term)) ||
                    (i.itemCode?.toLowerCase().includes(term))
            );
        }
        const limit = displayLimit === 0 ? list.length : displayLimit;
        return list.slice(0, limit);
    }, [stagnantAll, searchTerm, displayLimit]);

    const handleExportCsv = useCallback(() => {
        const toExport = stagnant.length > 0 ? stagnant : stagnantAll;
        if (toExport.length === 0) {
            toast.error('لا توجد بيانات للتصدير');
            return;
        }
        const headers = [
            'Grade',
            'اسم الصنف',
            'الرصيد',
            'آخر حركة',
            'أيام بدون حركة',
            'القيمة التقديرية',
        ];
        const rows = toExport.map((i) => {
            const stock = i.currentStock ?? 0;
            const cost = Number(i.standardCost) || Number(i.lastPurchasePrice) || 0;
            const value = stock * cost;
            const lastMoveText = i.lastMovementDate
                ? new Date(i.lastMovementDate).toLocaleDateString('ar-EG')
                : 'لم تُسجّل';
            const daysText =
                i.daysSinceLastMovement !== null ? String(i.daysSinceLastMovement) : '—';
            return [
                i.grade || i.itemCode || '',
                i.itemNameAr || '',
                String(stock),
                lastMoveText,
                daysText,
                String(value),
            ];
        });
        const BOM = '\uFEFF';
        const csvContent = BOM + [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تقرير-الأصناف-الراكدة-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('تم تصدير الملف');
    }, [stagnant, stagnantAll]);

    const effectiveLimit = displayLimit === 0 ? totalStagnant : Math.min(displayLimit, totalStagnant);
    const displayCountText =
        totalStagnant > effectiveLimit || (displayLimit > 0 && totalStagnant > displayLimit)
            ? searchTerm.trim()
                ? `عرض ${stagnant.length} من ${totalStagnant} (بعد البحث)`
                : `عرض ${effectiveLimit} من ${totalStagnant}`
            : `${totalStagnant}`;

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/dashboard/inventory/sections')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <TrendingDown className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">تقرير الأصناف الراكدة</h1>
                            <p className="text-white/80">أصناف ذات رصيد مسجّل ولم تُسجّل عليها حركة منذ فترة — بناءً على آخر تاريخ حركة فعلية</p>
                            <p className="text-white/70 text-sm mt-1">يظهر أصناف لها رصيد مسجّل ولا توجد حركة (دخول/صرف) منذ عدد الأيام المحددة أو لم تُسجّل لها حركة أبداً.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchItems} disabled={loading} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl" title="تحديث">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={handleExportCsv} disabled={loading || stagnant.length === 0} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl disabled:opacity-50" title="تصدير CSV">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-6 bg-amber-500 rounded-full" />
                        <h2 className="font-bold text-slate-900">الأصناف الراكدة ({displayCountText})</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span>فترة عدم الحركة (يوم):</span>
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={daysThreshold}
                                onChange={(e) => setDaysThreshold(Number(e.target.value) || 90)}
                                className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-sm"
                            />
                        </label>
                        <label className="flex items-center gap-1.5 text-sm text-slate-600">
                            <span>عرض:</span>
                            <select
                                value={displayLimit}
                                onChange={(e) => setDisplayLimit(Number(e.target.value))}
                                className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm"
                            >
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={200}>200</option>
                                <option value={0}>الكل</option>
                            </select>
                        </label>
                        <div className="flex items-center gap-1.5">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="بحث بالاسم أو Grade أو الكود..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-48 px-2 py-1.5 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">العلامة التجارية / Grade</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">اسم الصنف</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الرصيد</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">آخر حركة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">أيام بدون حركة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">القيمة التقديرية</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-200 rounded mx-auto" /></td>
                                    </tr>
                                ))
                            ) : stagnant.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>
                                            لا توجد أصناف راكدة حسب المعايير المحددة (بدون حركة منذ {daysThreshold} يوم أو أكثر)
                                        </p>
                                        
                                    </td>
                                </tr>
                            ) : (
                                stagnant.map((i) => {
                                    const stock = i.currentStock ?? 0;
                                    const cost = Number(i.standardCost) || Number(i.lastPurchasePrice) || 0;
                                    const estimatedValue = stock * cost;
                                    const lastMoveDisplay = i.lastMovementDate
                                        ? new Date(i.lastMovementDate).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })
                                        : '—';
                                    const daysDisplay =
                                        i.daysSinceLastMovement !== null
                                            ? `${i.daysSinceLastMovement.toLocaleString('ar-EG')} يوم`
                                            : 'لم تُسجّل';
                                    return (
                                        <tr key={i.id} className="border-b border-slate-100 hover:bg-amber-50/50">
                                            <td className="px-6 py-4 font-mono font-semibold text-brand-primary">{i.grade || i.itemCode}</td>
                                            <td className="px-6 py-4 font-medium text-slate-800">{i.itemNameAr}</td>
                                            <td className="px-6 py-4">{stock.toLocaleString('ar-EG')}</td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">{lastMoveDisplay}</td>
                                            <td className="px-6 py-4 text-amber-600 font-semibold">{daysDisplay}</td>
                                            <td className="px-6 py-4 text-slate-700">{estimatedValue.toLocaleString('ar-EG', { maximumFractionDigits: 0 })}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => navigate(`/dashboard/inventory/items/${i.id}`)}
                                                    className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium hover:bg-brand-primary hover:text-white"
                                                >
                                                    فتح
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {(displayLimit > 0 && totalStagnant > displayLimit) && (
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-sm text-slate-600">
                        عرض أول {displayLimit} صنف من أصل {totalStagnant} — مرتبة من الأقدم حركة (الأكثر ركوداً) أولاً. لرؤية الكل اختر «الكل» من قائمة العرض.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StagnantItemsReportPage;
