import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    Truck,
    CheckCircle2,
    Clock,
    RefreshCw,
    Package,
    Warehouse
} from 'lucide-react';
import { grnService, type GoodsReceiptNoteDto } from '../../services/grnService';

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

const GRNsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [receipts, setReceipts] = useState<GoodsReceiptNoteDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchReceipts(); }, []);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const data = await grnService.getAllGRNs();
            setReceipts(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const filteredReceipts = useMemo(() => {
        return receipts.filter(r => {
            return r.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [receipts, searchTerm]);

    const stats = useMemo(() => ({
        total: receipts.length,
        today: receipts.filter(r => new Date(r.grnDate!).toDateString() === new Date().toDateString()).length,
        totalQty: receipts.reduce((sum, r) => sum + (r.totalReceivedQty || 0), 0).toLocaleString()
    }), [receipts]);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Warehouse className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">إشعارات الاستلام (GRN)</h1>
                            <p className="text-white/70 text-lg">متابعة توريدات المخازن بناءً على أوامر الشراء</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/dashboard/procurement/grn/new')} className="flex items-center gap-3 px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">
                        <Plus className="w-5 h-5" /> <span>تسجيل استلام جديد</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={FileText} value={stats.total} label="إجمالي الاستلامات" color="primary" />
                <StatCard icon={Calendar} value={stats.today} label="استلامات اليوم" color="warning" />
                <StatCard icon={Package} value={stats.totalQty} label="إجمالي الكميات المستلمة" color="success" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="بحث برقم الاستلام، المورد، أو أمر الشراء..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-transparent bg-slate-50 focus:border-emerald-500 focus:bg-white outline-none transition-all" />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم الاستلام</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">أمر الشراء</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">المورد</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700">التاريخ</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 text-center">الكمية المستلمة</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10">جاري التحميل...</td></tr>
                        ) : filteredReceipts.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-slate-500">لا يوجد بيانات استلام</td></tr>
                        ) : filteredReceipts.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-800">#{r.grnNumber}</td>
                                <td className="px-6 py-4 text-sm font-medium text-brand-primary">#{r.poNumber}</td>
                                <td className="px-6 py-4 font-medium">{r.supplierNameAr}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{new Date(r.grnDate!).toLocaleDateString('ar-EG')}</td>
                                <td className="px-6 py-4 text-center font-bold">{r.totalReceivedQty?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-left">
                                    <button onClick={() => navigate(`/dashboard/procurement/grn/${r.id}`)} className="text-emerald-600 font-bold hover:underline">عرض</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GRNsPage;
