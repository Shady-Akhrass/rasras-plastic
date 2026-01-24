import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    Truck,
    CheckCircle2,
    Clock,
    RefreshCw,
    DollarSign,
    Tag,
    ShoppingCart
} from 'lucide-react';
import purchaseService, { type SupplierQuotation } from '../../services/purchaseService';

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
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { icon: React.ElementType; className: string; label: string }> = {
        'Selected': {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'مقبول'
        },
        'Rejected': {
            icon: XCircle,
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            label: 'مرفوض'
        },
        'Received': {
            icon: Clock,
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'مستلم'
        }
    };

    const { icon: Icon, className, label } = config[status] || config['Received'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

// Help for XCircle (was missing)
const XCircle = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
)

// Table Row Component
const QuotationTableRow: React.FC<{
    quotation: SupplierQuotation;
    index: number;
    onView: (id: number) => void;
    navigate: ReturnType<typeof useNavigate>;
}> = ({ quotation, index, onView, navigate }) => (
    <tr
        className="hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0 cursor-pointer"
        onClick={() => onView(quotation.id!)}
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tag className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors block">
                        #{quotation.quotationNumber || 'بدون رقم'}
                    </span>
                    {quotation.rfqNumber && (
                        <span className="text-xs text-slate-400">طلب سعر #{quotation.rfqNumber}</span>
                    )}
                </div>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{new Date(quotation.quotationDate).toLocaleDateString('ar-EG')}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600 font-bold">
            <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>{quotation.supplierNameAr}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-800 font-bold text-left">
            <div className="flex items-center justify-end gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>{quotation.totalAmount?.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} {quotation.currency}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            {quotation.deliveryDays ? `${quotation.deliveryDays} يوم` : '-'}
        </td>
        <td className="px-6 py-4">
            <StatusBadge status={quotation.status || 'Received'} />
        </td>
        <td className="px-6 py-4">
            <div className="flex justify-end gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onView(quotation.id!); }}
                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                    title="عرض التفاصيل"
                >
                    <FileText className="w-4 h-4" />
                </button>
                {quotation.status === 'Selected' && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
<<<<<<< HEAD
                                navigate(`/dashboard/procurement/po/new?quotationId=${quotation.id}`);
=======
                                window.location.href = `/dashboard/procurement/po/new?quotationId=${quotation.id}`;
>>>>>>> c47efc5 (final)
                            }}
                            className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                            title="إصدار أمر شراء"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
<<<<<<< HEAD
                                navigate(`/dashboard/procurement/invoices/new?quotationId=${quotation.id}`);
=======
                                window.location.href = `/dashboard/procurement/invoices/new?quotationId=${quotation.id}`;
>>>>>>> c47efc5 (final)
                            }}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            title="إصدار فاتورة"
                        >
                            <DollarSign className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </td>
    </tr>
);

const SupplierQuotationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const data = await purchaseService.getAllQuotations();
            setQuotations(data);
        } catch (error) {
            console.error('Failed to fetch quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotations = useMemo(() => {
        return quotations.filter(q => {
            const matchesSearch =
                q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [quotations, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        const total = quotations.length;
        const avgAmount = total > 0
            ? quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0) / total
            : 0;
        return {
            total,
            received: quotations.filter(q => q.status === 'Received').length,
            selected: quotations.filter(q => q.status === 'Selected').length,
            avgAmount: avgAmount.toLocaleString('ar-EG', { maximumFractionDigits: 0 })
        };
    }, [quotations]);

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 
                rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Tag className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">عروض أسعار الموردين</h1>
                            <p className="text-white/70 text-lg">متابعة عروض الأسعار المستلمة من الموردين</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/quotation/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-indigo-600 rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>تسجيل عرض سعر جديد</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} value={stats.total} label="إجمالي العروض" color="primary" />
                <StatCard icon={Clock} value={stats.received} label="مستلم" color="blue" />
                <StatCard icon={CheckCircle2} value={stats.selected} label="مقبول" color="success" />
                <StatCard icon={DollarSign} value={`${stats.avgAmount} ج.م`} label="متوسط القيمة" color="purple" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors 
                        ${isSearchFocused ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder="بحث برقم العرض، اسم المورد، أو رقم طلب السعر..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50
                            ${isSearchFocused ? 'border-indigo-600 bg-white shadow-lg' : 'border-transparent'}`}
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent">
                    <Filter className="text-slate-400 w-5 h-5" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                    >
                        <option value="All">جميع الحالات</option>
                        <option value="Received">مستلم</option>
                        <option value="Selected">مقبول</option>
                        <option value="Rejected">مرفوض</option>
                    </select>
                </div>
                <button onClick={fetchQuotations} className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم عرض السعر</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">التاريخ</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">المورد</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجمالي</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">مدة التوريد</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10">جاري التحميل...</td></tr>
                            ) : filteredQuotations.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-slate-500">لا توجد نتائج</td></tr>
                            ) : (
                                filteredQuotations.map((q, index) => (
                                    <QuotationTableRow
                                        key={q.id}
                                        quotation={q}
                                        index={index}
                                        onView={(id) => navigate(`/dashboard/procurement/quotation/${id}`)}
                                        navigate={navigate}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupplierQuotationsPage;
