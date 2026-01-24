import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    CheckCircle2,
    Clock,
    RefreshCw,
    DollarSign,
    Undo2,
    AlertCircle,
    Eye,
    Truck
} from 'lucide-react';
import { purchaseReturnService, type PurchaseReturnDto } from '../../services/purchaseReturnService';
import toast from 'react-hot-toast';

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
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { icon: React.ElementType; className: string; label: string }> = {
        'Draft': { icon: FileText, className: 'bg-slate-100 text-slate-600 border-slate-200', label: 'مسودة' },
        'Pending': { icon: Clock, className: 'bg-amber-50 text-amber-600 border-amber-200', label: 'قيد الاعتماد' },
        'Approved': { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'معتمد' },
        'Rejected': { icon: AlertCircle, className: 'bg-rose-50 text-rose-600 border-rose-200', label: 'مرفوض' },
        'SentToSupplier': { icon: Truck, className: 'bg-blue-50 text-blue-600 border-blue-200', label: 'أرسل للمورد' }
    };
    const { icon: Icon, className, label } = config[status] || config['Draft'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </span>
    );
};

const PurchaseReturnsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [returns, setReturns] = useState<PurchaseReturnDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => { fetchReturns(); }, []);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const data = await purchaseReturnService.getAllReturns();
            setReturns(data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('فشل تحميل مرتجعات الشراء');
        }
        finally { setLoading(false); }
    };

    const filteredReturns = useMemo(() => {
        return returns.filter(r => {
            const matchesSearch = r.returnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [returns, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: returns.length,
        pending: returns.filter(r => r.status === 'Draft' || r.status === 'Pending').length,
        approved: returns.filter(r => r.status === 'Approved').length,
        totalValue: returns.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
    }), [returns]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-3xl p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Undo2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">مرتجعات الشراء</h1>
                            <p className="text-white/70 text-lg">إدارة عمليات رد البضائع للموردين وتسوية الأرصدة</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/procurement/returns/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-rose-600 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5" /> <span>إنشاء طلب مرتجع</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} value={stats.total} label="إجمالي المرتجعات" color="primary" />
                <StatCard icon={Clock} value={stats.pending} label="قيد المعالجة" color="warning" />
                <StatCard icon={CheckCircle2} value={stats.approved} label="مرتجعات معتمدة" color="success" />
                <StatCard icon={DollarSign} value={`${stats.totalValue.toLocaleString()} ج.م`} label="إجمالي القيمة" color="rose" />
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="بحث برقم المرتجع، المورد، أو رقم الإذن..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-transparent bg-slate-50 focus:border-rose-500 focus:bg-white outline-none transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-slate-50 rounded-xl border-none font-medium outline-none"
                >
                    <option value="All">جميع الحالات</option>
                    <option value="Draft">مسودة</option>
                    <option value="Pending">قيد الاعتماد</option>
                    <option value="Approved">معتمد</option>
                    <option value="Rejected">مرفوض</option>
                </select>
                <button onClick={fetchReturns} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-200">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                                <th className="px-6 py-5 text-sm">رقم المرتجع</th>
                                <th className="px-6 py-5 text-sm">المورد</th>
                                <th className="px-6 py-5 text-sm">إذن الاستلام (GRN)</th>
                                <th className="px-6 py-5 text-sm text-center">التاريخ</th>
                                <th className="px-6 py-5 text-sm text-left">الإجمالي</th>
                                <th className="px-6 py-5 text-sm text-center">الحالة</th>
                                <th className="px-6 py-5 text-sm">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8"><div className="h-6 bg-slate-50 rounded-lg w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredReturns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-32 text-center text-slate-400 italic font-medium">
                                        لا توجد مرتجعات مشتريات حالياً
                                    </td>
                                </tr>
                            ) : (
                                filteredReturns.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-800">#{r.returnNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-slate-300" />
                                                <span className="font-medium text-slate-700">{r.supplierNameAr}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-slate-500">#{r.grnNumber || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(r.returnDate).toLocaleDateString('ar-EG')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-left font-bold text-rose-600">
                                            {r.totalAmount.toLocaleString()} <span className="text-[10px] opacity-70">ج.م</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={r.status!} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/dashboard/procurement/returns/${r.id}`)}
                                                className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PurchaseReturnsPage;
