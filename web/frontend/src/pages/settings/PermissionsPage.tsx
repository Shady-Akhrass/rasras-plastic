import React, { useEffect, useState, useMemo } from 'react';
import {
    Shield, Search, RefreshCw, Layers, Key, Eye, Plus as PlusIcon,
    Edit3, Trash2, CheckCircle, XCircle, Lock
} from 'lucide-react';
import { roleService, type PermissionDto } from '../../services/roleService';
import { toast } from 'react-hot-toast';

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

// Action Type Badge Component
const ActionTypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const config: Record<string, { icon: React.ElementType; className: string }> = {
        'View': {
            icon: Eye,
            className: 'bg-blue-50 text-blue-700 border-blue-200'
        },
        'Create': {
            icon: PlusIcon,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        'Edit': {
            icon: Edit3,
            className: 'bg-amber-50 text-amber-700 border-amber-200'
        },
        'Delete': {
            icon: Trash2,
            className: 'bg-rose-50 text-rose-700 border-rose-200'
        },
        'Approve': {
            icon: CheckCircle,
            className: 'bg-purple-50 text-purple-700 border-purple-200'
        },
    };

    const { icon: Icon, className } = config[type] || {
        icon: Key,
        className: 'bg-slate-100 text-slate-600 border-slate-200'
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${className}`}>
            <Icon className="w-3 h-3" />
            {type}
        </span>
    );
};

// Permission Card Component
const PermissionCard: React.FC<{
    permission: PermissionDto;
    index: number;
}> = ({ permission, index }) => (
    <div
        className="p-4 rounded-xl border border-slate-100 hover:border-brand-primary/30 
            hover:bg-brand-primary/5 transition-all duration-200 group"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Key className="w-4 h-4 text-brand-primary" />
                </div>
                <span className="font-semibold text-slate-800 text-sm group-hover:text-brand-primary transition-colors">
                    {permission.permissionNameAr}
                </span>
            </div>
            <ActionTypeBadge type={permission.actionType || 'Other'} />
        </div>
        <div className="mr-10 space-y-1">
            <div className="text-xs text-brand-primary/70 font-mono bg-brand-primary/10 px-2 py-1 rounded inline-block">
                {permission.permissionCode}
            </div>
            {permission.permissionNameEn && (
                <div className="text-xs text-slate-400" dir="ltr">
                    {permission.permissionNameEn}
                </div>
            )}
        </div>
    </div>
);

// Module Card Component
const ModuleCard: React.FC<{
    module: string;
    permissions: PermissionDto[];
    index: number;
}> = ({ module, permissions, index }) => (
    <div
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden
            hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300"
        style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.4s ease-out forwards'
        }}
    >
        <div className="bg-gradient-to-l from-brand-primary/5 to-white px-6 py-4 border-b border-slate-100 
            flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
                <Layers className="w-4 h-4 text-brand-primary" />
            </div>
            <h3 className="font-bold text-slate-700">{module}</h3>
            <span className="mr-auto bg-brand-primary/10 text-brand-primary text-xs px-3 py-1 rounded-full font-semibold">
                {permissions.length} صلاحية
            </span>
        </div>
        <div className="p-4 space-y-3">
            {permissions.map((perm, idx) => (
                <PermissionCard key={perm.permissionId} permission={perm} index={idx} />
            ))}
        </div>
    </div>
);

// Loading Skeleton
const ModuleSkeleton: React.FC = () => (
    <>
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 animate-pulse overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                    <div className="h-5 w-24 bg-slate-200 rounded" />
                    <div className="mr-auto h-6 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="p-4 space-y-3">
                    {[1, 2, 3].map(j => (
                        <div key={j} className="p-4 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                                    <div className="h-4 w-32 bg-slate-200 rounded" />
                                </div>
                                <div className="h-5 w-16 bg-slate-100 rounded" />
                            </div>
                            <div className="mr-10 space-y-1">
                                <div className="h-5 w-24 bg-slate-100 rounded" />
                                <div className="h-3 w-20 bg-slate-50 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <div className="col-span-full py-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
            {searchTerm ? (
                <Search className="w-12 h-12 text-slate-400" />
            ) : (
                <Shield className="w-12 h-12 text-slate-400" />
            )}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
            {searchTerm ? 'لا توجد نتائج' : 'لا توجد صلاحيات'}
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
            {searchTerm
                ? `لم يتم العثور على صلاحيات تطابق "${searchTerm}"`
                : 'لم يتم تعريف أي صلاحيات في النظام بعد'}
        </p>
    </div>
);

const PermissionsPage: React.FC = () => {
    const [permissions, setPermissions] = useState<PermissionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const response = await roleService.getAllPermissions();
            setPermissions(response.data || []);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            toast.error('فشل في تحميل الصلاحيات');
        } finally {
            setLoading(false);
        }
    };

    const filteredPermissions = useMemo(() => {
        const filtered = permissions.filter(perm =>
            perm.permissionNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perm.permissionNameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perm.permissionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perm.moduleName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => b.permissionId - a.permissionId);
    }, [permissions, searchTerm]);

    const groupedPermissions = useMemo(() => {
        return filteredPermissions.reduce((acc, perm) => {
            const module = perm.moduleName || 'Other';
            if (!acc[module]) acc[module] = [];
            acc[module].push(perm);
            return acc;
        }, {} as Record<string, PermissionDto[]>);
    }, [filteredPermissions]);

    const stats = useMemo(() => ({
        total: permissions.length,
        modules: Object.keys(groupedPermissions).length,
        view: permissions.filter(p => p.actionType === 'View').length,
        create: permissions.filter(p => p.actionType === 'Create').length,
        edit: permissions.filter(p => p.actionType === 'Edit').length,
        delete: permissions.filter(p => p.actionType === 'Delete').length,
    }), [permissions, groupedPermissions]);

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

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Shield className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">صلاحيات النظام</h1>
                            <p className="text-white/70 text-lg">استعراض كافة الصلاحيات المعرفة في النظام</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                        <Lock className="w-5 h-5 text-white/70" />
                        <div className="text-right">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-white/70 text-sm">إجمالي الصلاحيات</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                    icon={Layers}
                    value={stats.modules}
                    label="الوحدات"
                    color="primary"
                />
                <StatCard
                    icon={Eye}
                    value={stats.view}
                    label="عرض"
                    color="blue"
                />
                <StatCard
                    icon={PlusIcon}
                    value={stats.create}
                    label="إنشاء"
                    color="success"
                />
                <StatCard
                    icon={Edit3}
                    value={stats.edit}
                    label="تعديل"
                    color="warning"
                />
                <StatCard
                    icon={Trash2}
                    value={stats.delete}
                    label="حذف"
                    color="rose"
                />
                <StatCard
                    icon={CheckCircle}
                    value={permissions.filter(p => p.actionType === 'Approve').length}
                    label="اعتماد"
                    color="purple"
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
                            placeholder="بحث بالكود، الاسم، أو الوحدة..."
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

                    <button
                        onClick={fetchPermissions}
                        disabled={loading}
                        className="p-3 rounded-xl border border-slate-200 text-slate-600 
                            hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                            disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredPermissions.length}</span> صلاحية في{' '}
                        <span className="font-bold text-slate-800">{Object.keys(groupedPermissions).length}</span> وحدة
                    </span>
                </div>
            )}

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <ModuleSkeleton />
                ) : Object.keys(groupedPermissions).length > 0 ? (
                    Object.entries(groupedPermissions).map(([module, perms], index) => (
                        <ModuleCard
                            key={module}
                            module={module}
                            permissions={perms}
                            index={index}
                        />
                    ))
                ) : (
                    <EmptyState searchTerm={searchTerm} />
                )}
            </div>
        </div>
    );
};

export default PermissionsPage;