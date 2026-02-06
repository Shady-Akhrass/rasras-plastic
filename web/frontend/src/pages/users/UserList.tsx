import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Edit2, Users, UserCheck,
    UserX, Lock, RefreshCw, Clock, CheckCircle2, XCircle,
    TrendingUp, Trash2, Shield, LayoutGrid, LayoutList
} from 'lucide-react';
import type { User } from '../../services/userService';
import userService from '../../services/userService';
import UserForm from './UserForm';
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

// User Card Component
const UserCard: React.FC<{
    user: User;
    onEdit: (user: User) => void;
    onDelete: (id: number) => void;
    index: number;
}> = ({ user, onEdit, onDelete, index }) => {

    const displayName = user.displayNameAr || user.username;
    const roleDisplay = user.roleNameAr || user.roleName;

    const getInitials = (name: string) => {
        return name.slice(0, 2).toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'from-brand-primary to-blue-400',
            'from-emerald-500 to-teal-400',
            'from-purple-500 to-indigo-400',
            'from-amber-500 to-orange-400',
            'from-rose-500 to-pink-400',
        ];
        const idx = name.charCodeAt(0) % colors.length;
        return colors[idx];
    };

    return (
        <div
            className="group relative bg-white rounded-2xl border border-slate-100 
                hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/10 
                transition-all duration-300 overflow-hidden"
            style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.4s ease-out forwards'
            }}
        >
            {/* Top Gradient Bar */}
            <div className={`h-1 w-full bg-gradient-to-r 
                ${user.isActive ? 'from-brand-primary to-blue-400' : 'from-slate-300 to-slate-200'}`} />

            {/* Card Content */}
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarColor(user.username)} 
                            flex items-center justify-center text-white font-bold text-lg shadow-lg
                            group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            {getInitials(displayName)}
                            {/* Online Indicator */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                                ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-primary 
                                transition-colors duration-300">
                                {displayName}
                            </h3>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-primary/10 
                                text-brand-primary text-xs font-semibold rounded-full">
                                <Shield className="w-3 h-3" />
                                {roleDisplay}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5
                        ${user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                        {user.isActive ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                نشط
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3.5 h-3.5" />
                                معطل
                            </>
                        )}
                    </span>
                    {user.isLocked && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5
                            bg-amber-50 text-amber-700 border border-amber-200">
                            <Lock className="w-3.5 h-3.5" />
                            مغلق
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>آخر دخول: </span>
                    <span className="text-slate-700 font-medium">
                        {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })
                            : 'لم يدخل بعد'}
                    </span>
                </div>

                {/* Action Buttons - Always Visible */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <button
                        onClick={() => onEdit(user)}
                        className="flex-1 py-2.5 px-3 bg-brand-primary/5 hover:bg-brand-primary 
                            text-brand-primary hover:text-white rounded-xl text-sm font-medium 
                            transition-all duration-300 flex items-center justify-center gap-2
                            border border-brand-primary/20 hover:border-brand-primary"
                    >
                        <Edit2 className="w-4 h-4" />
                        تعديل
                    </button>
                    <button
                        onClick={() => onDelete(user.userId)}
                        className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-500 
                            text-rose-600 hover:text-white rounded-xl text-sm font-medium 
                            transition-all duration-300 flex items-center justify-center gap-2
                            border border-rose-200 hover:border-rose-500"
                    >
                        <Trash2 className="w-4 h-4" />
                        حذف
                    </button>
                </div>
            </div>
        </div>
    );
};

