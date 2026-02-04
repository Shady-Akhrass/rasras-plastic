-- تحويل MFR (GradeName) من نصي إلى رقمي
-- تنظيف القيم غير الرقمية أولاً
UPDATE items SET GradeName = NULL WHERE GradeName IS NOT NULL AND GradeName NOT REGEXP '^[0-9]+\.?[0-9]*$';
UPDATE items SET GradeName = NULL WHERE GradeName = '';
-- تغيير نوع العمود
ALTER TABLE items MODIFY COLUMN GradeName DECIMAL(10,4) NULL COMMENT 'MFR - معدل تدفق الذوبان (g/10 min)';
