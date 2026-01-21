-- Initial Seed Data for System Setup

-- 1. Create a Default Department
INSERT INTO `departments` (`DepartmentID`, `DepartmentNameAr`, `DepartmentNameEn`, `IsActive`) 
VALUES (1, 'الإدارة', 'Management', 1);

-- 2. Create an Employee for the Admin User
INSERT INTO `employees` (`EmployeeID`, `EmployeeCode`, `FirstNameAr`, `LastNameAr`, `FirstNameEn`, `LastNameEn`, `DepartmentID`, `HireDate`, `IsActive`) 
VALUES (1, 'EMP001', 'مدير', 'النظام', 'System', 'Admin', 1, '2026-01-01', 1);

-- 3. Create the Administrative User
-- Password is 'password123'
INSERT INTO `users` (`UserID`, `Username`, `PasswordHash`, `EmployeeID`, `RoleID`, `IsActive`, `IsLocked`, `FailedLoginAttempts`) 
VALUES (1, 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 1, 1, 1, 0, 0);
