import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Plus, RefreshCw, Search, Trash2, XCircle, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { hrService, type HolidayDto } from '../../services/hrService';

const emptyForm: HolidayDto = {
  holidayDate: new Date().toISOString().slice(0, 10),
  holidayNameAr: '',
  holidayNameEn: '',
  isActive: true,
};

const HolidaysPage: React.FC = () => {
  const [items, setItems] = useState<HolidayDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<HolidayDto>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await hrService.getHolidays(false);
      if (res.success) setItems(res.data);
    } catch {
      toast.error('فشل في تحميل العطلات');
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
            x.holidayDate.toLowerCase().includes(q) ||
            x.holidayNameAr.toLowerCase().includes(q) ||
            (x.holidayNameEn || '').toLowerCase().includes(q)
        )
      : items;
    return [...data].sort((a, b) => b.holidayDate.localeCompare(a.holidayDate));
  }, [items, search]);

  const onNew = () => setForm({ ...emptyForm, holidayDate: new Date().toISOString().slice(0, 10) });
  const onEdit = (x: HolidayDto) => setForm({ ...x });

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.holidayDate || !form.holidayNameAr) {
      toast.error('التاريخ + الاسم بالعربي مطلوبين');
      return;
    }
    setSaving(true);
    try {
      let res;
      if (form.holidayId) res = await hrService.updateHoliday(form.holidayId, form);
      else res = await hrService.createHoliday(form);
      if (res.success) {
        toast.success(form.holidayId ? 'تم تحديث العطلة' : 'تم إنشاء العطلة');
        onNew();
        load();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'فشل حفظ العطلة');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm(`حذف العطلة رقم ${id}؟`)) return;
    try {
      const res = await hrService.deleteHoliday(id);
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
            <h1 className="text-3xl font-bold mb-2">العطلات</h1>
            <p className="text-white/70 text-lg">تقويم عطلات الشركة</p>
          </div>
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary rounded-xl font-bold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-black/10"
          >
            <Plus className="w-5 h-5" />
            إضافة عطلة
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
                placeholder="بحث بالتاريخ أو الاسم..."
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
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      لا توجد بيانات
                    </td>
                  </tr>
                ) : (
                  filtered.map((x) => (
                    <tr key={x.holidayId ?? x.holidayDate} className="border-b border-slate-100 hover:bg-brand-primary/5">
                      <td className="px-6 py-4 font-mono text-slate-700" dir="ltr">{x.holidayDate}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-brand-primary" />
                          {x.holidayNameAr}
                        </div>
                        {x.holidayNameEn ? <div className="text-xs text-slate-400" dir="ltr">{x.holidayNameEn}</div> : null}
                      </td>
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
                          {x.holidayId ? (
                            <button
                              onClick={() => onDelete(x.holidayId!)}
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
            <h3 className="font-bold text-slate-900">{form.holidayId ? 'تعديل' : 'إضافة'} عطلة</h3>
            <p className="text-sm text-slate-500">حدد تاريخ العطلة ثم الاسم</p>
          </div>
          <form onSubmit={onSave} className="p-5 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">التاريخ *</label>
              <input
                type="date"
                value={form.holidayDate}
                onChange={(e) => setForm({ ...form, holidayDate: e.target.value })}
                className="mt-2 w-full input-field font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">الاسم (عربي) *</label>
              <input
                value={form.holidayNameAr}
                onChange={(e) => setForm({ ...form, holidayNameAr: e.target.value })}
                className="mt-2 w-full input-field"
                placeholder="عيد"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">الاسم (إنجليزي)</label>
              <input
                value={form.holidayNameEn || ''}
                onChange={(e) => setForm({ ...form, holidayNameEn: e.target.value })}
                className="mt-2 w-full input-field"
                placeholder="Holiday"
                dir="ltr"
              />
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

export default HolidaysPage;

