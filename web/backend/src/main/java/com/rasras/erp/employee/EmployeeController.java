package com.rasras.erp.employee;

import com.rasras.erp.employee.dto.*;
import com.rasras.erp.shared.dto.ApiResponse;
import com.rasras.erp.shared.exception.ResourceNotFoundException;
import com.rasras.erp.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee management APIs")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/me")
    @Operation(summary = "Get current user's employee", description = "Returns the authenticated user's own employee record")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployeeDto>> getMyEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new ResourceNotFoundException("User", "session", "not found");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        Integer employeeId = principal.getEmployeeId();
        if (employeeId == null) {
            throw new ResourceNotFoundException("Employee", "user", "no employee linked");
        }
        EmployeeDto employee = employeeService.getEmployeeById(employeeId);
        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @PutMapping("/me")
    @Operation(summary = "Update my profile (name only)", description = "Allows the authenticated user to update only their name")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployeeDto>> updateMyProfile(@Valid @RequestBody UpdateMyProfileRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new ResourceNotFoundException("User", "session", "not found");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        Integer employeeId = principal.getEmployeeId();
        if (employeeId == null) {
            throw new ResourceNotFoundException("Employee", "user", "no employee linked");
        }
        EmployeeDto employee = employeeService.updateMyProfile(employeeId, request);
        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @GetMapping
    @Operation(summary = "Get all employees", description = "Returns a paginated list of employees")
    @PreAuthorize("hasAuthority('HR_VIEW') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Page<EmployeeDto>>> getAllEmployees(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<EmployeeDto> employees = employeeService.getAllEmployees(pageable);
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/list")
    @Operation(summary = "Get all active employees list", description = "Returns a simple list of all active employees")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<EmployeeDto>>> getActiveEmployeesList() {
        List<EmployeeDto> employees = employeeService.getAllActiveEmployeesList();
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID", description = "Returns an employee by their ID")
    @PreAuthorize("hasAuthority('HR_VIEW') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeDto>> getEmployeeById(@PathVariable Integer id) {
        EmployeeDto employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @PostMapping
    @Operation(summary = "Create a new employee", description = "Creates a new employee record")
    @PreAuthorize("hasAuthority('HR_CREATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeDto>> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeDto employee = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", employee));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee", description = "Updates an existing employee record")
    @PreAuthorize("hasAuthority('HR_UPDATE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeDto>> updateEmployee(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        EmployeeDto employee = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", employee));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete employee", description = "Soft deletes an employee (sets inactive)")
    @PreAuthorize("hasAuthority('HR_DELETE') or hasAnyRole('ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Integer id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully"));
    }

    @GetMapping("/departments")
    @Operation(summary = "Get all departments", description = "Returns a list of all departments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getAllDepartments() {
        List<DepartmentDto> departments = employeeService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    @GetMapping("/by-department")
    @Operation(summary = "Get employees by department", description = "Returns a list of employees in a specific department")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<EmployeeDto>>> getEmployeesByDepartment(@RequestParam String deptName) {
        List<EmployeeDto> employees = employeeService.getEmployeesByDepartment(deptName);
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/by-role")
    @Operation(summary = "Get employees by role", description = "Returns a list of employees with a specific role")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<EmployeeDto>>> getEmployeesByRole(@RequestParam String roleCode) {
        List<EmployeeDto> employees = employeeService.getEmployeesByRole(roleCode);
        return ResponseEntity.ok(ApiResponse.success(employees));
    }
}
