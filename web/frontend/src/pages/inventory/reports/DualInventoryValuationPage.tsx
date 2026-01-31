import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calculator, ChevronRight, RefreshCw, AlertTriangle,
    DollarSign, TrendingUp, Scale, FileDown
} from 'lucide-react';
import stockBalanceService from '../../../services/stockBalanceService';
import type { StockBalanceDto } from '../../../services/stockBalanceService';
import { itemService } from '../../../services/itemService';
import type { ItemDto } from '../../../services/itemService';
import { toast } from 'react-hot-toast';

/** عتبة نسبة الفرق لتفعيل التنبيه (15%) */
const DIFF_ALERT_THRESHOLD_PCT = 0.15;

export interface DualValuationRow {
    itemId: number;
    itemCode: string;
    itemNameAr: string;
    unitName?: string;
    qty: number;
    /** التكلفة التاريخية للوحدة (محاسبة): من متوسط التكلفة في الأرصدة أو standardCost/lastPurchasePrice */
    historicalCostPerUnit: number;
    /** سعر الإحلال للوحدة (قرارات) */
    replacementPricePerUnit: number;
    /** قيمة المخزون بالتكلفة التاريخية */
    valueHistorical: number;
    /** قيمة المخزون بسعر الإحلال */
    valueReplacement: number;
    /** نسبة الفرق: |replacement - historical| / historical */
    diffPct: number;
    hasAlert: boolean;
}

