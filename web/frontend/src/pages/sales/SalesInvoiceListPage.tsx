import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Receipt, RefreshCw, Eye, FileText } from 'lucide-react';
import { salesInvoiceService, type SalesInvoiceDto } from '../../services/salesInvoiceService';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-hot-toast';

const SalesInvoiceListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<SalesInvoiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { setCurrentPage(1); }, [search]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await salesInvoiceService.getAll();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل فواتير المبيعات');
            setList([]);
        } finally { setLoading(false); }
    };

    const filtered = useMemo(() => {
        const f = list.filter((inv) =>
            !search ||
            (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (inv.customerNameAr || '').toLowerCase().includes(search.toLowerCase())
        );
        return [...f].sort((a, b) => {
            const dateA = a.invoiceDate ? new Date(a.invoiceDate).getTime() : (a.id ?? 0);
            const dateB = b.invoiceDate ? new Date(b.invoiceDate).getTime() : (b.id ?? 0);
            return dateB - dateA;
        });
    }, [list, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-violet-700 rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 rounded-2xl"><Receipt className="w-10 h-10" /></div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">فواتير المبيعات</h1>
                            <p className="text-white/80">فاتورة من إذن صرف أو أمر بيع، ضرائب، مستحق ومدفوع</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchList} disabled={loading} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/sales/invoices/new')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 rounded-xl font-bold">
                            <Plus className="w-5 h-5" />فاتورة جديدة
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث برقم الفاتورة أو العميل..." className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary outline-none" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">رقم الفاتورة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">التاريخ</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">العميل</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الإجمالي</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">المدفوع</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الرصيد</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-14 bg-slate-200 rounded" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد فواتير مبيعات</p>
                                        <button onClick={() => navigate('/dashboard/sales/invoices/new')} className="mt-4 text-brand-primary font-medium">إنشاء فاتورة</button>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((inv) => (
                                    <tr key={inv.id} className="border-b border-slate-100 hover:bg-purple-50/50">
                                        <td className="px-6 py-4 font-mono font-bold text-purple-700">{inv.invoiceNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('ar-EG') : '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{inv.customerNameAr || '—'}</td>
                                        <td className="px-6 py-4">{(inv.totalAmount ?? 0).toLocaleString('ar-EG')} {inv.currency || ''}</td>
                                        <td className="px-6 py-4 text-emerald-600">{(inv.paidAmount ?? 0).toLocaleString('ar-EG')}</td>
                                        <td className="px-6 py-4">{(inv.remainingAmount ?? 0).toLocaleString('ar-EG')}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => navigate(`/dashboard/sales/invoices/${inv.id}`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg"><Eye className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filtered.length > 0 && (
                    <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
                )}
            </div>
        </div>
    );
};

export default SalesInvoiceListPage;
