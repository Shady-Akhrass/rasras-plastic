-- CLEAN RECREATION OF QUALITY TABLES
-- Run this whole script in your MySQL database (phpMyAdmin / Workbench)

-- 1. Create qualityparameters table
CREATE TABLE IF NOT EXISTS `qualityparameters` (
  `ParameterID` int(11) NOT NULL AUTO_INCREMENT,
  `ParameterCode` varchar(20) NOT NULL,
  `ParameterNameAr` varchar(100) NOT NULL,
  `ParameterNameEn` varchar(100) DEFAULT NULL,
  `UnitOfMeasure` varchar(20) DEFAULT NULL,
  `DataType` varchar(20) NOT NULL DEFAULT 'NUMERIC',
  `Description` varchar(500) DEFAULT NULL,
  `StandardValue` decimal(18,6) DEFAULT NULL,
  `MinValue` decimal(18,6) DEFAULT NULL,
  `MaxValue` decimal(18,6) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`ParameterID`),
  UNIQUE KEY `uk_qualityparameters_code` (`ParameterCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Create itemqualityspecs table
CREATE TABLE IF NOT EXISTS `itemqualityspecs` (
  `SpecID` int(11) NOT NULL AUTO_INCREMENT,
  `ItemID` int(11) NOT NULL,
  `ParameterID` int(11) NOT NULL,
  `MinValue` decimal(18,6) DEFAULT NULL,
  `MaxValue` decimal(18,6) DEFAULT NULL,
  `TargetValue` decimal(18,6) DEFAULT NULL,
  `IsCritical` tinyint(1) DEFAULT 0,
  `IsActive` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`SpecID`),
  KEY `fk_itemqualityspecs_item` (`ItemID`),
  KEY `fk_itemqualityspecs_parameter` (`ParameterID`),
  CONSTRAINT `fk_itemqualityspecs_item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`) ON DELETE CASCADE,
  CONSTRAINT `fk_itemqualityspecs_parameter` FOREIGN KEY (`ParameterID`) REFERENCES `qualityparameters` (`ParameterID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Insert initial quality parameters
INSERT INTO `qualityparameters` (`ParameterCode`, `ParameterNameAr`, `ParameterNameEn`, `UnitOfMeasure`, `DataType`, `Description`, `IsActive`) VALUES
('DEN', 'الكثافة', 'Density', 'g/cm³', 'NUMERIC', 'كثافة المادة', 1),
('MFI', 'معامل الانصهار', 'Melt Flow Index', 'g/10min', 'NUMERIC', 'معدل سريان المصهور', 1),
('TENS', 'قوة الشد', 'Tensile Strength', 'MPa', 'NUMERIC', 'مقاومة الشد', 1),
('ELONG', 'الاستطالة', 'Elongation at Break', '%', 'NUMERIC', 'نسبة الاستطالة عند الكسر', 1),
('FLEX', 'معامل الانحناء', 'Flexural Modulus', 'MPa', 'NUMERIC', 'مقاومة الانحناء', 1),
('IMPACT', 'مقاومة الصدم', 'Impact Strength', 'kJ/m²', 'NUMERIC', 'مقاومة الصدمات', 1),
('COLOR', 'اللون', 'Color', NULL, 'TEXT', 'لون المادة', 1),
('ODOR', 'الرائحة', 'Odor', NULL, 'BOOLEAN', 'وجود رائحة غير مقبولة', 1)
ON DUPLICATE KEY UPDATE `ParameterCode` = `ParameterCode`;
