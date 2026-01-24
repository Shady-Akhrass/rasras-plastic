import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingDown, ChevronRight, Download, RefreshCw, Package
} from 'lucide-react';
import { itemService, type ItemDto } from '../../../services/itemService';
import { toast } from 'react-hot-toast';

// محاكاة: نعتبر أصنافاً "راكدة" إذا كان الرصيد موجباً ولا يوجد حركة (الحركة تحتاج backend). نستخدم كبديل: أصناف لها رصيد وبدون استهلاك شهري أو استهلاك منخفض جداً.
const StagnantItemsReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [daysThreshold, setDaysThreshold] = useState(90);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await itemService.getAllItems();
            setItems(res.data || []);
        } catch (e) {
            toast.error('فشل تحميل الأصناف');
        } finally {
            setLoading(false);
        }
    };

    // محاكاة: أصناف برصيد إيجابي ومتوسط استهلاك شهري صفر أو منخفض جداً تعتبر راكدة (بدون جدول حركة فعلي نستخدم هذه الفكرة)
    const stagnant = useMemo(() => {
        return items
            .filter(i => {
                const stock = (i as any).currentStock ?? 0;
                const consumption = Number(i.avgMonthlyConsumption) || 0;
                return stock > 0 && consumption <= 0;
            })
            .slice(0, 50);
    }, [items]);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-8 text-white">
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
                            <p className="text-white/80">أصناف ذات حركة بطيئة أو بدون استهلاك شهري (محاكاة)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchItems} disabled={loading} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-6 bg-amber-500 rounded-full" />
                        <h2 className="font-bold text-slate-900">الأصناف الراكدة ({stagnant.length})</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">فترة عدم الحركة (يوم):</label>
                        <input
                            type="number"
                            value={daysThreshold}
                            onChange={(e) => setDaysThreshold(Number(e.target.value) || 90)}
                            className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">كود الصنف</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">اسم الصنف</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الرصيد</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">متوسط الاستهلاك الشهري</th>
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
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-200 rounded mx-auto" /></td>
                                    </tr>
                                ))
                            ) : stagnant.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                        <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد أصناف راكدة حسب المعايير المحددة (استهلاك شهري = 0)</p>
                                    </td>
                                </tr>
                            ) : (
                                stagnant.map((i) => (
                                    <tr key={i.id} className="border-b border-slate-100 hover:bg-amber-50/50">
                                        <td className="px-6 py-4 font-mono font-semibold text-brand-primary">{i.itemCode}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{i.itemNameAr}</td>
                                        <td className="px-6 py-4">{(i as any).currentStock?.toLocaleString() ?? '0'}</td>
                                        <td className="px-6 py-4 text-slate-600">{(Number(i.avgMonthlyConsumption) || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => navigate(`/dashboard/inventory/items/${i.id}`)}
                                                className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium hover:bg-brand-primary hover:text-white"
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

export default StagnantItemsReportPage;
