import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, RefreshCw, Eye, Pencil, Trash2, Clock, CheckCircle2, Truck, Lock, XCircle } from 'lucide-react';
import { saleOrderService, type SaleOrderDto } from '../../services/saleOrderService';
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
        'Confirmed': {
            label: 'مؤكد',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: CheckCircle2
        },
        'Shipped': {
            label: 'تم الشحن',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: Truck
        },
        'Closed': {
            label: 'مغلق',
            bg: 'bg-slate-100',
            text: 'text-slate-700',
            border: 'border-slate-300',
            icon: Lock
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

const SaleOrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<SaleOrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<SaleOrderDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { setCurrentPage(1); }, [search]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await saleOrderService.getAll();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل أوامر البيع');
            setList([]);
        } finally { setLoading(false); }
    };

    const handleDeleteClick = (order: SaleOrderDto) => {
        // Only allow deletion for Draft, Pending, or Rejected statuses
        if (order.status !== 'Draft' && order.status !== 'Pending' && order.status !== 'Rejected') {
            toast.error('لا يمكن حذف هذا الأمر في حالته الحالية');
            return;
        }
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!orderToDelete?.id) return;
        setIsDeleting(true);
        try {
            await saleOrderService.delete(orderToDelete.id);
            toast.success('تم حذف أمر البيع');
            await fetchList();
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'فشل الحذف');
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = useMemo(() => {
        const f = list.filter((o) =>
            !search ||
            (o.soNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.customerNameAr || '').toLowerCase().includes(search.toLowerCase())
        );
        // الأحدث في الأعلى
        return [...f].sort((a, b) => {
            const dateA = a.soDate ? new Date(a.soDate).getTime() : 0;
            const dateB = b.soDate ? new Date(b.soDate).getTime() : 0;
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
                            <FileText className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">أوامر البيع</h1>
                            <p className="text-white/80 text-lg">إدارة أوامر البيع ومتابعة حالة الطلبات</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchList} disabled={loading} className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/sales/orders/new')}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" />
                            <span>أمر بيع جديد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث برقم الأمر أو العميل..." className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary outline-none" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">رقم الأمر / الحالة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">التاريخ</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">العميل</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">تاريخ التسليم</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الإجمالي</th>
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
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-14 bg-slate-200 rounded" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد أوامر بيع</p>
                                        <button onClick={() => navigate('/dashboard/sales/orders/new')} className="mt-4 text-brand-primary font-medium">إنشاء أمر بيع</button>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((o) => (
                                    <tr key={o.id} className="border-b border-slate-100 hover:bg-emerald-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-bold text-emerald-700">{o.soNumber || '—'}</div>
                                            <div className="mt-1 flex flex-col gap-1">
                                                <StatusBadge status={o.status || 'Draft'} />
                                                {o.approvalStatus && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${
                                                        o.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        o.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                        o.approvalStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                        'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}>
                                                        {o.approvalStatus === 'Approved' ? 'معتمد' :
                                                            o.approvalStatus === 'Rejected' ? 'مرفوض' :
                                                            o.approvalStatus === 'Pending' ? 'قيد الاعتماد' : o.approvalStatus}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{o.soDate ? formatDate(o.soDate) : '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{o.customerNameAr || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{o.expectedDeliveryDate ? formatDate(o.expectedDeliveryDate) : '—'}</td>
                                        <td className="px-6 py-4 font-bold">{formatNumber(o.totalAmount ?? 0)} {o.currency || ''}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => navigate(`/dashboard/sales/orders/${o.id}?mode=view`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg" title="عرض التفاصيل"><Eye className="w-5 h-5" /></button>
                                                {(o.status === 'Draft' || o.status === 'Rejected') && (
                                                    <>
                                                        <button onClick={() => navigate(`/dashboard/sales/orders/${o.id}`)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="تعديل"><Pencil className="w-4 h-4" /></button>
                                                        {(o.status === 'Draft' || o.status === 'Pending' || o.status === 'Rejected') && (
                                                            <button onClick={() => handleDeleteClick(o)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg" title="حذف"><Trash2 className="w-4 h-4" /></button>
                                                        )}
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
                title="حذف أمر البيع"
                message={`هل أنت متأكد من حذف أمر البيع ${orderToDelete?.soNumber || ''}؟`}
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setOrderToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default SaleOrderListPage;