// Table Row Component
const UserTableRow: React.FC<{
    user: User;
    onEdit: (user: User) => void;
    onDelete: (id: number) => void;
    index: number;
}> = ({ user, onEdit, onDelete, index }) => {
    const displayName = user.displayNameAr || user.username;
    const roleDisplay = user.roleNameAr || user.roleName;

    const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

    const getAvatarColor = (name: string) => {
        const colors = [
            'from-brand-primary to-blue-400',
            'from-emerald-500 to-teal-400',
            'from-purple-500 to-indigo-400',
            'from-amber-500 to-orange-400',
            'from-rose-500 to-pink-400',
        ];
        return colors[name.charCodeAt(0) % colors.length];
    };

    return (
        <tr
            className="group hover:bg-brand-primary/5 transition-colors duration-200"
            style={{
                animationDelay: `${index * 30}ms`,
                animation: 'fadeInUp 0.3s ease-out forwards'
            }}
        >
            {/* User Info */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(user.username)} 
                        flex items-center justify-center text-white font-bold text-sm shadow-md
                        group-hover:scale-110 transition-transform duration-300`}>
                        {getInitials(displayName)}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
                            ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">
                            {displayName}
                        </p>
                    </div>
                </div>
            </td>

            {/* Role */}
            <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 
                    text-brand-primary text-xs font-semibold rounded-full">
                    <Shield className="w-3 h-3" />
                    {roleDisplay}
                </span>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5
                        ${user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {user.isActive ? (
                            <>
                                <CheckCircle2 className="w-3 h-3" />
                                نشط
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3 h-3" />
                                معطل
                            </>
                        )}
                    </span>
                    {user.isLocked && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5
                            bg-amber-50 text-amber-700 border border-amber-200">
                            <Lock className="w-3 h-3" />
                            مغلق
                        </span>
                    )}
                </div>
            </td>

            {/* Last Login */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>
                        {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })
                            : 'لم يدخل بعد'}
                    </span>
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-brand-primary bg-brand-primary/10 hover:bg-brand-primary 
                            hover:text-white rounded-lg transition-all duration-200"
                        title="تعديل"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(user.userId)}
                        className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-500 
                            hover:text-white rounded-lg transition-all duration-200"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// Empty State Component
const EmptyState: React.FC<{ searchTerm: string; onAdd: () => void }> = ({ searchTerm, onAdd }) => (
    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-100">
        <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
            {searchTerm ? (
                <Search className="w-10 h-10 text-slate-400" />
            ) : (
                <Users className="w-10 h-10 text-slate-400" />
            )}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
            {searchTerm ? 'لا توجد نتائج' : 'لا يوجد مستخدمين'}
        </h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {searchTerm
                ? `لم يتم العثور على مستخدمين يطابقون "${searchTerm}"`
                : 'ابدأ بإضافة مستخدمين جدد للنظام لإدارة الصلاحيات والوصول'}
        </p>
        {!searchTerm && (
            <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white 
                    rounded-xl font-medium hover:bg-brand-primary/90 transition-colors
                    shadow-lg shadow-brand-primary/30"
            >
                <Plus className="w-5 h-5" />
                إضافة مستخدم جديد
            </button>
        )}
    </div>
);

// Loading Skeleton for Cards
const CardSkeleton: React.FC = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-1 w-full bg-slate-200" />
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-200" />
                        <div className="flex-1">
                            <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
                            <div className="h-4 w-20 bg-slate-100 rounded-full" />
                        </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <div className="h-6 w-16 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded mb-4" />
                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
                        <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
                    </div>
                </div>
            </div>
        ))}
    </>
);

// Loading Skeleton for Table
const TableSkeleton: React.FC = () => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                    </div>
                </td>
                <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-8 w-20 bg-slate-100 rounded-lg" /></td>
            </tr>
        ))}
    </>
);

const UserList: React.FC = () => {
    usePageTitle('إدارة المستخدمين');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await userService.getAll();
            setUsers(data.content);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccess = (msg: string) => {
        setSuccessMessage(msg);
        loadUsers();
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setUserToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await userService.delete(userToDelete);
            handleSuccess('تم حذف المستخدم بنجاح');
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        } catch (err) {
            alert('حدث خطأ أثناء الحذف');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filtered and computed data
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const displayName = user.displayNameAr || user.username;
            const roleDisplay = user.roleNameAr || user.roleName;
            const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                roleDisplay.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterStatus === 'all' ||
                (filterStatus === 'active' && user.isActive) ||
                (filterStatus === 'inactive' && !user.isActive);

            return matchesSearch && matchesFilter;
        });
    }, [users, searchTerm, filterStatus]);

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
        locked: users.filter(u => u.isLocked).length
    }), [users]);

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
                            <h1 className="text-3xl font-bold mb-2">إدارة المستخدمين</h1>
                            <p className="text-white/70 text-lg">التحكم في حسابات النظام وصلاحيات الوصول</p>
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary 
                            rounded-xl font-bold hover:bg-white/90 transition-all duration-300
                            shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إنشاء حساب مستخدم</span>
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
                    label="إجمالي المستخدمين"
                    color="primary"
                />
                <StatCard
                    icon={UserCheck}
                    value={stats.active}
                    label="مستخدم نشط"
                    trend={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : undefined}
                    color="success"
                />
                <StatCard
                    icon={UserX}
                    value={stats.inactive}
                    label="حساب معطل"
                    color="warning"
                />
                <StatCard
                    icon={Lock}
                    value={stats.locked}
                    label="حساب مغلق"
                    color="danger"
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
                            placeholder="بحث باسم المستخدم أو الدور..."
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

                    {/* Filter & View Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Status Filter */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                            {[
                                { value: 'all', label: 'الكل', icon: Users },
                                { value: 'active', label: 'نشط', icon: UserCheck },
                                { value: 'inactive', label: 'معطل', icon: UserX },
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

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`p-2 rounded-lg transition-all duration-200
                                    ${viewMode === 'cards'
                                        ? 'bg-white text-brand-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                title="عرض البطاقات"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg transition-all duration-200
                                    ${viewMode === 'table'
                                        ? 'bg-white text-brand-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                title="عرض الجدول"
                            >
                                <LayoutList className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => loadUsers()}
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
                                الحالة: {filterStatus === 'active' ? 'نشط' : 'معطل'}
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
                            عرض <span className="font-bold text-slate-800">{filteredUsers.length}</span> من{' '}
                            <span className="font-bold text-slate-800">{users.length}</span> مستخدم
                        </span>
                    </div>
                </div>
            )}

            {/* Content - Cards or Table View */}
            {viewMode === 'cards' ? (
                /* Cards View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <CardSkeleton />
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                            <UserCard
                                key={user.userId}
                                user={user}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                index={index}
                            />
                        ))
                    ) : (
                        <EmptyState searchTerm={searchTerm} onAdd={handleAdd} />
                    )}
                </div>
            ) : (
                /* Table View */
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">المستخدم</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الدور</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحالة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">آخر دخول</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <TableSkeleton />
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, index) => (
                                        <UserTableRow
                                            key={user.userId}
                                            user={user}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                            index={index}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16">
                                            <EmptyState searchTerm={searchTerm} onAdd={handleAdd} />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <UserForm
                    user={selectedUser}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => handleSuccess(selectedUser ? 'تم تحديث بيانات المستخدم بنجاح' : 'تم إنشاء حساب المستخدم بنجاح')}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteDialogOpen}
                title="حذف مستخدم"
                message="هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف المستخدم"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteDialogOpen(false)}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default UserList;