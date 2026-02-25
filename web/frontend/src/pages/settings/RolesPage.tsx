import React, { useEffect, useState, useMemo } from 'react';
import {
    Shield, Search, Plus, Edit2, Trash2, X, Save, RefreshCw,
    CheckCircle2, XCircle, LayoutGrid, ChevronDown, ChevronUp,
    Tag, Type, FileText, Users, Key, Lock, DollarSign
} from 'lucide-react';
import { roleService, type RoleDto, type PermissionDto } from '../../services/roleService';
import { approvalLimitService, type ApprovalLimitDto } from '../../services/approvalLimitService';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';

function getApiErrorMessage(error: any, fallback: string): string {
    const data = error.response?.data;
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    const msg = data.message ?? data.error ?? data.msg ?? (Array.isArray(data.errors) ? data.errors[0] : null);
    const text = typeof msg === 'string' ? msg : fallback;
    return text;
}

/** Use when deleting a role: if API returns the generic "related data" message, show the role-specific one */
const ROLE_DELETE_FALLBACK = 'لا يمكن حذف الدور لأنه مرتبط بمستخدمين. قم بتغيير دور المستخدمين أولاً.';

/** تسميات أنشطة حدود الموافقة */
const ACTIVITY_LABELS: Record<string, string> = {
    PO_APPROVAL: 'موافقة على المشتريات',
    PAYMENT_APPROVAL: 'اعتماد صرف فواتير الموردين',
    SALES_DISCOUNT: 'خصم المبيعات',
};
function getRoleDeleteErrorMessage(error: any): string {
    const msg = getApiErrorMessage(error, ROLE_DELETE_FALLBACK);
    if (msg.includes('التصنيف') || msg.includes('وحدة القياس') || msg.includes('البيانات المرتبطة غير صحيحة')) {
        return ROLE_DELETE_FALLBACK;
    }
    return msg;
}

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

// Role Card Skeleton
const RoleCardSkeleton: React.FC = () => (
    <>
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 animate-pulse">
                <div className="p-6 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-24 bg-slate-200 rounded-xl" />
                        <div className="h-6 w-16 bg-slate-100 rounded-full" />
                    </div>
                    <div className="h-6 w-40 bg-slate-200 rounded mb-2" />
                    <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
                    <div className="h-10 w-full bg-slate-100 rounded" />
                </div>
                <div className="p-4 bg-slate-50/50 flex justify-between">
                    <div className="h-9 w-32 bg-slate-200 rounded-lg" />
                    <div className="flex gap-2">
                        <div className="h-9 w-9 bg-slate-100 rounded-lg" />
                        <div className="h-9 w-9 bg-slate-100 rounded-lg" />
                    </div>
                </div>
            </div>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string; onAdd: () => void }> = ({ searchTerm, onAdd }) => (
    <div className="col-span-full py-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
            {searchTerm ? (
                <Search className="w-12 h-12 text-slate-400" />
            ) : (
                <Shield className="w-12 h-12 text-slate-400" />
            )}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
            {searchTerm ? 'لا توجد نتائج' : 'لا توجد أدوار'}
        </h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {searchTerm
                ? `لم يتم العثور على أدوار تطابق "${searchTerm}"`
                : 'ابدأ بإضافة أدوار لتحديد صلاحيات المستخدمين'}
        </p>
        {!searchTerm && (
            <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white 
                    rounded-xl font-medium hover:bg-brand-primary/90 transition-colors
                    shadow-lg shadow-brand-primary/30"
            >
                <Plus className="w-5 h-5" />
                إضافة دور جديد
            </button>
        )}
    </div>
);

// Form Input Component
const FormInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    required?: boolean;
    dir?: string;
    type?: string;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, dir, type = 'text' }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-200
                        ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    required={required}
                    dir={dir}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
            </div>
        </div>
    );
};

// Form Textarea Component
const FormTextarea: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    rows?: number;
}> = ({ label, value, onChange, icon: Icon, placeholder, rows = 3 }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-4 w-5 h-5 transition-all duration-200
                        ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none resize-none
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
            </div>
        </div>
    );
};

