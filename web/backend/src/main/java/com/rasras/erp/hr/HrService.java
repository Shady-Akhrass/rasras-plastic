package com.rasras.erp.hr;

import com.rasras.erp.employee.Employee;
import com.rasras.erp.employee.EmployeeRepository;
import com.rasras.erp.hr.dto.EmployeeShiftDto;
import com.rasras.erp.hr.dto.HolidayDto;
import com.rasras.erp.hr.dto.LeaveTypeDto;
import com.rasras.erp.hr.dto.WorkShiftDto;
import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HrService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final WorkShiftRepository workShiftRepository;
    private final HolidayRepository holidayRepository;
    private final EmployeeShiftRepository employeeShiftRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollRepository payrollRepository;
    private final PayrollDetailRepository payrollDetailRepository;
    private final SalaryComponentRepository salaryComponentRepository;

    // ---- Leave Types ----
    @Transactional(readOnly = true)
    public List<LeaveTypeDto> getAllLeaveTypes() {
        return leaveTypeRepository.findAll().stream().map(this::mapLeaveTypeToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveTypeDto> getActiveLeaveTypes() {
        return leaveTypeRepository.findByIsActiveTrue().stream().map(this::mapLeaveTypeToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveTypeDto upsertLeaveType(LeaveTypeDto dto) {
        LeaveType entity = leaveTypeRepository.findById(dto.getLeaveTypeCode()).orElse(new LeaveType());
        entity.setLeaveTypeCode(dto.getLeaveTypeCode());
        entity.setLeaveTypeNameAr(dto.getLeaveTypeNameAr());
        entity.setLeaveTypeNameEn(dto.getLeaveTypeNameEn());
        entity.setIsPaid(dto.getIsPaid() != null ? dto.getIsPaid() : true);
        entity.setMaxDaysPerYear(dto.getMaxDaysPerYear());
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        if (entity.getCreatedAt() == null)
            entity.setCreatedAt(LocalDateTime.now());
        return mapLeaveTypeToDto(leaveTypeRepository.save(entity));
    }

    @Transactional
    public void deleteLeaveType(String code) {
        LeaveType entity = leaveTypeRepository.findById(code)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "code", code));
        leaveTypeRepository.delete(entity);
    }

    // ---- Work Shifts ----
    @Transactional(readOnly = true)
    public List<WorkShiftDto> getAllWorkShifts() {
        return workShiftRepository.findAll().stream().map(this::mapWorkShiftToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkShiftDto> getActiveWorkShifts() {
        return workShiftRepository.findByIsActiveTrue().stream().map(this::mapWorkShiftToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkShiftDto createWorkShift(WorkShiftDto dto) {
        if (dto.getShiftCode() != null && workShiftRepository.findByShiftCode(dto.getShiftCode()).isPresent()) {
            throw new RuntimeException("Shift code already exists: " + dto.getShiftCode());
        }
        WorkShift entity = new WorkShift();
        applyWorkShiftDto(entity, dto);
        entity.setCreatedAt(LocalDateTime.now());
        return mapWorkShiftToDto(workShiftRepository.save(entity));
    }

    @Transactional
    public WorkShiftDto updateWorkShift(Integer id, WorkShiftDto dto) {
        WorkShift entity = workShiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkShift", "id", id));
        applyWorkShiftDto(entity, dto);
        return mapWorkShiftToDto(workShiftRepository.save(entity));
    }

    @Transactional
    public void deleteWorkShift(Integer id) {
        WorkShift entity = workShiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkShift", "id", id));
        workShiftRepository.delete(entity);
    }

    // ---- Holidays ----
    @Transactional(readOnly = true)
    public List<HolidayDto> getAllHolidays() {
        return holidayRepository.findAll().stream().map(this::mapHolidayToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HolidayDto> getActiveHolidays() {
        return holidayRepository.findByIsActiveTrue().stream().map(this::mapHolidayToDto).collect(Collectors.toList());
    }

    @Transactional
    public HolidayDto createHoliday(HolidayDto dto) {
        LocalDate date = LocalDate.parse(dto.getHolidayDate());
        if (holidayRepository.findByHolidayDate(date).isPresent()) {
            throw new RuntimeException("Holiday already exists for date: " + dto.getHolidayDate());
        }
        Holiday entity = Holiday.builder()
                .holidayDate(date)
                .holidayNameAr(dto.getHolidayNameAr())
                .holidayNameEn(dto.getHolidayNameEn())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .createdAt(LocalDateTime.now())
                .build();
        return mapHolidayToDto(holidayRepository.save(entity));
    }

    @Transactional
    public HolidayDto updateHoliday(Integer id, HolidayDto dto) {
        Holiday entity = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday", "id", id));
        entity.setHolidayDate(LocalDate.parse(dto.getHolidayDate()));
        entity.setHolidayNameAr(dto.getHolidayNameAr());
        entity.setHolidayNameEn(dto.getHolidayNameEn());
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : entity.getIsActive());
        return mapHolidayToDto(holidayRepository.save(entity));
    }

    @Transactional
    public void deleteHoliday(Integer id) {
        Holiday entity = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday", "id", id));
        holidayRepository.delete(entity);
    }

    // ---- Employee Shifts ----
    @Transactional(readOnly = true)
    public List<EmployeeShiftDto> getAllEmployeeShifts() {
        return employeeShiftRepository.findAll().stream().map(this::mapEmployeeShiftToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeShiftDto> getEmployeeShiftsByEmployee(Integer employeeId) {
        return employeeShiftRepository.findByEmployeeEmployeeId(employeeId).stream().map(this::mapEmployeeShiftToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeShiftDto createEmployeeShift(EmployeeShiftDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));
        WorkShift shift = workShiftRepository.findById(dto.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkShift", "id", dto.getShiftId()));

        EmployeeShift entity = EmployeeShift.builder()
                .employee(employee)
                .shift(shift)
                .effectiveFrom(LocalDate.parse(dto.getEffectiveFrom()))
                .effectiveTo(dto.getEffectiveTo() != null && !dto.getEffectiveTo().isBlank()
                        ? LocalDate.parse(dto.getEffectiveTo())
                        : null)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .createdAt(LocalDateTime.now())
                .build();
        return mapEmployeeShiftToDto(employeeShiftRepository.save(entity));
    }

    @Transactional
    public EmployeeShiftDto updateEmployeeShift(Integer id, EmployeeShiftDto dto) {
        EmployeeShift entity = employeeShiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeShift", "id", id));

        if (dto.getEmployeeId() != null && !dto.getEmployeeId().equals(entity.getEmployee().getEmployeeId())) {
            Employee employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));
            entity.setEmployee(employee);
        }
        if (dto.getShiftId() != null && !dto.getShiftId().equals(entity.getShift().getShiftId())) {
            WorkShift shift = workShiftRepository.findById(dto.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("WorkShift", "id", dto.getShiftId()));
            entity.setShift(shift);
        }
        entity.setEffectiveFrom(LocalDate.parse(dto.getEffectiveFrom()));
        entity.setEffectiveTo(
                dto.getEffectiveTo() != null && !dto.getEffectiveTo().isBlank() ? LocalDate.parse(dto.getEffectiveTo())
                        : null);
        if (dto.getIsActive() != null)
            entity.setIsActive(dto.getIsActive());
        return mapEmployeeShiftToDto(employeeShiftRepository.save(entity));
    }

    @Transactional
    public void deleteEmployeeShift(Integer id) {
        EmployeeShift entity = employeeShiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeShift", "id", id));
        employeeShiftRepository.delete(entity);
    }

    // ---- Mapping helpers ----
    private LeaveTypeDto mapLeaveTypeToDto(LeaveType e) {
        return LeaveTypeDto.builder()
                .leaveTypeCode(e.getLeaveTypeCode())
                .leaveTypeNameAr(e.getLeaveTypeNameAr())
                .leaveTypeNameEn(e.getLeaveTypeNameEn())
                .isPaid(e.getIsPaid())
                .maxDaysPerYear(e.getMaxDaysPerYear())
                .isActive(e.getIsActive())
                .build();
    }

    private WorkShiftDto mapWorkShiftToDto(WorkShift e) {
        return WorkShiftDto.builder()
                .shiftId(e.getShiftId())
                .shiftCode(e.getShiftCode())
                .shiftNameAr(e.getShiftNameAr())
                .shiftNameEn(e.getShiftNameEn())
                .startTime(e.getStartTime() != null ? e.getStartTime().toString() : null)
                .endTime(e.getEndTime() != null ? e.getEndTime().toString() : null)
                .graceMinutes(e.getGraceMinutes())
                .isNightShift(e.getIsNightShift())
                .isActive(e.getIsActive())
                .build();
    }

    private HolidayDto mapHolidayToDto(Holiday e) {
        return HolidayDto.builder()
                .holidayId(e.getHolidayId())
                .holidayDate(e.getHolidayDate() != null ? e.getHolidayDate().toString() : null)
                .holidayNameAr(e.getHolidayNameAr())
                .holidayNameEn(e.getHolidayNameEn())
                .isActive(e.getIsActive())
                .build();
    }

    private EmployeeShiftDto mapEmployeeShiftToDto(EmployeeShift e) {
        Employee employee = e.getEmployee();
        WorkShift shift = e.getShift();
        return EmployeeShiftDto.builder()
                .employeeShiftId(e.getEmployeeShiftId())
                .employeeId(employee != null ? employee.getEmployeeId() : null)
                .employeeNameAr(employee != null ? (employee.getFirstNameAr() + " " + employee.getLastNameAr()) : null)
                .shiftId(shift != null ? shift.getShiftId() : null)
                .shiftCode(shift != null ? shift.getShiftCode() : null)
                .shiftNameAr(shift != null ? shift.getShiftNameAr() : null)
                .effectiveFrom(e.getEffectiveFrom() != null ? e.getEffectiveFrom().toString() : null)
                .effectiveTo(e.getEffectiveTo() != null ? e.getEffectiveTo().toString() : null)
                .isActive(e.getIsActive())
                .build();
    }

    private void applyWorkShiftDto(WorkShift entity, WorkShiftDto dto) {
        entity.setShiftCode(dto.getShiftCode());
        entity.setShiftNameAr(dto.getShiftNameAr());
        entity.setShiftNameEn(dto.getShiftNameEn());
        entity.setStartTime(dto.getStartTime() != null ? LocalTime.parse(dto.getStartTime()) : null);
        entity.setEndTime(dto.getEndTime() != null ? LocalTime.parse(dto.getEndTime()) : null);
        entity.setGraceMinutes(dto.getGraceMinutes() != null ? dto.getGraceMinutes() : 0);
        entity.setIsNightShift(dto.getIsNightShift() != null ? dto.getIsNightShift() : false);
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
    }

    // ---- Attendance ----
    @Transactional(readOnly = true)
    public java.util.List<com.rasras.erp.hr.dto.AttendanceDto> getAttendance(Integer employeeId, String fromDate,
            String toDate) {
        java.time.LocalDate from = java.time.LocalDate.parse(fromDate);
        java.time.LocalDate to = java.time.LocalDate.parse(toDate);
        java.util.List<Attendance> list = (employeeId != null)
                ? attendanceRepository.findByEmployeeEmployeeIdAndAttendanceDateBetween(employeeId, from, to)
                : attendanceRepository.findByAttendanceDateBetween(from, to);
        return list.stream().map(this::mapAttendanceToDto).collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public com.rasras.erp.hr.dto.AttendanceDto upsertAttendance(com.rasras.erp.hr.dto.AttendanceDto dto) {
        Attendance entity = dto.getAttendanceId() != null
                ? attendanceRepository.findById(dto.getAttendanceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", dto.getAttendanceId()))
                : new Attendance();

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        entity.setEmployee(employee);
        entity.setAttendanceDate(java.time.LocalDate.parse(dto.getAttendanceDate()));
        entity.setCheckInTime(dto.getCheckInTime() != null && !dto.getCheckInTime().isBlank()
                ? java.time.LocalTime.parse(dto.getCheckInTime())
                : null);
        entity.setCheckOutTime(dto.getCheckOutTime() != null && !dto.getCheckOutTime().isBlank()
                ? java.time.LocalTime.parse(dto.getCheckOutTime())
                : null);
        entity.setStatus(dto.getStatus());
        entity.setLeaveType(dto.getLeaveType());
        entity.setOvertimeHours(dto.getOvertimeHours() != null
                ? java.math.BigDecimal.valueOf(dto.getOvertimeHours())
                : java.math.BigDecimal.ZERO);
        entity.setNotes(dto.getNotes());

        return mapAttendanceToDto(attendanceRepository.save(entity));
    }

    private com.rasras.erp.hr.dto.AttendanceDto mapAttendanceToDto(Attendance e) {
        Employee emp = e.getEmployee();
        return com.rasras.erp.hr.dto.AttendanceDto.builder()
                .attendanceId(e.getAttendanceId())
                .employeeId(emp != null ? emp.getEmployeeId() : null)
                .employeeNameAr(emp != null ? (emp.getFirstNameAr() + " " + emp.getLastNameAr()) : null)
                .attendanceDate(e.getAttendanceDate() != null ? e.getAttendanceDate().toString() : null)
                .checkInTime(e.getCheckInTime() != null ? e.getCheckInTime().toString() : null)
                .checkOutTime(e.getCheckOutTime() != null ? e.getCheckOutTime().toString() : null)
                .status(e.getStatus())
                .leaveType(e.getLeaveType())
                .overtimeHours(e.getOvertimeHours() != null ? e.getOvertimeHours().doubleValue() : null)
                .notes(e.getNotes())
                .build();
    }

    // ---- Payroll (simple monthly generation placeholder using existing payroll
    // tables) ----
    @Transactional(readOnly = true)
    public java.util.List<com.rasras.erp.hr.dto.PayrollDto> getPayroll(Integer month, Integer year) {
        java.util.List<Payroll> list = payrollRepository.findByPayrollMonthAndPayrollYear(month, year);
        return list.stream().map(this::mapPayrollToDto).collect(java.util.stream.Collectors.toList());
    }

    private com.rasras.erp.hr.dto.PayrollDto mapPayrollToDto(Payroll p) {
        java.util.List<PayrollDetail> details = payrollDetailRepository.findByPayrollPayrollId(p.getPayrollId());
        java.util.List<com.rasras.erp.hr.dto.PayrollItemDto> items = details.stream()
                .map(d -> com.rasras.erp.hr.dto.PayrollItemDto.builder()
                        .componentId(d.getComponentId())
                        .componentNameAr(null) // يمكن لاحقاً الربط بجدول salarycomponents
                        .componentType(null)
                        .amount(d.getAmount() != null ? d.getAmount().doubleValue() : null)
                        .build())
                .collect(java.util.stream.Collectors.toList());

        Employee emp = p.getEmployee();
        return com.rasras.erp.hr.dto.PayrollDto.builder()
                .payrollId(p.getPayrollId())
                .employeeId(emp != null ? emp.getEmployeeId() : null)
                .employeeNameAr(emp != null ? (emp.getFirstNameAr() + " " + emp.getLastNameAr()) : null)
                .payrollMonth(p.getPayrollMonth())
                .payrollYear(p.getPayrollYear())
                .basicSalary(p.getBasicSalary() != null ? p.getBasicSalary().doubleValue() : null)
                .totalEarnings(p.getTotalEarnings() != null ? p.getTotalEarnings().doubleValue() : null)
                .totalDeductions(p.getTotalDeductions() != null ? p.getTotalDeductions().doubleValue() : null)
                .netSalary(p.getNetSalary() != null ? p.getNetSalary().doubleValue() : null)
                .status(p.getStatus())
                .paymentDate(p.getPaymentDate() != null ? p.getPaymentDate().toString() : null)
                .items(items)
                .build();
    }

    @Transactional
    public java.util.List<com.rasras.erp.hr.dto.PayrollDto> generatePayroll(Integer month, Integer year) {
        // 1. Check if payroll already exists
        java.util.List<Payroll> existing = payrollRepository.findByPayrollMonthAndPayrollYear(month, year);
        if (!existing.isEmpty()) {
            throw new RuntimeException("Payroll already generated for this month!");
        }

        // 2. Get active employees
        java.util.List<Employee> employees = employeeRepository.findByIsActiveTrue();
        java.util.List<Payroll> savedPayrolls = new java.util.ArrayList<>();

        for (Employee emp : employees) {
            java.math.BigDecimal basic = emp.getBasicSalary() != null ? emp.getBasicSalary()
                    : java.math.BigDecimal.ZERO;

            // Mock Calculation for now (TODO: Real calculation based on attendance)
            java.math.BigDecimal allowances = basic.multiply(new java.math.BigDecimal("0.10")); // 10% allowance
            java.math.BigDecimal deductions = basic.multiply(new java.math.BigDecimal("0.05")); // 5% deduction
            java.math.BigDecimal net = basic.add(allowances).subtract(deductions);

            Payroll p = new Payroll();
            p.setEmployee(emp);
            p.setPayrollMonth(month);
            p.setPayrollYear(year);
            p.setBasicSalary(basic);
            p.setTotalEarnings(allowances);
            p.setTotalDeductions(deductions);
            p.setNetSalary(net);
            p.setStatus("DRAFT");
            p.setCreatedAt(LocalDateTime.now());

            p = payrollRepository.save(p);
            savedPayrolls.add(p);

            // Add details
            createPayrollDetail(p, "Basic Salary", "EARNING", basic);
            createPayrollDetail(p, "Housing Allowance", "EARNING", allowances);
            createPayrollDetail(p, "Social Security", "DEDUCTION", deductions);
        }

        return savedPayrolls.stream().map(this::mapPayrollToDto).collect(java.util.stream.Collectors.toList());
    }

    private void createPayrollDetail(Payroll payroll, String nameEn, String type, java.math.BigDecimal amount) {
        if (amount.compareTo(java.math.BigDecimal.ZERO) == 0)
            return;

        // Find or create SalaryComponent
        SalaryComponent component = salaryComponentRepository.findByComponentNameEn(nameEn)
                .orElseGet(() -> {
                    SalaryComponent newComp = new SalaryComponent();
                    newComp.setComponentCode(nameEn.replaceAll("\\s+", "_").toUpperCase()); // Generate code
                    newComp.setComponentName(nameEn); // Map to ComponentName
                    newComp.setComponentNameEn(nameEn);
                    newComp.setComponentNameAr(nameEn); // Fallback
                    newComp.setComponentType(type);
                    newComp.setIsActive(true);
                    return salaryComponentRepository.save(newComp);
                });

        PayrollDetail d = new PayrollDetail();
        d.setPayroll(payroll);
        d.setComponentId(component.getComponentId());
        d.setAmount(amount);
        payrollDetailRepository.save(d);
    }
}
