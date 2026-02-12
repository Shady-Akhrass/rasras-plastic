import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, FileText, RefreshCw, Search, Users } from 'lucide-react';
import { hrService, type PayrollDto } from '../../services/hrService';
import { toast } from 'react-hot-toast';

const PayrollPage: React.FC = () => {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [items, setItems] = useState<PayrollDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await hrService.getPayroll(month, year);
      if (res.success) setItems(res.data);
    } catch {
      toast.error('فشل في تحميل المرتبات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalNet = items.reduce((sum, x) => sum + (x.netSalary || 0), 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">المرتبات الشهرية</h1>
            <p className="text-white/70 text-lg">عرض صافي المرتب لكل موظف مع تفاصيل الاستحقاقات والاستقطاعات</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/10 rounded-xl flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">عدد الموظفين: {items.length}</span>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-xl flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">إجمالي صافي المرتبات: {totalNet.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> الشهر
            </label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="mt-2 w-full input-field"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> السنة
            </label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="mt-2 w-full input-field"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={load}
              disabled={isLoading}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              عرض
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الموظف</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الأساسي</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الاستحقاقات</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الاستقطاعات</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">صافي المرتب</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    جاري التحميل...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    لا توجد بيانات مرتبات لهذا الشهر
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.payrollId} className="border-b border-slate-100 hover:bg-brand-primary/5">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold">
                          {p.employeeNameAr?.slice(0, 2) ?? 'م'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{p.employeeNameAr}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>
                              شهر {p.payrollMonth}/{p.payrollYear}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700">
                      {p.basicSalary?.toFixed(2) ?? '-'}
                    </td>
                    <td className="px-6 py-3 text-sm text-emerald-700">
                      {p.totalEarnings?.toFixed(2) ?? '-'}
                    </td>
                    <td className="px-6 py-3 text-sm text-rose-700">
                      {p.totalDeductions?.toFixed(2) ?? '-'}
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-slate-900">
                      {p.netSalary?.toFixed(2) ?? '-'}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {p.status ?? 'Draft'}
                      </span>
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

export default PayrollPage;

