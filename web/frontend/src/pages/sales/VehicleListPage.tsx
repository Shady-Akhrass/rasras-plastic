import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Truck,
    CheckCircle2,
    Clock,
    RefreshCw,
    Trash2,
    Edit,
    X,
    User
} from 'lucide-react';
import { vehicleService, type VehicleDto } from '../../services/vehicleService';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: string | number;
    label: string;
    color: 'indigo' | 'success' | 'warning' | 'purple' | 'blue' | 'rose';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        indigo: 'bg-indigo-100 text-indigo-600',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        rose: 'bg-rose-100 text-rose-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-indigo-200 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// Status Badge Component
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
            isActive
                ? 'bg-emerald-500/20 text-emerald-600 border-emerald-300/30'
                : 'bg-amber-500/20 text-amber-600 border-amber-300/30'
        }`}>
            {isActive ? (
                <>
                    <CheckCircle2 className="w-3 h-3" />
                    نشط
                </>
            ) : (
                <>
                    <Clock className="w-3 h-3" />
                    غير نشط
                </>
            )}
        </span>
    );
};

const VehicleListPage: React.FC = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<VehicleDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehicleService.getAll();
            setVehicles(data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            toast.error('فشل تحميل المركبات');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (vehicle: VehicleDto) => {
        setVehicleToDelete(vehicle);
        setIsDeleteModalOpen(true);
    };

    const handleToggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAllPage = () => {
        const pageIds = paginatedVehicles.map(v => v.id!).filter(Boolean);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) {
            toast.error('يرجى اختيار مركبات أولاً');
            return;
        }
        setVehicleToDelete(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const idsToDelete = vehicleToDelete?.id ? [vehicleToDelete.id] : selectedIds;
        if (!idsToDelete.length) return;
        setIsDeleting(true);
        try {
            for (const id of idsToDelete) {
                await vehicleService.delete(id);
            }
            toast.success(idsToDelete.length === 1 ? 'تم حذف المركبة بنجاح' : 'تم حذف المركبات بنجاح');
            fetchVehicles();
            setIsDeleteModalOpen(false);
            setVehicleToDelete(null);
            setSelectedIds([]);
        } catch (error: any) {
            const apiMessage = error?.response?.data?.message as string | undefined;
            toast.error(apiMessage || 'فشل حذف المركبة');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredVehicles = useMemo(() => {
        const filtered = vehicles.filter(v => {
            const matchesSearch =
                v.vehicleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.driverName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || 
                (statusFilter === 'Active' && v.isActive) ||
                (statusFilter === 'Inactive' && !v.isActive);
            return matchesSearch && matchesStatus;
        });
        return [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [vehicles, searchTerm, statusFilter]);

    const paginatedVehicles = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredVehicles.slice(start, start + pageSize);
    }, [filteredVehicles, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const stats = useMemo(() => {
        const total = vehicles.length;
        const active = vehicles.filter(v => v.isActive).length;
        const inactive = vehicles.filter(v => !v.isActive).length;
        return { total, active, inactive };
    }, [vehicles]);

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
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
                            <h1 className="text-3xl font-bold mb-2">المركبات</h1>
                            <p className="text-white/70 text-lg">إدارة مركبات التوصيل</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/sales/vehicles/new')}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl 
                            font-bold shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة مركبة جديدة</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={Truck} value={stats.total} label="إجمالي المركبات" color="indigo" />
                <StatCard icon={CheckCircle2} value={stats.active} label="نشط" color="success" />
                <StatCard icon={Clock} value={stats.inactive} label="غير نشط" color="warning" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث بالكود، رقم اللوحة، الماركة، السائق..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 
                                outline-none bg-slate-50
                                ${isSearchFocused
                                    ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-500/10'
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
                                <option value="Active">نشط</option>
                                <option value="Inactive">غير نشط</option>
                            </select>
                        </div>

                        <button
                            onClick={fetchVehicles}
                            disabled={loading}
                            className="p-3 rounded-xl border border-slate-200 text-slate-600 
                                hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 
                                transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={
                                            paginatedVehicles.length > 0 &&
                                            paginatedVehicles.every(v => v.id && selectedIds.includes(v.id))
                                        }
                                        onChange={handleToggleSelectAllPage}
                                    />
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الكود</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم اللوحة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">النوع</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الماركة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الموديل</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">السائق</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">السعة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                            <span className="text-slate-500 font-medium">جاري التحميل...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                                <Truck className="w-10 h-10 text-indigo-300" />
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-semibold">لا توجد نتائج</p>
                                                <p className="text-slate-400 text-sm mt-1">جرب تغيير معايير البحث</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedVehicles.map((vehicle, index) => (
                                    <tr
                                        key={vehicle.id}
                                        className="hover:bg-indigo-50/50 transition-all duration-200 group border-b border-slate-100 last:border-0 cursor-pointer"
                                        onClick={() => navigate(`/dashboard/sales/vehicles/${vehicle.id}`)}
                                        style={{
                                            animationDelay: `${index * 30}ms`,
                                            animation: 'fadeInUp 0.3s ease-out forwards'
                                        }}
                                    >
                                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={!!vehicle.id && selectedIds.includes(vehicle.id)}
                                                onChange={() => vehicle.id && handleToggleSelect(vehicle.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-50 
                                                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Truck className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                                                        {vehicle.vehicleCode || 'بدون كود'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-bold">
                                            {vehicle.plateNumber || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {vehicle.vehicleType || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {vehicle.brand || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {vehicle.model || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {vehicle.driverName ? (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    {vehicle.driverName}
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {vehicle.capacity ? `${vehicle.capacity} طن` : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge isActive={vehicle.isActive || false} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sales/vehicles/${vehicle.id}`); }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="عرض التفاصيل"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(vehicle); }}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
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
                {!loading && filteredVehicles.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBulkDeleteClick}
                                disabled={selectedIds.length === 0 || isDeleting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                                    border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                حذف المحدد ({selectedIds.length})
                            </button>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredVehicles.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                        />
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف المركبة"
                message={
                    vehicleToDelete
                        ? `هل أنت متأكد من حذف المركبة ${vehicleToDelete.vehicleCode}؟ سيتم حذف جميع البيانات المرتبطة بها ولا يمكن التراجع عن هذه الخطوة.`
                        : `هل أنت متأكد من حذف عدد ${selectedIds.length} من المركبات؟ سيتم حذف جميع البيانات المرتبطة بها ولا يمكن التراجع عن هذه الخطوة.`
                }
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setVehicleToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default VehicleListPage;
