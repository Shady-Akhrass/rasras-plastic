import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, Search, Trash2, XCircle, Save, Calendar, Users, Briefcase, ListChecks, CalendarDays } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { hrService, type LeaveTypeDto, type AssignLeaveDto } from '../../services/hrService';
import employeeService, { type Employee } from '../../services/employeeService';

const emptyForm: LeaveTypeDto = {
  leaveTypeCode: '',
  leaveTypeNameAr: '',
  leaveTypeNameEn: '',
  isPaid: true,
  maxDaysPerYear: null,
  isActive: true,
};

// ════════════════════════════════════════════
// ─── Tab: Assign Leave (تعيين أذن غياب) ───
// ════════════════════════════════════════════
const AssignLeaveTab: React.FC<{ employees: Employee[], leaveTypes: LeaveTypeDto[] }> = ({ employees, leaveTypes }) => {
  const [form, setForm] = useState<AssignLeaveDto>({
    employeeId: 0,
    leaveTypeCode: '',
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.leaveTypeCode || !form.fromDate || !form.toDate) {
      toast.error('يرجى تعبئة الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      const res = await hrService.assignLeave(form);
      if (res.success) {
        toast.success('تم تعيين الأذن بنجاح');
        setForm({
          ...form,
          employeeId: 0,
          leaveTypeCode: '',
          notes: ''
        });
      }
    } catch {
      toast.error('فشل تعيين أذن الغياب');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 max-w-2xl mx-auto">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-800">تعيين أذن غياب لموظف</h2>
        <p className="text-sm text-slate-500">اختر الموظف ونوع الإجازة والمدة لتعيين الأذن. سيظهر الموظف كـ "مستأذن" في صفحة الحضور.</p>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" /> الموظف *
          </label>
          <select
            value={form.employeeId}
            onChange={e => setForm({ ...form, employeeId: Number(e.target.value) })}
            className="w-full input-field"
          >
            <option value={0}>— اختر موظفاً —</option>
            {employees.map(emp => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.fullNameAr} - {emp.jobTitle || ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
            <ListChecks className="w-4 h-4" /> نوع الإجازة *
          </label>
          <select
            value={form.leaveTypeCode}
            onChange={e => setForm({ ...form, leaveTypeCode: e.target.value })}
            className="w-full input-field"
          >
            <option value="">— اختر نوع الإجازة —</option>
            {leaveTypes.map(lt => (
              <option key={lt.leaveTypeCode} value={lt.leaveTypeCode}>
                {lt.leaveTypeNameAr} {lt.isPaid ? '(مدفوعة)' : '(غير مدفوعة)'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" /> من تاريخ *
            </label>
            <input
              type="date"
              value={form.fromDate}
              onChange={e => setForm({ ...form, fromDate: e.target.value })}
              className="w-full input-field font-mono"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4" /> إلى تاريخ *
            </label>
            <input
              type="date"
              value={form.toDate}
              onChange={e => setForm({ ...form, toDate: e.target.value })}
              className="w-full input-field font-mono"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
            ملاحظات
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full input-field min-h-[80px]"
            placeholder="أسباب الغياب أو ملاحظات أخرى..."
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary min-w-[140px] flex justify-center items-center gap-2"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            تعيين الغياب
          </button>
        </div>
      </form>
    </div>
  );
};


const LeaveTypesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'types' | 'assign'>('types');
  const [items, setItems] = useState<LeaveTypeDto[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<LeaveTypeDto>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const [res, empRes] = await Promise.all([
        hrService.getLeaveTypes(false),
        employeeService.getAll()
      ]);
      if (res.success) setItems(res.data);
      if (empRes.content) setEmployees(empRes.content);
    } catch (e) {
      toast.error('فشل في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const data = q
      ? items.filter(
        (x) =>
          x.leaveTypeCode.toLowerCase().includes(q) ||
          x.leaveTypeNameAr.toLowerCase().includes(q) ||
          (x.leaveTypeNameEn || '').toLowerCase().includes(q)
      )
      : items;
    return [...data].sort((a, b) => b.leaveTypeCode.localeCompare(a.leaveTypeCode));
  }, [items, search]);

  const onEdit = (x: LeaveTypeDto) => setForm({ ...x });
  const onNew = () => setForm({ ...emptyForm });

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leaveTypeCode || !form.leaveTypeNameAr) {
      toast.error('الكود + الاسم بالعربي مطلوبين');
      return;
    }
    setSaving(true);
    try {
      const res = await hrService.saveLeaveType(form.leaveTypeCode, form);
      if (res.success) {
        toast.success('تم حفظ نوع الإجازة');
        onNew();
        load();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'فشل حفظ نوع الإجازة');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (code: string) => {
    if (!confirm(`حذف نوع الإجازة ${code}؟`)) return;
    try {
      const res = await hrService.deleteLeaveType(code);
      if (res.success) {
        toast.success('تم الحذف');
        load();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة الإجازات</h1>
            <p className="text-white/70 text-lg">صلاحيات أذونات الغياب وأنواع الإجازات</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm w-fit">
        {[
          { id: 'types', label: 'أنواع الإجازات', icon: Briefcase },
          { id: 'assign', label: 'تعيين أذن غياب', icon: CalendarDays },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300
              ${activeTab === t.id
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'assign' && (
        <AssignLeaveTab employees={employees} leaveTypes={items.filter(l => l.isActive)} />
      )}

      {activeTab === 'types' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث بالكود أو الاسم..."
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 outline-none bg-slate-50 border-transparent hover:border-slate-200 focus:border-brand-primary focus:bg-white"
                />
              </div>
              <button
                onClick={load}
                disabled={isLoading}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الكود</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الاسم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">مدفوع</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحد/سنة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        جاري التحميل...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        لا توجد بيانات
                      </td>
                    </tr>
                  ) : (
                    filtered.map((x) => (
                      <tr key={x.leaveTypeCode} className="border-b border-slate-100 hover:bg-brand-primary/5">
                        <td className="px-6 py-4 font-mono font-semibold text-slate-700">{x.leaveTypeCode}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{x.leaveTypeNameAr}</div>
                          {x.leaveTypeNameEn ? <div className="text-xs text-slate-400" dir="ltr">{x.leaveTypeNameEn}</div> : null}
                        </td>
                        <td className="px-6 py-4 text-slate-700">{x.isPaid ? 'نعم' : 'لا'}</td>
                        <td className="px-6 py-4 text-slate-700">{x.maxDaysPerYear ?? '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                          ${x.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {x.isActive ? <><CheckCircle2 className="w-3.5 h-3.5" /> نشط</> : <><XCircle className="w-3.5 h-3.5" /> غير نشط</>}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEdit(x)}
                              className="px-3 py-2 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-sm font-medium"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => onDelete(x.leaveTypeCode)}
                              className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all text-sm font-medium inline-flex items-center gap-1.5"
                            >
                              <Trash2 className="w-4 h-4" />
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{form.leaveTypeCode ? 'تعديل' : 'إضافة'} نوع إجازة</h3>
              <p className="text-sm text-slate-500">احفظ النوع وسيظهر في طلبات الإجازات</p>
            </div>
            <form onSubmit={onSave} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700">الكود *</label>
                <input
                  value={form.leaveTypeCode}
                  onChange={(e) => setForm({ ...form, leaveTypeCode: e.target.value.toUpperCase() })}
                  className="mt-2 w-full input-field"
                  placeholder="ANNUAL"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">الاسم (عربي) *</label>
                <input
                  value={form.leaveTypeNameAr}
                  onChange={(e) => setForm({ ...form, leaveTypeNameAr: e.target.value })}
                  className="mt-2 w-full input-field"
                  placeholder="إجازة سنوية"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">الاسم (إنجليزي)</label>
                <input
                  value={form.leaveTypeNameEn || ''}
                  onChange={(e) => setForm({ ...form, leaveTypeNameEn: e.target.value })}
                  className="mt-2 w-full input-field"
                  placeholder="Annual Leave"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-slate-700">مدفوع</label>
                  <select
                    value={form.isPaid ? '1' : '0'}
                    onChange={(e) => setForm({ ...form, isPaid: e.target.value === '1' })}
                    className="mt-2 w-full input-field"
                  >
                    <option value="1">نعم</option>
                    <option value="0">لا</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700">الحد/سنة</label>
                  <input
                    type="number"
                    value={form.maxDaysPerYear ?? ''}
                    onChange={(e) => setForm({ ...form, maxDaysPerYear: e.target.value === '' ? null : Number(e.target.value) })}
                    className="mt-2 w-full input-field"
                    placeholder="21"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-5 h-5 accent-brand-primary"
                />
                <label htmlFor="active" className="text-sm font-bold text-slate-700">
                  نشط
                </label>
              </div>
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ
                </button>
                <button type="button" onClick={onNew} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                  مسح
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypesPage;