// Toggle Switch Component
const ToggleSwitch: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200
        cursor-pointer hover:bg-slate-100 transition-colors group">
        <span className={`font-semibold transition-colors ${checked ? 'text-brand-primary' : 'text-slate-600'}`}>
            {label}
        </span>
        <div
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200
                ${checked ? 'bg-brand-primary' : 'bg-slate-300'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200
                ${checked ? 'right-1' : 'left-1'}`} />
        </div>
    </label>
);

// Modal Component
const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    size?: 'default' | 'large' | 'xlarge';
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, subtitle, size = 'default', children }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        default: 'max-w-lg',
        large: 'max-w-4xl',
        xlarge: 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]}
                    transform transition-all animate-in fade-in zoom-in-95 duration-200
                    max-h-[90vh] flex flex-col`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-xl">
                                <Shield className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                                rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Role Card Component
const RoleCard: React.FC<{
    role: RoleDto;
    onEdit: () => void;
    onDelete: () => void;
    onManagePerms: () => void;
    index: number;
}> = ({ role, onEdit, onDelete, onManagePerms, index }) => (
    <div
        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group overflow-hidden"
        style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.4s ease-out forwards'
        }}
    >
        <div className="p-6 border-b border-slate-50">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-xl text-brand-primary font-bold font-mono text-sm
                    group-hover:scale-110 transition-transform duration-300">
                    {role.roleCode}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border
                    ${role.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {role.isActive ? (
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
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-brand-primary transition-colors">
                {role.roleNameAr} ({role.roleCode})
            </h3>
            <div className="text-sm text-slate-500 mb-4" dir="ltr">
                {role.roleNameEn || '---'}
            </div>
            <p className="text-slate-600 text-sm h-12 line-clamp-2">
                {role.description || 'لا يوجد وصف لهذا الدور'}
            </p>
        </div>
        <div className="p-4 bg-slate-50/50 flex items-center justify-between">
            <button
                onClick={onManagePerms}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 
                    text-slate-700 rounded-xl text-sm font-semibold
                    hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 
                    transition-all duration-200"
            >
                <Key className="w-4 h-4" />
                <span>الصلاحيات</span>
                <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full text-xs">
                    {role.permissionIds?.length || 0}
                </span>
            </button>
            <div className="flex gap-1">
                <button
                    onClick={onEdit}
                    className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                        rounded-xl transition-all duration-200"
                    title="تعديل"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                        rounded-xl transition-all duration-200"
                    title="حذف"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

/** تسميات أقسام القائمة الجانبية (صلاحيات MENU_*) للعرض في صفحة الأدوار */
const MENU_SECTION_LABELS: Record<string, string> = {
    MAIN: 'الرئيسية',
    HR: 'الموارد البشرية',
    PROCUREMENT: 'قسم المشتريات',
    SALES: 'قسم المبيعات',
    CRM: 'إدارة العملاء',
    FINANCE: 'المالية',
    WAREHOUSE: 'قسم المخازن',
    OPERATIONS: 'العمليات',
    SYSTEM: 'النظام',
};
const MENU_SECTION_ORDER = ['MAIN', 'HR', 'PROCUREMENT', 'SALES', 'CRM', 'FINANCE', 'WAREHOUSE', 'OPERATIONS', 'SYSTEM'];

// Permission Matrix Component
const PermissionMatrix: React.FC<{
    permissions: PermissionDto[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
}> = ({ permissions, selectedIds, onChange }) => {
    const grouped = useMemo(() => {
        return permissions.reduce((acc, perm) => {
            let groupKey: string;
            if (perm.permissionCode.startsWith('MENU_')) {
                const part = perm.permissionCode.split('_')[1];
                groupKey = MENU_SECTION_LABELS[part] || `قائمة (${part})`;
            } else {
                groupKey = perm.moduleName || 'Other';
            }
            if (!acc[groupKey]) acc[groupKey] = [];
            if (!acc[groupKey].some(p => p.permissionId === perm.permissionId)) acc[groupKey].push(perm);
            return acc;
        }, {} as Record<string, PermissionDto[]>);
    }, [permissions]);

    const sortedGroupEntries = useMemo(() => {
        const entries = Object.entries(grouped);
        const menuGroups = MENU_SECTION_ORDER
            .map(s => MENU_SECTION_LABELS[s])
            .filter(label => grouped[label])
            .map(label => [label, grouped[label]] as [string, PermissionDto[]]);
        const otherGroups = entries.filter(([k]) => !MENU_SECTION_ORDER.some(s => MENU_SECTION_LABELS[s] === k));
        return [...menuGroups, ...otherGroups];
    }, [grouped]);

    const togglePermission = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(pid => pid !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const toggleModule = (modulePermissions: PermissionDto[]) => {
        const moduleIds = modulePermissions.map(p => p.permissionId);
        const allSelected = moduleIds.every(id => selectedIds.includes(id));

        if (allSelected) {
            onChange(selectedIds.filter(id => !moduleIds.includes(id)));
        } else {
            const newIds = [...selectedIds];
            moduleIds.forEach(id => {
                if (!newIds.includes(id)) newIds.push(id);
            });
            onChange(newIds);
        }
    };

    const selectAll = () => {
        onChange(permissions.map(p => p.permissionId));
    };

    const deselectAll = () => {
        onChange([]);
    };

    return (
        <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4" />
                    <span>تم تحديد <strong className="text-brand-primary">{selectedIds.length}</strong> من <strong>{permissions.length}</strong> صلاحية</span>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={selectAll}
                        className="px-3 py-1.5 text-xs font-semibold text-brand-primary bg-brand-primary/10 
                            rounded-lg hover:bg-brand-primary/20 transition-colors"
                    >
                        تحديد الكل
                    </button>
                    <button
                        type="button"
                        onClick={deselectAll}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 
                            rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        إلغاء الكل
                    </button>
                </div>
            </div>

            {/* Modules — عناصر القائمة الجانبية (الرئيسية، المشتريات، …) ثم بقية الصلاحيات */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {sortedGroupEntries.map(([module, perms]) => {
                    const moduleIds = perms.map(p => p.permissionId);
                    const allSelected = moduleIds.every(id => selectedIds.includes(id));
                    const someSelected = !allSelected && moduleIds.some(id => selectedIds.includes(id));

                    return (
                        <div key={module} className="bg-white rounded-xl border border-slate-200 overflow-hidden
                            hover:border-brand-primary/30 transition-colors">
                            <div className="bg-gradient-to-l from-slate-50 to-white p-4 flex items-center justify-between border-b border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => toggleModule(perms)}
                                    className="flex items-center gap-3 font-bold text-slate-700 hover:text-brand-primary transition-colors"
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                        ${allSelected
                                            ? 'bg-brand-primary border-brand-primary text-white'
                                            : someSelected
                                                ? 'border-brand-primary bg-brand-primary/20'
                                                : 'border-slate-300 bg-white'}`}>
                                        {allSelected && <CheckCircle2 className="w-4 h-4" />}
                                        {someSelected && !allSelected && <div className="w-2 h-2 bg-brand-primary rounded-sm" />}
                                    </div>
                                    <LayoutGrid className="w-5 h-5 text-brand-primary" />
                                    <span>{module}</span>
                                </button>
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold
                                    ${allSelected
                                        ? 'bg-brand-primary/10 text-brand-primary'
                                        : 'bg-slate-100 text-slate-500'}`}>
                                    {perms.filter(p => selectedIds.includes(p.permissionId)).length} / {perms.length}
                                </span>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {perms.map(perm => {
                                    const isSelected = selectedIds.includes(perm.permissionId);
                                    return (
                                        <div
                                            key={perm.permissionId}
                                            onClick={() => togglePermission(perm.permissionId)}
                                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                flex items-start gap-3 group
                                                ${isSelected
                                                    ? 'bg-brand-primary/5 border-brand-primary/40 shadow-sm'
                                                    : 'bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white'}`}
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all
                                                ${isSelected
                                                    ? 'bg-brand-primary border-brand-primary text-white scale-110'
                                                    : 'border-slate-300 bg-white group-hover:border-brand-primary/50'}`}>
                                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-semibold truncate transition-colors
                                                    ${isSelected ? 'text-brand-primary' : 'text-slate-800'}`}>
                                                    {perm.permissionNameAr}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">{perm.actionType}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const RolesPage: React.FC = () => {
    const [roles, setRoles] = useState<RoleDto[]>([]);
    const [permissions, setPermissions] = useState<PermissionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Permission Management
    const [showPermModal, setShowPermModal] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [currentRoleForPerms, setCurrentRoleForPerms] = useState<RoleDto | null>(null);
    const [isSavingPerms, setIsSavingPerms] = useState(false);

    // Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Approval Limits
    const [approvalLimits, setApprovalLimits] = useState<ApprovalLimitDto[]>([]);
    const [limitsLoading, setLimitsLoading] = useState(false);
    const [limitsExpanded, setLimitsExpanded] = useState(true);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [editingLimit, setEditingLimit] = useState<ApprovalLimitDto | null>(null);
    const [limitForm, setLimitForm] = useState<{ minAmount?: number; maxAmount?: number | null; minPercentage?: number; maxPercentage?: number | null; isActive: boolean }>({ isActive: true });
    const [isSavingLimit, setIsSavingLimit] = useState(false);

    const [formData, setFormData] = useState<RoleDto>({
        roleCode: '',
        roleNameAr: '',
        roleNameEn: '',
        description: '',
        isActive: true,
        permissionIds: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                roleService.getAllRoles(),
                roleService.getAllPermissions()
            ]);
            const rawRoles = rolesRes.data || [];
            const rawPerms = permsRes.data || [];
            setRoles(rawRoles.filter((r, i, a) => a.findIndex(x => x.roleId === r.roleId) === i));
            setPermissions(rawPerms.filter((p, i, a) => a.findIndex(x => x.permissionId === p.permissionId) === i));
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('فشل في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const fetchApprovalLimits = async () => {
        try {
            setLimitsLoading(true);
            const res = await approvalLimitService.getAll();
            setApprovalLimits(res.data || []);
        } catch (error) {
            console.error('Error fetching approval limits:', error);
            toast.error('فشل في تحميل حدود الموافقة');
        } finally {
            setLimitsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovalLimits();
    }, []);

    const handleOpenLimitEdit = (limit: ApprovalLimitDto) => {
        setEditingLimit(limit);
        setLimitForm({
            minAmount: limit.minAmount ?? undefined,
            maxAmount: limit.maxAmount ?? undefined,
            minPercentage: limit.minPercentage ?? undefined,
            maxPercentage: limit.maxPercentage ?? undefined,
            isActive: limit.isActive ?? true,
        });
        setShowLimitModal(true);
    };

    const handleSaveLimit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLimit?.id) return;
        try {
            setIsSavingLimit(true);
            await approvalLimitService.update(editingLimit.id, {
                minAmount: limitForm.minAmount,
                maxAmount: limitForm.maxAmount ?? undefined,
                minPercentage: limitForm.minPercentage,
                maxPercentage: limitForm.maxPercentage ?? undefined,
                isActive: limitForm.isActive,
            });
            toast.success('تم تحديث حد الموافقة بنجاح');
            setShowLimitModal(false);
            setEditingLimit(null);
            fetchApprovalLimits();
        } catch (error: any) {
            toast.error(getApiErrorMessage(error, 'فشل تحديث حد الموافقة'));
        } finally {
            setIsSavingLimit(false);
        }
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const payload = {
                ...formData,
                roleCode: (formData.roleCode || '').trim(),
            };
            if (!payload.roleCode) {
                toast.error('كود الدور مطلوب');
                return;
            }
            if (editingRole?.roleId) {
                await roleService.updateRole(editingRole.roleId, payload);
                toast.success('تم تحديث الدور بنجاح', { icon: '🎉' });
            } else {
                await roleService.createRole(payload);
                toast.success('تم إضافة الدور بنجاح', { icon: '🎉' });
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error('Error saving role:', error);
            toast.error(getApiErrorMessage(error, 'فشل حفظ الدور'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenPerms = (role: RoleDto) => {
        setCurrentRoleForPerms(role);
        setSelectedPermissions(role.permissionIds || []);
        setShowPermModal(true);
    };

    const handleSavePerms = async () => {
        if (!currentRoleForPerms?.roleId) return;
        try {
            setIsSavingPerms(true);
            // إزالة التكرار وضمان أن القيم أعداد صحيحة (لتجنب 400 من الباكند)
            const uniquePerms = [...new Set(selectedPermissions)]
                .map(p => (typeof p === 'number' ? p : parseInt(String(p), 10)))
                .filter(n => !isNaN(n));
            await roleService.assignPermissions(currentRoleForPerms.roleId, uniquePerms);
            toast.success('تم تحديث الصلاحيات بنجاح', { icon: '🔐' });
            setShowPermModal(false);
            fetchData();
        } catch (error: any) {
            console.error('Error saving permissions:', error);
            toast.error(getApiErrorMessage(error, 'فشل حفظ الصلاحيات'));
        } finally {
            setIsSavingPerms(false);
        }
    };

    const handleDeleteClick = (roleId: number) => {
        setRoleToDelete(roleId);
        setDeleteError(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;
        setDeleteError(null);
        setIsDeleting(true);
        try {
            await roleService.deleteRole(roleToDelete);
            toast.success('تم حذف الدور بنجاح', { icon: '🗑️' });
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
            fetchData();
        } catch (error: any) {
            const msg = getRoleDeleteErrorMessage(error);
            setDeleteError(msg);
            toast.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setRoleToDelete(null);
        setDeleteError(null);
    };

    const resetForm = () => {
        setEditingRole(null);
        setFormData({
            roleCode: '',
            roleNameAr: '',
            roleNameEn: '',
            description: '',
            isActive: true,
            permissionIds: []
        });
    };

    const filteredRoles = useMemo(() => {
        const filtered = roles.filter(role =>
            role.roleNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.roleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (role.roleNameEn && role.roleNameEn.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => (b.roleId ?? 0) - (a.roleId ?? 0));
    }, [roles, searchTerm]);

    const stats = useMemo(() => ({
        total: roles.length,
        active: roles.filter(r => r.isActive).length,
        totalPerms: permissions.length,
        avgPerms: roles.length > 0
            ? Math.round(roles.reduce((sum, r) => sum + (r.permissionIds?.length || 0), 0) / roles.length)
            : 0,
    }), [roles, permissions]);

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

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Shield className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">الأدوار والصلاحيات</h1>
                            <p className="text-white/70 text-lg">إدارة الأدوار الوظيفية وصلاحيات المستخدمين</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary 
                            rounded-xl font-bold hover:bg-white/90 transition-all duration-300
                            shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة دور جديد</span>
                    </button>
                </div>
            </div>

            {/* مرجع سريع */}
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                الأدوار تحكم ظهور القوائم في الشريط الجانبي وحدود الاعتماد المالية. الصلاحيات تُدار من الجدول أدناه ومن مصفوفة الحدود — انظر توثيق الصلاحيات للمزيد.
            </p>

            {/* مصفوفة حدود الموافقة */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setLimitsExpanded(!limitsExpanded)}
                            className="flex items-center gap-3 flex-1 text-right hover:opacity-80 transition-opacity"
                        >
                            <div className="p-3 bg-brand-primary/10 rounded-xl">
                                <DollarSign className="w-6 h-6 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">مصفوفة حدود الموافقة</h3>
                                <p className="text-sm text-slate-500">حدود الاعتماد المالية لكل دور (أوامر الشراء، اعتماد الدفع، خصم المبيعات)</p>
                            </div>
                            {limitsExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchApprovalLimits} disabled={limitsLoading} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50" title="تحديث">
                                <RefreshCw className={`w-5 h-5 ${limitsLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button onClick={() => setLimitsExpanded(!limitsExpanded)} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" title={limitsExpanded ? 'تصغير' : 'تكبير'}>
                                {limitsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
                {limitsExpanded && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <th className="px-6 py-3 text-right font-semibold">النشاط</th>
                                <th className="px-6 py-3 text-right font-semibold">الدور</th>
                                <th className="px-6 py-3 text-center font-semibold">الحد الأدنى</th>
                                <th className="px-6 py-3 text-center font-semibold">الحد الأقصى</th>
                                <th className="px-6 py-3 text-center font-semibold">نشط</th>
                                <th className="px-6 py-3 text-center font-semibold">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {limitsLoading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">جاري التحميل...</td></tr>
                            ) : approvalLimits.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">لا توجد حدود موافقة معرّفة</td></tr>
                            ) : (
                                approvalLimits.map((limit) => {
                                    const isPercent = limit.activityType === 'SALES_DISCOUNT';
                                    const minVal = isPercent ? (limit.minPercentage ?? 0) : (limit.minAmount ?? 0);
                                    const maxVal = isPercent ? (limit.maxPercentage ?? null) : (limit.maxAmount ?? null);
                                    const suffix = isPercent ? '%' : '';
                                    return (
                                        <tr key={limit.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-medium text-slate-700">{ACTIVITY_LABELS[limit.activityType] || limit.activityType}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-brand-primary font-semibold">{limit.roleCode}</span>
                                                <span className="text-slate-500 mr-1"> — {limit.roleNameAr}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-slate-700">{minVal}{suffix}</td>
                                            <td className="px-6 py-4 text-center font-bold text-slate-700">{maxVal != null ? `${maxVal}${suffix}` : 'بلا حد'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${limit.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {limit.isActive ? 'نشط' : 'معطل'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleOpenLimitEdit(limit)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all" title="تعديل">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Shield}
                    value={stats.total}
                    label="إجمالي الأدوار"
                    color="primary"
                />
                <StatCard
                    icon={CheckCircle2}
                    value={stats.active}
                    label="دور نشط"
                    color="success"
                />
                <StatCard
                    icon={Key}
                    value={stats.totalPerms}
                    label="إجمالي الصلاحيات"
                    color="purple"
                />
                <StatCard
                    icon={Users}
                    value={stats.avgPerms}
                    label="متوسط الصلاحيات/دور"
                    color="warning"
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
                            placeholder="بحث في الأدوار..."
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
                        onClick={fetchData}
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
                        عرض <span className="font-bold text-slate-800">{filteredRoles.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{roles.length}</span> دور
                    </span>
                </div>
            )}

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <RoleCardSkeleton />
                ) : filteredRoles.length > 0 ? (
                    filteredRoles.map((role, index) => (
                        <RoleCard
                            key={role.roleId ?? `role-${index}`}
                            role={role}
                            onEdit={() => {
                                setEditingRole(role);
                                setFormData(role);
                                setShowModal(true);
                            }}
                            onDelete={() => role.roleId && handleDeleteClick(role.roleId)}
                            onManagePerms={() => handleOpenPerms(role)}
                            index={index}
                        />
                    ))
                ) : (
                    <EmptyState
                        searchTerm={searchTerm}
                        onAdd={() => { resetForm(); setShowModal(true); }}
                    />
                )}
            </div>

            {/* Add/Edit Role Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}
            >
                <form onSubmit={handleSaveRole} className="p-6 space-y-6">
                    <FormInput
                        label="الكود"
                        value={formData.roleCode}
                        onChange={(v) => setFormData({ ...formData, roleCode: v })}
                        icon={Tag}
                        placeholder="ADMIN"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="الاسم العربي"
                            value={formData.roleNameAr}
                            onChange={(v) => setFormData({ ...formData, roleNameAr: v })}
                            icon={Type}
                            placeholder="مدير النظام"
                            required
                        />
                        <FormInput
                            label="الاسم الإنجليزي"
                            value={formData.roleNameEn || ''}
                            onChange={(v) => setFormData({ ...formData, roleNameEn: v })}
                            icon={Type}
                            placeholder="System Admin"
                            dir="ltr"
                        />
                    </div>

                    <FormTextarea
                        label="الوصف"
                        value={formData.description || ''}
                        onChange={(v) => setFormData({ ...formData, description: v })}
                        icon={FileText}
                        placeholder="وصف الدور والمسؤوليات..."
                        rows={3}
                    />

                    <ToggleSwitch
                        label="دور نشط"
                        checked={formData.isActive || false}
                        onChange={(v) => setFormData({ ...formData, isActive: v })}
                    />

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 
                                rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 bg-brand-primary text-white hover:bg-brand-primary/90 
                                rounded-xl transition-colors font-bold flex items-center justify-center gap-2 
                                shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {editingRole ? 'حفظ التعديلات' : 'إضافة الدور'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Permissions Modal */}
            <Modal
                isOpen={showPermModal}
                onClose={() => setShowPermModal(false)}
                title="إدارة الصلاحيات"
                subtitle={currentRoleForPerms ? `تعديل صلاحيات الدور: ${currentRoleForPerms.roleNameAr} (${currentRoleForPerms.roleCode})` : undefined}
                size="large"
            >
                <div className="p-6">
                    {/* تفاصيل الدور */}
                    {currentRoleForPerms && (
                        <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-brand-primary" />
                                تفاصيل الدور
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">الكود</p>
                                    <p className="text-sm font-bold text-slate-800 font-mono">{currentRoleForPerms.roleCode}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">الاسم العربي</p>
                                    <p className="text-sm font-bold text-slate-800">{currentRoleForPerms.roleNameAr}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">الاسم الإنجليزي</p>
                                    <p className="text-sm text-slate-700" dir="ltr">{currentRoleForPerms.roleNameEn || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">الحالة</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${currentRoleForPerms.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {currentRoleForPerms.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {currentRoleForPerms.isActive ? 'نشط' : 'معطل'}
                                    </span>
                                </div>
                            </div>
                            {currentRoleForPerms.description && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-xs text-slate-500 mb-1">الوصف</p>
                                    <p className="text-sm text-slate-700">{currentRoleForPerms.description}</p>
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-sm text-slate-600">
                                <Key className="w-4 h-4 text-brand-primary" />
                                <span>الصلاحيات المحددة: <strong className="text-brand-primary">{selectedPermissions.length}</strong> من <strong>{permissions.length}</strong></span>
                            </div>
                        </div>
                    )}

                    <PermissionMatrix
                        permissions={permissions}
                        selectedIds={selectedPermissions}
                        onChange={setSelectedPermissions}
                    />
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        onClick={() => setShowPermModal(false)}
                        className="px-6 py-2.5 border border-slate-200 text-slate-600 font-semibold 
                            rounded-xl hover:bg-white transition-colors flex items-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        إلغاء
                    </button>
                    <button
                        onClick={handleSavePerms}
                        disabled={isSavingPerms}
                        className="px-8 py-2.5 bg-brand-primary text-white font-bold rounded-xl 
                            hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 
                            flex items-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {isSavingPerms ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        حفظ التغييرات
                    </button>
                </div>
            </Modal>

            {/* Edit Approval Limit Modal */}
            <Modal isOpen={showLimitModal} onClose={() => { setShowLimitModal(false); setEditingLimit(null); }} title="تعديل حد الموافقة" subtitle={editingLimit ? `${ACTIVITY_LABELS[editingLimit.activityType] || editingLimit.activityType} — ${editingLimit.roleNameAr}` : undefined}>
                {editingLimit && (
                    <form onSubmit={handleSaveLimit} className="p-6 space-y-6">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-600">النشاط: <strong>{ACTIVITY_LABELS[editingLimit.activityType] || editingLimit.activityType}</strong></p>
                            <p className="text-sm text-slate-600">الدور: <strong>{editingLimit.roleNameAr} ({editingLimit.roleCode})</strong></p>
                        </div>
                        {editingLimit.activityType === 'SALES_DISCOUNT' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">الحد الأدنى (%)</label>
                                    <input type="number" step="0.01" value={limitForm.minPercentage ?? ''} onChange={(e) => setLimitForm({ ...limitForm, minPercentage: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">الحد الأقصى (%) — اترك فارغاً لـ «بلا حد»</label>
                                    <input type="number" step="0.01" value={limitForm.maxPercentage ?? ''} onChange={(e) => setLimitForm({ ...limitForm, maxPercentage: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" placeholder="بلا حد" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">الحد الأدنى</label>
                                    <input type="number" step="0.01" value={limitForm.minAmount ?? ''} onChange={(e) => setLimitForm({ ...limitForm, minAmount: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">الحد الأقصى — اترك فارغاً لـ «بلا حد»</label>
                                    <input type="number" step="0.01" value={limitForm.maxAmount ?? ''} onChange={(e) => setLimitForm({ ...limitForm, maxAmount: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" placeholder="بلا حد" />
                                </div>
                            </div>
                        )}
                        <ToggleSwitch label="نشط" checked={limitForm.isActive} onChange={(v) => setLimitForm({ ...limitForm, isActive: v })} />
                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => { setShowLimitModal(false); setEditingLimit(null); }} className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium flex items-center justify-center gap-2">
                                <X className="w-5 h-5" /> إلغاء
                            </button>
                            <button type="submit" disabled={isSavingLimit} className="flex-1 px-4 py-3 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isSavingLimit ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} حفظ التعديلات
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف دور"
                message="هل أنت متأكد من حذف هذا الدور؟ سيتم إزالة جميع الصلاحيات المرتبطة به. إذا كان الدور مستخدماً في حدود الموافقة أو سير العمل، سيتم رفض الحذف."
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteModalClose}
                isLoading={isDeleting}
                variant="danger"
                errorMessage={deleteError}
            />
        </div>
    );
};

export default RolesPage;