# Sales Approval System Implementation - Progress Report

## ✅ Completed Backend Changes

### 1. Entity Updates
- ✅ Added `approvalStatus` field to all sales entities:
  - SalesOrder
  - SalesQuotation
  - SalesInvoice
  - DeliveryOrder
  - StockIssueNote
  - PaymentReceipt

### 2. DTO Updates
- ✅ Added `approvalStatus` field to all sales DTOs

### 3. Service Updates
- ✅ Added `submitForApproval()` methods to all sales services
- ✅ Updated edit/delete restrictions:
  - Only Draft, Pending, or Rejected status can be edited/deleted
  - Rejected documents can be edited and resubmitted
- ✅ Updated mapping methods to include `approvalStatus`

### 4. ApprovalService Integration
- ✅ Added sales repositories to ApprovalService
- ✅ Added handling for all sales document types in `updateLinkedDocumentStatus()`:
  - SalesOrder
  - SalesQuotation
  - SalesInvoice
  - DeliveryOrder
  - StockIssueNote
  - PaymentReceipt

### 5. Controller Updates
- ✅ Added `POST /{id}/submit` endpoints to all sales controllers:
  - SalesOrderController
  - SalesQuotationController
  - SalesInvoiceController
  - DeliveryOrderController
  - StockIssueNoteController
  - PaymentReceiptController

### 6. Database Migration
- ✅ Created `sales_approval_workflows.sql` with:
  - Approval workflow definitions for all sales documents
  - Approval workflow steps
  - ALTER TABLE statements to add ApprovalStatus columns

## ✅ Completed Frontend Changes

### 1. Service Updates
- ✅ Added `submitForApproval()` methods to all sales services:
  - saleOrderService
  - salesQuotationService
  - salesInvoiceService
  - deliveryOrderService
  - receiptService
  - stockIssueNoteService
- ✅ Added `approvalStatus` field to all DTOs

### 2. Form Page Updates
- ✅ Updated SaleOrderFormPage:
  - Added approval status badge display
  - Added submit for approval button
  - Added approval action buttons (when viewing from approvals inbox)
  - Updated isReadOnly logic (allows editing Draft/Rejected)
  - Added necessary imports (Send, CheckCircle2, XCircle, Clock, RefreshCw, Eye)

## 🔄 Remaining Frontend Tasks

### 1. Form Pages (Need Updates)
Update the following form pages to match SaleOrderFormPage pattern:

#### QuotationFormPage.tsx
- [ ] Add approval status badge display
- [ ] Add submit for approval button
- [ ] Add approval action buttons
- [ ] Update isReadOnly logic
- [ ] Import approvalService

#### SalesInvoiceFormPage.tsx
- [ ] Add approval status badge display
- [ ] Add submit for approval button
- [ ] Add approval action buttons
- [ ] Update isReadOnly logic
- [ ] Import approvalService

#### DeliveryOrderFormPage.tsx
- [ ] Add approval status badge display
- [ ] Add submit for approval button
- [ ] Add approval action buttons
- [ ] Update isReadOnly logic
- [ ] Import approvalService

#### StockIssueNoteFormPage.tsx
- [ ] Add approval status badge display
- [ ] Add submit for approval button
- [ ] Add approval action buttons
- [ ] Update isReadOnly logic
- [ ] Import approvalService

#### ReceiptFormPage.tsx
- [ ] Add approval status badge display
- [ ] Add submit for approval button
- [ ] Add approval action buttons
- [ ] Update isReadOnly logic
- [ ] Import approvalService

### 2. List Pages (Need Updates)
Update all sales list pages to:
- [ ] Show approval status column/badge
- [ ] Restrict edit/delete buttons based on status
- [ ] Add "Submit for Approval" action button for Draft/Rejected items

#### Pages to Update:
- [ ] SaleOrderListPage.tsx
- [ ] QuotationListPage.tsx
- [ ] SalesInvoiceListPage.tsx
- [ ] DeliveryOrderListPage.tsx
- [ ] StockIssueNoteListPage.tsx
- [ ] ReceiptListPage.tsx

### 3. Pattern to Follow

