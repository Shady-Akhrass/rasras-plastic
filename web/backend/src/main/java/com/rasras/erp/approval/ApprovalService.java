package com.rasras.erp.approval;

import com.rasras.erp.inventory.GoodsReceiptNoteRepository;
import com.rasras.erp.inventory.GRNItem;
import com.rasras.erp.inventory.InventoryService;
import com.rasras.erp.procurement.PurchaseOrderRepository;
import com.rasras.erp.procurement.PurchaseRequisitionRepository;
import com.rasras.erp.supplier.SupplierRepository;
import com.rasras.erp.user.User;
import com.rasras.erp.user.UserRepository;
import com.rasras.erp.procurement.QuotationComparisonRepository;
import com.rasras.erp.procurement.SupplierQuotationRepository;
import com.rasras.erp.procurement.PurchaseOrder;
import com.rasras.erp.procurement.PurchaseOrderItem;
import com.rasras.erp.procurement.PurchaseReturnRepository;
import com.rasras.erp.procurement.SupplierQuotation;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.WarehouseRepository;
import com.rasras.erp.finance.PaymentVoucherRepository;
import com.rasras.erp.sales.SalesOrderRepository;
import com.rasras.erp.sales.SalesQuotationRepository;
import com.rasras.erp.sales.SalesInvoiceRepository;
import com.rasras.erp.sales.DeliveryOrderRepository;
import com.rasras.erp.sales.StockIssueNoteRepository;
import com.rasras.erp.sales.PaymentReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalWorkflowRepository workflowRepo;
    private final ApprovalWorkflowStepRepository stepRepo;
    private final ApprovalRequestRepository requestRepo;
    private final ApprovalActionRepository actionRepo;
    private final UserRepository userRepo;
    private final ApprovalLimitRepository limitRepo;

    private final PurchaseOrderRepository poRepo;
    private final SupplierRepository supplierRepo;
    private final PurchaseRequisitionRepository prRepo;
    private final GoodsReceiptNoteRepository grnRepo;
    private final com.rasras.erp.supplier.SupplierInvoiceService supplierInvoiceService;
    private final InventoryService inventoryService;
    private final QuotationComparisonRepository comparisonRepo;
    private final SupplierQuotationRepository quotationRepo;
    private final PurchaseReturnRepository returnRepo;
    private final ItemRepository itemRepo;
    private final UnitRepository unitRepo;
    private final WarehouseRepository warehouseRepo;
    private final PaymentVoucherRepository voucherRepo;
    private final SalesOrderRepository salesOrderRepo;
    private final SalesQuotationRepository salesQuotationRepo;
    private final SalesInvoiceRepository salesInvoiceRepo;
    private final DeliveryOrderRepository deliveryOrderRepo;
    private final StockIssueNoteRepository stockIssueNoteRepo;
    private final PaymentReceiptRepository paymentReceiptRepo;

    @Transactional
    public ApprovalRequest initiateApproval(String workflowCode, String docType, Integer docId,
            String docNumber, Integer requestedByUserId, BigDecimal amount) {

        ApprovalWorkflow workflow = workflowRepo.findByWorkflowCode(workflowCode)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowCode));

        User requester = userRepo.findById(requestedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found: " + requestedByUserId));

        List<ApprovalWorkflowStep> steps = stepRepo
                .findByWorkflowWorkflowIdOrderByStepNumberAsc(workflow.getWorkflowId());
        if (steps.isEmpty()) {
            throw new RuntimeException("No steps defined for workflow: " + workflowCode);
        }

        // Check if there's already a pending request
        requestRepo.findByDocumentTypeAndDocumentIdAndStatus(docType, docId, "Pending")
                .ifPresent(r -> {
                    throw new RuntimeException("A pending approval request already exists for this document.");
                });

        ApprovalRequest request = ApprovalRequest.builder()
                .workflow(workflow)
                .documentType(docType)
                .documentId(docId)
                .documentNumber(docNumber)
                .requestedByUser(requester)
                .totalAmount(amount)
                .status("Pending")
                .currentStep(resolveInitialStep(workflowCode, steps, amount)) // الخطوة الأولى وفق حدود الاعتماد
                .build();

        return requestRepo.save(request);
    }

    /**
     * يحدد أول خطوة اعتماد بناءً على حدود الموافقة (ApprovalLimit) والمبلغ الكلي.
     * إذا لم توجد حدود أو لم تنطبق أي منها، يتم استخدام أول خطوة في سير العمل
     * كافتراض.
     */
    private ApprovalWorkflowStep resolveInitialStep(String workflowCode, List<ApprovalWorkflowStep> steps,
            BigDecimal amount) {
        if (amount == null) {
            return steps.get(0);
        }

        // نستخدم workflowCode كنشاط (ActivityType) في حدود الموافقة (مثل PO_APPROVAL)
        List<ApprovalLimit> limits = limitRepo.findByActivityTypeAndIsActiveTrue(workflowCode);
        if (limits == null || limits.isEmpty()) {
            return steps.get(0);
        }

        for (ApprovalWorkflowStep step : steps) {
            if (step.getApproverRole() == null) {
                continue;
            }
            Integer roleId = step.getApproverRole().getRoleId();
            boolean matches = limits.stream().anyMatch(limit -> {
                if (limit.getRole() == null || !roleId.equals(limit.getRole().getRoleId())) {
                    return false;
                }
                BigDecimal min = limit.getMinAmount() != null ? limit.getMinAmount() : BigDecimal.ZERO;
                BigDecimal max = limit.getMaxAmount();
                boolean gteMin = amount.compareTo(min) >= 0;
                boolean lteMax = (max == null) || amount.compareTo(max) <= 0;
                return gteMin && lteMax;
            });
            if (matches) {
                return step;
            }
        }

        // إذا لم تنطبق أي حدود على أي خطوة، نعود لأول خطوة كافتراض
        return steps.get(0);
    }

    @Transactional(readOnly = true)
    public List<ApprovalRequestDto> getPendingRequestsForUser(Integer userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ApprovalRequest> requests = requestRepo.findByStatusIn(List.of("Pending", "InProgress"));

        // Filter requests
        List<ApprovalRequest> filteredRequests;
        if ("ADMIN".equalsIgnoreCase(user.getRole().getRoleCode())) {
            filteredRequests = requests;
        } else {
            filteredRequests = requests.stream()
                    .filter(req -> {
                        ApprovalWorkflowStep step = req.getCurrentStep();
                        if (step == null)
                            return false;
                        if ("ROLE".equals(step.getApproverType())) {
                            return user.getRole().getRoleId().equals(step.getApproverRole().getRoleId());
                        } else {
                            return user.getUserId().equals(step.getApproverUser().getUserId());
                        }
                    })
                    .collect(Collectors.toList());
        }

        // Map to DTOs
        return filteredRequests.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /** سجل الاعتمادات — آخر الإجراءات (من اعتمد ومتى) للشفافية والتدقيق */
    @Transactional(readOnly = true)
    public List<ApprovalAuditDto> getRecentApprovalActions(int limit) {
        return actionRepo.findAllByOrderByActionDateDesc(PageRequest.of(0, Math.min(limit, 200)))
                .stream()
                .map(this::mapActionToAuditDto)
                .collect(Collectors.toList());
    }

    private ApprovalAuditDto mapActionToAuditDto(ApprovalAction action) {
        ApprovalRequest req = action.getRequest();
        return ApprovalAuditDto.builder()
                .actionId(action.getId())
                .requestId(req.getId())
                .documentType(req.getDocumentType())
                .documentId(req.getDocumentId())
                .documentNumber(req.getDocumentNumber())
                .workflowName(req.getWorkflow().getWorkflowName())
                .stepName(action.getStep().getStepName())
                .actionType(action.getActionType())
                .actionByUser(action.getActionByUser().getUsername())
                .actionDate(action.getActionDate())
                .comments(action.getComments())
                .totalAmount(req.getTotalAmount())
                .requestStatus(req.getStatus())
                .build();
    }

    private ApprovalRequestDto mapToDto(ApprovalRequest req) {
        BigDecimal amountToUse = req.getTotalAmount();
        // Enrich total for QuotationComparison when stored as zero (e.g. legacy or fix display)
        if ("QuotationComparison".equals(req.getDocumentType())
                && (amountToUse == null || amountToUse.compareTo(BigDecimal.ZERO) == 0)) {
            amountToUse = comparisonRepo.findById(req.getDocumentId())
                    .map(qc -> qc.getSelectedQuotation() != null ? qc.getSelectedQuotation().getTotalAmount() : null)
                    .filter(java.util.Objects::nonNull)
                    .orElse(amountToUse);
        }
        if (amountToUse == null) {
            amountToUse = BigDecimal.ZERO;
        }
        final BigDecimal finalAmount = amountToUse;
        return ApprovalRequestDto.builder()
                .id(req.getId())
                .workflowName(req.getWorkflow().getWorkflowName())
                .documentType(req.getDocumentType())
                .documentId(req.getDocumentId())
                .documentNumber(req.getDocumentNumber())
                .requestedByName(req.getRequestedByUser().getUsername())
                .totalAmount(finalAmount)
                .status(req.getStatus())
                .currentStepName(req.getCurrentStep() != null ? req.getCurrentStep().getStepName() : "")
                .requestedDate(req.getRequestedDate())
                .completedDate(req.getCompletedDate())
                .priority("Normal")
                .build();
    }

    @Transactional
    public void processAction(Integer requestId, Integer actionByUserId, String actionType, String comments,
            Integer warehouseId) {
        ApprovalRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User actor = userRepo.findById(actionByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // عند اعتماد إذن الإضافة: تحديث المخزن المختار قبل تطبيق الاعتماد
        if ("GoodsReceiptNote".equalsIgnoreCase(request.getDocumentType()) && "Approved".equalsIgnoreCase(actionType)
                && warehouseId != null) {
            grnRepo.findById(request.getDocumentId()).ifPresent(grn -> {
                // ⚠️ CRITICAL: GRN must be inspected by Quality before approval
                if (!"Inspected".equals(grn.getStatus()) && !"Approved".equals(grn.getStatus())
                        && !"Pending Approval".equals(grn.getStatus())) {
                    throw new RuntimeException(
                            "لا يمكن اعتماد إذن الإضافة قبل فحص الجودة. الرجاء إرسال الفحص للاعتماد من صفحة فحص الجودة أولاً.");
                }
                grn.setWarehouseId(warehouseId);
                grnRepo.save(grn);
            });
        }

        // 1. Log the action
        ApprovalAction action = ApprovalAction.builder()
                .request(request)
                .step(request.getCurrentStep())
                .actionByUser(actor)
                .actionType(actionType)
                .comments(comments)
                .build();
        actionRepo.save(action);

        // 2. Update request state
        if ("Approved".equalsIgnoreCase(actionType)) {
            handleIntermediateDocumentStatus(request, actionByUserId);
            moveToNextStep(request, actionByUserId);
        } else if ("Rejected".equalsIgnoreCase(actionType)) {
            // ✅ Strategy B: إغلاق الطلب نهائياً (لا إعادة استخدام)
            request.setStatus("Rejected"); // يمكن استخدام "Cancelled" إذا كان متوفراً في enum
            request.setCompletedDate(LocalDateTime.now());
            request.setCurrentStep(null); // ✅ تصفير CurrentStep (يُكتب NULL في CurrentStepID)

            // تحديث الوثيقة المرتبطة (سيعيدها إلى Draft)
            updateLinkedDocumentStatus(request, "Rejected", actionByUserId);

            // ✅ ملاحظة: CurrentStep يصبح null وهذا طبيعي لأن الطلب مُغلق
            // Audit Trail محفوظ في approvalactions - CurrentStep مجرد مؤشر تشغيلي
            // عند إعادة الإرسال، submitForApproval() سينشئ approvalrequest جديد تماماً
        }

        requestRepo.save(request);
    }

    @Transactional
    public void syncAction(String docType, Integer docId, String actionType, Integer userId) {
        requestRepo.findByDocumentTypeAndDocumentIdAndStatus(docType, docId, "InProgress")
                .ifPresent(request -> {
                    // Similar logic to processAction but for sync
                    if ("Approved".equalsIgnoreCase(actionType)) {
                        handleIntermediateDocumentStatus(request, userId);
                        moveToNextStep(request, userId);
                    } else if ("Rejected".equalsIgnoreCase(actionType)) {
                        // ✅ Strategy B: إغلاق الطلب نهائياً
                        request.setStatus("Rejected");
                        request.setCompletedDate(LocalDateTime.now());
                        request.setCurrentStep(null); // ✅ تصفير CurrentStep
                        updateLinkedDocumentStatus(request, "Rejected", userId);
                    }
                    requestRepo.save(request);
                });

        // Also check "Pending" status
        requestRepo.findByDocumentTypeAndDocumentIdAndStatus(docType, docId, "Pending")
                .ifPresent(request -> {
                    if ("Approved".equalsIgnoreCase(actionType)) {
                        handleIntermediateDocumentStatus(request, userId);
                        moveToNextStep(request, userId);
                    } else if ("Rejected".equalsIgnoreCase(actionType)) {
                        // ✅ Strategy B: إغلاق الطلب نهائياً
                        request.setStatus("Rejected");
                        request.setCompletedDate(LocalDateTime.now());
                        request.setCurrentStep(null);  // ✅ تصفير CurrentStep
                        updateLinkedDocumentStatus(request, "Rejected", userId);
                    }
                    requestRepo.save(request);
                });
    }

    private void handleIntermediateDocumentStatus(ApprovalRequest request, Integer userId) {
        String type = request.getDocumentType();
        Integer id = request.getDocumentId();
        User actor = userRepo.findById(userId).orElse(null);
        String actorName = actor != null ? actor.getUsername() : "System";

        if ("PaymentVoucher".equalsIgnoreCase(type) || "PV".equalsIgnoreCase(type)) {
            voucherRepo.findById(id).ifPresent(pv -> {
                ApprovalWorkflowStep currentStep = request.getCurrentStep();
                if (currentStep != null) {
                    if (currentStep.getStepNumber() == 1) {
                        pv.setApprovalStatus("FinanceApproved");
                        pv.setApprovedByFinanceManager(actorName);
                        pv.setFinanceManagerApprovalDate(LocalDate.now());
                    } else if (currentStep.getStepNumber() == 2) {
                        pv.setApprovalStatus("GMApproved");
                        pv.setApprovedByGeneralManager(actorName);
                        pv.setGeneralManagerApprovalDate(LocalDate.now());
                    }
                }
                voucherRepo.save(pv);
            });
        }
    }

    private void moveToNextStep(ApprovalRequest request, Integer userId) {
        if (request.getWorkflow() == null) {
            return;
        }
        List<ApprovalWorkflowStep> steps = stepRepo
                .findByWorkflowWorkflowIdOrderByStepNumberAsc(request.getWorkflow().getWorkflowId());

        int currentIdx = -1;
        ApprovalWorkflowStep currentStep = request.getCurrentStep();
        if (currentStep != null) {
            for (int i = 0; i < steps.size(); i++) {
                if (steps.get(i).getStepId().equals(currentStep.getStepId())) {
                    currentIdx = i;
                    break;
                }
            }
        }

        BigDecimal amount = request.getTotalAmount();
        List<ApprovalLimit> limits = null;
        if (amount != null) {
            limits = limitRepo.findByActivityTypeAndIsActiveTrue(request.getWorkflow().getWorkflowCode());
        }

        // ابحث عن أول خطوة تالية تنطبق عليها حدود الموافقة للمبلغ الحالي
        if (currentIdx != -1) {
            for (int i = currentIdx + 1; i < steps.size(); i++) {
                ApprovalWorkflowStep candidate = steps.get(i);
                if (amount != null && limits != null && !limits.isEmpty() && candidate.getApproverRole() != null) {
                    Integer roleId = candidate.getApproverRole().getRoleId();
                    boolean matches = limits.stream().anyMatch(limit -> {
                        if (limit.getRole() == null || !roleId.equals(limit.getRole().getRoleId())) {
                            return false;
                        }
                        BigDecimal min = limit.getMinAmount() != null ? limit.getMinAmount() : BigDecimal.ZERO;
                        BigDecimal max = limit.getMaxAmount();
                        boolean gteMin = amount.compareTo(min) >= 0;
                        boolean lteMax = (max == null) || amount.compareTo(max) <= 0;
                        return gteMin && lteMax;
                    });
                    if (!matches) {
                        // هذه الخطوة ليست ضمن حدود المبلغ — يتم تجاوزها
                        continue;
                    }
                }

                // وجدنا خطوة مناسبة تالية
                request.setCurrentStep(candidate);
                request.setStatus("InProgress");
                return;
            }
        }

        // لا مزيد من الخطوات المطلوبة، الطلب معتمد بالكامل
        request.setStatus("Approved");
        request.setCompletedDate(LocalDateTime.now());
        updateLinkedDocumentStatus(request, "Approved", userId);
    }

    private void updateLinkedDocumentStatus(ApprovalRequest request, String status, Integer userId) {
        String type = request.getDocumentType();
        Integer id = request.getDocumentId();

        if ("PurchaseOrder".equalsIgnoreCase(type)) {
            poRepo.findById(id).ifPresent(po -> {
                po.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    po.setStatus("Confirmed");
                    // Auto GRN creation disabled to avoid unexpected failures on PO approval.
                    // GRN will be created explicitly from the receiving workflow instead.
                    // createGRNFromPO(po, userId);
                }
                poRepo.save(po);
            });
        } else if ("Supplier".equalsIgnoreCase(type)) {
            supplierRepo.findById(id).ifPresent(s -> {
                s.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    s.setIsApproved(true);
                    s.setStatus(com.rasras.erp.supplier.SupplierStatus.APPROVED);
                } else {
                    s.setStatus(com.rasras.erp.supplier.SupplierStatus.REJECTED);
                }
                supplierRepo.save(s);
            });
        } else if ("PurchaseRequisition".equalsIgnoreCase(type)) {
            prRepo.findById(id).ifPresent(pr -> {
                pr.setStatus(status);
                if ("Approved".equals(status)) {
                    pr.setApprovedDate(LocalDateTime.now());
                }
                prRepo.save(pr);
            });
        } else if ("GoodsReceiptNote".equalsIgnoreCase(type)) {
            grnRepo.findByIdWithItems(id).ifPresent(grn -> {
                grn.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    grn.setStatus("Approved");

                    // تحديث أرصدة المخزون تلقائياً عند الاعتماد (أولاً لضمان ظهور الأصناف)
                    if (grn.getItems() != null && grn.getWarehouseId() != null) {
                        for (GRNItem item : grn.getItems()) {
                            BigDecimal qtyToRecord = item.getAcceptedQty() != null ? item.getAcceptedQty()
                                    : item.getReceivedQty();
                            if (qtyToRecord != null && qtyToRecord.compareTo(BigDecimal.ZERO) > 0) {
                                inventoryService.updateStock(
                                        item.getItem().getId(),
                                        grn.getWarehouseId(),
                                        qtyToRecord,
                                        "IN",
                                        "GRN",
                                        "GoodsReceiptNote",
                                        grn.getId(),
                                        grn.getGrnNumber(),
                                        item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO,
                                        userId);
                            }
                        }
                        grn.setStatus("Completed");
                        grn.setUpdatedBy(userId);
                        grn.setUpdatedAt(LocalDateTime.now());
                    }

                    try {
                        supplierInvoiceService.createInvoiceFromGRN(grn.getId());
                    } catch (Exception e) {
                        // فاتورة المورد قد تفشل لكن المخزون تم تحديثه
                    }
                }
                grnRepo.save(grn);
            });
        } else if ("QuotationComparison".equalsIgnoreCase(type) || "QC".equalsIgnoreCase(type)) {
            comparisonRepo.findById(id).ifPresent(qc -> {
                qc.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    qc.setStatus("Approved");
                    
                    // ✅ Idempotent PO Creation: إنشاء PO مرة واحدة فقط
                    if (qc.getSelectedQuotation() != null) {
                        boolean poExists = poRepo.findByQuotationId(qc.getSelectedQuotation().getId()).isPresent();
                        
                        if (!poExists) {
                            // NEW: Automatically create PO and initiate its approval
                            createPOFromComparison(qc, userId);
                        } else {
                            System.out.println("PO already exists for quotation " + 
                                qc.getSelectedQuotation().getId() + " - skipping creation");
                        }
                    }
                } else if ("Rejected".equals(status)) {
                    // ✅ إعادة المقارنة إلى Draft للسماح بالتعديل وإعادة الإرسال
                    qc.setStatus("Draft");
                    qc.setApprovalStatus("Rejected"); // تتبع آخر محاولة رفض
                    
                    // ✅ تتبع عدد مرات الرفض
                    Integer rejectionCount = qc.getRejectionCount() != null ? qc.getRejectionCount() : 0;
                    qc.setRejectionCount(rejectionCount + 1);
                    qc.setLastRejectionDate(LocalDateTime.now());
                    
                    // ✅ ملاحظة: approvalrequest يبقى Rejected/Cancelled في قاعدة البيانات كسجل تاريخي
                    // CurrentStep يصبح null تلقائياً (من ApprovalService) - هذا طبيعي للطلبات المُغلقة
                }
                comparisonRepo.save(qc);
            });
        } else if ("PurchaseReturn".equalsIgnoreCase(type)) {
            returnRepo.findById(id).ifPresent(ret -> {
                ret.setStatus(status);
                if ("Approved".equals(status)) {
                    ret.setApprovedByUserId(userId);
                    ret.setApprovedDate(LocalDateTime.now());

                    // Logic from PurchaseReturnService.processApprovalEffects
                    // 1. Update Stock (Decrement) - ONLY if items were originally accepted into
                    // stock
                    // If return is for items rejected during inspection, they were never in stock
                    // (AcceptedQty only was added)
                    boolean isRejectionReturn = ret.getReturnReason() != null &&
                            ret.getReturnReason().contains("Rejected during Quality Inspection");

                    if (!isRejectionReturn) {
                        for (com.rasras.erp.procurement.PurchaseReturnItem item : ret.getItems()) {
                            inventoryService.updateStock(
                                    item.getItem().getId(),
                                    ret.getWarehouse().getId(),
                                    item.getReturnedQty(),
                                    "OUT",
                                    "RETURN",
                                    "PurchaseReturn",
                                    ret.getId(),
                                    ret.getReturnNumber(),
                                    item.getUnitPrice(),
                                    userId);
                        }
                    }

                    // 2. Update Supplier Balance (Decrease) & Total Returned (Increase)
                    com.rasras.erp.supplier.Supplier supplier = ret.getSupplier();
                    BigDecimal currentBalance = supplier.getCurrentBalance() != null ? supplier.getCurrentBalance()
                            : BigDecimal.ZERO;
                    BigDecimal currentReturned = supplier.getTotalReturned() != null ? supplier.getTotalReturned()
                            : BigDecimal.ZERO;

                    supplier.setCurrentBalance(currentBalance.subtract(ret.getTotalAmount()));
                    supplier.setTotalReturned(currentReturned.add(ret.getTotalAmount()));
                    supplierRepo.save(supplier);

                    // 3. Update GRN status if reference exists
                    if (ret.getGrnId() != null) {
                        grnRepo.findById(ret.getGrnId()).ifPresent(grn -> {
                            grn.setStatus("Returned");
                            grnRepo.save(grn);
                        });
                    }
                }
                returnRepo.save(ret);
            });
        } else if ("PaymentVoucher".equalsIgnoreCase(type) || "PV".equalsIgnoreCase(type)) {
            voucherRepo.findById(id).ifPresent(pv -> {
                pv.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    // Final Step (Disbursement) is approved.
                    // This is equivalent to confirming payment.
                    User actor = userRepo.findById(userId).orElse(null);
                    String actorName = actor != null ? actor.getUsername() : "System";

                    // Trigger disbursement effects
                    supplierInvoiceService.recordPayment(
                            pv.getSupplierInvoice().getId(),
                            pv.getPaymentAmount(),
                            actorName);

                    pv.setStatus("Paid");
                    pv.setPaidBy(actorName);
                    pv.setPaidDate(LocalDate.now());
                } else if ("Rejected".equals(status)) {
                    pv.setStatus("Rejected");
                }
                voucherRepo.save(pv);
            });
        } else if ("SalesOrder".equalsIgnoreCase(type)) {
            salesOrderRepo.findById(id).ifPresent(so -> {
                so.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    so.setStatus("Approved");
                    so.setApprovedByUserId(userId);
                    so.setApprovedDate(LocalDateTime.now());
                } else if ("Rejected".equals(status)) {
                    so.setStatus("Rejected");
                }
                salesOrderRepo.save(so);
            });
        } else if ("SalesQuotation".equalsIgnoreCase(type)) {
            salesQuotationRepo.findById(id).ifPresent(sq -> {
                sq.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    sq.setStatus("Approved");
                } else if ("Rejected".equals(status)) {
                    sq.setStatus("Rejected");
                }
                salesQuotationRepo.save(sq);
            });
        } else if ("SalesInvoice".equalsIgnoreCase(type)) {
            salesInvoiceRepo.findById(id).ifPresent(inv -> {
                inv.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    inv.setStatus("Approved");
                } else if ("Rejected".equals(status)) {
                    inv.setStatus("Rejected");
                }
                salesInvoiceRepo.save(inv);
            });
        } else if ("PaymentReceipt".equalsIgnoreCase(type)) {
            paymentReceiptRepo.findById(id).ifPresent(pr -> {
                pr.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    pr.setStatus("Approved");
                } else if ("Rejected".equals(status)) {
                    pr.setStatus("Rejected");
                }
                paymentReceiptRepo.save(pr);
            });
        }
    }

    private void createGRNFromPO(PurchaseOrder po, Integer userId) {
        // Create GRN with status "Pending Inspection"
        com.rasras.erp.inventory.GoodsReceiptNote grn = new com.rasras.erp.inventory.GoodsReceiptNote();
        grn.setGrnNumber("GRN-" + System.currentTimeMillis()); // simplified generation
        grn.setGrnDate(LocalDateTime.now());
        grn.setPurchaseOrder(po);
        grn.setSupplier(po.getSupplier());
        grn.setStatus("Pending Inspection");
        grn.setApprovalStatus("Pending");
        grn.setCreatedBy(userId);
        grn.setReceivedByUserId(userId);

        // Fetch first available warehouse from database
        // TODO: Implement proper warehouse selection logic (e.g., from PO or system
        // config)
        Integer warehouseId = warehouseRepo.findByIsActiveTrue().stream()
                .findFirst()
                .map(com.rasras.erp.inventory.Warehouse::getId)
                .orElseThrow(() -> new RuntimeException(
                        "Cannot create GRN: No active warehouses available in the system. Please create a warehouse first."));
        grn.setWarehouseId(warehouseId);

        if (po.getItems() != null) {
            List<GRNItem> grnItems = po.getItems().stream().map(poItem -> {
                GRNItem item = new GRNItem();
                item.setGrn(grn);
                item.setPoItemId(poItem.getId());
                item.setItem(poItem.getItem());
                item.setUnit(poItem.getUnit());
                item.setOrderedQty(poItem.getOrderedQty());
                item.setReceivedQty(poItem.getOrderedQty()); // Default to ordered
                item.setAcceptedQty(poItem.getOrderedQty()); // Default Accepted to Received until inspected
                item.setRejectedQty(java.math.BigDecimal.ZERO);
                item.setUnitCost(poItem.getUnitPrice());
                return item;
            }).collect(Collectors.toList());
            grn.setItems(grnItems);
        }

        grnRepo.save(grn);
    }

    private void createPOFromComparison(com.rasras.erp.procurement.QuotationComparison qc, Integer userId) {
        if (qc.getSelectedQuotation() == null) {
            System.err.println(
                    "Cannot create PO from Comparison " + qc.getComparisonNumber() + ": No quotation selected.");
            return;
        }

        SupplierQuotation quoted = qc.getSelectedQuotation();
        if (quoted.getSupplier() == null) {
            throw new RuntimeException("Cannot create PO: Selected quotation has no supplier.");
        }

        BigDecimal deliveryCost = quoted.getDeliveryCost() != null ? quoted.getDeliveryCost() : BigDecimal.ZERO;
        BigDecimal otherCosts = quoted.getOtherCosts() != null ? quoted.getOtherCosts() : BigDecimal.ZERO;
        BigDecimal grandTotal = quoted.getTotalAmount() != null ? quoted.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal subTotal = grandTotal.subtract(deliveryCost).subtract(otherCosts);

        // 1. Create the PO record
        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(generatePONumber())
                .poDate(LocalDateTime.now())
                .prId(qc.getPurchaseRequisition() != null ? qc.getPurchaseRequisition().getId() : null)
                .quotationId(quoted.getId())
                .supplier(quoted.getSupplier())
                .expectedDeliveryDate(
                        LocalDate.now().plusDays(quoted.getDeliveryDays() != null ? quoted.getDeliveryDays() : 7))
                .currency(quoted.getCurrency())
                .exchangeRate(quoted.getExchangeRate())
                .shippingCost(deliveryCost)
                .otherCosts(otherCosts)
                .subTotal(subTotal)
                .totalAmount(grandTotal)
                .status("Pending")
                .approvalStatus("Pending")
                .notes("Auto-generated from Approved Comparison: " + qc.getComparisonNumber())
                .build();

        // 2. Map items
        if (quoted.getItems() != null) {
            po.setItems(quoted.getItems().stream().map(qi -> {
                return PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .item(qi.getItem())
                        .unit(qi.getUnit())
                        .orderedQty(qi.getOfferedQty())
                        .unitPrice(qi.getUnitPrice())
                        .discountPercentage(qi.getDiscountPercentage())
                        .discountAmount(qi.getDiscountAmount())
                        .taxPercentage(qi.getTaxPercentage())
                        .taxAmount(qi.getTaxAmount())
                        .totalPrice(qi.getTotalPrice())
                        .receivedQty(BigDecimal.ZERO)
                        .status("Pending")
                        .build();
            }).collect(Collectors.toList()));
        }

        PurchaseOrder savedPo = poRepo.save(po);

        // 3. تم تعطيل approval workflow للـ PO لأنه معتمد تلقائياً بعد اعتماد المقارنة
        // PO يُنشأ فقط من مقارنة معتمدة، لذلك يُعتبر معتمداً مباشرة
        savedPo.setStatus("Confirmed");  // معتمد مباشرة
        savedPo.setApprovalStatus("Approved");  // معتمد تلقائياً
        poRepo.save(savedPo);
        
        System.out.println("✅ PO " + savedPo.getPoNumber() + " created and auto-approved from comparison " + qc.getComparisonNumber());
    }

    private String generatePONumber() {
        long count = poRepo.count() + 1;
        return String.format("PO-%d", count);
    }
}