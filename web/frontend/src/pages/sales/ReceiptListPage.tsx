import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, Banknote, RefreshCw, Eye, DollarSign } from 'lucide-react';
import { receiptService, type ReceiptDto } from '../../services/receiptService';
import Pagination from '../../components/common/Pagination';
import { formatNumber, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

// --- Reusable Components ---

const StatCard: React.FC<{
    icon: React.ElementType;
    value: number | string;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple' | 'blue' | 'rose';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        rose: 'bg-rose-100 text-rose-600'
    };

    return (
        <div className="w-full p-5 rounded-2xl border transition-all duration-300 group text-right bg-white border-slate-100 hover:shadow-lg hover:border-brand-primary/20">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${colorClasses[color]} group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-bold text-slate-800">
                        {typeof value === 'number' ? formatNumber(value) : value}
                    </div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

const RECEIPT_TYPE_LABELS: Record<string, string> = { FROM_CUSTOMER: 'من عميل', FROM_EMPLOYEE: 'من موظف', GENERAL_INCOME: 'إيراد عام', OTHER: 'أخرى' };
const PAYMENT_METHOD_LABELS: Record<string, string> = { CASH: 'نقداً', CHEQUE: 'شيك', BANK_TRANSFER: 'تحويل بنكي', PROMISSORY_NOTE: 'كمبيالة' };

const ReceiptListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<ReceiptDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { setCurrentPage(1); }, [search]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await receiptService.getAll();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل إيصالات الدفع');
            setList([]);
        } finally { setLoading(false); }
    };

    const filtered = useMemo(() => {
        const f = list.filter((r) =>
            !search ||
            (r.receiptNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.depositorName || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.invoiceNumber || '').toLowerCase().includes(search.toLowerCase())
        );
        // الأحدث في الأعلى
        return [...f].sort((a, b) => {
            const dateA = a.voucherDate ? new Date(a.voucherDate).getTime() : 0;
            const dateB = b.voucherDate ? new Date(b.voucherDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [list, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const stats = useMemo(() => {
        const total = list.length;
        const totalAmount = list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        return { total, totalAmount };
    }, [list]);

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
                            <Banknote className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">إيصالات الدفع</h1>
                            <p className="text-white/80 text-lg">سند قبض: عميل، فاتورة، مبلغ، طريقة دفع</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchList} disabled={loading} className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/sales/receipts/new')}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" />
                            <span>إيصال جديد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <StatCard icon={FileText} value={stats.total} label="الإجمالي" color="primary" />
                <StatCard icon={DollarSign} value={stats.totalAmount} label="إجمالي المبالغ" color="success" />
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث برقم السند، المُودِع، أو الفاتورة..." className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none transition-all" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">رقم السند</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">التاريخ</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">نوع القبض</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">المُودِع</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الفاتورة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">المبلغ</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">طريقة الدفع</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-14 bg-slate-200 rounded" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد إيصالات دفع</p>
                                        <button onClick={() => navigate('/dashboard/sales/receipts/new')} className="mt-4 text-brand-primary font-medium">إنشاء إيصال</button>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((r) => (
                                    <tr key={r.id} className="border-b border-slate-100 hover:bg-rose-50/50">
                                        <td className="px-6 py-4 font-mono font-bold text-rose-700">{r.voucherNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{r.voucherDate ? formatDate(r.voucherDate) : '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{RECEIPT_TYPE_LABELS[r.receiptType || ''] || r.receiptType || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{r.depositorName || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{r.invoiceNumber || '—'}</td>
                                        <td className="px-6 py-4 font-semibold">{formatNumber(r.amount ?? 0)} {r.currency || ''}</td>
                                        <td className="px-6 py-4 text-slate-600">{PAYMENT_METHOD_LABELS[r.paymentMethod] || r.paymentMethod}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => navigate(`/dashboard/sales/receipts/${r.id}`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg"><Eye className="w-5 h-5" /></button>
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

export default ReceiptListPage;
