import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    User,
    Building2,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import purchaseService, { type PurchaseRequisition } from '../../services/purchaseService';
import toast from 'react-hot-toast';

const PurchaseRequisitionsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [prs, setPrs] = useState<PurchaseRequisition[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchPRs();
    }, []);

    const fetchPRs = async () => {
        try {
            setLoading(true);
            const data = await purchaseService.getAllPRs();
            setPrs(data);
        } catch (error) {
            console.error('Failed to fetch PRs:', error);
            toast.error('فشل تحميل طلبات الشراء');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle2 className="w-4 h-4" />;
            case 'Rejected': return <XCircle className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const filteredPRs = prs.filter(pr => {
        const matchesSearch =
            pr.prNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.requestedByUserName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || pr.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">طلبات الشراء</h1>
                    <p className="text-slate-500 mt-1">إدارة ومتابعة طلبات الشراء الداخلية</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/procurement/pr/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>طلب جديد</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="بحث برقم الطلب أو اسم الطالب..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="text-slate-400 w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                        >
                            <option value="All">جميع الحالات</option>
                            <option value="Draft">مسودة</option>
                            <option value="Pending">قيد الانتظار</option>
                            <option value="Approved">معتمد</option>
                            <option value="Rejected">مرفوض</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">رقم الطلب</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">تاريخ الطلب</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">الطالب</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">القسم</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">الأولوية</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : filteredPRs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        لا توجد طلبات شراء
                                    </td>
                                </tr>
                            ) : (
                                filteredPRs.map((pr) => (
                                    <motion.tr
                                        key={pr.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            #{pr.prNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {new Date(pr.prDate || '').toLocaleDateString('ar-EG')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                {pr.requestedByUserName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                {pr.requestedByDeptName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${pr.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                    pr.priority === 'Low' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                {pr.priority === 'High' ? 'عالية' : pr.priority === 'Low' ? 'منخفضة' : 'عادية'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status || 'Draft')}`}>
                                                {getStatusIcon(pr.status || 'Draft')}
                                                {pr.status === 'Draft' ? 'مسودة' :
                                                    pr.status === 'Pending' ? 'قيد الانتظار' :
                                                        pr.status === 'Approved' ? 'معتمد' : 'مرفوض'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={() => navigate(`/dashboard/procurement/pr/${pr.id}`)}
                                                className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PurchaseRequisitionsPage;
