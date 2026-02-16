import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    Truck,
    Building2,
    Users,
    Phone,
    MapPin,
    CheckCircle2,
    RefreshCw,
    Edit3,
    Trash2
} from 'lucide-react';
import { supplierService, type SupplierDto } from '../../services/supplierService';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600'
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

// Supplier Type Labels (Arabic)
const SUPPLIER_TYPE_LABELS: Record<string, string> = {
    Local: 'محلي',
    International: 'دولي',
    Service: 'خدمي'
};

// Status Badge Component
const StatusBadge: React.FC<{ active: boolean; status: SupplierDto['status'] }> = ({ active, status }) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
        DRAFT: { label: 'مسودة', class: 'bg-slate-100 text-slate-600 border-slate-200' },
        PENDING: { label: 'قيد المراجعة', class: 'bg-amber-50 text-amber-700 border-amber-200' },
        APPROVED: { label: 'معتمد', class: 'bg-blue-50 text-blue-700 border-blue-200' },
        REJECTED: { label: 'مرفوض', class: 'bg-rose-50 text-rose-700 border-rose-200' }
    };

    const normalizedStatus = status?.toUpperCase() || 'DRAFT';
    const config = statusConfig[normalizedStatus] || statusConfig.DRAFT;

    return (
        <div className="flex flex-col gap-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.class}`}>
                {normalizedStatus === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                {config.label}
            </span>
            {!active && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-slate-50 text-slate-500 border-slate-200">
                    معطل
                </span>
            )}
        </div>
    );
};

const SuppliersPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<SupplierDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await supplierService.getAllSuppliers();
            setSuppliers(data.data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
            toast.error('فشل تحميل الموردين');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await supplierService.submitForApproval(id);
            toast.success('تم إرسال المورد للاعتماد');
            fetchSuppliers();
        } catch (error) {
            toast.error('فشل إرسال المورد');
        }
    };

    const handleDeleteClick = (supplier: SupplierDto) => {
        setSupplierToDelete(supplier);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!supplierToDelete) return;

        try {
            setIsDeleting(true);
            await supplierService.deleteSupplier(supplierToDelete.id!);
            toast.success('تم حذف المورد بنجاح');
            setIsDeleteModalOpen(false);
            setSupplierToDelete(null);
            fetchSuppliers();
        } catch (error) {
            toast.error('فشل حذف المورد');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredSuppliers = useMemo(() => {
        const filtered = suppliers.filter(s => {
            const matchesSearch =
                s.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.supplierCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'All' || s.supplierType === typeFilter;
            return matchesSearch && matchesType;
        });
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [suppliers, searchTerm, typeFilter]);

    const stats = useMemo(() => ({
        total: suppliers.length,
        active: suppliers.filter(s => s.isActive).length,
        approved: suppliers.filter(s => s.isApproved).length,
        local: suppliers.filter(s => s.supplierType === 'Local').length,
    }), [suppliers]);

    return (
        <div className="space-y-6" dir="rtl">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            {/* Enhanced Header */}
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
                            <Truck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">سجل الموردين</h1>
                            <p className="text-white/80 text-lg">إدارة بيانات الموردين، الشروط المالية، والتواصل</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/suppliers/new')}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl 
                            font-bold shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة مورد جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Building2} value={stats.total} label="إجمالي الموردين" color="primary" />
                <StatCard icon={CheckCircle2} value={stats.active} label="مورد نشط" color="success" />
                <StatCard icon={Users} value={stats.approved} label="مورد معتمد" color="purple" />
                <StatCard icon={MapPin} value={stats.local} label="مورد محلي" color="warning" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors 
                        ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder="بحث باسم المورد، الكود، أو المسئول..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50
                            ${isSearchFocused ? 'border-brand-primary bg-white shadow-lg' : 'border-transparent'}`}
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent">
                    <Filter className="text-slate-400 w-5 h-5" />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                    >
                        <option value="All">جميع الأنواع</option>
                        <option value="Local">محلـي</option>
                        <option value="International">دولـي</option>
                        <option value="Service">خدمي</option>
                    </select>
                </div>
                <button
                    onClick={fetchSuppliers}
                    className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredSuppliers.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{suppliers.length}</span> مورد
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden"
                style={{ animation: 'slideInRight 0.4s ease-out' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-l from-slate-50 to-white border-b-2 border-slate-200">
                                <th className="py-4 pr-6 text-right text-sm font-bold text-slate-700">
                                    المورد
                                </th>
                                <th className="py-4 px-4 text-right text-sm font-bold text-slate-700">
                                    الكود
                                </th>
                                <th className="py-4 px-4 text-right text-sm font-bold text-slate-700">
                                    النوع
                                </th>
                                <th className="py-4 px-4 text-right text-sm font-bold text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        مسئول الاتصال
                                    </div>
                                </th>
                                <th className="py-4 px-4 text-right text-sm font-bold text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        الهاتف
                                    </div>
                                </th>
                                <th className="py-4 px-4 text-right text-sm font-bold text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        الموقع
                                    </div>
                                </th>
                                <th className="py-4 px-4 text-center text-sm font-bold text-slate-700">
                                    الحالة
                                </th>
                                <th className="py-4 pl-6 text-center text-sm font-bold text-slate-700">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                // Loading Skeleton
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 pr-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-slate-200 rounded" />
                                                    <div className="h-3 w-20 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                                        <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                                        <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="py-4 px-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                                        <td className="py-4 px-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                                        <td className="py-4 px-4"><div className="h-6 w-20 bg-slate-200 rounded-full mx-auto" /></td>
                                        <td className="py-4 pl-6"><div className="h-8 w-8 bg-slate-200 rounded-lg mx-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredSuppliers.length === 0 ? (
                                // Empty State
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Truck className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد نتائج بحث</h3>
                                        <p className="text-slate-500">جرب البحث بكلمات مختلفة أو إضافة مورد جديد</p>
                                    </td>
                                </tr>
                            ) : (
                                // Data Rows
                                filteredSuppliers.map((supplier, index) => (
                                    <tr
                                        key={supplier.id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                        style={{
                                            animationDelay: `${index * 30}ms`,
                                            animation: 'fadeInUp 0.3s ease-out forwards'
                                        }}
                                    >
                                        <td className="py-4 pr-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                                                    rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Truck className="w-5 h-5 text-brand-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                                                        {supplier.supplierNameAr}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {supplier.supplierNameEn}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-mono text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                #{supplier.supplierCode}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-slate-600 font-medium">
                                                {SUPPLIER_TYPE_LABELS[supplier.supplierType || ''] || supplier.supplierType || 'عام'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-slate-600">
                                                {supplier.contactPerson || '-'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-slate-600 font-mono" dir="ltr">
                                                {supplier.phone || '-'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-slate-600">
                                                {supplier.city ? `${supplier.city}, ${supplier.country}` : '-'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-center">
                                                <StatusBadge active={supplier.isActive ?? true} status={supplier.status} />
                                            </div>
                                        </td>
                                        <td className="py-4 pl-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/dashboard/procurement/suppliers/${supplier.id}`)}
                                                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                    title="تعديل"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                {['DRAFT', 'Draft'].includes(supplier.status || '') && (
                                                    <button
                                                        onClick={() => handleApprove(supplier.id!)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="اعتماد"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteClick(supplier)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف المورد"
                message={`هل أنت متأكد من حذف المورد "${supplierToDelete?.supplierNameAr}"؟ سيتم حذف جميع البيانات المرتبطة به ولا يمكن التراجع عن هذه الخطوة.`}
                confirmText="حذف المورد"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setSupplierToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default SuppliersPage;