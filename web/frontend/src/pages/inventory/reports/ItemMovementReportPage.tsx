import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronRight, Download, Search, Package } from 'lucide-react';
import { itemService } from '../../../services/itemService';

const ItemMovementReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<{ id?: number; itemCode: string; itemNameAr: string }[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMovements, setLoadingMovements] = useState(false);
    // محاكاة: لا يوجد جدول حركة في الـ backend حالياً
    const [movements] = useState<{ date: string; type: string; qty: number; balance: number; ref?: string }[]>([]);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await itemService.getAllItems();
            setItems(res.data || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedItemId(id);
        setLoadingMovements(true);
        // محاكاة: انتظار قصير ثم عرض فارغ (لا توجد حركات من الـ API)
        setTimeout(() => setLoadingMovements(false), 400);
    };

    const selectedItem = items.find(i => i.id === selectedItemId);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/dashboard/inventory/sections')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Activity className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">تقرير حركة الصنف التفصيلية</h1>
                            <p className="text-white/80">دخول، خروج، ورصيد صنف معين (يتطلب تفعيل سجل الحركات في النظام)</p>
                        </div>
                    </div>
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-bold text-slate-900">اختر صنفاً</h2>
                    </div>
                    <div className="p-4 max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="space-y-2">
                                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {items.map((i) => (
                                    <button
                                        key={i.id}
                                        onClick={() => i.id && handleSelectItem(i.id)}
                                        className={`w-full text-right p-3 rounded-xl flex items-center gap-3 transition-colors
                                            ${selectedItemId === i.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}
                                    >
                                        <Package className="w-4 h-4 text-slate-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-sm text-brand-primary truncate">{i.itemCode}</p>
                                            <p className="text-xs text-slate-500 truncate">{i.itemNameAr}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900">سجل الحركة</h2>
                        {selectedItem && (
                            <span className="text-sm text-slate-500">{selectedItem.itemCode} - {selectedItem.itemNameAr}</span>
                        )}
                    </div>
                    <div className="p-6">
                        {!selectedItemId ? (
                            <div className="text-center py-16 text-slate-500">
                                <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>اختر صنفاً لعرض حركته</p>
                            </div>
                        ) : loadingMovements ? (
                            <div className="space-y-3">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
                            </div>
                        ) : movements.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">
                                <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>لا توجد حركات مسجلة لهذا الصنف</p>
                                <p className="text-sm mt-2">سجّل العمليات (إدخال، إخراج، تحويل) لظهور الحركات هنا</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-2 text-right text-xs text-slate-500">التاريخ</th>
                                        <th className="py-2 text-right text-xs text-slate-500">النوع</th>
                                        <th className="py-2 text-right text-xs text-slate-500">الكمية</th>
                                        <th className="py-2 text-right text-xs text-slate-500">الرصيد</th>
                                        <th className="py-2 text-right text-xs text-slate-500">المرجع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map((m, i) => (
                                        <tr key={i} className="border-b border-slate-100">
                                            <td className="py-3 text-sm">{m.date}</td>
                                            <td className="py-3 text-sm">{m.type}</td>
                                            <td className="py-3 text-sm font-medium">{m.qty}</td>
                                            <td className="py-3 text-sm">{m.balance}</td>
                                            <td className="py-3 text-sm text-slate-400">{m.ref || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemMovementReportPage;
