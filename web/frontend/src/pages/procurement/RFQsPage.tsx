import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    Edit3,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    Truck,
    Package,
    Tag
} from 'lucide-react';
import purchaseService, { type RFQ } from '../../services/purchaseService';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number;
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
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { icon: React.ElementType; className: string; label: string }> = {
        'Completed': {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'مكتمل'
        },
        'Cancelled': {
            icon: XCircle,
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            label: 'ملغي'
        },
        'Pending': {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200',
            label: 'قيد الانتظار'
        },
        'Sent': {
            icon: FileText,
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'تم الإرسال'
        }
    };

    const { icon: Icon, className, label } = config[status] || config['Sent'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

// Table Row Component
const RFQTableRow: React.FC<{
    rfq: RFQ;
    index: number;
    onView: (id: number) => void;
    onCreateQuotation: (id: number) => void;
}> = ({ rfq, index, onView, onCreateQuotation }) => (
    <tr
        className="hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                    #{rfq.rfqNumber}
                </span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{new Date(rfq.rfqDate || '').toLocaleDateString('ar-EG')}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>{rfq.supplierNameAr}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            {rfq.prNumber ? (
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>#{rfq.prNumber}</span>
                </div>
            ) : '-'}
        </td>
        <td className="px-6 py-4 text-sm font-bold">
            {rfq.responseDueDate ? (
                <div className={`flex items-center gap-2 ${new Date(rfq.responseDueDate) < new Date() ? 'text-rose-500' :
                    new Date(rfq.responseDueDate).getTime() - new Date().getTime() < 86400000 * 2 ? 'text-amber-500' : 'text-slate-600'
                    }`}>
                    <Clock className="w-4 h-4" />
                    <span>{new Date(rfq.responseDueDate).toLocaleDateString('ar-EG')}</span>
                </div>
            ) : '-'}
        </td>
        <td className="px-6 py-4">
            <StatusBadge status={rfq.status || 'Sent'} />
        </td>
        <td className="px-6 py-4 text-left">
            <div className="flex items-center justify-end gap-2">
                {rfq.status === 'Sent' && (
                    <button
                        onClick={() => onCreateQuotation(rfq.id!)}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 
                            rounded-lg transition-all duration-200"
                        title="تسجيل عرض سعر"
                    >
                        <Tag className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={() => onView(rfq.id!)}
                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                        rounded-lg transition-all duration-200"
                    title="تعديل"
                >
                    <Edit3 className="w-5 h-5" />
                </button>
            </div>
        </td>
    </tr>
);

const RFQsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [pendingPRs, setPendingPRs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'rfqs' | 'pending'>('rfqs');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        if (activeTab === 'rfqs') {
            fetchRFQs();
        } else {
            fetchPendingPRs();
        }
    }, [activeTab]);

    const fetchRFQs = async () => {
        try {
            setLoading(true);
            const data = await purchaseService.getAllRFQs();
            setRfqs(data);
        } catch (error) {
            console.error('Failed to fetch RFQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingPRs = async () => {
        try {
            setLoading(true);
            const data = await purchaseService.getAllPRs();
            // Filter only approved PRs that haven't been fully turned into RFQs (simplified logic)
            setPendingPRs(data.filter((pr: any) => pr.status === 'Approved'));
        } catch (error) {
            console.error('Failed to fetch PRs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRFQs = useMemo(() => {
        return rfqs.filter(rfq => {
            const matchesSearch =
                rfq.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rfq.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rfq.prNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || rfq.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [rfqs, searchTerm, statusFilter]);

    const filteredPRs = useMemo(() => {
        return pendingPRs.filter(pr =>
            pr.prNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.requestedByDeptName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.requestedByUserName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pendingPRs, searchTerm]);

    const stats = useMemo(() => ({
        total: rfqs.length,
        sent: rfqs.filter(r => r.status === 'Sent').length,
        pending: rfqs.filter(r => r.status === 'Pending').length,
        completed: rfqs.filter(r => r.status === 'Completed').length,
    }), [rfqs]);

    const handleCreateQuotation = (id: number) => {
        navigate(`/dashboard/procurement/quotation/new?rfqId=${id}`);
    };

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <FileText className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">طلبات عروض الأسعار (RFQ)</h1>
                            <p className="text-white/70 text-lg">إدارة ومتابعة طلبات عروض الأسعار من الموردين</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard/procurement/rfq/new')}
                            className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                                hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                                hover:shadow-xl hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            <span>طلب عرض سعر جديد</span>
                        </button>
                        <button
                            onClick={activeTab === 'rfqs' ? fetchRFQs : fetchPendingPRs}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white w-fit rounded-2xl border border-slate-100 shadow-sm">
                <button
                    onClick={() => setActiveTab('rfqs')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
                        ${activeTab === 'rfqs'
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                            : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileText className="w-4 h-4" />
                    <span>طلبات عروض الأسعار</span>
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
                        ${activeTab === 'pending'
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                            : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Package className="w-4 h-4" />
                    <span>طلبات شراء معتمدة (PR)</span>
                    {pendingPRs.length > 0 && (
                        <span className={`${activeTab === 'pending' ? 'bg-white text-brand-primary' : 'bg-brand-primary text-white'} text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 transition-colors`}>
                            {pendingPRs.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} value={stats.total} label="إجمالي الطلبات" color="primary" />
                <StatCard icon={Clock} value={stats.sent} label="تم الإرسال" color="blue" />
                <StatCard icon={Clock} value={stats.pending} label="قيد الانتظار" color="warning" />
                <StatCard icon={CheckCircle2} value={stats.completed} label="مكتمل" color="success" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors 
                        ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder={activeTab === 'rfqs' ? "بحث برقم الطلب، اسم المورد، أو رقم طلب الشراء..." : "بحث برقم طلب الشراء، القسم، أو الطالب..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50
                            ${isSearchFocused ? 'border-brand-primary bg-white shadow-lg' : 'border-transparent'}`}
                    />
                </div>
                {activeTab === 'rfqs' && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent">
                        <Filter className="text-slate-400 w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                        >
                            <option value="All">جميع الحالات</option>
                            <option value="Sent">تم الإرسال</option>
                            <option value="Pending">قيد الانتظار</option>
                            <option value="Completed">مكتمل</option>
                            <option value="Cancelled">ملغي</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                {activeTab === 'rfqs' ? (
                                    <>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم الطلب</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">تاريخ الطلب</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">المورد</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">طلب الشراء</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">تاريخ الاستحقاق</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">إجراءات</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم طلب الشراء (PR)</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">تاريخ الطلب</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">القسم الطالب</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">الطالب</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">المبلغ التقديري</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700 text-center">الأصناف</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">إجراءات</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-10">جاري التحميل...</td></tr>
                            ) : (activeTab === 'rfqs' ? filteredRFQs : filteredPRs).length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <Package className="w-12 h-12 opacity-20" />
                                        <span>{activeTab === 'rfqs' ? 'لا توجد طلبات عروض أسعار' : 'لا توجد طلبات شراء معتمدة بانتظار عروض الأسعار'}</span>
                                    </div>
                                </td></tr>
                            ) : activeTab === 'rfqs' ? (
                                filteredRFQs.map((rfq, index) => (
                                    <RFQTableRow
                                        key={rfq.id}
                                        rfq={rfq}
                                        index={index}
                                        onView={(id) => navigate(`/dashboard/procurement/rfq/${id}`)}
                                        onCreateQuotation={handleCreateQuotation}
                                    />
                                ))
                            ) : (
                                filteredPRs.map((pr) => (
                                    <tr key={pr.id} className="hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0">
                                        <td className="px-6 py-4 font-bold text-slate-800">#{pr.prNumber}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(pr.prDate).toLocaleDateString('ar-EG')}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-bold">{pr.requestedByDeptName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{pr.requestedByUserName}</td>
                                        <td className="px-6 py-4 text-sm font-black text-brand-primary">{pr.totalEstimatedAmount?.toLocaleString()} EGP</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                                                {pr.items?.length || 0} صنف
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => navigate(`/dashboard/procurement/rfq/new?prId=${pr.id}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>إنشاء RFQ</span>
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

export default RFQsPage;
