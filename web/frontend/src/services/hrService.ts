import apiClient from './apiClient';

/**
 * 7) وحدة الموارد البشرية (مبسطة)
 *
 * بيانات الموظفين:
 * - البيانات الأساسية
 * - الوظيفة والقسم
 * - تاريخ التعيين
 * - الراتب والبدلات
 *
 * الحضور والانصراف:
 * - تسجيل يدوي أو بالبصمة
 * - الإجازات والغياب
 * - العمل الإضافي
 *
 * المرتبات:
 * - حساب المرتب الشهري
 * - الاستقطاعات (تأمينات، ضرائب، سلف)
 * - صرف المرتبات
 */

export interface LeaveTypeDto {
  leaveTypeCode: string;
  leaveTypeNameAr: string;
  leaveTypeNameEn?: string;
  isPaid: boolean;
  maxDaysPerYear?: number | null;
  isActive: boolean;
}

export interface WorkShiftDto {
  shiftId?: number;
  shiftCode: string;
  shiftNameAr: string;
  shiftNameEn?: string;
  /** HH:mm */
  startTime: string;
  /** HH:mm */
  endTime: string;
  graceMinutes: number;
  isNightShift: boolean;
  isActive: boolean;
}

export interface HolidayDto {
  holidayId?: number;
  /** yyyy-MM-dd */
  holidayDate: string;
  holidayNameAr: string;
  holidayNameEn?: string;
  isActive: boolean;
}

export interface EmployeeShiftDto {
  employeeShiftId?: number;
  employeeId: number;
  employeeNameAr?: string;
  shiftId: number;
  shiftCode?: string;
  shiftNameAr?: string;
  /** yyyy-MM-dd */
  effectiveFrom: string;
  /** yyyy-MM-dd */
  effectiveTo?: string | null;
  isActive: boolean;
}

export interface AttendanceDto {
  attendanceId?: number;
  employeeId: number;
  employeeNameAr?: string;
  /** yyyy-MM-dd */
  attendanceDate: string;
  /** HH:mm */
  checkInTime?: string | null;
  /** HH:mm */
  checkOutTime?: string | null;
  status?: string;
  leaveType?: string;
  overtimeHours?: number | null;
  notes?: string;
}

export interface PayrollItemDto {
  componentId: number;
  componentNameAr?: string | null;
  componentType?: string | null;
  amount?: number | null;
}

export interface PayrollDto {
  payrollId: number;
  employeeId: number;
  employeeNameAr?: string;
  payrollMonth: number;
  payrollYear: number;
  basicSalary?: number | null;
  totalEarnings?: number | null;
  totalDeductions?: number | null;
  netSalary?: number | null;
  status?: string;
  paymentDate?: string | null;
  items: PayrollItemDto[];
}

type ApiResp<T> = { success: boolean; message?: string; data: T };

export const hrService = {
  // Leave Types
  async getLeaveTypes(activeOnly = false) {
    const res = await apiClient.get<ApiResp<LeaveTypeDto[]>>(`/hr/leave-types?activeOnly=${activeOnly}`);
    return res.data;
  },
  async saveLeaveType(code: string, dto: LeaveTypeDto) {
    const res = await apiClient.put<ApiResp<LeaveTypeDto>>(`/hr/leave-types/${encodeURIComponent(code)}`, dto);
    return res.data;
  },
  async deleteLeaveType(code: string) {
    const res = await apiClient.delete<ApiResp<void>>(`/hr/leave-types/${encodeURIComponent(code)}`);
    return res.data;
  },

  // Shifts
  async getShifts(activeOnly = false) {
    const res = await apiClient.get<ApiResp<WorkShiftDto[]>>(`/hr/shifts?activeOnly=${activeOnly}`);
    return res.data;
  },
  async createShift(dto: WorkShiftDto) {
    const res = await apiClient.post<ApiResp<WorkShiftDto>>(`/hr/shifts`, dto);
    return res.data;
  },
  async updateShift(id: number, dto: WorkShiftDto) {
    const res = await apiClient.put<ApiResp<WorkShiftDto>>(`/hr/shifts/${id}`, dto);
    return res.data;
  },
  async deleteShift(id: number) {
    const res = await apiClient.delete<ApiResp<void>>(`/hr/shifts/${id}`);
    return res.data;
  },

  // Holidays
  async getHolidays(activeOnly = false) {
    const res = await apiClient.get<ApiResp<HolidayDto[]>>(`/hr/holidays?activeOnly=${activeOnly}`);
    return res.data;
  },
  async createHoliday(dto: HolidayDto) {
    const res = await apiClient.post<ApiResp<HolidayDto>>(`/hr/holidays`, dto);
    return res.data;
  },
  async updateHoliday(id: number, dto: HolidayDto) {
    const res = await apiClient.put<ApiResp<HolidayDto>>(`/hr/holidays/${id}`, dto);
    return res.data;
  },
  async deleteHoliday(id: number) {
    const res = await apiClient.delete<ApiResp<void>>(`/hr/holidays/${id}`);
    return res.data;
  },

  // Employee Shifts
  async getEmployeeShifts(employeeId?: number) {
    const qs = employeeId ? `?employeeId=${employeeId}` : '';
    const res = await apiClient.get<ApiResp<EmployeeShiftDto[]>>(`/hr/employee-shifts${qs}`);
    return res.data;
  },
  async createEmployeeShift(dto: EmployeeShiftDto) {
    const res = await apiClient.post<ApiResp<EmployeeShiftDto>>(`/hr/employee-shifts`, dto);
    return res.data;
  },
  async updateEmployeeShift(id: number, dto: EmployeeShiftDto) {
    const res = await apiClient.put<ApiResp<EmployeeShiftDto>>(`/hr/employee-shifts/${id}`, dto);
    return res.data;
  },
  async deleteEmployeeShift(id: number) {
    const res = await apiClient.delete<ApiResp<void>>(`/hr/employee-shifts/${id}`);
    return res.data;
  },

  // Attendance
  async getAttendance(fromDate: string, toDate: string, employeeId?: number) {
    const qs = new URLSearchParams({ fromDate, toDate });
    if (employeeId) qs.append('employeeId', String(employeeId));
    const res = await apiClient.get<ApiResp<AttendanceDto[]>>(`/hr/attendance?${qs.toString()}`);
    return res.data;
  },
  async saveAttendance(dto: AttendanceDto) {
    if (dto.attendanceId && dto.attendanceId !== 0) {
      const res = await apiClient.put<ApiResp<AttendanceDto>>(`/hr/attendance/${dto.attendanceId}`, dto);
      return res.data;
    } else {
      const res = await apiClient.post<ApiResp<AttendanceDto>>(`/hr/attendance`, dto);
      return res.data;
    }
  },

  // Payroll
  async getPayroll(month: number, year: number) {
    const qs = new URLSearchParams({ month: String(month), year: String(year) });
    const res = await apiClient.get<ApiResp<PayrollDto[]>>(`/hr/payroll?${qs.toString()}`);
    return res.data;
  },
  async generatePayroll(month: number, year: number) {
    const qs = new URLSearchParams({ month: String(month), year: String(year) });
    const res = await apiClient.post<ApiResp<PayrollDto[]>>(`/hr/payroll/generate?${qs.toString()}`, {});
    return res.data;
  },
};

