-- Fix employees table: Add AUTO_INCREMENT to EmployeeID
-- This fixes the error: "Field 'EmployeeID' doesn't have a default value"
-- Run these statements in phpMyAdmin or MySQL Workbench

-- First, check if EmployeeID is PRIMARY KEY:
-- SHOW CREATE TABLE employees;
-- Look for "PRIMARY KEY (`EmployeeID`)" in the output

-- Option 1: If EmployeeID is already PRIMARY KEY (most common case)
-- Use this command:
ALTER TABLE employees 
MODIFY COLUMN EmployeeID int(11) NOT NULL AUTO_INCREMENT;

-- Option 2: If EmployeeID is NOT PRIMARY KEY (rare case)
-- Use this command instead (it adds PRIMARY KEY and AUTO_INCREMENT):
-- ALTER TABLE employees 
-- MODIFY COLUMN EmployeeID int(11) NOT NULL AUTO_INCREMENT,
-- ADD PRIMARY KEY (EmployeeID);

-- Optional: If you want to set a specific starting value for AUTO_INCREMENT
-- First, check your max EmployeeID: SELECT MAX(EmployeeID) FROM employees;
-- Then replace 1000 below with the next value you want (e.g., if max is 150, use 151)
-- ALTER TABLE employees 
-- MODIFY COLUMN EmployeeID int(11) NOT NULL AUTO_INCREMENT, 
-- AUTO_INCREMENT = 1000;
