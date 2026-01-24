import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardCheck, Zap, ChevronRight, Plus, Calendar } from 'lucide-react';
import warehouseService from '../../services/warehouseService';
import type { WarehouseDto } from '../../services/warehouseService';

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

    return (
        <div className="space-y-6">
            <div className={`relative overflow-hidden rounded-3xl p-8 text-white
                ${isPeriodic ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700' : 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700'}`}>
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
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90"
                        >
                            <Plus className="w-5 h-5" />
                            بدء الجرد
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

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-2">كيفية العمل</h3>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                    <li>اختر المستودع وتاريخ الجرد، ثم اضغط «بدء الجرد».</li>
                    <li>سيتم إنشاء قائمة بأصناف وكميات النظام؛ يُدخل الفريق الكميات الفعلية بالمخزن.</li>
                    <li>يُحسب الفرق (فعلي - نظام) ويُراجع قبل الإقفال.</li>
                    <li>جرد مفاجئ: نفس الخطوات دون إعلام مسبق للمخزن.</li>
                </ul>
                <p className="text-xs text-slate-500 mt-4">ملاحظة: تفعيل الجرد الفعلي وتحقيق الفروقات يتطلب ربط واجهة الجرد بجدول حركات المخزون في النظام.</p>
            </div>
        </div>
    );
};

export default InventoryCountPage;
