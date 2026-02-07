import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardCheck, Zap, ChevronRight, Plus, Calendar, Save, CheckCircle } from 'lucide-react';
import warehouseService from '../../services/warehouseService';
import type { WarehouseDto } from '../../services/warehouseService';
import stockAdjustmentService, { type StockAdjustmentDto } from '../../services/stockAdjustmentService';
import { toast } from 'react-hot-toast';

type CountType = 'periodic' | 'surprise';

const InventoryCountPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type: CountType = (searchParams.get('type') as CountType) || 'periodic';

    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
    const [loadingWarehouses, setLoadingWarehouses] = useState(true);
    const [countDate, setCountDate] = useState(new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState('');
    const [adjustment, setAdjustment] = useState<StockAdjustmentDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoadingWarehouses(true);
                const res = await warehouseService.getAll();
                setWarehouses((res as any)?.data ?? []);
            } catch {
                setWarehouses([]);
            } finally {
                setLoadingWarehouses(false);
            }
        })();
    }, []);

    const isPeriodic = type === 'periodic';
    const title = isPeriodic ? 'جرد دوري' : 'جرد مفاجئ';
    const description = isPeriodic
        ? 'جرد المخزون الدوري والمخطط وفق الجدول'
        : 'جرد مفاجئ للتحقق من الرصيد الفعلي ودقة السجلات';

    const handleStartCount = async () => {
        if (!selectedWarehouseId) {
            toast.error('اختر المستودع');
            return;
        }
        setLoading(true);
        try {
            const countType = isPeriodic ? 'periodic' : 'surprise';
            const countDateIso = countDate ? `${countDate}T12:00:00` : undefined;
            const adj = await stockAdjustmentService.createCount(selectedWarehouseId, countType, countDateIso);
            if (adj) {
                setAdjustment(adj);
                toast.success('تم إنشاء الجرد بنجاح');
            } else {
                toast.error('فشل إنشاء الجرد');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل إنشاء الجرد');
        } finally {
            setLoading(false);
        }
    };

    const updateItemActualQty = (idx: number, actualQty: number) => {
        if (!adjustment?.items) return;
        const items = [...adjustment.items];
        items[idx] = { ...items[idx], actualQty };
        setAdjustment({ ...adjustment, items });
    };

    const handleSave = async () => {
        if (!adjustment?.id || !adjustment.items) return;
        setSaving(true);
        try {
            const updated = await stockAdjustmentService.updateCountItems(adjustment.id, adjustment.items);
            if (updated) {
                setAdjustment(updated);
                toast.success('تم حفظ الكميات');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleApprove = async () => {
        if (!adjustment?.id) return;
        setApproving(true);
        try {
            const updated = await stockAdjustmentService.approve(adjustment.id);
            if (updated) {
                toast.success('تم اعتماد الجرد وتحديث المخزون');
                navigate('/dashboard/inventory/reports/variance');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل الاعتماد');
        } finally {
            setApproving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className={`relative overflow-hidden rounded-3xl p-8 text-white
                bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90`}>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/dashboard/inventory/sections')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            {isPeriodic ? <ClipboardCheck className="w-10 h-10" /> : <Zap className="w-10 h-10" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{title}</h1>
                            <p className="text-white/80">{description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {!adjustment ? (
                <>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">المستودع</label>
                                    <select
                                        value={selectedWarehouseId ?? ''}
                                        onChange={(e) => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : null)}
                                        disabled={loadingWarehouses}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none disabled:opacity-60"
                                    >
                                        <option value="">{loadingWarehouses ? 'جاري التحميل...' : 'اختر المستودع...'}</option>
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>{w.warehouseNameAr} ({w.warehouseCode})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">تاريخ الجرد</label>
                                    <div className="relative">
                                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="date"
                                            value={countDate}
                                            onChange={(e) => setCountDate(e.target.value)}
                                            className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">ملاحظات</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="ملاحظات الجرد..."
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <button
                                    onClick={handleStartCount}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-60"
                                >
                                    <Plus className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                    {loading ? 'جاري الإنشاء...' : 'بدء الجرد'}
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/inventory/sections')}
                                    className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-800">
                            الجرد: {adjustment.adjustmentNumber} — {adjustment.warehouseNameAr}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving || adjustment.status !== 'Draft'}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                حفظ
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={approving || adjustment.status !== 'Draft'}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4" />
                                اعتماد وتحديث المخزون
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b">
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الصنف</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الوحدة</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الرصيد النظري</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الرصيد الفعلي</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">الفرق</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(adjustment.items || []).map((item, idx) => {
                                    const sys = Number(item.systemQty) || 0;
                                    const act = Number(item.actualQty) ?? sys;
                                    const diff = act - sys;
                                    return (
                                        <tr key={item.itemId + '-' + idx} className="border-b hover:bg-slate-50">
                                            <td className="px-6 py-3">{item.itemNameAr || item.itemCode}</td>
                                            <td className="px-6 py-3">{item.unitNameAr}</td>
                                            <td className="px-6 py-3 font-mono">{sys}</td>
                                            <td className="px-6 py-3">
                                                {adjustment.status === 'Draft' ? (
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={act}
                                                        onChange={(e) => updateItemActualQty(idx, parseFloat(e.target.value) || 0)}
                                                        className="w-24 px-2 py-1 rounded border text-left"
                                                    />
                                                ) : (
                                                    <span className="font-mono">{act}</span>
                                                )}
                                            </td>
                                            <td className={`px-6 py-3 font-mono ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : ''}`}>
                                                {diff > 0 ? '+' : ''}{diff}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {(!adjustment.items || adjustment.items.length === 0) && (
                        <p className="p-8 text-center text-slate-500">لا توجد أصناف في المخزن أو لم يتم تحميلها.</p>
                    )}
                </div>
            )}

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-2">كيفية العمل</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                    <li>اختر المستودع وتاريخ الجرد، ثم اضغط «بدء الجرد».</li>
                    <li>سيتم إنشاء قائمة بأصناف وكميات النظام؛ يُدخل الفريق الكميات الفعلية بالمخزن.</li>
                    <li>يُحسب الفرق (فعلي - نظام) ويُراجع قبل الإقفال.</li>
                    <li>جرد مفاجئ: نفس الخطوات دون إعلام مسبق للمخزن.</li>
                </ul>
            </div>
        </div>
    );
};

export default InventoryCountPage;
