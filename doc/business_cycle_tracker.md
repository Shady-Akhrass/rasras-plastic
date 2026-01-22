# ERP Unified Task Tracker (Business Cycle Focused)

This tracker combines the technical development tasks with the business process cycles defined in the documentation.

## Legend
- **BE**: Backend API
- **Web**: Frontend Web
- **Mob**: Mobile App
- **[x]**: Completed
- **[/]**: In Progress
- **[ ]**: Outstanding

---

## Cycle 1: Procurement & Purchasing (دورة المشتريات)
*PR → RFQ → QCS → PO → Delivery → Quality → GRN → Invoice → Payment*

### Sprint 9: Purchase Requisitions (PR) & RFQs
- [/] **Purchase Requisitions (PR)**
    - [x] PR API (BE)
    - [x] PR Management UI (Web)
    - [ ] PR Management UI (Mob)
    - [x] PR Items UI (Web)
    - [ ] PR Items UI (Mob)
- [ ] **Request for Quotation (RFQ)**
    - [ ] RFQ Generation API (BE)
    - [ ] RFQ Management UI (Web)
    - [ ] RFQ Items UI (Web)
- [ ] **Supplier Quotations & Comparison (QCS)**
    - [ ] Supplier Quotations API (BE)
    - [ ] Quotation Comparison Sheet (QCS) Logic & UI (Web)

### Sprint 10: Purchase Orders (PO) & Receiving (GRN)
- [ ] **Purchase Orders (PO)**
    - [ ] PO Generation API (BE)
    - [ ] PO Approval Workflow (BE/Web)
    - [ ] PO Management UI (Web, Mob)
- [ ] **Goods Receipt (GRN)**
    - [ ] GRN (إذن استلام) API (BE)
    - [ ] GRN Management UI (Web, Mob)
    - [ ] Stock Update Logic on GRN (BE)

### Sprint 11: Supplier Invoices & Returns
- [ ] **Supplier Invoices**
    - [ ] Supplier Invoice API (BE)
    - [ ] Invoice Matching (PO/GRN/Invoice) Logic (BE)
    - [ ] Invoice Management UI (Web)
- [ ] **Purchase Returns & Debit Notes**
    - [ ] Purchase Returns API (BE)
    - [ ] Debit Notes Logic & UI (Web)

---

## Cycle 2: Sales & Collection (دورة المبيعات والتحصيل)
*Customer Request → Quotation → SO → Warehouse Release → Sales Invoice → Collection*

### Sprint 6: Sales Quotations & Orders
- [ ] **Sales Quotations**
    - [ ] Sales Quotations API (BE)
    - [ ] Product Pricing Logic (Price Lists) (BE/Web)
    - [ ] Quotation Management UI (Web, Mob)
- [ ] **Sales Orders (SO)**
    - [ ] Convert Quotation to SO (BE)
    - [ ] SO Management API (BE)
    - [ ] SO Management UI (Web, Mob)
    - [ ] Stock Availability Check (BE/Web/Mob)

### Sprint 7: Stock Issue & Invoicing
- [ ] **Stock Issue (Warehouse Release)**
    - [ ] Stock Issue Note (إذن صرف) API (BE)
    - [ ] Stock Release UI (Web, Mob)
    - [ ] Update Stock Balances (BE)
- [ ] **Sales Invoicing**
    - [ ] Sales Invoice API (BE)
    - [ ] Invoice PDF Generation (BE/Web)
    - [ ] Invoice Management UI (Web, Mob)

### Sprint 8: Sales Returns & Credit Notes
- [ ] **Sales Returns**
    - [ ] Sales Returns API (BE)
    - [ ] Sales Returns UI (Web, Mob)
- [ ] **Financial Adjustments**
    - [ ] Credit Notes API (BE)
    - [ ] Credit Note Allocation (Web)

---

## Cycle 3: Inventory & Warehouse Management (دورة المخازن)
*Acceptance → Storage → Update Balances → Monthly Count*

### Sprint 12: Stock Operations
- [ ] **Inventory Control**
    - [ ] Stock Balances API (BE)
    - [ ] Stock Balances / Stock Card UI (Web, Mob)
    - [ ] Stock Movements (Audit Trail) (BE/Web)
