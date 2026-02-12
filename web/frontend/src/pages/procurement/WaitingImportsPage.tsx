import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Truck,
    Clock,
    Calendar,
    Package,
    CheckCircle2,
    Search,
    X,
    RefreshCw,
    AlertCircle,
    DollarSign
} from 'lucide-react';
import { purchaseOrderService, type PurchaseOrderDto } from '../../services/purchaseOrderService';
import { formatNumber, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

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
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// PO Card Component
const POCard: React.FC<{
    po: PurchaseOrderDto;
    index: number;
    onMarkArrived: (po: PurchaseOrderDto) => void;
    processingId: number | null;
}> = ({ po, index, onMarkArrived, processingId }) => {
    const calculateDaysRemaining = () => {
        if (!po.expectedDeliveryDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deliveryDate = new Date(po.expectedDeliveryDate);
        deliveryDate.setHours(0, 0, 0, 0);
        const diffTime = deliveryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = calculateDaysRemaining();
    const isOverdue = daysRemaining !== null && daysRemaining < 0;
    const isDueSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3;

    const getExpectedArrivalDate = () => {
        if (!po.poDate || !po.deliveryDays) return null;
        const poDate = new Date(po.poDate);
        const arrivalDate = new Date(poDate);
        arrivalDate.setDate(arrivalDate.getDate() + po.deliveryDays);
        return arrivalDate;
    };

    const expectedArrival = getExpectedArrivalDate();

    return (
        <div
            className={`bg-white p-6 rounded-2xl border-2 shadow-sm hover:shadow-lg 
                transition-all duration-300 flex flex-col group
                ${isOverdue ? 'border-rose-200 bg-rose-50/30' : isDueSoon ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 hover:border-brand-primary/20'}`}
            style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.4s ease-out forwards'
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl 
                        ${isOverdue ? 'bg-rose-100' : isDueSoon ? 'bg-amber-100' : 'bg-brand-primary/10'} 
                        text-brand-primary group-hover:scale-110 transition-transform duration-300`}>
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-primary transition-colors">
                            {po.poNumber}
                        </h3>
                        <p className="text-slate-500 text-sm">{po.supplierNameAr}</p>
                    </div>
                </div>
                {isOverdue && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold 
                        bg-rose-100 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        متأخر
                    </span>
                )}
                {isDueSoon && !isOverdue && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold 
                        bg-amber-100 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        قريباً
                    </span>
                )}
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4 flex-1">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">القيمة الإجمالية</span>
                    </div>
                    <span className="font-bold text-emerald-600">
                        {formatNumber(po.totalAmount)} {po.currency || 'EGP'}
                    </span>
                </div>

                {po.deliveryDays && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">مدة التوريد</span>
                        </div>
                        <span className="font-bold text-blue-700">
                            {po.deliveryDays} يوم
                        </span>
                    </div>
                )}

                {expectedArrival && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-2 text-purple-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">تاريخ الوصول المتوقع</span>
                        </div>
                        <span className={`font-bold ${isOverdue ? 'text-rose-700' : isDueSoon ? 'text-amber-700' : 'text-purple-700'}`}>
                            {formatDate(expectedArrival)}
                        </span>
                    </div>
                )}

                {daysRemaining !== null && (
                    <div className={`p-3 rounded-xl border-2 ${isOverdue
                        ? 'bg-rose-50 border-rose-200'
                        : isDueSoon
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-emerald-50 border-emerald-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${isOverdue ? 'text-rose-700' : isDueSoon ? 'text-amber-700' : 'text-emerald-700'
                                }`}>
                                {isOverdue
                                    ? `متأخر ${Math.abs(daysRemaining)} يوم`
                                    : daysRemaining === 0
                                        ? 'يصل اليوم'
                                        : `متبقي ${daysRemaining} يوم`
                                }
                            </span>
                        </div>
                    </div>
                )}

                {po.poDate && (
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        تاريخ الأمر: {formatDate(po.poDate)}
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-100">
                <button
                    onClick={() => onMarkArrived(po)}
                    disabled={processingId === po.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-l 
                        from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-sm 
                        hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg 
                        shadow-emerald-500/20 hover:scale-105 active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {processingId === po.id ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري المعالجة...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تم الوصول</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// Loading Skeleton
const CardSkeleton: React.FC = () => (
    <>
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                    <div className="h-6 w-24 bg-slate-100 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-100 rounded mb-4" />
                <div className="space-y-2 mb-4">
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                </div>
                <div className="h-10 w-full bg-slate-100 rounded-xl" />
            </div>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
            {searchTerm ? (
                <Search className="w-12 h-12 text-slate-400" />
            ) : (
                <Truck className="w-12 h-12 text-slate-400" />
            )}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
            {searchTerm ? 'لا توجد نتائج' : 'لا توجد شحنات قادمة'}
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
            {searchTerm
                ? `لم يتم العثور على أوامر تطابق "${searchTerm}"`
                : 'لا توجد أوامر شراء معتمدة بانتظار وصول الشحنات حالياً'}
        </p>
    </div>
);

const WaitingImportsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pos, setPos] = useState<PurchaseOrderDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchWaitingPOs();
    }, []);

    const fetchWaitingPOs = async () => {
        try {
            setLoading(true);
            const data = await purchaseOrderService.getWaitingForArrivalPOs();
            setPos(data || []);
        } catch (error) {
            console.error('Failed to fetch waiting POs:', error);
            toast.error('فشل تحميل الشحنات القادمة');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkArrived = async (po: PurchaseOrderDto) => {
        if (!po.id) return;

        try {
            setProcessingId(po.id);

            // Get current user ID
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            const userId = user?.id || user?.userId || 1;

            // Mark PO as arrived and create GRN automatically
            await purchaseOrderService.markAsArrived(po.id, userId);

            toast.success('تم تسجيل وصول الشحنة وإنشاء إذن الاستلام بنجاح');

            // Remove from local list
            setPos(prev => prev.filter(p => p.id !== po.id));

            // Navigate to Quality Inspection Page
            // navigate('/dashboard/inventory/quality-inspection');
            // Notification handled globally by DashboardLayout polling
        } catch (error: any) {
            console.error('Failed to mark as arrived:', error);
            toast.error(error?.response?.data?.message || 'فشل تسجيل وصول الشحنة');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredPOs = useMemo(() => {
        const filtered = pos.filter(po =>
            po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Sort by expected delivery date (earliest first)
        return [...filtered].sort((a, b) => {
            const dateA = a.expectedDeliveryDate ? new Date(a.expectedDeliveryDate).getTime() : 0;
            const dateB = b.expectedDeliveryDate ? new Date(b.expectedDeliveryDate).getTime() : 0;
            if (dateA !== dateB) return dateA - dateB;
            return (a.id ?? 0) - (b.id ?? 0);
        });
    }, [pos, searchTerm]);

    const paginatedPOs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPOs.slice(start, start + pageSize);
    }, [filteredPOs, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdue = pos.filter(po => {
            if (!po.expectedDeliveryDate) return false;
            const deliveryDate = new Date(po.expectedDeliveryDate);
            deliveryDate.setHours(0, 0, 0, 0);
            return deliveryDate < today;
        }).length;

        const dueSoon = pos.filter(po => {
            if (!po.expectedDeliveryDate) return false;
            const deliveryDate = new Date(po.expectedDeliveryDate);
            deliveryDate.setHours(0, 0, 0, 0);
            const diffTime = deliveryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 3;
        }).length;

        return {
            total: pos.length,
            overdue,
            dueSoon,
            totalValue: formatNumber(pos.reduce((sum, po) => sum + (po.totalAmount || 0), 0))
        };
    }, [pos]);

    return (
        <div className="space-y-6">
            {/* Custom Styles */}
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
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex items-center gap-5">
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <Truck className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">الشحنات القادمة</h1>
                        <p className="text-white/70 text-lg">تتبع أوامر الشراء المعتمدة بانتظار وصول الشحنات من الموردين</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Package}
                    value={stats.total}
                    label="إجمالي الشحنات"
                    color="primary"
                />
                <StatCard
                    icon={AlertCircle}
                    value={stats.overdue}
                    label="متأخرة"
                    color="rose"
                />
                <StatCard
                    icon={Clock}
                    value={stats.dueSoon}
                    label="قادمة قريباً"
                    color="warning"
                />
                <StatCard
                    icon={DollarSign}
                    value={`${stats.totalValue} ج.م`}
                    label="القيمة الإجمالية"
                    color="success"
                />
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="البحث برقم الأمر أو المورد..."
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
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={fetchWaitingPOs}
                        disabled={loading}
                        className="p-3 rounded-xl border border-slate-200 text-slate-600 
                            hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                            disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">تحديث</span>
                    </button>
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredPOs.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{pos.length}</span> شحنة
                    </span>
                </div>
            )}

            {/* PO Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <CardSkeleton />
                ) : filteredPOs.length === 0 ? (
                    <EmptyState searchTerm={searchTerm} />
                ) : (
                    paginatedPOs.map((po, index) => (
                        <POCard
                            key={po.id}
                            po={po}
                            index={index}
                            onMarkArrived={handleMarkArrived}
                            processingId={processingId}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredPOs.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredPOs.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            )}
        </div>
    );
};

export default WaitingImportsPage;
