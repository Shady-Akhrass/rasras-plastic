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
    Mail,
    MapPin,
    CheckCircle2,
    RefreshCw,
    Edit3
} from 'lucide-react';
import { supplierService, type SupplierDto } from '../../services/supplierService';

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

// Status Badge Component
const StatusBadge: React.FC<{ active: boolean; status: SupplierDto['status'] }> = ({ active, status }) => {
    const statusConfig = {
        DRAFT: { label: 'مسودة', class: 'bg-slate-100 text-slate-600 border-slate-200' },
        PENDING: { label: 'قيد المراجعة', class: 'bg-amber-50 text-amber-700 border-amber-200' },
        APPROVED: { label: 'معتمد', class: 'bg-blue-50 text-blue-700 border-blue-200' },
        REJECTED: { label: 'مرفوض', class: 'bg-rose-50 text-rose-700 border-rose-200' }
    };

    const config = statusConfig[status] || statusConfig.DRAFT;

    return (
        <div className="flex flex-col gap-1 items-end">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.class}`}>
                {status === 'APPROVED' && <CheckCircle2 className="w-2.5 h-2.5" />}
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

// Supplier Card Component
const SupplierCard: React.FC<{
    supplier: SupplierDto;
    index: number;
    onEdit: (id: number) => void;
}> = ({ supplier, index, onEdit }) => (
    <div
        className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
        style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.4s ease-out forwards'
        }}
    >
        {/* Decorative corner */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-brand-primary/5 rounded-br-full -translate-x-12 -translate-y-12 transition-transform group-hover:scale-150" />

        <div className="relative">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                        rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Truck className="w-7 h-7 text-brand-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                            {supplier.supplierNameAr}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                            <span className="bg-slate-100 px-2 py-0.5 rounded italic">#{supplier.supplierCode}</span>
                            <span>•</span>
                            <span>{supplier.supplierType || 'عام'}</span>
                        </div>
                    </div>
                </div>
                <StatusBadge active={supplier.isActive ?? true} status={supplier.status} />
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="flex-1 truncate">{supplier.contactPerson || 'لا يوجد مسئول اتصال'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-slate-400" />
                    </div>
                    <span dir="ltr">{supplier.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="truncate">{supplier.city ? `${supplier.city}, ${supplier.country}` : 'العنوان غير مسجل'}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                <button
                    onClick={() => onEdit(supplier.id!)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-primary/5 text-brand-primary rounded-xl font-bold hover:bg-brand-primary hover:text-white transition-all duration-200"
                >
                    <Edit3 className="w-4 h-4" />
                    <span>تعديل التفاصيل</span>
                </button>
            </div>
        </div>
    </div>
);

const SuppliersPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

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
        } finally {
            setLoading(false);
        }
    };

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => {
            const matchesSearch =
                s.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.supplierCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'All' || s.supplierType === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [suppliers, searchTerm, typeFilter]);

    const stats = useMemo(() => ({
        total: suppliers.length,
        active: suppliers.filter(s => s.isActive).length,
        approved: suppliers.filter(s => s.isApproved).length,
        local: suppliers.filter(s => s.supplierType === 'Local').length,
    }), [suppliers]);

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Truck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">سجل الموردين</h1>
                            <p className="text-white/70 text-lg">إدارة بيانات الموردين، الشروط المالية، والتواصل</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/suppliers/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة مورد جديد</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Building2} value={stats.total} label="إجمالي الموردين" color="primary" />
                <StatCard icon={CheckCircle2} value={stats.active} label="مورد نشط" color="success" />
                <StatCard icon={Users} value={stats.approved} label="مورد معتمد" color="purple" />
                <StatCard icon={MapPin} value={stats.local} label="مورد محلي" color="warning" />
            </div>

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
                <button onClick={fetchSuppliers} className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد نتائج بحث</h3>
                    <p className="text-slate-500">جرب البحث بكلمات مختلفة أو إضافة مورد جديد</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {filteredSuppliers.map((s, idx) => (
                        <SupplierCard key={s.id} supplier={s} index={idx} onEdit={(id) => navigate(`/dashboard/procurement/suppliers/${id}`)} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SuppliersPage;
