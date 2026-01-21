package com.rasras.erp.employee;

import com.rasras.erp.employee.dto.*;
import com.rasras.erp.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public Page<EmployeeDto> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<EmployeeDto> getAllActiveEmployeesList() {
        return employeeRepository.findAll().stream()
                .filter(Employee::getIsActive)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return mapToDto(employee);
    }

    @Transactional
    public EmployeeDto createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new RuntimeException("Employee code already exists: " + request.getEmployeeCode());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        Employee employee = Employee.builder()
                .employeeCode(request.getEmployeeCode())
                .firstNameAr(request.getFirstNameAr())
                .lastNameAr(request.getLastNameAr())
                .firstNameEn(request.getFirstNameEn())
                .lastNameEn(request.getLastNameEn())
                .nationalId(request.getNationalId())
                .email(request.getEmail())
                .phone(request.getPhone())
                .mobile(request.getMobile())
                .address(request.getAddress())
                .department(department)
                .jobTitle(request.getJobTitle())
                .managerId(request.getManagerId())
                .hireDate(request.getHireDate())
                .basicSalary(request.getBasicSalary())
                .isActive(true)
                .build();

        return mapToDto(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeDto updateEmployee(Integer id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (request.getFirstNameAr() != null)
            employee.setFirstNameAr(request.getFirstNameAr());
        if (request.getLastNameAr() != null)
            employee.setLastNameAr(request.getLastNameAr());
        if (request.getFirstNameEn() != null)
            employee.setFirstNameEn(request.getFirstNameEn());
        if (request.getLastNameEn() != null)
            employee.setLastNameEn(request.getLastNameEn());
        if (request.getEmail() != null)
            employee.setEmail(request.getEmail());
        if (request.getPhone() != null)
            employee.setPhone(request.getPhone());
        if (request.getMobile() != null)
            employee.setMobile(request.getMobile());
        if (request.getAddress() != null)
            employee.setAddress(request.getAddress());
        if (request.getJobTitle() != null)
            employee.setJobTitle(request.getJobTitle());
        if (request.getManagerId() != null)
            employee.setManagerId(request.getManagerId());
        if (request.getTerminationDate() != null)
            employee.setTerminationDate(request.getTerminationDate());
        if (request.getBasicSalary() != null)
            employee.setBasicSalary(request.getBasicSalary());
        if (request.getIsActive() != null)
            employee.setIsActive(request.getIsActive());

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            employee.setDepartment(department);
        }

        return mapToDto(employeeRepository.save(employee));
    }

    @Transactional
    public void deleteEmployee(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employeeRepository.delete(employee);
    }

    public List<EmployeeDto> getEmployeesByDepartment(String deptName) {
        return employeeRepository.findByDepartmentNameAr(deptName).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<EmployeeDto> getEmployeesByRole(String roleCode) {
        return employeeRepository.findByRoleCode(roleCode).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDepartmentDto)
                .collect(Collectors.toList());
    }

    private EmployeeDto mapToDto(Employee employee) {
        return EmployeeDto.builder()
                .employeeId(employee.getEmployeeId())
                .employeeCode(employee.getEmployeeCode())
                .firstNameAr(employee.getFirstNameAr())
                .lastNameAr(employee.getLastNameAr())
                .firstNameEn(employee.getFirstNameEn())
                .lastNameEn(employee.getLastNameEn())
                .fullNameAr(employee.getFirstNameAr() + " " + employee.getLastNameAr())
                .fullNameEn((employee.getFirstNameEn() != null ? employee.getFirstNameEn() : "") + " " +
                        (employee.getLastNameEn() != null ? employee.getLastNameEn() : ""))
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .mobile(employee.getMobile())
                .jobTitle(employee.getJobTitle())
                .departmentId(employee.getDepartment().getDepartmentId())
                .departmentNameAr(employee.getDepartment().getDepartmentNameAr())
                .hireDate(employee.getHireDate())
                .isActive(employee.getIsActive())
                .basicSalary(employee.getBasicSalary())
                .build();
    }

    private DepartmentDto mapToDepartmentDto(Department department) {
        return DepartmentDto.builder()
                .departmentId(department.getDepartmentId())
                .departmentCode(department.getDepartmentCode())
                .departmentNameAr(department.getDepartmentNameAr())
                .departmentNameEn(department.getDepartmentNameEn())
                .parentDepartmentId(department.getParentDepartmentId())
                .isActive(department.getIsActive())
                .build();
    }
}
