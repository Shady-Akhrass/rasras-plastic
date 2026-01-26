import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    FileText,
    Truck,
    Calendar,
    ArrowLeft,
    RefreshCw,
    Download,
    Eye,
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign
} from 'lucide-react';
import { supplierInvoiceService, type SupplierInvoiceDto } from '../../services/supplierInvoiceService';
import { grnService } from '../../services/grnService';
import toast from 'react-hot-toast';

const SupplierInvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<SupplierInvoiceDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activeTab, setActiveTab] = useState<'invoices' | 'pending'>('invoices');
    const [pendingGRNs, setPendingGRNs] = useState<any[]>([]);

    useEffect(() => {
        if (activeTab === 'invoices') {
            fetchInvoices();
        } else {
            fetchPendingGRNs();
        }
    }, [activeTab]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await supplierInvoiceService.getAllInvoices();
            setInvoices(data.data || []);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            toast.error('فشل تحميل الفواتير');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingGRNs = async () => {
        try {
            setLoading(true);
            const data = await grnService.getAllGRNs();
            // Filter only finalized GRNs that haven't been billed yet
            setPendingGRNs(data.filter((g: any) => g.status === 'Completed'));
        } catch (error) {
            console.error('Failed to fetch pending GRNs:', error);
            toast.error('فشل تحميل التوريدات المعلقة');
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchesSearch =
                inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.supplierInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, statusFilter]);

    const filteredPending = useMemo(() => {
        return pendingGRNs.filter(g =>
            g.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.poNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pendingGRNs, searchTerm]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100"><Clock className="w-3 h-3" /> قيد المراجعة</span>;
            case 'Approved':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100"><CheckCircle2 className="w-3 h-3" /> معتمدة</span>;
            case 'Rejected':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100"><AlertCircle className="w-3 h-3" /> مرفوضة</span>;
            case 'Paid':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100"><DollarSign className="w-3 h-3" /> مدفوعة</span>;
            default:
                return <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-bold border border-slate-100">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slideIn 0.4s ease-out forwards;
                }
            `}</style>

            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">فواتير الموردين</h1>
                        <p className="text-slate-500 text-sm">إدارة وتسجيل المطالبات المالية للموردين</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard/procurement/invoices/new')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>تسجيل فاتورة</span>
                    </button>
                    <button onClick={activeTab === 'invoices' ? fetchInvoices : fetchPendingGRNs} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all border border-slate-200">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white w-fit rounded-2xl border border-slate-100 shadow-sm">
                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
                        ${activeTab === 'invoices'
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                            : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileText className="w-4 h-4" />
                    <span>الفواتير المسجلة</span>
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all
                        ${activeTab === 'pending'
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                            : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Truck className="w-4 h-4" />
                    <span>توريدات بانتظار الفوترة</span>
                    {pendingGRNs.length > 0 && (
                        <span className={`${activeTab === 'pending' ? 'bg-white text-brand-primary' : 'bg-brand-primary text-white'} text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 transition-colors`}>
                            {pendingGRNs.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder={activeTab === 'invoices' ? "بحث برقم الفاتورة أو اسم المورد..." : "بحث برقم الاستلام أو المورد..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-transparent bg-slate-50 focus:border-brand-primary outline-none transition-all"
                    />
                </div>
                {activeTab === 'invoices' && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none border-2 border-transparent focus:border-brand-primary"
                    >
                        <option value="All">جميع الحالات</option>
                        <option value="Pending">قيد المراجعة</option>
                        <option value="Approved">معتمدة</option>
                        <option value="Paid">مدفوعة</option>
                        <option value="Rejected">مرفوضة</option>
                    </select>
                )}
            </div>

            {/* Content List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                                {activeTab === 'invoices' ? (
                                    <>
                                        <th className="px-6 py-5 text-sm">رقم الفاتورة</th>
                                        <th className="px-6 py-5 text-sm">المورد</th>
                                        <th className="px-6 py-5 text-sm text-center">التاريخ</th>
                                        <th className="px-6 py-5 text-sm text-center">تاريخ الاستحقاق</th>
                                        <th className="px-6 py-5 text-sm text-center">إجمالي المبلغ</th>
                                        <th className="px-6 py-5 text-sm text-center">الحالة</th>
                                        <th className="px-6 py-5 text-sm">الإجراءات</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-5 text-sm">رقم الاستلام (GRN)</th>
                                        <th className="px-6 py-5 text-sm">المورد</th>
                                        <th className="px-6 py-5 text-sm text-center">أمر الشراء</th>
                                        <th className="px-6 py-5 text-sm text-center">تاريخ الاستلام</th>
                                        <th className="px-6 py-5 text-sm text-center">الكمية المقبولة</th>
                                        <th className="px-6 py-5 text-sm">الإجراءات</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8"><div className="h-6 bg-slate-50 rounded-lg w-full"></div></td>
                                    </tr>
                                ))
                            ) : (activeTab === 'invoices' ? filteredInvoices : filteredPending).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                {activeTab === 'invoices' ? <FileText className="w-10 h-10" /> : <Truck className="w-10 h-10" />}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-slate-800">
                                                    {activeTab === 'invoices' ? 'لا توجد فواتير' : 'لا توجد توريدات بانتظار الفوترة'}
                                                </h3>
                                                <p className="text-slate-500 text-sm">
                                                    {activeTab === 'invoices' ? 'ابدأ بتسجيل أول فاتورة توريد بالنظام' : 'سيتم ظهور التوريدات التي تم فحصها وإضافتها للمخزن هنا'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : activeTab === 'invoices' ? (
                                filteredInvoices.map((inv, idx) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors animate-slide-in" style={{ animationDelay: `${idx * 40}ms` }}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{inv.invoiceNumber}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">سند رقم: {inv.supplierInvoiceNo}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-slate-300" />
                                                <span className="font-medium text-slate-700">{inv.supplierNameAr}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                                <Calendar className="w-3 h-3" />
                                                {inv.invoiceDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-lg">
                                                {inv.dueDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-black text-brand-primary">
                                                {inv.totalAmount.toLocaleString()} <span className="text-[10px] font-bold opacity-50">{inv.currency}</span>
                                            </div>
                                            {inv.paidAmount! > 0 && <div className="text-[10px] text-emerald-600 font-bold">مسدد: {inv.paidAmount?.toLocaleString()}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                {getStatusBadge(inv.status)}
                                                {inv.approvalStatus && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${inv.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        inv.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {inv.approvalStatus === 'Approved' ? 'معتمد للصرف' :
                                                            inv.approvalStatus === 'Rejected' ? 'مرفوض الصرف' : 'بانتظار اعتماد الصرف'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/dashboard/procurement/invoices/${inv.id}`)}
                                                    className="p-2 text-brand-primary bg-brand-primary/5 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                                    title="عرض"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {inv.status === 'Unpaid' && inv.approvalStatus === 'Pending' && (
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('هل توافق على اعتماد صرف هذه الفاتورة؟')) {
                                                                try {
                                                                    await supplierInvoiceService.approvePayment(inv.id!, 1, true);
                                                                    fetchInvoices();
                                                                    toast.success('تم اعتماد الصرف');
                                                                } catch (e) {
                                                                    toast.error('فشل الاعتماد');
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                        title="اعتماد الصرف"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredPending.map((g, idx) => (
                                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors animate-slide-in" style={{ animationDelay: `${idx * 40}ms` }}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">#{g.grnNumber}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{g.deliveryNoteNo}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{g.supplierNameAr}</td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-brand-primary cursor-pointer hover:underline" onClick={() => navigate(`/dashboard/procurement/po/${g.poId}`)}>
                                            #{g.poNumber}
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs text-slate-500">{new Date(g.grnDate!).toLocaleDateString('ar-EG')}</td>
                                        <td className="px-6 py-4 text-center font-bold text-slate-700">{g.totalAcceptedQty || g.totalReceivedQty}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/dashboard/procurement/invoices/new?grnId=${g.id}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm"
                                            >
                                                <DollarSign className="w-4 h-4" />
                                                <span>إنشاء فاتورة</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupplierInvoicesPage;
