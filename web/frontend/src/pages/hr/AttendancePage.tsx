import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Calendar, CheckCircle2, Clock, RefreshCw, Save, Search, Users,
  XCircle, ChevronRight, ChevronLeft, Timer,
  UserCheck, UserX, CalendarDays, Zap, SunMedium, CheckCheck,
  AlertCircle, Coffee, ClipboardList, ListChecks, Filter,
  UserMinus, Briefcase, Building2
} from 'lucide-react';
import { hrService } from '../../services/hrService';
import type { AttendanceDto } from '../../services/hrService';
import employeeService, { type Employee } from '../../services/employeeService';
import { toast } from 'react-hot-toast';

// ════════════════════════════════════════════
// ─── Helpers ───
// ════════════════════════════════════════════
const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const getDayName = (dateStr: string) => ARABIC_DAYS[new Date(dateStr).getDay()];
const isWeekend = (dateStr: string) => {
  const d = new Date(dateStr).getDay();
  return d === 5 || d === 6;
};
const isToday = (dateStr: string) => dateStr === new Date().toISOString().slice(0, 10);
const formatDateArabic = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const getFullArabicDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${ARABIC_DAYS[d.getDay()]}، ${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
};

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
};

// ════════════════════════════════════════════
// ─── Shared UI Components ───
// ════════════════════════════════════════════
const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const StatCard = ({
  icon: Icon, label, value, sub, color
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string;
}) => {
  const cls: Record<string, { grad: string; bg: string; txt: string }> = {
    emerald: {
      grad: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
      bg: 'bg-emerald-50 border-emerald-100',
      txt: 'text-emerald-700'
    },
    rose: {
      grad: 'from-rose-500 to-rose-600 shadow-rose-200',
      bg: 'bg-rose-50 border-rose-100',
      txt: 'text-rose-700'
    },
    amber: {
      grad: 'from-amber-500 to-amber-600 shadow-amber-200',
      bg: 'bg-amber-50 border-amber-100',
      txt: 'text-amber-700'
    },
    blue: {
      grad: 'from-blue-500 to-blue-600 shadow-blue-200',
      bg: 'bg-blue-50 border-blue-100',
      txt: 'text-blue-700'
    },
    violet: {
      grad: 'from-violet-500 to-violet-600 shadow-violet-200',
      bg: 'bg-violet-50 border-violet-100',
      txt: 'text-violet-700'
    },
  };
  const c = cls[color] || cls.blue;
  return (
    <div className={`rounded-2xl border p-4 ${c.bg} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.grad} shadow-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className={`text-2xl font-bold ${c.txt}`}>{value}</p>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
};

const ToggleSwitch = ({
  checked, onChange, disabled, size = 'md'
}: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; size?: 'sm' | 'md';
}) => {
  const sizes = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-3.5 w-3.5',
      on: '-translate-x-[18px]',
      off: '-translate-x-[3px]'
    },
    md: {
      track: 'h-7 w-12',
      thumb: 'h-5 w-5',
      on: '-translate-x-6',
      off: '-translate-x-1'
    },
  };
  const s = sizes[size];
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex ${s.track} items-center rounded-full 
        transition-all duration-300 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-brand-primary/50
        ${checked
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-inner'
          : 'bg-slate-200 hover:bg-slate-300'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span className={`inline-block ${s.thumb} transform rounded-full bg-white 
        shadow-md transition-all duration-300 ${checked ? s.on : s.off}`} />
    </button>
  );
};

const SkeletonRow = ({ cols = 5 }: { cols?: number }) => (
  <tr className="border-b border-slate-50">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-5 bg-slate-100 rounded-lg animate-pulse"
          style={{ width: `${60 + Math.random() * 40}%` }} />
      </td>
    ))}
  </tr>
);

// ════════════════════════════════════════════
// ─── Tab: Individual Record (سجل الحضور) ───
// ════════════════════════════════════════════
const IndividualRecordTab: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<AttendanceDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activePreset, setActivePreset] = useState('today');

  const load = useCallback(async () => {
    if (!fromDate || !toDate) return;
    setIsLoading(true);
    try {
      const res = await hrService.getAttendance(fromDate, toDate, selectedEmployeeId || undefined);
      if (res.success) {
        setItems(res.data);
        setHasChanges(false);
      }
    } catch {
      toast.error('فشل في تحميل الحضور');
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, selectedEmployeeId]);

  useEffect(() => { load(); }, []);

  const dates = useMemo(() => {
    if (!fromDate || !toDate) return [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const arr: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  }, [fromDate, toDate]);

  const getRow = useCallback((date: string): AttendanceDto => {
    const existing = items.find(
      x => x.attendanceDate === date &&
        (!selectedEmployeeId || x.employeeId === selectedEmployeeId)
    );
    return existing ?? {
      attendanceDate: date,
      employeeId: typeof selectedEmployeeId === 'number' ? selectedEmployeeId : 0,
      status: 'ABSENT',
      overtimeHours: 0,
    };
  }, [items, selectedEmployeeId]);

  const upsertRow = useCallback((row: AttendanceDto) => {
    setHasChanges(true);
    setItems(prev => {
      const copy = [...prev];
      const idx = copy.findIndex(
        x => x.attendanceId === row.attendanceId &&
          x.attendanceDate === row.attendanceDate &&
          x.employeeId === row.employeeId
      );
      if (idx >= 0) copy[idx] = row;
      else copy.push(row);
      return copy;
    });
  }, []);

  const onTogglePresent = useCallback((date: string, checked: boolean) => {
    if (!selectedEmployeeId) {
      toast.error('اختر موظفاً أولاً');
      return;
    }
    const row = getRow(date);
    upsertRow({
      ...row,
      employeeId: selectedEmployeeId as number,
      status: checked ? 'PRESENT' : 'ABSENT',
      checkInTime: checked ? '08:00' : null,
      checkOutTime: checked ? '16:00' : null,
    });
  }, [selectedEmployeeId, getRow, upsertRow]);

  const onTimeChange = useCallback((
    date: string, field: 'checkInTime' | 'checkOutTime', value: string
  ) => {
    if (!selectedEmployeeId) return;
    const row = getRow(date);
    upsertRow({
      ...row,
      employeeId: selectedEmployeeId as number,
      [field]: value || null,
    });
  }, [selectedEmployeeId, getRow, upsertRow]);

  const onOvertimeChange = useCallback((date: string, value: string) => {
    if (!selectedEmployeeId) return;
    const row = getRow(date);
    upsertRow({
      ...row,
      employeeId: selectedEmployeeId as number,
      overtimeHours: value === '' ? 0 : Number(value),
    });
  }, [selectedEmployeeId, getRow, upsertRow]);

  const markAllPresent = useCallback(() => {
    if (!selectedEmployeeId) {
      toast.error('اختر موظفاً أولاً');
      return;
    }
    const workDays = dates.filter(d => !isWeekend(d));
    workDays.forEach(date => {
      const row = getRow(date);
      upsertRow({
        ...row,
        employeeId: selectedEmployeeId as number,
        status: 'PRESENT',
        checkInTime: row.checkInTime || '08:00',
        checkOutTime: row.checkOutTime || '16:00',
      });
    });
    toast.success(`تم تحديد ${workDays.length} يوم عمل كحاضر`);
  }, [selectedEmployeeId, dates, getRow, upsertRow]);

  const onSave = async () => {
    if (!selectedEmployeeId) {
      toast.error('اختر موظفاً أولاً');
      return;
    }
    const toSave = items.filter(
      x => x.employeeId === selectedEmployeeId && dates.includes(x.attendanceDate)
    );
    if (toSave.length === 0) {
      toast.error('لا توجد سجلات للحفظ');
      return;
    }
    setSaving(true);
    try {
      for (const dto of toSave) {
        if (!dto.employeeId || !dto.attendanceDate) continue;
        await hrService.saveAttendance(dto);
      }
      toast.success('تم حفظ الحضور بنجاح');
      setHasChanges(false);
      load();
    } catch {
      toast.error('فشل حفظ الحضور');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    const today = new Date().toISOString().slice(0, 10);
    if (preset === 'today') {
      setFromDate(today);
      setToDate(today);
    } else if (preset === 'week') {
      const { from, to } = getWeekRange();
      setFromDate(from);
      setToDate(to);
    } else if (preset === 'month') {
      const { from, to } = getMonthRange();
      setFromDate(from);
      setToDate(to);
    }
  };

  const navigateDates = (dir: 'prev' | 'next') => {
    const diff = dates.length || 1;
    const shift = dir === 'next' ? diff : -diff;
    const nf = new Date(fromDate);
    nf.setDate(nf.getDate() + shift);
    const nt = new Date(toDate);
    nt.setDate(nt.getDate() + shift);
    setFromDate(nf.toISOString().slice(0, 10));
    setToDate(nt.toISOString().slice(0, 10));
    setActivePreset('');
  };

  const stats = useMemo(() => {
    const filtered = items.filter(
      x => (!selectedEmployeeId || x.employeeId === selectedEmployeeId) &&
        dates.includes(x.attendanceDate)
    );
    const present = filtered.filter(x => x.status === 'PRESENT').length;
    const workDays = dates.filter(d => !isWeekend(d)).length;
    const absent = Math.max(0, workDays - present);
    const totalOT = filtered.reduce((s, x) => s + (x.overtimeHours || 0), 0);
    const weekends = dates.filter(d => isWeekend(d)).length;
    return { present, absent, totalOT, weekends, workDays };
  }, [items, dates, selectedEmployeeId]);

  const selectedEmployee = employees.find(e => e.employeeId === selectedEmployeeId);

  return (
    <div className="space-y-5">
      {/* Selected Employee Badge */}
      {selectedEmployee && (
        <div className="flex items-center gap-3 bg-brand-primary/5 border 
          border-brand-primary/20 rounded-2xl px-5 py-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary 
            to-brand-primary/80 flex items-center justify-center text-white 
            font-bold text-lg shadow-md">
            {selectedEmployee.fullNameAr?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800">{selectedEmployee.fullNameAr}</p>
            <p className="text-xs text-slate-500">
              {selectedEmployee.jobTitle || 'موظف'} • {selectedEmployee.departmentNameAr || ''}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {dates.length > 0 && selectedEmployeeId && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={UserCheck} label="أيام الحضور" value={stats.present}
            sub={`من ${stats.workDays} يوم عمل`} color="emerald" />
          <StatCard icon={UserX} label="أيام الغياب" value={stats.absent} color="rose" />
          <StatCard icon={Timer} label="ساعات إضافية" value={stats.totalOT}
            sub="إجمالي الساعات" color="amber" />
          <StatCard icon={Coffee} label="أيام العطل" value={stats.weekends}
            sub="جمعة + سبت" color="blue" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 ml-2">فترة سريعة:</span>
          {[
            { id: 'today', label: 'اليوم', icon: SunMedium },
            { id: 'week', label: 'هذا الأسبوع', icon: Calendar },
            { id: 'month', label: 'هذا الشهر', icon: CalendarDays },
          ].map(p => (
            <button key={p.id} onClick={() => applyPreset(p.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg 
                text-xs font-semibold transition-all duration-200
                ${activePreset === p.id
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <p.icon className="w-3.5 h-3.5" />{p.label}
            </button>
          ))}
          <div className="flex items-center gap-1 mr-auto">
            <button onClick={() => navigateDates('next')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 
                hover:text-slate-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigateDates('prev')}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 
                hover:text-slate-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center 
                gap-1.5 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" /> الموظف
              </label>
              <div className="relative">
                <select value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(
                    e.target.value ? Number(e.target.value) : ''
                  )}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 
                    rounded-xl px-4 py-3 text-sm font-medium text-slate-700
                    focus:outline-none focus:ring-2 focus:ring-brand-primary/30 
                    focus:border-brand-primary transition-all duration-200 
                    hover:border-slate-300 cursor-pointer">
                  <option value="">— اختر موظفاً —</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.fullNameAr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 
                  w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center 
                gap-1.5 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" /> من تاريخ
              </label>
              <input type="date" value={fromDate}
                onChange={e => { setFromDate(e.target.value); setActivePreset(''); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl 
                  px-4 py-3 text-sm font-mono text-slate-700 focus:outline-none 
                  focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary 
                  transition-all duration-200 hover:border-slate-300"
                dir="ltr" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center 
                gap-1.5 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" /> إلى تاريخ
              </label>
              <input type="date" value={toDate}
                onChange={e => { setToDate(e.target.value); setActivePreset(''); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl 
                  px-4 py-3 text-sm font-mono text-slate-700 focus:outline-none 
                  focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary 
                  transition-all duration-200 hover:border-slate-300"
                dir="ltr" />
            </div>

            <div className="flex items-end gap-2">
              <button onClick={load} disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 
                  bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold 
                  text-sm px-4 py-3 rounded-xl transition-all duration-200 
                  disabled:opacity-50 border border-slate-200 hover:border-slate-300">
                {isLoading
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Search className="w-4 h-4" />}
                عرض
              </button>
              <button onClick={onSave} disabled={saving || !hasChanges}
                className={`flex-1 inline-flex items-center justify-center gap-2 
                  font-semibold text-sm px-4 py-3 rounded-xl transition-all 
                  duration-200 disabled:opacity-40 border
                  ${hasChanges
                    ? 'bg-brand-primary hover:bg-brand-primary/90 text-white border-brand-primary shadow-lg shadow-brand-primary/25'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}>
                {saving
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />}
                حفظ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {dates.length > 0 && selectedEmployeeId && (
          <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap 
            items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="w-4 h-4" />
              <span className="font-semibold text-slate-700">
                {formatDateArabic(fromDate)}
              </span>
              {fromDate !== toDate && (
                <>
                  <span>←</span>
                  <span className="font-semibold text-slate-700">
                    {formatDateArabic(toDate)}
                  </span>
                </>
              )}
              <span className="text-slate-400 text-xs">({dates.length} يوم)</span>
            </div>
            <button onClick={markAllPresent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
                bg-emerald-50 text-emerald-700 text-xs font-semibold 
                hover:bg-emerald-100 transition-colors border border-emerald-200">
              <CheckCheck className="w-3.5 h-3.5" /> تحديد الكل حاضر (أيام العمل)
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 
                  uppercase tracking-wider w-48">اليوم / التاريخ</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 
                  uppercase tracking-wider w-32">الحالة</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 
                  uppercase tracking-wider w-44">الحضور</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 
                  uppercase tracking-wider w-44">الانصراف</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 
                  uppercase tracking-wider w-36">عمل إضافي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(7)].map((_, i) => <SkeletonRow key={i} />)
              ) : !selectedEmployeeId ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 
                        flex items-center justify-center">
                        <Users className="w-10 h-10 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-slate-700 font-semibold text-lg">اختر موظفاً</p>
                        <p className="text-slate-400 text-sm mt-1">
                          حدد الموظف من القائمة أعلاه لعرض وتعديل الحضور
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : dates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 
                        flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-slate-700 font-semibold text-lg">حدد الفترة الزمنية</p>
                        <p className="text-slate-400 text-sm mt-1">
                          اختر تاريخ البداية والنهاية ثم اضغط "عرض"
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                dates.map(date => {
                  const row = getRow(date);
                  const present = row.status === 'PRESENT';
                  const weekend = isWeekend(date);
                  const today = isToday(date);

                  return (
                    <tr key={date}
                      className={`transition-colors duration-150
                        ${weekend
                          ? 'bg-amber-50/40'
                          : today
                            ? 'bg-brand-primary/[0.03]'
                            : 'hover:bg-slate-50/80'}
                        ${present && !weekend ? 'bg-emerald-50/30' : ''}`}>

                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center 
                            justify-center text-sm font-bold shrink-0
                            ${today
                              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                              : weekend
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'}`}>
                            {new Date(date).getDate()}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold
                              ${today
                                ? 'text-brand-primary'
                                : weekend
                                  ? 'text-amber-700'
                                  : 'text-slate-700'}`}>
                              {getDayName(date)}
                              {today && (
                                <span className="mr-2 inline-flex items-center gap-1 
                                  px-2 py-0.5 rounded-full text-[10px] font-bold 
                                  bg-brand-primary/10 text-brand-primary">
                                  اليوم
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5"
                              dir="ltr">{date}</p>
                          </div>
                        </div>
                      </td>

                      {/* Toggle */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <ToggleSwitch checked={present}
                            onChange={v => onTogglePresent(date, v)}
                            disabled={weekend} />
                          <span className={`text-xs font-semibold min-w-[40px]
                            ${present
                              ? 'text-emerald-600'
                              : weekend
                                ? 'text-amber-500'
                                : 'text-slate-400'}`}>
                            {weekend ? 'عطلة' : present ? 'حاضر' : 'غائب'}
                          </span>
                        </div>
                      </td>

                      {/* Check In */}
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          {present ? (
                            <input type="time"
                              value={row.checkInTime || '08:00'}
                              onChange={e => onTimeChange(date, 'checkInTime', e.target.value)}
                              className="w-32 bg-emerald-50 border border-emerald-200 
                                rounded-lg px-3 py-2 text-xs font-mono text-emerald-700 
                                focus:outline-none focus:ring-2 focus:ring-emerald-300 
                                focus:border-emerald-400 transition-all duration-200"
                              dir="ltr" />
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Check Out */}
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          {present ? (
                            <input type="time"
                              value={row.checkOutTime || '16:00'}
                              onChange={e => onTimeChange(date, 'checkOutTime', e.target.value)}
                              className="w-32 bg-rose-50 border border-rose-200 
                                rounded-lg px-3 py-2 text-xs font-mono text-rose-700 
                                focus:outline-none focus:ring-2 focus:ring-rose-300 
                                focus:border-rose-400 transition-all duration-200"
                              dir="ltr" />
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Overtime */}
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          <div className="relative">
                            <Zap className={`absolute right-2.5 top-1/2 -translate-y-1/2 
                              w-3.5 h-3.5 pointer-events-none
                              ${(row.overtimeHours ?? 0) > 0
                                ? 'text-amber-500'
                                : 'text-slate-300'}`} />
                            <input type="number" min={0} max={12} step={0.5}
                              value={row.overtimeHours ?? 0}
                              onChange={e => onOvertimeChange(date, e.target.value)}
                              disabled={weekend}
                              className={`w-28 border rounded-lg pr-8 pl-3 py-2 
                                text-xs font-mono text-center focus:outline-none 
                                focus:ring-2 transition-all duration-200
                                ${(row.overtimeHours ?? 0) > 0
                                  ? 'bg-amber-50 border-amber-200 text-amber-700 focus:ring-amber-300 focus:border-amber-400'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 focus:ring-slate-300 focus:border-slate-300'}`} />
                            {(row.overtimeHours ?? 0) > 0 && (
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 
                                text-[10px] font-bold text-amber-500">س</span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {hasChanges && (
          <div className="px-5 py-3 bg-amber-50 border-t border-amber-200 
            flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
              <AlertCircle className="w-4 h-4" /> يوجد تعديلات غير محفوظة
            </div>
            <button onClick={onSave} disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-primary text-white 
                text-sm font-semibold px-5 py-2 rounded-xl hover:bg-brand-primary/90 
                shadow-md shadow-brand-primary/25 transition-all duration-200 
                disabled:opacity-50">
              {saving
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />}
              حفظ التعديلات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════
// ─── Tab: Daily Check (الحضور اليومي) ───
// ════════════════════════════════════════════
type DailyStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface DailyRow {
  employee: Employee;
  attendance: AttendanceDto;
  changed: boolean;
}

const statusConfig: Record<DailyStatus, {
  label: string; color: string; bg: string; border: string; icon: React.ElementType;
}> = {
  PRESENT: {
    label: 'حاضر', color: 'text-emerald-700', bg: 'bg-emerald-50',
    border: 'border-emerald-200', icon: CheckCircle2
  },
  ABSENT: {
    label: 'غائب', color: 'text-rose-700', bg: 'bg-rose-50',
    border: 'border-rose-200', icon: XCircle
  },
  LATE: {
    label: 'متأخر', color: 'text-amber-700', bg: 'bg-amber-50',
    border: 'border-amber-200', icon: Clock
  },
  EXCUSED: {
    label: 'مستأذن', color: 'text-blue-700', bg: 'bg-blue-50',
    border: 'border-blue-200', icon: UserMinus
  },
};

const DailyCheckTab: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<DailyStatus | 'ALL'>('ALL');
  const [filterDept, setFilterDept] = useState('ALL');

  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.departmentNameAr).filter(Boolean));
    return Array.from(depts) as string[];
  }, [employees]);

  const loadDaily = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await hrService.getAttendance(date, date);
      const attendanceMap = new Map<number, AttendanceDto>();
      if (res.success && res.data) {
        res.data.forEach((a: AttendanceDto) => attendanceMap.set(a.employeeId, a));
      }
      const dailyRows: DailyRow[] = employees.map(emp => ({
        employee: emp,
        attendance: attendanceMap.get(emp.employeeId!) ?? {
          attendanceDate: date,
          employeeId: emp.employeeId!,
          status: 'ABSENT' as DailyStatus,
          overtimeHours: 0,
          checkInTime: null,
          checkOutTime: null,
        },
        changed: false,
      }));
      setRows(dailyRows);
    } catch {
      toast.error('فشل في تحميل بيانات اليوم');
    } finally {
      setIsLoading(false);
    }
  }, [date, employees]);

  useEffect(() => {
    if (employees.length > 0) loadDaily();
  }, [loadDaily, employees.length]);

  const updateRow = useCallback((employeeId: number, updates: Partial<AttendanceDto>) => {
    setRows(prev => prev.map(r =>
      r.employee.employeeId === employeeId
        ? { ...r, attendance: { ...r.attendance, ...updates }, changed: true }
        : r
    ));
  }, []);

  const toggleStatus = useCallback((employeeId: number) => {
    setRows(prev => prev.map(r => {
      if (r.employee.employeeId !== employeeId) return r;
      const current = r.attendance.status as DailyStatus;
      const order: DailyStatus[] = ['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'];
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      const next = order[nextIdx];
      return {
        ...r,
        changed: true,
        attendance: {
          ...r.attendance,
          status: next,
          checkInTime: next === 'PRESENT'
            ? (r.attendance.checkInTime || '08:00')
            : next === 'LATE'
              ? (r.attendance.checkInTime || '09:00')
              : null,
          checkOutTime: (next === 'PRESENT' || next === 'LATE')
            ? (r.attendance.checkOutTime || '16:00')
            : null,
        },
      };
    }));
  }, []);

  const setAllStatus = useCallback((status: DailyStatus) => {
    setRows(prev => prev.map(r => ({
      ...r,
      changed: true,
      attendance: {
        ...r.attendance,
        status,
        checkInTime: status === 'PRESENT'
          ? '08:00'
          : status === 'LATE'
            ? '09:00'
            : null,
        checkOutTime: (status === 'PRESENT' || status === 'LATE')
          ? '16:00'
          : null,
      },
    })));
    toast.success(`تم تحديد جميع الموظفين: ${statusConfig[status].label}`);
  }, []);

  const onSaveDaily = async () => {
    const toSave = rows.filter(r => r.changed);
    if (toSave.length === 0) {
      toast('لا يوجد تعديلات للحفظ', { icon: 'ℹ️' });
      return;
    }
    setSaving(true);
    try {
      for (const r of toSave) {
        await hrService.saveAttendance(r.attendance);
      }
      toast.success(`تم حفظ حضور ${toSave.length} موظف بنجاح`);
      loadDaily();
    } catch {
      toast.error('فشل حفظ الحضور');
    } finally {
      setSaving(false);
    }
  };

  const navigateDate = (dir: 'prev' | 'next') => {
    const d = new Date(date);
    d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
    setDate(d.toISOString().slice(0, 10));
  };

  const goToday = () => setDate(new Date().toISOString().slice(0, 10));

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (r.employee.fullNameAr || '').toLowerCase();
        const nameEn = (r.employee.fullNameEn || '').toLowerCase();
        const empNo = (r.employee.employeeCode || '').toLowerCase();
        if (!name.includes(q) && !nameEn.includes(q) && !empNo.includes(q))
          return false;
      }
      if (filterStatus !== 'ALL' && r.attendance.status !== filterStatus)
        return false;
      if (filterDept !== 'ALL' && r.employee.departmentNameAr !== filterDept)
        return false;
      return true;
    });
  }, [rows, searchQuery, filterStatus, filterDept]);

  const stats = useMemo(() => {
    const total = rows.length;
    const present = rows.filter(r => r.attendance.status === 'PRESENT').length;
    const late = rows.filter(r => r.attendance.status === 'LATE').length;
    const excused = rows.filter(r => r.attendance.status === 'EXCUSED').length;
    const absent = rows.filter(r => r.attendance.status === 'ABSENT').length;
    const changed = rows.filter(r => r.changed).length;
    return { total, present, late, excused, absent, changed };
  }, [rows]);

  const weekend = isWeekend(date);

  return (
    <div className="space-y-5">
      {/* Date Navigator */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center 
          justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              <button onClick={() => navigateDate('next')}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm 
                  text-slate-500 hover:text-slate-700 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={goToday}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${isToday(date)
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'hover:bg-white hover:shadow-sm text-slate-600'}`}>
                اليوم
              </button>
              <button onClick={() => navigateDate('prev')}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm 
                  text-slate-500 hover:text-slate-700 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input type="date" value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 
                  py-2.5 text-sm font-mono text-slate-700 focus:outline-none 
                  focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary 
                  transition-all duration-200"
                dir="ltr" />
              <div>
                <p className={`text-lg font-bold
                  ${weekend
                    ? 'text-amber-700'
                    : isToday(date)
                      ? 'text-brand-primary'
                      : 'text-slate-800'}`}>
                  {getFullArabicDate(date)}
                </p>
                {weekend && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 
                    rounded-full text-[11px] font-bold bg-amber-100 
                    text-amber-700 mt-1">
                    <Coffee className="w-3 h-3" /> يوم عطلة
                  </span>
                )}
                {isToday(date) && !weekend && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 
                    rounded-full text-[11px] font-bold bg-brand-primary/10 
                    text-brand-primary mt-1">
                    <SunMedium className="w-3 h-3" /> اليوم
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadDaily} disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 
                hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl 
                transition-all border border-slate-200 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <button onClick={onSaveDaily} disabled={saving || stats.changed === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold 
                text-sm rounded-xl transition-all border
                ${stats.changed > 0
                  ? 'bg-brand-primary hover:bg-brand-primary/90 text-white border-brand-primary shadow-lg shadow-brand-primary/25'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}>
              {saving
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />}
              حفظ الحضور
              {stats.changed > 0 && (
                <span className="bg-white/20 text-white text-[11px] font-bold 
                  px-1.5 py-0.5 rounded-full">{stats.changed}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={Users} label="إجمالي الموظفين" value={stats.total}
          color="blue" />
        <StatCard icon={UserCheck} label="حاضر" value={stats.present}
          sub={stats.total
            ? `${Math.round(stats.present / stats.total * 100)}%`
            : ''} color="emerald" />
        <StatCard icon={Clock} label="متأخر" value={stats.late} color="amber" />
        <StatCard icon={UserMinus} label="مستأذن" value={stats.excused}
          color="violet" />
        <StatCard icon={UserX} label="غائب" value={stats.absent} color="rose" />
      </div>

      {/* Search & Filters & Bulk Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 
        space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 
              text-slate-400" />
            <input type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الرقم الوظيفي..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl 
                pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 
                focus:ring-brand-primary/30 focus:border-brand-primary 
                transition-all hover:border-slate-300" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">
              <Filter className="w-3.5 h-3.5 inline ml-1" />تصفية:
            </span>
            {[
              { id: 'ALL' as const, label: 'الكل', count: stats.total },
              ...Object.entries(statusConfig).map(([k, v]) => ({
                id: k as DailyStatus,
                label: v.label,
                count: k === 'PRESENT'
                  ? stats.present
                  : k === 'ABSENT'
                    ? stats.absent
                    : k === 'LATE'
                      ? stats.late
                      : stats.excused,
              })),
            ].map(f => (
              <button key={f.id} onClick={() => setFilterStatus(f.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 
                  rounded-lg text-xs font-semibold transition-all
                  ${filterStatus === f.id
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {f.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full
                  ${filterStatus === f.id ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Department filter */}
        {departments.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400">
              <Building2 className="w-3.5 h-3.5 inline ml-1" />القسم:
            </span>
            <button onClick={() => setFilterDept('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filterDept === 'ALL'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              الكل
            </button>
            {departments.map(dept => (
              <button key={dept} onClick={() => setFilterDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold 
                  transition-all
                  ${filterDept === dept
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {dept}
              </button>
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 ml-2">
            إجراء جماعي:
          </span>
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button key={key}
                onClick={() => setAllStatus(key as DailyStatus)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 
                  rounded-lg text-xs font-semibold transition-all 
                  ${cfg.bg} ${cfg.color} ${cfg.border} border hover:opacity-80`}>
                <Icon className="w-3.5 h-3.5" /> الكل {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm 
        overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-5 py-3.5 text-right text-xs font-bold 
                  text-slate-500 uppercase tracking-wider w-16">#</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold 
                  text-slate-500 uppercase tracking-wider">الموظف</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold 
                  text-slate-500 uppercase tracking-wider w-44">الحالة</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold 
                  text-slate-500 uppercase tracking-wider w-40">الحضور</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold 
                  text-slate-500 uppercase tracking-wider w-40">الانصراف</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold 
                  text-slate-500 uppercase tracking-wider w-32">إضافي</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold 
                  text-slate-500 uppercase tracking-wider w-28">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 
                        flex items-center justify-center">
                        <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">لا يوجد نتائج</p>
                      <p className="text-slate-400 text-sm">
                        حاول تغيير معايير البحث أو التصفية
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const st = statusConfig[row.attendance.status as DailyStatus]
                    || statusConfig.ABSENT;
                  const StatusIcon = st.icon;
                  const isPresent = row.attendance.status === 'PRESENT'
                    || row.attendance.status === 'LATE';

                  return (
                    <tr key={row.employee.employeeId}
                      className={`transition-all duration-150 group
                        ${row.changed
                          ? 'bg-amber-50/30 border-r-4 border-r-amber-400'
                          : 'hover:bg-slate-50/80'}
                        ${row.attendance.status === 'PRESENT'
                          ? 'hover:bg-emerald-50/30'
                          : ''}
                        ${row.attendance.status === 'ABSENT'
                          ? 'hover:bg-rose-50/20'
                          : ''}`}>

                      {/* # */}
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono text-slate-400">
                          {idx + 1}
                        </span>
                      </td>

                      {/* Employee */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center 
                            justify-center text-sm font-bold shrink-0
                            ${row.attendance.status === 'PRESENT'
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                              : row.attendance.status === 'LATE'
                                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                                : row.attendance.status === 'EXCUSED'
                                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-500'}`}>
                            {row.employee.fullNameAr?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {row.employee.fullNameAr}
                              {row.changed && (
                                <span className="mr-2 inline-block w-1.5 h-1.5 
                                  rounded-full bg-amber-500 animate-pulse" />
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {row.employee.employeeCode && (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  #{row.employee.employeeCode}
                                </span>
                              )}
                              {row.employee.departmentNameAr && (
                                <span className="text-[11px] text-slate-400 
                                  flex items-center gap-0.5">
                                  <Building2 className="w-3 h-3" />
                                  {row.employee.departmentNameAr}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleStatus(row.employee.employeeId!)}
                          className={`inline-flex items-center gap-2 px-4 py-2 
                            rounded-xl text-xs font-bold transition-all duration-200 
                            border cursor-pointer hover:shadow-md active:scale-95
                            ${st.bg} ${st.color} ${st.border}`}>
                          <StatusIcon className="w-4 h-4" />
                          {st.label}
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                      </td>

                      {/* Check In */}
                      <td className="px-5 py-3">
                        <div className="flex justify-center">
                          {isPresent ? (
                            <input type="time"
                              value={row.attendance.checkInTime || '08:00'}
                              onChange={e => updateRow(
                                row.employee.employeeId!,
                                { checkInTime: e.target.value || null }
                              )}
                              className="w-32 bg-emerald-50 border border-emerald-200 
                                rounded-lg px-3 py-2 text-xs font-mono 
                                text-emerald-700 focus:outline-none focus:ring-2 
                                focus:ring-emerald-300 transition-all"
                              dir="ltr" />
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Check Out */}
                      <td className="px-5 py-3">
                        <div className="flex justify-center">
                          {isPresent ? (
                            <input type="time"
                              value={row.attendance.checkOutTime || '16:00'}
                              onChange={e => updateRow(
                                row.employee.employeeId!,
                                { checkOutTime: e.target.value || null }
                              )}
                              className="w-32 bg-rose-50 border border-rose-200 
                                rounded-lg px-3 py-2 text-xs font-mono text-rose-700 
                                focus:outline-none focus:ring-2 focus:ring-rose-300 
                                transition-all"
                              dir="ltr" />
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Overtime */}
                      <td className="px-5 py-3">
                        <div className="flex justify-center">
                          <div className="relative">
                            <Zap className={`absolute right-2 top-1/2 
                              -translate-y-1/2 w-3.5 h-3.5 pointer-events-none
                              ${(row.attendance.overtimeHours ?? 0) > 0
                                ? 'text-amber-500'
                                : 'text-slate-300'}`} />
                            <input type="number" min={0} max={12} step={0.5}
                              value={row.attendance.overtimeHours ?? 0}
                              onChange={e => updateRow(
                                row.employee.employeeId!,
                                {
                                  overtimeHours: e.target.value === ''
                                    ? 0
                                    : Number(e.target.value)
                                }
                              )}
                              className={`w-24 border rounded-lg pr-7 pl-2 py-2 
                                text-xs font-mono text-center focus:outline-none 
                                focus:ring-2 transition-all
                                ${(row.attendance.overtimeHours ?? 0) > 0
                                  ? 'bg-amber-50 border-amber-200 text-amber-700 focus:ring-amber-300'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 focus:ring-slate-300'}`} />
                          </div>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-5 py-3">
                        <div className="flex justify-center">
                          {row.attendance.status === 'LATE' && (
                            <span className="inline-flex items-center gap-1 px-2 
                              py-1 rounded-lg bg-amber-50 text-amber-600 
                              text-[10px] font-semibold border border-amber-200">
                              <AlertCircle className="w-3 h-3" /> تأخير
                            </span>
                          )}
                          {row.attendance.status === 'EXCUSED' && (
                            <span className="inline-flex items-center gap-1 px-2 
                              py-1 rounded-lg bg-blue-50 text-blue-600 
                              text-[10px] font-semibold border border-blue-200">
                              <Briefcase className="w-3 h-3" /> إذن
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between
          ${stats.changed > 0
            ? 'bg-amber-50 border-amber-200'
            : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              عرض <b className="text-slate-700">{filteredRows.length}</b> من{' '}
              <b className="text-slate-700">{rows.length}</b> موظف
            </span>
            {stats.changed > 0 && (
              <span className="flex items-center gap-1 text-amber-700 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                {stats.changed} تعديلات غير محفوظة
              </span>
            )}
          </div>
          {stats.changed > 0 && (
            <button onClick={onSaveDaily} disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-primary text-white 
                text-sm font-semibold px-5 py-2 rounded-xl 
                hover:bg-brand-primary/90 shadow-md shadow-brand-primary/25 
                transition-all disabled:opacity-50">
              {saving
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />}
              حفظ ({stats.changed})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════
// ─── Main Page with Tabs ───
// ════════════════════════════════════════════
type TabId = 'daily' | 'individual';

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('daily');
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await employeeService.getAll();
        setEmployees(data.content);
      } catch { /* ignore */ }
    })();
  }, []);

  const tabs: {
    id: TabId; label: string; icon: React.ElementType; description: string;
  }[] = [
      {
        id: 'daily', label: 'الحضور اليومي', icon: ListChecks,
        description: 'تسجيل حضور جميع الموظفين ليوم واحد',
      },
      {
        id: 'individual', label: 'سجل الحضور', icon: ClipboardList,
        description: 'تتبع حضور موظف محدد عبر فترة زمنية',
      },
    ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary 
        via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full 
          -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full 
          translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-8 left-12 w-20 h-20 bg-white/5 rounded-2xl 
          rotate-12" />
        <div className="relative flex flex-col md:flex-row items-start 
          md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl 
              flex items-center justify-center border border-white/20">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">الحضور والانصراف</h1>
              <p className="text-white/60 text-sm">
                تسجيل ومتابعة حضور الموظفين والعمل الإضافي
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-xl 
                  transition-all duration-300
                  ${isActive
                    ? 'bg-gradient-to-l from-brand-primary to-brand-primary/90 text-white shadow-lg shadow-brand-primary/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center 
                  justify-center shrink-0
                  ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                  <Icon className={`w-5 h-5 
                    ${isActive ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{tab.label}</p>
                  <p className={`text-[11px] mt-0.5 
                    ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'daily' && <DailyCheckTab employees={employees} />}
        {activeTab === 'individual' && <IndividualRecordTab employees={employees} />}
      </div>
    </div>
  );
};

export default AttendancePage;