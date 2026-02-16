-- Support for Material Issue (إذن صرف) for Work Orders / Production
-- Makes SOID and CustomerID optional, adds IssueType and reference fields
-- Run this migration. If FK names differ in your DB, adjust the DROP statements.

-- 1. Add new columns
ALTER TABLE stockissuenotes ADD COLUMN IssueType VARCHAR(20) DEFAULT 'SALE_ORDER' AFTER IssueDate;
ALTER TABLE stockissuenotes ADD COLUMN ReferenceType VARCHAR(20) DEFAULT NULL AFTER IssueType;
ALTER TABLE stockissuenotes ADD COLUMN ReferenceID INT DEFAULT NULL AFTER ReferenceType;
ALTER TABLE stockissuenotes ADD COLUMN ReferenceNumber VARCHAR(50) DEFAULT NULL AFTER ReferenceID;

-- 2. Drop foreign keys (use SHOW CREATE TABLE stockissuenotes; to verify names)
ALTER TABLE stockissuenotes DROP FOREIGN KEY FK_IssueNote_SO;
ALTER TABLE stockissuenotes DROP FOREIGN KEY FK_IssueNote_Customer;

-- 3. Make SOID and CustomerID nullable
ALTER TABLE stockissuenotes MODIFY COLUMN SOID INT NULL;
ALTER TABLE stockissuenotes MODIFY COLUMN CustomerID INT NULL;

-- 4. Re-add foreign keys
ALTER TABLE stockissuenotes ADD CONSTRAINT FK_IssueNote_SO FOREIGN KEY (SOID) REFERENCES salesorders(SOID);
ALTER TABLE stockissuenotes ADD CONSTRAINT FK_IssueNote_Customer FOREIGN KEY (CustomerID) REFERENCES customers(CustomerID);

-- 5. stockissuenoteitems: Make SOItemID nullable
ALTER TABLE stockissuenoteitems DROP FOREIGN KEY FK_IssueItems_SOItem;
ALTER TABLE stockissuenoteitems MODIFY COLUMN SOItemID INT NULL;
ALTER TABLE stockissuenoteitems ADD CONSTRAINT FK_IssueItems_SOItem FOREIGN KEY (SOItemID) REFERENCES salesorderitems(SOItemID);
