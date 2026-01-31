import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, FileText, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import materialIssueService, { type MaterialIssueDto } from '../../../services/materialIssueService';
import Pagination from '../../../components/common/Pagination';
import { toast } from 'react-hot-toast';

const MaterialIssueListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<MaterialIssueDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => { fetchList(); }, []);

    const fetchList = async () => {
        setLoading(true);
        try {
            const d = await materialIssueService.getAll();
            setList(Array.isArray(d) ? d : []);
        } catch {
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    const typeLabel: Record<string, string> = {
        SALE_ORDER: 'أمر بيع',
        PRODUCTION: 'أمر تشغيل',
        PROJECT: 'مشروع',
        INTERNAL: 'قسم داخلي'
    };

    const filtered = useMemo(() => {
        return [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [list]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 rounded-2xl"><Package className="w-10 h-10" /></div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">إذن صرف</h1>
                            <p className="text-white/80">صرف مواد لأمر بيع، تشغيل، مشروع أو قسم داخلي</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchList} disabled={loading} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/inventory/warehouse/issue/new')} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-700 rounded-xl font-bold hover:bg-white/90 transition-colors">
                            <Plus className="w-5 h-5" /> إذن صرف جديد
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">عند تفعيل واجهة إذن الصرف في الخلفية (<code className="bg-amber-100 px-1 rounded">/inventory/material-issues</code>) ستظهر السجلات هنا وتُحدَّث الأرصدة تلقائياً.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b"><th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">رقم الإذن</th><th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">النوع</th><th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">المرجع</th><th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">المستلم</th><th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الإجراء</th></tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(3)].map((_, i) => <tr key={i} className="border-b animate-pulse"><td colSpan={5} className="px-6 py-4"><div className="h-4 bg-slate-200 rounded" /></td></tr>)
                            ) : list.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p>لا توجد أذونات صرف. أو أن واجهة الـ API غير مفعّلة بعد.</p>
                                    <button onClick={() => navigate('/dashboard/inventory/warehouse/issue/new')} className="mt-4 text-amber-600 font-medium hover:underline">إنشاء إذن صرف</button>
                                </td></tr>
                            ) : (
                                list.map((m) => (
                                    <tr key={m.id} className="border-b hover:bg-amber-50/50">
                                        <td className="px-6 py-4 font-mono font-bold text-amber-700">{(m as any).issueNoteNumber || m.issueNumber || '—'}</td>
                                        <td className="px-6 py-4">{typeLabel[((m as any).salesOrderId ? 'SALE_ORDER' : m.issueType) as string] || m.issueType || '—'}</td>
                                        <td className="px-6 py-4">{(m as any).soNumber || m.referenceNo || '—'}</td>
                                        <td className="px-6 py-4">{(m as any).receivedByName || m.receiverName || '—'}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/dashboard/inventory/warehouse/issue/${m.id}`)}
                                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
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

export default MaterialIssueListPage;
