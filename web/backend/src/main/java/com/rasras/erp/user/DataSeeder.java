package com.rasras.erp.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting data seeding for Employees and Users...");

        // 1. Ensure Department 1 exists (needed for employee)
        Integer deptCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM departments WHERE DepartmentID = 1", Integer.class);
        if (deptCount == null || deptCount == 0) {
            log.info("Seeding default department...");
            jdbcTemplate.update(
                    "INSERT INTO departments (DepartmentID, DepartmentNameAr, DepartmentNameEn, IsActive) VALUES (1, 'الإدارة', 'Management', 1)");
        }

        // 2. Ensure Employee 103 exists (needed for user 'shady')
        Integer empCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM employees WHERE EmployeeID = 103", Integer.class);
        if (empCount == null || empCount == 0) {
            log.info("Seeding employee 103...");
            jdbcTemplate.update(
                    "INSERT INTO employees (EmployeeID, EmployeeCode, FirstNameAr, LastNameAr, FirstNameEn, LastNameEn, DepartmentID, HireDate, IsActive) "
                            +
                            "VALUES (103, 'EMP103', 'شادي', 'محمد', 'Shady', 'Mohamed', 1, CURDATE(), 1)");
        }

        // 3. Ensure 'shady' user exists
        if (!userRepository.existsByUsername("shady")) {
            log.info("Fetching ADMIN role...");
            Role adminRole = roleRepository.findByRoleCode("ADMIN")
                    .orElseThrow(() -> new RuntimeException(
                            "ADMIN role not found in database! Please ensure roles are seeded."));

            log.info("Creating 'shady' user...");
            User shady = User.builder()
                    .username("shady")
                    .passwordHash(passwordEncoder.encode("12345678"))
                    .employeeId(103)
                    .role(adminRole)
                    .isActive(true)
                    .isLocked(false)
                    .failedLoginAttempts(0)
                    .build();
            userRepository.save(shady);
            log.info("'shady' user seeded successfully with password '12345678'");
        } else {
            log.info("'shady' user already exists, skipping...");
        }

        log.info("Data seeding completed.");
    }
}
