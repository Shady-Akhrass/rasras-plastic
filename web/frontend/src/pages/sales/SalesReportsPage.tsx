import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, TrendingUp, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { salesInvoiceService } from '../../services/salesInvoiceService';
import { receiptService } from '../../services/receiptService';
import { toast } from 'react-hot-toast';

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string }> = ({ icon: Icon, label, value, sub, color = 'blue' }) => {
    const c = { blue: 'from-blue-500 to-indigo-500', emerald: 'from-emerald-500 to-teal-500', amber: 'from-amber-500 to-orange-500', rose: 'from-rose-500 to-pink-500' }[color];
    return (
        <div className={`bg-gradient-to-br ${c} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                    {sub && <p className="text-white/70 text-xs mt-1">{sub}</p>}
                </div>
                <div className="p-3 bg-white/20 rounded-xl"><Icon className="w-8 h-8" /></div>
            </div>
        </div>
    );
};

const SalesReportsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [inv, rec] = await Promise.all([salesInvoiceService.getAll(), receiptService.getAll()]);
                setInvoices(Array.isArray(inv) ? inv : []);
                setReceipts(Array.isArray(rec) ? rec : []);
            } catch (e) {
                toast.error('فشل تحميل البيانات');
            } finally { setLoading(false); }
        })();
    }, []);

    const filterByMonthYear = (list: any[], dateKey: string) =>
        list.filter((x) => {
            const d = x[dateKey];
            if (!d) return false;
            const dt = new Date(d);
            return dt.getMonth() + 1 === month && dt.getFullYear() === year;
        });

    const invInPeriod = filterByMonthYear(invoices, 'invoiceDate');
    const recInPeriod = filterByMonthYear(receipts, 'receiptDate');

    const totalSales = invInPeriod.reduce((s, i) => s + (i.totalAmount ?? 0), 0);
    const totalCollected = recInPeriod.reduce((s, r) => s + (r.receivedAmount ?? 0), 0);
    const totalOutstanding = invoices.reduce((s, i) => s + (i.balanceAmount ?? (i.totalAmount ?? 0) - (i.paidAmount ?? 0)), 0);
    const collectionRate = totalSales > 0 ? ((totalCollected / totalSales) * 100).toFixed(1) : '0';
    const avgInvoice = invInPeriod.length > 0 ? totalSales / invInPeriod.length : 0;

    const topCustomer = (() => {
        const byC: Record<number, number> = {};
        invInPeriod.forEach((i) => { byC[i.customerId] = (byC[i.customerId] || 0) + (i.totalAmount ?? 0); });
        const entries = Object.entries(byC).sort((a, b) => (b[1] as number) - (a[1] as number));
        const first = entries[0];
        if (!first) return { name: '—', amount: 0 };
        const inv = invoices.find((i) => i.customerId === parseInt(first[0]));
        return { name: inv?.customerNameAr || '—', amount: first[1] as number };
    })();

    if (loading) return <div className="p-8 text-center">جاري تحميل التقرير...</div>;

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 rounded-2xl"><BarChart3 className="w-10 h-10" /></div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">تقارير المبيعات</h1>
                            <p className="text-white/80 text-lg">إجمالي المبيعات، التحصيل، الديون المعلقة، ونسبة التحصيل</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="px-4 py-2 bg-white/10 rounded-xl text-white border border-white/20">
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => <option key={m} value={m}>{new Date(2000, m - 1).toLocaleDateString('ar-EG', { month: 'long' })}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="px-4 py-2 bg-white/10 rounded-xl text-white border border-white/20">
                            {[year, year - 1, year - 2].map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={TrendingUp} label="إجمالي المبيعات (الفترة)" value={totalSales.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} sub={`${invInPeriod.length} فاتورة`} color="blue" />
                <StatCard icon={FileText} label="عدد الفواتير" value={invInPeriod.length} sub={`متوسط: ${avgInvoice.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}`} color="emerald" />
                <StatCard icon={DollarSign} label="الديون المعلقة" value={totalOutstanding.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} color="amber" />
                <StatCard icon={Percent} label="نسبة التحصيل" value={`${collectionRate}%`} sub={`مقبوض: ${totalCollected.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}`} color="rose" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-bold text-slate-800 border-b pb-2 mb-4">ملخص إضافي</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600">أكبر عميل (الفترة)</p>
                        <p className="text-lg font-bold text-slate-900 mt-1">{topCustomer.name}</p>
                        <p className="text-brand-primary font-semibold">{topCustomer.amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">ملاحظة</p>
                            <p className="text-sm text-amber-700 mt-1">البيانات تعتمد على واجهات فواتير المبيعات وإيصالات الدفع. عند تفعيل الخادم للواجهات ستُحدّث الأرقام تلقائياً.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReportsPage;
