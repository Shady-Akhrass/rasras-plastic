-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 21, 2026 at 12:50 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rasrasplastics`
--

-- --------------------------------------------------------

--
-- Table structure for table `alertrules`
--

CREATE TABLE `alertrules` (
  `AlertRuleID` int NOT NULL,
  `RuleCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RuleName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RuleType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `EntityType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Condition` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ThresholdValue` decimal(18,2) DEFAULT NULL,
  `ThresholdDays` int DEFAULT NULL,
  `NotificationMessage` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NotifyRoleID` int DEFAULT NULL,
  `NotifyUserID` int DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `Frequency` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LastExecutedAt` datetime DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approvalactions`
--

CREATE TABLE `approvalactions` (
  `ActionID` int NOT NULL,
  `RequestID` int NOT NULL,
  `StepID` int NOT NULL,
  `ActionByUserID` int NOT NULL,
  `ActionDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `ActionType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DelegatedToUserID` int DEFAULT NULL,
  `Comments` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `AttachmentPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvalactions`
--

INSERT INTO `approvalactions` (`ActionID`, `RequestID`, `StepID`, `ActionByUserID`, `ActionDate`, `ActionType`, `DelegatedToUserID`, `Comments`, `AttachmentPath`) VALUES
(62, 38, 2, 1, '2026-02-15 10:07:46', 'Rejected', NULL, NULL, NULL),
(63, 39, 1, 1, '2026-02-15 10:35:51', 'Approved', NULL, NULL, NULL),
(64, 40, 16, 1, '2026-02-15 10:37:12', 'Approved', NULL, NULL, NULL),
(65, 40, 17, 1, '2026-02-15 10:37:30', 'Approved', NULL, NULL, NULL),
(66, 40, 18, 1, '2026-02-15 10:37:34', 'Approved', NULL, NULL, NULL),
(67, 41, 19, 1, '2026-02-15 10:38:17', 'Approved', NULL, NULL, NULL),
(68, 42, 10, 1, '2026-02-15 17:33:39', 'Approved', NULL, NULL, NULL),
(69, 42, 11, 1, '2026-02-15 17:34:01', 'Approved', NULL, NULL, NULL),
(70, 42, 12, 1, '2026-02-15 17:34:55', 'Approved', NULL, NULL, NULL),
(71, 43, 1, 1, '2026-02-15 17:37:09', 'Approved', NULL, NULL, NULL),
(72, 44, 16, 1, '2026-02-15 17:38:41', 'Approved', NULL, NULL, NULL),
(73, 44, 17, 1, '2026-02-15 17:38:44', 'Approved', NULL, NULL, NULL),
(74, 44, 18, 1, '2026-02-15 17:38:51', 'Approved', NULL, NULL, NULL),
(75, 45, 19, 1, '2026-02-15 17:39:36', 'Approved', NULL, NULL, NULL),
(76, 46, 10, 1, '2026-02-15 18:55:22', 'Approved', NULL, NULL, NULL),
(77, 46, 11, 1, '2026-02-15 18:55:36', 'Approved', NULL, NULL, NULL),
(78, 46, 12, 1, '2026-02-15 18:56:08', 'Approved', NULL, NULL, NULL),
(79, 47, 28, 1, '2026-02-16 09:22:30', 'Approved', NULL, NULL, NULL),
(80, 47, 29, 1, '2026-02-16 09:22:52', 'Approved', NULL, NULL, NULL),
(81, 48, 1, 1, '2026-02-16 11:14:58', 'Approved', NULL, NULL, NULL),
(82, 49, 16, 1, '2026-02-16 11:17:20', 'Approved', NULL, NULL, NULL),
(83, 49, 17, 1, '2026-02-16 11:17:23', 'Approved', NULL, NULL, NULL),
(84, 49, 18, 1, '2026-02-16 11:17:26', 'Approved', NULL, NULL, NULL),
(85, 51, 19, 1, '2026-02-16 11:30:38', 'Approved', NULL, NULL, NULL),
(86, 50, 15, 1, '2026-02-16 11:30:40', 'Approved', NULL, NULL, NULL),
(87, 52, 1, 1, '2026-02-16 18:43:10', 'Approved', NULL, NULL, NULL),
(88, 53, 16, 1, '2026-02-16 18:49:31', 'Approved', NULL, NULL, NULL),
(89, 53, 17, 1, '2026-02-16 18:49:35', 'Approved', NULL, NULL, NULL),
(90, 53, 18, 1, '2026-02-16 18:49:40', 'Approved', NULL, NULL, NULL),
(91, 54, 19, 1, '2026-02-16 18:50:18', 'Approved', NULL, NULL, NULL),
(92, 55, 28, 1, '2026-02-17 09:02:22', 'Approved', NULL, NULL, NULL),
(93, 55, 29, 1, '2026-02-17 09:02:43', 'Approved', NULL, NULL, NULL),
(94, 56, 1, 1, '2026-02-17 18:44:06', 'Approved', NULL, NULL, NULL),
(95, 57, 16, 1, '2026-02-17 18:46:40', 'Approved', NULL, NULL, NULL),
(96, 57, 17, 1, '2026-02-17 18:46:43', 'Approved', NULL, NULL, NULL),
(97, 57, 18, 1, '2026-02-17 18:46:48', 'Approved', NULL, NULL, NULL),
(98, 59, 19, 1, '2026-02-17 19:37:26', 'Approved', NULL, NULL, NULL),
(99, 58, 15, 1, '2026-02-17 19:37:28', 'Approved', NULL, NULL, NULL),
(100, 60, 10, 1, '2026-02-18 14:45:04', 'Approved', NULL, NULL, NULL),
(101, 60, 11, 1, '2026-02-18 14:45:09', 'Approved', NULL, NULL, NULL),
(102, 60, 12, 1, '2026-02-18 14:45:42', 'Approved', NULL, NULL, NULL),
(103, 64, 23, 1, '2026-02-19 18:18:28', 'Approved', NULL, NULL, NULL),
(104, 63, 23, 1, '2026-02-19 18:18:29', 'Approved', NULL, NULL, NULL),
(105, 62, 23, 1, '2026-02-19 18:18:31', 'Approved', NULL, NULL, NULL),
(106, 61, 23, 1, '2026-02-19 18:18:33', 'Approved', NULL, NULL, NULL),
(107, 67, 23, 1, '2026-02-19 18:26:30', 'Approved', NULL, NULL, NULL),
(108, 66, 23, 1, '2026-02-19 18:26:31', 'Approved', NULL, NULL, NULL),
(109, 65, 23, 1, '2026-02-19 18:26:33', 'Approved', NULL, NULL, NULL),
(110, 68, 23, 1, '2026-02-19 18:48:17', 'Approved', NULL, NULL, NULL),
(111, 69, 20, 1, '2026-02-19 18:54:10', 'Approved', NULL, NULL, NULL),
(112, 69, 21, 1, '2026-02-19 18:54:31', 'Approved', NULL, NULL, NULL),
(113, 69, 22, 1, '2026-02-19 18:54:39', 'Approved', NULL, NULL, NULL),
(114, 70, 23, 1, '2026-02-20 20:25:43', 'Approved', NULL, NULL, NULL),
(115, 71, 20, 1, '2026-02-20 21:25:16', 'Approved', NULL, NULL, NULL),
(116, 71, 21, 1, '2026-02-20 21:34:54', 'Approved', NULL, NULL, NULL),
(117, 71, 22, 1, '2026-02-20 21:35:14', 'Approved', NULL, NULL, NULL),
(118, 72, 28, 1, '2026-02-20 21:37:23', 'Approved', NULL, NULL, NULL),
(119, 72, 29, 1, '2026-02-20 21:37:29', 'Approved', NULL, NULL, NULL),
(120, 73, 1, 1, '2026-02-21 08:46:18', 'Approved', NULL, NULL, NULL),
(121, 74, 16, 1, '2026-02-21 08:47:37', 'Approved', NULL, NULL, NULL),
(122, 74, 17, 1, '2026-02-21 08:47:41', 'Approved', NULL, NULL, NULL),
(123, 74, 18, 1, '2026-02-21 08:47:47', 'Approved', NULL, NULL, NULL),
(124, 75, 19, 1, '2026-02-21 08:48:40', 'Approved', NULL, NULL, NULL),
(125, 76, 10, 1, '2026-02-21 08:49:43', 'Approved', NULL, NULL, NULL),
(126, 76, 11, 1, '2026-02-21 08:49:55', 'Approved', NULL, NULL, NULL),
(127, 76, 12, 1, '2026-02-21 08:50:01', 'Approved', NULL, NULL, NULL),
(128, 77, 1, 1, '2026-02-21 09:09:39', 'Approved', NULL, NULL, NULL),
(129, 78, 16, 1, '2026-02-21 09:11:19', 'Approved', NULL, NULL, NULL),
(130, 78, 17, 1, '2026-02-21 09:11:24', 'Approved', NULL, NULL, NULL),
(131, 78, 18, 1, '2026-02-21 09:11:28', 'Approved', NULL, NULL, NULL),
(132, 79, 19, 1, '2026-02-21 09:12:20', 'Approved', NULL, NULL, NULL),
(133, 80, 20, 1, '2026-02-21 09:28:15', 'Approved', NULL, NULL, NULL),
(134, 80, 21, 1, '2026-02-21 09:28:21', 'Approved', NULL, NULL, NULL),
(135, 80, 22, 1, '2026-02-21 09:28:26', 'Approved', NULL, NULL, NULL),
(136, 81, 20, 1, '2026-02-21 09:53:46', 'Approved', NULL, NULL, NULL),
(137, 81, 21, 1, '2026-02-21 09:53:50', 'Approved', NULL, NULL, NULL),
(138, 81, 22, 1, '2026-02-21 09:53:53', 'Approved', NULL, NULL, NULL),
(139, 82, 28, 1, '2026-02-21 09:54:34', 'Approved', NULL, NULL, NULL),
(140, 82, 29, 1, '2026-02-21 09:54:42', 'Approved', NULL, NULL, NULL),
(141, 83, 10, 1, '2026-02-21 10:56:28', 'Approved', NULL, NULL, NULL),
(142, 83, 11, 1, '2026-02-21 10:56:32', 'Approved', NULL, NULL, NULL),
(143, 83, 12, 1, '2026-02-21 10:56:39', 'Approved', NULL, NULL, NULL),
(144, 84, 10, 1, '2026-02-21 11:10:19', 'Approved', NULL, NULL, NULL),
(145, 84, 11, 1, '2026-02-21 11:10:24', 'Approved', NULL, NULL, NULL),
(146, 84, 12, 1, '2026-02-21 11:10:28', 'Approved', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `approvallimits`
--

CREATE TABLE `approvallimits` (
  `ApprovalLimitID` int NOT NULL,
  `ActivityType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RoleID` int NOT NULL,
  `MinAmount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `MaxAmount` decimal(18,2) DEFAULT NULL,
  `MinPercentage` decimal(5,2) DEFAULT '0.00',
  `MaxPercentage` decimal(5,2) DEFAULT NULL,
  `RequiresReviewBy` int DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvallimits`
--

INSERT INTO `approvallimits` (`ApprovalLimitID`, `ActivityType`, `RoleID`, `MinAmount`, `MaxAmount`, `MinPercentage`, `MaxPercentage`, `RequiresReviewBy`, `IsActive`, `CreatedAt`) VALUES
(1, 'PO_APPROVAL', 5, 0.00, 20000.00, 0.00, NULL, NULL, 1, '2026-02-11 09:06:02'),
(2, 'PO_APPROVAL', 3, 20000.00, 50000.00, 0.00, NULL, NULL, 1, '2026-02-11 09:06:02'),
(3, 'PO_APPROVAL', 2, 50000.00, NULL, 0.00, NULL, NULL, 1, '2026-02-11 09:06:02'),
(4, 'PAYMENT_APPROVAL', 4, 0.00, 30000.00, 0.00, NULL, NULL, 1, '2026-02-11 09:06:02'),
(5, 'PAYMENT_APPROVAL', 3, 30000.00, 100000.00, 0.00, NULL, NULL, 1, '2026-02-11 09:06:02'),
(6, 'PAYMENT_APPROVAL', 2, 100000.00, NULL, 0.00, NULL, NULL, 1, '2026-02-11 09:06:02'),
(7, 'SALES_DISCOUNT', 7, 0.00, NULL, 0.00, 5.00, NULL, 1, '2026-02-11 09:06:02'),
(8, 'SALES_DISCOUNT', 3, 0.00, NULL, 5.00, 10.00, NULL, 1, '2026-02-11 09:06:02'),
(9, 'SALES_DISCOUNT', 2, 0.00, NULL, 10.00, NULL, NULL, 1, '2026-02-11 09:06:02');

-- --------------------------------------------------------

--
-- Table structure for table `approvalrequests`
--

CREATE TABLE `approvalrequests` (
  `RequestID` int NOT NULL,
  `WorkflowID` int NOT NULL,
  `DocumentType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DocumentID` int NOT NULL,
  `DocumentNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `RequestedByUserID` int NOT NULL,
  `RequestedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `CurrentStepID` int DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `TotalAmount` decimal(18,2) DEFAULT NULL,
  `Priority` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Normal',
  `DueDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CompletedDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvalrequests`
--

INSERT INTO `approvalrequests` (`RequestID`, `WorkflowID`, `DocumentType`, `DocumentID`, `DocumentNumber`, `RequestedByUserID`, `RequestedDate`, `CurrentStepID`, `Status`, `TotalAmount`, `Priority`, `DueDate`, `Notes`, `CompletedDate`) VALUES
(38, 6, 'Supplier', 4, 'SUP-4', 1, '2026-02-15 10:07:33', NULL, 'Rejected', 0.00, 'Normal', NULL, NULL, '2026-02-15 10:07:46'),
(39, 5, 'PurchaseRequisition', 11, '#PR-1', 1, '2026-02-15 10:09:09', 1, 'Approved', NULL, 'Normal', NULL, NULL, '2026-02-15 10:35:51'),
(40, 8, 'QuotationComparison', 9, '#COMP-1', 1, '2026-02-15 10:37:01', 18, 'Approved', 8529.00, 'Normal', NULL, NULL, '2026-02-15 10:37:35'),
(41, 7, 'GoodsReceiptNote', 7, '#GRN-1', 1, '2026-02-15 10:38:11', 19, 'Approved', 8529.00, 'Normal', NULL, NULL, '2026-02-15 10:38:17'),
(42, 13, 'PaymentVoucher', 1, 'PV-1', 1, '2026-02-15 17:32:49', 12, 'Approved', 8529.00, 'Normal', NULL, NULL, '2026-02-15 17:34:55'),
(43, 5, 'PurchaseRequisition', 12, '#PR-2', 1, '2026-02-15 17:36:48', 1, 'Approved', NULL, 'Normal', NULL, NULL, '2026-02-15 17:37:09'),
(44, 8, 'QuotationComparison', 10, '#COMP-2', 1, '2026-02-15 17:38:34', 18, 'Approved', 415900.00, 'Normal', NULL, NULL, '2026-02-15 17:38:51'),
(45, 7, 'GoodsReceiptNote', 8, '#GRN-2', 1, '2026-02-15 17:39:27', 19, 'Approved', 415900.00, 'Normal', NULL, NULL, '2026-02-15 17:39:36'),
(46, 13, 'PaymentVoucher', 2, 'PV-2', 1, '2026-02-15 18:54:36', 12, 'Approved', 415900.00, 'Normal', NULL, NULL, '2026-02-15 18:56:08'),
(47, 23, 'StockIssueNote', 2, 'SIN-1771233653827', 1, '2026-02-16 09:21:12', 29, 'Approved', 0.00, 'Normal', NULL, NULL, '2026-02-16 09:22:52'),
(48, 5, 'PurchaseRequisition', 13, '#PR-3', 1, '2026-02-16 11:14:21', 1, 'Approved', NULL, 'Normal', NULL, NULL, '2026-02-16 11:14:58'),
(49, 8, 'QuotationComparison', 11, '#COMP-3', 1, '2026-02-16 11:17:14', 18, 'Approved', 57150.00, 'Normal', NULL, NULL, '2026-02-16 11:17:26'),
(50, 12, 'PurchaseReturn', 3, 'RET-1771241402967', 1, '2026-02-16 11:30:03', 15, 'Approved', 20000.00, 'Normal', NULL, NULL, '2026-02-16 11:30:40'),
(51, 7, 'GoodsReceiptNote', 9, '#GRN-3', 1, '2026-02-16 11:30:03', 19, 'Approved', 35490.00, 'Normal', NULL, NULL, '2026-02-16 11:30:38'),
(52, 5, 'PurchaseRequisition', 14, '#PR-4', 1, '2026-02-16 18:42:14', 1, 'Approved', NULL, 'Normal', NULL, NULL, '2026-02-16 18:43:10'),
(53, 8, 'QuotationComparison', 12, '#COMP-4', 1, '2026-02-16 18:48:34', 18, 'Approved', 26945.00, 'Normal', NULL, NULL, '2026-02-16 18:49:40'),
(54, 7, 'GoodsReceiptNote', 10, '#GRN-4', 1, '2026-02-16 18:50:10', 19, 'Approved', 26945.00, 'Normal', NULL, NULL, '2026-02-16 18:50:18'),
(55, 23, 'StockIssueNote', 3, 'SIN-1771318928330', 1, '2026-02-17 09:02:11', 29, 'Approved', 0.00, 'Normal', NULL, NULL, '2026-02-17 09:02:43'),
(56, 5, 'PurchaseRequisition', 15, '#PR-5', 1, '2026-02-17 18:43:56', 1, 'Approved', NULL, 'Normal', NULL, NULL, '2026-02-17 18:44:06'),
(57, 8, 'QuotationComparison', 13, '#COMP-5', 1, '2026-02-17 18:46:36', 18, 'Approved', 550000.00, 'Normal', NULL, NULL, '2026-02-17 18:46:49'),
(58, 12, 'PurchaseReturn', 4, 'RET-1771354040311', 1, '2026-02-17 18:47:20', 15, 'Approved', 250000.00, 'Normal', NULL, NULL, '2026-02-17 19:37:28'),
(59, 7, 'GoodsReceiptNote', 11, '#GRN-5', 1, '2026-02-17 18:47:20', 19, 'Approved', 282100.00, 'Normal', NULL, NULL, '2026-02-17 19:37:26'),
(60, 13, 'PaymentVoucher', 3, 'PV-3', 1, '2026-02-18 14:44:56', 12, 'Approved', 282100.00, 'Normal', NULL, NULL, '2026-02-18 14:45:42'),
(61, 20, 'SalesQuotation', 2, 'SQ-1771233573320', 1, '2026-02-19 18:18:09', 23, 'Approved', 230.40, 'Normal', NULL, NULL, '2026-02-19 18:18:33'),
(62, 20, 'SalesQuotation', 7, 'SQ-1771525081586', 1, '2026-02-19 18:18:12', 23, 'Approved', 102.60, 'Normal', NULL, NULL, '2026-02-19 18:18:31'),
(63, 20, 'SalesQuotation', 6, 'SQ-1771503819833', 1, '2026-02-19 18:18:14', 23, 'Approved', 1026.00, 'Normal', NULL, NULL, '2026-02-19 18:18:29'),
(64, 20, 'SalesQuotation', 5, 'SQ-1771502470558', 1, '2026-02-19 18:18:17', 23, 'Approved', 102.60, 'Normal', NULL, NULL, '2026-02-19 18:18:28'),
(65, 20, 'SalesQuotation', 4, 'SQ-1771318794368', 1, '2026-02-19 18:22:50', 23, 'Approved', 90.00, 'Normal', NULL, NULL, '2026-02-19 18:26:33'),
(66, 20, 'SalesQuotation', 3, 'SQ-1771270233129', 1, '2026-02-19 18:22:52', 23, 'Approved', 62.00, 'Normal', NULL, NULL, '2026-02-19 18:26:31'),
(67, 20, 'SalesQuotation', 1, 'SQ-1771176922100', 1, '2026-02-19 18:22:55', 23, 'Approved', 0.00, 'Normal', NULL, NULL, '2026-02-19 18:26:30'),
(68, 20, 'SalesQuotation', 8, 'SQ-1771526886219', 1, '2026-02-19 18:48:06', 23, 'Approved', 615.60, 'Normal', NULL, NULL, '2026-02-19 18:48:17'),
(69, 4, 'SalesOrder', 6, 'SO-1771527235295', 1, '2026-02-19 18:53:55', 22, 'Approved', 615.60, 'Normal', NULL, NULL, '2026-02-19 18:54:39'),
(70, 20, 'SalesQuotation', 9, 'SQ-1771619093474', 1, '2026-02-20 20:24:54', 23, 'Approved', 12921.66, 'Normal', NULL, NULL, '2026-02-20 20:25:43'),
(71, 4, 'SalesOrder', 7, 'SO-1771622157587', 1, '2026-02-20 21:15:58', 22, 'Approved', 12921.66, 'Normal', NULL, NULL, '2026-02-20 21:35:14'),
(72, 23, 'StockIssueNote', 5, 'SIN-1771623428388', 1, '2026-02-20 21:37:13', 29, 'Approved', 0.00, 'Normal', NULL, NULL, '2026-02-20 21:37:29'),
(73, 5, 'PurchaseRequisition', 16, '#PR-6', 1, '2026-02-21 08:46:12', 1, 'Approved', NULL, 'Normal', NULL, NULL, '2026-02-21 08:46:18'),
(74, 8, 'QuotationComparison', 14, '#COMP-6', 1, '2026-02-21 08:47:29', 18, 'Approved', 36468.00, 'Normal', NULL, NULL, '2026-02-21 08:47:47'),
(75, 7, 'GoodsReceiptNote', 12, '#GRN-6', 1, '2026-02-21 08:48:26', 19, 'Approved', 36468.00, 'Normal', NULL, NULL, '2026-02-21 08:48:40'),
(76, 13, 'PaymentVoucher', 4, 'PV-4', 1, '2026-02-21 08:49:38', 12, 'Approved', 36468.00, 'Normal', NULL, NULL, '2026-02-21 08:50:01'),
(77, 5, 'PurchaseRequisition', 17, '#PR-7', 1, '2026-02-21 09:09:35', 1, 'Approved', NULL, 'Normal', NULL, NULL, '2026-02-21 09:09:39'),
(78, 8, 'QuotationComparison', 15, '#COMP-7', 1, '2026-02-21 09:11:08', 18, 'Approved', 3000000.00, 'Normal', NULL, NULL, '2026-02-21 09:11:28'),
(79, 7, 'GoodsReceiptNote', 13, '#GRN-7', 1, '2026-02-21 09:12:11', 19, 'Approved', 3000000.00, 'Normal', NULL, NULL, '2026-02-21 09:12:20'),
(80, 4, 'SalesOrder', 8, 'SO-1771666086539', 1, '2026-02-21 09:28:07', 22, 'Approved', 397.47, 'Normal', NULL, NULL, '2026-02-21 09:28:26'),
(81, 4, 'SalesOrder', 9, 'SO-1771667618676', 1, '2026-02-21 09:53:39', 22, 'Approved', 102.60, 'Normal', NULL, NULL, '2026-02-21 09:53:53'),
(82, 23, 'StockIssueNote', 8, 'SIN-1771667653762', 1, '2026-02-21 09:54:14', 29, 'Approved', 0.00, 'Normal', NULL, NULL, '2026-02-21 09:54:42'),
(83, 13, 'PaymentVoucher', 5, 'PV-5', 1, '2026-02-21 10:56:19', 12, 'Approved', 0.00, 'Normal', NULL, NULL, '2026-02-21 10:56:40'),
(84, 13, 'PaymentVoucher', 6, 'PV-6', 1, '2026-02-21 11:10:03', 12, 'Approved', 26945.00, 'Normal', NULL, NULL, '2026-02-21 11:10:28');

-- --------------------------------------------------------

--
-- Table structure for table `approvalworkflows`
--

CREATE TABLE `approvalworkflows` (
  `WorkflowID` int NOT NULL,
  `WorkflowCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `WorkflowName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DocumentType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvalworkflows`
--

INSERT INTO `approvalworkflows` (`WorkflowID`, `WorkflowCode`, `WorkflowName`, `DocumentType`, `IsActive`, `CreatedAt`) VALUES
(1, 'PO_APPROVAL', 'اعتماد أوامر الشراء', 'PurchaseOrder', 1, '2026-01-12 23:13:08'),
(2, 'PAY_APPROVAL', 'اعتماد سندات الصرف', 'PaymentVoucher', 1, '2026-01-12 23:13:08'),
(3, 'DISC_APPROVAL', 'اعتماد الخصومات', 'SalesDiscount', 1, '2026-01-12 23:13:08'),
(4, 'SO_APPROVAL', 'اعتماد أوامر البيع', 'SalesOrder', 1, '2026-01-12 23:13:08'),
(5, 'PR_APPROVAL', 'Purchase Requisition Approval', 'PurchaseRequisition', 1, '2026-01-25 17:05:18'),
(6, 'SUPPLIER_APPROVAL', 'Supplier Approval', 'Supplier', 1, '2026-01-25 17:05:18'),
(7, 'GRN_APPROVAL', 'Goods Receipt Note Approval', 'GoodsReceiptNote', 1, '2026-01-26 13:02:42'),
(8, 'QC_APPROVAL', 'اعتماد مقارنة العروض', 'QuotationComparison', 1, '2026-01-27 15:44:20'),
(12, 'RET_APPROVAL', 'Purchase Return Approval', 'PurchaseReturn', 1, '2026-02-08 07:21:07'),
(13, 'PV_APPROVAL', 'Payment Voucher Approval', 'PaymentVoucher', 1, '2026-02-13 11:15:12'),
(20, 'QUOTATION_APPROVAL', 'Sales Quotation Approval', 'SalesQuotation', 1, '2026-02-16 11:02:20'),
(21, 'INVOICE_APPROVAL', 'Sales Invoice Approval', 'SalesInvoice', 1, '2026-02-16 11:02:20'),
(22, 'DELIVERY_APPROVAL', 'Delivery Order Approval', 'DeliveryOrder', 1, '2026-02-16 11:02:20'),
(23, 'ISSUE_NOTE_APPROVAL', 'Stock Issue Note Approval', 'StockIssueNote', 1, '2026-02-16 11:02:20'),
(24, 'RECEIPT_APPROVAL', 'Payment Receipt Approval', 'PaymentReceipt', 1, '2026-02-16 11:02:20');

-- --------------------------------------------------------

--
-- Table structure for table `approvalworkflowsteps`
--

CREATE TABLE `approvalworkflowsteps` (
  `StepID` int NOT NULL,
  `WorkflowID` int NOT NULL,
  `StepNumber` int NOT NULL,
  `StepName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ApproverType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ApproverRoleID` int DEFAULT NULL,
  `ApproverUserID` int DEFAULT NULL,
  `MinAmount` decimal(18,2) DEFAULT NULL,
  `MaxAmount` decimal(18,2) DEFAULT NULL,
  `IsRequired` tinyint(1) DEFAULT '1',
  `CanSkip` tinyint(1) DEFAULT '0',
  `EscalationDays` int DEFAULT '3',
  `EscalateToStepID` int DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvalworkflowsteps`
--

INSERT INTO `approvalworkflowsteps` (`StepID`, `WorkflowID`, `StepNumber`, `StepName`, `ApproverType`, `ApproverRoleID`, `ApproverUserID`, `MinAmount`, `MaxAmount`, `IsRequired`, `CanSkip`, `EscalationDays`, `EscalateToStepID`, `IsActive`) VALUES
(1, 5, 1, 'Procurement Manager Approval', 'ROLE', 5, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(2, 6, 1, 'General Manager Approval', 'ROLE', 2, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(10, 13, 1, 'Finance Manager Approval', 'ROLE', 3, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(11, 13, 2, 'General Manager Approval', 'ROLE', 2, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(12, 13, 3, 'Payment Disbursement', 'ROLE', 4, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(15, 12, 1, 'Quality Controller Approval', 'ROLE', 10, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(16, 8, 1, 'Procurement Manager Approval', 'ROLE', 5, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(17, 8, 2, 'Finance Manager Approval', 'ROLE', 3, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(18, 8, 3, 'General Manager Approval', 'ROLE', 2, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(19, 7, 1, 'Quality Controller Approval', '', 10, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(20, 4, 1, 'Sales Manager Approval', 'ROLE', 6, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(21, 4, 2, 'Finance Manager Approval', 'ROLE', 3, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(22, 4, 3, 'General Manager Approval', 'ROLE', 2, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(23, 20, 1, 'Sales Manager Approval', 'ROLE', 6, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(24, 21, 1, 'Finance Manager Approval', 'ROLE', 3, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(25, 21, 2, 'General Manager Approval', 'ROLE', 2, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(26, 22, 1, 'Warehouse Manager Approval', 'ROLE', 6, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(27, 22, 2, 'Sales Manager Approval', 'ROLE', 6, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(28, 23, 1, 'Warehouse Manager Approval', 'ROLE', 6, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(29, 23, 2, 'Sales Manager Approval', 'ROLE', 6, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(30, 24, 1, 'Finance Manager Approval', 'ROLE', 3, NULL, NULL, NULL, 1, 0, 3, NULL, 1),
(31, 24, 2, 'General Manager Approval', 'ROLE', 2, NULL, NULL, NULL, 1, 0, 3, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `AttendanceID` int NOT NULL,
  `EmployeeID` int NOT NULL,
  `AttendanceDate` date NOT NULL,
  `CheckInTime` time DEFAULT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LeaveType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `OvertimeHours` decimal(5,2) DEFAULT '0.00',
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auditlog`
--

CREATE TABLE `auditlog` (
  `AuditLogID` bigint NOT NULL,
  `TableName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RecordID` int NOT NULL,
  `ActionType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `OldValues` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `NewValues` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `UserID` int NOT NULL,
  `ActionDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `IPAddress` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MachineName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bankaccounts`
--

CREATE TABLE `bankaccounts` (
  `BankAccountID` int NOT NULL,
  `AccountNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `AccountNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `AccountNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BankID` int NOT NULL,
  `BranchName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IBAN` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `AccountType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `OpeningBalance` decimal(18,2) DEFAULT '0.00',
  `CurrentBalance` decimal(18,2) DEFAULT '0.00',
  `GLAccountID` int DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banks`
--

CREATE TABLE `banks` (
  `BankID` int NOT NULL,
  `BankCode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `BankNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `BankNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SwiftCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banktransactions`
--

CREATE TABLE `banktransactions` (
  `TransactionID` int NOT NULL,
  `BankAccountID` int NOT NULL,
  `TransactionDate` date NOT NULL,
  `TransactionType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ReferenceType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceID` int DEFAULT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DebitAmount` decimal(18,2) DEFAULT '0.00',
  `CreditAmount` decimal(18,2) DEFAULT '0.00',
  `Balance` decimal(18,2) DEFAULT NULL,
  `IsReconciled` tinyint(1) DEFAULT '0',
  `ReconciledDate` date DEFAULT NULL,
  `StatementReference` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `JournalEntryID` int DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cashregisters`
--

CREATE TABLE `cashregisters` (
  `CashRegisterID` int NOT NULL,
  `RegisterCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RegisterNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RegisterNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `RegisterType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `OpeningBalance` decimal(18,2) DEFAULT '0.00',
  `CurrentBalance` decimal(18,2) DEFAULT '0.00',
  `CustodianID` int DEFAULT NULL,
  `GLAccountID` int DEFAULT NULL,
  `MaxBalance` decimal(18,2) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chartofaccounts`
--

CREATE TABLE `chartofaccounts` (
  `AccountID` int NOT NULL,
  `AccountCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `AccountNameAr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `AccountNameEn` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ParentAccountID` int DEFAULT NULL,
  `AccountType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `AccountNature` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `AccountLevel` int DEFAULT NULL,
  `AccountCategory` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsParent` tinyint(1) DEFAULT '0',
  `IsControlAccount` tinyint(1) DEFAULT '0',
  `IsActive` tinyint(1) DEFAULT '1',
  `IsCashAccount` tinyint(1) DEFAULT '0',
  `IsBankAccount` tinyint(1) DEFAULT '0',
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `OpeningBalance` decimal(18,2) DEFAULT '0.00',
  `CurrentBalance` decimal(18,2) DEFAULT '0.00',
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chequesissued`
--

CREATE TABLE `chequesissued` (
  `ChequeID` int NOT NULL,
  `ChequeNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `BankAccountID` int NOT NULL,
  `ChequeDate` date NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `PayeeName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SupplierID` int DEFAULT NULL,
  `PaymentVoucherID` int DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Issued',
  `DeliveredDate` date DEFAULT NULL,
  `CashedDate` date DEFAULT NULL,
  `CancelReason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chequesreceived`
--

CREATE TABLE `chequesreceived` (
  `ChequeID` int NOT NULL,
  `ChequeNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `BankName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BranchName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ChequeDate` date NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `DrawerName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CustomerID` int DEFAULT NULL,
  `ReceiptVoucherID` int DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Received',
  `CollectionBankAccountID` int DEFAULT NULL,
  `CollectionDate` date DEFAULT NULL,
  `ReturnReason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `EndorsedToSupplierID` int DEFAULT NULL,
  `EndorsedDate` date DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companyinfo`
--

CREATE TABLE `companyinfo` (
  `CompanyID` int NOT NULL,
  `CompanyNameAr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CompanyNameEn` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TaxRegistrationNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CommercialRegNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `City` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Egypt',
  `Phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Fax` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Website` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LogoPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `HeaderPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FooterText` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `FiscalYearStartMonth` int DEFAULT '1',
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companyinfo`
--

INSERT INTO `companyinfo` (`CompanyID`, `CompanyNameAr`, `CompanyNameEn`, `TaxRegistrationNo`, `CommercialRegNo`, `Address`, `City`, `Country`, `Phone`, `Fax`, `Email`, `Website`, `LogoPath`, `HeaderPath`, `FooterText`, `Currency`, `FiscalYearStartMonth`, `UpdatedAt`, `UpdatedBy`) VALUES
(1, 'رصرص لخامات البلاستيك', 'RasRas Plastics', '554532', '120-3', '', 'ا', 'Egypt', '200694603676', '0262535737', 'rasrasplastic@gmail.com', 'rasrasplastics.com', 'http://localhost:8080/api/uploads/38006aae-4b64-44c5-b2bc-738f1b5b50d3_WhatsApp%20Image%202026-01-26%20at%2011.26.12%20AM.jpeg', '', 's', 'EGP', 1, '2026-01-27 16:41:16', 1);

-- --------------------------------------------------------

--
-- Table structure for table `costcenters`
--

CREATE TABLE `costcenters` (
  `CostCenterID` int NOT NULL,
  `CostCenterCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CostCenterName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ParentCostCenterID` int DEFAULT NULL,
  `DepartmentID` int DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `creditnotes`
--

CREATE TABLE `creditnotes` (
  `CreditNoteID` int NOT NULL,
  `CreditNoteNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CreditNoteDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CustomerID` int NOT NULL,
  `SalesReturnID` int DEFAULT NULL,
  `SalesInvoiceID` int DEFAULT NULL,
  `CreditNoteType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `SubTotal` decimal(18,2) NOT NULL,
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalAmount` decimal(18,2) NOT NULL,
  `AppliedAmount` decimal(18,2) DEFAULT '0.00',
  `RemainingAmount` decimal(18,2) GENERATED ALWAYS AS ((`TotalAmount` - `AppliedAmount`)) STORED,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `JournalEntryID` int DEFAULT NULL,
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customercontacts`
--

CREATE TABLE `customercontacts` (
  `ContactID` int NOT NULL,
  `CustomerID` int NOT NULL,
  `ContactName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `JobTitle` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsPrimary` tinyint(1) DEFAULT '0',
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customerrequestdeliveryschedules`
--

CREATE TABLE `customerrequestdeliveryschedules` (
  `scheduleId` int NOT NULL,
  `deliveryDate` date NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `quantity` decimal(18,2) NOT NULL,
  `RequestID` int NOT NULL,
  `productId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customerrequestdeliveryschedules`
--

INSERT INTO `customerrequestdeliveryschedules` (`scheduleId`, `deliveryDate`, `notes`, `quantity`, `RequestID`, `productId`) VALUES
(1, '2026-02-19', '', 6.00, 8, NULL),
(2, '2026-02-25', '', 4.00, 8, NULL),
(3, '2026-02-19', '', 7.00, 10, NULL),
(4, '2026-02-24', '', 6.00, 11, 1),
(5, '2026-02-28', '', 7.00, 11, 2);

-- --------------------------------------------------------

--
-- Table structure for table `customerrequestitems`
--

CREATE TABLE `customerrequestitems` (
  `itemId` int NOT NULL,
  `notes` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `productId` int DEFAULT NULL,
  `productName` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` decimal(18,2) NOT NULL,
  `RequestID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customerrequestitems`
--

INSERT INTO `customerrequestitems` (`itemId`, `notes`, `productId`, `productName`, `quantity`, `RequestID`) VALUES
(1, '', 1, 'TEST-1012', 1.00, 7),
(2, '', 1, 'TEST-1012', 1.00, 8),
(3, '', 1, 'TEST-1012', 6.00, 9),
(4, '', 1, 'TEST-1012', 7.00, 10),
(5, '', 1, 'TEST-1012', 6.00, 11),
(6, '', 2, 'صنف 2', 7.00, 11);

-- --------------------------------------------------------

--
-- Table structure for table `customerrequests`
--

CREATE TABLE `customerrequests` (
  `requestId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL,
  `createdBy` int DEFAULT NULL,
  `customerId` int NOT NULL,
  `notes` varchar(1000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `requestDate` date NOT NULL,
  `requestNumber` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approvedAt` datetime(6) DEFAULT NULL,
  `approvedBy` int DEFAULT NULL,
  `rejectionReason` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `priceListId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customerrequests`
--

INSERT INTO `customerrequests` (`requestId`, `createdAt`, `createdBy`, `customerId`, `notes`, `requestDate`, `requestNumber`, `status`, `approvedAt`, `approvedBy`, `rejectionReason`, `priceListId`) VALUES
(1, '2026-02-16 18:55:14.091151', NULL, 1, '', '2026-02-16', 'CR-2026001', 'Approved', '2026-02-16 19:17:58.808377', NULL, NULL, NULL),
(2, '2026-02-16 19:18:38.405582', NULL, 1, '', '2026-02-16', 'CR-2026002', 'Approved', '2026-02-16 19:24:46.687718', NULL, NULL, NULL),
(3, '2026-02-16 19:29:37.681839', NULL, 1, '', '2026-02-16', 'CR-2026003', 'Approved', '2026-02-16 19:29:50.890374', NULL, NULL, NULL),
(4, '2026-02-17 09:41:20.545957', NULL, 1, '', '2026-02-17', 'CR-2026004', 'Approved', '2026-02-17 18:43:06.631547', NULL, NULL, NULL),
(5, '2026-02-19 11:03:56.558535', NULL, 1, '', '2026-02-19', 'CR-2026005', 'Approved', '2026-02-19 11:15:08.897554', NULL, NULL, NULL),
(6, '2026-02-19 11:48:56.318174', NULL, 1, '', '2026-02-19', 'CR-2026006', 'Approved', '2026-02-19 11:49:03.327452', NULL, NULL, NULL),
(7, '2026-02-19 11:52:52.668582', NULL, 1, '', '2026-02-19', 'CR-2026007', 'Approved', '2026-02-19 11:52:57.245515', NULL, NULL, NULL),
(8, '2026-02-19 12:21:59.202696', NULL, 1, '', '2026-02-19', 'CR-2026008', 'Approved', '2026-02-19 12:22:04.656512', NULL, NULL, NULL),
(9, '2026-02-19 18:22:33.614300', NULL, 1, '', '2026-02-19', 'CR-2026009', 'Approved', '2026-02-19 18:26:42.496992', NULL, NULL, NULL),
(10, '2026-02-19 19:16:35.497475', NULL, 1, '', '2026-02-19', 'CR-2026010', 'Approved', '2026-02-19 19:16:48.434351', NULL, NULL, NULL),
(11, '2026-02-20 20:21:59.859472', NULL, 1, '', '2026-02-20', 'CR-2026011', 'Approved', '2026-02-20 20:23:32.432366', NULL, NULL, 11);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `CustomerID` int NOT NULL,
  `CustomerCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CustomerNameAr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CustomerNameEn` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CustomerType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CustomerClass` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TaxRegistrationNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CommercialRegNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `City` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Egypt',
  `Phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Fax` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Website` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactPerson` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactPhone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaymentTermDays` int DEFAULT '0',
  `CreditLimit` decimal(38,2) DEFAULT NULL,
  `CurrentBalance` decimal(38,2) DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `SalesRepID` int DEFAULT NULL,
  `PriceListID` int DEFAULT NULL,
  `DiscountPercentage` decimal(38,2) DEFAULT NULL,
  `IsApproved` tinyint(1) DEFAULT '0',
  `ApprovedBy` int DEFAULT NULL,
  `ApprovedDate` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`CustomerID`, `CustomerCode`, `CustomerNameAr`, `CustomerNameEn`, `CustomerType`, `CustomerClass`, `TaxRegistrationNo`, `CommercialRegNo`, `Address`, `City`, `Country`, `Phone`, `Fax`, `Email`, `Website`, `ContactPerson`, `ContactPhone`, `PaymentTermDays`, `CreditLimit`, `CurrentBalance`, `Currency`, `SalesRepID`, `PriceListID`, `DiscountPercentage`, `IsApproved`, `ApprovedBy`, `ApprovedDate`, `IsActive`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`) VALUES
(1, 'crm-101', 'عميل 1', '', 'INDIVIDUAL', 'C', '', '', '', '', 'Egypt', '', '', '', '', '', '', 0, 0.00, 0.00, 'EGP', NULL, 11, 0.00, 0, NULL, NULL, 1, '', '2026-02-15 16:42:30', NULL, '2026-02-15 16:44:04', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dailymarketprices`
--

CREATE TABLE `dailymarketprices` (
  `PriceID` int NOT NULL,
  `PriceDate` date NOT NULL,
  `ItemID` int NOT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'USD',
  `MarketPrice` decimal(18,4) NOT NULL,
  `LocalPrice` decimal(18,4) DEFAULT NULL,
  `ExchangeRate` decimal(18,6) DEFAULT NULL,
  `Source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `debitnotes`
--

CREATE TABLE `debitnotes` (
  `DebitNoteID` int NOT NULL,
  `DebitNoteNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DebitNoteDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SupplierID` int NOT NULL,
  `PurchaseReturnID` int DEFAULT NULL,
  `SupplierInvoiceID` int DEFAULT NULL,
  `DebitNoteType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `SubTotal` decimal(18,2) NOT NULL,
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalAmount` decimal(18,2) NOT NULL,
  `AppliedAmount` decimal(18,2) DEFAULT '0.00',
  `RemainingAmount` decimal(18,2) GENERATED ALWAYS AS ((`TotalAmount` - `AppliedAmount`)) STORED,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `JournalEntryID` int DEFAULT NULL,
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deliveryorders`
--

CREATE TABLE `deliveryorders` (
  `DeliveryOrderID` int NOT NULL,
  `DeliveryOrderNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `OrderDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IssueNoteID` int NOT NULL,
  `CustomerID` int NOT NULL,
  `DeliveryAddress` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ZoneID` int DEFAULT NULL,
  `DeliveryType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `VehicleID` int DEFAULT NULL,
  `ContractorID` int DEFAULT NULL,
  `DriverName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DriverPhone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ScheduledDate` date DEFAULT NULL,
  `ScheduledTime` time DEFAULT NULL,
  `ActualDeliveryDate` datetime DEFAULT NULL,
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `IsCostOnCustomer` tinyint(1) DEFAULT '0',
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `ReceiverName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReceiverPhone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReceiverSignature` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PODAttachmentPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deliveryorders`
--

INSERT INTO `deliveryorders` (`DeliveryOrderID`, `DeliveryOrderNumber`, `OrderDate`, `IssueNoteID`, `CustomerID`, `DeliveryAddress`, `ZoneID`, `DeliveryType`, `VehicleID`, `ContractorID`, `DriverName`, `DriverPhone`, `ScheduledDate`, `ScheduledTime`, `ActualDeliveryDate`, `DeliveryCost`, `IsCostOnCustomer`, `Status`, `ReceiverName`, `ReceiverPhone`, `ReceiverSignature`, `PODAttachmentPath`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalStatus`) VALUES
(1, 'DO-1771177257590', '2026-02-15 17:40:58', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Pending', NULL, NULL, NULL, NULL, NULL, '2026-02-15 17:40:58', 1, '2026-02-15 17:40:58', 1, 'Pending'),
(2, 'DO-1771527894696', '2026-02-19 19:04:55', 4, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Pending', NULL, NULL, NULL, NULL, NULL, '2026-02-19 19:04:55', 1, '2026-02-19 19:04:55', 1, 'Pending'),
(3, 'DO-1771623485167', '2026-02-20 21:38:05', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'Pending', NULL, NULL, NULL, NULL, NULL, '2026-02-20 21:38:05', 1, '2026-02-20 21:38:05', 1, 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `deliveryzones`
--

CREATE TABLE `deliveryzones` (
  `ZoneID` int NOT NULL,
  `ZoneCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ZoneName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Cities` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `EstimatedDays` int DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `DepartmentID` int NOT NULL,
  `DepartmentCode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DepartmentNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DepartmentNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ParentDepartmentID` int DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`DepartmentID`, `DepartmentCode`, `DepartmentNameAr`, `DepartmentNameEn`, `ParentDepartmentID`, `IsActive`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`) VALUES
(1, 'GM', 'الإدارة العامة', 'General Management', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL),
(2, 'FIN', 'الإدارة المالية', 'Finance Department', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL),
(3, 'ACC', 'المحاسبة', 'Accounting', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL),
(4, 'SALES', 'المبيعات', 'Sales', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL),
(5, 'PURCH', 'المشتريات', 'Procurement', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL),
(6, 'WH', 'المخازن', 'Warehousing', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL),
(7, 'QC', 'مراقبة الجودة', 'Quality Control', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL),
(8, 'HR', 'الموارد البشرية', 'Human Resources', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL),
(9, 'IT', 'تقنية المعلومات', 'Information Technology', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL),
(10, 'TRANS', 'النقل والتوصيل', 'Transportation', NULL, 1, '2026-01-12 23:13:08', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `documentcycletracking`
--

CREATE TABLE `documentcycletracking` (
  `TrackingID` int NOT NULL,
  `CycleType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CycleStartDocumentType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CycleStartDocumentID` int DEFAULT NULL,
  `CycleStartDocumentNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CycleEndDocumentType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CycleEndDocumentID` int DEFAULT NULL,
  `CycleEndDocumentNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CycleStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `TotalDaysToComplete` int DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documentrelationships`
--

CREATE TABLE `documentrelationships` (
  `RelationshipID` int NOT NULL,
  `ParentDocumentType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ParentDocumentID` int NOT NULL,
  `ParentDocumentNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ChildDocumentType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ChildDocumentID` int NOT NULL,
  `ChildDocumentNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `RelationshipType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documentsequences`
--

CREATE TABLE `documentsequences` (
  `SequenceID` int NOT NULL,
  `DocumentTypeID` int NOT NULL,
  `FiscalYearID` int DEFAULT NULL,
  `WarehouseID` int DEFAULT NULL,
  `DepartmentID` int DEFAULT NULL,
  `Prefix` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Suffix` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CurrentNumber` int DEFAULT '0',
  `NumberFormat` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LastGeneratedDate` datetime DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documenttypes`
--

CREATE TABLE `documenttypes` (
  `DocumentTypeID` int NOT NULL,
  `DocumentTypeCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DocumentTypeNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DocumentTypeNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ModuleName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CycleType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SequencePrefix` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CurrentSequence` int DEFAULT '0',
  `ResetSequenceYearly` tinyint(1) DEFAULT '1',
  `RequiresApproval` tinyint(1) DEFAULT '0',
  `WorkflowID` int DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documenttypes`
--

INSERT INTO `documenttypes` (`DocumentTypeID`, `DocumentTypeCode`, `DocumentTypeNameAr`, `DocumentTypeNameEn`, `ModuleName`, `CycleType`, `SequencePrefix`, `CurrentSequence`, `ResetSequenceYearly`, `RequiresApproval`, `WorkflowID`, `IsActive`, `CreatedAt`) VALUES
(1, 'PR', 'طلب شراء داخلي', 'Purchase Requisition', 'Purchase', 'PurchaseCycle', 'PR', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(2, 'RFQ', 'طلب عرض سعر', 'Request for Quotation', 'Purchase', 'PurchaseCycle', 'RFQ', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(3, 'SQ', 'عرض سعر المورد', 'Supplier Quotation', 'Purchase', 'PurchaseCycle', 'SQ', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(4, 'PO', 'أمر شراء', 'Purchase Order', 'Purchase', 'PurchaseCycle', 'PO', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(5, 'GRN', 'إذن استلام', 'Goods Receipt Note', 'Purchase', 'PurchaseCycle', 'GRN', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(6, 'SINV', 'فاتورة مورد', 'Supplier Invoice', 'Purchase', 'PurchaseCycle', 'SINV', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(7, 'SQT', 'عرض سعر للعميل', 'Sales Quotation', 'Sales', 'SalesCycle', 'SQT', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(8, 'SO', 'أمر بيع', 'Sales Order', 'Sales', 'SalesCycle', 'SO', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(9, 'SIN', 'إذن صرف', 'Stock Issue Note', 'Sales', 'SalesCycle', 'SIN', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(10, 'INV', 'فاتورة مبيعات', 'Sales Invoice', 'Sales', 'SalesCycle', 'INV', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(11, 'RV', 'سند قبض', 'Receipt Voucher', 'Finance', 'FinanceCycle', 'RV', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(12, 'PV', 'سند صرف', 'Payment Voucher', 'Finance', 'FinanceCycle', 'PV', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(13, 'JE', 'قيد يومية', 'Journal Entry', 'Finance', 'FinanceCycle', 'JE', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(14, 'ST', 'تحويل مخزني', 'Stock Transfer', 'Inventory', 'InventoryCycle', 'ST', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08'),
(15, 'ADJ', 'تسوية مخزون', 'Stock Adjustment', 'Inventory', 'InventoryCycle', 'ADJ', 0, 1, 0, NULL, 1, '2026-01-12 23:13:08');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `EmployeeID` int NOT NULL,
  `EmployeeCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `FirstNameAr` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `LastNameAr` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `FirstNameEn` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LastNameEn` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NationalID` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DepartmentID` int NOT NULL,
  `JobTitle` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ManagerID` int DEFAULT NULL,
  `HireDate` date NOT NULL,
  `TerminationDate` date DEFAULT NULL,
  `BasicSalary` decimal(38,2) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`EmployeeID`, `EmployeeCode`, `FirstNameAr`, `LastNameAr`, `FirstNameEn`, `LastNameEn`, `NationalID`, `Email`, `Phone`, `Mobile`, `Address`, `DepartmentID`, `JobTitle`, `ManagerID`, `HireDate`, `TerminationDate`, `BasicSalary`, `IsActive`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`) VALUES
(103, 'EMP103', 'شادي', 'الاخرس', 'Shady', 'Mohamed', NULL, 'shady@gmail.com', '', NULL, NULL, 1, 's', NULL, '2026-01-15', NULL, 8700.00, 1, '2026-01-15 23:15:02', NULL, '2026-02-11 13:19:06', 1),
(104, '278', 'سامي', 'ل', 'j', 'h', NULL, 'shady1999emad@gmail.com', '0591234567', '0591234576', '', 1, '', NULL, '2026-01-15', NULL, 2555.00, 1, '2026-01-15 21:33:27', NULL, '2026-02-15 12:36:00', 1),
(105, 'MOH-307', 'محمد ', 'أبو شملة ', 'Mohammed', 'Abu Shamleh', NULL, 'mohammed@gmail.com', '0597746349', '059744349', '', 5, 'مدير المخازن ', NULL, '2026-02-03', NULL, 45000.00, 1, '2026-02-03 18:30:53', 1, '2026-02-11 09:39:32', 1),
(106, 'PM-EM', 'يزن ', 'أبو حطب ', 'yazan', 'abu Hatab', NULL, 'yazan@gmail.com', '0597746345', '0597746342', '', 5, 'مدير المشتريات ', NULL, '2026-02-11', NULL, 25600.00, 1, '2026-02-11 09:18:23', 1, '2026-02-11 09:18:23', 1);

-- --------------------------------------------------------

--
-- Table structure for table `employeesalarystructure`
--

CREATE TABLE `employeesalarystructure` (
  `StructureID` int NOT NULL,
  `EmployeeID` int NOT NULL,
  `ComponentID` int NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `EffectiveFrom` date NOT NULL,
  `EffectiveTo` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employeeshifts`
--

CREATE TABLE `employeeshifts` (
  `EmployeeShiftID` int NOT NULL,
  `CreatedAt` datetime(6) DEFAULT NULL,
  `EffectiveFrom` date NOT NULL,
  `EffectiveTo` date DEFAULT NULL,
  `IsActive` bit(1) NOT NULL,
  `EmployeeID` int NOT NULL,
  `ShiftID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchangerates`
--

CREATE TABLE `exchangerates` (
  `ExchangeRateID` int NOT NULL,
  `FromCurrency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ToCurrency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RateDate` date NOT NULL,
  `BuyRate` decimal(18,6) NOT NULL,
  `SellRate` decimal(18,6) NOT NULL,
  `AverageRate` decimal(18,6) NOT NULL,
  `Source` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fiscalperiods`
--

CREATE TABLE `fiscalperiods` (
  `PeriodID` int NOT NULL,
  `FiscalYearID` int NOT NULL,
  `PeriodNumber` int NOT NULL,
  `PeriodName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `IsClosed` tinyint(1) DEFAULT '0',
  `ClosedByUserID` int DEFAULT NULL,
  `ClosedDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fiscalyears`
--

CREATE TABLE `fiscalyears` (
  `FiscalYearID` int NOT NULL,
  `YearCode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `YearName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `IsClosed` tinyint(1) DEFAULT '0',
  `ClosedByUserID` int DEFAULT NULL,
  `ClosedDate` datetime DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goodsreceiptnotes`
--

CREATE TABLE `goodsreceiptnotes` (
  `GRNID` int NOT NULL,
  `GRNNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `GRNDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `POID` int NOT NULL,
  `SupplierID` int NOT NULL,
  `WarehouseID` int NOT NULL,
  `DeliveryNoteNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SupplierInvoiceNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReceivedByUserID` int NOT NULL,
  `InspectedByUserID` int DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `QualityStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TotalReceivedQty` decimal(18,3) DEFAULT NULL,
  `TotalAcceptedQty` decimal(18,3) DEFAULT NULL,
  `TotalRejectedQty` decimal(18,3) DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `OtherCosts` decimal(18,2) DEFAULT NULL,
  `ShippingCost` decimal(18,2) DEFAULT NULL,
  `TotalAmount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `goodsreceiptnotes`
--

INSERT INTO `goodsreceiptnotes` (`GRNID`, `GRNNumber`, `GRNDate`, `POID`, `SupplierID`, `WarehouseID`, `DeliveryNoteNo`, `SupplierInvoiceNo`, `ReceivedByUserID`, `InspectedByUserID`, `Status`, `QualityStatus`, `TotalReceivedQty`, `TotalAcceptedQty`, `TotalRejectedQty`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalStatus`, `OtherCosts`, `ShippingCost`, `TotalAmount`) VALUES
(7, '#GRN-1', '2026-02-15 10:37:48', 15, 2, 3, NULL, NULL, 1, NULL, 'Billed', 'Passed', 1.000, 1.000, 0.000, 'تم إنشاء تلقائياً عند وصول الشحنة من أمر الشراء: PO-1', '2026-02-15 10:37:48', 1, '2026-02-15 10:38:17', 1, 'Approved', 1000.00, 2000.00, 8529.00),
(8, '#GRN-2', '2026-02-15 17:39:12', 16, 2, 3, NULL, NULL, 1, NULL, 'Billed', 'Passed', 80.000, 80.000, 0.000, 'تم إنشاء تلقائياً عند وصول الشحنة من أمر الشراء: PO-2', '2026-02-15 17:39:12', 1, '2026-02-15 17:39:36', 1, 'Approved', 500.00, 5000.00, 415900.00),
(9, '#GRN-3', '2026-02-16 11:29:11', 17, 3, 3, NULL, NULL, 1, NULL, 'Returned', 'Failed', 5.000, 3.000, 2.000, 'تم إنشاء تلقائياً عند وصول الشحنة من أمر الشراء: PO-3', '2026-02-16 11:29:11', 1, '2026-02-16 11:30:38', 1, 'Approved', 1000.00, 2000.00, 35490.00),
(10, '#GRN-4', '2026-02-16 18:49:55', 18, 4, 3, NULL, NULL, 1, NULL, 'Billed', 'Passed', 5.000, 5.000, 0.000, 'تم إنشاء تلقائياً عند وصول الشحنة من أمر الشراء: PO-4', '2026-02-16 18:49:55', 1, '2026-02-16 18:50:18', 1, 'Approved', 0.00, 5000.00, 26945.00),
(11, '#GRN-5', '2026-02-17 18:46:58', 19, 2, 3, NULL, NULL, 1, NULL, 'Returned', 'Failed', 100.000, 50.000, 50.000, 'تم إنشاء تلقائياً عند وصول الشحنة من أمر الشراء: PO-5', '2026-02-17 18:46:58', 1, '2026-02-17 19:37:27', 1, 'Approved', 2200.00, 12000.00, 282100.00),
(12, '#GRN-6', '2026-02-21 08:48:12', 20, 2, 3, NULL, NULL, 1, NULL, 'Billed', 'Passed', 5.000, 5.000, 0.000, 'تم إنشاء تلقائياً عند وصول الشحنة من أمر الشراء: PO-6', '2026-02-21 08:48:12', 1, '2026-02-21 08:48:40', 1, 'Approved', 400.00, 500.00, 36468.00),
(13, '#GRN-7', '2026-02-21 09:12:01', 21, 2, 3, NULL, NULL, 1, NULL, 'Billed', 'Passed', 500.000, 500.000, 0.000, 'تم إنشاء تلقائياً عند وصول الشحنة من أمر الشراء: PO-7', '2026-02-21 09:12:01', 1, '2026-02-21 09:12:20', 1, 'Approved', 16000.00, 20000.00, 3000000.00);

-- --------------------------------------------------------

--
-- Table structure for table `grnitems`
--

CREATE TABLE `grnitems` (
  `GRNItemID` int NOT NULL,
  `GRNID` int NOT NULL,
  `POItemID` int NOT NULL,
  `ItemID` int NOT NULL,
  `OrderedQty` decimal(18,3) NOT NULL,
  `ReceivedQty` decimal(18,3) NOT NULL,
  `AcceptedQty` decimal(18,3) DEFAULT NULL,
  `RejectedQty` decimal(18,3) DEFAULT '0.000',
  `DamagedQty` decimal(18,3) DEFAULT '0.000',
  `UnitID` int NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `TotalCost` decimal(18,2) DEFAULT NULL,
  `LotNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ManufactureDate` date DEFAULT NULL,
  `ExpiryDate` date DEFAULT NULL,
  `LocationID` int DEFAULT NULL,
  `QualityStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `QualityReportID` int DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grnitems`
--

INSERT INTO `grnitems` (`GRNItemID`, `GRNID`, `POItemID`, `ItemID`, `OrderedQty`, `ReceivedQty`, `AcceptedQty`, `RejectedQty`, `DamagedQty`, `UnitID`, `UnitCost`, `TotalCost`, `LotNumber`, `ManufactureDate`, `ExpiryDate`, `LocationID`, `QualityStatus`, `QualityReportID`, `Notes`) VALUES
(52, 7, 64, 1, 1.000, 1.000, 1.000, 0.000, 0.000, 14, 5000.0000, 5529.00, NULL, NULL, NULL, NULL, 'Passed', NULL, NULL),
(53, 8, 65, 1, 80.000, 80.000, 80.000, 0.000, 0.000, 14, 5000.0000, 410400.00, NULL, NULL, NULL, NULL, 'Passed', NULL, NULL),
(54, 9, 66, 1, 5.000, 5.000, 3.000, 2.000, 0.000, 14, 10000.0000, 32490.00, NULL, NULL, NULL, NULL, 'Failed', NULL, NULL),
(55, 10, 67, 1, 5.000, 5.000, 5.000, 0.000, 0.000, 14, 7000.0000, 21945.00, NULL, NULL, NULL, NULL, 'Passed', NULL, NULL),
(56, 11, 68, 1, 100.000, 100.000, 50.000, 50.000, 0.000, 14, 5000.0000, 267900.00, NULL, NULL, NULL, NULL, 'Failed', NULL, NULL),
(57, 12, 69, 2, 5.000, 5.000, 5.000, 0.000, 0.000, 11, 6500.0000, 35568.00, NULL, NULL, NULL, NULL, 'Passed', NULL, NULL),
(58, 13, 70, 2, 500.000, 500.000, 500.000, 0.000, 0.000, 11, 6500.0000, 2964000.00, NULL, NULL, NULL, NULL, 'Passed', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `HolidayID` int NOT NULL,
  `CreatedAt` datetime(6) DEFAULT NULL,
  `HolidayDate` date NOT NULL,
  `HolidayNameAr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `HolidayNameEn` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsActive` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventorybatches`
--

CREATE TABLE `inventorybatches` (
  `BatchID` int NOT NULL,
  `BatchNumber` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ItemID` int NOT NULL,
  `GRNItemID` int DEFAULT NULL,
  `WarehouseID` int NOT NULL,
  `LocationID` int DEFAULT NULL,
  `UnitID` int NOT NULL,
  `ManufactureDate` date DEFAULT NULL,
  `ExpiryDate` date DEFAULT NULL,
  `QuantityReceived` decimal(18,3) NOT NULL DEFAULT '0.000',
  `QuantityAvailable` decimal(18,3) NOT NULL DEFAULT '0.000',
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `TotalCost` decimal(18,2) DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `itemcategories`
--

CREATE TABLE `itemcategories` (
  `CategoryID` int NOT NULL,
  `CategoryCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CategoryNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CategoryNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ParentCategoryID` int DEFAULT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `itemcategories`
--

INSERT INTO `itemcategories` (`CategoryID`, `CategoryCode`, `CategoryNameAr`, `CategoryNameEn`, `ParentCategoryID`, `Description`, `IsActive`, `CreatedAt`) VALUES
(1, 'TEST-1012', 'TEST-1012', 'TEST-1012', NULL, 'TEST-1012', 1, '2026-02-14 12:25:47');

-- --------------------------------------------------------

--
-- Table structure for table `itemqualityspecs`
--

CREATE TABLE `itemqualityspecs` (
  `SpecID` int NOT NULL,
  `ItemID` int NOT NULL,
  `ParameterID` int NOT NULL,
  `MinValue` decimal(38,2) DEFAULT NULL,
  `MaxValue` decimal(38,2) DEFAULT NULL,
  `TargetValue` decimal(38,2) DEFAULT NULL,
  `IsCritical` tinyint(1) DEFAULT '0',
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `ItemID` int NOT NULL,
  `ItemCode` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ItemNameAr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ItemNameEn` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `grade` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'العلامة التجارية / Grade - يمكن أن يتكرر بين أصناف مختلفة',
  `GradeName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MI2` decimal(38,2) DEFAULT NULL,
  `MI21` decimal(38,2) DEFAULT NULL,
  `Density` decimal(38,2) DEFAULT NULL,
  `CategoryID` int NOT NULL,
  `UnitID` int NOT NULL,
  `Barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TechnicalSpecs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `MinStockLevel` decimal(38,2) DEFAULT NULL,
  `MaxStockLevel` decimal(38,2) DEFAULT NULL,
  `ReorderLevel` decimal(38,2) DEFAULT NULL,
  `AvgMonthlyConsumption` decimal(38,2) DEFAULT NULL,
  `StandardCost` decimal(38,2) DEFAULT NULL,
  `LastPurchasePrice` decimal(38,2) DEFAULT NULL,
  `ReplacementPrice` decimal(38,2) DEFAULT NULL,
  `LastSalePrice` decimal(38,2) DEFAULT NULL,
  `DefaultVATRate` decimal(38,2) DEFAULT NULL,
  `ImagePath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `IsSellable` tinyint(1) DEFAULT '1',
  `IsPurchasable` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`ItemID`, `ItemCode`, `ItemNameAr`, `ItemNameEn`, `grade`, `GradeName`, `MI2`, `MI21`, `Density`, `CategoryID`, `UnitID`, `Barcode`, `Description`, `TechnicalSpecs`, `MinStockLevel`, `MaxStockLevel`, `ReorderLevel`, `AvgMonthlyConsumption`, `StandardCost`, `LastPurchasePrice`, `ReplacementPrice`, `LastSalePrice`, `DefaultVATRate`, `ImagePath`, `IsActive`, `IsSellable`, `IsPurchasable`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`) VALUES
(1, 'ITEM-00001', 'TEST-1012', 'TEST-1012', 'TEST-1012', NULL, 4.00, 3.00, 4.00, 1, 14, '', 'TEST-1012', 'TEST-1012', 500.00, 1200.00, 500.00, 1000.00, 50.00, 40.00, 48.00, 62.00, 14.00, NULL, 1, 1, 1, '2026-02-14 12:30:30', NULL, NULL, NULL),
(2, 'ITEM-00002', 'صنف 2', '', 'HP0243K', '', 0.00, 0.00, 0.00, 1, 11, '', '', '', 6.00, 1000.00, 10.00, 300.00, 1000.00, 1200.00, 1400.00, 1300.00, 14.00, NULL, 1, 1, 1, '2026-02-20 12:27:56', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `journalentries`
--

CREATE TABLE `journalentries` (
  `JournalEntryID` int NOT NULL,
  `EntryNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `EntryDate` date NOT NULL,
  `FiscalYearID` int NOT NULL,
  `PeriodID` int NOT NULL,
  `EntryType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SourceType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SourceID` int DEFAULT NULL,
  `SourceNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TotalDebit` decimal(18,2) NOT NULL,
  `TotalCredit` decimal(18,2) NOT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `PostedByUserID` int DEFAULT NULL,
  `PostedDate` datetime DEFAULT NULL,
  `ReversedByEntryID` int DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journalentrylines`
--

CREATE TABLE `journalentrylines` (
  `LineID` int NOT NULL,
  `JournalEntryID` int NOT NULL,
  `LineNumber` int NOT NULL,
  `AccountID` int NOT NULL,
  `CostCenterID` int DEFAULT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DebitAmount` decimal(18,2) DEFAULT '0.00',
  `CreditAmount` decimal(18,2) DEFAULT '0.00',
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `DebitAmountLocal` decimal(18,2) DEFAULT '0.00',
  `CreditAmountLocal` decimal(18,2) DEFAULT '0.00',
  `ReferenceType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceID` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leaverequests`
--

CREATE TABLE `leaverequests` (
  `LeaveRequestID` int NOT NULL,
  `EmployeeID` int NOT NULL,
  `LeaveType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `TotalDays` int NOT NULL,
  `Reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leavetypes`
--

CREATE TABLE `leavetypes` (
  `LeaveTypeCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CreatedAt` datetime(6) DEFAULT NULL,
  `IsActive` bit(1) NOT NULL,
  `IsPaid` bit(1) NOT NULL,
  `LeaveTypeNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `LeaveTypeNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MaxDaysPerYear` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `NotificationID` int NOT NULL,
  `NotificationType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Message` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Priority` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Normal',
  `RecipientUserID` int NOT NULL,
  `SenderUserID` int DEFAULT NULL,
  `ReferenceType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceID` int DEFAULT NULL,
  `ReferenceNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ActionURL` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  `ReadDate` datetime DEFAULT NULL,
  `IsDismissed` tinyint(1) DEFAULT '0',
  `DismissedDate` datetime DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `ExpiryDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `numberseries`
--

CREATE TABLE `numberseries` (
  `SeriesID` int NOT NULL,
  `SeriesCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SeriesName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `DocumentType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Prefix` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Suffix` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `StartNumber` int DEFAULT '1',
  `EndNumber` int DEFAULT NULL,
  `CurrentNumber` int DEFAULT '0',
  `NumberLength` int DEFAULT '6',
  `IncludeYear` tinyint(1) DEFAULT '1',
  `YearFormat` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'YY',
  `IncludeMonth` tinyint(1) DEFAULT '0',
  `ResetOnNewYear` tinyint(1) DEFAULT '1',
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paymentvoucherallocations`
--

CREATE TABLE `paymentvoucherallocations` (
  `AllocationID` int NOT NULL,
  `PaymentVoucherID` int NOT NULL,
  `SupplierInvoiceID` int NOT NULL,
  `AllocatedAmount` decimal(18,2) NOT NULL,
  `AllocationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paymentvouchers`
--

CREATE TABLE `paymentvouchers` (
  `PaymentVoucherID` int NOT NULL,
  `VoucherNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `VoucherDate` date NOT NULL,
  `SupplierID` int DEFAULT NULL,
  `PayeeName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaymentMethod` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CashRegisterID` int DEFAULT NULL,
  `BankAccountID` int DEFAULT NULL,
  `ChequeID` int DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `Amount` decimal(18,2) NOT NULL,
  `AmountInWords` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceID` int DEFAULT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `JournalEntryID` int DEFAULT NULL,
  `Level1ApprovedBy` int DEFAULT NULL,
  `Level1ApprovedDate` datetime DEFAULT NULL,
  `Level2ApprovedBy` int DEFAULT NULL,
  `Level2ApprovedDate` datetime DEFAULT NULL,
  `Level3ApprovedBy` int DEFAULT NULL,
  `Level3ApprovedDate` datetime DEFAULT NULL,
  `PreparedByUserID` int NOT NULL,
  `PostedByUserID` int DEFAULT NULL,
  `PostedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `AccountNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ApprovedByFinanceManager` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ApprovedByGeneralManager` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BankName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CheckNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FinanceManagerApprovalDate` date DEFAULT NULL,
  `GeneralManagerApprovalDate` date DEFAULT NULL,
  `PaidBy` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaidDate` date DEFAULT NULL,
  `PaymentAmount` decimal(18,2) NOT NULL,
  `PaymentReference` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SupplierInvoiceID` int NOT NULL,
  `BankAmount` decimal(18,2) DEFAULT NULL,
  `BankTransferAmount` decimal(18,2) DEFAULT NULL,
  `CashAmount` decimal(18,2) DEFAULT NULL,
  `ChequeAmount` decimal(18,2) DEFAULT NULL,
  `IsSplitPayment` bit(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `paymentvouchers`
--

INSERT INTO `paymentvouchers` (`PaymentVoucherID`, `VoucherNumber`, `VoucherDate`, `SupplierID`, `PayeeName`, `PaymentMethod`, `CashRegisterID`, `BankAccountID`, `ChequeID`, `Currency`, `ExchangeRate`, `Amount`, `AmountInWords`, `ReferenceType`, `ReferenceID`, `Description`, `Status`, `JournalEntryID`, `Level1ApprovedBy`, `Level1ApprovedDate`, `Level2ApprovedBy`, `Level2ApprovedDate`, `Level3ApprovedBy`, `Level3ApprovedDate`, `PreparedByUserID`, `PostedByUserID`, `PostedDate`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `AccountNumber`, `ApprovalStatus`, `ApprovedByFinanceManager`, `ApprovedByGeneralManager`, `BankName`, `CheckNumber`, `FinanceManagerApprovalDate`, `GeneralManagerApprovalDate`, `PaidBy`, `PaidDate`, `PaymentAmount`, `PaymentReference`, `SupplierInvoiceID`, `BankAmount`, `BankTransferAmount`, `CashAmount`, `ChequeAmount`, `IsSplitPayment`) VALUES
(1, 'PV-1', '2026-02-15', 2, NULL, 'cash', NULL, NULL, NULL, 'EGP', 1.000000, 8529.00, NULL, NULL, NULL, NULL, 'Paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '', '2026-02-15 17:32:49', 1, '2026-02-15 17:34:55.321705', 1, NULL, 'Approved', 'shady', 'shady', NULL, NULL, '2026-02-15', '2026-02-15', 'shady', '2026-02-15', 8529.00, NULL, 7, 0.00, 0.00, 8529.00, 0.00, b'0'),
(2, 'PV-2', '2026-02-15', 2, NULL, 'cash', NULL, NULL, NULL, 'EGP', 1.000000, 415900.00, NULL, NULL, NULL, NULL, 'Paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '', '2026-02-15 18:54:36', 1, '2026-02-15 18:56:08.451860', 1, NULL, 'Approved', 'shady', 'shady', NULL, NULL, '2026-02-15', '2026-02-15', 'shady', '2026-02-15', 415900.00, NULL, 8, 0.00, 0.00, 415900.00, 0.00, b'0'),
(3, 'PV-3', '2026-02-18', 2, NULL, 'cash', NULL, NULL, NULL, 'EGP', 1.000000, 282100.00, NULL, NULL, NULL, NULL, 'Paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '', '2026-02-18 14:44:55', 1, '2026-02-18 14:45:42.056024', 1, NULL, 'Approved', 'shady', 'shady', NULL, NULL, '2026-02-18', '2026-02-18', 'shady', '2026-02-18', 282100.00, NULL, 11, 0.00, 0.00, 282100.00, 0.00, b'0'),
(4, 'PV-4', '2026-02-21', 2, NULL, 'cash', NULL, NULL, NULL, 'EGP', 1.000000, 36468.00, NULL, NULL, NULL, NULL, 'Paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '', '2026-02-21 08:49:38', 1, '2026-02-21 08:50:00.782063', 1, NULL, 'Approved', 'shady', 'shady', NULL, NULL, '2026-02-21', '2026-02-21', 'shady', '2026-02-21', 36468.00, NULL, 12, 0.00, 0.00, 36468.00, 0.00, b'0'),
(5, 'PV-5', '2026-02-21', 4, NULL, 'cash', NULL, NULL, NULL, 'EGP', 1.000000, 0.00, NULL, NULL, NULL, NULL, 'Paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '', '2026-02-21 10:56:19', 1, '2026-02-21 10:56:39.507001', 1, NULL, 'Approved', 'shady', 'shady', NULL, NULL, '2026-02-21', '2026-02-21', 'shady', '2026-02-21', 0.00, NULL, 10, 0.00, 0.00, 0.00, 0.00, b'1'),
(6, 'PV-6', '2026-02-21', 4, NULL, 'cash', NULL, NULL, NULL, 'EGP', 1.000000, 26945.00, NULL, NULL, NULL, NULL, 'Paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, '', '2026-02-21 11:10:03', 1, '2026-02-21 11:10:28.183635', 1, NULL, 'Approved', 'shady', 'shady', NULL, NULL, '2026-02-21', '2026-02-21', 'shady', '2026-02-21', 26945.00, NULL, 10, 0.00, 0.00, 26945.00, 0.00, b'0');

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `PayrollID` int NOT NULL,
  `PayrollMonth` int NOT NULL,
  `PayrollYear` int NOT NULL,
  `EmployeeID` int NOT NULL,
  `BasicSalary` decimal(38,2) DEFAULT NULL,
  `TotalEarnings` decimal(38,2) DEFAULT NULL,
  `TotalDeductions` decimal(38,2) DEFAULT NULL,
  `NetSalary` decimal(38,2) DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `PaymentDate` date DEFAULT NULL,
  `PaymentMethod` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BankAccountID` int DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payrolldetails`
--

CREATE TABLE `payrolldetails` (
  `PayrollDetailID` int NOT NULL,
  `PayrollID` int NOT NULL,
  `ComponentID` int NOT NULL,
  `Amount` decimal(38,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `PermissionID` int NOT NULL,
  `PermissionCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `PermissionNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `PermissionNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ModuleName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ActionType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`PermissionID`, `PermissionCode`, `PermissionNameAr`, `PermissionNameEn`, `ModuleName`, `ActionType`, `Description`, `IsActive`) VALUES
(1, 'SALES_VIEW', 'عرض المبيعات', 'View Sales', 'Sales', 'View', NULL, 1),
(2, 'SALES_CREATE', 'إنشاء أمر بيع', 'Create Sales Order', 'Sales', 'Create', NULL, 1),
(3, 'SALES_EDIT', 'تعديل أمر بيع', 'Edit Sales Order', 'Sales', 'Edit', NULL, 1),
(4, 'SALES_DELETE', 'حذف أمر بيع', 'Delete Sales Order', 'Sales', 'Delete', NULL, 1),
(5, 'SALES_APPROVE', 'اعتماد أمر بيع', 'Approve Sales Order', 'Sales', 'Approve', NULL, 1),
(6, 'SALES_INVOICE', 'إصدار فاتورة', 'Issue Invoice', 'Sales', 'Create', NULL, 1),
(7, 'DISCOUNT_APPROVE', 'اعتماد الخصم', 'Approve Discount', 'Sales', 'Approve', NULL, 1),
(8, 'PURCHASE_VIEW', 'عرض المشتريات', 'View Purchases', 'Purchase', 'View', NULL, 1),
(9, 'PURCHASE_CREATE', 'إنشاء أمر شراء', 'Create Purchase Order', 'Purchase', 'Create', NULL, 1),
(10, 'PURCHASE_EDIT', 'تعديل أمر شراء', 'Edit Purchase Order', 'Purchase', 'Edit', NULL, 1),
(11, 'PURCHASE_APPROVE', 'اعتماد أمر شراء', 'Approve Purchase Order', 'Purchase', 'Approve', NULL, 1),
(12, 'GRN_CREATE', 'إنشاء إذن استلام', 'Create GRN', 'Purchase', 'Create', NULL, 1),
(13, 'INVENTORY_VIEW', 'عرض المخزون', 'View Inventory', 'Inventory', 'View', NULL, 1),
(14, 'INVENTORY_ISSUE', 'صرف من المخزن', 'Issue Stock', 'Inventory', 'Create', NULL, 1),
(15, 'INVENTORY_RECEIVE', 'استلام للمخزن', 'Receive Stock', 'Inventory', 'Create', NULL, 1),
(16, 'INVENTORY_ADJUST', 'تسوية المخزون', 'Adjust Stock', 'Inventory', 'Edit', NULL, 1),
(17, 'INVENTORY_TRANSFER', 'تحويل بين المخازن', 'Transfer Stock', 'Inventory', 'Create', NULL, 1),
(18, 'FINANCE_VIEW', 'عرض المالية', 'View Finance', 'Finance', 'View', NULL, 1),
(19, 'RECEIPT_CREATE', 'إنشاء سند قبض', 'Create Receipt', 'Finance', 'Create', NULL, 1),
(20, 'PAYMENT_CREATE', 'إنشاء سند صرف', 'Create Payment', 'Finance', 'Create', NULL, 1),
(21, 'PAYMENT_APPROVE', 'اعتماد سند صرف', 'Approve Payment', 'Finance', 'Approve', NULL, 1),
(22, 'CHEQUE_ISSUE', 'إصدار شيك', 'Issue Cheque', 'Finance', 'Create', NULL, 1),
(23, 'JE_CREATE', 'إنشاء قيد يومية', 'Create Journal Entry', 'Finance', 'Create', NULL, 1),
(24, 'JE_POST', 'ترحيل القيود', 'Post Journal Entry', 'Finance', 'Approve', NULL, 1),
(25, 'SECTION_MAIN', 'الرئيسية والاعتمادات', 'Main & Approvals', 'MENU', NULL, NULL, 1),
(26, 'SECTION_USERS', 'المستخدمين', 'Users', 'MENU', NULL, NULL, 1),
(27, 'SECTION_EMPLOYEES', 'الموظفين', 'Employees', 'MENU', NULL, NULL, 1),
(28, 'SECTION_WAREHOUSE', 'المخازن', 'Warehouse', 'MENU', NULL, NULL, 1),
(29, 'SECTION_OPERATIONS', 'العمليات', 'Operations', 'MENU', NULL, NULL, 1),
(30, 'SECTION_SALES', 'المبيعات', 'Sales', 'MENU', NULL, NULL, 1),
(31, 'SECTION_CRM', 'العملاء (CRM)', 'CRM', 'MENU', NULL, NULL, 1),
(32, 'SECTION_PROCUREMENT', 'المشتريات', 'Procurement', 'MENU', NULL, NULL, 1),
(33, 'SECTION_SYSTEM', 'إعدادات النظام', 'System Settings', 'MENU', NULL, NULL, 1),
(34, 'SECTION_FINANCE', 'المالية', 'Finance', 'MENU', NULL, NULL, 1),
(35, 'ACCOUNTING_VIEW', 'عرض القيود المحاسبية', 'View Journal Entries', 'ACCOUNTING', NULL, NULL, 1),
(36, 'ACCOUNTING_CREATE', 'إنشاء قيد محاسبي', 'Create Journal Entry', 'ACCOUNTING', NULL, NULL, 1),
(37, 'ACCOUNTING_UPDATE', 'تعديل قيد محاسبي', 'Update Journal Entry', 'ACCOUNTING', NULL, NULL, 1),
(38, 'ACCOUNTING_DELETE', 'حذف قيد محاسبي', 'Delete Journal Entry', 'ACCOUNTING', NULL, NULL, 1),
(39, 'ACCOUNTING_POST', 'ترحيل قيد محاسبي', 'Post Journal Entry', 'ACCOUNTING', NULL, NULL, 1),
(40, 'SUPPLIER_INVOICE_CREATE', 'إنشاء فاتورة مورد', 'Create Supplier Invoice', 'SUPPLIER_INVOICE', NULL, NULL, 1),
(41, 'SUPPLIER_INVOICE_VIEW', 'عرض فواتير الموردين', 'View Supplier Invoices', 'SUPPLIER_INVOICE', NULL, NULL, 1),
(42, 'SUPPLIER_INVOICE_REVIEW', 'مراجعة/مطابقة فاتورة', 'Review/Match Supplier Invoice', 'SUPPLIER_INVOICE', NULL, NULL, 1),
(43, 'SUPPLIER_INVOICE_APPROVE', 'اعتماد صرف فاتورة', 'Approve Supplier Invoice Payment', 'SUPPLIER_INVOICE', NULL, NULL, 1),
(44, 'SUPPLIER_INVOICE_PAY', 'دفع فاتورة (سند صرف)', 'Pay Supplier Invoice', 'SUPPLIER_INVOICE', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `pricelistitems`
--

CREATE TABLE `pricelistitems` (
  `PriceListItemID` int NOT NULL,
  `PriceListID` int NOT NULL,
  `ItemID` int NOT NULL,
  `UnitPrice` decimal(38,2) NOT NULL,
  `ExchangeRateID` int DEFAULT NULL,
  `MinQty` decimal(38,2) DEFAULT NULL,
  `MaxQty` decimal(38,2) DEFAULT NULL,
  `discountPercentage` decimal(38,2) DEFAULT NULL,
  `minQuantity` decimal(38,2) DEFAULT NULL,
  `price` decimal(38,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pricelistitems`
--

INSERT INTO `pricelistitems` (`PriceListItemID`, `PriceListID`, `ItemID`, `UnitPrice`, `ExchangeRateID`, `MinQty`, `MaxQty`, `discountPercentage`, `minQuantity`, `price`) VALUES
(1, 11, 1, 90.00, NULL, 1.00, NULL, NULL, NULL, 90.00),
(2, 11, 2, 1400.00, NULL, 1.00, NULL, NULL, NULL, 1400.00);

-- --------------------------------------------------------

--
-- Table structure for table `pricelists`
--

CREATE TABLE `pricelists` (
  `PriceListID` int NOT NULL,
  `PriceListCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `PriceListName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `EffectiveFrom` date NOT NULL,
  `EffectiveTo` date DEFAULT NULL,
  `IsDefault` tinyint(1) DEFAULT '0',
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `listNameAr` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `listNameEn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `listType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `validFrom` date DEFAULT NULL,
  `validTo` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pricelists`
--

INSERT INTO `pricelists` (`PriceListID`, `PriceListCode`, `PriceListName`, `Currency`, `EffectiveFrom`, `EffectiveTo`, `IsDefault`, `IsActive`, `CreatedAt`, `CreatedBy`, `created_at`, `listNameAr`, `listNameEn`, `listType`, `validFrom`, `validTo`) VALUES
(11, 'PL-1771173788814', 'قائمة بيع رئيسية', 'EGP', '2026-02-15', '2026-02-26', 0, 1, '2026-02-15 18:43:08', NULL, '2026-02-15 16:43:08.815646', 'قائمة بيع رئيسية', NULL, 'SELLING', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchaseorderitems`
--

CREATE TABLE `purchaseorderitems` (
  `POItemID` int NOT NULL,
  `POID` int NOT NULL,
  `ItemID` int NOT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `OrderedQty` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxPercentage` decimal(5,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalPrice` decimal(18,2) NOT NULL,
  `ReceivedQty` decimal(18,3) DEFAULT '0.000',
  `RemainingQty` decimal(38,2) DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PolymerGrade` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchaseorderitems`
--

INSERT INTO `purchaseorderitems` (`POItemID`, `POID`, `ItemID`, `Description`, `OrderedQty`, `UnitID`, `UnitPrice`, `DiscountPercentage`, `DiscountAmount`, `TaxPercentage`, `TaxAmount`, `TotalPrice`, `ReceivedQty`, `RemainingQty`, `Status`, `Notes`, `PolymerGrade`) VALUES
(64, 15, 1, NULL, 1.000, 14, 5000.0000, 3.00, NULL, 14.00, NULL, 5529.00, 1.000, NULL, 'Received', NULL, NULL),
(65, 16, 1, NULL, 80.000, 14, 5000.0000, 10.00, NULL, 14.00, NULL, 410400.00, 80.000, NULL, 'Received', NULL, NULL),
(66, 17, 1, NULL, 5.000, 14, 10000.0000, 5.00, NULL, 14.00, NULL, 54150.00, 5.000, NULL, 'Received', NULL, NULL),
(67, 18, 1, NULL, 5.000, 14, 7000.0000, 45.00, NULL, 14.00, NULL, 21945.00, 5.000, NULL, 'Received', NULL, NULL),
(68, 19, 1, NULL, 100.000, 14, 5000.0000, 6.00, NULL, 14.00, NULL, 535800.00, 100.000, NULL, 'Received', NULL, NULL),
(69, 20, 2, NULL, 5.000, 11, 6500.0000, 4.00, NULL, 14.00, NULL, 35568.00, 5.000, NULL, 'Received', NULL, NULL),
(70, 21, 2, NULL, 500.000, 11, 6500.0000, 20.00, NULL, 14.00, NULL, 2964000.00, 500.000, NULL, 'Received', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchaseorders`
--

CREATE TABLE `purchaseorders` (
  `POID` int NOT NULL,
  `PONumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `PODate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PRID` int DEFAULT NULL,
  `QuotationID` int DEFAULT NULL,
  `SupplierID` int NOT NULL,
  `ExpectedDeliveryDate` date DEFAULT NULL,
  `ShippingMethod` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ShippingTerms` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaymentTerms` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaymentTermDays` int DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `ShippingCost` decimal(18,2) DEFAULT '0.00',
  `OtherCosts` decimal(18,2) DEFAULT '0.00',
  `TotalAmount` decimal(18,2) NOT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `Level1ApprovedBy` int DEFAULT NULL,
  `Level1ApprovedDate` datetime DEFAULT NULL,
  `Level2ApprovedBy` int DEFAULT NULL,
  `Level2ApprovedDate` datetime DEFAULT NULL,
  `Level3ApprovedBy` int DEFAULT NULL,
  `Level3ApprovedDate` datetime DEFAULT NULL,
  `SentToSupplierDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TermsAndConditions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `AttachmentPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `DeliveryDays` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchaseorders`
--

INSERT INTO `purchaseorders` (`POID`, `PONumber`, `PODate`, `PRID`, `QuotationID`, `SupplierID`, `ExpectedDeliveryDate`, `ShippingMethod`, `ShippingTerms`, `PaymentTerms`, `PaymentTermDays`, `Currency`, `ExchangeRate`, `SubTotal`, `DiscountPercentage`, `DiscountAmount`, `TaxAmount`, `ShippingCost`, `OtherCosts`, `TotalAmount`, `Status`, `ApprovalStatus`, `Level1ApprovedBy`, `Level1ApprovedDate`, `Level2ApprovedBy`, `Level2ApprovedDate`, `Level3ApprovedBy`, `Level3ApprovedDate`, `SentToSupplierDate`, `Notes`, `TermsAndConditions`, `AttachmentPath`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `DeliveryDays`) VALUES
(15, 'PO-1', '2026-02-15 10:37:35', 11, 18, 2, '2026-02-18', NULL, NULL, NULL, NULL, 'EGP', 1.000000, 5529.00, 0.00, 0.00, 0.00, 2000.00, 1000.00, 8529.00, 'PartiallyReceived', 'Approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Auto-generated from Approved Comparison: #COMP-1', NULL, NULL, '2026-02-15 10:37:35', 1, '2026-02-15 10:37:48', 1, NULL),
(16, 'PO-2', '2026-02-15 17:38:51', 12, 19, 2, '2026-02-18', NULL, NULL, NULL, NULL, 'EGP', 1.000000, 410400.00, 0.00, 0.00, 0.00, 5000.00, 500.00, 415900.00, 'PartiallyReceived', 'Approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Auto-generated from Approved Comparison: #COMP-2', NULL, NULL, '2026-02-15 17:38:51', 1, '2026-02-15 17:39:12', 1, NULL),
(17, 'PO-3', '2026-02-16 11:17:26', 13, 20, 3, '2026-02-21', NULL, NULL, NULL, NULL, 'EGP', 1.000000, 54150.00, 0.00, 0.00, 0.00, 2000.00, 1000.00, 57150.00, 'PartiallyReceived', 'Approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Auto-generated from Approved Comparison: #COMP-3', NULL, NULL, '2026-02-16 11:17:26', 1, '2026-02-16 11:29:11', 1, NULL),
(18, 'PO-4', '2026-02-16 18:49:40', 14, 24, 4, '2026-02-20', NULL, NULL, NULL, NULL, 'EGP', 1.000000, 21945.00, 0.00, 0.00, 0.00, 5000.00, 0.00, 26945.00, 'PartiallyReceived', 'Approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Auto-generated from Approved Comparison: #COMP-4', NULL, NULL, '2026-02-16 18:49:40', 1, '2026-02-16 18:49:55', 1, NULL),
(19, 'PO-5', '2026-02-17 18:46:49', 15, 25, 2, '2026-02-21', NULL, NULL, NULL, NULL, 'EGP', 1.000000, 535800.00, 0.00, 0.00, 0.00, 12000.00, 2200.00, 550000.00, 'PartiallyReceived', 'Approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Auto-generated from Approved Comparison: #COMP-5', NULL, NULL, '2026-02-17 18:46:49', 1, '2026-02-17 18:46:59', 1, NULL),
(20, 'PO-6', '2026-02-21 08:47:47', 16, 26, 2, '2026-02-24', NULL, NULL, NULL, NULL, 'EGP', 1.000000, 35568.00, 0.00, 0.00, 0.00, 500.00, 400.00, 36468.00, 'PartiallyReceived', 'Approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Auto-generated from Approved Comparison: #COMP-6', NULL, NULL, '2026-02-21 08:47:47', 1, '2026-02-21 08:48:12', 1, NULL),
(21, 'PO-7', '2026-02-21 09:11:28', 17, 27, 2, '2026-02-26', NULL, NULL, NULL, NULL, 'EGP', 1.000000, 2964000.00, 0.00, 0.00, 0.00, 20000.00, 16000.00, 3000000.00, 'PartiallyReceived', 'Approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Auto-generated from Approved Comparison: #COMP-7', NULL, NULL, '2026-02-21 09:11:28', 1, '2026-02-21 09:12:01', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchaserequisitionitems`
--

CREATE TABLE `purchaserequisitionitems` (
  `PRItemID` int NOT NULL,
  `PRID` int NOT NULL,
  `ItemID` int NOT NULL,
  `RequestedQty` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `EstimatedUnitPrice` decimal(18,4) DEFAULT NULL,
  `EstimatedTotalPrice` decimal(18,2) DEFAULT NULL,
  `RequiredDate` date DEFAULT NULL,
  `Specifications` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchaserequisitionitems`
--

INSERT INTO `purchaserequisitionitems` (`PRItemID`, `PRID`, `ItemID`, `RequestedQty`, `UnitID`, `EstimatedUnitPrice`, `EstimatedTotalPrice`, `RequiredDate`, `Specifications`, `Notes`) VALUES
(55, 11, 1, 1.000, 14, NULL, NULL, NULL, NULL, ''),
(56, 12, 1, 80.000, 14, NULL, NULL, NULL, NULL, ''),
(57, 13, 1, 5.000, 14, NULL, NULL, NULL, NULL, ''),
(58, 14, 1, 5.000, 14, NULL, NULL, NULL, NULL, ''),
(59, 15, 1, 100.000, 14, NULL, NULL, NULL, NULL, ''),
(60, 16, 2, 5.000, 11, NULL, NULL, NULL, NULL, ''),
(61, 17, 2, 500.000, 11, NULL, NULL, NULL, NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `purchaserequisitions`
--

CREATE TABLE `purchaserequisitions` (
  `PRID` int NOT NULL,
  `PRNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `PRDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `RequestedByDeptID` int NOT NULL,
  `RequestedByUserID` int NOT NULL,
  `RequiredDate` date DEFAULT NULL,
  `Priority` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Normal',
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `TotalEstimatedAmount` decimal(18,2) DEFAULT NULL,
  `Justification` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `RejectionReason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchaserequisitions`
--

INSERT INTO `purchaserequisitions` (`PRID`, `PRNumber`, `PRDate`, `RequestedByDeptID`, `RequestedByUserID`, `RequiredDate`, `Priority`, `Status`, `TotalEstimatedAmount`, `Justification`, `ApprovedByUserID`, `ApprovedDate`, `RejectionReason`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`) VALUES
(11, '#PR-1', '2026-02-15 10:09:09', 1, 1, '2026-02-24', 'Normal', 'Approved', NULL, '', NULL, '2026-02-15 10:35:51', NULL, '', '2026-02-15 10:09:09', 1, '2026-02-15 10:35:51', NULL),
(12, '#PR-2', '2026-02-15 17:36:48', 8, 1, '2026-03-03', 'High', 'Approved', NULL, '', NULL, '2026-02-15 17:37:09', NULL, '', '2026-02-15 17:36:48', 1, '2026-02-15 17:37:09', NULL),
(13, '#PR-3', '2026-02-15 22:00:00', 4, 1, '2026-03-06', 'Normal', 'Approved', NULL, '', NULL, '2026-02-16 11:14:58', NULL, '', '2026-02-16 11:14:21', 1, '2026-02-16 11:14:58', NULL),
(14, '#PR-4', '2026-02-15 22:00:00', 8, 1, '2026-03-05', 'High', 'Approved', NULL, '', NULL, '2026-02-16 18:43:10', NULL, '', '2026-02-16 18:42:14', 1, '2026-02-16 18:43:10', NULL),
(15, '#PR-5', '2026-02-16 22:00:00', 1, 1, '2026-02-25', 'Normal', 'Approved', NULL, '', NULL, '2026-02-17 18:44:06', NULL, '', '2026-02-17 18:43:56', 1, '2026-02-17 18:44:06', NULL),
(16, '#PR-6', '2026-02-20 22:00:00', 4, 1, '2026-02-25', 'High', 'Approved', NULL, '', NULL, '2026-02-21 08:46:18', NULL, '', '2026-02-21 08:46:12', 1, '2026-02-21 08:46:18', NULL),
(17, '#PR-7', '2026-02-20 22:00:00', 6, 1, '2026-03-05', 'Normal', 'Approved', NULL, '', NULL, '2026-02-21 09:09:39', NULL, '', '2026-02-21 09:09:35', 1, '2026-02-21 09:09:39', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchasereturnitems`
--

CREATE TABLE `purchasereturnitems` (
  `ReturnItemID` int NOT NULL,
  `PurchaseReturnID` int NOT NULL,
  `GRNItemID` int DEFAULT NULL,
  `ItemID` int NOT NULL,
  `ReturnedQty` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `TaxPercentage` decimal(5,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalPrice` decimal(18,2) NOT NULL,
  `ReturnReason` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LotNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchasereturnitems`
--

INSERT INTO `purchasereturnitems` (`ReturnItemID`, `PurchaseReturnID`, `GRNItemID`, `ItemID`, `ReturnedQty`, `UnitID`, `UnitPrice`, `TaxPercentage`, `TaxAmount`, `TotalPrice`, `ReturnReason`, `LotNumber`, `Notes`) VALUES
(25, 3, 54, 1, 2.000, 14, 10000.0000, 0.00, 0.00, 20000.00, 'Quality Failure', NULL, NULL),
(26, 4, 56, 1, 50.000, 14, 5000.0000, 0.00, 0.00, 250000.00, 'Quality Failure', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchasereturns`
--

CREATE TABLE `purchasereturns` (
  `PurchaseReturnID` int NOT NULL,
  `ReturnNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ReturnDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `GRNID` int DEFAULT NULL,
  `SupplierInvoiceID` int DEFAULT NULL,
  `SupplierID` int NOT NULL,
  `WarehouseID` int NOT NULL,
  `ReturnReason` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalAmount` decimal(18,2) NOT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `DebitNoteID` int DEFAULT NULL,
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `PreparedByUserID` int NOT NULL,
  `SentToSupplierDate` datetime DEFAULT NULL,
  `SupplierAcknowledgedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchasereturns`
--

INSERT INTO `purchasereturns` (`PurchaseReturnID`, `ReturnNumber`, `ReturnDate`, `GRNID`, `SupplierInvoiceID`, `SupplierID`, `WarehouseID`, `ReturnReason`, `SubTotal`, `TaxAmount`, `TotalAmount`, `Status`, `DebitNoteID`, `ApprovedByUserID`, `ApprovedDate`, `PreparedByUserID`, `SentToSupplierDate`, `SupplierAcknowledgedDate`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`) VALUES
(3, 'RET-1771241402967', '2026-02-16 11:30:03', 9, NULL, 3, 3, 'Rejected during Quality Inspection', 20000.00, 0.00, 20000.00, 'Approved', NULL, 1, '2026-02-16 11:30:40', 1, NULL, NULL, NULL, '2026-02-16 11:30:03', 1, '2026-02-16 11:30:40.188958', 1),
(4, 'RET-1771354040311', '2026-02-17 18:47:20', 11, NULL, 2, 3, 'Rejected during Quality Inspection', 250000.00, 0.00, 250000.00, 'Approved', NULL, 1, '2026-02-17 19:37:28', 1, NULL, NULL, NULL, '2026-02-17 18:47:20', 1, '2026-02-17 19:37:28.062398', 1);

-- --------------------------------------------------------

--
-- Table structure for table `qualityinspectionitems`
--

CREATE TABLE `qualityinspectionitems` (
  `InspectionItemID` int NOT NULL,
  `AcceptedQty` decimal(18,3) DEFAULT NULL,
  `Comments` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReceivedQty` decimal(18,3) DEFAULT NULL,
  `RejectedQty` decimal(18,3) DEFAULT NULL,
  `InspectionResult` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `InspectionID` int NOT NULL,
  `ItemID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qualityinspectionresults`
--

CREATE TABLE `qualityinspectionresults` (
  `ResultID` int NOT NULL,
  `InspectionID` int NOT NULL,
  `ParameterID` int NOT NULL,
  `MeasuredValue` decimal(18,6) DEFAULT NULL,
  `TextValue` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Result` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ActualValue` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Comments` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `InspectionResult` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qualityinspections`
--

CREATE TABLE `qualityinspections` (
  `InspectionID` int NOT NULL,
  `InspectionNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `InspectionDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `InspectionType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ReferenceType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceID` int DEFAULT NULL,
  `ItemID` int NOT NULL,
  `LotNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SampleSize` decimal(18,3) DEFAULT NULL,
  `InspectedByUserID` int NOT NULL,
  `OverallResult` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'InProgress',
  `COAAttachmentPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CompletedDate` datetime DEFAULT NULL,
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `qualityinspections`
--

INSERT INTO `qualityinspections` (`InspectionID`, `InspectionNumber`, `InspectionDate`, `InspectionType`, `ReferenceType`, `ReferenceID`, `ItemID`, `LotNumber`, `SampleSize`, `InspectedByUserID`, `OverallResult`, `Status`, `COAAttachmentPath`, `Notes`, `CompletedDate`, `ApprovedByUserID`, `ApprovedDate`, `CreatedAt`, `CreatedBy`) VALUES
(8, 'QI-1771151890489-1', '2026-02-15 10:38:10', 'Incoming', 'GRN', 7, 1, NULL, NULL, 1, 'Passed', 'Completed', NULL, '', '2026-02-15 10:38:10', NULL, NULL, '2026-02-15 10:38:10', 1),
(9, 'QI-1771177167121-1', '2026-02-15 17:39:27', 'Incoming', 'GRN', 8, 1, NULL, NULL, 1, 'Passed', 'Completed', NULL, '', '2026-02-15 17:39:27', NULL, NULL, '2026-02-15 17:39:27', 1),
(10, 'QI-1771241402941-1', '2026-02-16 11:30:03', 'Incoming', 'GRN', 9, 1, NULL, NULL, 1, 'Failed', 'Completed', NULL, '', '2026-02-16 11:30:03', NULL, NULL, '2026-02-16 11:30:03', 1),
(11, 'QI-1771267809792-1', '2026-02-16 18:50:10', 'Incoming', 'GRN', 10, 1, NULL, NULL, 1, 'Passed', 'Completed', NULL, '', '2026-02-16 18:50:10', NULL, NULL, '2026-02-16 18:50:10', 1),
(12, 'QI-1771354040243-1', '2026-02-17 18:47:20', 'Incoming', 'GRN', 11, 1, NULL, NULL, 1, 'Failed', 'Completed', NULL, '', '2026-02-17 18:47:20', NULL, NULL, '2026-02-17 18:47:20', 1),
(13, 'QI-1771663706241-2', '2026-02-21 08:48:26', 'Incoming', 'GRN', 12, 2, NULL, NULL, 1, 'Passed', 'Completed', NULL, '', '2026-02-21 08:48:26', NULL, NULL, '2026-02-21 08:48:26', 1),
(14, 'QI-1771665131455-2', '2026-02-21 09:12:11', 'Incoming', 'GRN', 13, 2, NULL, NULL, 1, 'Passed', 'Completed', NULL, '', '2026-02-21 09:12:11', NULL, NULL, '2026-02-21 09:12:11', 1);

-- --------------------------------------------------------

--
-- Table structure for table `qualityparameters`
--

CREATE TABLE `qualityparameters` (
  `ParameterID` int NOT NULL,
  `ParameterCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ParameterNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ParameterNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `UnitOfMeasure` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DataType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MinValue` decimal(38,2) DEFAULT NULL,
  `MaxValue` decimal(38,2) DEFAULT NULL,
  `StandardValue` decimal(38,2) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `unit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotationcomparisondetails`
--

CREATE TABLE `quotationcomparisondetails` (
  `CompDetailID` int NOT NULL,
  `ComparisonID` int NOT NULL,
  `QuotationID` int NOT NULL,
  `SupplierID` int NOT NULL,
  `UnitPrice` decimal(18,4) DEFAULT NULL,
  `TotalPrice` decimal(18,2) DEFAULT NULL,
  `PaymentTerms` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DeliveryDays` int DEFAULT NULL,
  `QualityRating` int DEFAULT NULL,
  `PriceRating` int DEFAULT NULL,
  `OverallScore` decimal(5,2) DEFAULT NULL,
  `Comments` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `PolymerGrade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quotationcomparisondetails`
--

INSERT INTO `quotationcomparisondetails` (`CompDetailID`, `ComparisonID`, `QuotationID`, `SupplierID`, `UnitPrice`, `TotalPrice`, `PaymentTerms`, `DeliveryDays`, `QualityRating`, `PriceRating`, `OverallScore`, `Comments`, `DeliveryCost`, `PolymerGrade`) VALUES
(216, 9, 18, 2, 5000.0000, 8529.00, '', 3, 10, 10, 10.00, '', 2000.00, 'a'),
(217, 10, 19, 2, 5000.0000, 415900.00, '', 3, 10, 10, 10.00, '', 5000.00, 'c'),
(218, 11, 20, 3, 10000.0000, 57150.00, '', 5, 10, 10, 10.00, '', 2000.00, 'a'),
(219, 12, 21, 1, 2000.0000, 11216.00, '', 4, 10, 10, 10.00, '', 400.00, 'a'),
(220, 12, 24, 4, 7000.0000, 26945.00, '', 4, 10, 4, 7.10, '', 5000.00, 'b'),
(221, 12, 22, 2, 5000.0000, 27375.00, '', 5, 8, 4, 6.00, '', 100.00, 'c'),
(222, 12, 23, 3, 10000.0000, 34300.00, '4', 5, 8, 3, 5.60, '', 100.00, 'a'),
(223, 13, 25, 2, 5000.0000, 550000.00, '', 4, 10, 10, 10.00, '', 12000.00, 'a'),
(224, 14, 26, 2, 6500.0000, 36468.00, '', 3, 10, 10, 10.00, '', 500.00, 'a'),
(225, 15, 27, 2, 6500.0000, 3000000.00, '', 5, 10, 10, 10.00, '', 20000.00, 'a');

-- --------------------------------------------------------

--
-- Table structure for table `quotationcomparisons`
--

CREATE TABLE `quotationcomparisons` (
  `ComparisonID` int NOT NULL,
  `ComparisonNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ComparisonDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PRID` int DEFAULT NULL,
  `ItemID` int NOT NULL,
  `SelectedQuotationID` int DEFAULT NULL,
  `SelectedSupplierID` int DEFAULT NULL,
  `SelectionReason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `ReviewedByUserID` int DEFAULT NULL,
  `ReviewedDate` datetime DEFAULT NULL,
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FinanceReviewedBy` int DEFAULT NULL,
  `FinanceReviewedDate` datetime(6) DEFAULT NULL,
  `ManagementApprovedBy` int DEFAULT NULL,
  `ManagementApprovedDate` datetime(6) DEFAULT NULL,
  `LastRejectionDate` datetime(6) DEFAULT NULL,
  `RejectionCount` int DEFAULT NULL,
  `RejectionReason` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quotationcomparisons`
--

INSERT INTO `quotationcomparisons` (`ComparisonID`, `ComparisonNumber`, `ComparisonDate`, `PRID`, `ItemID`, `SelectedQuotationID`, `SelectedSupplierID`, `SelectionReason`, `Status`, `ReviewedByUserID`, `ReviewedDate`, `ApprovedByUserID`, `ApprovedDate`, `Notes`, `CreatedAt`, `CreatedBy`, `ApprovalStatus`, `FinanceReviewedBy`, `FinanceReviewedDate`, `ManagementApprovedBy`, `ManagementApprovedDate`, `LastRejectionDate`, `RejectionCount`, `RejectionReason`) VALUES
(9, '#COMP-1', '2026-02-15 10:37:01', 11, 1, 18, 2, 'أفضل عرض متكامل (سعر وتوريد)', 'Approved', NULL, NULL, NULL, NULL, NULL, '2026-02-15 10:37:01', 1, 'Approved', NULL, NULL, NULL, NULL, NULL, 0, NULL),
(10, '#COMP-2', '2026-02-15 17:38:34', 12, 1, 19, 2, 'أفضل عرض متكامل (سعر وتوريد)', 'Approved', NULL, NULL, NULL, NULL, NULL, '2026-02-15 17:38:34', 1, 'Approved', NULL, NULL, NULL, NULL, NULL, 0, NULL),
(11, '#COMP-3', '2026-02-16 11:17:14', 13, 1, 20, 3, 'أفضل عرض متكامل (سعر وتوريد)', 'Approved', NULL, NULL, NULL, NULL, NULL, '2026-02-16 11:17:14', 1, 'Approved', NULL, NULL, NULL, NULL, NULL, 0, NULL),
(12, '#COMP-4', '2026-02-16 18:48:34', 14, 1, 24, 4, 'أفضل عرض متكامل (سعر وتوريد)', 'Approved', NULL, NULL, NULL, NULL, NULL, '2026-02-16 18:48:34', 1, 'Approved', NULL, NULL, NULL, NULL, NULL, 0, NULL),
(13, '#COMP-5', '2026-02-17 18:46:36', 15, 1, 25, 2, 'أفضل عرض متكامل (سعر وتوريد)', 'Approved', NULL, NULL, NULL, NULL, NULL, '2026-02-17 18:46:36', 1, 'Approved', NULL, NULL, NULL, NULL, NULL, 0, NULL),
(14, '#COMP-6', '2026-02-21 08:47:29', 16, 2, 26, 2, 'أفضل عرض متكامل (سعر وتوريد)', 'Approved', NULL, NULL, NULL, NULL, NULL, '2026-02-21 08:47:29', 1, 'Approved', NULL, NULL, NULL, NULL, NULL, 0, NULL),
(15, '#COMP-7', '2026-02-21 09:11:08', 17, 2, 27, 2, 'أفضل عرض متكامل (سعر وتوريد)', 'Approved', NULL, NULL, NULL, NULL, NULL, '2026-02-21 09:11:08', 1, 'Approved', NULL, NULL, NULL, NULL, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `receiptvoucherallocations`
--

CREATE TABLE `receiptvoucherallocations` (
  `AllocationID` int NOT NULL,
  `ReceiptVoucherID` int NOT NULL,
  `SalesInvoiceID` int NOT NULL,
  `AllocatedAmount` decimal(18,2) NOT NULL,
  `AllocationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receiptvouchers`
--

CREATE TABLE `receiptvouchers` (
  `ReceiptVoucherID` int NOT NULL,
  `VoucherNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `VoucherDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CustomerID` int DEFAULT NULL,
  `PayerName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaymentMethod` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CashRegisterID` int DEFAULT NULL,
  `BankAccountID` int DEFAULT NULL,
  `ChequeID` int DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `Amount` decimal(18,2) NOT NULL,
  `AmountInWords` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceID` int DEFAULT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `JournalEntryID` int DEFAULT NULL,
  `ReceivedByUserID` int NOT NULL,
  `PostedByUserID` int DEFAULT NULL,
  `PostedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requestforquotations`
--

CREATE TABLE `requestforquotations` (
  `RFQID` int NOT NULL,
  `RFQNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RFQDate` date NOT NULL,
  `PRID` int DEFAULT NULL,
  `SupplierID` int NOT NULL,
  `ResponseDueDate` date DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Sent',
  `SentByUserID` int DEFAULT NULL,
  `SentDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requestforquotations`
--

INSERT INTO `requestforquotations` (`RFQID`, `RFQNumber`, `RFQDate`, `PRID`, `SupplierID`, `ResponseDueDate`, `Status`, `SentByUserID`, `SentDate`, `Notes`, `CreatedAt`, `CreatedBy`) VALUES
(28, '#RFQ-1', '2026-02-15', 11, 2, NULL, 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-1 ', '2026-02-15 10:36:09', 1),
(29, '#RFQ-2', '2026-02-15', 12, 2, '2026-02-27', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-2 ', '2026-02-15 17:37:35', 1),
(30, '#RFQ-3', '2026-02-16', 13, 3, '2026-02-27', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-3 ', '2026-02-16 11:15:24', 1),
(31, '#RFQ-4', '2026-02-16', 14, 1, '2026-02-24', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-4 ', '2026-02-16 18:43:50', 1),
(32, '#RFQ-5', '2026-02-16', 14, 2, '2026-02-24', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-4 ', '2026-02-16 18:43:50', 1),
(33, '#RFQ-6', '2026-02-16', 14, 3, '2026-02-24', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-4 ', '2026-02-16 18:43:51', 1),
(34, '#RFQ-7', '2026-02-16', 14, 4, '2026-02-24', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-4 ', '2026-02-16 18:43:51', 1),
(35, '#RFQ-8', '2026-02-17', 15, 2, '2026-02-20', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-5 ', '2026-02-17 18:44:36', 1),
(36, '#RFQ-9', '2026-02-21', 16, 2, '2026-02-26', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-6 ', '2026-02-21 08:46:39', 1),
(37, '#RFQ-10', '2026-02-21', 17, 2, '2026-02-24', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-7 ', '2026-02-21 09:10:02', 1);

-- --------------------------------------------------------

--
-- Table structure for table `rfqitems`
--

CREATE TABLE `rfqitems` (
  `RFQItemID` int NOT NULL,
  `RFQID` int NOT NULL,
  `ItemID` int NOT NULL,
  `RequestedQty` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `Specifications` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `EstimatedUnitPrice` decimal(18,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rfqitems`
--

INSERT INTO `rfqitems` (`RFQItemID`, `RFQID`, `ItemID`, `RequestedQty`, `UnitID`, `Specifications`, `EstimatedUnitPrice`) VALUES
(105, 28, 1, 1.000, 14, '', NULL),
(106, 29, 1, 80.000, 14, '', 5000.0000),
(107, 30, 1, 5.000, 14, '', 0.0000),
(108, 31, 1, 5.000, 14, '', 0.0000),
(109, 32, 1, 5.000, 14, '', 0.0000),
(110, 33, 1, 5.000, 14, '', 0.0000),
(111, 34, 1, 5.000, 14, '', 0.0000),
(112, 35, 1, 100.000, 14, '', 5000.0000),
(113, 36, 2, 5.000, 11, '', 0.0000),
(114, 37, 2, 500.000, 11, '', 6500.0000);

-- --------------------------------------------------------

--
-- Table structure for table `rolepermissions`
--

CREATE TABLE `rolepermissions` (
  `RolePermissionID` int NOT NULL,
  `RoleID` int NOT NULL,
  `PermissionID` int NOT NULL,
  `IsAllowed` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rolepermissions`
--

INSERT INTO `rolepermissions` (`RolePermissionID`, `RoleID`, `PermissionID`, `IsAllowed`) VALUES
(1, 1, 1, 1),
(2, 1, 2, 1),
(3, 1, 3, 1),
(4, 1, 4, 1),
(5, 1, 5, 1),
(6, 1, 6, 1),
(7, 1, 7, 1),
(8, 1, 8, 1),
(9, 1, 9, 1),
(10, 1, 10, 1),
(11, 1, 11, 1),
(12, 1, 12, 1),
(13, 1, 13, 1),
(14, 1, 14, 1),
(15, 1, 15, 1),
(16, 1, 16, 1),
(17, 1, 17, 1),
(18, 1, 18, 1),
(19, 1, 19, 1),
(20, 1, 20, 1),
(21, 1, 21, 1),
(22, 1, 22, 1),
(23, 1, 23, 1),
(24, 1, 24, 1),
(25, 4, 18, 1),
(26, 4, 19, 1),
(27, 4, 20, 1),
(28, 4, 21, 1),
(29, 4, 22, 1),
(30, 4, 23, 1),
(31, 4, 24, 1),
(32, 5, 8, 1),
(33, 5, 9, 1),
(34, 5, 10, 1),
(35, 5, 11, 1),
(36, 5, 12, 1),
(38, 1, 25, 1),
(39, 1, 26, 1),
(40, 1, 27, 1),
(41, 1, 28, 1),
(42, 1, 29, 1),
(43, 1, 30, 1),
(44, 1, 31, 1),
(45, 1, 32, 1),
(46, 1, 33, 1),
(47, 11, 13, 1),
(48, 11, 14, 1),
(49, 11, 15, 1),
(50, 11, 16, 1),
(51, 11, 17, 1),
(52, 4, 25, 1),
(53, 2, 25, 1),
(54, 2, 26, 1),
(55, 2, 27, 1),
(56, 2, 28, 1),
(57, 2, 29, 1),
(58, 2, 30, 1),
(59, 2, 31, 1),
(60, 2, 32, 1),
(61, 2, 33, 1),
(62, 3, 25, 1),
(63, 6, 25, 1),
(64, 6, 32, 1),
(65, 7, 25, 1),
(66, 7, 30, 1),
(67, 7, 31, 1),
(68, 5, 25, 1),
(69, 5, 32, 1),
(91, 9, 33, 1),
(92, 9, 25, 1),
(93, 9, 28, 1),
(94, 9, 29, 1),
(95, 10, 29, 1),
(96, 10, 25, 1),
(97, 1, 34, 1),
(98, 4, 34, 1),
(99, 2, 34, 1),
(100, 3, 34, 1),
(101, 1, 35, 1),
(102, 1, 36, 1),
(103, 1, 37, 1),
(104, 1, 38, 1),
(105, 1, 39, 1),
(106, 2, 35, 1),
(107, 2, 36, 1),
(108, 2, 37, 1),
(109, 2, 38, 1),
(110, 2, 39, 1),
(111, 3, 35, 1),
(112, 3, 36, 1),
(113, 3, 37, 1),
(114, 3, 38, 1),
(115, 3, 39, 1),
(116, 4, 35, 1),
(117, 4, 36, 1),
(118, 4, 37, 1),
(119, 4, 38, 1),
(120, 4, 39, 1),
(121, 5, 40, 1),
(122, 5, 41, 1),
(123, 6, 40, 1),
(124, 6, 41, 1),
(125, 3, 41, 1),
(126, 3, 42, 1),
(127, 3, 43, 1),
(128, 3, 44, 1),
(129, 4, 41, 1),
(130, 4, 42, 1),
(131, 4, 43, 1),
(132, 4, 44, 1),
(133, 1, 40, 1),
(134, 1, 41, 1),
(135, 1, 42, 1),
(136, 1, 43, 1),
(137, 1, 44, 1),
(138, 2, 40, 1),
(139, 2, 41, 1),
(140, 2, 42, 1),
(141, 2, 43, 1),
(142, 2, 44, 1);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `RoleID` int NOT NULL,
  `RoleCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RoleNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `RoleNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`RoleID`, `RoleCode`, `RoleNameAr`, `RoleNameEn`, `Description`, `IsActive`, `CreatedAt`) VALUES
(1, 'ADMIN', 'مدير النظام', 'System Administrator', 'صلاحيات كاملة على النظام', 1, '2026-01-12 23:13:08'),
(2, 'GM', 'المدير العام', 'General Manager', 'الإدارة العليا واعتماد القرارات', 1, '2026-01-12 23:13:08'),
(3, 'FM', 'المدير المالي', 'Finance Manager', 'إدارة الشؤون المالية', 1, '2026-01-12 23:13:08'),
(4, 'ACC', 'محاسب', 'Accountant', 'العمليات المحاسبية اليومية', 1, '2026-01-12 23:13:08'),
(5, 'PM', 'مدير المشتريات', 'Procurement Manager', 'إدارة عمليات الشراء', 1, '2026-01-12 23:13:08'),
(6, 'BUYER', 'مشتري', 'Buyer', 'تنفيذ عمليات الشراء', 1, '2026-01-12 23:13:08'),
(7, 'SM', 'مدير المبيعات', 'Sales Manager', 'إدارة عمليات البيع', 1, '2026-01-12 23:13:08'),
(8, 'SALES', 'مندوب مبيعات', 'Sales Representative', 'تنفيذ عمليات البيع', 1, '2026-01-12 23:13:08'),
(9, 'WHM', 'أمين المخزن', 'Warehouse Manager', 'إدارة المخزن', 1, '2026-01-12 23:13:08'),
(10, 'QC', 'مراقب جودة', 'Quality Controller', 'فحص ومراقبة الجودة', 1, '2026-01-12 23:13:08'),
(11, 'CASHIER', 'أمين صندوق', 'Cashier', 'عمليات الخزينة', 1, '2026-01-12 23:13:08');

-- --------------------------------------------------------

--
-- Table structure for table `salarycomponents`
--

CREATE TABLE `salarycomponents` (
  `ComponentID` int NOT NULL,
  `ComponentCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ComponentName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ComponentType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `IsFixed` tinyint(1) DEFAULT '1',
  `IsActive` tinyint(1) DEFAULT '1',
  `ComponentNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ComponentNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesinvoiceitems`
--

CREATE TABLE `salesinvoiceitems` (
  `InvoiceItemID` int NOT NULL,
  `SalesInvoiceID` int NOT NULL,
  `IssueItemID` int DEFAULT NULL,
  `ItemID` int NOT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxPercentage` decimal(5,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalPrice` decimal(18,2) NOT NULL,
  `GrossProfit` decimal(18,2) GENERATED ALWAYS AS ((`TotalPrice` - (`Quantity` * ifnull(`UnitCost`,0)))) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesinvoiceitems`
--

INSERT INTO `salesinvoiceitems` (`InvoiceItemID`, `SalesInvoiceID`, `IssueItemID`, `ItemID`, `Description`, `Quantity`, `UnitID`, `UnitPrice`, `UnitCost`, `DiscountPercentage`, `DiscountAmount`, `TaxPercentage`, `TaxAmount`, `TotalPrice`) VALUES
(1, 1, NULL, 1, NULL, 4.001, 14, 0.0000, NULL, 0.00, 0.00, 0.00, 0.00, 0.00),
(2, 2, NULL, 1, NULL, 6.000, 14, 90.0000, NULL, 0.00, 0.00, 0.00, 0.00, 540.00),
(3, 3, NULL, 1, NULL, 6.000, 14, 90.0000, NULL, 5.00, 0.00, 0.00, 0.00, 584.82),
(4, 3, NULL, 2, NULL, 7.000, 11, 1400.0000, NULL, 3.00, 0.00, 0.00, 0.00, 10836.84);

-- --------------------------------------------------------

--
-- Table structure for table `salesinvoices`
--

CREATE TABLE `salesinvoices` (
  `SalesInvoiceID` int NOT NULL,
  `InvoiceNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `InvoiceDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `DueDate` date NOT NULL,
  `SOID` int DEFAULT NULL,
  `IssueNoteID` int DEFAULT NULL,
  `CustomerID` int NOT NULL,
  `SalesRepID` int DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `ShippingCost` decimal(18,2) DEFAULT '0.00',
  `TotalAmount` decimal(18,2) NOT NULL,
  `PaidAmount` decimal(18,2) DEFAULT '0.00',
  `RemainingAmount` decimal(18,2) GENERATED ALWAYS AS ((`TotalAmount` - `PaidAmount`)) STORED,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `EInvoiceStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `EInvoiceUUID` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `EInvoiceSubmissionID` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `EInvoiceInternalID` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `EInvoiceSubmissionDate` datetime DEFAULT NULL,
  `EInvoiceValidationStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaymentTerms` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesinvoices`
--

INSERT INTO `salesinvoices` (`SalesInvoiceID`, `InvoiceNumber`, `InvoiceDate`, `DueDate`, `SOID`, `IssueNoteID`, `CustomerID`, `SalesRepID`, `Currency`, `ExchangeRate`, `SubTotal`, `DiscountPercentage`, `DiscountAmount`, `TaxAmount`, `ShippingCost`, `TotalAmount`, `PaidAmount`, `Status`, `EInvoiceStatus`, `EInvoiceUUID`, `EInvoiceSubmissionID`, `EInvoiceInternalID`, `EInvoiceSubmissionDate`, `EInvoiceValidationStatus`, `PaymentTerms`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalStatus`) VALUES
(1, 'INV-1771177432621', '2026-02-14 22:00:00', '2026-03-17', 1, NULL, 1, NULL, 'EGP', 1.000000, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 'Draft', NULL, NULL, NULL, NULL, NULL, NULL, '', '', '2026-02-15 17:43:53', 1, '2026-02-15 17:43:53', 1, 'Pending'),
(2, 'INV-1771527915688', '2026-02-18 22:00:00', '2026-03-21', 6, NULL, 1, NULL, 'EGP', 1.000000, 540.00, 0.00, 0.00, 75.60, 0.00, 615.60, 0.00, 'Draft', NULL, NULL, NULL, NULL, NULL, NULL, '', '', '2026-02-19 19:05:16', 1, '2026-02-19 19:05:16', 1, 'Pending'),
(3, 'INV-1771623513782', '2026-02-19 22:00:00', '2026-02-28', 7, NULL, 1, NULL, 'EGP', 1.000000, 10019.00, 0.00, 0.00, 1402.66, 0.00, 11421.66, 0.00, 'Draft', NULL, NULL, NULL, NULL, NULL, NULL, '', '', '2026-02-20 21:38:34', 1, '2026-02-20 21:38:34', 1, 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `salesorderitems`
--

CREATE TABLE `salesorderitems` (
  `SOItemID` int NOT NULL,
  `SOID` int NOT NULL,
  `ItemID` int NOT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `OrderedQty` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxPercentage` decimal(5,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalPrice` decimal(18,2) NOT NULL,
  `DeliveredQty` decimal(18,3) DEFAULT '0.000',
  `RemainingQty` decimal(18,3) GENERATED ALWAYS AS ((`OrderedQty` - `DeliveredQty`)) STORED,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `WarehouseID` int DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesorderitems`
--

INSERT INTO `salesorderitems` (`SOItemID`, `SOID`, `ItemID`, `Description`, `OrderedQty`, `UnitID`, `UnitPrice`, `UnitCost`, `DiscountPercentage`, `DiscountAmount`, `TaxPercentage`, `TaxAmount`, `TotalPrice`, `DeliveredQty`, `Status`, `WarehouseID`, `Notes`) VALUES
(1, 1, 1, NULL, 4.001, 14, 0.0000, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 4.001, 'Pending', NULL, NULL),
(2, 2, 1, NULL, 5.000, 14, 48.0000, NULL, 4.00, 0.00, 0.00, 0.00, 230.40, 0.000, 'Pending', NULL, NULL),
(3, 3, 1, NULL, 1.000, 14, 90.0000, NULL, 0.00, 0.00, 0.00, 0.00, 90.00, 0.000, 'Pending', NULL, NULL),
(4, 4, 1, NULL, 10.000, 14, 90.0000, NULL, 0.00, 0.00, 0.00, 0.00, 1026.00, 0.000, 'Pending', NULL, NULL),
(5, 5, 1, NULL, 1.000, 14, 62.0000, NULL, 0.00, 0.00, 0.00, 0.00, 62.00, 0.000, 'Pending', NULL, NULL),
(6, 6, 1, NULL, 6.000, 14, 90.0000, NULL, 0.00, 0.00, 0.00, 0.00, 540.00, 6.000, 'Pending', NULL, NULL),
(7, 7, 1, NULL, 6.000, 14, 90.0000, NULL, 5.00, 0.00, 14.00, 0.00, 584.82, 0.000, 'Pending', NULL, NULL),
(8, 7, 2, NULL, 7.000, 11, 1400.0000, NULL, 3.00, 0.00, 14.00, 0.00, 10836.84, 0.000, 'Pending', NULL, NULL),
(9, 8, 1, NULL, 1.000, 14, 90.0000, NULL, 5.00, 0.00, 14.00, 0.00, 102.60, 1.000, 'Pending', NULL, NULL),
(10, 9, 1, NULL, 1.000, 14, 90.0000, NULL, 0.00, 0.00, 14.00, 0.00, 102.60, 1.000, 'Pending', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `salesorders`
--

CREATE TABLE `salesorders` (
  `SOID` int NOT NULL,
  `SONumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SODate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SalesQuotationID` int DEFAULT NULL,
  `CustomerID` int NOT NULL,
  `ContactID` int DEFAULT NULL,
  `SalesRepID` int DEFAULT NULL,
  `ShippingAddress` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ExpectedDeliveryDate` date DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `PriceListID` int DEFAULT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `ShippingCost` decimal(18,2) DEFAULT '0.00',
  `TotalAmount` decimal(18,2) NOT NULL,
  `PaymentTerms` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaymentTermDays` int DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `CreditCheckStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreditCheckBy` int DEFAULT NULL,
  `CreditCheckDate` datetime DEFAULT NULL,
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `OtherCosts` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesorders`
--

INSERT INTO `salesorders` (`SOID`, `SONumber`, `SODate`, `SalesQuotationID`, `CustomerID`, `ContactID`, `SalesRepID`, `ShippingAddress`, `ExpectedDeliveryDate`, `Currency`, `ExchangeRate`, `PriceListID`, `SubTotal`, `DiscountPercentage`, `DiscountAmount`, `TaxAmount`, `ShippingCost`, `TotalAmount`, `PaymentTerms`, `PaymentTermDays`, `Status`, `CreditCheckStatus`, `CreditCheckBy`, `CreditCheckDate`, `ApprovedByUserID`, `ApprovedDate`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalStatus`, `DeliveryCost`, `OtherCosts`) VALUES
(1, 'SO-1771176938728', '2026-02-14 22:00:00', 1, 1, NULL, NULL, NULL, NULL, 'EGP', 1.000000, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '', NULL, 'Draft', NULL, NULL, NULL, NULL, NULL, '', '2026-02-15 17:35:39', 1, '2026-02-15 17:35:39', 1, 'Pending', NULL, NULL),
(2, 'SO-1771233603618', '2026-02-15 22:00:00', 2, 1, NULL, NULL, NULL, '2026-02-25', 'EGP', 1.000000, NULL, 230.40, 0.00, 0.00, 0.00, 0.00, 230.40, '', NULL, 'Draft', NULL, NULL, NULL, NULL, NULL, '', '2026-02-16 09:20:04', 1, '2026-02-16 09:20:04', 1, 'Pending', NULL, NULL),
(3, 'SO-1771318833015', '2026-02-16 22:00:00', 4, 1, NULL, NULL, NULL, '2026-02-23', 'EGP', 1.000000, NULL, 90.00, 0.00, 0.00, 0.00, 0.00, 90.00, '', NULL, 'Draft', NULL, NULL, NULL, NULL, NULL, '', '2026-02-17 09:00:33', 1, '2026-02-17 09:00:33', 1, 'Pending', NULL, NULL),
(4, 'SO-1771526039631', '2026-02-18 22:00:00', 6, 1, NULL, NULL, NULL, NULL, 'EGP', 1.000000, NULL, 900.00, 0.00, 0.00, 126.00, 0.00, 1026.00, '', NULL, 'Draft', NULL, NULL, NULL, NULL, NULL, '', '2026-02-19 18:34:00', 1, '2026-02-19 18:34:00', 1, 'Pending', NULL, NULL),
(5, 'SO-1771526616132', '2026-02-18 22:00:00', 3, 1, NULL, NULL, NULL, NULL, 'EGP', 1.000000, NULL, 62.00, 0.00, 0.00, 0.00, 0.00, 62.00, '', NULL, 'Draft', NULL, NULL, NULL, NULL, NULL, '', '2026-02-19 18:43:36', 1, '2026-02-19 18:43:36', 1, 'Pending', NULL, NULL),
(6, 'SO-1771527235295', '2026-02-18 22:00:00', 8, 1, NULL, NULL, NULL, NULL, 'EGP', 1.000000, NULL, 540.00, 0.00, 0.00, 75.60, 0.00, 615.60, '', NULL, 'Approved', NULL, NULL, NULL, 1, '2026-02-19 18:54:39', '', '2026-02-19 18:53:55', 1, '2026-02-19 18:54:39', 1, 'Approved', NULL, NULL),
(7, 'SO-1771622157587', '2026-02-19 22:00:00', 9, 1, NULL, NULL, NULL, NULL, 'EGP', 1.000000, NULL, 10019.00, 0.00, 0.00, 1402.66, 0.00, 12921.66, '', NULL, 'Approved', NULL, NULL, NULL, 1, '2026-02-20 21:35:14', '', '2026-02-20 21:15:58', 1, '2026-02-20 21:35:14', 1, 'Approved', 1000.00, 500.00),
(8, 'SO-1771666086539', '2026-02-20 22:00:00', 7, 1, NULL, NULL, NULL, NULL, 'EGP', 1.000000, NULL, 85.50, 0.00, 0.00, 11.97, 0.00, 397.47, '', NULL, 'Approved', NULL, NULL, NULL, 1, '2026-02-21 09:28:26', '', '2026-02-21 09:28:07', 1, '2026-02-21 09:28:26', 1, 'Approved', 200.00, 100.00),
(9, 'SO-1771667618676', '2026-02-20 22:00:00', 5, 1, NULL, NULL, NULL, '2026-02-27', 'EGP', 1.000000, NULL, 90.00, 0.00, 0.00, 12.60, 0.00, 102.60, '', NULL, 'Approved', NULL, NULL, NULL, 1, '2026-02-21 09:53:53', '', '2026-02-21 09:53:39', 1, '2026-02-21 09:53:53', 1, 'Approved', 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `salesquotationitems`
--

CREATE TABLE `salesquotationitems` (
  `SQItemID` int NOT NULL,
  `SalesQuotationID` int NOT NULL,
  `ItemID` int NOT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxPercentage` decimal(5,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalPrice` decimal(18,2) NOT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesquotationitems`
--

INSERT INTO `salesquotationitems` (`SQItemID`, `SalesQuotationID`, `ItemID`, `Description`, `Quantity`, `UnitID`, `UnitPrice`, `DiscountPercentage`, `DiscountAmount`, `TaxPercentage`, `TaxAmount`, `TotalPrice`, `Notes`) VALUES
(1, 1, 1, NULL, 4.001, 14, 0.0000, 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(2, 2, 1, NULL, 5.000, 14, 48.0000, 4.00, 0.00, 0.00, 0.00, 230.40, NULL),
(3, 3, 1, NULL, 1.000, 14, 62.0000, 0.00, 0.00, 0.00, 0.00, 62.00, NULL),
(4, 4, 1, NULL, 1.000, 14, 90.0000, 0.00, 0.00, 0.00, 0.00, 90.00, NULL),
(5, 5, 1, NULL, 1.000, 14, 90.0000, 0.00, 0.00, 14.00, 0.00, 102.60, NULL),
(6, 6, 1, NULL, 10.000, 14, 90.0000, 0.00, 0.00, 14.00, 0.00, 1026.00, NULL),
(7, 7, 1, NULL, 1.000, 14, 90.0000, 0.00, 0.00, 14.00, 0.00, 102.60, NULL),
(8, 8, 1, NULL, 6.000, 14, 90.0000, 0.00, 0.00, 14.00, 0.00, 540.00, NULL),
(9, 9, 1, NULL, 6.000, 14, 90.0000, 5.00, 0.00, 14.00, 0.00, 584.82, NULL),
(10, 9, 2, NULL, 7.000, 11, 1400.0000, 3.00, 0.00, 14.00, 0.00, 10836.84, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `salesquotations`
--

CREATE TABLE `salesquotations` (
  `SalesQuotationID` int NOT NULL,
  `QuotationNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `QuotationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ValidUntilDate` date NOT NULL,
  `CustomerID` int NOT NULL,
  `ContactID` int DEFAULT NULL,
  `SalesRepID` int DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `PriceListID` int DEFAULT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalAmount` decimal(18,2) NOT NULL,
  `PaymentTerms` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DeliveryTerms` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `SentDate` datetime DEFAULT NULL,
  `AcceptedDate` datetime DEFAULT NULL,
  `RejectedReason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TermsAndConditions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `OtherCosts` decimal(18,2) DEFAULT NULL,
  `RequestID` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesquotations`
--

INSERT INTO `salesquotations` (`SalesQuotationID`, `QuotationNumber`, `QuotationDate`, `ValidUntilDate`, `CustomerID`, `ContactID`, `SalesRepID`, `Currency`, `ExchangeRate`, `PriceListID`, `SubTotal`, `DiscountPercentage`, `DiscountAmount`, `TaxAmount`, `TotalAmount`, `PaymentTerms`, `DeliveryTerms`, `Status`, `SentDate`, `AcceptedDate`, `RejectedReason`, `Notes`, `TermsAndConditions`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalStatus`, `DeliveryCost`, `OtherCosts`, `RequestID`) VALUES
(1, 'SQ-1771176922100', '2026-02-14 22:00:00', '2026-02-20', 1, NULL, NULL, 'EGP', 1.000000, 11, 0.00, 0.00, 0.00, 0.00, 0.00, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-15 17:35:22', 1, '2026-02-19 18:26:30', 1, 'Approved', NULL, NULL, NULL),
(2, 'SQ-1771233573320', '2026-02-25 22:00:00', '2026-02-26', 1, NULL, NULL, 'EGP', 1.000000, 11, 230.40, 0.00, 0.00, 0.00, 230.40, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-16 09:19:33', 1, '2026-02-19 18:18:33', 1, 'Approved', NULL, NULL, NULL),
(3, 'SQ-1771270233129', '2026-02-15 22:00:00', '2026-03-12', 1, NULL, NULL, 'EGP', 1.000000, 11, 62.00, 0.00, 0.00, 0.00, 62.00, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-16 19:30:33', 1, '2026-02-19 18:26:31', 1, 'Approved', NULL, NULL, NULL),
(4, 'SQ-1771318794368', '2026-02-16 22:00:00', '2026-02-28', 1, NULL, NULL, 'EGP', 1.000000, 11, 90.00, 0.00, 0.00, 0.00, 90.00, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-17 08:59:54', 1, '2026-02-19 18:26:33', 1, 'Approved', NULL, NULL, NULL),
(5, 'SQ-1771502470558', '2026-02-18 22:00:00', '2026-02-27', 1, NULL, NULL, 'EGP', 1.000000, NULL, 90.00, 0.00, 0.00, 12.60, 102.60, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-19 12:01:11', 1, '2026-02-19 18:18:28', 1, 'Approved', 0.00, 0.00, 7),
(6, 'SQ-1771503819833', '2026-02-18 22:00:00', '2026-02-24', 1, NULL, NULL, 'EGP', 1.000000, NULL, 900.00, 0.00, 0.00, 126.00, 1026.00, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-19 12:23:40', 1, '2026-02-19 18:18:29', 1, 'Approved', 0.00, 0.00, 8),
(7, 'SQ-1771525081586', '2026-02-18 22:00:00', '2026-02-21', 1, NULL, NULL, 'EGP', 1.000000, 11, 90.00, 0.00, 0.00, 12.60, 102.60, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-19 18:18:02', 1, '2026-02-19 18:18:31', 1, 'Approved', 0.00, 0.00, 6),
(8, 'SQ-1771526886219', '2026-02-18 22:00:00', '2026-02-28', 1, NULL, NULL, 'EGP', 1.000000, NULL, 540.00, 0.00, 0.00, 75.60, 615.60, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-19 18:48:06', 1, '2026-02-19 18:48:17', 1, 'Approved', 0.00, 0.00, 9),
(9, 'SQ-1771619093474', '2026-02-19 22:00:00', '2026-02-22', 1, NULL, NULL, 'EGP', 1.000000, 11, 10019.00, 0.00, 321.00, 1402.66, 12921.66, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-20 20:24:54', 1, '2026-02-20 20:25:43', 1, 'Approved', 1000.00, 500.00, 11);

-- --------------------------------------------------------

--
-- Table structure for table `salesreturnitems`
--

CREATE TABLE `salesreturnitems` (
  `ReturnItemID` int NOT NULL,
  `SalesReturnID` int NOT NULL,
  `InvoiceItemID` int DEFAULT NULL,
  `ItemID` int NOT NULL,
  `ReturnedQty` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `TaxPercentage` decimal(5,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalPrice` decimal(18,2) NOT NULL,
  `ReturnReason` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `QualityStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LocationID` int DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesreturns`
--

CREATE TABLE `salesreturns` (
  `SalesReturnID` int NOT NULL,
  `ReturnNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ReturnDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SalesInvoiceID` int DEFAULT NULL,
  `CustomerID` int NOT NULL,
  `WarehouseID` int NOT NULL,
  `ReturnReason` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalAmount` decimal(18,2) NOT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `CreditNoteID` int DEFAULT NULL,
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `ReceivedByUserID` int NOT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockadjustmentitems`
--

CREATE TABLE `stockadjustmentitems` (
  `AdjItemID` int NOT NULL,
  `AdjustmentID` int NOT NULL,
  `ItemID` int NOT NULL,
  `LocationID` int DEFAULT NULL,
  `LotNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BatchID` int DEFAULT NULL,
  `SystemQty` decimal(18,3) NOT NULL,
  `ActualQty` decimal(18,3) NOT NULL,
  `AdjustmentQty` decimal(18,3) GENERATED ALWAYS AS ((`ActualQty` - `SystemQty`)) STORED,
  `UnitID` int NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `AdjustmentValue` decimal(18,2) DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockadjustments`
--

CREATE TABLE `stockadjustments` (
  `AdjustmentID` int NOT NULL,
  `AdjustmentNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `AdjustmentDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `WarehouseID` int NOT NULL,
  `AdjustmentType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `PostedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockbalances`
--

CREATE TABLE `stockbalances` (
  `StockBalanceID` int NOT NULL,
  `ItemID` int NOT NULL,
  `WarehouseID` int NOT NULL,
  `LocationID` int DEFAULT NULL,
  `LotNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BatchID` int DEFAULT NULL,
  `QuantityOnHand` decimal(18,3) NOT NULL DEFAULT '0.000',
  `QuantityReserved` decimal(18,3) NOT NULL DEFAULT '0.000',
  `AvailableQty` decimal(18,3) GENERATED ALWAYS AS ((`QuantityOnHand` - `QuantityReserved`)) STORED,
  `AverageCost` decimal(18,4) DEFAULT NULL,
  `LastMovementDate` datetime DEFAULT NULL,
  `LastCountDate` date DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stockbalances`
--

INSERT INTO `stockbalances` (`StockBalanceID`, `ItemID`, `WarehouseID`, `LocationID`, `LotNumber`, `BatchID`, `QuantityOnHand`, `QuantityReserved`, `AverageCost`, `LastMovementDate`, `LastCountDate`, `UpdatedAt`) VALUES
(4, 1, 3, NULL, NULL, NULL, 126.999, 0.000, 5185.1866, '2026-02-21 09:54:42', NULL, '2026-02-21 09:54:42'),
(5, 2, 3, NULL, NULL, NULL, 505.000, 0.000, 6500.0000, '2026-02-21 09:12:20', NULL, '2026-02-21 09:12:20');

-- --------------------------------------------------------

--
-- Table structure for table `stockissuenoteitems`
--

CREATE TABLE `stockissuenoteitems` (
  `IssueItemID` int NOT NULL,
  `IssueNoteID` int NOT NULL,
  `SOItemID` int NOT NULL,
  `ItemID` int NOT NULL,
  `RequestedQty` decimal(18,3) NOT NULL,
  `IssuedQty` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `TotalCost` decimal(18,2) DEFAULT NULL,
  `LotNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BatchID` int DEFAULT NULL,
  `LocationID` int DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stockissuenoteitems`
--

INSERT INTO `stockissuenoteitems` (`IssueItemID`, `IssueNoteID`, `SOItemID`, `ItemID`, `RequestedQty`, `IssuedQty`, `UnitID`, `UnitCost`, `TotalCost`, `LotNumber`, `BatchID`, `LocationID`, `Notes`) VALUES
(2, 1, 1, 1, 4.001, 4.001, 14, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 2, 2, 1, 5.000, 5.000, 14, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 3, 3, 1, 1.000, 1.000, 14, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 4, 6, 1, 6.000, 6.000, 14, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 5, 7, 1, 6.000, 6.000, 14, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 5, 8, 2, 7.000, 7.000, 11, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 7, 9, 1, 1.000, 1.000, 14, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 8, 10, 1, 1.000, 1.000, 14, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stockissuenotes`
--

CREATE TABLE `stockissuenotes` (
  `IssueNoteID` int NOT NULL,
  `IssueNoteNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `IssueDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SOID` int NOT NULL,
  `CustomerID` int NOT NULL,
  `WarehouseID` int NOT NULL,
  `IssuedByUserID` int NOT NULL,
  `ReceivedByName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReceivedByID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReceivedBySignature` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `VehicleNo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DriverName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `DeliveryDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `IssueType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceID` int DEFAULT NULL,
  `ReferenceNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stockissuenotes`
--

INSERT INTO `stockissuenotes` (`IssueNoteID`, `IssueNoteNumber`, `IssueDate`, `SOID`, `CustomerID`, `WarehouseID`, `IssuedByUserID`, `ReceivedByName`, `ReceivedByID`, `ReceivedBySignature`, `VehicleNo`, `DriverName`, `Status`, `DeliveryDate`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `IssueType`, `ReferenceID`, `ReferenceNumber`, `ReferenceType`, `ApprovalStatus`) VALUES
(1, 'SIN-1771177208835', '2026-02-15 17:40:09', 1, 1, 3, 1, NULL, NULL, NULL, NULL, NULL, 'Approved', NULL, NULL, '2026-02-15 17:40:09', 1, '2026-02-15 17:40:46', 1, 'SALE_ORDER', NULL, NULL, NULL, 'Pending'),
(2, 'SIN-1771233653827', '2026-02-16 09:20:54', 2, 1, 3, 1, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL, NULL, '2026-02-16 09:20:54', 1, '2026-02-16 09:21:12', 1, 'SALE_ORDER', NULL, NULL, NULL, 'Pending'),
(3, 'SIN-1771318928330', '2026-02-17 09:02:08', 3, 1, 3, 1, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL, NULL, '2026-02-17 09:02:08', 1, '2026-02-17 09:02:11', 1, 'SALE_ORDER', NULL, NULL, NULL, 'Pending'),
(4, 'SIN-1771527436129', '2026-02-19 18:57:16', 6, 1, 3, 1, NULL, NULL, NULL, NULL, NULL, 'Approved', NULL, NULL, '2026-02-19 18:57:16', 1, '2026-02-19 19:04:13', 1, 'SALE_ORDER', NULL, NULL, NULL, 'Pending'),
(5, 'SIN-1771623428388', '2026-02-20 21:37:08', 7, 1, 3, 1, NULL, NULL, NULL, NULL, NULL, 'Pending', NULL, NULL, '2026-02-20 21:37:08', 1, '2026-02-20 21:37:13', 1, 'SALE_ORDER', NULL, NULL, NULL, 'Pending'),
(7, 'SIN-1771667453412', '2026-02-21 09:50:53', 8, 1, 3, 1, NULL, NULL, NULL, NULL, NULL, 'Approved', NULL, NULL, '2026-02-21 09:50:53', 1, '2026-02-21 09:50:53', 1, 'SALE_ORDER', NULL, NULL, NULL, 'Pending'),
(8, 'SIN-1771667653762', '2026-02-21 09:54:14', 9, 1, 3, 1, NULL, NULL, NULL, NULL, NULL, 'Approved', NULL, NULL, '2026-02-21 09:54:14', 1, '2026-02-21 09:54:42', 1, 'SALE_ORDER', NULL, NULL, NULL, 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `stockmovements`
--

CREATE TABLE `stockmovements` (
  `MovementID` bigint NOT NULL,
  `MovementDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `MovementType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ReferenceType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReferenceID` int DEFAULT NULL,
  `ReferenceNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ItemID` int NOT NULL,
  `WarehouseID` int NOT NULL,
  `LocationID` int DEFAULT NULL,
  `LotNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BatchID` int DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  `Direction` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `TotalCost` decimal(18,2) DEFAULT NULL,
  `BalanceBefore` decimal(18,3) DEFAULT NULL,
  `BalanceAfter` decimal(18,3) DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stockmovements`
--

INSERT INTO `stockmovements` (`MovementID`, `MovementDate`, `MovementType`, `ReferenceType`, `ReferenceID`, `ReferenceNumber`, `ItemID`, `WarehouseID`, `LocationID`, `LotNumber`, `BatchID`, `Quantity`, `Direction`, `UnitCost`, `TotalCost`, `BalanceBefore`, `BalanceAfter`, `Notes`, `CreatedAt`, `CreatedBy`) VALUES
(7, '2026-02-15 10:38:17', 'GRN', 'GoodsReceiptNote', 7, '#GRN-1', 1, 3, NULL, NULL, NULL, 1.000, 'IN', 5000.0000, 5000.00, 0.000, 1.000, NULL, '2026-02-15 10:38:17', 1),
(8, '2026-02-15 17:39:36', 'GRN', 'GoodsReceiptNote', 8, '#GRN-2', 1, 3, NULL, NULL, NULL, 80.000, 'IN', 5000.0000, 400000.00, 1.000, 81.000, NULL, '2026-02-15 17:39:36', 1),
(9, '2026-02-15 17:40:46', 'ISSUE', 'StockIssueNote', 1, 'SIN-1771177208835', 1, 3, NULL, NULL, NULL, 4.001, 'OUT', 0.0000, 0.00, 81.000, 76.999, NULL, '2026-02-15 17:40:46', 1),
(10, '2026-02-16 11:30:38', 'GRN', 'GoodsReceiptNote', 9, '#GRN-3', 1, 3, NULL, NULL, NULL, 3.000, 'IN', 10000.0000, 30000.00, 76.999, 79.999, NULL, '2026-02-16 11:30:38', 1),
(11, '2026-02-16 18:50:18', 'GRN', 'GoodsReceiptNote', 10, '#GRN-4', 1, 3, NULL, NULL, NULL, 5.000, 'IN', 7000.0000, 35000.00, 79.999, 84.999, NULL, '2026-02-16 18:50:18', 1),
(12, '2026-02-17 19:37:27', 'GRN', 'GoodsReceiptNote', 11, '#GRN-5', 1, 3, NULL, NULL, NULL, 50.000, 'IN', 5000.0000, 250000.00, 84.999, 134.999, NULL, '2026-02-17 19:37:27', 1),
(13, '2026-02-19 19:04:13', 'ISSUE', 'StockIssueNote', 4, 'SIN-1771527436129', 1, 3, NULL, NULL, NULL, 6.000, 'OUT', 0.0000, 0.00, 134.999, 128.999, NULL, '2026-02-19 19:04:13', 1),
(14, '2026-02-21 08:48:40', 'GRN', 'GoodsReceiptNote', 12, '#GRN-6', 2, 3, NULL, NULL, NULL, 5.000, 'IN', 6500.0000, 32500.00, 0.000, 5.000, NULL, '2026-02-21 08:48:40', 1),
(15, '2026-02-21 09:12:20', 'GRN', 'GoodsReceiptNote', 13, '#GRN-7', 2, 3, NULL, NULL, NULL, 500.000, 'IN', 6500.0000, 3250000.00, 5.000, 505.000, NULL, '2026-02-21 09:12:20', 1),
(16, '2026-02-21 09:50:53', 'ISSUE', 'StockIssueNote', 7, 'SIN-1771667453412', 1, 3, NULL, NULL, NULL, 1.000, 'OUT', 0.0000, 0.00, 128.999, 127.999, NULL, '2026-02-21 09:50:53', 1),
(17, '2026-02-21 09:54:42', 'ISSUE', 'StockIssueNote', 8, 'SIN-1771667653762', 1, 3, NULL, NULL, NULL, 1.000, 'OUT', 0.0000, 0.00, 127.999, 126.999, NULL, '2026-02-21 09:54:42', 1);

-- --------------------------------------------------------

--
-- Table structure for table `stockreservations`
--

CREATE TABLE `stockreservations` (
  `ReservationID` int NOT NULL,
  `ItemID` int NOT NULL,
  `WarehouseID` int NOT NULL,
  `ReservedQty` decimal(18,3) NOT NULL,
  `ReferenceType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ReferenceID` int NOT NULL,
  `ReservedByUserID` int NOT NULL,
  `ReservedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `ExpiryDate` datetime DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Active',
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stocktransferitems`
--

CREATE TABLE `stocktransferitems` (
  `TransferItemID` int NOT NULL,
  `TransferID` int NOT NULL,
  `ItemID` int NOT NULL,
  `RequestedQty` decimal(18,3) NOT NULL,
  `TransferredQty` decimal(18,3) DEFAULT NULL,
  `ReceivedQty` decimal(18,3) DEFAULT NULL,
  `UnitID` int NOT NULL,
  `FromLocationID` int DEFAULT NULL,
  `ToLocationID` int DEFAULT NULL,
  `LotNumber` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BatchID` int DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stocktransfers`
--

CREATE TABLE `stocktransfers` (
  `TransferID` int NOT NULL,
  `TransferNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `TransferDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `FromWarehouseID` int NOT NULL,
  `ToWarehouseID` int NOT NULL,
  `RequestedByUserID` int NOT NULL,
  `TransferredByUserID` int DEFAULT NULL,
  `ReceivedByUserID` int DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Draft',
  `ShippedDate` datetime DEFAULT NULL,
  `ReceivedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TransferCostAmount` decimal(18,4) DEFAULT NULL COMMENT 'تكلفة النقل - مصاريف تشغيلية',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suggestedsellingprices`
--

CREATE TABLE `suggestedsellingprices` (
  `SuggestedPriceID` int NOT NULL,
  `ItemID` int NOT NULL,
  `EffectiveDate` date NOT NULL,
  `ReplacementCost` decimal(18,4) DEFAULT NULL,
  `TargetMargin` decimal(5,2) DEFAULT NULL,
  `SuggestedPrice` decimal(18,4) DEFAULT NULL,
  `MinPrice` decimal(18,4) DEFAULT NULL,
  `MaxPrice` decimal(18,4) DEFAULT NULL,
  `IsApproved` tinyint(1) DEFAULT '0',
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplierinvoiceitems`
--

CREATE TABLE `supplierinvoiceitems` (
  `SIItemID` int NOT NULL,
  `SupplierInvoiceID` int NOT NULL,
  `GRNItemID` int DEFAULT NULL,
  `ItemID` int NOT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxPercentage` decimal(5,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalPrice` decimal(18,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplierinvoiceitems`
--

INSERT INTO `supplierinvoiceitems` (`SIItemID`, `SupplierInvoiceID`, `GRNItemID`, `ItemID`, `Description`, `Quantity`, `UnitID`, `UnitPrice`, `DiscountPercentage`, `DiscountAmount`, `TaxPercentage`, `TaxAmount`, `TotalPrice`) VALUES
(53, 7, 52, 1, 'TEST-1012', 1.000, 14, 5000.0000, 3.00, 150.00, 14.00, 679.00, 5529.00),
(54, 8, 53, 1, 'TEST-1012', 80.000, 14, 5000.0000, 10.00, 40000.00, 14.00, 50400.00, 410400.00),
(55, 9, 54, 1, 'TEST-1012', 3.000, 14, 10000.0000, 5.00, 1500.00, 14.00, 3990.00, 32490.00),
(56, 10, 55, 1, 'TEST-1012', 5.000, 14, 7000.0000, 45.00, 15750.00, 14.00, 2695.00, 21945.00),
(57, 11, 56, 1, 'TEST-1012', 50.000, 14, 5000.0000, 6.00, 15000.00, 14.00, 32900.00, 267900.00),
(58, 12, 57, 2, 'صنف 2', 5.000, 11, 6500.0000, 4.00, 1300.00, 14.00, 4368.00, 35568.00),
(59, 13, 58, 2, 'صنف 2', 500.000, 11, 6500.0000, 20.00, 650000.00, 14.00, 364000.00, 2964000.00);

-- --------------------------------------------------------

--
-- Table structure for table `supplierinvoices`
--

CREATE TABLE `supplierinvoices` (
  `SupplierInvoiceID` int NOT NULL,
  `InvoiceNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SupplierInvoiceNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `InvoiceDate` date NOT NULL,
  `DueDate` date NOT NULL,
  `POID` int DEFAULT NULL,
  `GRNID` int DEFAULT NULL,
  `SupplierID` int NOT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalAmount` decimal(18,2) NOT NULL,
  `PaidAmount` decimal(18,2) DEFAULT '0.00',
  `RemainingAmount` decimal(18,2) GENERATED ALWAYS AS ((`TotalAmount` - `PaidAmount`)) STORED,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `VerifiedByUserID` int DEFAULT NULL,
  `VerifiedDate` datetime DEFAULT NULL,
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `PaymentTerms` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `AttachmentPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `OtherCosts` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplierinvoices`
--

INSERT INTO `supplierinvoices` (`SupplierInvoiceID`, `InvoiceNumber`, `SupplierInvoiceNo`, `InvoiceDate`, `DueDate`, `POID`, `GRNID`, `SupplierID`, `Currency`, `ExchangeRate`, `SubTotal`, `DiscountAmount`, `TaxAmount`, `TotalAmount`, `PaidAmount`, `Status`, `VerifiedByUserID`, `VerifiedDate`, `ApprovedByUserID`, `ApprovedDate`, `PaymentTerms`, `Notes`, `AttachmentPath`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalStatus`, `DeliveryCost`, `OtherCosts`) VALUES
(7, '#INV-1', 'AUTO-#GRN-1', '2026-02-15', '2026-03-17', 15, 7, 2, 'EGP', 1.000000, 5000.00, 150.00, 679.00, 8529.00, 8529.00, 'Paid', NULL, NULL, NULL, NULL, NULL, 'Generated automatically from #GRN-1', NULL, '2026-02-15 10:38:17', 1, '2026-02-15 17:34:55', 1, 'Approved', 2000.00, 1000.00),
(8, '#INV-2', 'AUTO-#GRN-2', '2026-02-15', '2026-03-17', 16, 8, 2, 'EGP', 1.000000, 400000.00, 40000.00, 50400.00, 415900.00, 415900.00, 'Paid', NULL, NULL, NULL, NULL, NULL, 'Generated automatically from #GRN-2', NULL, '2026-02-15 17:39:36', 1, '2026-02-15 18:56:08', 1, 'Approved', 5000.00, 500.00),
(9, '#INV-3', 'AUTO-#GRN-3', '2026-02-16', '2026-03-18', 17, 9, 3, 'EGP', 1.000000, 30000.00, 1500.00, 3990.00, 35490.00, 0.00, 'Unpaid', NULL, NULL, NULL, NULL, NULL, 'Generated automatically from #GRN-3', NULL, '2026-02-16 11:30:38', 1, '2026-02-16 11:30:38', 1, 'Approved', 2000.00, 1000.00),
(10, '#INV-4', 'AUTO-#GRN-4', '2026-02-16', '2026-03-18', 18, 10, 4, 'EGP', 1.000000, 35000.00, 15750.00, 2695.00, 26945.00, 26945.00, 'Paid', NULL, NULL, NULL, NULL, NULL, 'Generated automatically from #GRN-4', NULL, '2026-02-16 18:50:18', 1, '2026-02-21 11:10:28', 1, 'Approved', 5000.00, 0.00),
(11, '#INV-5', 'AUTO-#GRN-5', '2026-02-17', '2026-03-19', 19, 11, 2, 'EGP', 1.000000, 250000.00, 15000.00, 32900.00, 282100.00, 282100.00, 'Paid', NULL, NULL, NULL, NULL, NULL, 'Generated automatically from #GRN-5', NULL, '2026-02-17 19:37:27', 1, '2026-02-18 14:45:42', 1, 'Approved', 12000.00, 2200.00),
(12, '#INV-6', 'AUTO-#GRN-6', '2026-02-21', '2026-03-23', 20, 12, 2, 'EGP', 1.000000, 32500.00, 1300.00, 4368.00, 36468.00, 36468.00, 'Paid', NULL, NULL, NULL, NULL, NULL, 'Generated automatically from #GRN-6', NULL, '2026-02-21 08:48:40', 1, '2026-02-21 08:50:01', 1, 'Approved', 500.00, 400.00),
(13, '#INV-7', 'AUTO-#GRN-7', '2026-02-21', '2026-03-23', 21, 13, 2, 'EGP', 1.000000, 3250000.00, 650000.00, 364000.00, 3000000.00, 0.00, 'Unpaid', NULL, NULL, NULL, NULL, NULL, 'Generated automatically from #GRN-7', NULL, '2026-02-21 09:12:20', 1, '2026-02-21 09:12:20', 1, 'Approved', 20000.00, 16000.00);

-- --------------------------------------------------------

--
-- Table structure for table `supplieritems`
--

CREATE TABLE `supplieritems` (
  `SupplierItemID` int NOT NULL,
  `SupplierID` int NOT NULL,
  `ItemID` int NOT NULL,
  `SupplierItemCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LastPrice` decimal(18,4) DEFAULT NULL,
  `LastPriceDate` date DEFAULT NULL,
  `LeadTimeDays` int DEFAULT NULL,
  `MinOrderQty` decimal(18,3) DEFAULT NULL,
  `IsPreferred` tinyint(1) DEFAULT '0',
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplieritems`
--

INSERT INTO `supplieritems` (`SupplierItemID`, `SupplierID`, `ItemID`, `SupplierItemCode`, `LastPrice`, `LastPriceDate`, `LeadTimeDays`, `MinOrderQty`, `IsPreferred`, `IsActive`) VALUES
(42, 2, 1, NULL, 5000.0000, '2026-02-17', NULL, NULL, 0, 1),
(43, 3, 1, NULL, 10000.0000, '2026-02-16', NULL, NULL, 0, 1),
(44, 1, 1, NULL, 2000.0000, '2026-02-16', NULL, NULL, 0, 1),
(45, 4, 1, NULL, 7000.0000, '2026-02-16', NULL, NULL, 0, 1),
(46, 2, 2, NULL, 6500.0000, '2026-02-21', NULL, NULL, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `supplierquotationitems`
--

CREATE TABLE `supplierquotationitems` (
  `SQItemID` int NOT NULL,
  `QuotationID` int NOT NULL,
  `ItemID` int NOT NULL,
  `OfferedQty` decimal(18,3) NOT NULL,
  `UnitID` int NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT '0.00',
  `DiscountAmount` decimal(18,2) DEFAULT '0.00',
  `TaxPercentage` decimal(5,2) DEFAULT '0.00',
  `TaxAmount` decimal(18,2) DEFAULT '0.00',
  `TotalPrice` decimal(18,2) NOT NULL,
  `DeliveryDays` int DEFAULT NULL,
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PolymerGrade` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplierquotationitems`
--

INSERT INTO `supplierquotationitems` (`SQItemID`, `QuotationID`, `ItemID`, `OfferedQty`, `UnitID`, `UnitPrice`, `DiscountPercentage`, `DiscountAmount`, `TaxPercentage`, `TaxAmount`, `TotalPrice`, `DeliveryDays`, `Notes`, `PolymerGrade`) VALUES
(102, 18, 1, 1.000, 14, 5000.0000, 3.00, NULL, 14.00, NULL, 5529.00, NULL, NULL, 'a'),
(103, 19, 1, 80.000, 14, 5000.0000, 10.00, NULL, 14.00, NULL, 410400.00, NULL, NULL, 'c'),
(104, 20, 1, 5.000, 14, 10000.0000, 5.00, NULL, 14.00, NULL, 54150.00, NULL, NULL, 'a'),
(105, 21, 1, 5.000, 14, 2000.0000, 6.00, NULL, 14.00, NULL, 10716.00, NULL, NULL, 'a'),
(106, 22, 1, 5.000, 14, 5000.0000, 5.00, NULL, 14.00, NULL, 27075.00, NULL, NULL, 'c'),
(107, 23, 1, 5.000, 14, 10000.0000, 40.00, NULL, 14.00, NULL, 34200.00, NULL, NULL, 'a'),
(108, 24, 1, 5.000, 14, 7000.0000, 45.00, NULL, 14.00, NULL, 21945.00, NULL, NULL, 'b'),
(109, 25, 1, 100.000, 14, 5000.0000, 6.00, NULL, 14.00, NULL, 535800.00, NULL, NULL, 'a'),
(110, 26, 2, 5.000, 11, 6500.0000, 4.00, NULL, 14.00, NULL, 35568.00, NULL, NULL, 'a'),
(111, 27, 2, 500.000, 11, 6500.0000, 20.00, NULL, 14.00, NULL, 2964000.00, NULL, NULL, 'a');

-- --------------------------------------------------------

--
-- Table structure for table `supplierquotations`
--

CREATE TABLE `supplierquotations` (
  `QuotationID` int NOT NULL,
  `QuotationNumber` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `RFQID` int DEFAULT NULL,
  `SupplierID` int NOT NULL,
  `QuotationDate` date NOT NULL,
  `ValidUntilDate` date DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT '1.000000',
  `PaymentTerms` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DeliveryTerms` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DeliveryDays` int DEFAULT NULL,
  `TotalAmount` decimal(18,2) DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Received',
  `AttachmentPath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ReceivedByUserID` int DEFAULT NULL,
  `ReceivedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `OtherCosts` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplierquotations`
--

INSERT INTO `supplierquotations` (`QuotationID`, `QuotationNumber`, `RFQID`, `SupplierID`, `QuotationDate`, `ValidUntilDate`, `Currency`, `ExchangeRate`, `PaymentTerms`, `DeliveryTerms`, `DeliveryDays`, `TotalAmount`, `Status`, `AttachmentPath`, `Notes`, `ReceivedByUserID`, `ReceivedDate`, `CreatedAt`, `CreatedBy`, `DeliveryCost`, `OtherCosts`) VALUES
(18, 'inv-23467', 28, 2, '2026-02-15', '2026-02-24', 'EGP', 1.000000, '', '', 3, 8529.00, 'Received', NULL, '', NULL, '2026-02-15 10:36:52', '2026-02-15 10:36:52', 1, 2000.00, 1000.00),
(19, 'inv-0024', 29, 2, '2026-02-15', '2026-02-27', 'EGP', 1.000000, '', '', 3, 415900.00, 'Received', NULL, '', NULL, '2026-02-15 17:38:21', '2026-02-15 17:38:21', 1, 5000.00, 500.00),
(20, 'inv-2001', 30, 3, '2026-02-16', '2026-02-21', 'EGP', 1.000000, '', '', 5, 57150.00, 'Received', NULL, '', NULL, '2026-02-16 11:17:02', '2026-02-16 11:17:02', 1, 2000.00, 1000.00),
(21, 'inv-234234', 31, 1, '2026-02-16', '2026-02-25', 'EGP', 1.000000, '', '', 4, 11216.00, 'Received', NULL, '', NULL, '2026-02-16 18:44:45', '2026-02-16 18:44:45', 1, 400.00, 100.00),
(22, 'inv-9924', 32, 2, '2026-02-16', '2026-03-05', 'EGP', 1.000000, '', '', 5, 27375.00, 'Received', NULL, '', NULL, '2026-02-16 18:45:27', '2026-02-16 18:45:27', 1, 100.00, 200.00),
(23, 'inv-24245', 33, 3, '2026-02-16', '2026-02-27', 'EGP', 1.000000, '4', '', 5, 34300.00, 'Received', NULL, '', NULL, '2026-02-16 18:46:17', '2026-02-16 18:46:17', 1, 100.00, 0.00),
(24, 'inv-2342566', 34, 4, '2026-02-16', '2026-02-26', 'EGP', 1.000000, '', '', 4, 26945.00, 'Received', NULL, '', NULL, '2026-02-16 18:48:00', '2026-02-16 18:48:00', 1, 5000.00, 0.00),
(25, 'inv-00923', 35, 2, '2026-02-17', '2026-02-27', 'EGP', 1.000000, '', '', 4, 550000.00, 'Received', NULL, '', NULL, '2026-02-17 18:46:25', '2026-02-17 18:46:25', 1, 12000.00, 2200.00),
(26, 'inv-24455', 36, 2, '2026-02-21', '2026-02-22', 'EGP', 1.000000, '', '', 3, 36468.00, 'Received', NULL, '', NULL, '2026-02-21 08:47:21', '2026-02-21 08:47:21', 1, 500.00, 400.00),
(27, 'inv-23457', 37, 2, '2026-02-21', '2026-02-27', 'EGP', 1.000000, '', '', 5, 3000000.00, 'Received', NULL, '', NULL, '2026-02-21 09:10:57', '2026-02-21 09:10:57', 1, 20000.00, 16000.00);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `SupplierID` int NOT NULL,
  `SupplierCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SupplierNameAr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SupplierNameEn` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SupplierType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TaxRegistrationNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CommercialRegNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `City` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Fax` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Website` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactPerson` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactPhone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `PaymentTermDays` int DEFAULT '0',
  `CreditLimit` decimal(18,2) DEFAULT NULL,
  `Currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EGP',
  `BankName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BankAccountNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IBAN` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Rating` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsApproved` tinyint(1) DEFAULT '0',
  `ApprovedBy` int DEFAULT NULL,
  `ApprovedDate` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `Notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `ApprovalDate` datetime(6) DEFAULT NULL,
  `ApprovalNotes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` enum('DRAFT','PENDING','APPROVED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CurrentBalance` decimal(18,2) DEFAULT NULL,
  `TotalInvoiced` decimal(18,2) DEFAULT NULL,
  `TotalPaid` decimal(18,2) DEFAULT NULL,
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TotalReturned` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`SupplierID`, `SupplierCode`, `SupplierNameAr`, `SupplierNameEn`, `SupplierType`, `TaxRegistrationNo`, `CommercialRegNo`, `Address`, `City`, `Country`, `Phone`, `Fax`, `Email`, `Website`, `ContactPerson`, `ContactPhone`, `PaymentTermDays`, `CreditLimit`, `Currency`, `BankName`, `BankAccountNo`, `IBAN`, `Rating`, `IsApproved`, `ApprovedBy`, `ApprovedDate`, `IsActive`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalDate`, `ApprovalNotes`, `Status`, `CurrentBalance`, `TotalInvoiced`, `TotalPaid`, `ApprovalStatus`, `TotalReturned`) VALUES
(1, 'SUP-1', 'شركة المنال للبلاستيك', 'شركة المنال للبلاستيك', 'International', '555-88-55-66', '2622222', 'شركة المنال للبلاستيك', 'شركة المنال للبلاستيك', 'شركة المنال للبلاستيك', '0597746258', '', 'mohammedshamleh.ps@gmail.com', '', 'شركة المنال للبلاستيك', '0597746852', 10, 0.00, 'EGP', '', '', '', 'B', 1, NULL, NULL, 1, 'شركة المنال للبلاستيك', '2026-02-14 12:32:43', NULL, '2026-02-14 20:46:35', NULL, NULL, NULL, 'APPROVED', 0.00, 0.00, 0.00, 'Approved', 0.00),
(2, 'SUP-2', 'شركة نور للبلاستيك', 'شركة المنال للبلاستيك', 'Local', '55555555555', '5555555', 'شركة المنال للبلاستيك', 'شركة المنال للبلاستيك', 'Egypt', '05977463254', '', 'mohammedshamleh.ps@gmail.com', '', 'شركة المنال للبلاستيك', '0597746325', 10, 0.00, 'EGP', '', '', '', 'B', 1, NULL, NULL, 1, '', '2026-02-14 12:34:13', NULL, '2026-02-21 09:12:20', NULL, NULL, NULL, 'APPROVED', 2750000.00, 3742997.00, 742997.00, 'Approved', 250000.00),
(3, 'SUP-3', 'شركة الهلال للبلاستيك ', 'شركة الهلال للبلاستيك ', 'International', '454545454', 'شركة الهلال للبلاستيك ', 'شركة الهلال للبلاستيك ', 'شركة الهلال للبلاستيك ', 'Egypt', '05977463258', '', 'mohammedshamleh.ps@gmail.com', '', 'شركة الهلال للبلاستيك ', '0597746253', 0, 0.00, 'EGP', '', '', '', 'B', 1, NULL, NULL, 1, '', '2026-02-14 12:35:21', NULL, '2026-02-16 11:30:40', NULL, NULL, NULL, 'APPROVED', 15490.00, 35490.00, 0.00, 'Approved', 20000.00),
(4, 'SUP-4', 'dsf', '', 'Local', '', '', '', '', 'Egypt', '', '', '', '', '', '', 0, 0.00, 'EGP', '', '', '', 'B', 0, NULL, NULL, 1, '', '2026-02-15 10:07:32', NULL, '2026-02-21 11:10:28', NULL, NULL, NULL, 'REJECTED', 0.00, 26945.00, 26945.00, 'Rejected', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `supplier_banks`
--

CREATE TABLE `supplier_banks` (
  `id` int NOT NULL,
  `BankAccountNo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `BankName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IBAN` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsDefault` bit(1) DEFAULT NULL,
  `SWIFT` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SupplierID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier_items`
--

CREATE TABLE `supplier_items` (
  `id` int NOT NULL,
  `IsPreferred` bit(1) DEFAULT NULL,
  `LastPrice` decimal(18,2) DEFAULT NULL,
  `LeadTimeDays` int DEFAULT NULL,
  `SupplierItemCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ItemID` int NOT NULL,
  `SupplierID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `systemsettings`
--

CREATE TABLE `systemsettings` (
  `SettingID` int NOT NULL,
  `SettingGroup` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SettingKey` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SettingValue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `DataType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsEditable` tinyint(1) DEFAULT '1',
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `Category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `systemsettings`
--

INSERT INTO `systemsettings` (`SettingID`, `SettingGroup`, `SettingKey`, `SettingValue`, `DataType`, `Description`, `IsEditable`, `UpdatedAt`, `UpdatedBy`, `Category`) VALUES
(1, 'General', 'DefaultCurrency', 'EGP', 'String', 'العملة الافتراضية', 1, NULL, NULL, NULL),
(2, 'General', 'VATRate', '14.00', 'Decimal', 'نسبة ضريبة القيمة المضافة', 1, NULL, NULL, NULL),
(3, 'General', 'FiscalYearStartMonth', '1', 'Integer', 'شهر بداية السنة المالية', 1, NULL, NULL, NULL),
(4, 'Inventory', 'AllowNegativeStock', 'false', 'Boolean', 'السماح بالرصيد السالب', 1, NULL, NULL, NULL),
(5, 'Inventory', 'DefaultCostingMethod', 'WeightedAverage', 'String', 'طريقة التكلفة الافتراضية', 1, NULL, NULL, NULL),
(6, 'Sales', 'CreditCheckEnabled', 'true', 'Boolean', 'تفعيل فحص الائتمان', 1, NULL, NULL, NULL),
(7, 'Sales', 'MaxDiscountWithoutApproval', '5.00', 'Decimal', 'أقصى نسبة خصم بدون اعتماد', 1, NULL, NULL, NULL),
(8, 'Purchase', 'RequireThreeQuotations', 'false', 'Boolean', 'يجب الحصول على 3 عروض أسعار', 1, '2026-02-14 19:56:10', NULL, NULL),
(9, 'Finance', 'RequirePaymentApproval', 'true', 'Boolean', 'اعتماد سندات الصرف', 1, NULL, NULL, NULL),
(10, 'Finance', 'ChequeSignaturesRequired', '2', 'Integer', 'عدد التوقيعات على الشيك', 1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transportcontractors`
--

CREATE TABLE `transportcontractors` (
  `ContractorID` int NOT NULL,
  `ContractorCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ContractorName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ContactPerson` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `TaxRegistrationNo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Rating` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `unitsofmeasure`
--

CREATE TABLE `unitsofmeasure` (
  `UnitID` int NOT NULL,
  `UnitCode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `UnitNameAr` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `UnitNameEn` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsBaseUnit` tinyint(1) DEFAULT '1',
  `BaseUnitID` int DEFAULT NULL,
  `ConversionFactor` decimal(38,2) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `unitsofmeasure`
--

INSERT INTO `unitsofmeasure` (`UnitID`, `UnitCode`, `UnitNameAr`, `UnitNameEn`, `IsBaseUnit`, `BaseUnitID`, `ConversionFactor`, `IsActive`) VALUES
(10, 'KG', 'كيلوجرام', 'Kilogram', 1, NULL, 1.00, 1),
(11, 'TON', 'طن', 'Ton', 0, 10, 1000.00, 1),
(12, 'PCS', 'قطعة', 'Piece', 1, NULL, 1.00, 1),
(13, 'BAG', 'شيكارة', 'Bag', 1, NULL, 1.00, 1),
(14, 'JN', 'جوينة', 'Kilo bag / Joina', 1, NULL, 1.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int NOT NULL,
  `Username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `PasswordHash` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `EmployeeID` int NOT NULL,
  `RoleID` int NOT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `LastLoginAt` datetime DEFAULT NULL,
  `FailedLoginAttempts` int DEFAULT '0',
  `IsLocked` tinyint(1) DEFAULT '0',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Username`, `PasswordHash`, `EmployeeID`, `RoleID`, `IsActive`, `LastLoginAt`, `FailedLoginAttempts`, `IsLocked`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`) VALUES
(1, 'shady', '$2a$10$JbkgvuqYLKJK9FdDf1vq7uYeQ.Fma2HXlR5CVJWy5nXpt5hawbrEe', 103, 1, 1, '2026-02-21 08:27:16', 0, 0, '2026-01-15 21:15:03', NULL, '2026-02-21 08:27:16', 1),
(3, 'asdfg', '$2a$10$4xfG2I7xZq.gPmeIEIwddexhfEdbPbAnxwQVxoxfJqIQa/RNMsVIi', 104, 4, 1, '2026-01-20 14:03:48', 0, 0, '2026-01-16 20:05:27', NULL, '2026-01-20 14:03:48', NULL),
(4, 'Mohammed', '$2a$10$ykbks64fdVkfS6ZHzb6N/OKPn1EtmTR4lXIcBU24IOIOmH4BUOaya', 105, 10, 1, '2026-02-13 13:30:23', 0, 0, '2026-02-03 18:31:21', 1, '2026-02-13 13:30:23', 1),
(5, 'yazan', '$2a$10$AZCZDRcCPqtMTSwf5djpqOTsgENlhKvVfJ6/1vUDQwYoJdQv32lDi', 106, 5, 1, '2026-02-13 20:25:38', 0, 0, '2026-02-11 09:18:46', 1, '2026-02-13 20:25:38', 1);

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `VehicleID` int NOT NULL,
  `VehicleCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `PlateNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `VehicleType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Brand` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Model` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Capacity` decimal(10,2) DEFAULT NULL,
  `OwnershipType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DriverID` int DEFAULT NULL,
  `LicenseExpiry` date DEFAULT NULL,
  `InsuranceExpiry` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `Notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` datetime(6) DEFAULT NULL,
  `CreatedBy` int DEFAULT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL,
  `UpdatedBy` int DEFAULT NULL,
  `DriverName` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DriverPhone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`VehicleID`, `VehicleCode`, `PlateNumber`, `VehicleType`, `Brand`, `Model`, `Year`, `Capacity`, `OwnershipType`, `DriverID`, `LicenseExpiry`, `InsuranceExpiry`, `IsActive`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `DriverName`, `DriverPhone`) VALUES
(2, 'veh-234', '345435', '', '', '', 2026, 0.00, 'Owned', NULL, NULL, NULL, 1, '', NULL, NULL, NULL, NULL, NULL, NULL),
(3, '435345', '34324', '', '', '', 2026, 0.00, 'Owned', NULL, NULL, NULL, 1, '', NULL, NULL, NULL, NULL, 'sohial', '05966452342');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_customeroutstanding`
-- (See below for the actual view)
--
CREATE TABLE `vw_customeroutstanding` (
`AvailableCredit` decimal(42,2)
,`CreditLimit` decimal(38,2)
,`CustomerCode` varchar(20)
,`CustomerID` int
,`CustomerNameAr` varchar(200)
,`CustomerType` varchar(20)
,`OutstandingBalance` decimal(41,2)
,`OverdueInvoices` decimal(23,0)
,`TotalInvoiced` decimal(40,2)
,`TotalPaid` decimal(40,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_dailysalessummary`
-- (See below for the actual view)
--
CREATE TABLE `vw_dailysalessummary` (
`InvoiceCount` bigint
,`SalesDate` date
,`SubTotal` decimal(40,2)
,`TotalCollected` decimal(40,2)
,`TotalDiscount` decimal(40,2)
,`TotalOutstanding` decimal(41,2)
,`TotalSales` decimal(40,2)
,`TotalTax` decimal(40,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_pendingapprovals`
-- (See below for the actual view)
--
CREATE TABLE `vw_pendingapprovals` (
`CurrentStep` varchar(100)
,`DocumentID` int
,`DocumentNumber` varchar(30)
,`DocumentType` varchar(30)
,`DueDate` datetime
,`Priority` varchar(10)
,`RequestedByName` varchar(101)
,`RequestedByUser` varchar(50)
,`RequestedDate` datetime
,`RequestID` int
,`TotalAmount` decimal(18,2)
,`WorkflowName` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_purchaseorderstatus`
-- (See below for the actual view)
--
CREATE TABLE `vw_purchaseorderstatus` (
`ApprovalStatus` varchar(20)
,`PODate` datetime
,`POID` int
,`PONumber` varchar(20)
,`ReceiptStatus` varchar(19)
,`Status` varchar(20)
,`SupplierNameAr` varchar(200)
,`TotalAmount` decimal(18,2)
,`TotalItems` bigint
,`TotalOrderedQty` decimal(40,3)
,`TotalReceivedQty` decimal(40,3)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_stocksummary`
-- (See below for the actual view)
--
CREATE TABLE `vw_stocksummary` (
`AverageCost` decimal(22,8)
,`GradeName` varchar(255)
,`ItemCode` varchar(30)
,`ItemID` int
,`ItemNameAr` varchar(200)
,`StockValue` decimal(59,7)
,`TotalQuantityAvailable` decimal(41,3)
,`TotalQuantityOnHand` decimal(40,3)
,`TotalQuantityReserved` decimal(40,3)
,`WarehouseID` int
,`WarehouseNameAr` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_supplieroutstanding`
-- (See below for the actual view)
--
CREATE TABLE `vw_supplieroutstanding` (
`OutstandingBalance` decimal(41,2)
,`OverdueInvoices` decimal(23,0)
,`SupplierCode` varchar(20)
,`SupplierID` int
,`SupplierNameAr` varchar(200)
,`SupplierType` varchar(20)
,`TotalInvoiced` decimal(40,2)
,`TotalPaid` decimal(40,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `warehouselocations`
--

CREATE TABLE `warehouselocations` (
  `LocationID` int NOT NULL,
  `WarehouseID` int NOT NULL,
  `LocationCode` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `LocationName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Row` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Shelf` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Bin` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `WarehouseID` int NOT NULL,
  `WarehouseCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `WarehouseNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `WarehouseNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `WarehouseType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ManagerID` int DEFAULT NULL,
  `Phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`WarehouseID`, `WarehouseCode`, `WarehouseNameAr`, `WarehouseNameEn`, `WarehouseType`, `Address`, `ManagerID`, `Phone`, `IsActive`, `CreatedAt`) VALUES
(3, 'WH-01', 'المستودع الرئيسي', 'Main Warehouse', 'MAIN', '', 103, '', 1, '2026-02-04 20:41:04'),
(4, 'ؤؤؤؤ', 'ؤؤؤؤؤؤؤؤ', 'ؤؤؤؤؤؤؤؤؤؤؤ', 'MAIN', 'ؤؤؤؤؤؤؤؤؤؤؤ0597746349', 105, '0597746349', 1, '2026-02-08 21:13:40');

-- --------------------------------------------------------

--
-- Table structure for table `workshifts`
--

CREATE TABLE `workshifts` (
  `ShiftID` int NOT NULL,
  `CreatedAt` datetime(6) DEFAULT NULL,
  `EndTime` time(6) NOT NULL,
  `GraceMinutes` int NOT NULL,
  `IsActive` bit(1) NOT NULL,
  `IsNightShift` bit(1) NOT NULL,
  `ShiftCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ShiftNameAr` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ShiftNameEn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `StartTime` time(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alertrules`
--
ALTER TABLE `alertrules`
  ADD PRIMARY KEY (`AlertRuleID`),
  ADD UNIQUE KEY `RuleCode` (`RuleCode`),
  ADD KEY `FK_AlertRule_Role` (`NotifyRoleID`),
  ADD KEY `FK_AlertRule_User` (`NotifyUserID`);

--
-- Indexes for table `approvalactions`
--
ALTER TABLE `approvalactions`
  ADD PRIMARY KEY (`ActionID`),
  ADD KEY `FK_ApprovalAction_Request` (`RequestID`),
  ADD KEY `FK_ApprovalAction_Step` (`StepID`),
  ADD KEY `FK_ApprovalAction_User` (`ActionByUserID`),
  ADD KEY `FK_ApprovalAction_Delegate` (`DelegatedToUserID`);

--
-- Indexes for table `approvallimits`
--
ALTER TABLE `approvallimits`
  ADD PRIMARY KEY (`ApprovalLimitID`),
  ADD KEY `FK_ApprovalLimits_Role` (`RoleID`),
  ADD KEY `FK_ApprovalLimits_ReviewRole` (`RequiresReviewBy`);

--
-- Indexes for table `approvalrequests`
--
ALTER TABLE `approvalrequests`
  ADD PRIMARY KEY (`RequestID`),
  ADD KEY `FK_ApprovalReq_Workflow` (`WorkflowID`),
  ADD KEY `FK_ApprovalReq_Step` (`CurrentStepID`),
  ADD KEY `FK_ApprovalReq_User` (`RequestedByUserID`),
  ADD KEY `IX_ApprovalReq_Status` (`Status`),
  ADD KEY `IX_ApprovalReq_Document` (`DocumentType`,`DocumentID`);

--
-- Indexes for table `approvalworkflows`
--
ALTER TABLE `approvalworkflows`
  ADD PRIMARY KEY (`WorkflowID`),
  ADD UNIQUE KEY `WorkflowCode` (`WorkflowCode`);

--
-- Indexes for table `approvalworkflowsteps`
--
ALTER TABLE `approvalworkflowsteps`
  ADD PRIMARY KEY (`StepID`),
  ADD KEY `FK_WFStep_Workflow` (`WorkflowID`),
  ADD KEY `FK_WFStep_Role` (`ApproverRoleID`),
  ADD KEY `FK_WFStep_User` (`ApproverUserID`),
  ADD KEY `FKpje52pjw9r3gv29ngjgo0muxq` (`EscalateToStepID`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`AttendanceID`),
  ADD UNIQUE KEY `UQ_Attendance` (`EmployeeID`,`AttendanceDate`);

--
-- Indexes for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`AuditLogID`),
  ADD KEY `IX_AuditLog_Table` (`TableName`,`RecordID`),
  ADD KEY `IX_AuditLog_Date` (`ActionDate`),
  ADD KEY `IX_AuditLog_User` (`UserID`);

--
-- Indexes for table `bankaccounts`
--
ALTER TABLE `bankaccounts`
  ADD PRIMARY KEY (`BankAccountID`),
  ADD KEY `FK_BankAcc_Bank` (`BankID`),
  ADD KEY `FK_BankAcc_GLAccount` (`GLAccountID`);

--
-- Indexes for table `banks`
--
ALTER TABLE `banks`
  ADD PRIMARY KEY (`BankID`),
  ADD UNIQUE KEY `BankCode` (`BankCode`);

--
-- Indexes for table `banktransactions`
--
ALTER TABLE `banktransactions`
  ADD PRIMARY KEY (`TransactionID`),
  ADD KEY `FK_BankTrans_Account` (`BankAccountID`),
  ADD KEY `FK_BankTrans_JE` (`JournalEntryID`),
  ADD KEY `IX_BankTrans_Date` (`TransactionDate`);

--
-- Indexes for table `cashregisters`
--
ALTER TABLE `cashregisters`
  ADD PRIMARY KEY (`CashRegisterID`),
  ADD UNIQUE KEY `RegisterCode` (`RegisterCode`),
  ADD KEY `FK_Cash_Custodian` (`CustodianID`),
  ADD KEY `FK_Cash_GLAccount` (`GLAccountID`);

--
-- Indexes for table `chartofaccounts`
--
ALTER TABLE `chartofaccounts`
  ADD PRIMARY KEY (`AccountID`),
  ADD UNIQUE KEY `AccountCode` (`AccountCode`),
  ADD KEY `FK_COA_Parent` (`ParentAccountID`);

--
-- Indexes for table `chequesissued`
--
ALTER TABLE `chequesissued`
  ADD PRIMARY KEY (`ChequeID`),
  ADD KEY `FK_ChequeIss_Bank` (`BankAccountID`),
  ADD KEY `FK_ChequeIss_Supplier` (`SupplierID`),
  ADD KEY `FK_ChequeIss_Payment` (`PaymentVoucherID`);

--
-- Indexes for table `chequesreceived`
--
ALTER TABLE `chequesreceived`
  ADD PRIMARY KEY (`ChequeID`),
  ADD KEY `FK_ChequeRec_Customer` (`CustomerID`),
  ADD KEY `FK_ChequeRec_Receipt` (`ReceiptVoucherID`),
  ADD KEY `FK_ChequeRec_Bank` (`CollectionBankAccountID`),
  ADD KEY `FK_ChequeRec_Endorsed` (`EndorsedToSupplierID`);

--
-- Indexes for table `companyinfo`
--
ALTER TABLE `companyinfo`
  ADD PRIMARY KEY (`CompanyID`);

--
-- Indexes for table `costcenters`
--
ALTER TABLE `costcenters`
  ADD PRIMARY KEY (`CostCenterID`),
  ADD UNIQUE KEY `CostCenterCode` (`CostCenterCode`),
  ADD KEY `FK_CC_Parent` (`ParentCostCenterID`),
  ADD KEY `FK_CC_Dept` (`DepartmentID`);

--
-- Indexes for table `creditnotes`
--
ALTER TABLE `creditnotes`
  ADD PRIMARY KEY (`CreditNoteID`),
  ADD UNIQUE KEY `CreditNoteNumber` (`CreditNoteNumber`),
  ADD KEY `FK_CreditNote_Customer` (`CustomerID`),
  ADD KEY `FK_CreditNote_Return` (`SalesReturnID`),
  ADD KEY `FK_CreditNote_Invoice` (`SalesInvoiceID`),
  ADD KEY `FK_CreditNote_JE` (`JournalEntryID`),
  ADD KEY `FK_CreditNote_ApprovedBy` (`ApprovedByUserID`);

--
-- Indexes for table `customercontacts`
--
ALTER TABLE `customercontacts`
  ADD PRIMARY KEY (`ContactID`),
  ADD KEY `FK_CustomerContacts_Customer` (`CustomerID`);

--
-- Indexes for table `customerrequestdeliveryschedules`
--
ALTER TABLE `customerrequestdeliveryschedules`
  ADD PRIMARY KEY (`scheduleId`),
  ADD KEY `FKqxowggh5qy941py4v9xpodn1` (`RequestID`);

--
-- Indexes for table `customerrequestitems`
--
ALTER TABLE `customerrequestitems`
  ADD PRIMARY KEY (`itemId`),
  ADD KEY `FK4ofhtly2plh49k3qu4t33f28a` (`RequestID`);

--
-- Indexes for table `customerrequests`
--
ALTER TABLE `customerrequests`
  ADD PRIMARY KEY (`requestId`),
  ADD UNIQUE KEY `UK_eltsiggw4odtf7c8xu7m9tcre` (`requestNumber`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`CustomerID`),
  ADD UNIQUE KEY `CustomerCode` (`CustomerCode`),
  ADD KEY `FK_Customers_SalesRep` (`SalesRepID`),
  ADD KEY `FK_Customers_ApprovedBy` (`ApprovedBy`);

--
-- Indexes for table `dailymarketprices`
--
ALTER TABLE `dailymarketprices`
  ADD PRIMARY KEY (`PriceID`),
  ADD UNIQUE KEY `UQ_DailyPrice` (`PriceDate`,`ItemID`),
  ADD KEY `FK_MarketPrice_Item` (`ItemID`);

--
-- Indexes for table `debitnotes`
--
ALTER TABLE `debitnotes`
  ADD PRIMARY KEY (`DebitNoteID`),
  ADD UNIQUE KEY `DebitNoteNumber` (`DebitNoteNumber`),
  ADD KEY `FK_DebitNote_Supplier` (`SupplierID`),
  ADD KEY `FK_DebitNote_Return` (`PurchaseReturnID`),
  ADD KEY `FK_DebitNote_Invoice` (`SupplierInvoiceID`),
  ADD KEY `FK_DebitNote_JE` (`JournalEntryID`),
  ADD KEY `FK_DebitNote_ApprovedBy` (`ApprovedByUserID`);

--
-- Indexes for table `deliveryorders`
--
ALTER TABLE `deliveryorders`
  ADD PRIMARY KEY (`DeliveryOrderID`),
  ADD UNIQUE KEY `DeliveryOrderNumber` (`DeliveryOrderNumber`),
  ADD KEY `FK_DO_IssueNote` (`IssueNoteID`),
  ADD KEY `FK_DO_Customer` (`CustomerID`),
  ADD KEY `FK_DO_Zone` (`ZoneID`),
  ADD KEY `FK_DO_Vehicle` (`VehicleID`),
  ADD KEY `FK_DO_Contractor` (`ContractorID`);

--
-- Indexes for table `deliveryzones`
--
ALTER TABLE `deliveryzones`
  ADD PRIMARY KEY (`ZoneID`),
  ADD UNIQUE KEY `ZoneCode` (`ZoneCode`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`DepartmentID`),
  ADD UNIQUE KEY `DepartmentCode` (`DepartmentCode`),
  ADD KEY `FK_Departments_Parent` (`ParentDepartmentID`);

--
-- Indexes for table `documentcycletracking`
--
ALTER TABLE `documentcycletracking`
  ADD PRIMARY KEY (`TrackingID`);

--
-- Indexes for table `documentrelationships`
--
ALTER TABLE `documentrelationships`
  ADD PRIMARY KEY (`RelationshipID`),
  ADD KEY `FK_DocRel_CreatedBy` (`CreatedBy`);

--
-- Indexes for table `documentsequences`
--
ALTER TABLE `documentsequences`
  ADD PRIMARY KEY (`SequenceID`),
  ADD KEY `FK_DocSeq_Type` (`DocumentTypeID`),
  ADD KEY `FK_DocSeq_Year` (`FiscalYearID`),
  ADD KEY `FK_DocSeq_Warehouse` (`WarehouseID`),
  ADD KEY `FK_DocSeq_Dept` (`DepartmentID`);

--
-- Indexes for table `documenttypes`
--
ALTER TABLE `documenttypes`
  ADD PRIMARY KEY (`DocumentTypeID`),
  ADD UNIQUE KEY `DocumentTypeCode` (`DocumentTypeCode`),
  ADD KEY `FK_DocType_Workflow` (`WorkflowID`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`EmployeeID`),
  ADD UNIQUE KEY `EmployeeCode` (`EmployeeCode`),
  ADD KEY `FK_Employees_Manager` (`ManagerID`),
  ADD KEY `IX_Employees_Department` (`DepartmentID`);

--
-- Indexes for table `employeesalarystructure`
--
ALTER TABLE `employeesalarystructure`
  ADD PRIMARY KEY (`StructureID`),
  ADD KEY `FK_SalaryStruct_Employee` (`EmployeeID`),
  ADD KEY `FK_SalaryStruct_Component` (`ComponentID`);

--
-- Indexes for table `employeeshifts`
--
ALTER TABLE `employeeshifts`
  ADD PRIMARY KEY (`EmployeeShiftID`),
  ADD KEY `FKs0y7x4t8gqo86ytcbtfc8d5oc` (`EmployeeID`),
  ADD KEY `FKqfhxo0kt6cpy3h98k6hccx0mx` (`ShiftID`);

--
-- Indexes for table `exchangerates`
--
ALTER TABLE `exchangerates`
  ADD PRIMARY KEY (`ExchangeRateID`),
  ADD UNIQUE KEY `UQ_ExchangeRate` (`FromCurrency`,`ToCurrency`,`RateDate`);

--
-- Indexes for table `fiscalperiods`
--
ALTER TABLE `fiscalperiods`
  ADD PRIMARY KEY (`PeriodID`),
  ADD KEY `FK_Period_Year` (`FiscalYearID`);

--
-- Indexes for table `fiscalyears`
--
ALTER TABLE `fiscalyears`
  ADD PRIMARY KEY (`FiscalYearID`),
  ADD UNIQUE KEY `YearCode` (`YearCode`);

--
-- Indexes for table `goodsreceiptnotes`
--
ALTER TABLE `goodsreceiptnotes`
  ADD PRIMARY KEY (`GRNID`),
  ADD UNIQUE KEY `GRNNumber` (`GRNNumber`),
  ADD KEY `FK_GRN_Supplier` (`SupplierID`),
  ADD KEY `FK_GRN_Warehouse` (`WarehouseID`),
  ADD KEY `FK_GRN_ReceivedBy` (`ReceivedByUserID`),
  ADD KEY `FK_GRN_InspectedBy` (`InspectedByUserID`),
  ADD KEY `IX_GRN_PO` (`POID`),
  ADD KEY `IX_GRN_Status` (`Status`);

--
-- Indexes for table `grnitems`
--
ALTER TABLE `grnitems`
  ADD PRIMARY KEY (`GRNItemID`),
  ADD KEY `FK_GRNItems_GRN` (`GRNID`),
  ADD KEY `FK_GRNItems_POItem` (`POItemID`),
  ADD KEY `FK_GRNItems_Item` (`ItemID`),
  ADD KEY `FK_GRNItems_Unit` (`UnitID`),
  ADD KEY `FK_GRNItems_Location` (`LocationID`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`HolidayID`);

--
-- Indexes for table `inventorybatches`
--
ALTER TABLE `inventorybatches`
  ADD PRIMARY KEY (`BatchID`),
  ADD KEY `FK_Batch_Item` (`ItemID`),
  ADD KEY `FK_Batch_GRNItem` (`GRNItemID`),
  ADD KEY `FK_Batch_Warehouse` (`WarehouseID`),
  ADD KEY `FK_Batch_Location` (`LocationID`),
  ADD KEY `FK_Batch_Unit` (`UnitID`);

--
-- Indexes for table `itemcategories`
--
ALTER TABLE `itemcategories`
  ADD PRIMARY KEY (`CategoryID`),
  ADD UNIQUE KEY `CategoryCode` (`CategoryCode`),
  ADD KEY `FK_Categories_Parent` (`ParentCategoryID`);

--
-- Indexes for table `itemqualityspecs`
--
ALTER TABLE `itemqualityspecs`
  ADD PRIMARY KEY (`SpecID`),
  ADD KEY `fk_itemqualityspecs_item` (`ItemID`),
  ADD KEY `fk_itemqualityspecs_parameter` (`ParameterID`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`ItemID`),
  ADD UNIQUE KEY `ItemCode` (`ItemCode`),
  ADD KEY `FK_Items_Category` (`CategoryID`),
  ADD KEY `FK_Items_Unit` (`UnitID`);

--
-- Indexes for table `journalentries`
--
ALTER TABLE `journalentries`
  ADD PRIMARY KEY (`JournalEntryID`),
  ADD UNIQUE KEY `EntryNumber` (`EntryNumber`),
  ADD KEY `FK_JE_FiscalYear` (`FiscalYearID`),
  ADD KEY `FK_JE_Period` (`PeriodID`),
  ADD KEY `FK_JE_PostedBy` (`PostedByUserID`),
  ADD KEY `IX_JournalEntry_Date` (`EntryDate`),
  ADD KEY `IX_JournalEntry_Status` (`Status`),
  ADD KEY `IX_JournalEntry_Source` (`SourceType`,`SourceID`);

--
-- Indexes for table `journalentrylines`
--
ALTER TABLE `journalentrylines`
  ADD PRIMARY KEY (`LineID`),
  ADD KEY `FK_JEL_Entry` (`JournalEntryID`),
  ADD KEY `FK_JEL_CostCenter` (`CostCenterID`),
  ADD KEY `IX_JEL_Account` (`AccountID`);

--
-- Indexes for table `leaverequests`
--
ALTER TABLE `leaverequests`
  ADD PRIMARY KEY (`LeaveRequestID`),
  ADD KEY `FK_Leave_Employee` (`EmployeeID`),
  ADD KEY `FK_Leave_ApprovedBy` (`ApprovedByUserID`);

--
-- Indexes for table `leavetypes`
--
ALTER TABLE `leavetypes`
  ADD PRIMARY KEY (`LeaveTypeCode`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`NotificationID`),
  ADD KEY `FK_Notification_Sender` (`SenderUserID`),
  ADD KEY `IX_Notification_Recipient` (`RecipientUserID`,`IsRead`),
  ADD KEY `IX_Notification_Date` (`CreatedAt`);

--
-- Indexes for table `numberseries`
--
ALTER TABLE `numberseries`
  ADD PRIMARY KEY (`SeriesID`),
  ADD UNIQUE KEY `SeriesCode` (`SeriesCode`);

--
-- Indexes for table `paymentvoucherallocations`
--
ALTER TABLE `paymentvoucherallocations`
  ADD PRIMARY KEY (`AllocationID`),
  ADD KEY `FK_PaymentAlloc_Payment` (`PaymentVoucherID`),
  ADD KEY `FK_PaymentAlloc_Invoice` (`SupplierInvoiceID`);

--
-- Indexes for table `paymentvouchers`
--
ALTER TABLE `paymentvouchers`
  ADD PRIMARY KEY (`PaymentVoucherID`),
  ADD UNIQUE KEY `VoucherNumber` (`VoucherNumber`),
  ADD KEY `FK_Payment_Supplier` (`SupplierID`),
  ADD KEY `FK_Payment_Cash` (`CashRegisterID`),
  ADD KEY `FK_Payment_Bank` (`BankAccountID`),
  ADD KEY `FK_Payment_JE` (`JournalEntryID`),
  ADD KEY `FK_Payment_PreparedBy` (`PreparedByUserID`),
  ADD KEY `FK_Payment_Level1` (`Level1ApprovedBy`),
  ADD KEY `FK_Payment_Level2` (`Level2ApprovedBy`),
  ADD KEY `FK_Payment_Level3` (`Level3ApprovedBy`),
  ADD KEY `FKd2n3o3kyjvqpen3fogsaaruk1` (`SupplierInvoiceID`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`PayrollID`),
  ADD UNIQUE KEY `UQ_Payroll` (`PayrollMonth`,`PayrollYear`,`EmployeeID`),
  ADD KEY `FK_Payroll_Employee` (`EmployeeID`),
  ADD KEY `FK_Payroll_Bank` (`BankAccountID`);

--
-- Indexes for table `payrolldetails`
--
ALTER TABLE `payrolldetails`
  ADD PRIMARY KEY (`PayrollDetailID`),
  ADD KEY `FK_PayrollDetail_Payroll` (`PayrollID`),
  ADD KEY `FK_PayrollDetail_Component` (`ComponentID`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`PermissionID`),
  ADD UNIQUE KEY `PermissionCode` (`PermissionCode`);

--
-- Indexes for table `pricelistitems`
--
ALTER TABLE `pricelistitems`
  ADD PRIMARY KEY (`PriceListItemID`),
  ADD KEY `FK_PriceListItems_PriceList` (`PriceListID`),
  ADD KEY `FK_PriceListItems_Item` (`ItemID`),
  ADD KEY `FK_PriceListItems_ExchangeRate` (`ExchangeRateID`);

--
-- Indexes for table `pricelists`
--
ALTER TABLE `pricelists`
  ADD PRIMARY KEY (`PriceListID`),
  ADD UNIQUE KEY `PriceListCode` (`PriceListCode`);

--
-- Indexes for table `purchaseorderitems`
--
ALTER TABLE `purchaseorderitems`
  ADD PRIMARY KEY (`POItemID`),
  ADD KEY `FK_POItems_PO` (`POID`),
  ADD KEY `FK_POItems_Item` (`ItemID`),
  ADD KEY `FK_POItems_Unit` (`UnitID`);

--
-- Indexes for table `purchaseorders`
--
ALTER TABLE `purchaseorders`
  ADD PRIMARY KEY (`POID`),
  ADD UNIQUE KEY `PONumber` (`PONumber`),
  ADD KEY `FK_PO_PR` (`PRID`),
  ADD KEY `FK_PO_Quotation` (`QuotationID`),
  ADD KEY `FK_PO_Level1Approver` (`Level1ApprovedBy`),
  ADD KEY `FK_PO_Level2Approver` (`Level2ApprovedBy`),
  ADD KEY `FK_PO_Level3Approver` (`Level3ApprovedBy`),
  ADD KEY `IX_PO_Supplier` (`SupplierID`),
  ADD KEY `IX_PO_Status` (`Status`),
  ADD KEY `IX_PO_Date` (`PODate`);

--
-- Indexes for table `purchaserequisitionitems`
--
ALTER TABLE `purchaserequisitionitems`
  ADD PRIMARY KEY (`PRItemID`),
  ADD KEY `FK_PRItems_PR` (`PRID`),
  ADD KEY `FK_PRItems_Item` (`ItemID`),
  ADD KEY `FK_PRItems_Unit` (`UnitID`);

--
-- Indexes for table `purchaserequisitions`
--
ALTER TABLE `purchaserequisitions`
  ADD PRIMARY KEY (`PRID`),
  ADD UNIQUE KEY `PRNumber` (`PRNumber`),
  ADD KEY `FK_PR_Department` (`RequestedByDeptID`),
  ADD KEY `FK_PR_RequestedBy` (`RequestedByUserID`),
  ADD KEY `FK_PR_ApprovedBy` (`ApprovedByUserID`);

--
-- Indexes for table `purchasereturnitems`
--
ALTER TABLE `purchasereturnitems`
  ADD PRIMARY KEY (`ReturnItemID`),
  ADD KEY `FK_PurchaseReturnItem_Return` (`PurchaseReturnID`),
  ADD KEY `FK_PurchaseReturnItem_GRNItem` (`GRNItemID`),
  ADD KEY `FK_PurchaseReturnItem_Item` (`ItemID`),
  ADD KEY `FK_PurchaseReturnItem_Unit` (`UnitID`);

--
-- Indexes for table `purchasereturns`
--
ALTER TABLE `purchasereturns`
  ADD PRIMARY KEY (`PurchaseReturnID`),
  ADD UNIQUE KEY `ReturnNumber` (`ReturnNumber`),
  ADD KEY `FK_PurchaseReturn_GRN` (`GRNID`),
  ADD KEY `FK_PurchaseReturn_Invoice` (`SupplierInvoiceID`),
  ADD KEY `FK_PurchaseReturn_Supplier` (`SupplierID`),
  ADD KEY `FK_PurchaseReturn_Warehouse` (`WarehouseID`),
  ADD KEY `FK_PurchaseReturn_ApprovedBy` (`ApprovedByUserID`),
  ADD KEY `FK_PurchaseReturn_PreparedBy` (`PreparedByUserID`);

--
-- Indexes for table `qualityinspectionitems`
--
ALTER TABLE `qualityinspectionitems`
  ADD PRIMARY KEY (`InspectionItemID`),
  ADD KEY `FKi8tsp72cnqsitr1ecdrw7k85l` (`InspectionID`),
  ADD KEY `FKknndldd94irtv04nmv213jhpt` (`ItemID`);

--
-- Indexes for table `qualityinspectionresults`
--
ALTER TABLE `qualityinspectionresults`
  ADD PRIMARY KEY (`ResultID`),
  ADD KEY `FK_Results_Inspection` (`InspectionID`),
  ADD KEY `FK_Results_Parameter` (`ParameterID`);

--
-- Indexes for table `qualityinspections`
--
ALTER TABLE `qualityinspections`
  ADD PRIMARY KEY (`InspectionID`),
  ADD UNIQUE KEY `InspectionNumber` (`InspectionNumber`),
  ADD KEY `FK_Inspection_Item` (`ItemID`),
  ADD KEY `FK_Inspection_InspectedBy` (`InspectedByUserID`),
  ADD KEY `FK_Inspection_ApprovedBy` (`ApprovedByUserID`);

--
-- Indexes for table `qualityparameters`
--
ALTER TABLE `qualityparameters`
  ADD PRIMARY KEY (`ParameterID`),
  ADD UNIQUE KEY `ParameterCode` (`ParameterCode`);

--
-- Indexes for table `quotationcomparisondetails`
--
ALTER TABLE `quotationcomparisondetails`
  ADD PRIMARY KEY (`CompDetailID`),
  ADD KEY `FK_QCDetails_Comparison` (`ComparisonID`),
  ADD KEY `FK_QCDetails_Quotation` (`QuotationID`),
  ADD KEY `FK_QCDetails_Supplier` (`SupplierID`);

--
-- Indexes for table `quotationcomparisons`
--
ALTER TABLE `quotationcomparisons`
  ADD PRIMARY KEY (`ComparisonID`),
  ADD UNIQUE KEY `ComparisonNumber` (`ComparisonNumber`),
  ADD KEY `FK_QC_PR` (`PRID`),
  ADD KEY `FK_QC_Item` (`ItemID`),
  ADD KEY `FK_QC_SelectedQuotation` (`SelectedQuotationID`),
  ADD KEY `FK_QC_SelectedSupplier` (`SelectedSupplierID`);

--
-- Indexes for table `receiptvoucherallocations`
--
ALTER TABLE `receiptvoucherallocations`
  ADD PRIMARY KEY (`AllocationID`),
  ADD KEY `FK_ReceiptAlloc_Receipt` (`ReceiptVoucherID`),
  ADD KEY `FK_ReceiptAlloc_Invoice` (`SalesInvoiceID`);

--
-- Indexes for table `receiptvouchers`
--
ALTER TABLE `receiptvouchers`
  ADD PRIMARY KEY (`ReceiptVoucherID`),
  ADD UNIQUE KEY `VoucherNumber` (`VoucherNumber`),
  ADD KEY `FK_Receipt_Customer` (`CustomerID`),
  ADD KEY `FK_Receipt_Cash` (`CashRegisterID`),
  ADD KEY `FK_Receipt_Bank` (`BankAccountID`),
  ADD KEY `FK_Receipt_JE` (`JournalEntryID`),
  ADD KEY `FK_Receipt_ReceivedBy` (`ReceivedByUserID`),
  ADD KEY `FK_Receipt_PostedBy` (`PostedByUserID`);

--
-- Indexes for table `requestforquotations`
--
ALTER TABLE `requestforquotations`
  ADD PRIMARY KEY (`RFQID`),
  ADD UNIQUE KEY `RFQNumber` (`RFQNumber`),
  ADD KEY `FK_RFQ_PR` (`PRID`),
  ADD KEY `FK_RFQ_Supplier` (`SupplierID`),
  ADD KEY `FK_RFQ_SentBy` (`SentByUserID`);

--
-- Indexes for table `rfqitems`
--
ALTER TABLE `rfqitems`
  ADD PRIMARY KEY (`RFQItemID`),
  ADD KEY `FK_RFQItems_RFQ` (`RFQID`),
  ADD KEY `FK_RFQItems_Item` (`ItemID`),
  ADD KEY `FK_RFQItems_Unit` (`UnitID`);

--
-- Indexes for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  ADD PRIMARY KEY (`RolePermissionID`),
  ADD UNIQUE KEY `UQ_RolePermission` (`RoleID`,`PermissionID`),
  ADD KEY `FK_RolePermissions_Permission` (`PermissionID`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`RoleID`),
  ADD UNIQUE KEY `RoleCode` (`RoleCode`);

--
-- Indexes for table `salarycomponents`
--
ALTER TABLE `salarycomponents`
  ADD PRIMARY KEY (`ComponentID`),
  ADD UNIQUE KEY `ComponentCode` (`ComponentCode`);

--
-- Indexes for table `salesinvoiceitems`
--
ALTER TABLE `salesinvoiceitems`
  ADD PRIMARY KEY (`InvoiceItemID`),
  ADD KEY `FK_InvoiceItems_Invoice` (`SalesInvoiceID`),
  ADD KEY `FK_InvoiceItems_IssueItem` (`IssueItemID`),
  ADD KEY `FK_InvoiceItems_Item` (`ItemID`),
  ADD KEY `FK_InvoiceItems_Unit` (`UnitID`);

--
-- Indexes for table `salesinvoices`
--
ALTER TABLE `salesinvoices`
  ADD PRIMARY KEY (`SalesInvoiceID`),
  ADD UNIQUE KEY `InvoiceNumber` (`InvoiceNumber`),
  ADD KEY `FK_SalesInvoice_SO` (`SOID`),
  ADD KEY `FK_SalesInvoice_IssueNote` (`IssueNoteID`),
  ADD KEY `FK_SalesInvoice_SalesRep` (`SalesRepID`),
  ADD KEY `IX_SalesInvoice_Customer` (`CustomerID`),
  ADD KEY `IX_SalesInvoice_Due` (`DueDate`,`Status`),
  ADD KEY `IX_SalesInvoice_EInvoice` (`EInvoiceStatus`),
  ADD KEY `IX_SalesInvoice_EInvoiceUUID` (`EInvoiceUUID`);

--
-- Indexes for table `salesorderitems`
--
ALTER TABLE `salesorderitems`
  ADD PRIMARY KEY (`SOItemID`),
  ADD KEY `FK_SOItems_SO` (`SOID`),
  ADD KEY `FK_SOItems_Item` (`ItemID`),
  ADD KEY `FK_SOItems_Unit` (`UnitID`),
  ADD KEY `FK_SOItems_Warehouse` (`WarehouseID`);

--
-- Indexes for table `salesorders`
--
ALTER TABLE `salesorders`
  ADD PRIMARY KEY (`SOID`),
  ADD UNIQUE KEY `SONumber` (`SONumber`),
  ADD KEY `FK_SO_SalesQuote` (`SalesQuotationID`),
  ADD KEY `FK_SO_Contact` (`ContactID`),
  ADD KEY `FK_SO_SalesRep` (`SalesRepID`),
  ADD KEY `FK_SO_PriceList` (`PriceListID`),
  ADD KEY `FK_SO_CreditCheckBy` (`CreditCheckBy`),
  ADD KEY `FK_SO_ApprovedBy` (`ApprovedByUserID`),
  ADD KEY `IX_SO_Customer` (`CustomerID`),
  ADD KEY `IX_SO_Status` (`Status`),
  ADD KEY `IX_SO_Date` (`SODate`);

--
-- Indexes for table `salesquotationitems`
--
ALTER TABLE `salesquotationitems`
  ADD PRIMARY KEY (`SQItemID`),
  ADD KEY `FK_SalesQuoteItems_Quote` (`SalesQuotationID`),
  ADD KEY `FK_SalesQuoteItems_Item` (`ItemID`),
  ADD KEY `FK_SalesQuoteItems_Unit` (`UnitID`);

--
-- Indexes for table `salesquotations`
--
ALTER TABLE `salesquotations`
  ADD PRIMARY KEY (`SalesQuotationID`),
  ADD UNIQUE KEY `QuotationNumber` (`QuotationNumber`),
  ADD KEY `FK_SalesQuote_Customer` (`CustomerID`),
  ADD KEY `FK_SalesQuote_Contact` (`ContactID`),
  ADD KEY `FK_SalesQuote_SalesRep` (`SalesRepID`),
  ADD KEY `FK_SalesQuote_PriceList` (`PriceListID`),
  ADD KEY `FKf5r1ja6rcini6a1j4ahwnhs03` (`RequestID`);

--
-- Indexes for table `salesreturnitems`
--
ALTER TABLE `salesreturnitems`
  ADD PRIMARY KEY (`ReturnItemID`),
  ADD KEY `FK_SalesReturnItem_Return` (`SalesReturnID`),
  ADD KEY `FK_SalesReturnItem_InvoiceItem` (`InvoiceItemID`),
  ADD KEY `FK_SalesReturnItem_Item` (`ItemID`),
  ADD KEY `FK_SalesReturnItem_Unit` (`UnitID`),
  ADD KEY `FK_SalesReturnItem_Location` (`LocationID`);

--
-- Indexes for table `salesreturns`
--
ALTER TABLE `salesreturns`
  ADD PRIMARY KEY (`SalesReturnID`),
  ADD UNIQUE KEY `ReturnNumber` (`ReturnNumber`),
  ADD KEY `FK_SalesReturn_Invoice` (`SalesInvoiceID`),
  ADD KEY `FK_SalesReturn_Customer` (`CustomerID`),
  ADD KEY `FK_SalesReturn_Warehouse` (`WarehouseID`),
  ADD KEY `FK_SalesReturn_ApprovedBy` (`ApprovedByUserID`),
  ADD KEY `FK_SalesReturn_ReceivedBy` (`ReceivedByUserID`);

--
-- Indexes for table `stockadjustmentitems`
--
ALTER TABLE `stockadjustmentitems`
  ADD PRIMARY KEY (`AdjItemID`),
  ADD KEY `FK_AdjItems_Adjustment` (`AdjustmentID`),
  ADD KEY `FK_AdjItems_Item` (`ItemID`),
  ADD KEY `FK_AdjItems_Location` (`LocationID`),
  ADD KEY `FK_AdjItems_Unit` (`UnitID`),
  ADD KEY `FK_AdjItems_Batch` (`BatchID`);

--
-- Indexes for table `stockadjustments`
--
ALTER TABLE `stockadjustments`
  ADD PRIMARY KEY (`AdjustmentID`),
  ADD UNIQUE KEY `AdjustmentNumber` (`AdjustmentNumber`),
  ADD KEY `FK_Adjustment_Warehouse` (`WarehouseID`),
  ADD KEY `FK_Adjustment_ApprovedBy` (`ApprovedByUserID`);

--
-- Indexes for table `stockbalances`
--
ALTER TABLE `stockbalances`
  ADD PRIMARY KEY (`StockBalanceID`),
  ADD UNIQUE KEY `UQ_StockBalance` (`ItemID`,`WarehouseID`,`LocationID`,`LotNumber`),
  ADD KEY `FK_StockBalance_Location` (`LocationID`),
  ADD KEY `IX_StockBalance_Item` (`ItemID`),
  ADD KEY `IX_StockBalance_Warehouse` (`WarehouseID`),
  ADD KEY `FK_StockBalance_Batch` (`BatchID`);

--
-- Indexes for table `stockissuenoteitems`
--
ALTER TABLE `stockissuenoteitems`
  ADD PRIMARY KEY (`IssueItemID`),
  ADD KEY `FK_IssueItems_Note` (`IssueNoteID`),
  ADD KEY `FK_IssueItems_SOItem` (`SOItemID`),
  ADD KEY `FK_IssueItems_Item` (`ItemID`),
  ADD KEY `FK_IssueItems_Unit` (`UnitID`),
  ADD KEY `FK_IssueItems_Location` (`LocationID`),
  ADD KEY `FK_IssueItems_Batch` (`BatchID`);

--
-- Indexes for table `stockissuenotes`
--
ALTER TABLE `stockissuenotes`
  ADD PRIMARY KEY (`IssueNoteID`),
  ADD UNIQUE KEY `IssueNoteNumber` (`IssueNoteNumber`),
  ADD KEY `FK_IssueNote_SO` (`SOID`),
  ADD KEY `FK_IssueNote_Customer` (`CustomerID`),
  ADD KEY `FK_IssueNote_Warehouse` (`WarehouseID`),
  ADD KEY `FK_IssueNote_IssuedBy` (`IssuedByUserID`);

--
-- Indexes for table `stockmovements`
--
ALTER TABLE `stockmovements`
  ADD PRIMARY KEY (`MovementID`),
  ADD KEY `FK_Movement_Warehouse` (`WarehouseID`),
  ADD KEY `FK_Movement_Location` (`LocationID`),
  ADD KEY `FK_Movement_CreatedBy` (`CreatedBy`),
  ADD KEY `IX_StockMovement_Item` (`ItemID`),
  ADD KEY `IX_StockMovement_Date` (`MovementDate`),
  ADD KEY `IX_StockMovement_Type` (`MovementType`),
  ADD KEY `FK_Movement_Batch` (`BatchID`);

--
-- Indexes for table `stockreservations`
--
ALTER TABLE `stockreservations`
  ADD PRIMARY KEY (`ReservationID`),
  ADD KEY `FK_Reservation_Item` (`ItemID`),
  ADD KEY `FK_Reservation_Warehouse` (`WarehouseID`),
  ADD KEY `FK_Reservation_User` (`ReservedByUserID`);

--
-- Indexes for table `stocktransferitems`
--
ALTER TABLE `stocktransferitems`
  ADD PRIMARY KEY (`TransferItemID`),
  ADD KEY `FK_TransferItems_Batch` (`BatchID`),
  ADD KEY `FK_TransferItems_Transfer` (`TransferID`),
  ADD KEY `FK_TransferItems_Item` (`ItemID`),
  ADD KEY `FK_TransferItems_Unit` (`UnitID`),
  ADD KEY `FK_TransferItems_FromLoc` (`FromLocationID`),
  ADD KEY `FK_TransferItems_ToLoc` (`ToLocationID`);

--
-- Indexes for table `stocktransfers`
--
ALTER TABLE `stocktransfers`
  ADD PRIMARY KEY (`TransferID`),
  ADD UNIQUE KEY `TransferNumber` (`TransferNumber`),
  ADD KEY `FK_Transfer_FromWH` (`FromWarehouseID`),
  ADD KEY `FK_Transfer_ToWH` (`ToWarehouseID`),
  ADD KEY `FK_Transfer_RequestedBy` (`RequestedByUserID`),
  ADD KEY `FK_Transfer_TransferredBy` (`TransferredByUserID`),
  ADD KEY `FK_Transfer_ReceivedBy` (`ReceivedByUserID`);

--
-- Indexes for table `suggestedsellingprices`
--
ALTER TABLE `suggestedsellingprices`
  ADD PRIMARY KEY (`SuggestedPriceID`),
  ADD KEY `FK_SugPrice_Item` (`ItemID`);

--
-- Indexes for table `supplierinvoiceitems`
--
ALTER TABLE `supplierinvoiceitems`
  ADD PRIMARY KEY (`SIItemID`),
  ADD KEY `FK_SIItems_Invoice` (`SupplierInvoiceID`),
  ADD KEY `FK_SIItems_GRNItem` (`GRNItemID`),
  ADD KEY `FK_SIItems_Item` (`ItemID`),
  ADD KEY `FK_SIItems_Unit` (`UnitID`);

--
-- Indexes for table `supplierinvoices`
--
ALTER TABLE `supplierinvoices`
  ADD PRIMARY KEY (`SupplierInvoiceID`),
  ADD UNIQUE KEY `UQ_SupplierInvoice` (`SupplierID`,`SupplierInvoiceNo`),
  ADD KEY `FK_SI_PO` (`POID`),
  ADD KEY `FK_SI_GRN` (`GRNID`),
  ADD KEY `FK_SI_VerifiedBy` (`VerifiedByUserID`),
  ADD KEY `FK_SI_ApprovedBy` (`ApprovedByUserID`),
  ADD KEY `IX_SupplierInvoice_Due` (`DueDate`,`Status`);

--
-- Indexes for table `supplieritems`
--
ALTER TABLE `supplieritems`
  ADD PRIMARY KEY (`SupplierItemID`),
  ADD UNIQUE KEY `UQ_SupplierItem` (`SupplierID`,`ItemID`),
  ADD KEY `FK_SupplierItems_Item` (`ItemID`);

--
-- Indexes for table `supplierquotationitems`
--
ALTER TABLE `supplierquotationitems`
  ADD PRIMARY KEY (`SQItemID`),
  ADD KEY `FK_SQItems_Quotation` (`QuotationID`),
  ADD KEY `FK_SQItems_Item` (`ItemID`),
  ADD KEY `FK_SQItems_Unit` (`UnitID`);

--
-- Indexes for table `supplierquotations`
--
ALTER TABLE `supplierquotations`
  ADD PRIMARY KEY (`QuotationID`),
  ADD KEY `FK_SQ_RFQ` (`RFQID`),
  ADD KEY `FK_SQ_Supplier` (`SupplierID`),
  ADD KEY `FK_SQ_ReceivedBy` (`ReceivedByUserID`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`SupplierID`),
  ADD UNIQUE KEY `SupplierCode` (`SupplierCode`),
  ADD KEY `FK_Suppliers_ApprovedBy` (`ApprovedBy`);

--
-- Indexes for table `supplier_banks`
--
ALTER TABLE `supplier_banks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK8mxbutlvfr92dnirvbemgd3lj` (`SupplierID`);

--
-- Indexes for table `supplier_items`
--
ALTER TABLE `supplier_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKa8a4uxfsiafct1jqqcw445niy` (`ItemID`),
  ADD KEY `FKe4gfq4datiuw0yn44vvdretx0` (`SupplierID`);

--
-- Indexes for table `systemsettings`
--
ALTER TABLE `systemsettings`
  ADD PRIMARY KEY (`SettingID`),
  ADD UNIQUE KEY `UQ_SystemSetting` (`SettingGroup`,`SettingKey`);

--
-- Indexes for table `transportcontractors`
--
ALTER TABLE `transportcontractors`
  ADD PRIMARY KEY (`ContractorID`),
  ADD UNIQUE KEY `ContractorCode` (`ContractorCode`);

--
-- Indexes for table `unitsofmeasure`
--
ALTER TABLE `unitsofmeasure`
  ADD PRIMARY KEY (`UnitID`),
  ADD UNIQUE KEY `UnitCode` (`UnitCode`),
  ADD KEY `FK_Units_BaseUnit` (`BaseUnitID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD KEY `IX_Users_Employee` (`EmployeeID`),
  ADD KEY `IX_Users_Role` (`RoleID`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`VehicleID`),
  ADD UNIQUE KEY `VehicleCode` (`VehicleCode`),
  ADD KEY `FK_Vehicle_Driver` (`DriverID`);

--
-- Indexes for table `warehouselocations`
--
ALTER TABLE `warehouselocations`
  ADD PRIMARY KEY (`LocationID`),
  ADD UNIQUE KEY `UQ_WarehouseLocation` (`WarehouseID`,`LocationCode`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`WarehouseID`),
  ADD UNIQUE KEY `WarehouseCode` (`WarehouseCode`),
  ADD KEY `FK_Warehouses_Manager` (`ManagerID`);

--
-- Indexes for table `workshifts`
--
ALTER TABLE `workshifts`
  ADD PRIMARY KEY (`ShiftID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alertrules`
--
ALTER TABLE `alertrules`
  MODIFY `AlertRuleID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approvalactions`
--
ALTER TABLE `approvalactions`
  MODIFY `ActionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `approvallimits`
--
ALTER TABLE `approvallimits`
  MODIFY `ApprovalLimitID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `approvalrequests`
--
ALTER TABLE `approvalrequests`
  MODIFY `RequestID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `approvalworkflows`
--
ALTER TABLE `approvalworkflows`
  MODIFY `WorkflowID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `approvalworkflowsteps`
--
ALTER TABLE `approvalworkflowsteps`
  MODIFY `StepID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `AttendanceID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auditlog`
--
ALTER TABLE `auditlog`
  MODIFY `AuditLogID` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bankaccounts`
--
ALTER TABLE `bankaccounts`
  MODIFY `BankAccountID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banks`
--
ALTER TABLE `banks`
  MODIFY `BankID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banktransactions`
--
ALTER TABLE `banktransactions`
  MODIFY `TransactionID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cashregisters`
--
ALTER TABLE `cashregisters`
  MODIFY `CashRegisterID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chartofaccounts`
--
ALTER TABLE `chartofaccounts`
  MODIFY `AccountID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chequesissued`
--
ALTER TABLE `chequesissued`
  MODIFY `ChequeID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chequesreceived`
--
ALTER TABLE `chequesreceived`
  MODIFY `ChequeID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companyinfo`
--
ALTER TABLE `companyinfo`
  MODIFY `CompanyID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `costcenters`
--
ALTER TABLE `costcenters`
  MODIFY `CostCenterID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `creditnotes`
--
ALTER TABLE `creditnotes`
  MODIFY `CreditNoteID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customercontacts`
--
ALTER TABLE `customercontacts`
  MODIFY `ContactID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customerrequestdeliveryschedules`
--
ALTER TABLE `customerrequestdeliveryschedules`
  MODIFY `scheduleId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `customerrequestitems`
--
ALTER TABLE `customerrequestitems`
  MODIFY `itemId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customerrequests`
--
ALTER TABLE `customerrequests`
  MODIFY `requestId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `CustomerID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `dailymarketprices`
--
ALTER TABLE `dailymarketprices`
  MODIFY `PriceID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `debitnotes`
--
ALTER TABLE `debitnotes`
  MODIFY `DebitNoteID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deliveryorders`
--
ALTER TABLE `deliveryorders`
  MODIFY `DeliveryOrderID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `deliveryzones`
--
ALTER TABLE `deliveryzones`
  MODIFY `ZoneID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `DepartmentID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `documentcycletracking`
--
ALTER TABLE `documentcycletracking`
  MODIFY `TrackingID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documentrelationships`
--
ALTER TABLE `documentrelationships`
  MODIFY `RelationshipID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documentsequences`
--
ALTER TABLE `documentsequences`
  MODIFY `SequenceID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documenttypes`
--
ALTER TABLE `documenttypes`
  MODIFY `DocumentTypeID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `EmployeeID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `employeesalarystructure`
--
ALTER TABLE `employeesalarystructure`
  MODIFY `StructureID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employeeshifts`
--
ALTER TABLE `employeeshifts`
  MODIFY `EmployeeShiftID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exchangerates`
--
ALTER TABLE `exchangerates`
  MODIFY `ExchangeRateID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fiscalperiods`
--
ALTER TABLE `fiscalperiods`
  MODIFY `PeriodID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fiscalyears`
--
ALTER TABLE `fiscalyears`
  MODIFY `FiscalYearID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goodsreceiptnotes`
--
ALTER TABLE `goodsreceiptnotes`
  MODIFY `GRNID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `grnitems`
--
ALTER TABLE `grnitems`
  MODIFY `GRNItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `HolidayID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventorybatches`
--
ALTER TABLE `inventorybatches`
  MODIFY `BatchID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `itemcategories`
--
ALTER TABLE `itemcategories`
  MODIFY `CategoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `itemqualityspecs`
--
ALTER TABLE `itemqualityspecs`
  MODIFY `SpecID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `ItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `journalentries`
--
ALTER TABLE `journalentries`
  MODIFY `JournalEntryID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journalentrylines`
--
ALTER TABLE `journalentrylines`
  MODIFY `LineID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leaverequests`
--
ALTER TABLE `leaverequests`
  MODIFY `LeaveRequestID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `NotificationID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `numberseries`
--
ALTER TABLE `numberseries`
  MODIFY `SeriesID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paymentvoucherallocations`
--
ALTER TABLE `paymentvoucherallocations`
  MODIFY `AllocationID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paymentvouchers`
--
ALTER TABLE `paymentvouchers`
  MODIFY `PaymentVoucherID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `PayrollID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payrolldetails`
--
ALTER TABLE `payrolldetails`
  MODIFY `PayrollDetailID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `PermissionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `pricelists`
--
ALTER TABLE `pricelists`
  MODIFY `PriceListID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `purchaseorderitems`
--
ALTER TABLE `purchaseorderitems`
  MODIFY `POItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `purchaseorders`
--
ALTER TABLE `purchaseorders`
  MODIFY `POID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `purchaserequisitionitems`
--
ALTER TABLE `purchaserequisitionitems`
  MODIFY `PRItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `purchaserequisitions`
--
ALTER TABLE `purchaserequisitions`
  MODIFY `PRID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `purchasereturnitems`
--
ALTER TABLE `purchasereturnitems`
  MODIFY `ReturnItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `purchasereturns`
--
ALTER TABLE `purchasereturns`
  MODIFY `PurchaseReturnID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `qualityinspectionitems`
--
ALTER TABLE `qualityinspectionitems`
  MODIFY `InspectionItemID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qualityinspectionresults`
--
ALTER TABLE `qualityinspectionresults`
  MODIFY `ResultID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qualityinspections`
--
ALTER TABLE `qualityinspections`
  MODIFY `InspectionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `qualityparameters`
--
ALTER TABLE `qualityparameters`
  MODIFY `ParameterID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `quotationcomparisondetails`
--
ALTER TABLE `quotationcomparisondetails`
  MODIFY `CompDetailID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=226;

--
-- AUTO_INCREMENT for table `quotationcomparisons`
--
ALTER TABLE `quotationcomparisons`
  MODIFY `ComparisonID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `receiptvoucherallocations`
--
ALTER TABLE `receiptvoucherallocations`
  MODIFY `AllocationID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receiptvouchers`
--
ALTER TABLE `receiptvouchers`
  MODIFY `ReceiptVoucherID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requestforquotations`
--
ALTER TABLE `requestforquotations`
  MODIFY `RFQID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `rfqitems`
--
ALTER TABLE `rfqitems`
  MODIFY `RFQItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  MODIFY `RolePermissionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=143;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `RoleID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `salarycomponents`
--
ALTER TABLE `salarycomponents`
  MODIFY `ComponentID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesinvoiceitems`
--
ALTER TABLE `salesinvoiceitems`
  MODIFY `InvoiceItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `salesinvoices`
--
ALTER TABLE `salesinvoices`
  MODIFY `SalesInvoiceID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `salesorderitems`
--
ALTER TABLE `salesorderitems`
  MODIFY `SOItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `salesorders`
--
ALTER TABLE `salesorders`
  MODIFY `SOID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `salesquotationitems`
--
ALTER TABLE `salesquotationitems`
  MODIFY `SQItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `salesquotations`
--
ALTER TABLE `salesquotations`
  MODIFY `SalesQuotationID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `salesreturnitems`
--
ALTER TABLE `salesreturnitems`
  MODIFY `ReturnItemID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesreturns`
--
ALTER TABLE `salesreturns`
  MODIFY `SalesReturnID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockadjustmentitems`
--
ALTER TABLE `stockadjustmentitems`
  MODIFY `AdjItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `stockadjustments`
--
ALTER TABLE `stockadjustments`
  MODIFY `AdjustmentID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockbalances`
--
ALTER TABLE `stockbalances`
  MODIFY `StockBalanceID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stockissuenoteitems`
--
ALTER TABLE `stockissuenoteitems`
  MODIFY `IssueItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `stockissuenotes`
--
ALTER TABLE `stockissuenotes`
  MODIFY `IssueNoteID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `stockmovements`
--
ALTER TABLE `stockmovements`
  MODIFY `MovementID` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `stockreservations`
--
ALTER TABLE `stockreservations`
  MODIFY `ReservationID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stocktransferitems`
--
ALTER TABLE `stocktransferitems`
  MODIFY `TransferItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stocktransfers`
--
ALTER TABLE `stocktransfers`
  MODIFY `TransferID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suggestedsellingprices`
--
ALTER TABLE `suggestedsellingprices`
  MODIFY `SuggestedPriceID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplierinvoiceitems`
--
ALTER TABLE `supplierinvoiceitems`
  MODIFY `SIItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `supplierinvoices`
--
ALTER TABLE `supplierinvoices`
  MODIFY `SupplierInvoiceID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `supplieritems`
--
ALTER TABLE `supplieritems`
  MODIFY `SupplierItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `supplierquotationitems`
--
ALTER TABLE `supplierquotationitems`
  MODIFY `SQItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `supplierquotations`
--
ALTER TABLE `supplierquotations`
  MODIFY `QuotationID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `SupplierID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `supplier_banks`
--
ALTER TABLE `supplier_banks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `supplier_items`
--
ALTER TABLE `supplier_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `systemsettings`
--
ALTER TABLE `systemsettings`
  MODIFY `SettingID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `transportcontractors`
--
ALTER TABLE `transportcontractors`
  MODIFY `ContractorID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `unitsofmeasure`
--
ALTER TABLE `unitsofmeasure`
  MODIFY `UnitID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `VehicleID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `warehouselocations`
--
ALTER TABLE `warehouselocations`
  MODIFY `LocationID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `WarehouseID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `workshifts`
--
ALTER TABLE `workshifts`
  MODIFY `ShiftID` int NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Structure for view `vw_customeroutstanding`
--
DROP TABLE IF EXISTS `vw_customeroutstanding`;

CREATE ALGORITHM=UNDEFINED  SQL SECURITY DEFINER VIEW `vw_customeroutstanding`  AS SELECT `c`.`CustomerID` AS `CustomerID`, `c`.`CustomerCode` AS `CustomerCode`, `c`.`CustomerNameAr` AS `CustomerNameAr`, `c`.`CustomerType` AS `CustomerType`, `c`.`CreditLimit` AS `CreditLimit`, sum(`si`.`TotalAmount`) AS `TotalInvoiced`, sum(`si`.`PaidAmount`) AS `TotalPaid`, sum((`si`.`TotalAmount` - `si`.`PaidAmount`)) AS `OutstandingBalance`, (`c`.`CreditLimit` - sum((`si`.`TotalAmount` - `si`.`PaidAmount`))) AS `AvailableCredit`, sum((case when (`si`.`Status` = 'Overdue') then 1 else 0 end)) AS `OverdueInvoices` FROM (`customers` `c` left join `salesinvoices` `si` on(((`c`.`CustomerID` = `si`.`CustomerID`) and (`si`.`Status` not in ('Cancelled','Draft'))))) GROUP BY `c`.`CustomerID`, `c`.`CustomerCode`, `c`.`CustomerNameAr`, `c`.`CustomerType`, `c`.`CreditLimit` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_dailysalessummary`
--
DROP TABLE IF EXISTS `vw_dailysalessummary`;

CREATE ALGORITHM=UNDEFINED  SQL SECURITY DEFINER VIEW `vw_dailysalessummary`  AS SELECT cast(`si`.`InvoiceDate` as date) AS `SalesDate`, count(`si`.`SalesInvoiceID`) AS `InvoiceCount`, sum(`si`.`SubTotal`) AS `SubTotal`, sum(`si`.`DiscountAmount`) AS `TotalDiscount`, sum(`si`.`TaxAmount`) AS `TotalTax`, sum(`si`.`TotalAmount`) AS `TotalSales`, sum(`si`.`PaidAmount`) AS `TotalCollected`, sum((`si`.`TotalAmount` - `si`.`PaidAmount`)) AS `TotalOutstanding` FROM `salesinvoices` AS `si` WHERE (`si`.`Status` not in ('Cancelled','Draft')) GROUP BY cast(`si`.`InvoiceDate` as date) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_pendingapprovals`
--
DROP TABLE IF EXISTS `vw_pendingapprovals`;

CREATE ALGORITHM=UNDEFINED  SQL SECURITY DEFINER VIEW `vw_pendingapprovals`  AS SELECT `ar`.`RequestID` AS `RequestID`, `ar`.`DocumentType` AS `DocumentType`, `ar`.`DocumentID` AS `DocumentID`, `ar`.`DocumentNumber` AS `DocumentNumber`, `ar`.`TotalAmount` AS `TotalAmount`, `ar`.`RequestedDate` AS `RequestedDate`, `ar`.`Priority` AS `Priority`, `ar`.`DueDate` AS `DueDate`, `u`.`Username` AS `RequestedByUser`, concat(`e`.`FirstNameAr`,' ',`e`.`LastNameAr`) AS `RequestedByName`, `aws`.`StepName` AS `CurrentStep`, `aw`.`WorkflowName` AS `WorkflowName` FROM ((((`approvalrequests` `ar` join `users` `u` on((`ar`.`RequestedByUserID` = `u`.`UserID`))) join `employees` `e` on((`u`.`EmployeeID` = `e`.`EmployeeID`))) join `approvalworkflows` `aw` on((`ar`.`WorkflowID` = `aw`.`WorkflowID`))) left join `approvalworkflowsteps` `aws` on((`ar`.`CurrentStepID` = `aws`.`StepID`))) WHERE (`ar`.`Status` in ('Pending','InProgress')) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_purchaseorderstatus`
--
DROP TABLE IF EXISTS `vw_purchaseorderstatus`;

CREATE ALGORITHM=UNDEFINED  SQL SECURITY DEFINER VIEW `vw_purchaseorderstatus`  AS SELECT `po`.`POID` AS `POID`, `po`.`PONumber` AS `PONumber`, `po`.`PODate` AS `PODate`, `s`.`SupplierNameAr` AS `SupplierNameAr`, `po`.`TotalAmount` AS `TotalAmount`, `po`.`Status` AS `Status`, `po`.`ApprovalStatus` AS `ApprovalStatus`, count(`poi`.`POItemID`) AS `TotalItems`, sum(`poi`.`OrderedQty`) AS `TotalOrderedQty`, sum(`poi`.`ReceivedQty`) AS `TotalReceivedQty`, (case when (sum(`poi`.`ReceivedQty`) = 0) then 'لم يتم الاستلام' when (sum(`poi`.`ReceivedQty`) < sum(`poi`.`OrderedQty`)) then 'استلام جزئي' else 'تم الاستلام بالكامل' end) AS `ReceiptStatus` FROM ((`purchaseorders` `po` join `suppliers` `s` on((`po`.`SupplierID` = `s`.`SupplierID`))) join `purchaseorderitems` `poi` on((`po`.`POID` = `poi`.`POID`))) GROUP BY `po`.`POID`, `po`.`PONumber`, `po`.`PODate`, `s`.`SupplierNameAr`, `po`.`TotalAmount`, `po`.`Status`, `po`.`ApprovalStatus` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_stocksummary`
--
DROP TABLE IF EXISTS `vw_stocksummary`;

CREATE ALGORITHM=UNDEFINED  SQL SECURITY DEFINER VIEW `vw_stocksummary`  AS SELECT `sb`.`ItemID` AS `ItemID`, `i`.`ItemCode` AS `ItemCode`, `i`.`ItemNameAr` AS `ItemNameAr`, `i`.`GradeName` AS `GradeName`, `sb`.`WarehouseID` AS `WarehouseID`, `w`.`WarehouseNameAr` AS `WarehouseNameAr`, sum(`sb`.`QuantityOnHand`) AS `TotalQuantityOnHand`, sum(`sb`.`QuantityReserved`) AS `TotalQuantityReserved`, sum((`sb`.`QuantityOnHand` - `sb`.`QuantityReserved`)) AS `TotalQuantityAvailable`, avg(`sb`.`AverageCost`) AS `AverageCost`, sum(((`sb`.`QuantityOnHand` - `sb`.`QuantityReserved`) * ifnull(`sb`.`AverageCost`,0))) AS `StockValue` FROM ((`stockbalances` `sb` join `items` `i` on((`sb`.`ItemID` = `i`.`ItemID`))) join `warehouses` `w` on((`sb`.`WarehouseID` = `w`.`WarehouseID`))) GROUP BY `sb`.`ItemID`, `i`.`ItemCode`, `i`.`ItemNameAr`, `i`.`GradeName`, `sb`.`WarehouseID`, `w`.`WarehouseNameAr` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_supplieroutstanding`
--
DROP TABLE IF EXISTS `vw_supplieroutstanding`;

CREATE ALGORITHM=UNDEFINED  SQL SECURITY DEFINER VIEW `vw_supplieroutstanding`  AS SELECT `s`.`SupplierID` AS `SupplierID`, `s`.`SupplierCode` AS `SupplierCode`, `s`.`SupplierNameAr` AS `SupplierNameAr`, `s`.`SupplierType` AS `SupplierType`, sum(`si`.`TotalAmount`) AS `TotalInvoiced`, sum(`si`.`PaidAmount`) AS `TotalPaid`, sum((`si`.`TotalAmount` - `si`.`PaidAmount`)) AS `OutstandingBalance`, sum((case when ((`si`.`DueDate` < now()) and (`si`.`Status` not in ('Paid','Cancelled'))) then 1 else 0 end)) AS `OverdueInvoices` FROM (`suppliers` `s` left join `supplierinvoices` `si` on(((`s`.`SupplierID` = `si`.`SupplierID`) and (`si`.`Status` <> 'Cancelled')))) GROUP BY `s`.`SupplierID`, `s`.`SupplierCode`, `s`.`SupplierNameAr`, `s`.`SupplierType` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alertrules`
--
ALTER TABLE `alertrules`
  ADD CONSTRAINT `FK_AlertRule_Role` FOREIGN KEY (`NotifyRoleID`) REFERENCES `roles` (`RoleID`),
  ADD CONSTRAINT `FK_AlertRule_User` FOREIGN KEY (`NotifyUserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `approvalactions`
--
ALTER TABLE `approvalactions`
  ADD CONSTRAINT `FK_ApprovalAction_Delegate` FOREIGN KEY (`DelegatedToUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_ApprovalAction_Request` FOREIGN KEY (`RequestID`) REFERENCES `approvalrequests` (`RequestID`),
  ADD CONSTRAINT `FK_ApprovalAction_Step` FOREIGN KEY (`StepID`) REFERENCES `approvalworkflowsteps` (`StepID`),
  ADD CONSTRAINT `FK_ApprovalAction_User` FOREIGN KEY (`ActionByUserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `approvallimits`
--
ALTER TABLE `approvallimits`
  ADD CONSTRAINT `FK_ApprovalLimits_ReviewRole` FOREIGN KEY (`RequiresReviewBy`) REFERENCES `roles` (`RoleID`),
  ADD CONSTRAINT `FK_ApprovalLimits_Role` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`);

--
-- Constraints for table `approvalrequests`
--
ALTER TABLE `approvalrequests`
  ADD CONSTRAINT `FK_ApprovalReq_Step` FOREIGN KEY (`CurrentStepID`) REFERENCES `approvalworkflowsteps` (`StepID`),
  ADD CONSTRAINT `FK_ApprovalReq_User` FOREIGN KEY (`RequestedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_ApprovalReq_Workflow` FOREIGN KEY (`WorkflowID`) REFERENCES `approvalworkflows` (`WorkflowID`);

--
-- Constraints for table `approvalworkflowsteps`
--
ALTER TABLE `approvalworkflowsteps`
  ADD CONSTRAINT `FK_WFStep_Role` FOREIGN KEY (`ApproverRoleID`) REFERENCES `roles` (`RoleID`),
  ADD CONSTRAINT `FK_WFStep_User` FOREIGN KEY (`ApproverUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_WFStep_Workflow` FOREIGN KEY (`WorkflowID`) REFERENCES `approvalworkflows` (`WorkflowID`),
  ADD CONSTRAINT `FKpje52pjw9r3gv29ngjgo0muxq` FOREIGN KEY (`EscalateToStepID`) REFERENCES `approvalworkflowsteps` (`StepID`);

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `FK_Attendance_Employee` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`);

--
-- Constraints for table `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `FK_AuditLog_User` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `bankaccounts`
--
ALTER TABLE `bankaccounts`
  ADD CONSTRAINT `FK_BankAcc_Bank` FOREIGN KEY (`BankID`) REFERENCES `banks` (`BankID`),
  ADD CONSTRAINT `FK_BankAcc_GLAccount` FOREIGN KEY (`GLAccountID`) REFERENCES `chartofaccounts` (`AccountID`);

--
-- Constraints for table `banktransactions`
--
ALTER TABLE `banktransactions`
  ADD CONSTRAINT `FK_BankTrans_Account` FOREIGN KEY (`BankAccountID`) REFERENCES `bankaccounts` (`BankAccountID`),
  ADD CONSTRAINT `FK_BankTrans_JE` FOREIGN KEY (`JournalEntryID`) REFERENCES `journalentries` (`JournalEntryID`);

--
-- Constraints for table `cashregisters`
--
ALTER TABLE `cashregisters`
  ADD CONSTRAINT `FK_Cash_Custodian` FOREIGN KEY (`CustodianID`) REFERENCES `employees` (`EmployeeID`),
  ADD CONSTRAINT `FK_Cash_GLAccount` FOREIGN KEY (`GLAccountID`) REFERENCES `chartofaccounts` (`AccountID`);

--
-- Constraints for table `chartofaccounts`
--
ALTER TABLE `chartofaccounts`
  ADD CONSTRAINT `FK_COA_Parent` FOREIGN KEY (`ParentAccountID`) REFERENCES `chartofaccounts` (`AccountID`);

--
-- Constraints for table `chequesissued`
--
ALTER TABLE `chequesissued`
  ADD CONSTRAINT `FK_ChequeIss_Bank` FOREIGN KEY (`BankAccountID`) REFERENCES `bankaccounts` (`BankAccountID`),
  ADD CONSTRAINT `FK_ChequeIss_Payment` FOREIGN KEY (`PaymentVoucherID`) REFERENCES `paymentvouchers` (`PaymentVoucherID`),
  ADD CONSTRAINT `FK_ChequeIss_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `chequesreceived`
--
ALTER TABLE `chequesreceived`
  ADD CONSTRAINT `FK_ChequeRec_Bank` FOREIGN KEY (`CollectionBankAccountID`) REFERENCES `bankaccounts` (`BankAccountID`),
  ADD CONSTRAINT `FK_ChequeRec_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
  ADD CONSTRAINT `FK_ChequeRec_Endorsed` FOREIGN KEY (`EndorsedToSupplierID`) REFERENCES `suppliers` (`SupplierID`),
  ADD CONSTRAINT `FK_ChequeRec_Receipt` FOREIGN KEY (`ReceiptVoucherID`) REFERENCES `receiptvouchers` (`ReceiptVoucherID`);

--
-- Constraints for table `costcenters`
--
ALTER TABLE `costcenters`
  ADD CONSTRAINT `FK_CC_Dept` FOREIGN KEY (`DepartmentID`) REFERENCES `departments` (`DepartmentID`),
  ADD CONSTRAINT `FK_CC_Parent` FOREIGN KEY (`ParentCostCenterID`) REFERENCES `costcenters` (`CostCenterID`);

--
-- Constraints for table `creditnotes`
--
ALTER TABLE `creditnotes`
  ADD CONSTRAINT `FK_CreditNote_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_CreditNote_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
  ADD CONSTRAINT `FK_CreditNote_Invoice` FOREIGN KEY (`SalesInvoiceID`) REFERENCES `salesinvoices` (`SalesInvoiceID`),
  ADD CONSTRAINT `FK_CreditNote_JE` FOREIGN KEY (`JournalEntryID`) REFERENCES `journalentries` (`JournalEntryID`),
  ADD CONSTRAINT `FK_CreditNote_Return` FOREIGN KEY (`SalesReturnID`) REFERENCES `salesreturns` (`SalesReturnID`);

--
-- Constraints for table `customercontacts`
--
ALTER TABLE `customercontacts`
  ADD CONSTRAINT `FK_CustomerContacts_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`);

--
-- Constraints for table `customerrequestdeliveryschedules`
--
ALTER TABLE `customerrequestdeliveryschedules`
  ADD CONSTRAINT `FKqxowggh5qy941py4v9xpodn1` FOREIGN KEY (`RequestID`) REFERENCES `customerrequests` (`requestId`);

--
-- Constraints for table `customerrequestitems`
--
ALTER TABLE `customerrequestitems`
  ADD CONSTRAINT `FK4ofhtly2plh49k3qu4t33f28a` FOREIGN KEY (`RequestID`) REFERENCES `customerrequests` (`requestId`);

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `FK_Customers_ApprovedBy` FOREIGN KEY (`ApprovedBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Customers_SalesRep` FOREIGN KEY (`SalesRepID`) REFERENCES `employees` (`EmployeeID`);

--
-- Constraints for table `dailymarketprices`
--
ALTER TABLE `dailymarketprices`
  ADD CONSTRAINT `FK_MarketPrice_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`);

--
-- Constraints for table `debitnotes`
--
ALTER TABLE `debitnotes`
  ADD CONSTRAINT `FK_DebitNote_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_DebitNote_Invoice` FOREIGN KEY (`SupplierInvoiceID`) REFERENCES `supplierinvoices` (`SupplierInvoiceID`),
  ADD CONSTRAINT `FK_DebitNote_JE` FOREIGN KEY (`JournalEntryID`) REFERENCES `journalentries` (`JournalEntryID`),
  ADD CONSTRAINT `FK_DebitNote_Return` FOREIGN KEY (`PurchaseReturnID`) REFERENCES `purchasereturns` (`PurchaseReturnID`),
  ADD CONSTRAINT `FK_DebitNote_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `deliveryorders`
--
ALTER TABLE `deliveryorders`
  ADD CONSTRAINT `FK_DO_Contractor` FOREIGN KEY (`ContractorID`) REFERENCES `transportcontractors` (`ContractorID`),
  ADD CONSTRAINT `FK_DO_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
  ADD CONSTRAINT `FK_DO_IssueNote` FOREIGN KEY (`IssueNoteID`) REFERENCES `stockissuenotes` (`IssueNoteID`),
  ADD CONSTRAINT `FK_DO_Vehicle` FOREIGN KEY (`VehicleID`) REFERENCES `vehicles` (`VehicleID`),
  ADD CONSTRAINT `FK_DO_Zone` FOREIGN KEY (`ZoneID`) REFERENCES `deliveryzones` (`ZoneID`);

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `FK_Departments_Parent` FOREIGN KEY (`ParentDepartmentID`) REFERENCES `departments` (`DepartmentID`);

--
-- Constraints for table `documentrelationships`
--
ALTER TABLE `documentrelationships`
  ADD CONSTRAINT `FK_DocRel_CreatedBy` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `documentsequences`
--
ALTER TABLE `documentsequences`
  ADD CONSTRAINT `FK_DocSeq_Dept` FOREIGN KEY (`DepartmentID`) REFERENCES `departments` (`DepartmentID`),
  ADD CONSTRAINT `FK_DocSeq_Type` FOREIGN KEY (`DocumentTypeID`) REFERENCES `documenttypes` (`DocumentTypeID`),
  ADD CONSTRAINT `FK_DocSeq_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`),
  ADD CONSTRAINT `FK_DocSeq_Year` FOREIGN KEY (`FiscalYearID`) REFERENCES `fiscalyears` (`FiscalYearID`);

--
-- Constraints for table `documenttypes`
--
ALTER TABLE `documenttypes`
  ADD CONSTRAINT `FK_DocType_Workflow` FOREIGN KEY (`WorkflowID`) REFERENCES `approvalworkflows` (`WorkflowID`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `FK_Employees_Department` FOREIGN KEY (`DepartmentID`) REFERENCES `departments` (`DepartmentID`),
  ADD CONSTRAINT `FK_Employees_Manager` FOREIGN KEY (`ManagerID`) REFERENCES `employees` (`EmployeeID`);

--
-- Constraints for table `employeesalarystructure`
--
ALTER TABLE `employeesalarystructure`
  ADD CONSTRAINT `FK_SalaryStruct_Component` FOREIGN KEY (`ComponentID`) REFERENCES `salarycomponents` (`ComponentID`),
  ADD CONSTRAINT `FK_SalaryStruct_Employee` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`);

--
-- Constraints for table `employeeshifts`
--
ALTER TABLE `employeeshifts`
  ADD CONSTRAINT `FKqfhxo0kt6cpy3h98k6hccx0mx` FOREIGN KEY (`ShiftID`) REFERENCES `workshifts` (`ShiftID`),
  ADD CONSTRAINT `FKs0y7x4t8gqo86ytcbtfc8d5oc` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`);

--
-- Constraints for table `fiscalperiods`
--
ALTER TABLE `fiscalperiods`
  ADD CONSTRAINT `FK_Period_Year` FOREIGN KEY (`FiscalYearID`) REFERENCES `fiscalyears` (`FiscalYearID`);

--
-- Constraints for table `goodsreceiptnotes`
--
ALTER TABLE `goodsreceiptnotes`
  ADD CONSTRAINT `FK_GRN_InspectedBy` FOREIGN KEY (`InspectedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_GRN_PO` FOREIGN KEY (`POID`) REFERENCES `purchaseorders` (`POID`),
  ADD CONSTRAINT `FK_GRN_ReceivedBy` FOREIGN KEY (`ReceivedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_GRN_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`),
  ADD CONSTRAINT `FK_GRN_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `grnitems`
--
ALTER TABLE `grnitems`
  ADD CONSTRAINT `FK_GRNItems_GRN` FOREIGN KEY (`GRNID`) REFERENCES `goodsreceiptnotes` (`GRNID`),
  ADD CONSTRAINT `FK_GRNItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_GRNItems_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_GRNItems_POItem` FOREIGN KEY (`POItemID`) REFERENCES `purchaseorderitems` (`POItemID`),
  ADD CONSTRAINT `FK_GRNItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `inventorybatches`
--
ALTER TABLE `inventorybatches`
  ADD CONSTRAINT `FK_Batch_GRNItem` FOREIGN KEY (`GRNItemID`) REFERENCES `grnitems` (`GRNItemID`),
  ADD CONSTRAINT `FK_Batch_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_Batch_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_Batch_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`),
  ADD CONSTRAINT `FK_Batch_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `itemcategories`
--
ALTER TABLE `itemcategories`
  ADD CONSTRAINT `FK_Categories_Parent` FOREIGN KEY (`ParentCategoryID`) REFERENCES `itemcategories` (`CategoryID`);

--
-- Constraints for table `itemqualityspecs`
--
ALTER TABLE `itemqualityspecs`
  ADD CONSTRAINT `fk_itemqualityspecs_item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_itemqualityspecs_parameter` FOREIGN KEY (`ParameterID`) REFERENCES `qualityparameters` (`ParameterID`);

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `FK_Items_Category` FOREIGN KEY (`CategoryID`) REFERENCES `itemcategories` (`CategoryID`),
  ADD CONSTRAINT `FK_Items_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `journalentries`
--
ALTER TABLE `journalentries`
  ADD CONSTRAINT `FK_JE_FiscalYear` FOREIGN KEY (`FiscalYearID`) REFERENCES `fiscalyears` (`FiscalYearID`),
  ADD CONSTRAINT `FK_JE_Period` FOREIGN KEY (`PeriodID`) REFERENCES `fiscalperiods` (`PeriodID`),
  ADD CONSTRAINT `FK_JE_PostedBy` FOREIGN KEY (`PostedByUserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `journalentrylines`
--
ALTER TABLE `journalentrylines`
  ADD CONSTRAINT `FK_JEL_Account` FOREIGN KEY (`AccountID`) REFERENCES `chartofaccounts` (`AccountID`),
  ADD CONSTRAINT `FK_JEL_CostCenter` FOREIGN KEY (`CostCenterID`) REFERENCES `costcenters` (`CostCenterID`),
  ADD CONSTRAINT `FK_JEL_Entry` FOREIGN KEY (`JournalEntryID`) REFERENCES `journalentries` (`JournalEntryID`);

--
-- Constraints for table `leaverequests`
--
ALTER TABLE `leaverequests`
  ADD CONSTRAINT `FK_Leave_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Leave_Employee` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FK_Notification_Recipient` FOREIGN KEY (`RecipientUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Notification_Sender` FOREIGN KEY (`SenderUserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `paymentvoucherallocations`
--
ALTER TABLE `paymentvoucherallocations`
  ADD CONSTRAINT `FK_PaymentAlloc_Invoice` FOREIGN KEY (`SupplierInvoiceID`) REFERENCES `supplierinvoices` (`SupplierInvoiceID`),
  ADD CONSTRAINT `FK_PaymentAlloc_Payment` FOREIGN KEY (`PaymentVoucherID`) REFERENCES `paymentvouchers` (`PaymentVoucherID`);

--
-- Constraints for table `paymentvouchers`
--
ALTER TABLE `paymentvouchers`
  ADD CONSTRAINT `FK_Payment_Bank` FOREIGN KEY (`BankAccountID`) REFERENCES `bankaccounts` (`BankAccountID`),
  ADD CONSTRAINT `FK_Payment_Cash` FOREIGN KEY (`CashRegisterID`) REFERENCES `cashregisters` (`CashRegisterID`),
  ADD CONSTRAINT `FK_Payment_JE` FOREIGN KEY (`JournalEntryID`) REFERENCES `journalentries` (`JournalEntryID`),
  ADD CONSTRAINT `FK_Payment_Level1` FOREIGN KEY (`Level1ApprovedBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Payment_Level2` FOREIGN KEY (`Level2ApprovedBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Payment_Level3` FOREIGN KEY (`Level3ApprovedBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Payment_PreparedBy` FOREIGN KEY (`PreparedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Payment_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`),
  ADD CONSTRAINT `FKd2n3o3kyjvqpen3fogsaaruk1` FOREIGN KEY (`SupplierInvoiceID`) REFERENCES `supplierinvoices` (`SupplierInvoiceID`);

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `FK_Payroll_Bank` FOREIGN KEY (`BankAccountID`) REFERENCES `bankaccounts` (`BankAccountID`),
  ADD CONSTRAINT `FK_Payroll_Employee` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`);

--
-- Constraints for table `payrolldetails`
--
ALTER TABLE `payrolldetails`
  ADD CONSTRAINT `FK_PayrollDetail_Component` FOREIGN KEY (`ComponentID`) REFERENCES `salarycomponents` (`ComponentID`),
  ADD CONSTRAINT `FK_PayrollDetail_Payroll` FOREIGN KEY (`PayrollID`) REFERENCES `payroll` (`PayrollID`);

--
-- Constraints for table `pricelistitems`
--
ALTER TABLE `pricelistitems`
  ADD CONSTRAINT `FK_PriceListItems_ExchangeRate` FOREIGN KEY (`ExchangeRateID`) REFERENCES `exchangerates` (`ExchangeRateID`),
  ADD CONSTRAINT `FK_PriceListItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_PriceListItems_PriceList` FOREIGN KEY (`PriceListID`) REFERENCES `pricelists` (`PriceListID`);

--
-- Constraints for table `purchaseorderitems`
--
ALTER TABLE `purchaseorderitems`
  ADD CONSTRAINT `FK_POItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_POItems_PO` FOREIGN KEY (`POID`) REFERENCES `purchaseorders` (`POID`),
  ADD CONSTRAINT `FK_POItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `purchaseorders`
--
ALTER TABLE `purchaseorders`
  ADD CONSTRAINT `FK_PO_Level1Approver` FOREIGN KEY (`Level1ApprovedBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_PO_Level2Approver` FOREIGN KEY (`Level2ApprovedBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_PO_Level3Approver` FOREIGN KEY (`Level3ApprovedBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_PO_PR` FOREIGN KEY (`PRID`) REFERENCES `purchaserequisitions` (`PRID`),
  ADD CONSTRAINT `FK_PO_Quotation` FOREIGN KEY (`QuotationID`) REFERENCES `supplierquotations` (`QuotationID`),
  ADD CONSTRAINT `FK_PO_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `purchaserequisitionitems`
--
ALTER TABLE `purchaserequisitionitems`
  ADD CONSTRAINT `FK_PRItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_PRItems_PR` FOREIGN KEY (`PRID`) REFERENCES `purchaserequisitions` (`PRID`),
  ADD CONSTRAINT `FK_PRItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `purchaserequisitions`
--
ALTER TABLE `purchaserequisitions`
  ADD CONSTRAINT `FK_PR_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_PR_Department` FOREIGN KEY (`RequestedByDeptID`) REFERENCES `departments` (`DepartmentID`),
  ADD CONSTRAINT `FK_PR_RequestedBy` FOREIGN KEY (`RequestedByUserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `purchasereturnitems`
--
ALTER TABLE `purchasereturnitems`
  ADD CONSTRAINT `FK_PurchaseReturnItem_GRNItem` FOREIGN KEY (`GRNItemID`) REFERENCES `grnitems` (`GRNItemID`),
  ADD CONSTRAINT `FK_PurchaseReturnItem_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_PurchaseReturnItem_Return` FOREIGN KEY (`PurchaseReturnID`) REFERENCES `purchasereturns` (`PurchaseReturnID`),
  ADD CONSTRAINT `FK_PurchaseReturnItem_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `purchasereturns`
--
ALTER TABLE `purchasereturns`
  ADD CONSTRAINT `FK_PurchaseReturn_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_PurchaseReturn_GRN` FOREIGN KEY (`GRNID`) REFERENCES `goodsreceiptnotes` (`GRNID`),
  ADD CONSTRAINT `FK_PurchaseReturn_Invoice` FOREIGN KEY (`SupplierInvoiceID`) REFERENCES `supplierinvoices` (`SupplierInvoiceID`),
  ADD CONSTRAINT `FK_PurchaseReturn_PreparedBy` FOREIGN KEY (`PreparedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_PurchaseReturn_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`),
  ADD CONSTRAINT `FK_PurchaseReturn_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `qualityinspectionitems`
--
ALTER TABLE `qualityinspectionitems`
  ADD CONSTRAINT `FKi8tsp72cnqsitr1ecdrw7k85l` FOREIGN KEY (`InspectionID`) REFERENCES `qualityinspections` (`InspectionID`),
  ADD CONSTRAINT `FKknndldd94irtv04nmv213jhpt` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`);

--
-- Constraints for table `qualityinspectionresults`
--
ALTER TABLE `qualityinspectionresults`
  ADD CONSTRAINT `FK_Results_Inspection` FOREIGN KEY (`InspectionID`) REFERENCES `qualityinspections` (`InspectionID`),
  ADD CONSTRAINT `FK_Results_Parameter` FOREIGN KEY (`ParameterID`) REFERENCES `qualityparameters` (`ParameterID`);

--
-- Constraints for table `qualityinspections`
--
ALTER TABLE `qualityinspections`
  ADD CONSTRAINT `FK_Inspection_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Inspection_InspectedBy` FOREIGN KEY (`InspectedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Inspection_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`);

--
-- Constraints for table `quotationcomparisondetails`
--
ALTER TABLE `quotationcomparisondetails`
  ADD CONSTRAINT `FK_QCDetails_Comparison` FOREIGN KEY (`ComparisonID`) REFERENCES `quotationcomparisons` (`ComparisonID`),
  ADD CONSTRAINT `FK_QCDetails_Quotation` FOREIGN KEY (`QuotationID`) REFERENCES `supplierquotations` (`QuotationID`),
  ADD CONSTRAINT `FK_QCDetails_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `quotationcomparisons`
--
ALTER TABLE `quotationcomparisons`
  ADD CONSTRAINT `FK_QC_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_QC_PR` FOREIGN KEY (`PRID`) REFERENCES `purchaserequisitions` (`PRID`),
  ADD CONSTRAINT `FK_QC_SelectedQuotation` FOREIGN KEY (`SelectedQuotationID`) REFERENCES `supplierquotations` (`QuotationID`),
  ADD CONSTRAINT `FK_QC_SelectedSupplier` FOREIGN KEY (`SelectedSupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `receiptvoucherallocations`
--
ALTER TABLE `receiptvoucherallocations`
  ADD CONSTRAINT `FK_ReceiptAlloc_Invoice` FOREIGN KEY (`SalesInvoiceID`) REFERENCES `salesinvoices` (`SalesInvoiceID`),
  ADD CONSTRAINT `FK_ReceiptAlloc_Receipt` FOREIGN KEY (`ReceiptVoucherID`) REFERENCES `receiptvouchers` (`ReceiptVoucherID`);

--
-- Constraints for table `receiptvouchers`
--
ALTER TABLE `receiptvouchers`
  ADD CONSTRAINT `FK_Receipt_Bank` FOREIGN KEY (`BankAccountID`) REFERENCES `bankaccounts` (`BankAccountID`),
  ADD CONSTRAINT `FK_Receipt_Cash` FOREIGN KEY (`CashRegisterID`) REFERENCES `cashregisters` (`CashRegisterID`),
  ADD CONSTRAINT `FK_Receipt_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
  ADD CONSTRAINT `FK_Receipt_JE` FOREIGN KEY (`JournalEntryID`) REFERENCES `journalentries` (`JournalEntryID`),
  ADD CONSTRAINT `FK_Receipt_PostedBy` FOREIGN KEY (`PostedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Receipt_ReceivedBy` FOREIGN KEY (`ReceivedByUserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `requestforquotations`
--
ALTER TABLE `requestforquotations`
  ADD CONSTRAINT `FK_RFQ_PR` FOREIGN KEY (`PRID`) REFERENCES `purchaserequisitions` (`PRID`),
  ADD CONSTRAINT `FK_RFQ_SentBy` FOREIGN KEY (`SentByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_RFQ_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `rfqitems`
--
ALTER TABLE `rfqitems`
  ADD CONSTRAINT `FK_RFQItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_RFQItems_RFQ` FOREIGN KEY (`RFQID`) REFERENCES `requestforquotations` (`RFQID`),
  ADD CONSTRAINT `FK_RFQItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  ADD CONSTRAINT `FK_RolePermissions_Permission` FOREIGN KEY (`PermissionID`) REFERENCES `permissions` (`PermissionID`),
  ADD CONSTRAINT `FK_RolePermissions_Role` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`);

--
-- Constraints for table `salesinvoiceitems`
--
ALTER TABLE `salesinvoiceitems`
  ADD CONSTRAINT `FK_InvoiceItems_Invoice` FOREIGN KEY (`SalesInvoiceID`) REFERENCES `salesinvoices` (`SalesInvoiceID`),
  ADD CONSTRAINT `FK_InvoiceItems_IssueItem` FOREIGN KEY (`IssueItemID`) REFERENCES `stockissuenoteitems` (`IssueItemID`),
  ADD CONSTRAINT `FK_InvoiceItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_InvoiceItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `salesinvoices`
--
ALTER TABLE `salesinvoices`
  ADD CONSTRAINT `FK_SalesInvoice_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
  ADD CONSTRAINT `FK_SalesInvoice_IssueNote` FOREIGN KEY (`IssueNoteID`) REFERENCES `stockissuenotes` (`IssueNoteID`),
  ADD CONSTRAINT `FK_SalesInvoice_SalesRep` FOREIGN KEY (`SalesRepID`) REFERENCES `employees` (`EmployeeID`),
  ADD CONSTRAINT `FK_SalesInvoice_SO` FOREIGN KEY (`SOID`) REFERENCES `salesorders` (`SOID`);

--
-- Constraints for table `salesorderitems`
--
ALTER TABLE `salesorderitems`
  ADD CONSTRAINT `FK_SOItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_SOItems_SO` FOREIGN KEY (`SOID`) REFERENCES `salesorders` (`SOID`),
  ADD CONSTRAINT `FK_SOItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`),
  ADD CONSTRAINT `FK_SOItems_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `salesorders`
--
ALTER TABLE `salesorders`
  ADD CONSTRAINT `FK_SO_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_SO_Contact` FOREIGN KEY (`ContactID`) REFERENCES `customercontacts` (`ContactID`),
  ADD CONSTRAINT `FK_SO_CreditCheckBy` FOREIGN KEY (`CreditCheckBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_SO_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
  ADD CONSTRAINT `FK_SO_PriceList` FOREIGN KEY (`PriceListID`) REFERENCES `pricelists` (`PriceListID`),
  ADD CONSTRAINT `FK_SO_SalesQuote` FOREIGN KEY (`SalesQuotationID`) REFERENCES `salesquotations` (`SalesQuotationID`),
  ADD CONSTRAINT `FK_SO_SalesRep` FOREIGN KEY (`SalesRepID`) REFERENCES `employees` (`EmployeeID`);

--
-- Constraints for table `salesquotationitems`
--
ALTER TABLE `salesquotationitems`
  ADD CONSTRAINT `FK_SalesQuoteItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_SalesQuoteItems_Quote` FOREIGN KEY (`SalesQuotationID`) REFERENCES `salesquotations` (`SalesQuotationID`),
  ADD CONSTRAINT `FK_SalesQuoteItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `salesquotations`
--
ALTER TABLE `salesquotations`
  ADD CONSTRAINT `FK_SalesQuote_Contact` FOREIGN KEY (`ContactID`) REFERENCES `customercontacts` (`ContactID`),
  ADD CONSTRAINT `FK_SalesQuote_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
  ADD CONSTRAINT `FK_SalesQuote_PriceList` FOREIGN KEY (`PriceListID`) REFERENCES `pricelists` (`PriceListID`),
  ADD CONSTRAINT `FK_SalesQuote_SalesRep` FOREIGN KEY (`SalesRepID`) REFERENCES `employees` (`EmployeeID`),
  ADD CONSTRAINT `FKf5r1ja6rcini6a1j4ahwnhs03` FOREIGN KEY (`RequestID`) REFERENCES `customerrequests` (`requestId`);

--
-- Constraints for table `salesreturnitems`
--
ALTER TABLE `salesreturnitems`
  ADD CONSTRAINT `FK_SalesReturnItem_InvoiceItem` FOREIGN KEY (`InvoiceItemID`) REFERENCES `salesinvoiceitems` (`InvoiceItemID`),
  ADD CONSTRAINT `FK_SalesReturnItem_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_SalesReturnItem_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_SalesReturnItem_Return` FOREIGN KEY (`SalesReturnID`) REFERENCES `salesreturns` (`SalesReturnID`),
  ADD CONSTRAINT `FK_SalesReturnItem_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `salesreturns`
--
ALTER TABLE `salesreturns`
  ADD CONSTRAINT `FK_SalesReturn_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_SalesReturn_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
  ADD CONSTRAINT `FK_SalesReturn_Invoice` FOREIGN KEY (`SalesInvoiceID`) REFERENCES `salesinvoices` (`SalesInvoiceID`),
  ADD CONSTRAINT `FK_SalesReturn_ReceivedBy` FOREIGN KEY (`ReceivedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_SalesReturn_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `stockadjustmentitems`
--
ALTER TABLE `stockadjustmentitems`
  ADD CONSTRAINT `FK_AdjItems_Adjustment` FOREIGN KEY (`AdjustmentID`) REFERENCES `stockadjustments` (`AdjustmentID`),
  ADD CONSTRAINT `FK_AdjItems_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`),
  ADD CONSTRAINT `FK_AdjItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_AdjItems_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_AdjItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `stockadjustments`
--
ALTER TABLE `stockadjustments`
  ADD CONSTRAINT `FK_Adjustment_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Adjustment_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `stockbalances`
--
ALTER TABLE `stockbalances`
  ADD CONSTRAINT `FK_StockBalance_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`),
  ADD CONSTRAINT `FK_StockBalance_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_StockBalance_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_StockBalance_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `stockissuenoteitems`
--
ALTER TABLE `stockissuenoteitems`
  ADD CONSTRAINT `FK_IssueItems_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`),
  ADD CONSTRAINT `FK_IssueItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_IssueItems_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_IssueItems_Note` FOREIGN KEY (`IssueNoteID`) REFERENCES `stockissuenotes` (`IssueNoteID`),
  ADD CONSTRAINT `FK_IssueItems_SOItem` FOREIGN KEY (`SOItemID`) REFERENCES `salesorderitems` (`SOItemID`),
  ADD CONSTRAINT `FK_IssueItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `stockissuenotes`
--
ALTER TABLE `stockissuenotes`
  ADD CONSTRAINT `FK_IssueNote_Customer` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`),
  ADD CONSTRAINT `FK_IssueNote_IssuedBy` FOREIGN KEY (`IssuedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_IssueNote_SO` FOREIGN KEY (`SOID`) REFERENCES `salesorders` (`SOID`),
  ADD CONSTRAINT `FK_IssueNote_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `stockmovements`
--
ALTER TABLE `stockmovements`
  ADD CONSTRAINT `FK_Movement_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`),
  ADD CONSTRAINT `FK_Movement_CreatedBy` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Movement_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_Movement_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_Movement_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `stockreservations`
--
ALTER TABLE `stockreservations`
  ADD CONSTRAINT `FK_Reservation_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_Reservation_User` FOREIGN KEY (`ReservedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Reservation_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `stocktransferitems`
--
ALTER TABLE `stocktransferitems`
  ADD CONSTRAINT `FK_TransferItems_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`),
  ADD CONSTRAINT `FK_TransferItems_FromLoc` FOREIGN KEY (`FromLocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_TransferItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_TransferItems_ToLoc` FOREIGN KEY (`ToLocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_TransferItems_Transfer` FOREIGN KEY (`TransferID`) REFERENCES `stocktransfers` (`TransferID`),
  ADD CONSTRAINT `FK_TransferItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `stocktransfers`
--
ALTER TABLE `stocktransfers`
  ADD CONSTRAINT `FK_Transfer_FromWH` FOREIGN KEY (`FromWarehouseID`) REFERENCES `warehouses` (`WarehouseID`),
  ADD CONSTRAINT `FK_Transfer_ReceivedBy` FOREIGN KEY (`ReceivedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Transfer_RequestedBy` FOREIGN KEY (`RequestedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Transfer_ToWH` FOREIGN KEY (`ToWarehouseID`) REFERENCES `warehouses` (`WarehouseID`),
  ADD CONSTRAINT `FK_Transfer_TransferredBy` FOREIGN KEY (`TransferredByUserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `suggestedsellingprices`
--
ALTER TABLE `suggestedsellingprices`
  ADD CONSTRAINT `FK_SugPrice_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`);

--
-- Constraints for table `supplierinvoiceitems`
--
ALTER TABLE `supplierinvoiceitems`
  ADD CONSTRAINT `FK_SIItems_GRNItem` FOREIGN KEY (`GRNItemID`) REFERENCES `grnitems` (`GRNItemID`),
  ADD CONSTRAINT `FK_SIItems_Invoice` FOREIGN KEY (`SupplierInvoiceID`) REFERENCES `supplierinvoices` (`SupplierInvoiceID`),
  ADD CONSTRAINT `FK_SIItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_SIItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `supplierinvoices`
--
ALTER TABLE `supplierinvoices`
  ADD CONSTRAINT `FK_SI_ApprovedBy` FOREIGN KEY (`ApprovedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_SI_GRN` FOREIGN KEY (`GRNID`) REFERENCES `goodsreceiptnotes` (`GRNID`),
  ADD CONSTRAINT `FK_SI_PO` FOREIGN KEY (`POID`) REFERENCES `purchaseorders` (`POID`),
  ADD CONSTRAINT `FK_SI_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`),
  ADD CONSTRAINT `FK_SI_VerifiedBy` FOREIGN KEY (`VerifiedByUserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `supplieritems`
--
ALTER TABLE `supplieritems`
  ADD CONSTRAINT `FK_SupplierItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_SupplierItems_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `supplierquotationitems`
--
ALTER TABLE `supplierquotationitems`
  ADD CONSTRAINT `FK_SQItems_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_SQItems_Quotation` FOREIGN KEY (`QuotationID`) REFERENCES `supplierquotations` (`QuotationID`),
  ADD CONSTRAINT `FK_SQItems_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `supplierquotations`
--
ALTER TABLE `supplierquotations`
  ADD CONSTRAINT `FK_SQ_ReceivedBy` FOREIGN KEY (`ReceivedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_SQ_RFQ` FOREIGN KEY (`RFQID`) REFERENCES `requestforquotations` (`RFQID`),
  ADD CONSTRAINT `FK_SQ_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `FK_Suppliers_ApprovedBy` FOREIGN KEY (`ApprovedBy`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `supplier_banks`
--
ALTER TABLE `supplier_banks`
  ADD CONSTRAINT `FK8mxbutlvfr92dnirvbemgd3lj` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `supplier_items`
--
ALTER TABLE `supplier_items`
  ADD CONSTRAINT `FKa8a4uxfsiafct1jqqcw445niy` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FKe4gfq4datiuw0yn44vvdretx0` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `unitsofmeasure`
--
ALTER TABLE `unitsofmeasure`
  ADD CONSTRAINT `FK_Units_BaseUnit` FOREIGN KEY (`BaseUnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `FK_Users_Employee` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`),
  ADD CONSTRAINT `FK_Users_Role` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`);

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `FK_Vehicle_Driver` FOREIGN KEY (`DriverID`) REFERENCES `employees` (`EmployeeID`);

--
-- Constraints for table `warehouselocations`
--
ALTER TABLE `warehouselocations`
  ADD CONSTRAINT `FK_Locations_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD CONSTRAINT `FK_Warehouses_Manager` FOREIGN KEY (`ManagerID`) REFERENCES `employees` (`EmployeeID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