const DualInventoryValuationPage: React.FC = () => {
    const navigate = useNavigate();
    const [balances, setBalances] = useState<StockBalanceDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);

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

    /** تجميع الأرصدة حسب الصنف واحتساب التقييم المزدوج */
    const rows = useMemo((): DualValuationRow[] => {
        const itemMap = new Map<number, ItemDto>();
        items.forEach((i) => { if (i.id) itemMap.set(i.id, i); });

        /** تجميع الرصيد والتكلفة حسب itemId */
        const byItem = new Map<number, { qty: number; valueHist: number }>();
        balances.forEach((b) => {
            const itemId = b.itemId;
            const qty = Number(b.quantityOnHand) || 0;
            const avg = Number(b.averageCost) || 0;
            const v = byItem.get(itemId) || { qty: 0, valueHist: 0 };
            v.qty += qty;
            v.valueHist += qty * avg;
            byItem.set(itemId, v);
        });

        /** إضافة أصناف لها رصيد من items (currentStock) لكن لا توجد في stocks */
        items.forEach((i) => {
            if (!i.id) return;
            if (byItem.has(i.id)) return;
            const qty = Number((i as any).currentStock) || 0;
            if (qty <= 0) return;
            const cost = Number(i.standardCost) || Number(i.lastPurchasePrice) || 0;
            byItem.set(i.id, { qty, valueHist: qty * cost });
        });

        const result: DualValuationRow[] = [];
        byItem.forEach(({ qty, valueHist }, itemId) => {
            const item = itemMap.get(itemId);
            const historicalPerUnit = qty > 0 ? valueHist / qty : 0;
            const replacementPerUnit = Number(item?.replacementPrice) || 0;
            const valueReplacement = qty * replacementPerUnit;
            const diffPct = historicalPerUnit > 0
                ? Math.abs(replacementPerUnit - historicalPerUnit) / historicalPerUnit
                : (replacementPerUnit > 0 ? 1 : 0);
            const hasAlert = diffPct >= DIFF_ALERT_THRESHOLD_PCT && (historicalPerUnit > 0 || replacementPerUnit > 0);

            result.push({
                itemId,
                itemCode: item?.itemCode ?? '—',
                itemNameAr: item?.itemNameAr ?? '—',
                unitName: item?.unitName,
                qty,
                historicalCostPerUnit: historicalPerUnit,
                replacementPricePerUnit: replacementPerUnit,
                valueHistorical: valueHist,
                valueReplacement,
                diffPct,
                hasAlert
            });
        });

        /** ترتيب: التنبيهات أولاً، ثم تنازلياً حسب الفرق */
        result.sort((a, b) => {
            if (a.hasAlert !== b.hasAlert) return a.hasAlert ? -1 : 1;
            return b.diffPct - a.diffPct;
        });
        return result;
    }, [balances, items]);

    const filteredRows = useMemo(() => {
        if (filterAlertsOnly) return rows.filter((r) => r.hasAlert);
        return rows;
    }, [rows, filterAlertsOnly]);

    const totals = useMemo(() => {
        let sumHist = 0, sumRepl = 0, alertCount = 0;
        rows.forEach((r) => {
            sumHist += r.valueHistorical;
            sumRepl += r.valueReplacement;
            if (r.hasAlert) alertCount++;
        });
        return { valueHistorical: sumHist, valueReplacement: sumRepl, alertCount };
    }, [rows]);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/inventory/sections')}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 rounded-2xl">
                            <Calculator className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">تقييم المخزون المزدوج</h1>
                            <p className="text-white/80">
                                التكلفة التاريخية (محاسبة) + سعر الإحلال (قرارات). تنبيه عند فرق كبير
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer bg-white/10 rounded-lg px-4 py-2">
                            <input
                                type="checkbox"
                                checked={filterAlertsOnly}
                                onChange={(e) => setFilterAlertsOnly(e.target.checked)}
                                className="rounded"
                            />
                            <span>تنبيهات فقط</span>
                        </label>
                        <button onClick={fetchData} disabled={loading} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                            <FileDown className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* بطاقات ملخص */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-slate-600" />
                        <span className="text-sm text-slate-500">القيمة بالتكلفة التاريخية (محاسبة)</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                        {totals.valueHistorical.toLocaleString('ar-EG', { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm text-slate-500">القيمة بسعر الإحلال (قرارات)</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-700">
                        {totals.valueReplacement.toLocaleString('ar-EG', { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Scale className="w-5 h-5 text-slate-600" />
                        <span className="text-sm text-slate-500">أصناف في التقرير</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{filteredRows.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/50">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="text-sm text-amber-700">تنبيه: فرق كبير (≥{DIFF_ALERT_THRESHOLD_PCT * 100}%)</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-700">{totals.alertCount}</p>
                </div>
            </div>

            {/* جدول التقييم المزدوج */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-slate-900">التكلفة التاريخية وسعر الإحلال حسب الصنف</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 w-10" />
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">كود الصنف</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الصنف</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الرصيد</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">التكلفة التاريخية (وحدة)</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">سعر الإحلال (وحدة)</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">القيمة (محاسبة)</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">القيمة (إحلال)</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">فرق %</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="border-b animate-pulse">
                                        <td colSpan={10} className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-16 text-center text-slate-500">
                                        {filterAlertsOnly ? 'لا توجد أصناف فيها تنبيه (فرق ≥15%)' : 'لا توجد أصناف ذات رصيد أو لم يتم تحميل الأرصدة والأصناف'}
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((r) => (
                                    <tr
                                        key={r.itemId}
                                        className={`border-b hover:bg-slate-50 ${r.hasAlert ? 'bg-amber-50/60' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            {r.hasAlert && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                                        </td>
                                        <td className="px-6 py-3 font-mono text-slate-700">{r.itemCode}</td>
                                        <td className="px-6 py-3">{r.itemNameAr}</td>
                                        <td className="px-6 py-3 font-medium">{(r.qty || 0).toLocaleString()}</td>
                                        <td className="px-6 py-3">{(r.historicalCostPerUnit || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-3">{(r.replacementPricePerUnit || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-3">{(r.valueHistorical || 0).toLocaleString('ar-EG', { maximumFractionDigits: 0 })}</td>
                                        <td className="px-6 py-3">{(r.valueReplacement || 0).toLocaleString('ar-EG', { maximumFractionDigits: 0 })}</td>
                                        <td className="px-6 py-3">
                                            <span className={r.hasAlert ? 'font-bold text-amber-700' : 'text-slate-600'}>
                                                {(r.diffPct * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <button
                                                onClick={() => navigate(`/dashboard/inventory/items/${r.itemId}`)}
                                                className="text-brand-primary font-medium hover:underline"
                                            >
                                                فتح
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DualInventoryValuationPage;
