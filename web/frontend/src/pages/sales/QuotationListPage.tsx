import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Tag,
    RefreshCw,
    Eye,
    FileText,
    Calendar,
    Users,
    DollarSign,
    Filter,
    X,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { salesQuotationService, type SalesQuotationDto } from '../../services/salesQuotationService';
import Pagination from '../../components/common/Pagination';
import { formatNumber, formatDate } from '../../utils/format';
import { toast } from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: string | number;
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
            text: 'text-slate-600',
            border: 'border-slate-200',
            icon: FileText
        },
        'Sent': {
            label: 'تم الإرسال',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: Clock
        },
        'Accepted': {
            label: 'مقبول',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: CheckCircle2
        },
        'Rejected': {
            label: 'مرفوض',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-200',
            icon: AlertCircle
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

const QuotationListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<SalesQuotationDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => { fetchList(); }, []);

    useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await salesQuotationService.getAll();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل عروض الأسعار');
            setList([]);
        } finally { setLoading(false); }
    };

    const filtered = useMemo(() => {
        const f = list.filter((q) => {
            const matchesSearch = !search ||
                (q.quotationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                (q.customerNameAr || '').toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'All' || q.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        return [...f].sort((a, b) => {
            const dateA = a.quotationDate ? new Date(a.quotationDate).getTime() : 0;
            const dateB = a.quotationDate ? new Date(b.quotationDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [list, search, statusFilter]);

    const stats = useMemo(() => {
        const total = list.length;
        const totalAmount = list.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
        const accepted = list.filter(q => q.status === 'Accepted').length;
        const pending = list.filter(q => q.status === 'Sent' || !q.status).length;

        return {
            total,
            totalAmount: formatNumber(totalAmount),
            accepted,
            pending
        };
    }, [list]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Tag className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">عروض أسعار المبيعات</h1>
                            <p className="text-white/80 text-lg">إدارة عروض الأسعار المقدمة لعملاء الشركة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchList}
                            disabled={loading}
                            className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/sales/quotations/new')}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl 
                                font-bold shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            <span>عرض سعر جديد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} value={stats.total} label="إجمالي العروض" color="blue" />
                <StatCard icon={Clock} value={stats.pending} label="قيد الانتظار" color="warning" />
                <StatCard icon={CheckCircle2} value={stats.accepted} label="تم قبولها" color="success" />
                <StatCard icon={DollarSign} value={stats.totalAmount} label="إجمالي القيمة" color="purple" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث برقم العرض أو اسم العميل..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 
                                outline-none bg-slate-50
                                ${isSearchFocused
                                    ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-500/10'
                                    : 'border-transparent hover:border-slate-200'}`}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 
                                    rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent
                            hover:border-slate-200 transition-all duration-200">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                            >
                                <option value="All">جميع الحالات</option>
                                <option value="Draft">مسودة</option>
                                <option value="Sent">تم الإرسال</option>
                                <option value="Accepted">مقبول</option>
                                <option value="Rejected">مرفوض</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم عرض السعر</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">التاريخ</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">العميل</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">تاريخ الانتهاء</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجمالي</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-7 w-16 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-200 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                <FileText className="w-10 h-10 text-blue-300" />
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-semibold">لا توجد نتائج</p>
                                                <p className="text-slate-400 text-sm mt-1">جرب تغيير معايير البحث</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((q, index) => (
                                    <tr
                                        key={q.id}
                                        onClick={() => navigate(`/dashboard/sales/quotations/${q.id}`)}
                                        className="hover:bg-indigo-50/50 transition-all duration-200 group border-b border-slate-100 last:border-0 cursor-pointer"
                                        style={{
                                            animationDelay: `${index * 30}ms`,
                                            animation: 'fadeInUp 0.3s ease-out forwards'
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-50 
                                                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Tag className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                    {q.quotationNumber || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>{q.quotationDate ? formatDate(q.quotationDate) : '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-slate-400" />
                                                <span>{q.customerNameAr || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {q.validUntilDate ? formatDate(q.validUntilDate) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-bold text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                <span>{formatNumber(q.totalAmount ?? 0)} {q.currency || 'EGP'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <StatusBadge status={q.status || 'Draft'} />
                                                {q.approvalStatus && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${
                                                        q.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        q.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                        q.approvalStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                        'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}>
                                                        {q.approvalStatus === 'Approved' ? 'معتمد' :
                                                            q.approvalStatus === 'Rejected' ? 'مرفوض' :
                                                            q.approvalStatus === 'Pending' ? 'قيد الاعتماد' : q.approvalStatus}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                {q.status !== 'Draft' && q.status !== 'Rejected' && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('هل أنت متأكد من تحويل هذا العرض إلى طلب مبيعات؟')) {
                                                                try {
                                                                    await salesQuotationService.convertToSalesOrder(q.id!);
                                                                    toast.success('تم تحويل العرض إلى طلب مبيعات بنجاح');
                                                                    fetchList();
                                                                } catch {
                                                                    toast.error('فشل تحويل العرض');
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="تحويل لطلب مبيعات"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sales/quotations/${q.id}`); }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="عرض التفاصيل"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filtered.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filtered.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    />
                )}
            </div>
        </div>
    );
};

export default QuotationListPage;
