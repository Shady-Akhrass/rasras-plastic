package com.rasras.erp.dashboard;

import com.rasras.erp.dashboard.dto.DashboardStatsDto;
import com.rasras.erp.employee.EmployeeRepository;
import com.rasras.erp.employee.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        long totalEmployees = employeeRepository.count();
        // Assuming we might need a custom query for active employees in the future if
        // countByIsActiveTrue exists
        long activeEmployees = employeeRepository.findAll().stream().filter(e -> e.getIsActive()).count();
        long totalDepartments = departmentRepository.count();

        return DashboardStatsDto.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .totalDepartments(totalDepartments)
                .employeeGrowthRate(12.5) // Placeholder for now
                .build();
    }
}
