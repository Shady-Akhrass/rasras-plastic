import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, RefreshCw, Eye, CheckCircle } from 'lucide-react';
import { stockIssueNoteService, type StockIssueNoteDto } from '../../services/stockIssueNoteService';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/format';
import { toast } from 'react-hot-toast';

const StockIssueNoteListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<StockIssueNoteDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { setCurrentPage(1); }, [search]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await stockIssueNoteService.getAll();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل إذونات الصرف');
            setList([]);
        } finally { setLoading(false); }
    };

    const handleApprove = async (id: number) => {
        try {
            const updated = await stockIssueNoteService.approve(id);
            if (updated) {
                toast.success('تم اعتماد إذن الصرف وتحديث المخزون');
                fetchList();
            } else {
                toast.error('فشل الاعتماد');
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'فشل الاعتماد');
        }
    };

    const filtered = useMemo(() => {
        const f = list.filter((n) =>
            !search ||
            (n.issueNoteNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (n.soNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (n.customerNameAr || '').toLowerCase().includes(search.toLowerCase())
        );
        // الأحدث في الأعلى
        return [...f].sort((a, b) => {
            const dateA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
            const dateB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [list, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 rounded-2xl"><Package className="w-10 h-10" /></div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">إذونات الصرف</h1>
                            <p className="text-white/80">إذن صرف من المخزن بناءً على أمر البيع (SO)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchList} disabled={loading} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/sales/issue-notes/new')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-700 rounded-xl font-bold">
                            <Plus className="w-5 h-5" />إذن صرف جديد
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث برقم الإذن أو أمر البيع أو العميل..." className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary outline-none" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">رقم الإذن</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">التاريخ</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">أمر البيع</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">العميل</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">المخزن</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الحالة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-200 rounded" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد إذونات صرف</p>
                                        <button onClick={() => navigate('/dashboard/sales/issue-notes/new')} className="mt-4 text-brand-primary font-medium">إنشاء إذن صرف</button>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((n) => (
                                    <tr key={n.id} className="border-b border-slate-100 hover:bg-amber-50/50">
                                        <td className="px-6 py-4 font-mono font-bold text-amber-700">{n.issueNoteNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{n.issueDate ? formatDate(n.issueDate) : '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{n.soNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{n.customerNameAr || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{n.warehouseNameAr || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${n.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
                                                {n.status === 'Draft' ? 'مسودة' : n.status === 'Approved' ? 'معتمد' : n.status || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => navigate(`/dashboard/sales/issue-notes/${n.id}`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg" title="عرض"><Eye className="w-5 h-5" /></button>
                                            {n.status === 'Draft' && (
                                                <button onClick={() => handleApprove(n.id!)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="اعتماد"><CheckCircle className="w-5 h-5" /></button>
                                            )}
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

export default StockIssueNoteListPage;