#### For Form Pages:
```typescript
// 1. Add imports
import { approvalService } from '../../services/approvalService';
import { Send, CheckCircle2, XCircle, Clock, RefreshCw, Eye } from 'lucide-react';

// 2. Add state
const [processing, setProcessing] = useState(false);
const approvalId = searchParams.get('approvalId');

// 3. Update isReadOnly logic
const isReadOnly = isView || (isEdit && form.status !== 'Draft' && form.status !== 'Rejected');

// 4. Add submitForApproval handler
const handleSubmitForApproval = async () => {
    if (!id || isNew) {
        toast.error('يجب حفظ المستند أولاً قبل الإرسال للاعتماد');
        return;
    }
    if (form.status !== 'Draft' && form.status !== 'Rejected') {
        toast.error('يمكن إرسال المسودات أو المرفوضة فقط للاعتماد');
        return;
    }
    try {
        setProcessing(true);
        const updated = await [service].submitForApproval(parseInt(id));
        if (updated) {
            setForm(updated);
            toast.success('تم إرسال المستند للاعتماد بنجاح');
            navigate('/dashboard/sales/[list-page]');
        }
    } catch (err: any) {
        toast.error(err?.response?.data?.message || 'فشل إرسال المستند للاعتماد');
    } finally {
        setProcessing(false);
    }
};

// 5. Add approval action handler
const handleApprovalAction = async (action: 'Approved' | 'Rejected') => {
    if (!approvalId) return;
    try {
        setProcessing(true);
        const toastId = toast.loading('جاري تنفيذ الإجراء...');
        await approvalService.takeAction(parseInt(approvalId), 1, action);
        toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب', { id: toastId });
        navigate('/dashboard/sales/approvals');
    } catch {
        toast.error('فشل تنفيذ الإجراء');
    } finally {
        setProcessing(false);
    }
};

// 6. Add approval status badge in header
{form.approvalStatus && (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
        form.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-white border-emerald-300/30' :
        form.approvalStatus === 'Rejected' ? 'bg-rose-500/20 text-white border-rose-300/30' :
        form.approvalStatus === 'Pending' ? 'bg-amber-500/20 text-white border-amber-300/30' :
        'bg-slate-500/20 text-white border-slate-300/30'
    }`}>
        {form.approvalStatus === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
        {form.approvalStatus === 'Rejected' && <XCircle className="w-3 h-3" />}
        {form.approvalStatus === 'Pending' && <Clock className="w-3 h-3" />}
        {form.approvalStatus === 'Approved' ? 'معتمد' : form.approvalStatus === 'Rejected' ? 'مرفوض' : form.approvalStatus === 'Pending' ? 'قيد الانتظار' : form.approvalStatus}
    </span>
)}

// 7. Add buttons in header
{isView && approvalId && (
    <>
        <button onClick={() => handleApprovalAction('Approved')} disabled={processing}>
            <CheckCircle2 /> اعتماد
        </button>
        <button onClick={() => handleApprovalAction('Rejected')} disabled={processing}>
            <XCircle /> رفض
        </button>
    </>
)}
{!isReadOnly && isEdit && (form.status === 'Draft' || form.status === 'Rejected') && (
    <button onClick={handleSubmitForApproval} disabled={processing}>
        <Send /> إرسال للاعتماد
    </button>
)}
```

#### For List Pages:
```typescript
// Add approval status column
<th>حالة الاعتماد</th>
<td>
    {item.approvalStatus && (
        <StatusBadge status={item.approvalStatus} />
    )}
</td>

// Restrict actions
{(item.status === 'Draft' || item.status === 'Rejected') && (
    <button onClick={() => onEdit(item.id)}>تعديل</button>
)}
{(item.status === 'Draft' || item.status === 'Pending' || item.status === 'Rejected') && (
    <button onClick={() => onDelete(item.id)}>حذف</button>
)}
{item.status === 'Draft' || item.status === 'Rejected' ? (
    <button onClick={() => onSubmit(item.id)}>إرسال للاعتماد</button>
) : null}
```

## 📋 Database Migration Steps

1. Run the SQL migration file:
   ```sql
   -- Execute: web/backend/migrations/sales_approval_workflows.sql
   ```

2. Verify workflows are created:
   ```sql
   SELECT * FROM approvalworkflows WHERE DocumentType LIKE 'Sales%' OR DocumentType LIKE 'Delivery%' OR DocumentType LIKE 'Stock%' OR DocumentType LIKE 'Payment%';
   ```

3. Verify steps are created:
   ```sql
   SELECT aws.* FROM approvalworkflowsteps aws
   JOIN approvalworkflows aw ON aws.WorkflowID = aw.WorkflowID
   WHERE aw.DocumentType LIKE 'Sales%' OR aw.DocumentType LIKE 'Delivery%' OR aw.DocumentType LIKE 'Stock%' OR aw.DocumentType LIKE 'Payment%';
   ```

## 🎯 Sales Cycle Workflow

The sales cycle follows this sequence:
1. **Quotation** (SalesQuotation) → Submit for Approval → Approved
2. **Sales Order** (SalesOrder) → Created from Approved Quotation → Submit for Approval → Approved
3. **Stock Issue Note** (StockIssueNote) → Created from Approved Sales Order → Submit for Approval → Approved
4. **Sales Invoice** (SalesInvoice) → Created from Approved Stock Issue Note → Submit for Approval → Approved
5. **Payment Receipt** (PaymentReceipt) → Created from Approved Sales Invoice → Submit for Approval → Approved

## 🔍 Testing Checklist

### Backend Testing
- [ ] Test submitForApproval for each document type
- [ ] Test approval workflow progression
- [ ] Test rejection and resubmission
- [ ] Test edit restrictions (only Draft/Rejected)
- [ ] Test delete restrictions (only Draft/Pending/Rejected)

### Frontend Testing
- [ ] Test submit for approval button functionality
- [ ] Test approval status display
- [ ] Test approval action buttons (from approvals inbox)
- [ ] Test form locking when not Draft/Rejected
- [ ] Test list page restrictions

## 📝 Notes

- All sales documents now follow the same approval pattern as procurement documents
- Approval workflows are configurable via database (approvalworkflows and approvalworkflowsteps tables)
- Rejected documents can be edited and resubmitted (status resets to Draft)
- Approval status is tracked separately from document status
