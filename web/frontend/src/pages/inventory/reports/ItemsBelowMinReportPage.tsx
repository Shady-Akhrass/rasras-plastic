import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Download, RefreshCw, Scale } from 'lucide-react';
import { itemService, type ItemDto } from '../../../services/itemService';
import { toast } from 'react-hot-toast';

const ItemsBelowMinReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ItemDto[]>([]);
    const [loading, setLoading] = useState(true);

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

    const belowMin = useMemo(() => {
        return items.filter(i => {
            const stock = (i as any).currentStock ?? 0;
            const min = Number(i.minStockLevel) || 0;
            return min > 0 && stock < min;
        });
    }, [items]);

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
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">تقرير الأصناف تحت الحد الأدنى</h1>
                            <p className="text-white/80">أصناف تحت حد إعادة الطلب أو الحد الأدنى</p>
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
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-6 bg-rose-500 rounded-full" />
                        <h2 className="font-bold text-slate-900">الأصناف ({belowMin.length})</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">العلامة التجارية / Grade</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">اسم الصنف</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الوحدة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الرصيد الحالي</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الحد الأدنى</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">حد إعادة الطلب</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الفرق</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-14 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-200 rounded mx-auto" /></td>
                                    </tr>
                                ))
                            ) : belowMin.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-slate-500">
                                        <Scale className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد أصناف تحت الحد الأدنى حالياً</p>
                                    </td>
                                </tr>
                            ) : (
                                belowMin.map((i) => {
                                    const stock = (i as any).currentStock ?? 0;
                                    const min = Number(i.minStockLevel) || 0;
                                    const reorder = Number(i.reorderLevel) || 0;
                                    const diff = min - stock;
                                    return (
                                        <tr key={i.id} className="border-b border-slate-100 hover:bg-rose-50/50">
                                            <td className="px-6 py-4 font-mono font-semibold text-brand-primary">{i.grade || i.itemCode}</td>
                                            <td className="px-6 py-4 font-medium text-slate-800">{i.itemNameAr}</td>
                                            <td className="px-6 py-4 text-slate-600">{i.unitName || '-'}</td>
                                            <td className="px-6 py-4 font-bold text-rose-600">{stock.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-slate-700">{min.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-slate-600">{reorder.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-sm font-bold">
                                                    -{diff.toLocaleString()}
                                                </span>
                                            </td>
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
            </div>
        </div>
    );
};

export default ItemsBelowMinReportPage;
