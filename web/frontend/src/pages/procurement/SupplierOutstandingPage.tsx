import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    TrendingDown,
    TrendingUp,
    DollarSign,
    ArrowLeft,
    Download,
    Eye,
    RefreshCw,
    Wallet,
    CreditCard,
    ShoppingCart,
    CheckCircle2,
    Package,
    Building2,
    FileText
} from 'lucide-react';
import { supplierService, type SupplierOutstandingDto } from '../../services/supplierService';
import { purchaseOrderService, type PurchaseOrderDto } from '../../services/purchaseOrderService';

const StatCard: React.FC<{
    icon: React.ElementType;
    value: string;
    label: string;
    color: 'emerald' | 'rose' | 'amber' | 'blue';
}> = ({ icon: Icon, value, label, color }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100'
    };

    return (
        <div className={`p-6 bg-white rounded-3xl border ${colors[color]} shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${colors[color]} border-none group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm font-medium text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

const SupplierOutstandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'balances' | 'orders'>('balances');
    const [summaries, setSummaries] = useState<SupplierOutstandingDto[]>([]);
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'All' | 'Debit' | 'Credit'>('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [suppliersRes, posRes] = await Promise.all([
                supplierService.getOutstandingSummary(),
                purchaseOrderService.getAllPOs()
            ]);
            setSummaries(suppliersRes.data || []);
            setOrders(posRes || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummaries = fetchData; // maintain ref if used elsewhere

    const filteredSummaries = useMemo(() => {
        return summaries.filter(s => {
            const matchesSearch =
                s.supplierNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter =
                filter === 'All' ||
                (filter === 'Debit' && s.currentBalance > 0) ||
                (filter === 'Credit' && s.currentBalance < 0);

            return matchesSearch && matchesFilter;
        });
    }, [summaries, searchTerm, filter]);

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const isClosed = o.status === 'Closed';
            const matchesSearch =
                o.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase());
            return isClosed && matchesSearch;
        });
    }, [orders, searchTerm]);

    const stats = useMemo(() => {
        const totalOutstanding = summaries.reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);
        const totalPaid = summaries.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
        const totalInvoiced = summaries.reduce((acc, curr) => acc + (curr.totalInvoiced || 0), 0);
        const providersWithBalance = summaries.filter(s => (s.currentBalance || 0) > 0).length;

        return {
            totalOutstanding: totalOutstanding.toLocaleString(),
            totalPaid: totalPaid.toLocaleString(),
            totalInvoiced: totalInvoiced.toLocaleString(),
            providersWithBalance
        };
    }, [summaries]);

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>

            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">الأرصدة المستحقة للموردين</h1>
                        <p className="text-slate-500 text-sm">متابعة المديونيات، الفواتير، والمدفوعات لكل مورد</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all border border-slate-200">
                        <Download className="w-4 h-4" />
                        <span>تصدير تقرير</span>
                    </button>
                    <button onClick={fetchSummaries} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all border border-slate-200">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Wallet} value={stats.totalOutstanding} label="إجمالي المستحقات" color="rose" />
                <StatCard icon={TrendingUp} value={stats.totalInvoiced} label="إجمالي المشتريات" color="blue" />
                <StatCard icon={TrendingDown} value={stats.totalPaid} label="إجمالي المدفوعات" color="emerald" />
                <StatCard icon={Building2} value={stats.providersWithBalance.toString()} label="موردين لهم مديونية" color="amber" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100/50 w-fit rounded-2xl border border-slate-200">
                <button
                    onClick={() => setActiveTab('balances')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
                        ${activeTab === 'balances' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Wallet className="w-4 h-4" />
                    <span>أرصدة الموردين</span>
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
                        ${activeTab === 'orders' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>أوامر شراء معلقة (مغلقة)</span>
                    {filteredOrders.length > 0 && (
                        <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full">
                            {filteredOrders.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder={activeTab === 'balances' ? "بحث باسم المورد أو كود المورد..." : "بحث برقم الأمر أو المورد..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-transparent bg-slate-50 focus:border-brand-primary outline-none transition-all"
                    />
                </div>
                {activeTab === 'balances' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none"
                        >
                            <option value="All">جميع الأرصدة</option>
                            <option value="Debit">مدين (لهم مستحقات)</option>
                            <option value="Credit">دائن (رصيد مقدم)</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Content Tabl */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    {activeTab === 'balances' ? (
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                    <th className="px-6 py-4 text-sm">المورد</th>
                                    <th className="px-6 py-4 text-sm text-center">إجمالي الفواتير</th>
                                    <th className="px-6 py-4 text-sm text-center">إجمالي المدفوعات</th>
                                    <th className="px-6 py-4 text-sm text-center">الرصيد الحالي</th>
                                    <th className="px-6 py-4 text-sm text-center">حد الائتمان</th>
                                    <th className="px-6 py-4 text-sm">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                        </tr>
                                    ))
                                ) : filteredSummaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                    <DollarSign className="w-8 h-8" />
                                                </div>
                                                <p className="text-slate-500 font-bold">لم يتم العثور على موردين مطابقين للبحث</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSummaries.map((s, idx) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{s.supplierNameAr}</div>
                                                <div className="text-xs text-slate-400 font-mono">#{s.supplierCode}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-slate-600">
                                                {(s.totalInvoiced || 0).toLocaleString()} {s.currency || 'EGP'}
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-emerald-600">
                                                {(s.totalPaid || 0).toLocaleString()} {s.currency || 'EGP'}
                                            </td>
                                            <td className={`px-6 py-4 text-center font-black ${(s.currentBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {Math.abs(s.currentBalance || 0).toLocaleString()} {s.currency || 'EGP'}
                                                {(s.currentBalance || 0) > 0 ? ' (لم يسدد)' : (s.currentBalance || 0) < 0 ? ' (له رصيد)' : ''}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 px-3 py-1 bg-slate-100 rounded-full">
                                                    <CreditCard className="w-3 h-3" />
                                                    {s.creditLimit ? s.creditLimit.toLocaleString() : '0.00'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/dashboard/procurement/suppliers/${s.id}`)}
                                                        className="p-2 text-brand-primary bg-brand-primary/5 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                    <th className="px-6 py-4 text-sm">رقم الأمر</th>
                                    <th className="px-6 py-4 text-sm">التاريخ</th>
                                    <th className="px-6 py-4 text-sm">المورد</th>
                                    <th className="px-6 py-4 text-sm text-left">الإجمالي</th>
                                    <th className="px-6 py-4 text-sm text-center">الحالة</th>
                                    <th className="px-6 py-4 text-sm text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                        </tr>
                                    ))
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                                <p className="text-slate-500 font-bold">لا توجد أوامر شراء مغلقة حالياً</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((o, idx) => (
                                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                                            <td className="px-6 py-4 font-bold text-slate-800">#{o.poNumber}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{new Date(o.poDate!).toLocaleDateString('ar-EG')}</td>
                                            <td className="px-6 py-4 font-medium">{o.supplierNameAr}</td>
                                            <td className="px-6 py-4 text-left font-bold text-emerald-600">{o.totalAmount.toLocaleString()} {o.currency}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border bg-emerald-100 text-emerald-700 border-emerald-300">
                                                    <CheckCircle2 className="w-3 h-3" /> مغلق
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <button onClick={() => navigate(`/dashboard/procurement/po/${o.id}`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all" title="التفاصيل"><FileText className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierOutstandingPage;
