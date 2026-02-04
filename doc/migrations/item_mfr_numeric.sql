-- تحويل MFR (GradeName) من نص إلى رقم
-- ملاحظة: إذا كانت القيم الحالية تحتوي على نص غير رقمي، سيتم تحويلها إلى NULL
UPDATE items SET GradeName = NULL WHERE GradeName IS NOT NULL AND GradeName NOT RLIKE '^[0-9.]+$';
ALTER TABLE items MODIFY COLUMN GradeName DECIMAL(10,4) NULL COMMENT 'MFR - معدل تدفق الذوبان (g/10 min)';
