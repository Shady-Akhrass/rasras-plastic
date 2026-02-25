import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    Wallet,
    FileText,
    Printer,
    Building2,
    CalendarDays
} from 'lucide-react';
import { receiptService, type PaymentReceiptDto } from '../../services/receiptService';
import { formatNumber, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import { useSystemSettings } from '../../hooks/useSystemSettings';

const ReceiptDetailPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [receipt, setReceipt] = useState<PaymentReceiptDto | null>(null);

    useEffect(() => {
        if (id) {
            fetchReceipt(Number(id));
        }
    }, [id]);

    const fetchReceipt = async (receiptId: number) => {
        try {
            setLoading(true);
            const data = await receiptService.getById(receiptId);
            setReceipt(data);
        } catch (error) {
            console.error('Failed to fetch receipt details:', error);
            toast.error('فشل تحميل تفاصيل الإيصال');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">لم يتم العثور على الإيصال</h3>
                <button
                    onClick={() => navigate('/dashboard/sales/receipts')}
                    className="mt-4 text-indigo-600 font-bold hover:underline"
                >
                    العودة للقائمة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl animate-slide-in">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/sales/receipts')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-inner">
                            <Wallet className="w-10 h-10 text-indigo-100" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                                    إيصال استلام: {receipt.voucherNumber || `#R-${receipt.id}`}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-100 backdrop-blur-sm rounded-lg text-xs font-bold border border-emerald-500/30">
                                    <CheckCircle2 className="w-4 h-4" />
                                    مكتمل
                                </span>
                            </div>
                            <p className="text-indigo-100/90 text-lg font-medium">
                                عرض تفاصيل إيصال الدفع للعميل
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-3 px-6 py-3.5 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-indigo-900/20"
                        >
                            <Printer className="w-5 h-5" />
                            <span>طباعة الإيصال</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Financial Details Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-100/50 overflow-hidden animate-slide-in" style={{ animationDelay: '100ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg tracking-tight">البيانات الأساسية والتفاصيل المالية</h3>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">العميل</label>
                                    <div className="font-extrabold text-slate-800 text-lg">{receipt.customerNameAr || 'غير معروف'}</div>
                                    {receipt.customerCode && <div className="text-sm font-semibold text-slate-500">{receipt.customerCode}</div>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">تاريخ الإيصال</label>
                                    <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                        <CalendarDays className="w-5 h-5 text-slate-400" />
                                        {formatDate(receipt.voucherDate)}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">المبلغ الإجمالي</label>
                                    <div className="font-black text-emerald-600 text-2xl flex items-baseline gap-1">
                                        {formatNumber(convertAmount(receipt.amount, receipt.currency || defaultCurrency))}
                                        <span className="text-sm font-bold text-emerald-500">{getCurrencyLabel(receipt.currency || defaultCurrency)}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">طريقة الدفع</label>
                                    <div className="flex items-center gap-2 font-bold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 w-fit">
                                        {receipt.paymentMethod === 'Cash' ? <Wallet className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                                        {receipt.paymentMethod === 'Cash' ? 'نقداً' :
                                            receipt.paymentMethod === 'BankTransfer' ? 'تحويل بنكي' :
                                                receipt.paymentMethod === 'Cheque' ? 'شيك' : 'أخرى'}
                                    </div>
                                </div>
                                {(receipt.paymentMethod === 'BankTransfer' || receipt.paymentMethod === 'Cheque') && receipt.notes && (
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">رقم الحساب / الشيك</label>
                                        <div className="font-mono text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg inline-block">
                                            {receipt.notes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {receipt.description && (
                                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
                                    <label className="block text-xs font-bold text-slate-500 mb-2">الوصف</label>
                                    <div className="text-sm text-slate-700 font-medium leading-relaxed">{receipt.description}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Allocations Table */}
                    {receipt.allocations && receipt.allocations.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-100/50 overflow-hidden animate-slide-in" style={{ animationDelay: '200ms' }}>
                            <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-violet-100 rounded-xl">
                                        <FileText className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">الفواتير المرتبطة</h3>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                                    {receipt.allocations.length} فواتير
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200/60">
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">رقم الفاتورة</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">تاريخ التخصيص</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">القيمة المخصصة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {receipt.allocations.map((alloc, index) => (
                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-slate-800">{alloc.invoiceNumber || '—'}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-medium text-slate-600">{formatDate(alloc.allocationDate || receipt.voucherDate)}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-emerald-600 text-base">
                                                        {formatNumber(convertAmount(alloc.allocatedAmount, receipt.currency || defaultCurrency))} <span className="text-xs">{getCurrencyLabel(receipt.currency || defaultCurrency)}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/80 border-t-2 border-slate-200">
                                        <tr>
                                            <td colSpan={2} className="py-4 px-6 font-bold text-slate-700">الإجمالي المخصص</td>
                                            <td className="py-4 px-6 font-black text-emerald-700 text-lg">
                                                {formatNumber(convertAmount(receipt.allocations.reduce((sum, a) => sum + (a.allocatedAmount || 0), 0), receipt.currency || defaultCurrency))} <span className="text-xs">{getCurrencyLabel(receipt.currency || defaultCurrency)}</span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-100/50 animate-slide-in" style={{ animationDelay: '300ms' }}>
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> الحالة
                        </h3>
                        <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl">
                            <div className="font-black text-emerald-700 text-lg mb-1">تمت العملية بنجاح</div>
                            <p className="text-sm text-emerald-600 font-medium leading-relaxed">
                                تم استلام المبلع وتوثيق الإيصال. الرصيد المتبقي للعميل تم تحديثه في النظام.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptDetailPage;
