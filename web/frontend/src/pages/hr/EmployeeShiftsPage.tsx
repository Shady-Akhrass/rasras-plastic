import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Plus, RefreshCw, Search, Trash2, XCircle, Save, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import employeeService, { type Employee } from '../../services/employeeService';
import { hrService, type EmployeeShiftDto, type WorkShiftDto } from '../../services/hrService';

const EmployeeShiftsPage: React.FC = () => {
  const [items, setItems] = useState<EmployeeShiftDto[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<WorkShiftDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<EmployeeShiftDto>({
    employeeId: 0,
    shiftId: 0,
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: null,
    isActive: true,
  });

  const load = async () => {
    try {
      setIsLoading(true);
      const [shiftRes, empList, esRes] = await Promise.all([
        hrService.getShifts(true),
        employeeService.getAllActiveList(),
        hrService.getEmployeeShifts(),
      ]);
      if (shiftRes.success) setShifts(shiftRes.data);
      setEmployees(empList);
      if (esRes.success) setItems(esRes.data);
    } catch {
      toast.error('فشل في تحميل بيانات الشفتات للموظفين');
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
          (x.employeeNameAr || '').toLowerCase().includes(q) ||
          (x.shiftCode || '').toLowerCase().includes(q) ||
          (x.shiftNameAr || '').toLowerCase().includes(q) ||
          (x.effectiveFrom || '').toLowerCase().includes(q)
      )
      : items;
    return [...data].sort((a, b) => (b.employeeShiftId ?? 0) - (a.employeeShiftId ?? 0));
  }, [items, search]);

  const selectableEmployees = useMemo(() => {
    const assignedIds = items.filter(x => x.isActive).map(x => x.employeeId);
    return employees.filter(e => {
      // Show if not assigned to any active shift
      // OR if we are editing this specific employee
      if (!assignedIds.includes(e.employeeId)) return true;
      if (form.employeeId === e.employeeId) return true;
      return false;
    });
  }, [employees, items, form.employeeId]);

  const onNew = () =>
    setForm({
      employeeId: 0,
      shiftId: 0,
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: null,
      isActive: true,
    });

  const onEdit = (x: EmployeeShiftDto) =>
    setForm({
      employeeShiftId: x.employeeShiftId,
      employeeId: x.employeeId!,
      shiftId: x.shiftId!,
      effectiveFrom: x.effectiveFrom,
      effectiveTo: x.effectiveTo ?? null,
      isActive: x.isActive ?? true,
    });

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.shiftId || !form.effectiveFrom) {
      toast.error('يجب اختيار الموظف + الشفت + تاريخ البداية');
      return;
    }
    setSaving(true);
    try {
      let res;
      if (form.employeeShiftId) res = await hrService.updateEmployeeShift(form.employeeShiftId, form);
      else res = await hrService.createEmployeeShift(form);
      if (res.success) {
        toast.success(form.employeeShiftId ? 'تم تحديث التعيين' : 'تم إنشاء التعيين');
        onNew();
        load();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'فشل حفظ التعيين');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm(`حذف التعيين رقم ${id}؟`)) return;
    try {
      const res = await hrService.deleteEmployeeShift(id);
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
            <h1 className="text-3xl font-bold mb-2">شفتات الموظفين</h1>
            <p className="text-white/70 text-lg">تعيين الشفتات للموظفين حسب التاريخ</p>
          </div>
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary rounded-xl font-bold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10"
          >
            <Plus className="w-5 h-5" />
            تعيين جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالموظف أو الشفت أو التاريخ..."
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
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الموظف</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الشفت</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">من</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">إلى</th>
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
                    <tr key={x.employeeShiftId ?? `${x.employeeId}-${x.shiftId}-${x.effectiveFrom}`} className="border-b border-slate-100 hover:bg-brand-primary/5">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand-primary" />
                          {x.employeeNameAr || `#${x.employeeId}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{x.shiftNameAr || x.shiftCode || `#${x.shiftId}`}</div>
                        {x.shiftCode ? <div className="text-xs text-slate-400 font-mono" dir="ltr">{x.shiftCode}</div> : null}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-700" dir="ltr">{x.effectiveFrom}</td>
                      <td className="px-6 py-4 font-mono text-slate-700" dir="ltr">{x.effectiveTo || '-'}</td>
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
                          {x.employeeShiftId ? (
                            <button
                              onClick={() => onDelete(x.employeeShiftId!)}
                              className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all text-sm font-medium inline-flex items-center gap-1.5"
                            >
                              <Trash2 className="w-4 h-4" />
                              حذف
                            </button>
                          ) : null}
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
            <h3 className="font-bold text-slate-900">{form.employeeShiftId ? 'تعديل' : 'إضافة'} تعيين شفت</h3>
            <p className="text-sm text-slate-500">اختر الموظف والشفت والفترة</p>
          </div>
          <form onSubmit={onSave} className="p-5 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">الموظف *</label>
              <select
                value={form.employeeId ? String(form.employeeId) : ''}
                onChange={(e) => setForm({ ...form, employeeId: Number(e.target.value) })}
                className="mt-2 w-full input-field"
              >
                <option value="">اختر الموظف</option>
                {selectableEmployees.map((e) => (
                  <option key={e.employeeId} value={e.employeeId}>
                    {e.fullNameAr} ({e.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">الشفت *</label>
              <select
                value={form.shiftId ? String(form.shiftId) : ''}
                onChange={(e) => setForm({ ...form, shiftId: Number(e.target.value) })}
                className="mt-2 w-full input-field"
              >
                <option value="">اختر الشفت</option>
                {shifts.map((s) => (
                  <option key={s.shiftId ?? s.shiftCode} value={s.shiftId}>
                    {s.shiftNameAr} ({s.shiftCode}) {s.startTime}-{s.endTime}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-slate-700">من *</label>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  className="mt-2 w-full input-field font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">إلى</label>
                <input
                  type="date"
                  value={form.effectiveTo || ''}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value || null })}
                  className="mt-2 w-full input-field font-mono"
                  dir="ltr"
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
              <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
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
    </div>
  );
};

export default EmployeeShiftsPage;

