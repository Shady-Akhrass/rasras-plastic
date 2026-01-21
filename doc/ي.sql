-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 12, 2026 at 10:15 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

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
  `AlertRuleID` int(11) NOT NULL,
  `RuleCode` varchar(20) NOT NULL,
  `RuleName` varchar(100) NOT NULL,
  `RuleType` varchar(30) NOT NULL,
  `EntityType` varchar(30) DEFAULT NULL,
  `Condition` varchar(500) DEFAULT NULL,
  `ThresholdValue` decimal(18,2) DEFAULT NULL,
  `ThresholdDays` int(11) DEFAULT NULL,
  `NotificationMessage` varchar(500) DEFAULT NULL,
  `NotifyRoleID` int(11) DEFAULT NULL,
  `NotifyUserID` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `Frequency` varchar(20) DEFAULT NULL,
  `LastExecutedAt` datetime DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approvalactions`
--

CREATE TABLE `approvalactions` (
  `ActionID` int(11) NOT NULL,
  `RequestID` int(11) NOT NULL,
  `StepID` int(11) NOT NULL,
  `ActionByUserID` int(11) NOT NULL,
  `ActionDate` datetime DEFAULT current_timestamp(),
  `ActionType` varchar(20) NOT NULL,
  `DelegatedToUserID` int(11) DEFAULT NULL,
  `Comments` varchar(1000) DEFAULT NULL,
  `AttachmentPath` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approvallimits`
--

