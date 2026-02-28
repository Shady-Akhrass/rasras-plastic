-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 28, 2026 at 01:58 PM
-- Server version: 8.4.3
-- PHP Version: 8.2.28

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
(146, 84, 12, 1, '2026-02-21 11:10:28', 'Approved', NULL, NULL, NULL),
(147, 85, 23, 1, '2026-02-25 14:59:09', 'Approved', NULL, NULL, NULL),
(148, 86, 20, 1, '2026-02-25 14:59:29', 'Approved', NULL, NULL, NULL),
(149, 86, 21, 1, '2026-02-25 14:59:31', 'Approved', NULL, NULL, NULL),
(150, 86, 22, 1, '2026-02-25 14:59:36', 'Approved', NULL, NULL, NULL),
(151, 87, 28, 1, '2026-02-25 14:59:55', 'Approved', NULL, NULL, NULL),
(152, 87, 29, 1, '2026-02-25 14:59:59', 'Approved', NULL, NULL, NULL),
(153, 88, 26, 1, '2026-02-25 15:00:28', 'Approved', NULL, NULL, NULL),
(154, 88, 27, 1, '2026-02-25 15:00:30', 'Approved', NULL, NULL, NULL),
(155, 89, 1, 1, '2026-02-25 18:42:29', 'Approved', NULL, NULL, NULL),
(156, 90, 16, 1, '2026-02-25 18:43:51', 'Approved', NULL, NULL, NULL),
(157, 90, 17, 1, '2026-02-25 18:43:53', 'Approved', NULL, NULL, NULL),
(158, 90, 18, 1, '2026-02-25 18:43:55', 'Approved', NULL, NULL, NULL),
(159, 91, 19, 1, '2026-02-25 18:44:26', 'Approved', NULL, NULL, NULL);

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
(84, 13, 'PaymentVoucher', 6, 'PV-6', 1, '2026-02-21 11:10:03', 12, 'Approved', 26945.00, 'Normal', NULL, NULL, '2026-02-21 11:10:28'),
(85, 20, 'SalesQuotation', 1, 'SQ-1', 1, '2026-02-25 14:59:06', 23, 'Approved', 10501.68, 'Normal', NULL, NULL, '2026-02-25 14:59:09'),
(86, 4, 'SalesOrder', 1, 'SO-1', 1, '2026-02-25 14:59:26', 22, 'Approved', 10501.68, 'Normal', NULL, NULL, '2026-02-25 14:59:36'),
(87, 23, 'StockIssueNote', 1, 'SIN-1', 1, '2026-02-25 14:59:52', 29, 'Approved', 0.00, 'Normal', NULL, NULL, '2026-02-25 14:59:59'),
(88, 22, 'DeliveryOrder', 1, 'DO-1', 1, '2026-02-25 15:00:25', 27, 'Approved', 3000.00, 'Normal', NULL, NULL, '2026-02-25 15:00:30'),
(89, 5, 'PurchaseRequisition', 18, '#PR-8', 1, '2026-02-25 18:42:19', 1, 'Approved', NULL, 'Normal', NULL, NULL, '2026-02-25 18:42:29'),
(90, 8, 'QuotationComparison', 16, '#COMP-8', 1, '2026-02-25 18:43:45', 18, 'Approved', 14581.00, 'Normal', NULL, NULL, '2026-02-25 18:43:55'),
(91, 7, 'GoodsReceiptNote', 1, '#GRN-1', 1, '2026-02-25 18:44:20', 19, 'Approved', 14581.00, 'Normal', NULL, NULL, '2026-02-25 18:44:26');

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
  `productId` int DEFAULT NULL,
  `deliveryOrderId` int DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customerrequestdeliveryschedules`
--

INSERT INTO `customerrequestdeliveryschedules` (`scheduleId`, `deliveryDate`, `notes`, `quantity`, `RequestID`, `productId`, `deliveryOrderId`, `status`) VALUES
(1, '2026-02-25', '', 7.00, 1, 2, 1, 'Fulfilled');

-- --------------------------------------------------------

--
-- Table structure for table `customerrequestitems`
--

CREATE TABLE `customerrequestitems` (
  `itemId` int NOT NULL,
  `notes` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `productId` int DEFAULT NULL,
  `productName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` decimal(18,2) NOT NULL,
  `RequestID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customerrequestitems`
--

INSERT INTO `customerrequestitems` (`itemId`, `notes`, `productId`, `productName`, `quantity`, `RequestID`) VALUES
(1, '', 2, 'صنف 2', 7.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `customerrequests`
--

CREATE TABLE `customerrequests` (
  `requestId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL,
  `createdBy` int DEFAULT NULL,
  `customerId` int NOT NULL,
  `notes` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `requestDate` date NOT NULL,
  `requestNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approvedAt` datetime(6) DEFAULT NULL,
  `approvedBy` int DEFAULT NULL,
  `rejectionReason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `priceListId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customerrequests`
--

INSERT INTO `customerrequests` (`requestId`, `createdAt`, `createdBy`, `customerId`, `notes`, `requestDate`, `requestNumber`, `status`, `approvedAt`, `approvedBy`, `rejectionReason`, `priceListId`) VALUES
(1, '2026-02-25 14:58:43.643846', NULL, 1, '', '2026-02-25', 'CR-1', 'Approved', '2026-02-25 14:58:49.861453', NULL, NULL, 11);

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
  `UpdatedBy` int DEFAULT NULL,
  `TotalInvoiced` decimal(38,2) DEFAULT NULL,
  `TotalPaid` decimal(38,2) DEFAULT NULL,
  `TotalReturned` decimal(38,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`CustomerID`, `CustomerCode`, `CustomerNameAr`, `CustomerNameEn`, `CustomerType`, `CustomerClass`, `TaxRegistrationNo`, `CommercialRegNo`, `Address`, `City`, `Country`, `Phone`, `Fax`, `Email`, `Website`, `ContactPerson`, `ContactPhone`, `PaymentTermDays`, `CreditLimit`, `CurrentBalance`, `Currency`, `SalesRepID`, `PriceListID`, `DiscountPercentage`, `IsApproved`, `ApprovedBy`, `ApprovedDate`, `IsActive`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `TotalInvoiced`, `TotalPaid`, `TotalReturned`) VALUES
(1, 'crm-2', 'شركة المتحدة', 'Almotaheda', 'COMPANY', 'C', '', '', '', '', 'Egypt', '', '', '', '', '', '', 0, 0.00, 0.00, 'EGP', NULL, NULL, 0.00, 0, NULL, NULL, 1, '', '2026-02-25 14:58:29', NULL, NULL, NULL, 0.00, 0.00, 0.00);

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
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `OtherCosts` decimal(18,2) DEFAULT NULL,
  `ScheduleID` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deliveryorders`
--

