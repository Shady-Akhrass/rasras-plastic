package com.rasras.erp.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final com.rasras.erp.approval.ApprovalWorkflowRepository workflowRepo;
    private final com.rasras.erp.approval.ApprovalWorkflowStepRepository stepRepo;
    private final com.rasras.erp.approval.ApprovalLimitRepository limitRepo;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting data seeding for Employees and Users...");

        // 0. Ensure Roles exist first
        seedRoles();

        // 0.05 صلاحيات الأقسام (للعرض الديناميكي في القائمة الجانبية)
        seedSectionPermissions();

        // 0.1 Seed Approval Workflows
        seedApprovalWorkflows();

        // 1. Ensure Department 1 exists (needed for employee)
        Integer deptCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM departments WHERE DepartmentID = 1", Integer.class);
        if (deptCount == null || deptCount == 0) {
            log.info("Seeding default department...");
            jdbcTemplate.update(
                    "INSERT INTO departments (DepartmentID, DepartmentCode, DepartmentNameAr, DepartmentNameEn, IsActive) VALUES (1, 'MGT', 'الإدارة', 'Management', 1)");
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

    private void seedRoles() {
        log.info("Seeding roles...");

        // Check and create ADMIN role
        if (!roleRepository.findByRoleCode("ADMIN").isPresent()) {
            log.info("Creating ADMIN role...");
            Role adminRole = Role.builder()
                    .roleCode("ADMIN")
                    .roleNameAr("مدير النظام")
                    .roleNameEn("System Administrator")
                    .description("صلاحيات كاملة على النظام")
                    .isActive(true)
                    .build();
            roleRepository.save(adminRole);
            log.info("ADMIN role created successfully");
        }

        // Check and create other common roles
        String[][] roles = {
                { "GM", "المدير العام", "General Manager", "الإدارة العليا واعتماد القرارات" },
                { "FM", "المدير المالي", "Finance Manager", "إدارة الشؤون المالية" },
                { "ACC", "محاسب", "Accountant", "العمليات المحاسبية اليومية" },
                { "PM", "مدير المشتريات", "Procurement Manager", "إدارة عمليات الشراء" },
                { "BUYER", "مشتري", "Buyer", "تنفيذ عمليات الشراء" },
                { "SM", "مدير المبيعات", "Sales Manager", "إدارة عمليات البيع" }
        };

        for (String[] roleData : roles) {
            if (!roleRepository.findByRoleCode(roleData[0]).isPresent()) {
                Role role = Role.builder()
                        .roleCode(roleData[0])
                        .roleNameAr(roleData[1])
                        .roleNameEn(roleData[2])
                        .description(roleData[3])
                        .isActive(true)
                        .build();
                roleRepository.save(role);
                log.info("Created role: {}", roleData[0]);
            }
        }
    }

    /** إنشاء صلاحيات الأقسام وتعيينها لـ ADMIN حتى تعمل القائمة والمسارات ديناميكياً من لوحة التحكم */
    private void seedSectionPermissions() {
        log.info("Seeding section permissions...");
        String[][] sectionPerms = {
                { "SECTION_MAIN", "الرئيسية والاعتمادات", "Main & Approvals", "MENU" },
                { "SECTION_USERS", "المستخدمين", "Users", "MENU" },
                { "SECTION_EMPLOYEES", "الموظفين", "Employees", "MENU" },
                { "SECTION_WAREHOUSE", "المخازن", "Warehouse", "MENU" },
                { "SECTION_OPERATIONS", "العمليات", "Operations", "MENU" },
                { "SECTION_SALES", "المبيعات", "Sales", "MENU" },
                { "SECTION_CRM", "العملاء (CRM)", "CRM", "MENU" },
                { "SECTION_PROCUREMENT", "المشتريات", "Procurement", "MENU" },
                { "SECTION_SYSTEM", "إعدادات النظام", "System Settings", "MENU" },
        };
        for (String[] p : sectionPerms) {
            if (permissionRepository.findByPermissionCode(p[0]).isEmpty()) {
                Permission perm = Permission.builder()
                        .permissionCode(p[0])
                        .permissionNameAr(p[1])
                        .permissionNameEn(p[2])
                        .moduleName(p[3])
                        .isActive(true)
                        .build();
                permissionRepository.save(perm);
                log.info("Created permission: {}", p[0]);
            }
        }
        Role adminRole = roleRepository.findByRoleCode("ADMIN").orElse(null);
        if (adminRole != null) {
            List<Permission> sectionPermissions = sectionPerms.length > 0
                    ? java.util.Arrays.stream(sectionPerms)
                            .map(sp -> permissionRepository.findByPermissionCode(sp[0]).orElse(null))
                            .filter(perm -> perm != null)
                            .collect(java.util.stream.Collectors.toList())
                    : java.util.Collections.emptyList();
            for (Permission perm : sectionPermissions) {
                boolean alreadyAssigned = rolePermissionRepository.findByRoleRoleId(adminRole.getRoleId()).stream()
                        .anyMatch(rp -> rp.getPermission().getPermissionId().equals(perm.getPermissionId()));
                if (!alreadyAssigned) {
                    rolePermissionRepository.save(RolePermission.builder()
                            .role(adminRole)
                            .permission(perm)
                            .isAllowed(true)
                            .build());
                    log.info("Assigned permission {} to ADMIN", perm.getPermissionCode());
                }
            }
        }
    }

    private void seedApprovalWorkflows() {
        log.info("Seeding approval workflows...");

        // 1. PR Approval Workflow
        if (!workflowRepo.findByWorkflowCode("PR_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow prWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("PR_APPROVAL")
                    .workflowName("Purchase Requisition Approval")
                    .documentType("PurchaseRequisition")
                    .isActive(true)
                    .build();
            workflowRepo.save(prWorkflow);

            Role pmRole = roleRepository.findByRoleCode("PM").orElse(null);
            if (pmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(prWorkflow)
                        .stepNumber(1)
                        .stepName("Procurement Manager Approval")
                        .approverType("ROLE")
                        .approverRole(pmRole)
                        .build();
                stepRepo.save(step1);
            }
        }

        // 2. PO Approval Workflow
        if (!workflowRepo.findByWorkflowCode("PO_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow poWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("PO_APPROVAL")
                    .workflowName("Purchase Order Approval")
                    .documentType("PurchaseOrder")
                    .isActive(true)
                    .build();
            workflowRepo.save(poWorkflow);

            Role fmRole = roleRepository.findByRoleCode("FM").orElse(null);
            if (fmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(poWorkflow)
                        .stepNumber(1)
                        .stepName("Finance Manager Approval")
                        .approverType("ROLE")
                        .approverRole(fmRole)
                        .build();
                stepRepo.save(step1);
            }
        }

        // 3. Supplier Approval Workflow
        if (!workflowRepo.findByWorkflowCode("SUPPLIER_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow supWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("SUPPLIER_APPROVAL")
                    .workflowName("Supplier Approval")
                    .documentType("Supplier")
                    .isActive(true)
                    .build();
            workflowRepo.save(supWorkflow);

            Role gmRole = roleRepository.findByRoleCode("GM").orElse(null);
            if (gmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(supWorkflow)
                        .stepNumber(1)
                        .stepName("General Manager Approval")
                        .approverType("ROLE")
                        .approverRole(gmRole)
                        .build();
                stepRepo.save(step1);
            }
        }

        // 4. GRN Approval Workflow
        if (!workflowRepo.findByWorkflowCode("GRN_APPROVAL").isPresent()) {
            com.rasras.erp.approval.ApprovalWorkflow grnWorkflow = com.rasras.erp.approval.ApprovalWorkflow.builder()
                    .workflowCode("GRN_APPROVAL")
                    .workflowName("Goods Receipt Note Approval")
                    .documentType("GoodsReceiptNote")
                    .isActive(true)
                    .build();
            workflowRepo.save(grnWorkflow);

            Role pmRole = roleRepository.findByRoleCode("PM").orElse(null);
            if (pmRole != null) {
                com.rasras.erp.approval.ApprovalWorkflowStep step1 = com.rasras.erp.approval.ApprovalWorkflowStep
                        .builder()
                        .workflow(grnWorkflow)
                        .stepNumber(1)
                        .stepName("Procurement Manager Approval")
                        .approverType("ROLE")
                        .approverRole(pmRole)
                        .build();
                stepRepo.save(step1);
            }
        }
    }
}
