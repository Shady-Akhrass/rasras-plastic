import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronRight, ClipboardCheck, AlertCircle, RefreshCw } from 'lucide-react';
import stockAdjustmentService, { type StockAdjustmentDto } from '../../../services/stockAdjustmentService';
import { formatNumber } from '../../../utils/format';
import { toast } from 'react-hot-toast';
import { useSystemSettings } from '../../../hooks/useSystemSettings';


const VarianceReportPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const navigate = useNavigate();

    const [adjustments, setAdjustments] = useState<StockAdjustmentDto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await stockAdjustmentService.getVarianceReport();
            setAdjustments(data || []);
        } catch {
            setAdjustments([]);
            toast.error('فشل تحميل تقرير الفروقات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const varianceItems = adjustments.flatMap((a) =>
        (a.items || [])
            .filter((i) => (Number(i.adjustmentQty) || 0) !== 0)
            .map((i) => ({
                ...i,
                adjustmentNumber: a.adjustmentNumber,
                warehouseNameAr: a.warehouseNameAr,
                adjustmentDate: a.adjustmentDate,
                adjustmentType: a.adjustmentType,
            }))
    );

    const totalSurplus = varianceItems
        .filter((i) => (Number(i.adjustmentQty) || 0) > 0)
        .reduce((s, i) => s + (Number(i.adjustmentValue) || 0), 0);
    const totalShortage = varianceItems
        .filter((i) => (Number(i.adjustmentQty) || 0) < 0)
        .reduce((s, i) => s + Math.abs(Number(i.adjustmentValue) || 0), 0);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/dashboard/inventory/sections')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 rounded-2xl"><BarChart3 className="w-10 h-10" /></div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">تقرير الفروقات</h1>
                            <p className="text-white/80">فروقات الجرد: الرصيد النظري مقابل الفعلي</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchData} disabled={loading} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/inventory/count?type=periodic')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-medium">
                            جرد دوري
                        </button>
                        <button onClick={() => navigate('/dashboard/inventory/count?type=surprise')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-medium">
                            جرد مفاجئ
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-rose-800 mb-2">توضيح</p>
                    <p className="text-sm text-rose-700">
                        يُعبّر تقرير الفروقات عن الفرق بين الرصيد النظري (من السجلات) والرصيد الفعلي (من الجرد).
                        تعرض الجداول أدناه الأصناف التي لها فروقات (زائدة أو ناقصة) من عمليات الجرد المعتمدة.
                    </p>
                </div>
            </div>

            {varianceItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">عدد الفروقات</div>
                        <p className="text-2xl font-bold text-slate-800">{varianceItems.length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">فروقات زائدة (قيمة)</div>
                        <p className="text-2xl font-bold text-emerald-600">{formatNumber(convertAmount(totalSurplus, 'EGP'), { maximumFractionDigits: 0 })} {getCurrencyLabel(defaultCurrency)}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">فروقات ناقصة (قيمة)</div>
                        <p className="text-2xl font-bold text-rose-600">{formatNumber(convertAmount(totalShortage, 'EGP'), { maximumFractionDigits: 0 })} {getCurrencyLabel(defaultCurrency)}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">صافي الفروقات</div>
                        <p className="text-2xl font-bold text-slate-800">{formatNumber(convertAmount(totalSurplus - totalShortage, 'EGP'), { maximumFractionDigits: 0 })} {getCurrencyLabel(defaultCurrency)}</p>
                    </div>

                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-slate-900">تفاصيل الفروقات</h2>
                </div>
                {loading ? (
                    <div className="p-12 text-center text-slate-500">جاري التحميل...</div>
                ) : varianceItems.length === 0 ? (
                    <div className="p-12 text-center">
                        <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h2 className="font-bold text-slate-800 mb-2">لا توجد فروقات</h2>
                        <p className="text-slate-500 mb-6">نفّذ جرداً (دورياً أو مفاجئاً)، سجّل النتائج، ثم اعتمد الجرد. الفروقات ستظهر هنا.</p>
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={() => navigate('/dashboard/inventory/count?type=periodic')} className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90">
                                جرد دوري
                            </button>
                            <button onClick={() => navigate('/dashboard/inventory/count?type=surprise')} className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90">
                                جرد مفاجئ
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b">
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">رقم الجرد</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">المستودع</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الصنف</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">النظري</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الفعلي</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الفرق</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">القيمة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {varianceItems.map((i, idx) => {
                                    const q = Number(i.adjustmentQty) || 0;
                                    return (
                                        <tr key={idx} className="border-b hover:bg-slate-50">
                                            <td className="px-6 py-3 font-mono">{i.adjustmentNumber}</td>
                                            <td className="px-6 py-3">{i.warehouseNameAr}</td>
                                            <td className="px-6 py-3">{i.itemNameAr || i.itemCode}</td>
                                            <td className="px-6 py-3 font-mono">{Number(i.systemQty) || 0}</td>
                                            <td className="px-6 py-3 font-mono">{Number(i.actualQty) || 0}</td>
                                            <td className={`px-6 py-3 font-mono ${q > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {q > 0 ? '+' : ''}{q}
                                            </td>
                                            <td className="px-6 py-3">{formatNumber(convertAmount(Number(i.adjustmentValue) || 0, 'EGP'))} {getCurrencyLabel(defaultCurrency)}</td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VarianceReportPage;
