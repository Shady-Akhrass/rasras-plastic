-- Fix itemqualityspecs table
-- Run each statement ONE BY ONE in phpMyAdmin or MySQL Workbench

-- Step 1: Drop the corrupted column (if it exists)
ALTER TABLE itemqualityspecs DROP COLUMN id_itemId;

-- Step 2: Drop existing primary key (if any)
-- ALTER TABLE itemqualityspecs DROP PRIMARY KEY;

-- Step 3: Make SpecID auto-increment with primary key
ALTER TABLE itemqualityspecs MODIFY COLUMN SpecID int(11) NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (SpecID);
