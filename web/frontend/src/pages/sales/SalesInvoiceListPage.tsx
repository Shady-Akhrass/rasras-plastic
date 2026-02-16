import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Receipt, RefreshCw, Eye, Pencil, Trash2, Clock, CheckCircle2, FileText } from 'lucide-react';
import { salesInvoiceService, type SalesInvoiceDto } from '../../services/salesInvoiceService';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatNumber, formatDate } from '../../utils/format';
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
        'Paid': {
            label: 'مدفوع',
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            border: 'border-purple-200',
            icon: CheckCircle2
        },
        'Partial': {
            label: 'مدفوع جزئياً',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: Clock
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

const SalesInvoiceListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<SalesInvoiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<SalesInvoiceDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteClick = (invoice: SalesInvoiceDto) => {
        setInvoiceToDelete(invoice);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!invoiceToDelete?.id) return;
        setIsDeleting(true);
        try {
            await salesInvoiceService.delete(invoiceToDelete.id);
            toast.success('تم حذف الفاتورة');
            await fetchList();
            setIsDeleteModalOpen(false);
            setInvoiceToDelete(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'فشل الحذف');
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = useMemo(() => {
        const f = list.filter((inv) =>
            !search ||
            (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (inv.customerNameAr || '').toLowerCase().includes(search.toLowerCase())
        );
        // الأحدث في الأعلى
        return [...f].sort((a, b) => {
            const dateA = a.invoiceDate ? new Date(a.invoiceDate).getTime() : 0;
            const dateB = b.invoiceDate ? new Date(b.invoiceDate).getTime() : 0;
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
                            <Receipt className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">فواتير المبيعات</h1>
                            <p className="text-white/80 text-lg">إصدار ومتابعة فواتير العملاء</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchList} disabled={loading} className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/sales/invoices/new')}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" />
                            <span>فاتورة جديدة</span>
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
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-purple-700">{inv.invoiceNumber || '—'}</div>
                                            <div className="mt-1"><StatusBadge status={inv.status || 'Draft'} /></div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{inv.invoiceDate ? formatDate(inv.invoiceDate) : '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{inv.customerNameAr || '—'}</td>
                                        <td className="px-6 py-4 font-bold">{formatNumber(inv.totalAmount ?? 0)} {inv.currency || ''}</td>
                                        <td className="px-6 py-4 text-emerald-600">{formatNumber(inv.paidAmount ?? 0)}</td>
                                        <td className="px-6 py-4 font-bold text-amber-600">{formatNumber(inv.remainingAmount ?? 0)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => navigate(`/dashboard/sales/invoices/${inv.id}?mode=view`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg" title="عرض التفاصيل"><Eye className="w-5 h-5" /></button>
                                                {(!inv.status || inv.status === 'Draft') && (
                                                    <>
                                                        <button onClick={() => navigate(`/dashboard/sales/invoices/${inv.id}`)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="تعديل"><Pencil className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteClick(inv)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg" title="حذف"><Trash2 className="w-4 h-4" /></button>
                                                    </>
                                                )}
                                            </div>
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف فاتورة المبيعات"
                message={`هل أنت متأكد من حذف الفاتورة ${invoiceToDelete?.invoiceNumber || ''}؟`}
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setInvoiceToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default SalesInvoiceListPage;
