import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    User,
    Edit3,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    ShoppingCart,
    Trash2,
    RefreshCw,
} from 'lucide-react';
import { customerRequestService } from '../../services/customerRequestService';
import type { CustomerRequest } from '../../types/sales';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/format';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

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
        'Approved': {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'معتمد'
        },
        'Rejected': {
            icon: XCircle,
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            label: 'مرفوض'
        },
        'Pending': {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200',
            label: 'قيد الانتظار'
        },
        'Draft': {
            icon: FileText,
            className: 'bg-slate-50 text-slate-700 border-slate-200',
            label: 'مسودة'
        }
    };

    const { icon: Icon, className, label } = config[status] || config['Draft'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

// Table Row Component
const RequestTableRow: React.FC<{
    request: CustomerRequest;
    index: number;
    onView: (id: number) => void;
    onDelete: (request: CustomerRequest) => void;
}> = ({ request, index, onView, onDelete }) => (
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
                    #{request.requestNumber}
                </span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(request.requestDate)}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>{request.customerName || request.customerId}</span>
            </div>
        </td>
        <td className="px-6 py-4">
            <StatusBadge status={request.status || 'Draft'} />
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            {request.schedules && request.schedules.length > 0 ? (
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-amber-600">
                        {formatDate(request.schedules.sort((a, b) =>
                            new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
                        )[0].deliveryDate)}
                    </span>
                    {request.schedules.length > 1 && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                            +{request.schedules.length - 1}
                        </span>
                    )}
                </div>
            ) : (
                <span className="text-slate-400">-</span>
            )}
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onView(request.requestId)}
                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                        rounded-lg transition-all duration-200"
                    title={request.status === 'Approved' ? 'عرض' : 'تعديل'}
                >
                    {request.status === 'Approved' ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </button>

                {(request.status === 'Draft' || request.status === 'Rejected') && (
                    <button
                        onClick={() => onDelete(request)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                            rounded-lg transition-all duration-200"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </td>
    </tr>
);

// Loading Skeleton
const TableSkeleton: React.FC = () => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse border-b border-slate-100">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                        <div className="h-4 w-20 bg-slate-100 rounded" />
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </td>
                <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                        <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                    </div>
                </td>
            </tr>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string; statusFilter: string }> = ({ searchTerm, statusFilter }) => (
    <tr>
        <td colSpan={6} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm || statusFilter !== 'All' ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <ShoppingCart className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm || statusFilter !== 'All' ? 'لا توجد نتائج' : 'لا توجد طلبات'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'All'
                        ? 'لم يتم العثور على طلبات تطابق معايير البحث'
                        : 'لم يتم إنشاء أي طلبات بعد'}
                </p>
            </div>
        </td>
    </tr>
);

const CustomerRequestListPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<CustomerRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<{ id: number; number: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchRequests();

        if (location.state?.success) {
            setSuccessMessage(location.state.message || 'تم تحديث الطلب بنجاح');
            setTimeout(() => setSuccessMessage(''), 4000);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await customerRequestService.getAllRequests();
            if (response.success && Array.isArray(response.data)) {
                // Ensure data is sorted by date/ID similar to PRs
                setRequests(response.data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            toast.error('فشل تحميل قائمة الطلبات');
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = useMemo(() => {
        const filtered = requests.filter(req => {
            const matchesSearch =
                (req.requestNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (req.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        return [...filtered].sort((a, b) => {
            const dateA = a.requestDate ? new Date(a.requestDate).getTime() : 0;
            const dateB = b.requestDate ? new Date(b.requestDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.requestId || 0) - (a.requestId || 0);
        });
    }, [requests, searchTerm, statusFilter]);

    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredRequests.slice(start, start + pageSize);
    }, [filteredRequests, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: requests.length,
        draft: requests.filter(r => r.status === 'Draft').length,
        pending: requests.filter(r => r.status === 'Pending').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        rejected: requests.filter(r => r.status === 'Rejected').length,
    }), [requests]);

    const handleViewRequest = (id: number) => {
        navigate(`/dashboard/sales/customer-requests/${id}`);
    };

    const handleDeleteClick = (req: CustomerRequest) => {
        setRequestToDelete({ id: req.requestId, number: req.requestNumber });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!requestToDelete) return;
        setIsDeleting(true);
        try {
            await customerRequestService.deleteRequest(requestToDelete.id);
            setRequests(prev => prev.filter(r => r.requestId !== requestToDelete.id));
            toast.success('تم حذف الطلب بنجاح');
            setIsDeleteModalOpen(false);
            setRequestToDelete(null);
        } catch (error) {
            toast.error('فشل حذف الطلب');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <User className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">طلبات العملاء</h1>
                            <p className="text-white/70 text-lg">إدارة طلبات العملاء ومتابعة حالاتها</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/sales/customer-requests/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>طلب جديد</span>
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 
                    px-6 py-4 rounded-2xl flex justify-between items-center 
                    animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <span className="font-bold block">{successMessage}</span>
                            <span className="text-sm text-emerald-600">تم التحديث بنجاح</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSuccessMessage('')}
                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard icon={FileText} value={stats.total} label="إجمالي الطلبات" color="primary" />
                <StatCard icon={FileText} value={stats.draft} label="مسودة" color="blue" />
                <StatCard icon={Clock} value={stats.pending} label="قيد الانتظار" color="warning" />
                <StatCard icon={CheckCircle2} value={stats.approved} label="معتمد" color="success" />
                <StatCard icon={XCircle} value={stats.rejected} label="مرفوض" color="rose" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث برقم الطلب، اسم العميل..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 
                                outline-none bg-slate-50
                                ${isSearchFocused
                                    ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                    : 'border-transparent hover:border-slate-200'}`}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 
                                    rounded-full transition-colors"
                            >
                                <XCircle className="w-4 h-4 text-slate-400" />
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
                                <option value="Pending">قيد الانتظار</option>
                                <option value="Approved">معتمد</option>
                                <option value="Rejected">مرفوض</option>
                            </select>
                        </div>

                        <button
                            onClick={fetchRequests}
                            disabled={loading}
                            className="p-3 rounded-xl border border-slate-200 text-slate-600 
                                hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                                disabled:opacity-50"
                            title="تحديث"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">رقم الطلب</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">تاريخ الطلب</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">العميل</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">أقرب تسليم</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredRequests.length === 0 ? (
                                <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
                            ) : (
                                paginatedRequests.map((req, index) => (
                                    <RequestTableRow
                                        key={req.requestId}
                                        request={req}
                                        index={index}
                                        onView={handleViewRequest}
                                        onDelete={handleDeleteClick}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredRequests.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredRequests.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    />
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف طلب العميل"
                message={requestToDelete
                    ? `هل أنت متأكد من حذف الطلب رقم ${requestToDelete.number}؟ سيتم حذفه نهائياً.`
                    : ''}
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setRequestToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default CustomerRequestListPage;
