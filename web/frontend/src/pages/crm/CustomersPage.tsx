import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Edit2, Trash2, Users, Download,
    RefreshCw, CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, DollarSign, MapPin,
    Phone, Building2, User, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import customerService, { type Customer } from '../../services/customerService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { toast } from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number | string;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        danger: 'bg-rose-100 text-rose-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
        </div>
    );
};


// Customer Row Component
const CustomerRow: React.FC<{
    customer: Customer;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    index: number;
}> = ({ customer, onEdit, onDelete, onView, index }) => {
    return (
        <tr
            className="group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0"
            style={{
                animationDelay: `${index * 30}ms`,
                animation: 'fadeInUp 0.3s ease-out forwards'
            }}
        >
            {/* Code & Logo */}
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                        rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Building2 className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                        <span className="font-mono font-bold text-brand-primary text-sm block">{customer.customerCode}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 capitalize">{customer.customerType || 'Generic'}</span>
                    </div>
                </div>
            </td>

            {/* Name */}
            <td className="px-4 py-4">
                <div className="max-w-[200px]">
                    <p className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors truncate">
                        {customer.customerNameAr}
                    </p>
                    {customer.customerNameEn && (
                        <p className="text-xs text-slate-400 truncate" dir="ltr">{customer.customerNameEn}</p>
                    )}
                </div>
            </td>

            {/* Class & Region */}
            <td className="px-4 py-4">
                <div className="space-y-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded border
                        ${customer.customerClass === 'A' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            customer.customerClass === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        فئة {customer.customerClass || 'N/A'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {customer.city || '-'}, {customer.country || '-'}
                    </div>
                </div>
            </td>

            {/* Contact */}
            <td className="px-4 py-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {customer.contactPerson || '-'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {customer.contactPhone || customer.phone || '-'}
                    </div>
                </div>
            </td>

            {/* Balance */}
            <td className="px-4 py-4">
                <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-2 text-lg font-bold text-slate-800">
                        {customer.currentBalance?.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal">{customer.currency}</span>
                    </div>
                    {customer.creditLimit && (
                        <div className="text-[10px] text-slate-400">
                            حد الائتمان: {customer.creditLimit.toLocaleString()}
                        </div>
                    )}
                </div>
            </td>

            {/* Status */}
            <td className="px-4 py-4">
                <div className="flex flex-col gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border
                        ${customer.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {customer.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {customer.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                    {customer.isApproved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            معتمد
                        </span>
                    )}
                </div>
            </td>

            {/* Actions */}
            <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={onView}
                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                            rounded-lg transition-all duration-200"
                        title="عرض"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                            rounded-lg transition-all duration-200"
                        title="تعديل"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                            rounded-lg transition-all duration-200"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const CustomersPage: React.FC = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterType] = useState<string>('all');
    const [filterClass, setFilterClass] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await customerService.getAllCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('فشل في تحميل قائمة العملاء');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setCustomerToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return;
        setIsDeleting(true);
        try {
            await customerService.deleteCustomer(customerToDelete);
            toast.success('تم حذف العميل بنجاح');
            fetchCustomers();
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error('فشل في حذف العميل');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filtered Customers
    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            const matchesSearch =
                c.customerNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.customerNameEn && c.customerNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.contactPerson && c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.phone && c.phone.includes(searchTerm));

            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && c.isActive) ||
                (filterStatus === 'inactive' && !c.isActive);

            const matchesType = filterType === 'all' || c.customerType === filterType;
            const matchesClass = filterClass === 'all' || c.customerClass === filterClass;

            return matchesSearch && matchesStatus && matchesType && matchesClass;
        });
    }, [customers, searchTerm, filterStatus, filterType, filterClass]);

    // Pagination
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCustomers.slice(start, start + itemsPerPage);
    }, [filteredCustomers, currentPage]);

    // Stats
    const stats = useMemo(() => {
        const total = customers.length;
        const active = customers.filter(c => c.isActive).length;
        const totalBalance = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
        const overLimit = customers.filter(c => c.creditLimit && (c.currentBalance || 0) > c.creditLimit).length;

        return { total, active, totalBalance, overLimit };
    }, [customers]);

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-xl shadow-brand-primary/20">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 shadow-inner">
                            <Users className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">إدارة العملاء</h1>
                            <p className="text-white/70">إدارة بيانات العملاء والشبكة الخارجية للشركة</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
                            transition-all border border-white/5" title="تصدير السجل">
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/crm/customers/new')}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary 
                                rounded-xl font-bold hover:bg-white/90 transition-all duration-300
                                shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            <span>إضافة عميل</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={Users} value={stats.total} label="إجمالي العملاء" color="primary" />
                <StatCard icon={CheckCircle2} value={stats.active} label="عميل نشط" color="success" />
                <StatCard icon={DollarSign} value={stats.totalBalance.toLocaleString()} label="إجمالي المستحقات" color="purple" />
                <StatCard icon={AlertTriangle} value={stats.overLimit} label="عملاء فوق حد الائتمان" color="danger" />
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors
                        ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder="البحث بالاسم، الكود، الهاتف أو مسؤول التواصل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all outline-none bg-slate-50
                            ${isSearchFocused ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10' : 'border-transparent hover:border-slate-200'}`}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 ring-brand-primary/20 outline-none"
                    >
                        <option value="all">الحالة: الكل</option>
                        <option value="active">نشط فقط</option>
                        <option value="inactive">غير نشط</option>
                    </select>
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 ring-brand-primary/20 outline-none"
                    >
                        <option value="all">الفئة: الكل</option>
                        <option value="A">فئة A</option>
                        <option value="B">فئة B</option>
                        <option value="C">فئة C</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-4 text-sm font-bold text-slate-500">كود العميل</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-500">الاسم</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-500">الفئة / المنطقة</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-500">مسؤول التواصل</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-500 text-left">الميزانية الحالية</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-500">الحالة</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-500 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                                        <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : paginatedCustomers.length > 0 ? (
                                paginatedCustomers.map((customer, index) => (
                                    <CustomerRow
                                        key={customer.id}
                                        index={index}
                                        customer={customer}
                                        onEdit={() => navigate(`/dashboard/crm/customers/${customer.id}`)}
                                        onDelete={() => handleDeleteClick(customer.id!)}
                                        onView={() => navigate(`/dashboard/crm/customers/${customer.id}`)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-20 text-center text-slate-400 font-medium">
                                        لا يوجد عملاء يطابقون معايير البحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-slate-500">
                        عرض {paginatedCustomers.length} من {filteredCustomers.length} عميل
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(1)}
                            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 mx-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                                        ${currentPage === i + 1 ? 'bg-brand-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                            className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="حذف العميل"
                message="هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف العميل"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default CustomersPage;