CREATE TABLE `approvallimits` (
  `ApprovalLimitID` int(11) NOT NULL,
  `ActivityType` varchar(50) NOT NULL,
  `RoleID` int(11) NOT NULL,
  `MinAmount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `MaxAmount` decimal(18,2) DEFAULT NULL,
  `MinPercentage` decimal(5,2) DEFAULT 0.00,
  `MaxPercentage` decimal(5,2) DEFAULT NULL,
  `RequiresReviewBy` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approvalrequests`
--

CREATE TABLE `approvalrequests` (
  `RequestID` int(11) NOT NULL,
  `WorkflowID` int(11) NOT NULL,
  `DocumentType` varchar(30) NOT NULL,
  `DocumentID` int(11) NOT NULL,
  `DocumentNumber` varchar(30) DEFAULT NULL,
  `RequestedByUserID` int(11) NOT NULL,
  `RequestedDate` datetime DEFAULT current_timestamp(),
  `CurrentStepID` int(11) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Pending',
  `TotalAmount` decimal(18,2) DEFAULT NULL,
  `Priority` varchar(10) DEFAULT 'Normal',
  `DueDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CompletedDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approvalworkflows`
--

CREATE TABLE `approvalworkflows` (
  `WorkflowID` int(11) NOT NULL,
  `WorkflowCode` varchar(20) NOT NULL,
  `WorkflowName` varchar(100) NOT NULL,
  `DocumentType` varchar(30) NOT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvalworkflows`
--

INSERT INTO `approvalworkflows` (`WorkflowID`, `WorkflowCode`, `WorkflowName`, `DocumentType`, `IsActive`, `CreatedAt`) VALUES
(1, 'PO_APPROVAL', 'اعتماد أوامر الشراء', 'PurchaseOrder', 1, '2026-01-12 23:13:08'),
(2, 'PAY_APPROVAL', 'اعتماد سندات الصرف', 'PaymentVoucher', 1, '2026-01-12 23:13:08'),
(3, 'DISC_APPROVAL', 'اعتماد الخصومات', 'SalesDiscount', 1, '2026-01-12 23:13:08'),
(4, 'SO_APPROVAL', 'اعتماد أوامر البيع', 'SalesOrder', 1, '2026-01-12 23:13:08');

-- --------------------------------------------------------

--
-- Table structure for table `approvalworkflowsteps`
--

CREATE TABLE `approvalworkflowsteps` (
  `StepID` int(11) NOT NULL,
  `WorkflowID` int(11) NOT NULL,
  `StepNumber` int(11) NOT NULL,
  `StepName` varchar(100) NOT NULL,
  `ApproverType` varchar(20) NOT NULL,
  `ApproverRoleID` int(11) DEFAULT NULL,
  `ApproverUserID` int(11) DEFAULT NULL,
  `MinAmount` decimal(18,2) DEFAULT NULL,
  `MaxAmount` decimal(18,2) DEFAULT NULL,
  `IsRequired` tinyint(1) DEFAULT 1,
  `CanSkip` tinyint(1) DEFAULT 0,
  `EscalationDays` int(11) DEFAULT 3,
  `EscalateToStepID` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `AttendanceID` int(11) NOT NULL,
  `EmployeeID` int(11) NOT NULL,
  `AttendanceDate` date NOT NULL,
  `CheckInTime` time DEFAULT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `Status` varchar(20) DEFAULT NULL,
  `LeaveType` varchar(20) DEFAULT NULL,
  `OvertimeHours` decimal(5,2) DEFAULT 0.00,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auditlog`
--

CREATE TABLE `auditlog` (
  `AuditLogID` bigint(20) NOT NULL,
  `TableName` varchar(100) NOT NULL,
  `RecordID` int(11) NOT NULL,
  `ActionType` varchar(20) NOT NULL,
  `OldValues` text DEFAULT NULL,
  `NewValues` text DEFAULT NULL,
  `UserID` int(11) NOT NULL,
  `ActionDate` datetime DEFAULT current_timestamp(),
  `IPAddress` varchar(50) DEFAULT NULL,
  `MachineName` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bankaccounts`
--

CREATE TABLE `bankaccounts` (
  `BankAccountID` int(11) NOT NULL,
  `AccountNumber` varchar(50) NOT NULL,
  `AccountNameAr` varchar(100) NOT NULL,
  `AccountNameEn` varchar(100) DEFAULT NULL,
  `BankID` int(11) NOT NULL,
  `BranchName` varchar(100) DEFAULT NULL,
  `IBAN` varchar(50) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `AccountType` varchar(20) DEFAULT NULL,
  `OpeningBalance` decimal(18,2) DEFAULT 0.00,
  `CurrentBalance` decimal(18,2) DEFAULT 0.00,
  `GLAccountID` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banks`
--

CREATE TABLE `banks` (
  `BankID` int(11) NOT NULL,
  `BankCode` varchar(10) NOT NULL,
  `BankNameAr` varchar(100) NOT NULL,
  `BankNameEn` varchar(100) DEFAULT NULL,
  `SwiftCode` varchar(20) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banktransactions`
--

CREATE TABLE `banktransactions` (
  `TransactionID` int(11) NOT NULL,
  `BankAccountID` int(11) NOT NULL,
  `TransactionDate` date NOT NULL,
  `TransactionType` varchar(20) NOT NULL,
  `ReferenceType` varchar(30) DEFAULT NULL,
  `ReferenceID` int(11) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `DebitAmount` decimal(18,2) DEFAULT 0.00,
  `CreditAmount` decimal(18,2) DEFAULT 0.00,
  `Balance` decimal(18,2) DEFAULT NULL,
  `IsReconciled` tinyint(1) DEFAULT 0,
  `ReconciledDate` date DEFAULT NULL,
  `StatementReference` varchar(50) DEFAULT NULL,
  `JournalEntryID` int(11) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cashregisters`
--

CREATE TABLE `cashregisters` (
  `CashRegisterID` int(11) NOT NULL,
  `RegisterCode` varchar(20) NOT NULL,
  `RegisterNameAr` varchar(100) NOT NULL,
  `RegisterNameEn` varchar(100) DEFAULT NULL,
  `RegisterType` varchar(20) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `OpeningBalance` decimal(18,2) DEFAULT 0.00,
  `CurrentBalance` decimal(18,2) DEFAULT 0.00,
  `CustodianID` int(11) DEFAULT NULL,
  `GLAccountID` int(11) DEFAULT NULL,
  `MaxBalance` decimal(18,2) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chartofaccounts`
--

CREATE TABLE `chartofaccounts` (
  `AccountID` int(11) NOT NULL,
  `AccountCode` varchar(20) NOT NULL,
  `AccountNameAr` varchar(200) NOT NULL,
  `AccountNameEn` varchar(200) DEFAULT NULL,
  `ParentAccountID` int(11) DEFAULT NULL,
  `AccountType` varchar(20) NOT NULL,
  `AccountCategory` varchar(50) DEFAULT NULL,
  `IsParent` tinyint(1) DEFAULT 0,
  `IsActive` tinyint(1) DEFAULT 1,
  `IsCashAccount` tinyint(1) DEFAULT 0,
  `IsBankAccount` tinyint(1) DEFAULT 0,
  `Currency` varchar(3) DEFAULT NULL,
  `OpeningBalance` decimal(18,2) DEFAULT 0.00,
  `CurrentBalance` decimal(18,2) DEFAULT 0.00,
  `Description` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chequesissued`
--

CREATE TABLE `chequesissued` (
  `ChequeID` int(11) NOT NULL,
  `ChequeNumber` varchar(30) NOT NULL,
  `BankAccountID` int(11) NOT NULL,
  `ChequeDate` date NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `PayeeName` varchar(200) NOT NULL,
  `SupplierID` int(11) DEFAULT NULL,
  `PaymentVoucherID` int(11) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Issued',
  `DeliveredDate` date DEFAULT NULL,
  `CashedDate` date DEFAULT NULL,
  `CancelReason` varchar(200) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chequesreceived`
--

CREATE TABLE `chequesreceived` (
  `ChequeID` int(11) NOT NULL,
  `ChequeNumber` varchar(30) NOT NULL,
  `BankName` varchar(100) DEFAULT NULL,
  `BranchName` varchar(100) DEFAULT NULL,
  `ChequeDate` date NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `DrawerName` varchar(200) DEFAULT NULL,
  `CustomerID` int(11) DEFAULT NULL,
  `ReceiptVoucherID` int(11) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Received',
  `CollectionBankAccountID` int(11) DEFAULT NULL,
  `CollectionDate` date DEFAULT NULL,
  `ReturnReason` varchar(200) DEFAULT NULL,
  `EndorsedToSupplierID` int(11) DEFAULT NULL,
  `EndorsedDate` date DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companyinfo`
--

CREATE TABLE `companyinfo` (
  `CompanyID` int(11) NOT NULL,
  `CompanyNameAr` varchar(200) NOT NULL,
  `CompanyNameEn` varchar(200) DEFAULT NULL,
  `TaxRegistrationNo` varchar(50) DEFAULT NULL,
  `CommercialRegNo` varchar(50) DEFAULT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT 'Egypt',
  `Phone` varchar(20) DEFAULT NULL,
  `Fax` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Website` varchar(200) DEFAULT NULL,
  `LogoPath` varchar(500) DEFAULT NULL,
  `HeaderPath` varchar(500) DEFAULT NULL,
  `FooterText` varchar(500) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `FiscalYearStartMonth` int(11) DEFAULT 1,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `costcenters`
--

CREATE TABLE `costcenters` (
  `CostCenterID` int(11) NOT NULL,
  `CostCenterCode` varchar(20) NOT NULL,
  `CostCenterName` varchar(100) NOT NULL,
  `ParentCostCenterID` int(11) DEFAULT NULL,
  `DepartmentID` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `creditnotes`
--

CREATE TABLE `creditnotes` (
  `CreditNoteID` int(11) NOT NULL,
  `CreditNoteNumber` varchar(20) NOT NULL,
  `CreditNoteDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CustomerID` int(11) NOT NULL,
  `SalesReturnID` int(11) DEFAULT NULL,
  `SalesInvoiceID` int(11) DEFAULT NULL,
  `CreditNoteType` varchar(20) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `SubTotal` decimal(18,2) NOT NULL,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalAmount` decimal(18,2) NOT NULL,
  `AppliedAmount` decimal(18,2) DEFAULT 0.00,
  `RemainingAmount` decimal(18,2) GENERATED ALWAYS AS (`TotalAmount` - `AppliedAmount`) STORED,
  `Status` varchar(20) DEFAULT 'Draft',
  `JournalEntryID` int(11) DEFAULT NULL,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customercontacts`
--

CREATE TABLE `customercontacts` (
  `ContactID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `ContactName` varchar(100) NOT NULL,
  `JobTitle` varchar(100) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Mobile` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `IsPrimary` tinyint(1) DEFAULT 0,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `CustomerID` int(11) NOT NULL,
  `CustomerCode` varchar(20) NOT NULL,
  `CustomerNameAr` varchar(200) NOT NULL,
  `CustomerNameEn` varchar(200) DEFAULT NULL,
  `CustomerType` varchar(20) DEFAULT NULL,
  `CustomerClass` varchar(20) DEFAULT NULL,
  `TaxRegistrationNo` varchar(50) DEFAULT NULL,
  `CommercialRegNo` varchar(50) DEFAULT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT 'Egypt',
  `Phone` varchar(20) DEFAULT NULL,
  `Fax` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Website` varchar(200) DEFAULT NULL,
  `ContactPerson` varchar(100) DEFAULT NULL,
  `ContactPhone` varchar(20) DEFAULT NULL,
  `PaymentTermDays` int(11) DEFAULT 0,
  `CreditLimit` decimal(18,2) DEFAULT 0.00,
  `CurrentBalance` decimal(18,2) DEFAULT 0.00,
  `Currency` varchar(3) DEFAULT 'EGP',
  `SalesRepID` int(11) DEFAULT NULL,
  `PriceListID` int(11) DEFAULT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `IsApproved` tinyint(1) DEFAULT 0,
  `ApprovedBy` int(11) DEFAULT NULL,
  `ApprovedDate` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dailymarketprices`
--

CREATE TABLE `dailymarketprices` (
  `PriceID` int(11) NOT NULL,
  `PriceDate` date NOT NULL,
  `ItemID` int(11) NOT NULL,
  `Currency` varchar(3) DEFAULT 'USD',
  `MarketPrice` decimal(18,4) NOT NULL,
  `LocalPrice` decimal(18,4) DEFAULT NULL,
  `ExchangeRate` decimal(18,6) DEFAULT NULL,
  `Source` varchar(100) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `debitnotes`
--

CREATE TABLE `debitnotes` (
  `DebitNoteID` int(11) NOT NULL,
  `DebitNoteNumber` varchar(20) NOT NULL,
  `DebitNoteDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SupplierID` int(11) NOT NULL,
  `PurchaseReturnID` int(11) DEFAULT NULL,
  `SupplierInvoiceID` int(11) DEFAULT NULL,
  `DebitNoteType` varchar(20) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `SubTotal` decimal(18,2) NOT NULL,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalAmount` decimal(18,2) NOT NULL,
  `AppliedAmount` decimal(18,2) DEFAULT 0.00,
  `RemainingAmount` decimal(18,2) GENERATED ALWAYS AS (`TotalAmount` - `AppliedAmount`) STORED,
  `Status` varchar(20) DEFAULT 'Draft',
  `JournalEntryID` int(11) DEFAULT NULL,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deliveryorders`
--

CREATE TABLE `deliveryorders` (
  `DeliveryOrderID` int(11) NOT NULL,
  `DeliveryOrderNumber` varchar(20) NOT NULL,
  `OrderDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IssueNoteID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `DeliveryAddress` varchar(500) DEFAULT NULL,
  `ZoneID` int(11) DEFAULT NULL,
  `DeliveryType` varchar(20) DEFAULT NULL,
  `VehicleID` int(11) DEFAULT NULL,
  `ContractorID` int(11) DEFAULT NULL,
  `DriverName` varchar(100) DEFAULT NULL,
  `DriverPhone` varchar(20) DEFAULT NULL,
  `ScheduledDate` date DEFAULT NULL,
  `ScheduledTime` time DEFAULT NULL,
  `ActualDeliveryDate` datetime DEFAULT NULL,
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `IsCostOnCustomer` tinyint(1) DEFAULT 0,
  `Status` varchar(20) DEFAULT 'Pending',
  `ReceiverName` varchar(100) DEFAULT NULL,
  `ReceiverPhone` varchar(20) DEFAULT NULL,
  `ReceiverSignature` varchar(500) DEFAULT NULL,
  `PODAttachmentPath` varchar(500) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deliveryzones`
--

CREATE TABLE `deliveryzones` (
  `ZoneID` int(11) NOT NULL,
  `ZoneCode` varchar(20) NOT NULL,
  `ZoneName` varchar(100) NOT NULL,
  `Cities` varchar(500) DEFAULT NULL,
  `DeliveryCost` decimal(18,2) DEFAULT NULL,
  `EstimatedDays` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `DepartmentID` int(11) NOT NULL,
  `DepartmentCode` varchar(10) NOT NULL,
  `DepartmentNameAr` varchar(100) NOT NULL,
  `DepartmentNameEn` varchar(100) DEFAULT NULL,
  `ParentDepartmentID` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
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
  `TrackingID` int(11) NOT NULL,
  `CycleType` varchar(30) NOT NULL,
  `CycleStartDocumentType` varchar(30) DEFAULT NULL,
  `CycleStartDocumentID` int(11) DEFAULT NULL,
  `CycleStartDocumentNumber` varchar(30) DEFAULT NULL,
  `CycleEndDocumentType` varchar(30) DEFAULT NULL,
  `CycleEndDocumentID` int(11) DEFAULT NULL,
  `CycleEndDocumentNumber` varchar(30) DEFAULT NULL,
  `CycleStatus` varchar(20) DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `TotalDaysToComplete` int(11) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documentrelationships`
--

CREATE TABLE `documentrelationships` (
  `RelationshipID` int(11) NOT NULL,
  `ParentDocumentType` varchar(30) NOT NULL,
  `ParentDocumentID` int(11) NOT NULL,
  `ParentDocumentNumber` varchar(30) DEFAULT NULL,
  `ChildDocumentType` varchar(30) NOT NULL,
  `ChildDocumentID` int(11) NOT NULL,
  `ChildDocumentNumber` varchar(30) DEFAULT NULL,
  `RelationshipType` varchar(20) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documentsequences`
--

CREATE TABLE `documentsequences` (
  `SequenceID` int(11) NOT NULL,
  `DocumentTypeID` int(11) NOT NULL,
  `FiscalYearID` int(11) DEFAULT NULL,
  `WarehouseID` int(11) DEFAULT NULL,
  `DepartmentID` int(11) DEFAULT NULL,
  `Prefix` varchar(20) DEFAULT NULL,
  `Suffix` varchar(20) DEFAULT NULL,
  `CurrentNumber` int(11) DEFAULT 0,
  `NumberFormat` varchar(50) DEFAULT NULL,
  `LastGeneratedDate` datetime DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documenttypes`
--

CREATE TABLE `documenttypes` (
  `DocumentTypeID` int(11) NOT NULL,
  `DocumentTypeCode` varchar(20) NOT NULL,
  `DocumentTypeNameAr` varchar(100) NOT NULL,
  `DocumentTypeNameEn` varchar(100) DEFAULT NULL,
  `ModuleName` varchar(50) DEFAULT NULL,
  `CycleType` varchar(30) DEFAULT NULL,
  `SequencePrefix` varchar(10) DEFAULT NULL,
  `CurrentSequence` int(11) DEFAULT 0,
  `ResetSequenceYearly` tinyint(1) DEFAULT 1,
  `RequiresApproval` tinyint(1) DEFAULT 0,
  `WorkflowID` int(11) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp()
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
  `EmployeeID` int(11) NOT NULL,
  `EmployeeCode` varchar(20) NOT NULL,
  `FirstNameAr` varchar(50) NOT NULL,
  `LastNameAr` varchar(50) NOT NULL,
  `FirstNameEn` varchar(50) DEFAULT NULL,
  `LastNameEn` varchar(50) DEFAULT NULL,
  `NationalID` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Mobile` varchar(20) DEFAULT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `DepartmentID` int(11) NOT NULL,
  `JobTitle` varchar(100) DEFAULT NULL,
  `ManagerID` int(11) DEFAULT NULL,
  `HireDate` date NOT NULL,
  `TerminationDate` date DEFAULT NULL,
  `BasicSalary` decimal(18,2) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employeesalarystructure`
--

CREATE TABLE `employeesalarystructure` (
  `StructureID` int(11) NOT NULL,
  `EmployeeID` int(11) NOT NULL,
  `ComponentID` int(11) NOT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `EffectiveFrom` date NOT NULL,
  `EffectiveTo` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exchangerates`
--

CREATE TABLE `exchangerates` (
  `ExchangeRateID` int(11) NOT NULL,
  `FromCurrency` varchar(3) NOT NULL,
  `ToCurrency` varchar(3) NOT NULL,
  `RateDate` date NOT NULL,
  `BuyRate` decimal(18,6) NOT NULL,
  `SellRate` decimal(18,6) NOT NULL,
  `AverageRate` decimal(18,6) NOT NULL,
  `Source` varchar(50) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fiscalperiods`
--

CREATE TABLE `fiscalperiods` (
  `PeriodID` int(11) NOT NULL,
  `FiscalYearID` int(11) NOT NULL,
  `PeriodNumber` int(11) NOT NULL,
  `PeriodName` varchar(50) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `IsClosed` tinyint(1) DEFAULT 0,
  `ClosedByUserID` int(11) DEFAULT NULL,
  `ClosedDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fiscalyears`
--

CREATE TABLE `fiscalyears` (
  `FiscalYearID` int(11) NOT NULL,
  `YearCode` varchar(10) NOT NULL,
  `YearName` varchar(50) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `IsClosed` tinyint(1) DEFAULT 0,
  `ClosedByUserID` int(11) DEFAULT NULL,
  `ClosedDate` datetime DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goodsreceiptnotes`
--

CREATE TABLE `goodsreceiptnotes` (
  `GRNID` int(11) NOT NULL,
  `GRNNumber` varchar(20) NOT NULL,
  `GRNDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `POID` int(11) NOT NULL,
  `SupplierID` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL,
  `DeliveryNoteNo` varchar(50) DEFAULT NULL,
  `SupplierInvoiceNo` varchar(50) DEFAULT NULL,
  `ReceivedByUserID` int(11) NOT NULL,
  `InspectedByUserID` int(11) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `QualityStatus` varchar(20) DEFAULT NULL,
  `TotalReceivedQty` decimal(18,3) DEFAULT NULL,
  `TotalAcceptedQty` decimal(18,3) DEFAULT NULL,
  `TotalRejectedQty` decimal(18,3) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grnitems`
--

CREATE TABLE `grnitems` (
  `GRNItemID` int(11) NOT NULL,
  `GRNID` int(11) NOT NULL,
  `POItemID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `OrderedQty` decimal(18,3) NOT NULL,
  `ReceivedQty` decimal(18,3) NOT NULL,
  `AcceptedQty` decimal(18,3) DEFAULT NULL,
  `RejectedQty` decimal(18,3) DEFAULT 0.000,
  `DamagedQty` decimal(18,3) DEFAULT 0.000,
  `UnitID` int(11) NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `TotalCost` decimal(18,2) DEFAULT NULL,
  `LotNumber` varchar(50) DEFAULT NULL,
  `ManufactureDate` date DEFAULT NULL,
  `ExpiryDate` date DEFAULT NULL,
  `LocationID` int(11) DEFAULT NULL,
  `QualityStatus` varchar(20) DEFAULT NULL,
  `QualityReportID` int(11) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventorybatches` (new - supports FIFO / batch tracking)
--

CREATE TABLE `inventorybatches` (
  `BatchID` int(11) NOT NULL,
  `BatchNumber` varchar(100) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `GRNItemID` int(11) DEFAULT NULL,
  `WarehouseID` int(11) NOT NULL,
  `LocationID` int(11) DEFAULT NULL,
  `UnitID` int(11) NOT NULL,
  `ManufactureDate` date DEFAULT NULL,
  `ExpiryDate` date DEFAULT NULL,
  `QuantityReceived` decimal(18,3) NOT NULL DEFAULT 0.000,
  `QuantityAvailable` decimal(18,3) NOT NULL DEFAULT 0.000,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `TotalCost` decimal(18,2) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- The BatchID, pricelist ExchangeRate link, e-invoice fields and COA enrichment are added
-- later in the Indexes/Constraints section so they run after the referenced tables are created.


CREATE TABLE `itemcategories` (
  `CategoryID` int(11) NOT NULL,
  `CategoryCode` varchar(20) NOT NULL,
  `CategoryNameAr` varchar(100) NOT NULL,
  `CategoryNameEn` varchar(100) DEFAULT NULL,
  `ParentCategoryID` int(11) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `itemcategories`
--

INSERT INTO `itemcategories` (`CategoryID`, `CategoryCode`, `CategoryNameAr`, `CategoryNameEn`, `ParentCategoryID`, `Description`, `IsActive`, `CreatedAt`) VALUES
(1, 'RAW', 'خامات بلاستيك', 'Plastic Raw Materials', NULL, 'خامات البلاستيك الأولية', 1, '2026-01-12 23:13:08'),
(2, 'HDPE', 'بولي إيثيلين عالي الكثافة', 'HDPE', 1, 'High Density Polyethylene', 1, '2026-01-12 23:13:08'),
(3, 'LDPE', 'بولي إيثيلين منخفض الكثافة', 'LDPE', 1, 'Low Density Polyethylene', 1, '2026-01-12 23:13:08'),
(4, 'LLDPE', 'بولي إيثيلين خطي', 'LLDPE', 1, 'Linear Low Density Polyethylene', 1, '2026-01-12 23:13:08'),
(5, 'PP', 'بولي بروبيلين', 'Polypropylene', 1, 'Polypropylene resins', 1, '2026-01-12 23:13:08'),
(6, 'PVC', 'بولي فينيل كلوريد', 'PVC', 1, 'Polyvinyl Chloride', 1, '2026-01-12 23:13:08'),
(7, 'PET', 'بولي إيثيلين تيريفثاليت', 'PET', 1, 'Polyethylene Terephthalate', 1, '2026-01-12 23:13:08'),
(8, 'PS', 'بولي ستايرين', 'Polystyrene', 1, 'Polystyrene resins', 1, '2026-01-12 23:13:08'),
(9, 'ABS', 'أكريلونيتريل بيوتادين ستايرين', 'ABS', 1, 'ABS resins', 1, '2026-01-12 23:13:08'),
(10, 'ADD', 'إضافات', 'Additives', 1, 'Plastic additives and masterbatches', 1, '2026-01-12 23:13:08');

-- --------------------------------------------------------

--
-- Table structure for table `itemqualityspecs`
--

CREATE TABLE `itemqualityspecs` (
  `SpecID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `ParameterID` int(11) NOT NULL,
  `MinValue` decimal(18,6) DEFAULT NULL,
  `MaxValue` decimal(18,6) DEFAULT NULL,
  `TargetValue` decimal(18,6) DEFAULT NULL,
  `IsCritical` tinyint(1) DEFAULT 0,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `ItemID` int(11) NOT NULL,
  `ItemCode` varchar(30) NOT NULL,
  `ItemNameAr` varchar(200) NOT NULL,
  `ItemNameEn` varchar(200) DEFAULT NULL,
  `GradeName` varchar(50) DEFAULT NULL,
  `CategoryID` int(11) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `Barcode` varchar(50) DEFAULT NULL,
  `Description` varchar(1000) DEFAULT NULL,
  `TechnicalSpecs` text DEFAULT NULL,
  `MinStockLevel` decimal(18,3) DEFAULT 0.000,
  `MaxStockLevel` decimal(18,3) DEFAULT NULL,
  `ReorderLevel` decimal(18,3) DEFAULT NULL,
  `AvgMonthlyConsumption` decimal(18,3) DEFAULT NULL,
  `StandardCost` decimal(18,4) DEFAULT NULL,
  `LastPurchasePrice` decimal(18,4) DEFAULT NULL,
  `ReplacementPrice` decimal(18,4) DEFAULT NULL,
  `LastSalePrice` decimal(18,4) DEFAULT NULL,
  `DefaultVATRate` decimal(5,2) DEFAULT 14.00,
  `ImagePath` varchar(500) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `IsSellable` tinyint(1) DEFAULT 1,
  `IsPurchasable` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `journalentries`
--

CREATE TABLE `journalentries` (
  `JournalEntryID` int(11) NOT NULL,
  `EntryNumber` varchar(20) NOT NULL,
  `EntryDate` date NOT NULL,
  `FiscalYearID` int(11) NOT NULL,
  `PeriodID` int(11) NOT NULL,
  `EntryType` varchar(20) NOT NULL,
  `SourceType` varchar(30) DEFAULT NULL,
  `SourceID` int(11) DEFAULT NULL,
  `SourceNumber` varchar(30) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `TotalDebit` decimal(18,2) NOT NULL,
  `TotalCredit` decimal(18,2) NOT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `Status` varchar(20) DEFAULT 'Draft',
  `PostedByUserID` int(11) DEFAULT NULL,
  `PostedDate` datetime DEFAULT NULL,
  `ReversedByEntryID` int(11) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `journalentrylines`
--

CREATE TABLE `journalentrylines` (
  `LineID` int(11) NOT NULL,
  `JournalEntryID` int(11) NOT NULL,
  `LineNumber` int(11) NOT NULL,
  `AccountID` int(11) NOT NULL,
  `CostCenterID` int(11) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `DebitAmount` decimal(18,2) DEFAULT 0.00,
  `CreditAmount` decimal(18,2) DEFAULT 0.00,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `DebitAmountLocal` decimal(18,2) DEFAULT 0.00,
  `CreditAmountLocal` decimal(18,2) DEFAULT 0.00,
  `ReferenceType` varchar(30) DEFAULT NULL,
  `ReferenceID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leaverequests`
--

CREATE TABLE `leaverequests` (
  `LeaveRequestID` int(11) NOT NULL,
  `EmployeeID` int(11) NOT NULL,
  `LeaveType` varchar(20) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `TotalDays` int(11) NOT NULL,
  `Reason` varchar(500) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Pending',
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `NotificationID` int(11) NOT NULL,
  `NotificationType` varchar(30) NOT NULL,
  `Title` varchar(200) NOT NULL,
  `Message` varchar(1000) DEFAULT NULL,
  `Priority` varchar(10) DEFAULT 'Normal',
  `RecipientUserID` int(11) NOT NULL,
  `SenderUserID` int(11) DEFAULT NULL,
  `ReferenceType` varchar(30) DEFAULT NULL,
  `ReferenceID` int(11) DEFAULT NULL,
  `ReferenceNumber` varchar(30) DEFAULT NULL,
  `ActionURL` varchar(500) DEFAULT NULL,
  `IsRead` tinyint(1) DEFAULT 0,
  `ReadDate` datetime DEFAULT NULL,
  `IsDismissed` tinyint(1) DEFAULT 0,
  `DismissedDate` datetime DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `ExpiryDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `numberseries`
--

CREATE TABLE `numberseries` (
  `SeriesID` int(11) NOT NULL,
  `SeriesCode` varchar(20) NOT NULL,
  `SeriesName` varchar(100) NOT NULL,
  `DocumentType` varchar(30) NOT NULL,
  `Prefix` varchar(10) DEFAULT NULL,
  `Suffix` varchar(10) DEFAULT NULL,
  `StartNumber` int(11) DEFAULT 1,
  `EndNumber` int(11) DEFAULT NULL,
  `CurrentNumber` int(11) DEFAULT 0,
  `NumberLength` int(11) DEFAULT 6,
  `IncludeYear` tinyint(1) DEFAULT 1,
  `YearFormat` varchar(10) DEFAULT 'YY',
  `IncludeMonth` tinyint(1) DEFAULT 0,
  `ResetOnNewYear` tinyint(1) DEFAULT 1,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paymentvoucherallocations`
--

CREATE TABLE `paymentvoucherallocations` (
  `AllocationID` int(11) NOT NULL,
  `PaymentVoucherID` int(11) NOT NULL,
  `SupplierInvoiceID` int(11) NOT NULL,
  `AllocatedAmount` decimal(18,2) NOT NULL,
  `AllocationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paymentvouchers`
--

CREATE TABLE `paymentvouchers` (
  `PaymentVoucherID` int(11) NOT NULL,
  `VoucherNumber` varchar(20) NOT NULL,
  `VoucherDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SupplierID` int(11) DEFAULT NULL,
  `PayeeName` varchar(200) DEFAULT NULL,
  `PaymentMethod` varchar(20) NOT NULL,
  `CashRegisterID` int(11) DEFAULT NULL,
  `BankAccountID` int(11) DEFAULT NULL,
  `ChequeID` int(11) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `Amount` decimal(18,2) NOT NULL,
  `AmountInWords` varchar(500) DEFAULT NULL,
  `ReferenceType` varchar(30) DEFAULT NULL,
  `ReferenceID` int(11) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `JournalEntryID` int(11) DEFAULT NULL,
  `Level1ApprovedBy` int(11) DEFAULT NULL,
  `Level1ApprovedDate` datetime DEFAULT NULL,
  `Level2ApprovedBy` int(11) DEFAULT NULL,
  `Level2ApprovedDate` datetime DEFAULT NULL,
  `Level3ApprovedBy` int(11) DEFAULT NULL,
  `Level3ApprovedDate` datetime DEFAULT NULL,
  `PreparedByUserID` int(11) NOT NULL,
  `PostedByUserID` int(11) DEFAULT NULL,
  `PostedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `PayrollID` int(11) NOT NULL,
  `PayrollMonth` int(11) NOT NULL,
  `PayrollYear` int(11) NOT NULL,
  `EmployeeID` int(11) NOT NULL,
  `BasicSalary` decimal(18,2) DEFAULT NULL,
  `TotalEarnings` decimal(18,2) DEFAULT NULL,
  `TotalDeductions` decimal(18,2) DEFAULT NULL,
  `NetSalary` decimal(18,2) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `PaymentDate` date DEFAULT NULL,
  `PaymentMethod` varchar(20) DEFAULT NULL,
  `BankAccountID` int(11) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payrolldetails`
--

CREATE TABLE `payrolldetails` (
  `PayrollDetailID` int(11) NOT NULL,
  `PayrollID` int(11) NOT NULL,
  `ComponentID` int(11) NOT NULL,
  `Amount` decimal(18,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `PermissionID` int(11) NOT NULL,
  `PermissionCode` varchar(50) NOT NULL,
  `PermissionNameAr` varchar(100) NOT NULL,
  `PermissionNameEn` varchar(100) DEFAULT NULL,
  `ModuleName` varchar(50) DEFAULT NULL,
  `ActionType` varchar(20) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
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
(24, 'JE_POST', 'ترحيل القيود', 'Post Journal Entry', 'Finance', 'Approve', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `pricelistitems`
--

CREATE TABLE `pricelistitems` (
  `PriceListItemID` int(11) NOT NULL,
  `PriceListID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `MinQty` decimal(18,3) DEFAULT 0.000,
  `MaxQty` decimal(18,3) DEFAULT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pricelists`
--

CREATE TABLE `pricelists` (
  `PriceListID` int(11) NOT NULL,
  `PriceListCode` varchar(20) NOT NULL,
  `PriceListName` varchar(100) NOT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `EffectiveFrom` date NOT NULL,
  `EffectiveTo` date DEFAULT NULL,
  `IsDefault` tinyint(1) DEFAULT 0,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchaseorderitems`
--

CREATE TABLE `purchaseorderitems` (
  `POItemID` int(11) NOT NULL,
  `POID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `OrderedQty` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxPercentage` decimal(5,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalPrice` decimal(18,2) NOT NULL,
  `ReceivedQty` decimal(18,3) DEFAULT 0.000,
  `RemainingQty` decimal(18,3) GENERATED ALWAYS AS (`OrderedQty` - `ReceivedQty`) STORED,
  `Status` varchar(20) DEFAULT 'Pending',
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchaseorders`
--

CREATE TABLE `purchaseorders` (
  `POID` int(11) NOT NULL,
  `PONumber` varchar(20) NOT NULL,
  `PODate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PRID` int(11) DEFAULT NULL,
  `QuotationID` int(11) DEFAULT NULL,
  `SupplierID` int(11) NOT NULL,
  `ExpectedDeliveryDate` date DEFAULT NULL,
  `ShippingMethod` varchar(50) DEFAULT NULL,
  `ShippingTerms` varchar(50) DEFAULT NULL,
  `PaymentTerms` varchar(200) DEFAULT NULL,
  `PaymentTermDays` int(11) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `ShippingCost` decimal(18,2) DEFAULT 0.00,
  `OtherCosts` decimal(18,2) DEFAULT 0.00,
  `TotalAmount` decimal(18,2) NOT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `ApprovalStatus` varchar(20) DEFAULT 'Pending',
  `Level1ApprovedBy` int(11) DEFAULT NULL,
  `Level1ApprovedDate` datetime DEFAULT NULL,
  `Level2ApprovedBy` int(11) DEFAULT NULL,
  `Level2ApprovedDate` datetime DEFAULT NULL,
  `Level3ApprovedBy` int(11) DEFAULT NULL,
  `Level3ApprovedDate` datetime DEFAULT NULL,
  `SentToSupplierDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `TermsAndConditions` text DEFAULT NULL,
  `AttachmentPath` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchaserequisitionitems`
--

CREATE TABLE `purchaserequisitionitems` (
  `PRItemID` int(11) NOT NULL,
  `PRID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `RequestedQty` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `EstimatedUnitPrice` decimal(18,4) DEFAULT NULL,
  `EstimatedTotalPrice` decimal(18,2) DEFAULT NULL,
  `RequiredDate` date DEFAULT NULL,
  `Specifications` varchar(500) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchaserequisitions`
--

CREATE TABLE `purchaserequisitions` (
  `PRID` int(11) NOT NULL,
  `PRNumber` varchar(20) NOT NULL,
  `PRDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `RequestedByDeptID` int(11) NOT NULL,
  `RequestedByUserID` int(11) NOT NULL,
  `RequiredDate` date DEFAULT NULL,
  `Priority` varchar(10) DEFAULT 'Normal',
  `Status` varchar(20) DEFAULT 'Draft',
  `TotalEstimatedAmount` decimal(18,2) DEFAULT NULL,
  `Justification` varchar(1000) DEFAULT NULL,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `RejectionReason` varchar(500) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchasereturnitems`
--

CREATE TABLE `purchasereturnitems` (
  `ReturnItemID` int(11) NOT NULL,
  `PurchaseReturnID` int(11) NOT NULL,
  `GRNItemID` int(11) DEFAULT NULL,
  `ItemID` int(11) NOT NULL,
  `ReturnedQty` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `TaxPercentage` decimal(5,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalPrice` decimal(18,2) NOT NULL,
  `ReturnReason` varchar(100) DEFAULT NULL,
  `LotNumber` varchar(50) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchasereturns`
--

CREATE TABLE `purchasereturns` (
  `PurchaseReturnID` int(11) NOT NULL,
  `ReturnNumber` varchar(20) NOT NULL,
  `ReturnDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `GRNID` int(11) DEFAULT NULL,
  `SupplierInvoiceID` int(11) DEFAULT NULL,
  `SupplierID` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL,
  `ReturnReason` varchar(50) DEFAULT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalAmount` decimal(18,2) NOT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `DebitNoteID` int(11) DEFAULT NULL,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `PreparedByUserID` int(11) NOT NULL,
  `SentToSupplierDate` datetime DEFAULT NULL,
  `SupplierAcknowledgedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qualityinspectionresults`
--

CREATE TABLE `qualityinspectionresults` (
  `ResultID` int(11) NOT NULL,
  `InspectionID` int(11) NOT NULL,
  `ParameterID` int(11) NOT NULL,
  `MeasuredValue` decimal(18,6) DEFAULT NULL,
  `TextValue` varchar(100) DEFAULT NULL,
  `Result` varchar(20) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qualityinspections`
--

CREATE TABLE `qualityinspections` (
  `InspectionID` int(11) NOT NULL,
  `InspectionNumber` varchar(20) NOT NULL,
  `InspectionDate` datetime NOT NULL DEFAULT current_timestamp(),
  `InspectionType` varchar(20) NOT NULL,
  `ReferenceType` varchar(20) DEFAULT NULL,
  `ReferenceID` int(11) DEFAULT NULL,
  `ItemID` int(11) NOT NULL,
  `LotNumber` varchar(50) DEFAULT NULL,
  `SampleSize` decimal(18,3) DEFAULT NULL,
  `InspectedByUserID` int(11) NOT NULL,
  `OverallResult` varchar(20) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'InProgress',
  `COAAttachmentPath` varchar(500) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CompletedDate` datetime DEFAULT NULL,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qualityparameters`
--

CREATE TABLE `qualityparameters` (
  `ParameterID` int(11) NOT NULL,
  `ParameterCode` varchar(20) NOT NULL,
  `ParameterNameAr` varchar(100) NOT NULL,
  `ParameterNameEn` varchar(100) DEFAULT NULL,
  `UnitOfMeasure` varchar(20) DEFAULT NULL,
  `DataType` varchar(20) DEFAULT NULL,
  `MinValue` decimal(18,6) DEFAULT NULL,
  `MaxValue` decimal(18,6) DEFAULT NULL,
  `StandardValue` decimal(18,6) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotationcomparisondetails`
--

CREATE TABLE `quotationcomparisondetails` (
  `CompDetailID` int(11) NOT NULL,
  `ComparisonID` int(11) NOT NULL,
  `QuotationID` int(11) NOT NULL,
  `SupplierID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) DEFAULT NULL,
  `TotalPrice` decimal(18,2) DEFAULT NULL,
  `PaymentTerms` varchar(200) DEFAULT NULL,
  `DeliveryDays` int(11) DEFAULT NULL,
  `QualityRating` int(11) DEFAULT NULL,
  `PriceRating` int(11) DEFAULT NULL,
  `OverallScore` decimal(5,2) DEFAULT NULL,
  `Comments` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotationcomparisons`
--

CREATE TABLE `quotationcomparisons` (
  `ComparisonID` int(11) NOT NULL,
  `ComparisonNumber` varchar(20) NOT NULL,
  `ComparisonDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PRID` int(11) DEFAULT NULL,
  `ItemID` int(11) NOT NULL,
  `SelectedQuotationID` int(11) DEFAULT NULL,
  `SelectedSupplierID` int(11) DEFAULT NULL,
  `SelectionReason` varchar(500) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `ReviewedByUserID` int(11) DEFAULT NULL,
  `ReviewedDate` datetime DEFAULT NULL,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receiptvoucherallocations`
--

CREATE TABLE `receiptvoucherallocations` (
  `AllocationID` int(11) NOT NULL,
  `ReceiptVoucherID` int(11) NOT NULL,
  `SalesInvoiceID` int(11) NOT NULL,
  `AllocatedAmount` decimal(18,2) NOT NULL,
  `AllocationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receiptvouchers`
--

CREATE TABLE `receiptvouchers` (
  `ReceiptVoucherID` int(11) NOT NULL,
  `VoucherNumber` varchar(20) NOT NULL,
  `VoucherDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CustomerID` int(11) DEFAULT NULL,
  `PayerName` varchar(200) DEFAULT NULL,
  `PaymentMethod` varchar(20) NOT NULL,
  `CashRegisterID` int(11) DEFAULT NULL,
  `BankAccountID` int(11) DEFAULT NULL,
  `ChequeID` int(11) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `Amount` decimal(18,2) NOT NULL,
  `AmountInWords` varchar(500) DEFAULT NULL,
  `ReferenceType` varchar(30) DEFAULT NULL,
  `ReferenceID` int(11) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `JournalEntryID` int(11) DEFAULT NULL,
  `ReceivedByUserID` int(11) NOT NULL,
  `PostedByUserID` int(11) DEFAULT NULL,
  `PostedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requestforquotations`
--

CREATE TABLE `requestforquotations` (
  `RFQID` int(11) NOT NULL,
  `RFQNumber` varchar(20) NOT NULL,
  `RFQDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PRID` int(11) DEFAULT NULL,
  `SupplierID` int(11) NOT NULL,
  `ResponseDueDate` date DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Sent',
  `SentByUserID` int(11) DEFAULT NULL,
  `SentDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rfqitems`
--

CREATE TABLE `rfqitems` (
  `RFQItemID` int(11) NOT NULL,
  `RFQID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `RequestedQty` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `Specifications` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rolepermissions`
--

CREATE TABLE `rolepermissions` (
  `RolePermissionID` int(11) NOT NULL,
  `RoleID` int(11) NOT NULL,
  `PermissionID` int(11) NOT NULL,
  `IsAllowed` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `RoleID` int(11) NOT NULL,
  `RoleCode` varchar(20) NOT NULL,
  `RoleNameAr` varchar(100) NOT NULL,
  `RoleNameEn` varchar(100) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp()
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
  `ComponentID` int(11) NOT NULL,
  `ComponentCode` varchar(20) NOT NULL,
  `ComponentName` varchar(100) NOT NULL,
  `ComponentType` varchar(20) NOT NULL,
  `IsFixed` tinyint(1) DEFAULT 1,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesinvoiceitems`
--

CREATE TABLE `salesinvoiceitems` (
  `InvoiceItemID` int(11) NOT NULL,
  `SalesInvoiceID` int(11) NOT NULL,
  `IssueItemID` int(11) DEFAULT NULL,
  `ItemID` int(11) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxPercentage` decimal(5,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalPrice` decimal(18,2) NOT NULL,
  `GrossProfit` decimal(18,2) GENERATED ALWAYS AS (`TotalPrice` - `Quantity` * ifnull(`UnitCost`,0)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesinvoices`
--

CREATE TABLE `salesinvoices` (
  `SalesInvoiceID` int(11) NOT NULL,
  `InvoiceNumber` varchar(20) NOT NULL,
  `InvoiceDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `DueDate` date NOT NULL,
  `SOID` int(11) DEFAULT NULL,
  `IssueNoteID` int(11) DEFAULT NULL,
  `CustomerID` int(11) NOT NULL,
  `SalesRepID` int(11) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `ShippingCost` decimal(18,2) DEFAULT 0.00,
  `TotalAmount` decimal(18,2) NOT NULL,
  `PaidAmount` decimal(18,2) DEFAULT 0.00,
  `RemainingAmount` decimal(18,2) GENERATED ALWAYS AS (`TotalAmount` - `PaidAmount`) STORED,
  `Status` varchar(20) DEFAULT 'Draft',
  `EInvoiceStatus` varchar(20) DEFAULT NULL,
  `EInvoiceUUID` varchar(100) DEFAULT NULL,
  `EInvoiceSubmissionDate` datetime DEFAULT NULL,
  `PaymentTerms` varchar(200) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesorderitems`
--

CREATE TABLE `salesorderitems` (
  `SOItemID` int(11) NOT NULL,
  `SOID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `OrderedQty` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxPercentage` decimal(5,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalPrice` decimal(18,2) NOT NULL,
  `DeliveredQty` decimal(18,3) DEFAULT 0.000,
  `RemainingQty` decimal(18,3) GENERATED ALWAYS AS (`OrderedQty` - `DeliveredQty`) STORED,
  `Status` varchar(20) DEFAULT 'Pending',
  `WarehouseID` int(11) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesorders`
--

CREATE TABLE `salesorders` (
  `SOID` int(11) NOT NULL,
  `SONumber` varchar(20) NOT NULL,
  `SODate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SalesQuotationID` int(11) DEFAULT NULL,
  `CustomerID` int(11) NOT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `SalesRepID` int(11) DEFAULT NULL,
  `ShippingAddress` varchar(500) DEFAULT NULL,
  `ExpectedDeliveryDate` date DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `PriceListID` int(11) DEFAULT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `ShippingCost` decimal(18,2) DEFAULT 0.00,
  `TotalAmount` decimal(18,2) NOT NULL,
  `PaymentTerms` varchar(200) DEFAULT NULL,
  `PaymentTermDays` int(11) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `CreditCheckStatus` varchar(20) DEFAULT NULL,
  `CreditCheckBy` int(11) DEFAULT NULL,
  `CreditCheckDate` datetime DEFAULT NULL,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesquotationitems`
--

CREATE TABLE `salesquotationitems` (
  `SQItemID` int(11) NOT NULL,
  `SalesQuotationID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxPercentage` decimal(5,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalPrice` decimal(18,2) NOT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesquotations`
--

CREATE TABLE `salesquotations` (
  `SalesQuotationID` int(11) NOT NULL,
  `QuotationNumber` varchar(20) NOT NULL,
  `QuotationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ValidUntilDate` date NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `SalesRepID` int(11) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `PriceListID` int(11) DEFAULT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalAmount` decimal(18,2) NOT NULL,
  `PaymentTerms` varchar(200) DEFAULT NULL,
  `DeliveryTerms` varchar(200) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `SentDate` datetime DEFAULT NULL,
  `AcceptedDate` datetime DEFAULT NULL,
  `RejectedReason` varchar(500) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `TermsAndConditions` text DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesreturnitems`
--

CREATE TABLE `salesreturnitems` (
  `ReturnItemID` int(11) NOT NULL,
  `SalesReturnID` int(11) NOT NULL,
  `InvoiceItemID` int(11) DEFAULT NULL,
  `ItemID` int(11) NOT NULL,
  `ReturnedQty` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `TaxPercentage` decimal(5,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalPrice` decimal(18,2) NOT NULL,
  `ReturnReason` varchar(100) DEFAULT NULL,
  `QualityStatus` varchar(20) DEFAULT NULL,
  `LocationID` int(11) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salesreturns`
--

CREATE TABLE `salesreturns` (
  `SalesReturnID` int(11) NOT NULL,
  `ReturnNumber` varchar(20) NOT NULL,
  `ReturnDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SalesInvoiceID` int(11) DEFAULT NULL,
  `CustomerID` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL,
  `ReturnReason` varchar(50) DEFAULT NULL,
  `SubTotal` decimal(18,2) NOT NULL,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalAmount` decimal(18,2) NOT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `CreditNoteID` int(11) DEFAULT NULL,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `ReceivedByUserID` int(11) NOT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockadjustmentitems`
--

CREATE TABLE `stockadjustmentitems` (
  `AdjItemID` int(11) NOT NULL,
  `AdjustmentID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `LocationID` int(11) DEFAULT NULL,
  `LotNumber` varchar(50) DEFAULT NULL,
  `SystemQty` decimal(18,3) NOT NULL,
  `ActualQty` decimal(18,3) NOT NULL,
  `AdjustmentQty` decimal(18,3) GENERATED ALWAYS AS (`ActualQty` - `SystemQty`) STORED,
  `UnitID` int(11) NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `AdjustmentValue` decimal(18,2) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockadjustments`
--

CREATE TABLE `stockadjustments` (
  `AdjustmentID` int(11) NOT NULL,
  `AdjustmentNumber` varchar(20) NOT NULL,
  `AdjustmentDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `WarehouseID` int(11) NOT NULL,
  `AdjustmentType` varchar(20) NOT NULL,
  `Reason` varchar(500) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `PostedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockbalances`
--

CREATE TABLE `stockbalances` (
  `StockBalanceID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL,
  `LocationID` int(11) DEFAULT NULL,
  `LotNumber` varchar(50) DEFAULT NULL,
  `QuantityOnHand` decimal(18,3) NOT NULL DEFAULT 0.000,
  `QuantityReserved` decimal(18,3) NOT NULL DEFAULT 0.000,
  `AvailableQty` decimal(18,3) GENERATED ALWAYS AS (`QuantityOnHand` - `QuantityReserved`) STORED,
  `AverageCost` decimal(18,4) DEFAULT NULL,
  `LastMovementDate` datetime DEFAULT NULL,
  `LastCountDate` date DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockissuenoteitems`
--

CREATE TABLE `stockissuenoteitems` (
  `IssueItemID` int(11) NOT NULL,
  `IssueNoteID` int(11) NOT NULL,
  `SOItemID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `RequestedQty` decimal(18,3) NOT NULL,
  `IssuedQty` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `TotalCost` decimal(18,2) DEFAULT NULL,
  `LotNumber` varchar(50) DEFAULT NULL,
  `LocationID` int(11) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockissuenotes`
--

CREATE TABLE `stockissuenotes` (
  `IssueNoteID` int(11) NOT NULL,
  `IssueNoteNumber` varchar(20) NOT NULL,
  `IssueDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SOID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL,
  `IssuedByUserID` int(11) NOT NULL,
  `ReceivedByName` varchar(100) DEFAULT NULL,
  `ReceivedByID` varchar(50) DEFAULT NULL,
  `ReceivedBySignature` varchar(500) DEFAULT NULL,
  `VehicleNo` varchar(20) DEFAULT NULL,
  `DriverName` varchar(100) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `DeliveryDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockmovements`
--

CREATE TABLE `stockmovements` (
  `MovementID` bigint(20) NOT NULL,
  `MovementDate` datetime NOT NULL DEFAULT current_timestamp(),
  `MovementType` varchar(20) NOT NULL,
  `ReferenceType` varchar(30) DEFAULT NULL,
  `ReferenceID` int(11) DEFAULT NULL,
  `ReferenceNumber` varchar(30) DEFAULT NULL,
  `ItemID` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL,
  `LocationID` int(11) DEFAULT NULL,
  `LotNumber` varchar(50) DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  `Direction` varchar(3) NOT NULL,
  `UnitCost` decimal(18,4) DEFAULT NULL,
  `TotalCost` decimal(18,2) DEFAULT NULL,
  `BalanceBefore` decimal(18,3) DEFAULT NULL,
  `BalanceAfter` decimal(18,3) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockreservations`
--

CREATE TABLE `stockreservations` (
  `ReservationID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL,
  `ReservedQty` decimal(18,3) NOT NULL,
  `ReferenceType` varchar(20) NOT NULL,
  `ReferenceID` int(11) NOT NULL,
  `ReservedByUserID` int(11) NOT NULL,
  `ReservedDate` datetime DEFAULT current_timestamp(),
  `ExpiryDate` datetime DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Active',
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stocktransferitems`
--

CREATE TABLE `stocktransferitems` (
  `TransferItemID` int(11) NOT NULL,
  `TransferID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `RequestedQty` decimal(18,3) NOT NULL,
  `TransferredQty` decimal(18,3) DEFAULT NULL,
  `ReceivedQty` decimal(18,3) DEFAULT NULL,
  `UnitID` int(11) NOT NULL,
  `FromLocationID` int(11) DEFAULT NULL,
  `ToLocationID` int(11) DEFAULT NULL,
  `LotNumber` varchar(50) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stocktransfers`
--

CREATE TABLE `stocktransfers` (
  `TransferID` int(11) NOT NULL,
  `TransferNumber` varchar(20) NOT NULL,
  `TransferDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `FromWarehouseID` int(11) NOT NULL,
  `ToWarehouseID` int(11) NOT NULL,
  `RequestedByUserID` int(11) NOT NULL,
  `TransferredByUserID` int(11) DEFAULT NULL,
  `ReceivedByUserID` int(11) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Draft',
  `ShippedDate` datetime DEFAULT NULL,
  `ReceivedDate` datetime DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suggestedsellingprices`
--

CREATE TABLE `suggestedsellingprices` (
  `SuggestedPriceID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `EffectiveDate` date NOT NULL,
  `ReplacementCost` decimal(18,4) DEFAULT NULL,
  `TargetMargin` decimal(5,2) DEFAULT NULL,
  `SuggestedPrice` decimal(18,4) DEFAULT NULL,
  `MinPrice` decimal(18,4) DEFAULT NULL,
  `MaxPrice` decimal(18,4) DEFAULT NULL,
  `IsApproved` tinyint(1) DEFAULT 0,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplierinvoiceitems`
--

CREATE TABLE `supplierinvoiceitems` (
  `SIItemID` int(11) NOT NULL,
  `SupplierInvoiceID` int(11) NOT NULL,
  `GRNItemID` int(11) DEFAULT NULL,
  `ItemID` int(11) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Quantity` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxPercentage` decimal(5,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalPrice` decimal(18,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplierinvoices`
--

CREATE TABLE `supplierinvoices` (
  `SupplierInvoiceID` int(11) NOT NULL,
  `InvoiceNumber` varchar(30) NOT NULL,
  `SupplierInvoiceNo` varchar(50) NOT NULL,
  `InvoiceDate` date NOT NULL,
  `DueDate` date NOT NULL,
  `POID` int(11) DEFAULT NULL,
  `GRNID` int(11) DEFAULT NULL,
  `SupplierID` int(11) NOT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `SubTotal` decimal(18,2) NOT NULL,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalAmount` decimal(18,2) NOT NULL,
  `PaidAmount` decimal(18,2) DEFAULT 0.00,
  `RemainingAmount` decimal(18,2) GENERATED ALWAYS AS (`TotalAmount` - `PaidAmount`) STORED,
  `Status` varchar(20) DEFAULT 'Pending',
  `VerifiedByUserID` int(11) DEFAULT NULL,
  `VerifiedDate` datetime DEFAULT NULL,
  `ApprovedByUserID` int(11) DEFAULT NULL,
  `ApprovedDate` datetime DEFAULT NULL,
  `PaymentTerms` varchar(200) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `AttachmentPath` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) NOT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplieritems`
--

CREATE TABLE `supplieritems` (
  `SupplierItemID` int(11) NOT NULL,
  `SupplierID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `SupplierItemCode` varchar(50) DEFAULT NULL,
  `LastPrice` decimal(18,4) DEFAULT NULL,
  `LastPriceDate` date DEFAULT NULL,
  `LeadTimeDays` int(11) DEFAULT NULL,
  `MinOrderQty` decimal(18,3) DEFAULT NULL,
  `IsPreferred` tinyint(1) DEFAULT 0,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplierquotationitems`
--

CREATE TABLE `supplierquotationitems` (
  `SQItemID` int(11) NOT NULL,
  `QuotationID` int(11) NOT NULL,
  `ItemID` int(11) NOT NULL,
  `OfferedQty` decimal(18,3) NOT NULL,
  `UnitID` int(11) NOT NULL,
  `UnitPrice` decimal(18,4) NOT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT 0.00,
  `DiscountAmount` decimal(18,2) DEFAULT 0.00,
  `TaxPercentage` decimal(5,2) DEFAULT 0.00,
  `TaxAmount` decimal(18,2) DEFAULT 0.00,
  `TotalPrice` decimal(18,2) NOT NULL,
  `DeliveryDays` int(11) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplierquotations`
--

CREATE TABLE `supplierquotations` (
  `QuotationID` int(11) NOT NULL,
  `QuotationNumber` varchar(30) DEFAULT NULL,
  `RFQID` int(11) DEFAULT NULL,
  `SupplierID` int(11) NOT NULL,
  `QuotationDate` date NOT NULL,
  `ValidUntilDate` date DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `ExchangeRate` decimal(18,6) DEFAULT 1.000000,
  `PaymentTerms` varchar(200) DEFAULT NULL,
  `DeliveryTerms` varchar(200) DEFAULT NULL,
  `DeliveryDays` int(11) DEFAULT NULL,
  `TotalAmount` decimal(18,2) DEFAULT NULL,
  `Status` varchar(20) DEFAULT 'Received',
  `AttachmentPath` varchar(500) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `ReceivedByUserID` int(11) DEFAULT NULL,
  `ReceivedDate` datetime DEFAULT current_timestamp(),
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `SupplierID` int(11) NOT NULL,
  `SupplierCode` varchar(20) NOT NULL,
  `SupplierNameAr` varchar(200) NOT NULL,
  `SupplierNameEn` varchar(200) DEFAULT NULL,
  `SupplierType` varchar(20) DEFAULT NULL,
  `TaxRegistrationNo` varchar(50) DEFAULT NULL,
  `CommercialRegNo` varchar(50) DEFAULT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Fax` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Website` varchar(200) DEFAULT NULL,
  `ContactPerson` varchar(100) DEFAULT NULL,
  `ContactPhone` varchar(20) DEFAULT NULL,
  `PaymentTermDays` int(11) DEFAULT 0,
  `CreditLimit` decimal(18,2) DEFAULT NULL,
  `Currency` varchar(3) DEFAULT 'EGP',
  `BankName` varchar(100) DEFAULT NULL,
  `BankAccountNo` varchar(50) DEFAULT NULL,
  `IBAN` varchar(50) DEFAULT NULL,
  `Rating` varchar(10) DEFAULT NULL,
  `IsApproved` tinyint(1) DEFAULT 0,
  `ApprovedBy` int(11) DEFAULT NULL,
  `ApprovedDate` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `Notes` varchar(1000) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `systemsettings`
--

CREATE TABLE `systemsettings` (
  `SettingID` int(11) NOT NULL,
  `SettingGroup` varchar(50) NOT NULL,
  `SettingKey` varchar(100) NOT NULL,
  `SettingValue` text DEFAULT NULL,
  `DataType` varchar(20) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `IsEditable` tinyint(1) DEFAULT 1,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `systemsettings`
--

INSERT INTO `systemsettings` (`SettingID`, `SettingGroup`, `SettingKey`, `SettingValue`, `DataType`, `Description`, `IsEditable`, `UpdatedAt`, `UpdatedBy`) VALUES
(1, 'General', 'DefaultCurrency', 'EGP', 'String', 'العملة الافتراضية', 1, NULL, NULL),
(2, 'General', 'VATRate', '14.00', 'Decimal', 'نسبة ضريبة القيمة المضافة', 1, NULL, NULL),
(3, 'General', 'FiscalYearStartMonth', '1', 'Integer', 'شهر بداية السنة المالية', 1, NULL, NULL),
(4, 'Inventory', 'AllowNegativeStock', 'false', 'Boolean', 'السماح بالرصيد السالب', 1, NULL, NULL),
(5, 'Inventory', 'DefaultCostingMethod', 'WeightedAverage', 'String', 'طريقة التكلفة الافتراضية', 1, NULL, NULL),
(6, 'Sales', 'CreditCheckEnabled', 'true', 'Boolean', 'تفعيل فحص الائتمان', 1, NULL, NULL),
(7, 'Sales', 'MaxDiscountWithoutApproval', '5.00', 'Decimal', 'أقصى نسبة خصم بدون اعتماد', 1, NULL, NULL),
(8, 'Purchase', 'RequireThreeQuotations', 'true', 'Boolean', 'يجب الحصول على 3 عروض أسعار', 1, NULL, NULL),
(9, 'Finance', 'RequirePaymentApproval', 'true', 'Boolean', 'اعتماد سندات الصرف', 1, NULL, NULL),
(10, 'Finance', 'ChequeSignaturesRequired', '2', 'Integer', 'عدد التوقيعات على الشيك', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transportcontractors`
--

CREATE TABLE `transportcontractors` (
  `ContractorID` int(11) NOT NULL,
  `ContractorCode` varchar(20) NOT NULL,
  `ContractorName` varchar(200) NOT NULL,
  `ContactPerson` varchar(100) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `TaxRegistrationNo` varchar(50) DEFAULT NULL,
  `Rating` varchar(10) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `unitsofmeasure`
--

CREATE TABLE `unitsofmeasure` (
  `UnitID` int(11) NOT NULL,
  `UnitCode` varchar(10) NOT NULL,
  `UnitNameAr` varchar(50) NOT NULL,
  `UnitNameEn` varchar(50) DEFAULT NULL,
  `IsBaseUnit` tinyint(1) DEFAULT 1,
  `BaseUnitID` int(11) DEFAULT NULL,
  `ConversionFactor` decimal(18,6) DEFAULT 1.000000,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `unitsofmeasure`
--

INSERT INTO `unitsofmeasure` (`UnitID`, `UnitCode`, `UnitNameAr`, `UnitNameEn`, `IsBaseUnit`, `BaseUnitID`, `ConversionFactor`, `IsActive`) VALUES
(1, 'KG', 'كيلوجرام', 'Kilogram', 1, NULL, 1.000000, 1),
(2, 'TON', 'طن', 'Ton', 0, 1, 1000.000000, 1),
(3, 'PCS', 'قطعة', 'Piece', 1, NULL, 1.000000, 1),
(4, 'BAG', 'شيكارة', 'Bag', 0, NULL, 1.000000, 1),
(5, 'PKT', 'باكت', 'Packet', 0, NULL, 1.000000, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `PasswordHash` varchar(256) NOT NULL,
  `EmployeeID` int(11) NOT NULL,
  `RoleID` int(11) NOT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `LastLoginAt` datetime DEFAULT NULL,
  `FailedLoginAttempts` int(11) DEFAULT 0,
  `IsLocked` tinyint(1) DEFAULT 0,
  `CreatedAt` datetime DEFAULT current_timestamp(),
  `CreatedBy` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `UpdatedBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `VehicleID` int(11) NOT NULL,
  `VehicleCode` varchar(20) NOT NULL,
  `PlateNumber` varchar(20) NOT NULL,
  `VehicleType` varchar(30) DEFAULT NULL,
  `Brand` varchar(50) DEFAULT NULL,
  `Model` varchar(50) DEFAULT NULL,
  `Year` int(11) DEFAULT NULL,
  `Capacity` decimal(10,2) DEFAULT NULL,
  `OwnershipType` varchar(20) DEFAULT NULL,
  `DriverID` int(11) DEFAULT NULL,
  `LicenseExpiry` date DEFAULT NULL,
  `InsuranceExpiry` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `Notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_customeroutstanding`
-- (See below for the actual view)
--
CREATE TABLE `vw_customeroutstanding` (
`CustomerID` int(11)
,`CustomerCode` varchar(20)
,`CustomerNameAr` varchar(200)
,`CustomerType` varchar(20)
,`CreditLimit` decimal(18,2)
,`TotalInvoiced` decimal(40,2)
,`TotalPaid` decimal(40,2)
,`OutstandingBalance` decimal(41,2)
,`AvailableCredit` decimal(42,2)
,`OverdueInvoices` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_dailysalessummary`
-- (See below for the actual view)
--
CREATE TABLE `vw_dailysalessummary` (
`SalesDate` date
,`InvoiceCount` bigint(21)
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
`RequestID` int(11)
,`DocumentType` varchar(30)
,`DocumentID` int(11)
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
`POID` int(11)
,`PONumber` varchar(20)
,`PODate` date
,`SupplierNameAr` varchar(200)
,`TotalAmount` decimal(18,2)
,`Status` varchar(20)
,`ApprovalStatus` varchar(20)
,`TotalItems` bigint(21)
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
`ItemID` int(11)
,`ItemCode` varchar(30)
,`ItemNameAr` varchar(200)
,`GradeName` varchar(50)
,`WarehouseID` int(11)
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
`SupplierID` int(11)
,`SupplierCode` varchar(20)
,`SupplierNameAr` varchar(200)
,`SupplierType` varchar(20)
,`TotalInvoiced` decimal(40,2)
,`TotalPaid` decimal(40,2)
,`OutstandingBalance` decimal(41,2)
,`OverdueInvoices` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Table structure for table `warehouselocations`
--

CREATE TABLE `warehouselocations` (
  `LocationID` int(11) NOT NULL,
  `WarehouseID` int(11) NOT NULL,
  `LocationCode` varchar(30) NOT NULL,
  `LocationName` varchar(100) DEFAULT NULL,
  `Row` varchar(10) DEFAULT NULL,
  `Shelf` varchar(10) DEFAULT NULL,
  `Bin` varchar(10) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `WarehouseID` int(11) NOT NULL,
  `WarehouseCode` varchar(20) NOT NULL,
  `WarehouseNameAr` varchar(100) NOT NULL,
  `WarehouseNameEn` varchar(100) DEFAULT NULL,
  `WarehouseType` varchar(20) NOT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `ManagerID` int(11) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT 1,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure for view `vw_customeroutstanding`
--
DROP TABLE IF EXISTS `vw_customeroutstanding`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_customeroutstanding`  AS SELECT `c`.`CustomerID` AS `CustomerID`, `c`.`CustomerCode` AS `CustomerCode`, `c`.`CustomerNameAr` AS `CustomerNameAr`, `c`.`CustomerType` AS `CustomerType`, `c`.`CreditLimit` AS `CreditLimit`, sum(`si`.`TotalAmount`) AS `TotalInvoiced`, sum(`si`.`PaidAmount`) AS `TotalPaid`, sum(`si`.`TotalAmount` - `si`.`PaidAmount`) AS `OutstandingBalance`, `c`.`CreditLimit`- sum(`si`.`TotalAmount` - `si`.`PaidAmount`) AS `AvailableCredit`, sum(case when `si`.`Status` = 'Overdue' then 1 else 0 end) AS `OverdueInvoices` FROM (`customers` `c` left join `salesinvoices` `si` on(`c`.`CustomerID` = `si`.`CustomerID` and `si`.`Status` not in ('Cancelled','Draft'))) GROUP BY `c`.`CustomerID`, `c`.`CustomerCode`, `c`.`CustomerNameAr`, `c`.`CustomerType`, `c`.`CreditLimit` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_dailysalessummary`
--
DROP TABLE IF EXISTS `vw_dailysalessummary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_dailysalessummary`  AS SELECT cast(`si`.`InvoiceDate` as date) AS `SalesDate`, count(`si`.`SalesInvoiceID`) AS `InvoiceCount`, sum(`si`.`SubTotal`) AS `SubTotal`, sum(`si`.`DiscountAmount`) AS `TotalDiscount`, sum(`si`.`TaxAmount`) AS `TotalTax`, sum(`si`.`TotalAmount`) AS `TotalSales`, sum(`si`.`PaidAmount`) AS `TotalCollected`, sum(`si`.`TotalAmount` - `si`.`PaidAmount`) AS `TotalOutstanding` FROM `salesinvoices` AS `si` WHERE `si`.`Status` not in ('Cancelled','Draft') GROUP BY cast(`si`.`InvoiceDate` as date) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_pendingapprovals`
--
DROP TABLE IF EXISTS `vw_pendingapprovals`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_pendingapprovals`  AS SELECT `ar`.`RequestID` AS `RequestID`, `ar`.`DocumentType` AS `DocumentType`, `ar`.`DocumentID` AS `DocumentID`, `ar`.`DocumentNumber` AS `DocumentNumber`, `ar`.`TotalAmount` AS `TotalAmount`, `ar`.`RequestedDate` AS `RequestedDate`, `ar`.`Priority` AS `Priority`, `ar`.`DueDate` AS `DueDate`, `u`.`Username` AS `RequestedByUser`, concat(`e`.`FirstNameAr`,' ',`e`.`LastNameAr`) AS `RequestedByName`, `aws`.`StepName` AS `CurrentStep`, `aw`.`WorkflowName` AS `WorkflowName` FROM ((((`approvalrequests` `ar` join `users` `u` on(`ar`.`RequestedByUserID` = `u`.`UserID`)) join `employees` `e` on(`u`.`EmployeeID` = `e`.`EmployeeID`)) join `approvalworkflows` `aw` on(`ar`.`WorkflowID` = `aw`.`WorkflowID`)) left join `approvalworkflowsteps` `aws` on(`ar`.`CurrentStepID` = `aws`.`StepID`)) WHERE `ar`.`Status` in ('Pending','InProgress') ;

-- --------------------------------------------------------

--
-- Structure for view `vw_purchaseorderstatus`
--
DROP TABLE IF EXISTS `vw_purchaseorderstatus`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_purchaseorderstatus`  AS SELECT `po`.`POID` AS `POID`, `po`.`PONumber` AS `PONumber`, `po`.`PODate` AS `PODate`, `s`.`SupplierNameAr` AS `SupplierNameAr`, `po`.`TotalAmount` AS `TotalAmount`, `po`.`Status` AS `Status`, `po`.`ApprovalStatus` AS `ApprovalStatus`, count(`poi`.`POItemID`) AS `TotalItems`, sum(`poi`.`OrderedQty`) AS `TotalOrderedQty`, sum(`poi`.`ReceivedQty`) AS `TotalReceivedQty`, CASE WHEN sum(`poi`.`ReceivedQty`) = 0 THEN 'لم يتم الاستلام' WHEN sum(`poi`.`ReceivedQty`) < sum(`poi`.`OrderedQty`) THEN 'استلام جزئي' ELSE 'تم الاستلام بالكامل' END AS `ReceiptStatus` FROM ((`purchaseorders` `po` join `suppliers` `s` on(`po`.`SupplierID` = `s`.`SupplierID`)) join `purchaseorderitems` `poi` on(`po`.`POID` = `poi`.`POID`)) GROUP BY `po`.`POID`, `po`.`PONumber`, `po`.`PODate`, `s`.`SupplierNameAr`, `po`.`TotalAmount`, `po`.`Status`, `po`.`ApprovalStatus` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_stocksummary`
--
DROP TABLE IF EXISTS `vw_stocksummary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_stocksummary`  AS SELECT `sb`.`ItemID` AS `ItemID`, `i`.`ItemCode` AS `ItemCode`, `i`.`ItemNameAr` AS `ItemNameAr`, `i`.`GradeName` AS `GradeName`, `sb`.`WarehouseID` AS `WarehouseID`, `w`.`WarehouseNameAr` AS `WarehouseNameAr`, sum(`sb`.`QuantityOnHand`) AS `TotalQuantityOnHand`, sum(`sb`.`QuantityReserved`) AS `TotalQuantityReserved`, sum(`sb`.`QuantityOnHand` - `sb`.`QuantityReserved`) AS `TotalQuantityAvailable`, avg(`sb`.`AverageCost`) AS `AverageCost`, sum((`sb`.`QuantityOnHand` - `sb`.`QuantityReserved`) * ifnull(`sb`.`AverageCost`,0)) AS `StockValue` FROM ((`stockbalances` `sb` join `items` `i` on(`sb`.`ItemID` = `i`.`ItemID`)) join `warehouses` `w` on(`sb`.`WarehouseID` = `w`.`WarehouseID`)) GROUP BY `sb`.`ItemID`, `i`.`ItemCode`, `i`.`ItemNameAr`, `i`.`GradeName`, `sb`.`WarehouseID`, `w`.`WarehouseNameAr` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_supplieroutstanding`
--
DROP TABLE IF EXISTS `vw_supplieroutstanding`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_supplieroutstanding`  AS SELECT `s`.`SupplierID` AS `SupplierID`, `s`.`SupplierCode` AS `SupplierCode`, `s`.`SupplierNameAr` AS `SupplierNameAr`, `s`.`SupplierType` AS `SupplierType`, sum(`si`.`TotalAmount`) AS `TotalInvoiced`, sum(`si`.`PaidAmount`) AS `TotalPaid`, sum(`si`.`TotalAmount` - `si`.`PaidAmount`) AS `OutstandingBalance`, sum(case when `si`.`DueDate` < current_timestamp() and `si`.`Status` not in ('Paid','Cancelled') then 1 else 0 end) AS `OverdueInvoices` FROM (`suppliers` `s` left join `supplierinvoices` `si` on(`s`.`SupplierID` = `si`.`SupplierID` and `si`.`Status` <> 'Cancelled')) GROUP BY `s`.`SupplierID`, `s`.`SupplierCode`, `s`.`SupplierNameAr`, `s`.`SupplierType` ;

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
  ADD KEY `FK_WFStep_User` (`ApproverUserID`);

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
  ADD UNIQUE KEY `UQ_ItemParameter` (`ItemID`,`ParameterID`),
  ADD KEY `FK_ItemSpecs_Parameter` (`ParameterID`);

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
  ADD KEY `FK_Payment_Level3` (`Level3ApprovedBy`);

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
  ADD KEY `FK_PriceListItems_Item` (`ItemID`);

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
  ADD KEY `IX_SalesInvoice_EInvoice` (`EInvoiceStatus`);

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
  ADD KEY `FK_SalesQuote_PriceList` (`PriceListID`);

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
  ADD KEY `FK_AdjItems_Unit` (`UnitID`);

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
  ADD KEY `IX_StockBalance_Warehouse` (`WarehouseID`);

--
-- Indexes for table `stockissuenoteitems`
--
ALTER TABLE `stockissuenoteitems`
  ADD PRIMARY KEY (`IssueItemID`),
  ADD KEY `FK_IssueItems_Note` (`IssueNoteID`),
  ADD KEY `FK_IssueItems_SOItem` (`SOItemID`),
  ADD KEY `FK_IssueItems_Item` (`ItemID`),
  ADD KEY `FK_IssueItems_Unit` (`UnitID`),
  ADD KEY `FK_IssueItems_Location` (`LocationID`);

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
  ADD KEY `IX_StockMovement_Type` (`MovementType`);

-- Add BatchID columns and indexes to inventory tables now that tables exist
ALTER TABLE `stockmovements` ADD COLUMN `BatchID` int(11) DEFAULT NULL AFTER `LotNumber`;
ALTER TABLE `stockbalances` ADD COLUMN `BatchID` int(11) DEFAULT NULL AFTER `LotNumber`;
ALTER TABLE `stockissuenoteitems` ADD COLUMN `BatchID` int(11) DEFAULT NULL AFTER `LotNumber`;
ALTER TABLE `stocktransferitems` ADD COLUMN `BatchID` int(11) DEFAULT NULL AFTER `LotNumber`;
ALTER TABLE `stockadjustmentitems` ADD COLUMN `BatchID` int(11) DEFAULT NULL AFTER `LotNumber`;

ALTER TABLE `stockmovements` ADD KEY `FK_Movement_Batch` (`BatchID`);
ALTER TABLE `stockbalances` ADD KEY `FK_StockBalance_Batch` (`BatchID`);
ALTER TABLE `stockissuenoteitems` ADD KEY `FK_IssueItems_Batch` (`BatchID`);
ALTER TABLE `stocktransferitems` ADD KEY `FK_TransferItems_Batch` (`BatchID`);
ALTER TABLE `stockadjustmentitems` ADD KEY `FK_AdjItems_Batch` (`BatchID`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alertrules`
--
ALTER TABLE `alertrules`
  MODIFY `AlertRuleID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approvalactions`
--
ALTER TABLE `approvalactions`
  MODIFY `ActionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approvallimits`
--
ALTER TABLE `approvallimits`
  MODIFY `ApprovalLimitID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approvalrequests`
--
ALTER TABLE `approvalrequests`
  MODIFY `RequestID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approvalworkflows`
--
ALTER TABLE `approvalworkflows`
  MODIFY `WorkflowID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `approvalworkflowsteps`
--
ALTER TABLE `approvalworkflowsteps`
  MODIFY `StepID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `AttendanceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auditlog`
--
ALTER TABLE `auditlog`
  MODIFY `AuditLogID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bankaccounts`
--
ALTER TABLE `bankaccounts`
  MODIFY `BankAccountID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banks`
--
ALTER TABLE `banks`
  MODIFY `BankID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banktransactions`
--
ALTER TABLE `banktransactions`
  MODIFY `TransactionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cashregisters`
--
ALTER TABLE `cashregisters`
  MODIFY `CashRegisterID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chartofaccounts`
--
ALTER TABLE `chartofaccounts`
  MODIFY `AccountID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chequesissued`
--
ALTER TABLE `chequesissued`
  MODIFY `ChequeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chequesreceived`
--
ALTER TABLE `chequesreceived`
  MODIFY `ChequeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companyinfo`
--
ALTER TABLE `companyinfo`
  MODIFY `CompanyID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `costcenters`
--
ALTER TABLE `costcenters`
  MODIFY `CostCenterID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `creditnotes`
--
ALTER TABLE `creditnotes`
  MODIFY `CreditNoteID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customercontacts`
--
ALTER TABLE `customercontacts`
  MODIFY `ContactID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dailymarketprices`
--
ALTER TABLE `dailymarketprices`
  MODIFY `PriceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `debitnotes`
--
ALTER TABLE `debitnotes`
  MODIFY `DebitNoteID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deliveryorders`
--
ALTER TABLE `deliveryorders`
  MODIFY `DeliveryOrderID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deliveryzones`
--
ALTER TABLE `deliveryzones`
  MODIFY `ZoneID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `DepartmentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `documentcycletracking`
--
ALTER TABLE `documentcycletracking`
  MODIFY `TrackingID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documentrelationships`
--
ALTER TABLE `documentrelationships`
  MODIFY `RelationshipID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documentsequences`
--
ALTER TABLE `documentsequences`
  MODIFY `SequenceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documenttypes`
--
ALTER TABLE `documenttypes`
  MODIFY `DocumentTypeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `EmployeeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employeesalarystructure`
--
ALTER TABLE `employeesalarystructure`
  MODIFY `StructureID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exchangerates`
--
ALTER TABLE `exchangerates`
  MODIFY `ExchangeRateID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fiscalperiods`
--
ALTER TABLE `fiscalperiods`
  MODIFY `PeriodID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fiscalyears`
--
ALTER TABLE `fiscalyears`
  MODIFY `FiscalYearID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goodsreceiptnotes`
--
ALTER TABLE `goodsreceiptnotes`
  MODIFY `GRNID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grnitems`
--
ALTER TABLE `grnitems`
  MODIFY `GRNItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `itemcategories`
--
ALTER TABLE `itemcategories`
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `itemqualityspecs`
--
ALTER TABLE `itemqualityspecs`
  MODIFY `SpecID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `ItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journalentries`
--
ALTER TABLE `journalentries`
  MODIFY `JournalEntryID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `journalentrylines`
--
ALTER TABLE `journalentrylines`
  MODIFY `LineID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leaverequests`
--
ALTER TABLE `leaverequests`
  MODIFY `LeaveRequestID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `NotificationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `numberseries`
--
ALTER TABLE `numberseries`
  MODIFY `SeriesID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paymentvoucherallocations`
--
ALTER TABLE `paymentvoucherallocations`
  MODIFY `AllocationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paymentvouchers`
--
ALTER TABLE `paymentvouchers`
  MODIFY `PaymentVoucherID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `PayrollID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payrolldetails`
--
ALTER TABLE `payrolldetails`
  MODIFY `PayrollDetailID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `PermissionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `pricelistitems`
--
ALTER TABLE `pricelistitems`
  MODIFY `PriceListItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pricelists`
--
ALTER TABLE `pricelists`
  MODIFY `PriceListID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchaseorderitems`
--
ALTER TABLE `purchaseorderitems`
  MODIFY `POItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchaseorders`
--
ALTER TABLE `purchaseorders`
  MODIFY `POID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchaserequisitionitems`
--
ALTER TABLE `purchaserequisitionitems`
  MODIFY `PRItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchaserequisitions`
--
ALTER TABLE `purchaserequisitions`
  MODIFY `PRID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchasereturnitems`
--
ALTER TABLE `purchasereturnitems`
  MODIFY `ReturnItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchasereturns`
--
ALTER TABLE `purchasereturns`
  MODIFY `PurchaseReturnID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qualityinspectionresults`
--
ALTER TABLE `qualityinspectionresults`
  MODIFY `ResultID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qualityinspections`
--
ALTER TABLE `qualityinspections`
  MODIFY `InspectionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qualityparameters`
--
ALTER TABLE `qualityparameters`
  MODIFY `ParameterID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotationcomparisondetails`
--
ALTER TABLE `quotationcomparisondetails`
  MODIFY `CompDetailID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotationcomparisons`
--
ALTER TABLE `quotationcomparisons`
  MODIFY `ComparisonID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receiptvoucherallocations`
--
ALTER TABLE `receiptvoucherallocations`
  MODIFY `AllocationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receiptvouchers`
--
ALTER TABLE `receiptvouchers`
  MODIFY `ReceiptVoucherID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requestforquotations`
--
ALTER TABLE `requestforquotations`
  MODIFY `RFQID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rfqitems`
--
ALTER TABLE `rfqitems`
  MODIFY `RFQItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  MODIFY `RolePermissionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `RoleID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `salarycomponents`
--
ALTER TABLE `salarycomponents`
  MODIFY `ComponentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesinvoiceitems`
--
ALTER TABLE `salesinvoiceitems`
  MODIFY `InvoiceItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesinvoices`
--
ALTER TABLE `salesinvoices`
  MODIFY `SalesInvoiceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesorderitems`
--
ALTER TABLE `salesorderitems`
  MODIFY `SOItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesorders`
--
ALTER TABLE `salesorders`
  MODIFY `SOID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesquotationitems`
--
ALTER TABLE `salesquotationitems`
  MODIFY `SQItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesquotations`
--
ALTER TABLE `salesquotations`
  MODIFY `SalesQuotationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesreturnitems`
--
ALTER TABLE `salesreturnitems`
  MODIFY `ReturnItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salesreturns`
--
ALTER TABLE `salesreturns`
  MODIFY `SalesReturnID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockadjustmentitems`
--
ALTER TABLE `stockadjustmentitems`
  MODIFY `AdjItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockadjustments`
--
ALTER TABLE `stockadjustments`
  MODIFY `AdjustmentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockbalances`
--
ALTER TABLE `stockbalances`
  MODIFY `StockBalanceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockissuenoteitems`
--
ALTER TABLE `stockissuenoteitems`
  MODIFY `IssueItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockissuenotes`
--
ALTER TABLE `stockissuenotes`
  MODIFY `IssueNoteID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockmovements`
--
ALTER TABLE `stockmovements`
  MODIFY `MovementID` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockreservations`
--
ALTER TABLE `stockreservations`
  MODIFY `ReservationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stocktransferitems`
--
ALTER TABLE `stocktransferitems`
  MODIFY `TransferItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stocktransfers`
--
ALTER TABLE `stocktransfers`
  MODIFY `TransferID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suggestedsellingprices`
--
ALTER TABLE `suggestedsellingprices`
  MODIFY `SuggestedPriceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplierinvoiceitems`
--
ALTER TABLE `supplierinvoiceitems`
  MODIFY `SIItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplierinvoices`
--
ALTER TABLE `supplierinvoices`
  MODIFY `SupplierInvoiceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplieritems`
--
ALTER TABLE `supplieritems`
  MODIFY `SupplierItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplierquotationitems`
--
ALTER TABLE `supplierquotationitems`
  MODIFY `SQItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplierquotations`
--
ALTER TABLE `supplierquotations`
  MODIFY `QuotationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `SupplierID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `systemsettings`
--
ALTER TABLE `systemsettings`
  MODIFY `SettingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `transportcontractors`
--
ALTER TABLE `transportcontractors`
  MODIFY `ContractorID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `unitsofmeasure`
--
ALTER TABLE `unitsofmeasure`
  MODIFY `UnitID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `VehicleID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warehouselocations`
--
ALTER TABLE `warehouselocations`
  MODIFY `LocationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `WarehouseID` int(11) NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `FK_WFStep_Workflow` FOREIGN KEY (`WorkflowID`) REFERENCES `approvalworkflows` (`WorkflowID`);

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
-- Constraints for table `itemcategories`
--
ALTER TABLE `itemcategories`
  ADD CONSTRAINT `FK_Categories_Parent` FOREIGN KEY (`ParentCategoryID`) REFERENCES `itemcategories` (`CategoryID`);

--
-- Constraints for table `itemqualityspecs`
--
ALTER TABLE `itemqualityspecs`
  ADD CONSTRAINT `FK_ItemSpecs_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_ItemSpecs_Parameter` FOREIGN KEY (`ParameterID`) REFERENCES `qualityparameters` (`ParameterID`);

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
  ADD CONSTRAINT `FK_Payment_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

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
  ADD CONSTRAINT `FK_SalesInvoice_SO` FOREIGN KEY (`SOID`) REFERENCES `salesorders` (`SOID`),
  ADD CONSTRAINT `FK_SalesInvoice_SalesRep` FOREIGN KEY (`SalesRepID`) REFERENCES `employees` (`EmployeeID`);

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
  ADD CONSTRAINT `FK_SalesQuote_SalesRep` FOREIGN KEY (`SalesRepID`) REFERENCES `employees` (`EmployeeID`);

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
  ADD CONSTRAINT `FK_StockBalance_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_StockBalance_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_StockBalance_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

--
-- Constraints for table `stockissuenoteitems`
--
ALTER TABLE `stockissuenoteitems`
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
  ADD CONSTRAINT `FK_Movement_CreatedBy` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_Movement_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_Movement_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_Movement_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`);

-- Inventory batches primary key/autoinc and foreign keys for batch relationships
ALTER TABLE `inventorybatches` ADD PRIMARY KEY (`BatchID`);
ALTER TABLE `inventorybatches` MODIFY `BatchID` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `inventorybatches`
  ADD CONSTRAINT `FK_Batch_Item` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  ADD CONSTRAINT `FK_Batch_GRNItem` FOREIGN KEY (`GRNItemID`) REFERENCES `grnitems` (`GRNItemID`),
  ADD CONSTRAINT `FK_Batch_Warehouse` FOREIGN KEY (`WarehouseID`) REFERENCES `warehouses` (`WarehouseID`),
  ADD CONSTRAINT `FK_Batch_Location` FOREIGN KEY (`LocationID`) REFERENCES `warehouselocations` (`LocationID`),
  ADD CONSTRAINT `FK_Batch_Unit` FOREIGN KEY (`UnitID`) REFERENCES `unitsofmeasure` (`UnitID`);

-- Foreign keys linking BatchID on inventory/issue/transfer/adjustment tables to inventorybatches
ALTER TABLE `stockmovements` ADD CONSTRAINT `FK_Movement_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`);
ALTER TABLE `stockbalances` ADD CONSTRAINT `FK_StockBalance_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`);
ALTER TABLE `stockissuenoteitems` ADD CONSTRAINT `FK_IssueItems_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`);
ALTER TABLE `stocktransferitems` ADD CONSTRAINT `FK_TransferItems_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`);
ALTER TABLE `stockadjustmentitems` ADD CONSTRAINT `FK_AdjItems_Batch` FOREIGN KEY (`BatchID`) REFERENCES `inventorybatches` (`BatchID`);

-- Link pricelist items to exchangerates (add column, index, constraint)
ALTER TABLE `pricelistitems` ADD COLUMN `ExchangeRateID` int(11) DEFAULT NULL AFTER `UnitPrice`;
ALTER TABLE `pricelistitems` ADD KEY `FK_PriceListItems_ExchangeRate` (`ExchangeRateID`);
ALTER TABLE `pricelistitems` ADD CONSTRAINT `FK_PriceListItems_ExchangeRate` FOREIGN KEY (`ExchangeRateID`) REFERENCES `exchangerates` (`ExchangeRateID`);

-- Add e-invoicing fields to salesinvoices now that table exists
ALTER TABLE `salesinvoices`
  ADD COLUMN `EInvoiceSubmissionID` varchar(100) DEFAULT NULL AFTER `EInvoiceUUID`,
  ADD COLUMN `EInvoiceInternalID` varchar(100) DEFAULT NULL AFTER `EInvoiceSubmissionID`,
  ADD COLUMN `EInvoiceValidationStatus` varchar(20) DEFAULT NULL AFTER `EInvoiceSubmissionDate`;
ALTER TABLE `salesinvoices` ADD KEY `IX_SalesInvoice_EInvoiceUUID` (`EInvoiceUUID`);

-- Enrich chartofaccounts (add columns)
ALTER TABLE `chartofaccounts`
  ADD COLUMN `AccountNature` varchar(20) DEFAULT NULL AFTER `AccountType`,
  ADD COLUMN `AccountLevel` int(11) DEFAULT NULL AFTER `AccountNature`,
  ADD COLUMN `IsControlAccount` tinyint(1) DEFAULT 0 AFTER `IsParent`;

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
  ADD CONSTRAINT `FK_SQ_RFQ` FOREIGN KEY (`RFQID`) REFERENCES `requestforquotations` (`RFQID`),
  ADD CONSTRAINT `FK_SQ_ReceivedBy` FOREIGN KEY (`ReceivedByUserID`) REFERENCES `users` (`UserID`),
  ADD CONSTRAINT `FK_SQ_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers` (`SupplierID`);

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `FK_Suppliers_ApprovedBy` FOREIGN KEY (`ApprovedBy`) REFERENCES `users` (`UserID`);

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