INSERT INTO `deliveryorders` (`DeliveryOrderID`, `DeliveryOrderNumber`, `OrderDate`, `IssueNoteID`, `CustomerID`, `DeliveryAddress`, `ZoneID`, `DeliveryType`, `VehicleID`, `ContractorID`, `DriverName`, `DriverPhone`, `ScheduledDate`, `ScheduledTime`, `ActualDeliveryDate`, `DeliveryCost`, `IsCostOnCustomer`, `Status`, `ReceiverName`, `ReceiverPhone`, `ReceiverSignature`, `PODAttachmentPath`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalStatus`, `OtherCosts`, `ScheduleID`) VALUES
(1, 'DO-1', '2026-02-25 15:00:24', 1, 1, '', NULL, NULL, 3, NULL, 'sohial', '05966452342', '2026-02-25', NULL, NULL, 3000.00, 0, 'Completed', NULL, NULL, NULL, NULL, '', '2026-02-25 15:00:24', 1, '2026-02-25 15:00:30', 1, 'Approved', 0.00, 1);

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
-- Table structure for table `flyway_schema_history`
--

CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `flyway_schema_history`
--

INSERT INTO `flyway_schema_history` (`installed_rank`, `version`, `description`, `type`, `script`, `checksum`, `installed_by`, `installed_on`, `execution_time`, `success`) VALUES
(1, '1', '<< Flyway Baseline >>', 'BASELINE', '<< Flyway Baseline >>', NULL, 'root', '2026-02-25 14:32:12', 0, 1),
(2, '2', 'permission dependencies', 'SQL', 'V2__permission_dependencies.sql', 221955853, 'root', '2026-02-23 20:08:51', 51, 1),
(3, '3', 'path permission procurement sales supplier invoice', 'SQL', 'V3__path_permission_procurement_sales_supplier_invoice.sql', 734041160, 'root', '2026-02-24 06:26:14', 4, 1),
(4, '4', 'path permission suppliers invoices', 'SQL', 'V4__path_permission_suppliers_invoices.sql', -233064375, 'root', '2026-02-24 06:46:57', 6, 1),
(5, '5', 'path permission crm units inventory grn', 'SQL', 'V5__path_permission_crm_units_inventory_grn.sql', -550347564, 'root', '2026-02-24 07:35:39', 10, 1),
(6, '6', 'path permission grn section procurement', 'SQL', 'V6__path_permission_grn_section_procurement.sql', 34980667, 'root', '2026-02-24 08:31:07', 5, 1);

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
  `GradeName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
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
-- Table structure for table `path_permission`
--

CREATE TABLE `path_permission` (
  `PathPermissionID` int NOT NULL,
  `HttpMethod` varchar(10) NOT NULL,
  `PathPattern` varchar(255) NOT NULL,
  `PathType` enum('API','FRONTEND') NOT NULL,
  `Priority` int NOT NULL,
  `PermissionID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `path_permission`
--

INSERT INTO `path_permission` (`PathPermissionID`, `HttpMethod`, `PathPattern`, `PathType`, `Priority`, `PermissionID`) VALUES
(1, 'GET', '/api/permissions/path-rules', 'API', 25, 110),
(2, '*', '/api/settings/database/**', 'API', 10, 33),
(3, '*', '/api/roles/**', 'API', 10, 34),
(4, '*', '/api/approval-limits/**', 'API', 10, 34),
(5, '*', '/api/settings/database/**', 'API', 20, 34),
(6, '*', '/api/settings/**', 'API', 10, 34),
(7, 'GET', '/api/company', 'API', 10, 110),
(8, 'PUT', '/api/company', 'API', 10, 34),
(9, '*', '/api/users/**', 'API', 10, 26),
(10, '*', '/api/procurement/**', 'API', 10, 33),
(11, '*', '/api/suppliers/**', 'API', 10, 33),
(12, '*', '/api/inventory/grn/**', 'API', 20, 33),
(13, '*', '/api/inventory/quality-parameters/**', 'API', 20, 30),
(14, '*', '/api/inventory/price-lists/**', 'API', 20, 30),
(15, '*', '/api/inventory/**', 'API', 10, 29),
(16, '*', '/api/units/**', 'API', 10, 29),
(17, '*', '/api/stock-movements/**', 'API', 10, 29),
(18, '*', '/api/sales/**', 'API', 10, 31),
(19, '*', '/api/finance/**', 'API', 10, 28),
(20, 'GET', '/api/journal-entries/**', 'API', 10, 35),
(21, 'POST', '/api/journal-entries', 'API', 20, 36),
(22, 'POST', '/api/journal-entries/*/post', 'API', 20, 39),
(23, 'PUT', '/api/journal-entries/**', 'API', 10, 37),
(24, 'DELETE', '/api/journal-entries/**', 'API', 10, 38),
(25, 'GET', '/api/employees/me', 'API', 25, 110),
(26, 'PUT', '/api/employees/me', 'API', 25, 110),
(27, 'GET', '/api/employees/list', 'API', 25, 110),
(28, 'GET', '/api/employees/departments', 'API', 25, 110),
(29, 'GET', '/api/employees/by-department', 'API', 25, 110),
(30, 'GET', '/api/employees/by-role', 'API', 25, 110),
(31, '*', '/api/employees/**', 'API', 10, 27),
(32, '*', '/api/hr/**', 'API', 10, 27),
(33, '*', '/api/crm/**', 'API', 10, 32),
(34, '*', '/api/dashboard/**', 'API', 10, 110),
(35, 'POST', '/api/upload', 'API', 10, 111),
(36, 'GET', '/api/approvals/pending', 'API', 25, 110),
(37, '*', '/api/approvals/**', 'API', 10, 112),
(38, '*', '/api/procurement/**', 'API', 10, 31),
(39, '*', '/api/procurement/**', 'API', 10, 41),
(40, '*', '/api/suppliers/**', 'API', 10, 41),
(41, '*', '/api/suppliers/**', 'API', 10, 28),
(42, '*', '/api/crm/**', 'API', 10, 31),
(43, '*', '/api/units/**', 'API', 10, 41),
(44, '*', '/api/inventory/**', 'API', 10, 30),
(45, '*', '/api/inventory/**', 'API', 10, 41),
(46, '*', '/api/inventory/**', 'API', 10, 13),
(47, '*', '/api/inventory/grn/**', 'API', 20, 29),
(48, '*', '/api/inventory/grn/**', 'API', 20, 30),
(49, '*', '/api/inventory/grn/**', 'API', 20, 13);

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
(28, 'SECTION_FINANCE', 'المالية والمحاسبة', 'Finance & Accounting', 'MENU', NULL, NULL, 1),
(29, 'SECTION_WAREHOUSE', 'المخازن', 'Warehouse', 'MENU', NULL, NULL, 1),
(30, 'SECTION_OPERATIONS', 'العمليات', 'Operations', 'MENU', NULL, NULL, 1),
(31, 'SECTION_SALES', 'المبيعات', 'Sales', 'MENU', NULL, NULL, 1),
(32, 'SECTION_CRM', 'العملاء (CRM)', 'CRM', 'MENU', NULL, NULL, 1),
(33, 'SECTION_PROCUREMENT', 'المشتريات', 'Procurement', 'MENU', NULL, NULL, 1),
(34, 'SECTION_SYSTEM', 'إعدادات النظام', 'System Settings', 'MENU', NULL, NULL, 1),
(35, 'ACCOUNTING_VIEW', 'عرض القيود المحاسبية', 'View Journal Entries', 'ACCOUNTING', NULL, NULL, 1),
(36, 'ACCOUNTING_CREATE', 'إنشاء قيد محاسبي', 'Create Journal Entry', 'ACCOUNTING', NULL, NULL, 1),
(37, 'ACCOUNTING_UPDATE', 'تعديل قيد محاسبي', 'Update Journal Entry', 'ACCOUNTING', NULL, NULL, 1),
(38, 'ACCOUNTING_DELETE', 'حذف قيد محاسبي', 'Delete Journal Entry', 'ACCOUNTING', NULL, NULL, 1),
(39, 'ACCOUNTING_POST', 'ترحيل قيد محاسبي', 'Post Journal Entry', 'ACCOUNTING', NULL, NULL, 1),
(40, 'SUPPLIER_INVOICE_CREATE', 'إنشاء فاتورة مورد', 'Create Supplier Invoice', 'SUPPLIER_INVOICE', NULL, NULL, 1),
(41, 'SUPPLIER_INVOICE_VIEW', 'عرض فواتير الموردين', 'View Supplier Invoices', 'SUPPLIER_INVOICE', NULL, NULL, 1),
(42, 'SUPPLIER_INVOICE_REVIEW', 'مراجعة/مطابقة فاتورة', 'Review/Match Supplier Invoice', 'SUPPLIER_INVOICE', NULL, NULL, 1),
(43, 'SUPPLIER_INVOICE_APPROVE', 'اعتماد صرف فاتورة', 'Approve Supplier Invoice Payment', 'SUPPLIER_INVOICE', NULL, NULL, 1),
(44, 'SUPPLIER_INVOICE_PAY', 'دفع فاتورة (سند صرف)', 'Pay Supplier Invoice', 'SUPPLIER_INVOICE', NULL, NULL, 1),
(45, 'MENU_MAIN_DASHBOARD', 'لوحة القيادة', 'Dashboard', 'MENU', NULL, NULL, 1),
(46, 'MENU_MAIN_APPROVALS', 'الطلبات والاعتمادات', 'Approvals', 'MENU', NULL, NULL, 1),
(47, 'MENU_MAIN_APPROVALS_AUDIT', 'سجل الاعتماد', 'Approval Audit', 'MENU', NULL, NULL, 1),
(48, 'MENU_MAIN_USERS', 'المستخدمين', 'Users', 'MENU', NULL, NULL, 1),
(49, 'MENU_HR_EMPLOYEES', 'الموظفين', 'Employees', 'MENU', NULL, NULL, 1),
(50, 'MENU_HR_LEAVE_TYPES', 'أنواع الإجازات', 'Leave Types', 'MENU', NULL, NULL, 1),
(51, 'MENU_HR_SHIFTS', 'الشفتات', 'Shifts', 'MENU', NULL, NULL, 1),
(52, 'MENU_HR_HOLIDAYS', 'العطلات', 'Holidays', 'MENU', NULL, NULL, 1),
(53, 'MENU_HR_EMPLOYEE_SHIFTS', 'شفتات الموظفين', 'Employee Shifts', 'MENU', NULL, NULL, 1),
(54, 'MENU_HR_ATTENDANCE', 'الحضور والانصراف', 'Attendance', 'MENU', NULL, NULL, 1),
(55, 'MENU_HR_PAYROLL', 'المرتبات', 'Payroll', 'MENU', NULL, NULL, 1),
(56, 'MENU_PROCUREMENT_PR', 'طلبات الشراء (PR)', 'Purchase Requisitions', 'MENU', NULL, NULL, 1),
(57, 'MENU_PROCUREMENT_RFQ', 'طلبات عروض الأسعار (RFQ)', 'RFQ', 'MENU', NULL, NULL, 1),
(58, 'MENU_PROCUREMENT_QUOTATION', 'عروض الموردين', 'Quotations', 'MENU', NULL, NULL, 1),
(59, 'MENU_PROCUREMENT_COMPARISON', 'مقارنة العروض (QCS)', 'Comparison', 'MENU', NULL, NULL, 1),
(60, 'MENU_PROCUREMENT_PO', 'أوامر الشراء (PO)', 'Purchase Orders', 'MENU', NULL, NULL, 1),
(61, 'MENU_PROCUREMENT_WAITING_IMPORTS', 'الشحنات القادمة', 'Waiting Imports', 'MENU', NULL, NULL, 1),
(62, 'MENU_PROCUREMENT_GRN', 'إذن استلام (GRN)', 'GRN', 'MENU', NULL, NULL, 1),
(63, 'MENU_PROCUREMENT_INVOICES', 'فواتير الموردين', 'Supplier Invoices', 'MENU', NULL, NULL, 1),
(64, 'MENU_PROCUREMENT_OUTSTANDING', 'الأرصدة المستحقة', 'Outstanding', 'MENU', NULL, NULL, 1),
(65, 'MENU_PROCUREMENT_RETURNS', 'مرتجعات الشراء', 'Returns', 'MENU', NULL, NULL, 1),
(66, 'MENU_PROCUREMENT_SUPPLIERS', 'الموردين', 'Suppliers', 'MENU', NULL, NULL, 1),
(67, 'MENU_SALES_SECTIONS', 'قسم المبيعات', 'Sales Sections', 'MENU', NULL, NULL, 1),
(68, 'MENU_SALES_PURCHASE_REQUISITIONS', 'طلبات الشراء', 'Purchase Requisitions', 'MENU', NULL, NULL, 1),
(69, 'MENU_SALES_CUSTOMER_REQUESTS', 'طلبات العملاء', 'Customer Requests', 'MENU', NULL, NULL, 1),
(70, 'MENU_SALES_QUOTATIONS', 'عروض الأسعار', 'Quotations', 'MENU', NULL, NULL, 1),
(71, 'MENU_SALES_ORDERS', 'أوامر البيع (SO)', 'Sales Orders', 'MENU', NULL, NULL, 1),
(72, 'MENU_SALES_ISSUE_NOTES', 'إذونات الصرف', 'Issue Notes', 'MENU', NULL, NULL, 1),
(73, 'MENU_SALES_DELIVERY_ORDERS', 'أوامر التوصيل', 'Delivery Orders', 'MENU', NULL, NULL, 1),
(74, 'MENU_SALES_VEHICLES', 'المركبات', 'Vehicles', 'MENU', NULL, NULL, 1),
(75, 'MENU_SALES_INVOICES', 'فواتير المبيعات', 'Sales Invoices', 'MENU', NULL, NULL, 1),
(76, 'MENU_SALES_RECEIPTS', 'إيصالات الدفع', 'Receipts', 'MENU', NULL, NULL, 1),
(77, 'MENU_CRM_CUSTOMERS', 'العملاء', 'Customers', 'MENU', NULL, NULL, 1),
(78, 'MENU_FINANCE_INVOICES', 'فواتير الموردين', 'Supplier Invoices', 'MENU', NULL, NULL, 1),
(79, 'MENU_FINANCE_PAYMENT_VOUCHERS', 'سندات الدفع', 'Payment Vouchers', 'MENU', NULL, NULL, 1),
(80, 'MENU_FINANCE_PAYMENT_VOUCHERS_NEW', 'سند صرف جديد', 'New Payment Voucher', 'MENU', NULL, NULL, 1),
(81, 'MENU_WAREHOUSE_SECTIONS', 'أقسام المخزن', 'Sections', 'MENU', NULL, NULL, 1),
(82, 'MENU_WAREHOUSE_WAREHOUSES', 'المستودعات', 'Warehouses', 'MENU', NULL, NULL, 1),
(83, 'MENU_WAREHOUSE_STOCKS', 'أرصدة المخزون', 'Stocks', 'MENU', NULL, NULL, 1),
(84, 'MENU_WAREHOUSE_ISSUE', 'إذن صرف', 'Issue', 'MENU', NULL, NULL, 1),
(85, 'MENU_WAREHOUSE_TRANSFER', 'تحويل بين مخازن', 'Transfer', 'MENU', NULL, NULL, 1),
(86, 'MENU_WAREHOUSE_BELOW_MIN', 'الأصناف تحت الحد الأدنى', 'Below Min', 'MENU', NULL, NULL, 1),
(87, 'MENU_WAREHOUSE_STAGNANT', 'الأصناف الراكدة', 'Stagnant', 'MENU', NULL, NULL, 1),
(88, 'MENU_WAREHOUSE_MOVEMENT', 'حركة الصنف التفصيلية', 'Movement', 'MENU', NULL, NULL, 1),
(89, 'MENU_WAREHOUSE_COUNT', 'جرد دوري', 'Count', 'MENU', NULL, NULL, 1),
(90, 'MENU_WAREHOUSE_COUNT_SURPRISE', 'جرد مفاجئ', 'Surprise Count', 'MENU', NULL, NULL, 1),
(91, 'MENU_WAREHOUSE_PERIODIC_INVENTORY', 'تقرير المخزون الدوري', 'Periodic Inventory', 'MENU', NULL, NULL, 1),
(92, 'MENU_WAREHOUSE_VARIANCE', 'تقرير الفروقات', 'Variance', 'MENU', NULL, NULL, 1),
(93, 'MENU_OPERATIONS_QUALITY_INSPECTION', 'فحص الجودة', 'Quality Inspection', 'MENU', NULL, NULL, 1),
(94, 'MENU_OPERATIONS_QUALITY_PARAMETERS', 'معاملات الجودة', 'Quality Parameters', 'MENU', NULL, NULL, 1),
(95, 'MENU_OPERATIONS_CATEGORIES', 'تصنيفات الأصناف', 'Categories', 'MENU', NULL, NULL, 1),
(96, 'MENU_OPERATIONS_ITEMS', 'الأصناف', 'Items', 'MENU', NULL, NULL, 1),
(97, 'MENU_OPERATIONS_PRICE_LISTS', 'قوائم الأسعار', 'Price Lists', 'MENU', NULL, NULL, 1),
(98, 'MENU_SYSTEM_COMPANY', 'بيانات الشركة', 'Company', 'MENU', NULL, NULL, 1),
(99, 'MENU_SYSTEM_UNITS', 'وحدات القياس', 'Units', 'MENU', NULL, NULL, 1),
(100, 'MENU_SYSTEM_SETTINGS', 'إعدادات النظام', 'System Settings', 'MENU', NULL, NULL, 1),
(101, 'MENU_SYSTEM_USERS', 'إدارة المستخدمين', 'Users', 'MENU', NULL, NULL, 1),
(102, 'MENU_SYSTEM_ROLES', 'الأدوار والصلاحيات', 'Roles', 'MENU', NULL, NULL, 1),
(103, 'MENU_SYSTEM_PERMISSIONS', 'سجل الصلاحيات', 'Permissions', 'MENU', NULL, NULL, 1),
(104, 'MENU_SYSTEM_SECURITY', 'الأمان والخصوصية', 'Security', 'MENU', NULL, NULL, 1),
(105, 'MENU_SYSTEM_NOTIFICATIONS', 'الإشعارات', 'Notifications', 'MENU', NULL, NULL, 1),
(106, 'MENU_SYSTEM_DATABASE', 'قاعدة البيانات', 'Database', 'MENU', NULL, NULL, 1),
(107, 'MENU_MAIN_EMPLOYEE_DATA', 'بيانات الموظف', 'Employee Data', 'MENU', NULL, NULL, 1),
(108, 'MENU_WAREHOUSE_CATEGORIES', 'تصنيفات الأصناف', 'Item Categories', 'MENU', NULL, NULL, 1),
(109, 'MENU_WAREHOUSE_ITEMS', 'الأصناف', 'Items', 'MENU', NULL, NULL, 1),
(110, 'BASE_ACCESS', 'دخول أساسي', 'Base Access', 'AUTH', 'ACCESS', NULL, 1),
(111, 'FILE_UPLOAD', 'رفع ملفات', 'File Upload', 'SHARED', 'UPLOAD', NULL, 1),
(112, 'APPROVAL_ACTION', 'إجراء الاعتماد', 'Approval Action', 'APPROVAL', 'ACTION', NULL, 1),
(113, 'MENU_CRM_OUTSTANDING', 'أرصدة العملاء', 'CRM Outstanding', 'MENU', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `permission_dependencies`
--

CREATE TABLE `permission_dependencies` (
  `id` int NOT NULL,
  `permission_id` int NOT NULL,
  `requires_permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `permission_dependencies`
--

INSERT INTO `permission_dependencies` (`id`, `permission_id`, `requires_permission_id`) VALUES
(1, 46, 110),
(2, 47, 110),
(3, 45, 110),
(4, 107, 110),
(5, 48, 110),
(8, 47, 112),
(9, 48, 26),
(10, 54, 27),
(11, 49, 27),
(12, 53, 27),
(13, 52, 27),
(14, 50, 27),
(15, 55, 27),
(16, 51, 27),
(17, 59, 33),
(18, 62, 33),
(19, 63, 33),
(20, 64, 33),
(21, 60, 33),
(22, 56, 33),
(23, 58, 33),
(24, 65, 33),
(25, 57, 33),
(26, 66, 33),
(27, 61, 33),
(32, 69, 31),
(33, 73, 31),
(34, 75, 31),
(35, 72, 31),
(36, 71, 31),
(37, 68, 31),
(38, 70, 31),
(39, 76, 31),
(40, 67, 31),
(41, 74, 31),
(47, 77, 32),
(48, 78, 28),
(49, 79, 28),
(50, 80, 28),
(51, 86, 29),
(52, 108, 29),
(53, 89, 29),
(54, 90, 29),
(55, 84, 29),
(56, 109, 29),
(57, 88, 29),
(58, 91, 29),
(59, 81, 29),
(60, 87, 29),
(61, 83, 29),
(62, 85, 29),
(63, 92, 29),
(64, 82, 29),
(66, 95, 30),
(67, 96, 30),
(68, 97, 30),
(69, 93, 30),
(70, 94, 30),
(73, 95, 29),
(74, 96, 29),
(76, 98, 34),
(77, 106, 34),
(78, 105, 34),
(79, 103, 34),
(80, 102, 34),
(81, 104, 34),
(82, 100, 34),
(83, 99, 34),
(84, 101, 34);

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
(70, 21, 2, NULL, 500.000, 11, 6500.0000, 20.00, NULL, 14.00, NULL, 2964000.00, 500.000, NULL, 'Received', NULL, NULL),
(71, 22, 2, NULL, 1.000, 11, 7000.0000, 5.00, NULL, 14.00, NULL, 7581.00, 1.000, NULL, 'Received', NULL, NULL);

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
(21, 'PO-7', '2026-02-21 09:11:28', 17, 27, 2, '2026-02-26', NULL, NULL, NULL, NULL, 'EGP', 1.000000, 2964000.00, 0.00, 0.00, 0.00, 20000.00, 16000.00, 3000000.00, 'PartiallyReceived', 'Approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Auto-generated from Approved Comparison: #COMP-7', NULL, NULL, '2026-02-21 09:11:28', 1, '2026-02-21 09:12:01', 1, NULL),
(22, 'PO-8', '2026-02-25 18:43:55', 18, 28, 1, '2026-03-02', NULL, NULL, NULL, NULL, 'EGP', 1.000000, 7581.00, 0.00, 0.00, 0.00, 7000.00, 0.00, 14581.00, 'Closed', 'Approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Auto-generated from Approved Comparison: #COMP-8', NULL, NULL, '2026-02-25 18:43:55', 1, '2026-02-25 18:44:06', 1, NULL);

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
(61, 17, 2, 500.000, 11, NULL, NULL, NULL, NULL, ''),
(62, 18, 2, 1.000, 11, NULL, NULL, NULL, NULL, '');

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
(17, '#PR-7', '2026-02-20 22:00:00', 6, 1, '2026-03-05', 'Normal', 'Approved', NULL, '', NULL, '2026-02-21 09:09:39', NULL, '', '2026-02-21 09:09:35', 1, '2026-02-21 09:09:39', NULL),
(18, '#PR-8', '2026-02-24 22:00:00', 8, 1, '2026-02-26', 'High', 'Approved', NULL, '', NULL, '2026-02-25 18:42:29', NULL, '', '2026-02-25 18:42:19', 1, '2026-02-25 18:42:29', NULL);

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
(14, 'QI-1771665131455-2', '2026-02-21 09:12:11', 'Incoming', 'GRN', 13, 2, NULL, NULL, 1, 'Passed', 'Completed', NULL, '', '2026-02-21 09:12:11', NULL, NULL, '2026-02-21 09:12:11', 1),
(15, 'QI-8', '2026-02-25 18:44:20', 'Incoming', 'GRN', 1, 2, NULL, NULL, 1, 'Passed', 'Completed', NULL, '', '2026-02-25 18:44:20', NULL, NULL, '2026-02-25 18:44:20', 1);

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
(225, 15, 27, 2, 6500.0000, 3000000.00, '', 5, 10, 10, 10.00, '', 20000.00, 'a'),
(226, 16, 28, 1, 7000.0000, 14581.00, '', 5, 10, 10, 10.00, '', 7000.00, 'a');

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
(15, '#COMP-7', '2026-02-21 09:11:08', 17, 2, 27, 2, 'أفضل عرض متكامل (سعر وتوريد)', 'Approved', NULL, NULL, NULL, NULL, NULL, '2026-02-21 09:11:08', 1, 'Approved', NULL, NULL, NULL, NULL, NULL, 0, NULL),
(16, '#COMP-8', '2026-02-25 18:43:45', 18, 2, 28, 1, 'أفضل عرض متكامل (سعر وتوريد)', 'Approved', NULL, NULL, NULL, NULL, NULL, '2026-02-25 18:43:45', 1, 'Approved', NULL, NULL, NULL, NULL, NULL, 0, NULL);

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

--
-- Dumping data for table `receiptvoucherallocations`
--

INSERT INTO `receiptvoucherallocations` (`AllocationID`, `ReceiptVoucherID`, `SalesInvoiceID`, `AllocatedAmount`, `AllocationDate`, `Notes`) VALUES
(1, 1, 1, 13501.68, '2026-02-24 22:00:00', NULL);

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

--
-- Dumping data for table `receiptvouchers`
--

INSERT INTO `receiptvouchers` (`ReceiptVoucherID`, `VoucherNumber`, `VoucherDate`, `CustomerID`, `PayerName`, `PaymentMethod`, `CashRegisterID`, `BankAccountID`, `ChequeID`, `Currency`, `ExchangeRate`, `Amount`, `AmountInWords`, `ReferenceType`, `ReferenceID`, `Description`, `Status`, `JournalEntryID`, `ReceivedByUserID`, `PostedByUserID`, `PostedDate`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalStatus`) VALUES
(1, 'RCP-1', '2026-02-24 22:00:00', 1, NULL, 'Cash', NULL, NULL, NULL, 'EGP', 1.000000, 13501.68, NULL, NULL, NULL, 'مقبوضات للفاتورة رقم INV-1', 'Posted', NULL, 1, NULL, NULL, '', '2026-02-25 19:03:09', 1, '2026-02-25 19:03:09.455228', 1, 'Approved');

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
(37, '#RFQ-10', '2026-02-21', 17, 2, '2026-02-24', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-7 ', '2026-02-21 09:10:02', 1),
(38, '#RFQ-11', '2026-02-25', 18, 1, '2026-02-28', 'Sent', NULL, NULL, 'تم الإنشاء بناءً على طلب شراء: #PR-8 ', '2026-02-25 18:42:56', 1);

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
(114, 37, 2, 500.000, 11, '', 6500.0000),
(115, 38, 2, 1.000, 11, '', 0.0000);

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
(49, 10, 25, 1),
(50, 10, 30, 1),
(51, 2, 25, 1),
(52, 2, 26, 1),
(53, 2, 27, 1),
(54, 2, 28, 1),
(55, 2, 29, 1),
(56, 2, 30, 1),
(57, 2, 31, 1),
(58, 2, 32, 1),
(59, 2, 33, 1),
(60, 2, 34, 1),
(74, 9, 29, 1),
(75, 9, 25, 1),
(76, 9, 34, 1),
(215, 2, 35, 1),
(216, 2, 36, 1),
(217, 2, 37, 1),
(218, 2, 38, 1),
(219, 2, 39, 1),
(247, 2, 40, 1),
(248, 2, 41, 1),
(249, 2, 42, 1),
(250, 2, 43, 1),
(251, 2, 44, 1),
(314, 2, 46, 1),
(315, 2, 47, 1),
(316, 2, 45, 1),
(317, 2, 48, 1),
(318, 2, 54, 1),
(319, 2, 49, 1),
(320, 2, 53, 1),
(321, 2, 52, 1),
(322, 2, 50, 1),
(323, 2, 55, 1),
(324, 2, 51, 1),
(325, 2, 59, 1),
(326, 2, 62, 1),
(327, 2, 63, 1),
(328, 2, 64, 1),
(329, 2, 60, 1),
(330, 2, 56, 1),
(331, 2, 58, 1),
(332, 2, 65, 1),
(333, 2, 57, 1),
(334, 2, 66, 1),
(335, 2, 61, 1),
(336, 2, 69, 1),
(337, 2, 73, 1),
(338, 2, 75, 1),
(339, 2, 72, 1),
(340, 2, 71, 1),
(341, 2, 68, 1),
(342, 2, 70, 1),
(343, 2, 76, 1),
(344, 2, 67, 1),
(345, 2, 74, 1),
(346, 2, 77, 1),
(347, 2, 78, 1),
(348, 2, 79, 1),
(349, 2, 80, 1),
(350, 2, 86, 1),
(351, 2, 89, 1),
(352, 2, 90, 1),
(353, 2, 84, 1),
(354, 2, 88, 1),
(355, 2, 91, 1),
(356, 2, 81, 1),
(357, 2, 87, 1),
(358, 2, 83, 1),
(359, 2, 85, 1),
(360, 2, 92, 1),
(361, 2, 82, 1),
(362, 2, 95, 1),
(363, 2, 96, 1),
(364, 2, 97, 1),
(365, 2, 93, 1),
(366, 2, 94, 1),
(367, 2, 98, 1),
(368, 2, 106, 1),
(369, 2, 105, 1),
(370, 2, 103, 1),
(371, 2, 102, 1),
(372, 2, 104, 1),
(373, 2, 100, 1),
(374, 2, 99, 1),
(375, 2, 101, 1),
(383, 10, 46, 1),
(384, 10, 47, 1),
(385, 10, 45, 1),
(386, 10, 48, 1),
(387, 10, 95, 1),
(388, 10, 96, 1),
(389, 10, 97, 1),
(390, 10, 93, 1),
(391, 10, 94, 1),
(444, 9, 46, 1),
(445, 9, 47, 1),
(446, 9, 45, 1),
(447, 9, 48, 1),
(448, 9, 86, 1),
(449, 9, 89, 1),
(450, 9, 90, 1),
(451, 9, 84, 1),
(452, 9, 88, 1),
(453, 9, 91, 1),
(454, 9, 81, 1),
(455, 9, 87, 1),
(456, 9, 83, 1),
(457, 9, 85, 1),
(458, 9, 92, 1),
(459, 9, 82, 1),
(460, 1, 1, 1),
(461, 1, 2, 1),
(462, 1, 3, 1),
(463, 1, 4, 1),
(464, 1, 5, 1),
(465, 1, 6, 1),
(466, 1, 7, 1),
(467, 1, 8, 1),
(468, 1, 9, 1),
(469, 1, 10, 1),
(470, 1, 11, 1),
(471, 1, 12, 1),
(472, 1, 13, 1),
(473, 1, 14, 1),
(474, 1, 15, 1),
(475, 1, 16, 1),
(476, 1, 17, 1),
(477, 1, 18, 1),
(478, 1, 19, 1),
(479, 1, 20, 1),
(480, 1, 21, 1),
(481, 1, 22, 1),
(482, 1, 23, 1),
(483, 1, 24, 1),
(484, 1, 25, 1),
(485, 1, 26, 1),
(486, 1, 27, 1),
(487, 1, 28, 1),
(488, 1, 29, 1),
(489, 1, 30, 1),
(490, 1, 31, 1),
(491, 1, 32, 1),
(492, 1, 33, 1),
(493, 1, 34, 1),
(494, 1, 35, 1),
(495, 1, 36, 1),
(496, 1, 37, 1),
(497, 1, 38, 1),
(498, 1, 39, 1),
(499, 1, 40, 1),
(500, 1, 41, 1),
(501, 1, 42, 1),
(502, 1, 43, 1),
(503, 1, 44, 1),
(504, 1, 45, 1),
(505, 1, 46, 1),
(506, 1, 47, 1),
(507, 1, 48, 1),
(508, 1, 49, 1),
(509, 1, 50, 1),
(510, 1, 51, 1),
(511, 1, 52, 1),
(512, 1, 53, 1),
(513, 1, 54, 1),
(514, 1, 55, 1),
(515, 1, 56, 1),
(516, 1, 57, 1),
(517, 1, 58, 1),
(518, 1, 59, 1),
(519, 1, 60, 1),
(520, 1, 61, 1),
(521, 1, 62, 1),
(522, 1, 63, 1),
(523, 1, 64, 1),
(524, 1, 65, 1),
(525, 1, 66, 1),
(526, 1, 67, 1),
(527, 1, 68, 1),
(528, 1, 69, 1),
(529, 1, 70, 1),
(530, 1, 71, 1),
(531, 1, 72, 1),
(532, 1, 73, 1),
(533, 1, 74, 1),
(534, 1, 75, 1),
(535, 1, 76, 1),
(536, 1, 77, 1),
(537, 1, 78, 1),
(538, 1, 79, 1),
(539, 1, 80, 1),
(540, 1, 81, 1),
(541, 1, 82, 1),
(542, 1, 83, 1),
(543, 1, 84, 1),
(544, 1, 85, 1),
(545, 1, 86, 1),
(546, 1, 87, 1),
(547, 1, 88, 1),
(548, 1, 89, 1),
(549, 1, 90, 1),
(550, 1, 91, 1),
(551, 1, 92, 1),
(552, 1, 93, 1),
(553, 1, 94, 1),
(554, 1, 95, 1),
(555, 1, 96, 1),
(556, 1, 97, 1),
(557, 1, 98, 1),
(558, 1, 99, 1),
(559, 1, 100, 1),
(560, 1, 101, 1),
(561, 1, 102, 1),
(562, 1, 103, 1),
(563, 1, 104, 1),
(564, 1, 105, 1),
(565, 1, 106, 1),
(652, 1, 107, 1),
(653, 2, 107, 1),
(657, 10, 107, 1),
(662, 9, 107, 1),
(724, 2, 13, 1),
(725, 9, 13, 1),
(760, 4, 18, 1),
(761, 4, 19, 1),
(762, 4, 20, 1),
(763, 4, 21, 1),
(764, 4, 22, 1),
(765, 4, 23, 1),
(766, 4, 24, 1),
(767, 4, 25, 1),
(768, 4, 28, 1),
(769, 4, 33, 1),
(770, 4, 35, 1),
(771, 4, 36, 1),
(772, 4, 37, 1),
(773, 4, 38, 1),
(774, 4, 39, 1),
(775, 4, 41, 1),
(776, 4, 42, 1),
(777, 4, 43, 1),
(778, 4, 44, 1),
(779, 4, 45, 1),
(780, 4, 46, 1),
(781, 4, 47, 1),
(782, 4, 48, 1),
(783, 4, 78, 1),
(784, 4, 79, 1),
(785, 4, 80, 1),
(786, 4, 107, 1),
(787, 4, 40, 1),
(788, 7, 25, 1),
(789, 7, 31, 1),
(790, 7, 32, 1),
(791, 7, 45, 1),
(792, 7, 46, 1),
(793, 7, 47, 1),
(794, 7, 48, 1),
(795, 7, 67, 1),
(796, 7, 68, 1),
(797, 7, 69, 1),
(798, 7, 70, 1),
(799, 7, 71, 1),
(800, 7, 72, 1),
(801, 7, 73, 1),
(802, 7, 74, 1),
(803, 7, 75, 1),
(804, 7, 76, 1),
(805, 7, 77, 1),
(806, 7, 107, 1),
(807, 7, 95, 1),
(808, 7, 96, 1),
(809, 7, 97, 1),
(810, 7, 1, 1),
(811, 7, 2, 1),
(812, 7, 3, 1),
(813, 7, 4, 1),
(814, 7, 5, 1),
(815, 7, 6, 1),
(816, 7, 7, 1),
(817, 1, 108, 1),
(818, 1, 109, 1),
(819, 2, 108, 1),
(820, 2, 109, 1),
(821, 9, 108, 1),
(822, 9, 109, 1),
(823, 4, 110, 1),
(824, 1, 110, 1),
(827, 2, 110, 1),
(829, 10, 110, 1),
(830, 8, 110, 1),
(831, 7, 110, 1),
(832, 9, 110, 1),
(838, 4, 111, 1),
(839, 1, 111, 1),
(842, 2, 111, 1),
(844, 10, 111, 1),
(845, 8, 111, 1),
(846, 7, 111, 1),
(847, 9, 111, 1),
(853, 4, 112, 1),
(854, 1, 112, 1),
(857, 2, 112, 1),
(859, 10, 112, 1),
(860, 7, 112, 1),
(861, 9, 112, 1),
(993, 13, 78, 1),
(994, 13, 79, 1),
(995, 13, 80, 1),
(996, 13, 18, 1),
(997, 13, 19, 1),
(998, 13, 20, 1),
(999, 13, 21, 1),
(1000, 13, 22, 1),
(1001, 13, 23, 1),
(1002, 13, 24, 1),
(1003, 13, 25, 1),
(1004, 13, 28, 1),
(1005, 13, 29, 1),
(1006, 13, 30, 1),
(1007, 13, 96, 1),
(1008, 13, 97, 1),
(1009, 13, 34, 1),
(1010, 13, 98, 1),
(1011, 13, 35, 1),
(1012, 13, 99, 1),
(1013, 13, 36, 1),
(1014, 13, 100, 1),
(1015, 13, 37, 1),
(1016, 13, 101, 1),
(1017, 13, 38, 1),
(1018, 13, 102, 1),
(1019, 13, 39, 1),
(1020, 13, 103, 1),
(1021, 13, 40, 1),
(1022, 13, 104, 1),
(1023, 13, 41, 1),
(1024, 13, 105, 1),
(1025, 13, 42, 1),
(1026, 13, 106, 1),
(1027, 13, 107, 1),
(1028, 13, 43, 1),
(1029, 13, 44, 1),
(1030, 13, 45, 1),
(1031, 13, 46, 1),
(1032, 13, 110, 1),
(1033, 13, 47, 1),
(1034, 13, 112, 1),
(1035, 13, 48, 1),
(1085, 6, 64, 1),
(1086, 6, 96, 1),
(1087, 6, 33, 1),
(1088, 6, 65, 1),
(1089, 6, 66, 1),
(1090, 6, 40, 1),
(1091, 6, 41, 1),
(1092, 6, 107, 1),
(1093, 6, 45, 1),
(1094, 6, 110, 1),
(1095, 6, 112, 1),
(1096, 6, 56, 1),
(1097, 6, 25, 1),
(1098, 6, 57, 1),
(1099, 6, 58, 1),
(1100, 6, 59, 1),
(1101, 6, 60, 1),
(1102, 6, 29, 1),
(1103, 6, 61, 1),
(1104, 6, 30, 1),
(1105, 6, 62, 1),
(1106, 6, 63, 1),
(1107, 6, 95, 1),
(1108, 6, 46, 1),
(1109, 6, 47, 1),
(1110, 6, 48, 1),
(1111, 5, 64, 1),
(1112, 5, 65, 1),
(1113, 5, 66, 1),
(1114, 5, 8, 1),
(1115, 5, 9, 1),
(1116, 5, 10, 1),
(1117, 5, 11, 1),
(1118, 5, 12, 1),
(1119, 5, 25, 1),
(1120, 5, 93, 1),
(1121, 5, 29, 1),
(1122, 5, 30, 1),
(1123, 5, 94, 1),
(1124, 5, 95, 1),
(1125, 5, 96, 1),
(1126, 5, 33, 1),
(1127, 5, 97, 1),
(1128, 5, 34, 1),
(1129, 5, 40, 1),
(1130, 5, 41, 1),
(1131, 5, 107, 1),
(1132, 5, 45, 1),
(1133, 5, 46, 1),
(1134, 5, 110, 1),
(1135, 5, 47, 1),
(1136, 5, 111, 1),
(1137, 5, 112, 1),
(1138, 5, 56, 1),
(1139, 5, 57, 1),
(1140, 5, 58, 1),
(1141, 5, 59, 1),
(1142, 5, 60, 1),
(1143, 5, 61, 1),
(1144, 5, 62, 1),
(1145, 5, 63, 1),
(1146, 5, 48, 1);

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
(3, 'sss', ' xxxxxxxx', 'xxxxx', 'xxxxxxxxxxxxxxx', 1, '2026-01-12 23:13:08'),
(4, 'ACC', 'محاسب', 'Accountant', 'العمليات المحاسبية اليومية', 1, '2026-01-12 23:13:08'),
(5, 'PM', 'مدير المشتريات', 'Procurement Manager', 'إدارة عمليات الشراء', 1, '2026-01-12 23:13:08'),
(6, 'BUYER', 'مشتري', 'Buyer', 'تنفيذ عمليات الشراء', 1, '2026-01-12 23:13:08'),
(7, 'SM', 'مدير المبيعات', 'Sales Manager', 'إدارة عمليات البيع', 1, '2026-01-12 23:13:08'),
(8, 'SALES', 'مندوب مبيعات', 'Sales Representative', 'تنفيذ عمليات البيع', 1, '2026-01-12 23:13:08'),
(9, 'WHM', 'أمين المخزن', 'Warehouse Manager', 'إدارة المخزن', 1, '2026-01-12 23:13:08'),
(10, 'QC', 'مراقب جودة', 'Quality Controller', 'فحص ومراقبة الجودة', 1, '2026-01-12 23:13:08'),
(13, 'FM', 'المدير المالي', 'Finance Manager', '\nإدارة الشؤون المالية', 1, NULL);

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
(1, 1, 1, 2, NULL, 7.000, 11, 1400.0000, NULL, 6.00, 588.00, 14.00, 1289.68, 10501.68);

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
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `OtherCosts` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `salesinvoices`
--

INSERT INTO `salesinvoices` (`SalesInvoiceID`, `InvoiceNumber`, `InvoiceDate`, `DueDate`, `SOID`, `IssueNoteID`, `CustomerID`, `SalesRepID`, `Currency`, `ExchangeRate`, `SubTotal`, `DiscountPercentage`, `DiscountAmount`, `TaxAmount`, `ShippingCost`, `TotalAmount`, `PaidAmount`, `Status`, `EInvoiceStatus`, `EInvoiceUUID`, `EInvoiceSubmissionID`, `EInvoiceInternalID`, `EInvoiceSubmissionDate`, `EInvoiceValidationStatus`, `PaymentTerms`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `ApprovalStatus`, `DeliveryCost`, `OtherCosts`) VALUES
(1, 'INV-1', '2026-02-25 15:00:30', '2026-03-27', 1, 1, 1, NULL, 'EGP', 1.000000, 9800.00, 0.00, 588.00, 1289.68, 3000.00, 13501.68, 13501.68, 'Paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-25 15:00:30', 1, '2026-02-25 19:03:09', 1, 'Approved', 3000.00, 0.00);

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
(1, 1, 2, NULL, 7.000, 11, 1400.0000, NULL, 6.00, 0.00, 14.00, 0.00, 10501.68, 7.000, 'Pending', NULL, NULL);

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
(1, 'SO-1', '2026-02-24 22:00:00', 1, 1, NULL, NULL, NULL, '2026-03-05', 'EGP', 1.000000, NULL, 9212.00, 0.00, 0.00, 1289.68, 0.00, 13501.68, '', NULL, 'Approved', NULL, NULL, NULL, 1, '2026-02-25 14:59:36', '', '2026-02-25 14:59:26', 1, '2026-02-25 15:00:25', 1, 'Approved', 3000.00, 0.00);

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
(1, 1, 2, NULL, 7.000, 11, 1400.0000, 6.00, 0.00, 14.00, 0.00, 10501.68, NULL);

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
(1, 'SQ-1', '2026-02-24 22:00:00', '2026-02-27', 1, NULL, NULL, 'EGP', 1.000000, 11, 9212.00, 0.00, 588.00, 1289.68, 12913.68, '', NULL, 'Approved', NULL, NULL, NULL, '', NULL, '2026-02-25 14:59:06', 1, '2026-02-25 15:00:25', 1, 'Approved', 3000.00, 0.00, 1);

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
(5, 2, 3, NULL, NULL, NULL, 499.000, 0.000, 6501.0020, '2026-02-25 18:44:26', NULL, '2026-02-25 18:44:26');

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
(1, 1, 1, 2, 7.000, 7.000, 11, NULL, NULL, NULL, NULL, NULL, NULL);

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
  `ApprovalStatus` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Pending',
  `ApprovedByUserID` int DEFAULT NULL,
  `ApprovedDate` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stockissuenotes`
--

INSERT INTO `stockissuenotes` (`IssueNoteID`, `IssueNoteNumber`, `IssueDate`, `SOID`, `CustomerID`, `WarehouseID`, `IssuedByUserID`, `ReceivedByName`, `ReceivedByID`, `ReceivedBySignature`, `VehicleNo`, `DriverName`, `Status`, `DeliveryDate`, `Notes`, `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `IssueType`, `ReferenceID`, `ReferenceNumber`, `ReferenceType`, `ApprovalStatus`, `ApprovedByUserID`, `ApprovedDate`) VALUES
(1, 'SIN-1', '2026-02-25 14:59:52', 1, 1, 3, 1, NULL, NULL, NULL, NULL, NULL, 'Approved', NULL, NULL, '2026-02-25 14:59:52', 1, '2026-02-25 14:59:59', 1, 'SALE_ORDER', NULL, NULL, NULL, 'Pending', 1, '2026-02-25 14:59:59.147934');

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
(17, '2026-02-21 09:54:42', 'ISSUE', 'StockIssueNote', 8, 'SIN-1771667653762', 1, 3, NULL, NULL, NULL, 1.000, 'OUT', 0.0000, 0.00, 127.999, 126.999, NULL, '2026-02-21 09:54:42', 1),
(18, '2026-02-25 15:00:30', 'ISSUE', 'DeliveryOrder', 1, 'DO-1', 2, 3, NULL, NULL, NULL, 7.000, 'OUT', 0.0000, 0.00, 505.000, 498.000, NULL, '2026-02-25 15:00:30', 1),
(19, '2026-02-25 18:44:26', 'GRN', 'GoodsReceiptNote', 1, '#GRN-1', 2, 3, NULL, NULL, NULL, 1.000, 'IN', 7000.0000, 7000.00, 498.000, 499.000, NULL, '2026-02-25 18:44:26', 1);

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
(46, 2, 2, NULL, 6500.0000, '2026-02-21', NULL, NULL, 0, 1),
(47, 1, 2, NULL, 7000.0000, '2026-02-25', NULL, NULL, 0, 1);

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
(111, 27, 2, 500.000, 11, 6500.0000, 20.00, NULL, 14.00, NULL, 2964000.00, NULL, NULL, 'a'),
(112, 28, 2, 1.000, 11, 7000.0000, 5.00, NULL, 14.00, NULL, 7581.00, NULL, NULL, 'a');

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
(27, 'inv-23457', 37, 2, '2026-02-21', '2026-02-27', 'EGP', 1.000000, '', '', 5, 3000000.00, 'Received', NULL, '', NULL, '2026-02-21 09:10:57', '2026-02-21 09:10:57', 1, 20000.00, 16000.00),
(28, 'inv-004', 38, 1, '2026-02-25', '2026-03-11', 'EGP', 1.000000, '', '', 5, 14581.00, 'Received', NULL, '', NULL, '2026-02-25 18:43:37', '2026-02-25 18:43:37', 1, 7000.00, 0.00);

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
(1, 'SUP-1', 'شركة المنال للبلاستيك', 'شركة المنال للبلاستيك', 'International', '555-88-55-66', '2622222', 'شركة المنال للبلاستيك', 'شركة المنال للبلاستيك', 'شركة المنال للبلاستيك', '0597746258', '', 'mohammedshamleh.ps@gmail.com', '', 'شركة المنال للبلاستيك', '0597746852', 10, 0.00, 'EGP', '', '', '', 'B', 1, NULL, NULL, 1, 'شركة المنال للبلاستيك', '2026-02-14 12:32:43', NULL, '2026-02-25 18:44:26', NULL, NULL, NULL, 'APPROVED', 14581.00, 14581.00, 0.00, 'Approved', 0.00),
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
(1, 'shady', '$2a$10$JbkgvuqYLKJK9FdDf1vq7uYeQ.Fma2HXlR5CVJWy5nXpt5hawbrEe', 103, 1, 1, '2026-02-25 14:33:53', 0, 0, '2026-01-15 21:15:03', NULL, '2026-02-25 14:33:53', 1),
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
  `DriverName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DriverPhone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
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
`CustomerID` int
,`CustomerCode` varchar(20)
,`CustomerNameAr` varchar(200)
,`CustomerType` varchar(20)
,`CreditLimit` decimal(38,2)
,`TotalInvoiced` decimal(40,2)
,`TotalPaid` decimal(40,2)
,`OutstandingBalance` decimal(41,2)
,`AvailableCredit` decimal(42,2)
,`OverdueInvoices` decimal(23,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_dailysalessummary`
-- (See below for the actual view)
--
CREATE TABLE `vw_dailysalessummary` (
`SalesDate` date
,`InvoiceCount` bigint
,`SubTotal` decimal(40,2)
,`TotalDiscount` decimal(40,2)
,`TotalTax` decimal(40,2)
,`TotalSales` decimal(40,2)
,`TotalCollected` decimal(40,2)
,`TotalOutstanding` decimal(41,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_pendingapprovals`
-- (See below for the actual view)
--
CREATE TABLE `vw_pendingapprovals` (
`RequestID` int
,`DocumentType` varchar(30)
,`DocumentID` int
,`DocumentNumber` varchar(30)
,`TotalAmount` decimal(18,2)
,`RequestedDate` datetime
,`Priority` varchar(10)
,`DueDate` datetime
,`RequestedByUser` varchar(50)
,`RequestedByName` varchar(101)
,`CurrentStep` varchar(100)
,`WorkflowName` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_purchaseorderstatus`
-- (See below for the actual view)
--
CREATE TABLE `vw_purchaseorderstatus` (
`POID` int
,`PONumber` varchar(20)
,`PODate` datetime
,`SupplierNameAr` varchar(200)
,`TotalAmount` decimal(18,2)
,`Status` varchar(20)
,`ApprovalStatus` varchar(20)
,`TotalItems` bigint
,`TotalOrderedQty` decimal(40,3)
,`TotalReceivedQty` decimal(40,3)
,`ReceiptStatus` varchar(19)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_stocksummary`
-- (See below for the actual view)
--
CREATE TABLE `vw_stocksummary` (
`ItemID` int
,`ItemCode` varchar(30)
,`ItemNameAr` varchar(200)
,`GradeName` varchar(255)
,`WarehouseID` int
,`WarehouseNameAr` varchar(100)
,`TotalQuantityOnHand` decimal(40,3)
,`TotalQuantityReserved` decimal(40,3)
,`TotalQuantityAvailable` decimal(41,3)
,`AverageCost` decimal(22,8)
,`StockValue` decimal(59,7)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_supplieroutstanding`
-- (See below for the actual view)
--
CREATE TABLE `vw_supplieroutstanding` (
`SupplierID` int
,`SupplierCode` varchar(20)
,`SupplierNameAr` varchar(200)
,`SupplierType` varchar(20)
,`TotalInvoiced` decimal(40,2)
,`TotalPaid` decimal(40,2)
,`OutstandingBalance` decimal(41,2)
,`OverdueInvoices` decimal(23,0)
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
-- Indexes for table `flyway_schema_history`
--
ALTER TABLE `flyway_schema_history`
  ADD PRIMARY KEY (`installed_rank`),
  ADD KEY `flyway_schema_history_s_idx` (`success`);

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
-- Indexes for table `path_permission`
--
ALTER TABLE `path_permission`
  ADD PRIMARY KEY (`PathPermissionID`),
  ADD KEY `FKajbxef45jne1wxkmx1x70v5gg` (`PermissionID`);

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
-- Indexes for table `permission_dependencies`
--
ALTER TABLE `permission_dependencies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKbm96jny5iim1t40moi77nt6ws` (`permission_id`),
  ADD KEY `FKmv0tlcr6o4xgf5htaai3ck3qu` (`requires_permission_id`);

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
  MODIFY `ActionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=160;

--
-- AUTO_INCREMENT for table `approvallimits`
--
ALTER TABLE `approvallimits`
  MODIFY `ApprovalLimitID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `approvalrequests`
--
ALTER TABLE `approvalrequests`
  MODIFY `RequestID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `approvalworkflows`
--
ALTER TABLE `approvalworkflows`
  MODIFY `WorkflowID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

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
  MODIFY `ContactID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customerrequestdeliveryschedules`
--
ALTER TABLE `customerrequestdeliveryschedules`
  MODIFY `scheduleId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customerrequestitems`
--
ALTER TABLE `customerrequestitems`
  MODIFY `itemId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customerrequests`
--
ALTER TABLE `customerrequests`
  MODIFY `requestId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `DeliveryOrderID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `GRNID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `grnitems`
--
ALTER TABLE `grnitems`
  MODIFY `GRNItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

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
-- AUTO_INCREMENT for table `path_permission`
--
ALTER TABLE `path_permission`
  MODIFY `PathPermissionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

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
  MODIFY `PermissionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `permission_dependencies`
--
ALTER TABLE `permission_dependencies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `pricelists`
--
ALTER TABLE `pricelists`
  MODIFY `PriceListID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `purchaseorderitems`
--
ALTER TABLE `purchaseorderitems`
  MODIFY `POItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `purchaseorders`
--
ALTER TABLE `purchaseorders`
  MODIFY `POID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `purchaserequisitionitems`
--
ALTER TABLE `purchaserequisitionitems`
  MODIFY `PRItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `purchaserequisitions`
--
ALTER TABLE `purchaserequisitions`
  MODIFY `PRID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

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
  MODIFY `InspectionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `qualityparameters`
--
ALTER TABLE `qualityparameters`
  MODIFY `ParameterID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `quotationcomparisondetails`
--
ALTER TABLE `quotationcomparisondetails`
  MODIFY `CompDetailID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=227;

--
-- AUTO_INCREMENT for table `quotationcomparisons`
--
ALTER TABLE `quotationcomparisons`
  MODIFY `ComparisonID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `receiptvoucherallocations`
--
ALTER TABLE `receiptvoucherallocations`
  MODIFY `AllocationID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `receiptvouchers`
--
ALTER TABLE `receiptvouchers`
  MODIFY `ReceiptVoucherID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `requestforquotations`
--
ALTER TABLE `requestforquotations`
  MODIFY `RFQID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `rfqitems`
--
ALTER TABLE `rfqitems`
  MODIFY `RFQItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  MODIFY `RolePermissionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1147;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `RoleID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `salarycomponents`
--
ALTER TABLE `salarycomponents`
  MODIFY `ComponentID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesinvoiceitems`
--
ALTER TABLE `salesinvoiceitems`
  MODIFY `InvoiceItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `salesinvoices`
--
ALTER TABLE `salesinvoices`
  MODIFY `SalesInvoiceID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `salesorderitems`
--
ALTER TABLE `salesorderitems`
  MODIFY `SOItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `salesorders`
--
ALTER TABLE `salesorders`
  MODIFY `SOID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `salesquotationitems`
--
ALTER TABLE `salesquotationitems`
  MODIFY `SQItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `salesquotations`
--
ALTER TABLE `salesquotations`
  MODIFY `SalesQuotationID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `IssueItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stockissuenotes`
--
ALTER TABLE `stockissuenotes`
  MODIFY `IssueNoteID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stockmovements`
--
ALTER TABLE `stockmovements`
  MODIFY `MovementID` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

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
  MODIFY `SIItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `supplierinvoices`
--
ALTER TABLE `supplierinvoices`
  MODIFY `SupplierInvoiceID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `supplieritems`
--
ALTER TABLE `supplieritems`
  MODIFY `SupplierItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `supplierquotationitems`
--
ALTER TABLE `supplierquotationitems`
  MODIFY `SQItemID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `supplierquotations`
--
ALTER TABLE `supplierquotations`
  MODIFY `QuotationID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_customeroutstanding`  AS SELECT `c`.`CustomerID` AS `CustomerID`, `c`.`CustomerCode` AS `CustomerCode`, `c`.`CustomerNameAr` AS `CustomerNameAr`, `c`.`CustomerType` AS `CustomerType`, `c`.`CreditLimit` AS `CreditLimit`, sum(`si`.`TotalAmount`) AS `TotalInvoiced`, sum(`si`.`PaidAmount`) AS `TotalPaid`, sum((`si`.`TotalAmount` - `si`.`PaidAmount`)) AS `OutstandingBalance`, (`c`.`CreditLimit` - sum((`si`.`TotalAmount` - `si`.`PaidAmount`))) AS `AvailableCredit`, sum((case when (`si`.`Status` = 'Overdue') then 1 else 0 end)) AS `OverdueInvoices` FROM (`customers` `c` left join `salesinvoices` `si` on(((`c`.`CustomerID` = `si`.`CustomerID`) and (`si`.`Status` not in ('Cancelled','Draft'))))) GROUP BY `c`.`CustomerID`, `c`.`CustomerCode`, `c`.`CustomerNameAr`, `c`.`CustomerType`, `c`.`CreditLimit` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_dailysalessummary`
--
DROP TABLE IF EXISTS `vw_dailysalessummary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_dailysalessummary`  AS SELECT cast(`si`.`InvoiceDate` as date) AS `SalesDate`, count(`si`.`SalesInvoiceID`) AS `InvoiceCount`, sum(`si`.`SubTotal`) AS `SubTotal`, sum(`si`.`DiscountAmount`) AS `TotalDiscount`, sum(`si`.`TaxAmount`) AS `TotalTax`, sum(`si`.`TotalAmount`) AS `TotalSales`, sum(`si`.`PaidAmount`) AS `TotalCollected`, sum((`si`.`TotalAmount` - `si`.`PaidAmount`)) AS `TotalOutstanding` FROM `salesinvoices` AS `si` WHERE (`si`.`Status` not in ('Cancelled','Draft')) GROUP BY cast(`si`.`InvoiceDate` as date) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_pendingapprovals`
--
DROP TABLE IF EXISTS `vw_pendingapprovals`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_pendingapprovals`  AS SELECT `ar`.`RequestID` AS `RequestID`, `ar`.`DocumentType` AS `DocumentType`, `ar`.`DocumentID` AS `DocumentID`, `ar`.`DocumentNumber` AS `DocumentNumber`, `ar`.`TotalAmount` AS `TotalAmount`, `ar`.`RequestedDate` AS `RequestedDate`, `ar`.`Priority` AS `Priority`, `ar`.`DueDate` AS `DueDate`, `u`.`Username` AS `RequestedByUser`, concat(`e`.`FirstNameAr`,' ',`e`.`LastNameAr`) AS `RequestedByName`, `aws`.`StepName` AS `CurrentStep`, `aw`.`WorkflowName` AS `WorkflowName` FROM ((((`approvalrequests` `ar` join `users` `u` on((`ar`.`RequestedByUserID` = `u`.`UserID`))) join `employees` `e` on((`u`.`EmployeeID` = `e`.`EmployeeID`))) join `approvalworkflows` `aw` on((`ar`.`WorkflowID` = `aw`.`WorkflowID`))) left join `approvalworkflowsteps` `aws` on((`ar`.`CurrentStepID` = `aws`.`StepID`))) WHERE (`ar`.`Status` in ('Pending','InProgress')) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_purchaseorderstatus`
--
DROP TABLE IF EXISTS `vw_purchaseorderstatus`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_purchaseorderstatus`  AS SELECT `po`.`POID` AS `POID`, `po`.`PONumber` AS `PONumber`, `po`.`PODate` AS `PODate`, `s`.`SupplierNameAr` AS `SupplierNameAr`, `po`.`TotalAmount` AS `TotalAmount`, `po`.`Status` AS `Status`, `po`.`ApprovalStatus` AS `ApprovalStatus`, count(`poi`.`POItemID`) AS `TotalItems`, sum(`poi`.`OrderedQty`) AS `TotalOrderedQty`, sum(`poi`.`ReceivedQty`) AS `TotalReceivedQty`, (case when (sum(`poi`.`ReceivedQty`) = 0) then 'لم يتم الاستلام' when (sum(`poi`.`ReceivedQty`) < sum(`poi`.`OrderedQty`)) then 'استلام جزئي' else 'تم الاستلام بالكامل' end) AS `ReceiptStatus` FROM ((`purchaseorders` `po` join `suppliers` `s` on((`po`.`SupplierID` = `s`.`SupplierID`))) join `purchaseorderitems` `poi` on((`po`.`POID` = `poi`.`POID`))) GROUP BY `po`.`POID`, `po`.`PONumber`, `po`.`PODate`, `s`.`SupplierNameAr`, `po`.`TotalAmount`, `po`.`Status`, `po`.`ApprovalStatus` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_stocksummary`
--
DROP TABLE IF EXISTS `vw_stocksummary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_stocksummary`  AS SELECT `sb`.`ItemID` AS `ItemID`, `i`.`ItemCode` AS `ItemCode`, `i`.`ItemNameAr` AS `ItemNameAr`, `i`.`GradeName` AS `GradeName`, `sb`.`WarehouseID` AS `WarehouseID`, `w`.`WarehouseNameAr` AS `WarehouseNameAr`, sum(`sb`.`QuantityOnHand`) AS `TotalQuantityOnHand`, sum(`sb`.`QuantityReserved`) AS `TotalQuantityReserved`, sum((`sb`.`QuantityOnHand` - `sb`.`QuantityReserved`)) AS `TotalQuantityAvailable`, avg(`sb`.`AverageCost`) AS `AverageCost`, sum(((`sb`.`QuantityOnHand` - `sb`.`QuantityReserved`) * ifnull(`sb`.`AverageCost`,0))) AS `StockValue` FROM ((`stockbalances` `sb` join `items` `i` on((`sb`.`ItemID` = `i`.`ItemID`))) join `warehouses` `w` on((`sb`.`WarehouseID` = `w`.`WarehouseID`))) GROUP BY `sb`.`ItemID`, `i`.`ItemCode`, `i`.`ItemNameAr`, `i`.`GradeName`, `sb`.`WarehouseID`, `w`.`WarehouseNameAr` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_supplieroutstanding`
--
DROP TABLE IF EXISTS `vw_supplieroutstanding`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_supplieroutstanding`  AS SELECT `s`.`SupplierID` AS `SupplierID`, `s`.`SupplierCode` AS `SupplierCode`, `s`.`SupplierNameAr` AS `SupplierNameAr`, `s`.`SupplierType` AS `SupplierType`, sum(`si`.`TotalAmount`) AS `TotalInvoiced`, sum(`si`.`PaidAmount`) AS `TotalPaid`, sum((`si`.`TotalAmount` - `si`.`PaidAmount`)) AS `OutstandingBalance`, sum((case when ((`si`.`DueDate` < now()) and (`si`.`Status` not in ('Paid','Cancelled'))) then 1 else 0 end)) AS `OverdueInvoices` FROM (`suppliers` `s` left join `supplierinvoices` `si` on(((`s`.`SupplierID` = `si`.`SupplierID`) and (`si`.`Status` <> 'Cancelled')))) GROUP BY `s`.`SupplierID`, `s`.`SupplierCode`, `s`.`SupplierNameAr`, `s`.`SupplierType` ;

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
-- Constraints for table `path_permission`
--
ALTER TABLE `path_permission`
  ADD CONSTRAINT `FKajbxef45jne1wxkmx1x70v5gg` FOREIGN KEY (`PermissionID`) REFERENCES `permissions` (`PermissionID`);

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
-- Constraints for table `permission_dependencies`
--
ALTER TABLE `permission_dependencies`
  ADD CONSTRAINT `FKbm96jny5iim1t40moi77nt6ws` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`PermissionID`),
  ADD CONSTRAINT `FKmv0tlcr6o4xgf5htaai3ck3qu` FOREIGN KEY (`requires_permission_id`) REFERENCES `permissions` (`PermissionID`);

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
