# Shared, HR & Admin Tasks

This document covers the shared platform, human resources, and system administration modules of the ERP.

## Database Tables
The following tables are within this scope:
- **HR & Payroll**: `employees`, `departments`, `attendance`, `leaverequests`, `payroll`, `payrolldetails`, `salarycomponents`, `employeesalarystructure`
- **Security & RBAC**: `users`, `roles`, `permissions`, `rolepermissions`
- **Approvals & Workflows**: `approvalworkflows`, `approvalworkflowsteps`, `approvalrequests`, `approvalactions`, `approvallimits`
- **System & Audit**: `auditlog`, `notifications`, `systemsettings`, `companyinfo`, `alertrules`, `numberseries`
- **Document Management**: `documenttypes`, `documentsequences`, `documentcycletracking`, `documentrelationships`

---

## Assigned Sprints (To be Assigned)

### Sprint 1: Foundation & RBAC
- [ ] Roles & Permissions Configuration (Web)
- [ ] User Management & Role Assignment (Web)
- [ ] Permission Check Middleware (BE)

### Sprint 2: Employee Management (HR)
- [ ] Employee Master Data API (BE)
- [ ] Employee Master Data UI (Web)
- [ ] Department Structure (Web)

### Sprint 3: Approval Workflows
- [ ] Workflow Definition API (BE)
- [ ] Workflow Visualizer/Builder UI (Web)
- [ ] Approval Request Tracking (Web)

### Sprint 18: Payroll & Attendance
- [ ] Attendance Tracking API (BE)
- [ ] Attendance Tracking UI (Web)
- [ ] Salary Components & Structure (Web)
- [ ] Monthly Payroll Generation (Web)

### Sprint 19: System Settings & Audit
- [ ] System Settings UI (Web)
- [ ] Audit Log Viewer (Web)
- [ ] Notification Center (Web)
- [ ] Document Relationship Tracker (Web)
