-- تكلفة النقل كمصاريف تشغيلية (لا تُضاف إلى تكلفة الصنف)
ALTER TABLE stocktransfers
  ADD COLUMN TransferCostAmount decimal(18,4) DEFAULT NULL COMMENT 'تكلفة النقل - مصاريف تشغيلية' AFTER Notes;
