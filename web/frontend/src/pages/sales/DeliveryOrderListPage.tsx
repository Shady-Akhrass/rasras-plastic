import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Truck, RefreshCw, Eye, FileText } from 'lucide-react';
import { deliveryOrderService, type DeliveryOrderDto } from '../../services/deliveryOrderService';
import { toast } from 'react-hot-toast';

const DeliveryOrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<DeliveryOrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchList(); }, []);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await deliveryOrderService.getAll();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل أوامر التوصيل');
            setList([]);
        } finally { setLoading(false); }
    };

    const filtered = list.filter((d) =>
        !search ||
        (d.deliveryOrderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.issueNoteNumber || d.saleOrderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.customerNameAr || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 rounded-2xl"><Truck className="w-10 h-10" /></div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">أوامر التوصيل</h1>
                            <p className="text-white/80">أمر توصيل مرتبط بإذن الصرف، السائق والمركبة والتاريخ</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchList} disabled={loading} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/sales/delivery-orders/new')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-700 rounded-xl font-bold">
                            <Plus className="w-5 h-5" />أمر توصيل جديد
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث برقم أمر التوصيل، أمر البيع، أو العميل..." className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary outline-none" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">رقم أمر التوصيل</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">التاريخ</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">إذن الصرف</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">العميل</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الحالة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-14 bg-slate-200 rounded" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد أوامر توصيل</p>
                                        <button onClick={() => navigate('/dashboard/sales/delivery-orders/new')} className="mt-4 text-brand-primary font-medium">إنشاء أمر توصيل</button>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((d) => (
                                    <tr key={d.id} className="border-b border-slate-100 hover:bg-amber-50/50">
                                        <td className="px-6 py-4 font-mono font-bold text-amber-700">{d.deliveryOrderNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{d.orderDate ? new Date(d.orderDate).toLocaleDateString('ar-EG') : (d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString('ar-EG') : '—')}</td>
                                        <td className="px-6 py-4 text-slate-700">{d.issueNoteNumber || d.saleOrderNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{d.customerNameAr || '—'}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">{d.status || '—'}</span></td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => navigate(`/dashboard/sales/delivery-orders/${d.id}`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg"><Eye className="w-5 h-5" /></button>
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

export default DeliveryOrderListPage;
