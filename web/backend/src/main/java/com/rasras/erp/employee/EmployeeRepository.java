package com.rasras.erp.employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    Optional<Employee> findByEmployeeCode(String employeeCode);

    @Query("SELECT e FROM Employee e JOIN FETCH e.department WHERE e.isActive = true")
    Page<Employee> findAllActive(Pageable pageable);

    @Query("SELECT e FROM Employee e JOIN FETCH e.department WHERE e.department.departmentNameAr = :deptName AND e.isActive = true")
    List<Employee> findByDepartmentNameAr(String deptName);

    @Query("SELECT e FROM Employee e WHERE e.employeeId IN (SELECT u.employeeId FROM User u JOIN u.role r WHERE r.roleCode = :roleCode) AND e.isActive = true")
    List<Employee> findByRoleCode(String roleCode);

    boolean existsByEmployeeCode(String employeeCode);
}
