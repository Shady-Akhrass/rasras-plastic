import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Package, FileText,
    RefreshCw, Eye
} from 'lucide-react';
import { grnService, type GoodsReceiptNoteDto } from '../../../services/grnService';
import Pagination from '../../../components/common/Pagination';
import { toast } from 'react-hot-toast';

/**
 * تم دمج هذه الصفحة مع صفحة GRN الموحدة في قسم المشتريات
 * يتم إعادة التوجيه تلقائياً إلى /dashboard/procurement/grn
 */
const GRNListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<GoodsReceiptNoteDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => {
        fetchList();
    }, []);
    useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await grnService.getAllGRNs();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل أذونات الإضافة');
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const f = list.filter((g) => {
            const matchesSearch = !search ||
                (g.grnNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                (g.poNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                (g.supplierNameAr || '').toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        return [...f].sort((a, b) => {
            const dateA = a.grnDate ? new Date(a.grnDate).getTime() : (a.id ?? 0);
            const dateB = b.grnDate ? new Date(b.grnDate).getTime() : (b.id ?? 0);
            return dateB - dateA;
        });
    }, [list, search, statusFilter]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Package className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">إذن إضافة (GRN)</h1>
                            <p className="text-white/80">استلام المواد بعد موافقة الجودة وربطها بأمر الشراء</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchList}
                            disabled={loading}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/inventory/warehouse/grn/new')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold hover:bg-white/90 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            إذن إضافة جديد
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="بحث برقم الإذن، أمر الشراء، المورد..."
                                className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="Completed">مكتمل</option>
                            <option value="Draft">مسودة</option>
                            <option value="Pending">قيد الانتظار</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">رقم الإذن</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">التاريخ</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">أمر الشراء</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">المورد</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">المستودع</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الحالة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-16 bg-slate-200 rounded" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>{search || statusFilter !== 'all' ? 'لا توجد نتائج للبحث' : 'لا توجد أذونات إضافة'}</p>
                                        {!search && statusFilter === 'all' && (
                                            <button
                                                onClick={() => navigate('/dashboard/inventory/warehouse/grn/new')}
                                                className="mt-4 text-emerald-600 font-medium hover:underline"
                                            >
                                                إنشاء إذن إضافة
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((g) => (
                                    <tr
                                        key={g.id}
                                        className="border-b border-slate-100 hover:bg-emerald-50/50"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-emerald-700">{g.grnNumber || '—'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {g.grnDate ? new Date(g.grnDate).toLocaleDateString('ar-EG') : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">{g.poNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{g.supplierNameAr || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">المستودع #{g.warehouseId}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${g.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {g.status === 'Completed' ? 'مكتمل' : g.status || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/dashboard/inventory/warehouse/grn/${g.id}`)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
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

export default GRNListPage;
