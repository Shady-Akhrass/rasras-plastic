import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    CheckCircle2,
    Clock,
    RefreshCw,
    DollarSign,
    ShoppingCart,
    Package
} from 'lucide-react';
import { purchaseOrderService, type PurchaseOrderDto } from '../../services/purchaseOrderService';

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
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { icon: React.ElementType; className: string; label: string }> = {
        'Draft': { icon: FileText, className: 'bg-slate-100 text-slate-600 border-slate-200', label: 'مسودة' },
        'Pending': { icon: Clock, className: 'bg-amber-50 text-amber-600 border-amber-200', label: 'قيد الاعتماد' },
        'PartiallyReceived': { icon: Clock, className: 'bg-blue-50 text-blue-600 border-blue-200', label: 'استلام جزئي' },
        'Received': { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-600 border-emerald-200', label: 'تم الاستلام' },
        'Closed': { icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700 border-emerald-300', label: 'مغلق' }
    };
    const { icon: Icon, className, label } = config[status] || config['Draft'];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </span>
    );
};

const PurchaseOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await purchaseOrderService.getAllPOs();
            setOrders(data || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = o.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All'
                ? o.status !== 'Closed' // Hide closed in main list
                : o.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: orders.filter(o => o.status !== 'Closed').length,
        pending: orders.filter(o => o.status === 'Draft' || o.status === 'Pending').length,
        active: orders.filter(o => o.status === 'PartiallyReceived').length,
        totalValue: orders.filter(o => o.status !== 'Closed').reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()
    }), [orders]);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-primary to-indigo-600 rounded-3xl p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <ShoppingCart className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">أوامر الشراء</h1>
                            <p className="text-white/70 text-lg">إدارة وتتبع طلبات التوريد الرسمية للموردين</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/dashboard/procurement/po/new')} className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl font-bold shadow-lg hover:scale-105 transition-all">
                        <Plus className="w-5 h-5" /> <span>إنشاء أمر شراء</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} value={stats.total} label="إجمالي الأوامر" color="primary" />
                <StatCard icon={Clock} value={stats.pending} label="قيد المعالجة" color="warning" />
                <StatCard icon={RefreshCw} value={stats.active} label="استلامات جارية" color="blue" />
                <StatCard icon={DollarSign} value={`${stats.totalValue} ج.م`} label="قيمة المشتريات" color="success" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="بحث برقم الأمر أو المورد..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-transparent bg-slate-50 focus:border-brand-primary focus:bg-white outline-none transition-all" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-slate-50 rounded-xl border-none font-medium outline-none text-right">
                    <option value="All">الأوامر النشطة</option>
                    <option value="Draft">مسودة</option>
                    <option value="Pending">قيد الاعتماد</option>
                    <option value="PartiallyReceived">استلام جزئي</option>
                    <option value="Received">تم الاستلام</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم الأمر</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">التاريخ</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">المورد</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجمالي</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10">جاري التحميل...</td></tr>
                        ) : filteredOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-800">#{o.poNumber}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{new Date(o.poDate!).toLocaleDateString('ar-EG')}</td>
                                <td className="px-6 py-4 font-medium">{o.supplierNameAr}</td>
                                <td className="px-6 py-4 text-left font-bold text-emerald-600">{o.totalAmount.toLocaleString()} {o.currency}</td>
                                <td className="px-6 py-4"><StatusBadge status={o.status!} /></td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => navigate(`/dashboard/procurement/po/${o.id}`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all" title="التفاصيل"><FileText className="w-4 h-4" /></button>
                                        {(o.status === 'Draft' || o.status === 'Pending' || o.status === 'PartiallyReceived') && (
                                            <button onClick={() => navigate(`/dashboard/procurement/grn/new?poId=${o.id}`)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="تسجيل استلام"><Package className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PurchaseOrdersPage;