- [ ] **Internal Transfers**
    - [ ] Warehouse Transfers API (BE)
    - [ ] Transfer Items UI (Web, Mob)

### Sprint 13: Adjustments & Reports
- [ ] **Stock Adjustments**
    - [ ] Stock Adjustments API (BE)
    - [ ] Adjustment Management UI (Web, Mob)
- [ ] **Inventory Counting**
    - [ ] Physical Inventory Count API (BE)
    - [ ] Inventory Counting UI (Web, Mob)
    - [ ] Discrepancy Reports (BE/Web)

---

## Cycle 4: Quality Control (دورة الجودة)
*Sampling → Inspections → Approval/Rejection*

### Sprint 20: Quality Inspections
- [ ] **Inspection Process**
    - [ ] Quality Inspections API (BE)
    - [ ] Inspection Results UI (Web, Mob)
    - [ ] Quality Specs (Specs vs Results) UI (Web)
- [ ] **Logistics Integration**
    - [ ] QC on GRN Integration (Blocking stock until QC) (BE)
    - [ ] Certificate of Analysis (COA) API/UI (Web)

---

## Cycle 5: Finance & Payments (دورة المالية والمدفوعات)
*Matching → Approval → Payment/Receipt → Journal Entry*

### Sprint 14 & 15: General Ledger & Cash/Bank
- [ ] **General Ledger**
    - [ ] Chart of Accounts (COA) (BE/Web)
    - [ ] Journal Entries & Posting Logic (BE/Web)
- [ ] **Treasury (Cash & Bank)**
    - [ ] Payment Vouchers (Supplier Payment) (BE/Web/Mob)
    - [ ] Receipt Vouchers (Customer Collection) (BE/Web/Mob)
    - [ ] Bank Reconciliation (BE/Web)

### Sprint 16: Cheques Management
- [ ] **Cheque Tracking**
    - [ ] Issued Cheques Management (Web)
    - [ ] Received Cheques Management (Web)
    - [ ] Cheque Endorsement & Collection (Web)

---

## Cycle 6: HR & Payroll (دورة الموارد البشرية والرواتب)
*Profiles → Attendance → Leave → Payroll Processing*

### Sprint 18 & 19: HR & Payroll
- [ ] **HR Management**
    - [ ] Employee Profiles & Assets (BE/Web/Mob)
    - [ ] Attendance Tracking (BE/Mob)
    - [ ] Leave Requests & Approvals (BE/Web/Mob)
- [ ] **Payroll**
    - [ ] Payroll Generation Engine (BE)
    - [ ] Salary Components & Structures (Web)
    - [ ] Payslip Generation & View (Web/Mob)

---

## Cross-Cycle Foundation (Completed & Ongoing)
*Completed foundational tasks required for all cycles*

### Sprint 1-3: Foundation & Master Data
- [x] JWT Auth & RBAC (BE/Web/Mob)
- [x] Company Info & Settings (BE/Web/Mob)
- [x] Departments & Employees Base (BE/Web/Mob)
- [x] Items Master & Units (BE/Web/Mob)
- [x] Warehouses & Locations (BE/Web/Mob)

### Sprint 4-5: CRM & Supplier Master
- [/] **Customer Master**
    - [/] Customers API & UI (BE/Web)
    - [ ] Customer Contacts (BE/Web)
    - [ ] Customer Approval Workflow (BE/Web)
- [ ] **Supplier Master**
    - [ ] Suppliers API & UI (BE/Web)
    - [ ] Supplier-Item Linking (BE/Web)

---

## Technical & Deployment Phase
*Reporting, Workflows, and Final Release*

### Sprint 22-26: Advanced Features
- [ ] **Global Workflows**
    - [ ] Generic Approval Workflow Engine (used in PO, SO, Customer, etc.)
- [ ] **System Intelligence**
    - [ ] Notifications & Push Alerts
    - [ ] Executive Dashboards & KPI Tracking
- [ ] **Integration**
    - [ ] Document Sequencing & Relations
    - [ ] E-Invoice Integration (KSA/Local)

### Sprint 27-28: Quality Assurance & Go-Live
- [ ] Integration Testing
- [ ] Data Migration Scripts
- [ ] Server Deployment & CI/CD
