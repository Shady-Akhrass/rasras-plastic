package com.rasras.erp.hr;

import com.rasras.erp.hr.dto.AttendanceDto;
import com.rasras.erp.hr.dto.EmployeeShiftDto;
import com.rasras.erp.hr.dto.HolidayDto;
import com.rasras.erp.hr.dto.LeaveTypeDto;
import com.rasras.erp.hr.dto.PayrollDto;
import com.rasras.erp.hr.dto.WorkShiftDto;
import com.rasras.erp.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr")
@RequiredArgsConstructor
@Tag(name = "HR", description = "HR master data APIs (Leave Types, Shifts, Holidays)")
public class HrController {

    private final HrService hrService;

    // ---- Leave Types ----
    @GetMapping("/leave-types")
    @Operation(summary = "Get all leave types")
    @PreAuthorize("hasAuthority('HR_VIEW') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveTypeDto>>> getLeaveTypes(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<LeaveTypeDto> data = activeOnly ? hrService.getActiveLeaveTypes() : hrService.getAllLeaveTypes();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/leave-types/{code}")
    @Operation(summary = "Create/update leave type by code")
    @PreAuthorize("hasAuthority('HR_UPDATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveTypeDto>> upsertLeaveType(@PathVariable String code,
            @RequestBody LeaveTypeDto dto) {
        dto.setLeaveTypeCode(code);
        LeaveTypeDto saved = hrService.upsertLeaveType(dto);
        return ResponseEntity.ok(ApiResponse.success("Leave type saved", saved));
    }

    @DeleteMapping("/leave-types/{code}")
    @Operation(summary = "Delete leave type")
    @PreAuthorize("hasAuthority('HR_DELETE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLeaveType(@PathVariable String code) {
        hrService.deleteLeaveType(code);
        return ResponseEntity.ok(ApiResponse.success("Leave type deleted"));
    }

    // ---- Work Shifts ----
    @GetMapping("/shifts")
    @Operation(summary = "Get all work shifts")
    @PreAuthorize("hasAuthority('HR_VIEW') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<WorkShiftDto>>> getWorkShifts(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<WorkShiftDto> data = activeOnly ? hrService.getActiveWorkShifts() : hrService.getAllWorkShifts();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/shifts")
    @Operation(summary = "Create work shift")
    @PreAuthorize("hasAuthority('HR_CREATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<WorkShiftDto>> createWorkShift(@RequestBody WorkShiftDto dto) {
        WorkShiftDto saved = hrService.createWorkShift(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Shift created", saved));
    }

    @PutMapping("/shifts/{id}")
    @Operation(summary = "Update work shift")
    @PreAuthorize("hasAuthority('HR_UPDATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<WorkShiftDto>> updateWorkShift(@PathVariable Integer id,
            @RequestBody WorkShiftDto dto) {
        WorkShiftDto saved = hrService.updateWorkShift(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Shift updated", saved));
    }

    @DeleteMapping("/shifts/{id}")
    @Operation(summary = "Delete work shift")
    @PreAuthorize("hasAuthority('HR_DELETE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWorkShift(@PathVariable Integer id) {
        hrService.deleteWorkShift(id);
        return ResponseEntity.ok(ApiResponse.success("Shift deleted"));
    }

    // ---- Holidays ----
    @GetMapping("/holidays")
    @Operation(summary = "Get all holidays")
    @PreAuthorize("hasAuthority('HR_VIEW') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<HolidayDto>>> getHolidays(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<HolidayDto> data = activeOnly ? hrService.getActiveHolidays() : hrService.getAllHolidays();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/holidays")
    @Operation(summary = "Create holiday")
    @PreAuthorize("hasAuthority('HR_CREATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<HolidayDto>> createHoliday(@RequestBody HolidayDto dto) {
        HolidayDto saved = hrService.createHoliday(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Holiday created", saved));
    }

    @PutMapping("/holidays/{id}")
    @Operation(summary = "Update holiday")
    @PreAuthorize("hasAuthority('HR_UPDATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<HolidayDto>> updateHoliday(@PathVariable Integer id,
            @RequestBody HolidayDto dto) {
        HolidayDto saved = hrService.updateHoliday(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Holiday updated", saved));
    }

    @DeleteMapping("/holidays/{id}")
    @Operation(summary = "Delete holiday")
    @PreAuthorize("hasAuthority('HR_DELETE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable Integer id) {
        hrService.deleteHoliday(id);
        return ResponseEntity.ok(ApiResponse.success("Holiday deleted"));
    }

    // ---- Employee Shifts ----
    @GetMapping("/employee-shifts")
    @Operation(summary = "Get employee shifts (optionally by employeeId)")
    @PreAuthorize("hasAuthority('HR_VIEW') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<EmployeeShiftDto>>> getEmployeeShifts(
            @RequestParam(required = false) Integer employeeId) {
        List<EmployeeShiftDto> data = employeeId != null
                ? hrService.getEmployeeShiftsByEmployee(employeeId)
                : hrService.getAllEmployeeShifts();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/employee-shifts")
    @Operation(summary = "Create employee shift assignment")
    @PreAuthorize("hasAuthority('HR_CREATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeShiftDto>> createEmployeeShift(@RequestBody EmployeeShiftDto dto) {
        EmployeeShiftDto saved = hrService.createEmployeeShift(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Employee shift created", saved));
    }

    @PutMapping("/employee-shifts/{id}")
    @Operation(summary = "Update employee shift assignment")
    @PreAuthorize("hasAuthority('HR_UPDATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeShiftDto>> updateEmployeeShift(@PathVariable Integer id,
            @RequestBody EmployeeShiftDto dto) {
        EmployeeShiftDto saved = hrService.updateEmployeeShift(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Employee shift updated", saved));
    }

    @DeleteMapping("/employee-shifts/{id}")
    @Operation(summary = "Delete employee shift assignment")
    @PreAuthorize("hasAuthority('HR_DELETE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployeeShift(@PathVariable Integer id) {
        hrService.deleteEmployeeShift(id);
        return ResponseEntity.ok(ApiResponse.success("Employee shift deleted"));
    }

    // ---- Attendance ----
    @GetMapping("/attendance")
    @Operation(summary = "Get attendance by employee/date range")
    @PreAuthorize("hasAuthority('HR_VIEW') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendance(
            @RequestParam(required = false) Integer employeeId,
            @RequestParam String fromDate,
            @RequestParam String toDate) {
        List<AttendanceDto> data = hrService.getAttendance(employeeId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/attendance")
    @Operation(summary = "Create attendance record")
    @PreAuthorize("hasAuthority('HR_UPDATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceDto>> createAttendance(@RequestBody AttendanceDto dto) {
        AttendanceDto saved = hrService.upsertAttendance(dto);
        return ResponseEntity.ok(ApiResponse.success("Attendance saved", saved));
    }

    @PutMapping("/attendance/{id}")
    @Operation(summary = "Update attendance record")
    @PreAuthorize("hasAuthority('HR_UPDATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceDto>> updateAttendance(
            @PathVariable Integer id,
            @RequestBody AttendanceDto dto) {
        if (id != null && id != 0) {
            dto.setAttendanceId(id);
        }
        AttendanceDto saved = hrService.upsertAttendance(dto);
        return ResponseEntity.ok(ApiResponse.success("Attendance updated", saved));
    }

    // ---- Payroll ----
    @GetMapping("/payroll")
    @Operation(summary = "Get monthly payroll with breakdown")
    @PreAuthorize("hasAuthority('HR_VIEW') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<PayrollDto>>> getPayroll(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        List<PayrollDto> data = hrService.getPayroll(month, year);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
