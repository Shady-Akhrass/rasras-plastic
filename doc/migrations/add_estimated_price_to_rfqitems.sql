-- إضافة عمود السعر التقريبي لجدول بنود طلب السعر
-- Add EstimatedUnitPrice column to rfqitems table
-- تاريخ: 2026-02-08

-- إذا ظهر خطأ "Duplicate column" فهذا يعني أن العمود موجود مسبقاً
ALTER TABLE rfqitems 
ADD COLUMN EstimatedUnitPrice DECIMAL(18,4) NULL AFTER Specifications;
