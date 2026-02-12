import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Plus, RefreshCw, Search, Trash2, XCircle, Save, Moon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { hrService, type WorkShiftDto } from '../../services/hrService';

const emptyForm: WorkShiftDto = {
  shiftCode: '',
  shiftNameAr: '',
  shiftNameEn: '',
  startTime: '08:00',
  endTime: '16:00',
  graceMinutes: 0,
  isNightShift: false,
  isActive: true,
};

const WorkShiftsPage: React.FC = () => {
  const [items, setItems] = useState<WorkShiftDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<WorkShiftDto>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await hrService.getShifts(false);
      if (res.success) setItems(res.data);
    } catch {
      toast.error('فشل في تحميل الشفتات');
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
            x.shiftCode.toLowerCase().includes(q) ||
            x.shiftNameAr.toLowerCase().includes(q) ||
            (x.shiftNameEn || '').toLowerCase().includes(q)
        )
      : items;
    return [...data].sort((a, b) => (b.shiftId ?? 0) - (a.shiftId ?? 0));
  }, [items, search]);

  const onNew = () => setForm({ ...emptyForm });
  const onEdit = (x: WorkShiftDto) => setForm({ ...x, graceMinutes: x.graceMinutes ?? 0 });

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shiftCode || !form.shiftNameAr || !form.startTime || !form.endTime) {
      toast.error('الكود + الاسم + الوقت مطلوبين');
      return;
    }
    setSaving(true);
    try {
      let res;
      if (form.shiftId) res = await hrService.updateShift(form.shiftId, form);
      else res = await hrService.createShift(form);
      if (res.success) {
        toast.success(form.shiftId ? 'تم تحديث الشفت' : 'تم إنشاء الشفت');
        onNew();
        load();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'فشل حفظ الشفت');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm(`حذف الشفت رقم ${id}؟`)) return;
    try {
      const res = await hrService.deleteShift(id);
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
            <h1 className="text-3xl font-bold mb-2">الشفتات</h1>
            <p className="text-white/70 text-lg">إدارة أوقات العمل والتأخير المسموح</p>
          </div>
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary rounded-xl font-bold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10"
          >
            <Plus className="w-5 h-5" />
            إضافة شفت
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
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">من</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">إلى</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">سماح (د)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      لا توجد بيانات
                    </td>
                  </tr>
                ) : (
                  filtered.map((x) => (
                    <tr key={x.shiftId ?? x.shiftCode} className="border-b border-slate-100 hover:bg-brand-primary/5">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">{x.shiftCode}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          {x.shiftNameAr}
                          {x.isNightShift ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Moon className="w-3 h-3" /> ليلي
                            </span>
                          ) : null}
                        </div>
                        {x.shiftNameEn ? <div className="text-xs text-slate-400" dir="ltr">{x.shiftNameEn}</div> : null}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-mono" dir="ltr">{x.startTime}</td>
                      <td className="px-6 py-4 text-slate-700 font-mono" dir="ltr">{x.endTime}</td>
                      <td className="px-6 py-4 text-slate-700">{x.graceMinutes ?? 0}</td>
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
                          {x.shiftId ? (
                            <button
                              onClick={() => onDelete(x.shiftId!)}
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
            <h3 className="font-bold text-slate-900">{form.shiftId ? 'تعديل' : 'إضافة'} شفت</h3>
            <p className="text-sm text-slate-500">استخدم تنسيق الوقت HH:mm</p>
          </div>
          <form onSubmit={onSave} className="p-5 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">الكود *</label>
              <input
                value={form.shiftCode}
                onChange={(e) => setForm({ ...form, shiftCode: e.target.value.toUpperCase() })}
                className="mt-2 w-full input-field"
                placeholder="SHIFT-A"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">الاسم (عربي) *</label>
              <input
                value={form.shiftNameAr}
                onChange={(e) => setForm({ ...form, shiftNameAr: e.target.value })}
                className="mt-2 w-full input-field"
                placeholder="الصباحي"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">الاسم (إنجليزي)</label>
              <input
                value={form.shiftNameEn || ''}
                onChange={(e) => setForm({ ...form, shiftNameEn: e.target.value })}
                className="mt-2 w-full input-field"
                placeholder="Morning"
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-slate-700">من *</label>
                <input
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="mt-2 w-full input-field font-mono"
                  placeholder="08:00"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">إلى *</label>
                <input
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="mt-2 w-full input-field font-mono"
                  placeholder="16:00"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-slate-700">سماح (دقائق)</label>
                <input
                  type="number"
                  value={form.graceMinutes ?? 0}
                  onChange={(e) => setForm({ ...form, graceMinutes: Number(e.target.value) })}
                  className="mt-2 w-full input-field"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  id="night"
                  type="checkbox"
                  checked={form.isNightShift}
                  onChange={(e) => setForm({ ...form, isNightShift: e.target.checked })}
                  className="w-5 h-5 accent-brand-primary"
                />
                <label htmlFor="night" className="text-sm font-bold text-slate-700">
                  شفت ليلي
                </label>
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

export default WorkShiftsPage;

