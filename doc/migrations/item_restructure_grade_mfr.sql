-- ============================================================
-- إعادة هيكلة جدول items: كود صنف فريد + العلامة التجارية + MFR
-- ============================================================
-- التغييرات:
-- 1. إضافة عمود grade (العلامة التجارية / Grade) - يمكن أن يتكرر
-- 2. نقل محتوى ItemCode الحالي إلى grade
-- 3. إعادة توليد ItemCode ككود فريد (ITEM-00001, ITEM-00002, ...)
-- 4. GradeName يبقى كما هو ويخزن MFR (معدل تدفق الذوبان)
-- ============================================================

-- 1. إضافة عمود grade
ALTER TABLE items ADD COLUMN grade VARCHAR(255) NULL 
  COMMENT 'العلامة التجارية / Grade - يمكن أن يتكرر بين أصناف مختلفة' 
  AFTER ItemNameEn;

-- 2. نقل محتوى ItemCode الحالي إلى grade
UPDATE items SET grade = ItemCode WHERE grade IS NULL;

-- 3. إعادة توليد ItemCode ككود فريد تسلسلي (يتطلب MySQL 8.0+)
UPDATE items i
JOIN (
  SELECT ItemID, CONCAT('ITEM-', LPAD(ROW_NUMBER() OVER (ORDER BY ItemID), 5, '0')) AS new_code
  FROM items
) t ON i.ItemID = t.ItemID
SET i.ItemCode = t.new_code;
