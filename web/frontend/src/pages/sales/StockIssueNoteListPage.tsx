import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Package, RefreshCw, Eye, CheckCircle2, Clock, FileText, Truck } from 'lucide-react';
import { stockIssueNoteService, type StockIssueNoteDto } from '../../services/stockIssueNoteService';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/format';
import { toast } from 'react-hot-toast';

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, {
        label: string;
        bg: string;
        text: string;
        border: string;
        icon: React.ElementType;
    }> = {
        'Draft': {
            label: 'مسودة',
            bg: 'bg-slate-50',
            text: 'text-slate-700',
            border: 'border-slate-200',
            icon: FileText
        },
        'Pending': {
            label: 'قيد الاعتماد',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: Clock
        },
        'Approved': {
            label: 'معتمد',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: CheckCircle2
        },
        'Issued': {
            label: 'تم الصرف',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: Truck
        }
    };

    const c = config[status] || config['Draft'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
        </span>
    );
};

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
        <div className="space-y-6 pb-20" dir="rtl">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Package className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">إذونات الصرف</h1>
                            <p className="text-white/80 text-lg">إذن صرف من المخزن بناءً على أمر البيع</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchList} disabled={loading} className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/sales/issue-notes/new')}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" />
                            <span>إذن صرف جديد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث برقم الإذن أو أمر البيع أو العميل..." className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none transition-all" />
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
