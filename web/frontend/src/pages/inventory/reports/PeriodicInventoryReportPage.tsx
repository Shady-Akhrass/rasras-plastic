import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown, ChevronRight, Download, RefreshCw, Package, Scale } from 'lucide-react';
import stockBalanceService, { type PeriodicReportRow } from '../../../services/stockBalanceService';
import warehouseService from '../../../services/warehouseService';
import type { WarehouseDto } from '../../../services/warehouseService';
import { toast } from 'react-hot-toast';
import { useSystemSettings } from '../../../hooks/useSystemSettings';


const PeriodicInventoryReportPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const navigate = useNavigate();

    const [reportRows, setReportRows] = useState<PeriodicReportRow[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [warehouseId, setWarehouseId] = useState<number | undefined>(undefined);

    useEffect(() => {
        (async () => {
            try {
                const whRes = await warehouseService.getAll();
                setWarehouses((whRes as any)?.data ?? []);
            } catch {
                setWarehouses([]);
            }
        })();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await stockBalanceService.getPeriodicReport(month, year, warehouseId);
            setReportRows(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل التقرير');
            setReportRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [month, year, warehouseId]);

    const belowMin = useMemo(() => {
        return reportRows.filter((r) => {
            const min = Number(r.minStockLevel) || 0;
            const q = Number(r.closingQty) || 0;
            return min > 0 && q < min;
        });
    }, [reportRows]);

    const totals = useMemo(() => {
        return reportRows.reduce(
            (acc, r) => ({
                opening: acc.opening + (Number(r.openingValue) || 0),
                additions: acc.additions + (Number(r.additionsValue) || 0),
                issues: acc.issues + (Number(r.issuesValue) || 0),
                closing: acc.closing + (Number(r.closingValue) || 0),
            }),
            { opening: 0, additions: 0, issues: 0, closing: 0 }
        );
    }, [reportRows]);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
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
                        <select
                            value={warehouseId ?? ''}
                            onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : undefined)}
                            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                        >
                            <option value="">جميع المستودعات</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2">
                            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <span className="text-white/80">/</span>
                            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                                {[year, year - 1, year - 2].map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button onClick={fetchData} disabled={loading} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
                        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl"><Download className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2"><Scale className="w-5 h-5 text-blue-600" /><span className="text-sm text-slate-500">رصيد أول المدة</span></div>
                    <p className="text-2xl font-bold text-slate-800">{convertAmount(totals.opening, 'EGP').toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-bold">{getCurrencyLabel(defaultCurrency)}</span></p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-2">الإضافات</div>
                    <p className="text-2xl font-bold text-emerald-600">{convertAmount(totals.additions, 'EGP').toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-bold">{getCurrencyLabel(defaultCurrency)}</span></p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-2">المصروفات</div>
                    <p className="text-2xl font-bold text-rose-600">{convertAmount(totals.issues, 'EGP').toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-bold">{getCurrencyLabel(defaultCurrency)}</span></p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-2">رصيد آخر المدة</div>
                    <p className="text-2xl font-bold text-slate-800">{convertAmount(totals.closing, 'EGP').toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-bold">{getCurrencyLabel(defaultCurrency)}</span></p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2"><Package className="w-5 h-5 text-amber-600" /><span className="text-sm text-slate-500">تحت الحد الأدنى</span></div>
                    <p className="text-2xl font-bold text-amber-600">{belowMin.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-slate-900">تفاصيل الحركة: رصيد أول — إضافات — صرف — رصيد آخر</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">Grade</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الصنف</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">المستودع</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">رصيد أول</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">إضافات</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">صرف</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">رصيد آخر</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">القيمة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b animate-pulse"><td colSpan={8} className="px-6 py-4"><div className="h-4 bg-slate-200 rounded" /></td></tr>
                            )) : reportRows.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-16 text-center text-slate-500">لا توجد بيانات للتقرير</td></tr>
                            ) : (
                                reportRows.map((r, idx) => (
                                    <tr key={r.itemId + '-' + r.warehouseId + '-' + idx} className="border-b hover:bg-slate-50">
                                        <td className="px-6 py-3 font-mono text-slate-700">{r.grade || r.itemCode || '—'}</td>
                                        <td className="px-6 py-3">{r.itemNameAr || '—'}</td>
                                        <td className="px-6 py-3">{r.warehouseNameAr || '—'}</td>
                                        <td className="px-6 py-3 font-mono">{Number(r.openingQty).toLocaleString('ar-EG')}</td>
                                        <td className="px-6 py-3 font-mono text-emerald-600">+{Number(r.additionsQty).toLocaleString('ar-EG')}</td>
                                        <td className="px-6 py-3 font-mono text-rose-600">-{Number(r.issuesQty).toLocaleString('ar-EG')}</td>
                                        <td className="px-6 py-3 font-mono">{Number(r.closingQty).toLocaleString('ar-EG')}</td>
                                        <td className="px-6 py-3">{convertAmount(Number(r.closingValue) || 0, 'EGP').toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>

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
                            <thead><tr className="bg-slate-50 border-b"><th className="px-6 py-3 text-right text-xs font-semibold">Grade</th><th className="px-6 py-3 text-right text-xs font-semibold">الصنف</th><th className="px-6 py-3 text-right text-xs font-semibold">الحد الأدنى</th><th className="px-6 py-3 text-right text-xs font-semibold">الرصيد</th><th className="px-6 py-3 text-right text-xs font-semibold">الإجراء</th></tr></thead>
                            <tbody>
                                {belowMin.map((r) => (
                                    <tr key={r.itemId + '-' + r.warehouseId} className="border-b">
                                        <td className="px-6 py-3 font-mono">{r.grade || r.itemCode}</td>
                                        <td className="px-6 py-3">{r.itemNameAr}</td>
                                        <td className="px-6 py-3">{r.minStockLevel ?? '—'}</td>
                                        <td className="px-6 py-3">{Number(r.closingQty).toLocaleString('ar-EG')}</td>
                                        <td className="px-6 py-3"><button onClick={() => navigate(`/dashboard/inventory/items/${r.itemId}`)} className="text-brand-primary font-medium">فتح</button></td>
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
