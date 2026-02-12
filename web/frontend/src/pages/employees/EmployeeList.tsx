import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Edit2, Trash2, UserPlus, Users, UserCheck,
    UserX, RefreshCw, CheckCircle2, XCircle,
    TrendingUp, Briefcase, Building2, Mail,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import type { Employee } from '../../services/employeeService';
import employeeService from '../../services/employeeService';
import EmployeeForm from './EmployeeForm';
import usePageTitle from '../../hooks/usePageTitle';
import ConfirmModal from '../../components/common/ConfirmModal';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number;
    label: string;
    trend?: string;
    color: 'primary' | 'success' | 'warning' | 'danger';
}> = ({ icon: Icon, value, label, trend, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        danger: 'bg-rose-100 text-rose-600'
    };

    const trendColorClasses = {
        primary: 'text-brand-primary bg-brand-primary/10',
        success: 'text-emerald-600 bg-emerald-50',
        warning: 'text-amber-600 bg-amber-50',
        danger: 'text-rose-600 bg-rose-50'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full 
                        ${trendColorClasses[color]} flex items-center gap-1`}>
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
        </div>
    );
};

// Table Row Component
const EmployeeTableRow: React.FC<{
    employee: Employee;
    onEdit: (emp: Employee) => void;
    onDelete: (id: number) => void;
    onView: (emp: Employee) => void;
    index: number;
}> = ({ employee, onEdit, onDelete, onView, index }) => {
    const getInitials = (name: string) => name.slice(0, 2);

    const getAvatarColor = (name: string) => {
        const colors = [
            'from-brand-primary to-blue-400',
            'from-emerald-500 to-teal-400',
            'from-purple-500 to-indigo-400',
            'from-amber-500 to-orange-400',
            'from-rose-500 to-pink-400',
            'from-cyan-500 to-sky-400',
        ];
        return colors[name.charCodeAt(0) % colors.length];
    };

    return (
        <tr
            className="group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0"
            style={{
                animationDelay: `${index * 30}ms`,
                animation: 'fadeInUp 0.3s ease-out forwards'
            }}
        >
            {/* Code */}
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 
                    text-sm font-mono font-semibold rounded-lg">
                    {employee.employeeCode}
                </span>
            </td>

            {/* Employee Info */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(employee.fullNameAr)} 
                        flex items-center justify-center text-white font-bold text-sm shadow-md
                        group-hover:scale-110 transition-transform duration-300`}>
                        {getInitials(employee.fullNameAr)}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
                            ${employee.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    </div>
                    <div>
                        <button onClick={() => onView(employee)} className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors text-right">
                            {employee.fullNameAr}
                        </button>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Mail className="w-3 h-3" />
                            <span>{employee.email || 'لا يوجد بريد'}</span>
                        </div>
                    </div>
                </div>
            </td>

            {/* Department */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                        <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                    </div>
                    <span className="text-sm text-slate-600">{employee.departmentNameAr || '-'}</span>
                </div>
            </td>

            {/* Job Title */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <span className="text-sm text-slate-600">{employee.jobTitle || '-'}</span>
                </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    ${employee.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {employee.isActive ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            نشط
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3.5 h-3.5" />
                            غير نشط
                        </>
                    )}
                </span>
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(employee)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-brand-primary 
                            bg-brand-primary/10 hover:bg-brand-primary hover:text-white 
                            rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                        <Edit2 className="w-4 h-4" />
                        <span className="hidden lg:inline">تعديل</span>
                    </button>
                    <button
                        onClick={() => onDelete(employee.employeeId)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 
                            bg-rose-50 hover:bg-rose-500 hover:text-white 
                            rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden lg:inline">حذف</span>
                    </button>
                </div>
            </td>
        </tr>
    );
};

// Empty State Component
const EmptyState: React.FC<{ searchTerm: string; onAdd: () => void }> = ({ searchTerm, onAdd }) => (
    <tr>
        <td colSpan={6} className="px-6 py-16">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                    {searchTerm ? (
                        <Search className="w-8 h-8 text-slate-400" />
                    ) : (
                        <Users className="w-8 h-8 text-slate-400" />
                    )}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {searchTerm ? 'لا توجد نتائج' : 'لا يوجد موظفين'}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchTerm
                        ? `لم يتم العثور على موظفين يطابقون "${searchTerm}"`
                        : 'ابدأ بإضافة موظفين جدد لإدارة فريق العمل'}
                </p>
                {!searchTerm && (
                    <button
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white 
                            rounded-xl font-medium hover:bg-brand-primary/90 transition-colors
                            shadow-lg shadow-brand-primary/30"
                    >
                        <UserPlus className="w-5 h-5" />
                        إضافة موظف جديد
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
                <td className="px-6 py-4"><div className="h-8 w-20 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div>
                            <div className="h-4 w-28 bg-slate-200 rounded mb-2" />
                            <div className="h-3 w-36 bg-slate-100 rounded" />
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4"><div className="h-6 w-28 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4"><div className="h-7 w-16 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4">
                    <div className="flex gap-2">
                        <div className="h-9 w-16 bg-slate-100 rounded-lg" />
                        <div className="h-9 w-16 bg-slate-100 rounded-lg" />
                    </div>
                </td>
            </tr>
        ))}
    </>
);

const EmployeeList: React.FC = () => {
    const navigate = useNavigate();
    usePageTitle('إدارة الموظفين');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setIsLoading(true);
            const data = await employeeService.getAll();
            setEmployees(data.content);
        } catch (error) {
            console.error('Error loading employees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccess = (msg: string) => {
        setSuccessMessage(msg);
        loadEmployees();
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    const handleAdd = () => {
        setSelectedEmployee(null);
        setIsFormOpen(true);
    };

    const handleEdit = (emp: Employee) => {
        setSelectedEmployee(emp);
        setIsFormOpen(true);
    };

    const handleView = (emp: Employee) => {
        navigate(`/dashboard/employees/${emp.employeeId}`);
    };

    const handleDeleteClick = (id: number) => {
        setEmployeeToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!employeeToDelete) return;

        setIsDeleting(true);
        try {
            await employeeService.delete(employeeToDelete);
            handleSuccess('تم حذف الموظف بنجاح');
            setIsDeleteDialogOpen(false);
            setEmployeeToDelete(null);
        } catch (err) {
            alert('حدث خطأ أثناء الحذف');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filtered and computed data
    const filteredEmployees = useMemo(() => {
        const filtered = employees.filter(emp => {
            const matchesSearch = emp.fullNameAr.includes(searchTerm) ||
                emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesFilter = filterStatus === 'all' ||
                (filterStatus === 'active' && emp.isActive) ||
                (filterStatus === 'inactive' && !emp.isActive);

            return matchesSearch && matchesFilter;
        });
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [employees, searchTerm, filterStatus]);

    // Pagination
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredEmployees.slice(start, start + itemsPerPage);
    }, [filteredEmployees, currentPage]);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const stats = useMemo(() => ({
        total: employees.length,
        active: employees.filter(e => e.isActive).length,
        inactive: employees.filter(e => !e.isActive).length,
        departments: [...new Set(employees.map(e => e.departmentNameAr))].filter(Boolean).length
    }), [employees]);

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
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Users className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">إدارة الموظفين</h1>
                            <p className="text-white/70 text-lg">عرض وإدارة قاعدة بيانات الموظفين</p>
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary 
                            rounded-xl font-bold hover:bg-white/90 transition-all duration-300
                            shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>إضافة موظف جديد</span>
                    </button>
                </div>
            </div>

            {/* Success Message - GREEN */}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    value={stats.total}
                    label="إجمالي الموظفين"
                    color="primary"
                />
                <StatCard
                    icon={UserCheck}
                    value={stats.active}
                    label="موظف نشط"
                    trend={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : undefined}
                    color="success"
                />
                <StatCard
                    icon={UserX}
                    value={stats.inactive}
                    label="غير نشط"
                    color="warning"
                />
                <StatCard
                    icon={Building2}
                    value={stats.departments}
                    label="الأقسام"
                    color="primary"
                />
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الكود أو البريد..."
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 
                                outline-none bg-slate-50
                                ${isSearchFocused
                                    ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                    : 'border-transparent hover:border-slate-200'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
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

                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                            {[
                                { value: 'all', label: 'الكل', icon: Users },
                                { value: 'active', label: 'نشط', icon: UserCheck },
                                { value: 'inactive', label: 'غير نشط', icon: UserX },
                            ].map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setFilterStatus(filter.value as typeof filterStatus)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                        transition-all duration-200
                                        ${filterStatus === filter.value
                                            ? 'bg-white text-brand-primary shadow-sm'
                                            : 'text-slate-600 hover:text-slate-800'
                                        }`}
                                >
                                    <filter.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{filter.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => loadEmployees()}
                            disabled={isLoading}
                            className="p-3 rounded-xl border border-slate-200 text-slate-600 
                                hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                                disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Active Filters */}
                {(searchTerm || filterStatus !== 'all') && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <span className="text-sm text-slate-500">الفلاتر النشطة:</span>
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 
                                text-brand-primary text-sm rounded-lg">
                                بحث: {searchTerm}
                                <button onClick={() => setSearchTerm('')}>
                                    <XCircle className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        )}
                        {filterStatus !== 'all' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 
                                text-brand-primary text-sm rounded-lg">
                                الحالة: {filterStatus === 'active' ? 'نشط' : 'غير نشط'}
                                <button onClick={() => setFilterStatus('all')}>
                                    <XCircle className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        )}
                        <button
                            onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                            className="text-sm text-slate-500 hover:text-slate-700 mr-auto"
                        >
                            مسح الكل
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            {!isLoading && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                        <span className="text-slate-600">
                            عرض <span className="font-bold text-slate-800">{filteredEmployees.length}</span> من{' '}
                            <span className="font-bold text-slate-800">{employees.length}</span> موظف
                        </span>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الكود</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الموظف</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">القسم</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">المسمى الوظيفي</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableSkeleton />
                            ) : paginatedEmployees.length > 0 ? (
                                paginatedEmployees.map((emp, index) => (
                                    <EmployeeTableRow
                                        key={emp.employeeId}
                                        employee={emp}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                        onView={handleView}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <EmptyState searchTerm={searchTerm} onAdd={handleAdd} />
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && filteredEmployees.length > itemsPerPage && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="text-sm text-slate-500">
                            صفحة <span className="font-bold text-slate-700">{currentPage}</span> من{' '}
                            <span className="font-bold text-slate-700">{totalPages}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* First Page */}
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-primary 
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronsRight className="w-5 h-5" />
                            </button>

                            {/* Previous */}
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-primary 
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let page: number;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all
                                                ${currentPage === page
                                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                                                    : 'text-slate-600 hover:bg-white hover:text-brand-primary'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next */}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-primary 
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Last Page */}
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-brand-primary 
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronsLeft className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <EmployeeForm
                    employee={selectedEmployee}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => handleSuccess(selectedEmployee ? 'تم تحديث بيانات الموظف بنجاح' : 'تم إضافة الموظف بنجاح')}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteDialogOpen}
                title="حذف موظف"
                message="هل أنت متأكد من حذف هذا الموظف نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف الموظف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteDialogOpen(false)}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default EmployeeList;