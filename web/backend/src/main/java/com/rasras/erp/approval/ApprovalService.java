package com.rasras.erp.approval;

import com.rasras.erp.inventory.GoodsReceiptNoteRepository;
import com.rasras.erp.inventory.GoodsReceiptNote;
import com.rasras.erp.inventory.GRNItem;
import com.rasras.erp.inventory.InventoryService;
import com.rasras.erp.inventory.Warehouse;
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
import com.rasras.erp.sales.StockIssueNote;
import com.rasras.erp.sales.StockIssueNoteItem;
import com.rasras.erp.sales.SalesOrderItem;
import com.rasras.erp.sales.PaymentReceiptRepository;
import com.rasras.erp.sales.CustomerRequestRepository;
import com.rasras.erp.sales.CustomerRequest;
import com.rasras.erp.sales.CustomerRequestDeliveryScheduleRepository;
import com.rasras.erp.sales.CustomerRequestDeliverySchedule;
import com.rasras.erp.employee.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final com.rasras.erp.crm.CustomerRepository customerRepo;
    private final CustomerRequestDeliveryScheduleRepository scheduleRepo;
    private final CustomerRequestRepository customerRequestRepo;
    private final EmployeeRepository employeeRepo;

    @Autowired
    @Lazy
    private com.rasras.erp.sales.SalesInvoiceService salesInvoiceService;

    @Autowired
    @Lazy
    private com.rasras.erp.inventory.ItemService itemService;

    private final com.rasras.erp.finance.ExchangeRateService exchangeRateService;

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
            String roleCode = step.getApproverRole().getRoleCode();
            boolean matches = limits.stream().anyMatch(limit -> {
                if (limit.getRole() == null || roleCode == null || !roleCode.equalsIgnoreCase(limit.getRole().getRoleCode())) {
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

        List<ApprovalRequest> requests = requestRepo
                .findByStatusInWithCurrentStepAndApproverRole(List.of("Pending", "InProgress"));

        // Filter requests: اعتماداً على كود الدور (roleCode) لتفادي اختلاف الـ ID بين الخطوة والمستخدم
        String userRoleCode = user.getRole().getRoleCode();

        List<ApprovalRequest> filteredRequests = requests.stream()
                .filter(req -> {
                    ApprovalWorkflowStep step = req.getCurrentStep();
                    if (step == null)
                        return false;
                    if ("ROLE".equals(step.getApproverType())) {
                        if (step.getApproverRole() == null)
                            return false;
                        // مقارنة بكود الدور حتى لو اختلف RoleID (مثلاً مدير المالي FM)
                        return userRoleCode != null
                                && userRoleCode.equalsIgnoreCase(step.getApproverRole().getRoleCode());
                    } else {
                        return step.getApproverUser() != null
                                && user.getUserId().equals(step.getApproverUser().getUserId());
                    }
                })
                .collect(Collectors.toList());

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
                .actionByUser(getEmployeeArabicName(action.getActionByUser()))
                .actionDate(action.getActionDate())
                .comments(action.getComments())
                .totalAmount(req.getTotalAmount())
                .requestStatus(req.getStatus())
                .build();
    }

    private ApprovalRequestDto mapToDto(ApprovalRequest req) {
        BigDecimal amountToUse = req.getTotalAmount();
        // Enrich total for QuotationComparison when stored as zero (e.g. legacy or fix
        // display)
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
        String currentApproverName = "";
        ApprovalWorkflowStep currentStep = req.getCurrentStep();
        if (currentStep != null) {
            if (currentStep.getApproverUser() != null) {
                currentApproverName = "تم عن طريق " + getEmployeeArabicName(currentStep.getApproverUser());
            } else if (currentStep.getApproverRole() != null) {
                // Return "تم عن طريق [Arabic Role Name]" as specifically requested by the user
                currentApproverName = "تم عن طريق " + currentStep.getApproverRole().getRoleNameAr();
            }
        }

        return ApprovalRequestDto.builder()
                .id(req.getId())
                .workflowName(req.getWorkflow().getWorkflowName())
                .documentType(req.getDocumentType())
                .documentId(req.getDocumentId())
                .documentNumber(req.getDocumentNumber())
                .requestedByName(getEmployeeArabicName(req.getRequestedByUser()))
                .totalAmount(finalAmount)
                .status(req.getStatus())
                .currentStepName(currentStep != null ? currentStep.getStepName() : "")
                .currentApproverName(currentApproverName)
                .requestedDate(req.getRequestedDate())
                .completedDate(req.getCompletedDate())
                .priority("Normal")
                .build();
    }

    private String getEmployeeArabicName(User user) {
        String name = user.getUsername();
        if (user.getEmployeeId() != null) {
            name = employeeRepo.findById(user.getEmployeeId())
                    .map(emp -> emp.getFirstNameAr() + (emp.getLastNameAr() != null && !emp.getLastNameAr().trim().isEmpty() ? " " + emp.getLastNameAr() : ""))
                    .orElse(name);
        }
        return name;
    }

    @Transactional
    public void processAction(Integer requestId, Integer actionByUserId, String actionType, String comments,
            Integer warehouseId, BigDecimal exchangeRate) {
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
            moveToNextStep(request, actionByUserId, exchangeRate);
        } else if ("Rejected".equalsIgnoreCase(actionType)) {
            // ✅ Strategy B: إغلاق الطلب نهائياً (لا إعادة استخدام)
            request.setStatus("Rejected"); // يمكن استخدام "Cancelled" إذا كان متوفراً في enum
            request.setCompletedDate(LocalDateTime.now());
            request.setCurrentStep(null); // ✅ تصفير CurrentStep (يُكتب NULL في CurrentStepID)

            // تحديث الوثيقة المرتبطة (سيعيدها إلى Draft)
            updateLinkedDocumentStatus(request, "Rejected", actionByUserId, exchangeRate);

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
                        moveToNextStep(request, userId, null);
                    } else if ("Rejected".equalsIgnoreCase(actionType)) {
                        // ✅ Strategy B: إغلاق الطلب نهائياً
                        request.setStatus("Rejected");
                        request.setCompletedDate(LocalDateTime.now());
                        request.setCurrentStep(null); // ✅ تصفير CurrentStep
                        updateLinkedDocumentStatus(request, "Rejected", userId, null);
                    }
                    requestRepo.save(request);
                });

        // Also check "Pending" status
        requestRepo.findByDocumentTypeAndDocumentIdAndStatus(docType, docId, "Pending")
                .ifPresent(request -> {
                    if ("Approved".equalsIgnoreCase(actionType)) {
                        handleIntermediateDocumentStatus(request, userId);
                        moveToNextStep(request, userId, null);
                    } else if ("Rejected".equalsIgnoreCase(actionType)) {
                        // ✅ Strategy B: إغلاق الطلب نهائياً
                        request.setStatus("Rejected");
                        request.setCompletedDate(LocalDateTime.now());
                        request.setCurrentStep(null); // ✅ تصفير CurrentStep
                        updateLinkedDocumentStatus(request, "Rejected", userId, null);
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
        } else if ("StockIssueNote".equalsIgnoreCase(type)) {
            stockIssueNoteRepo.findById(id).ifPresent(note -> {
                ApprovalWorkflowStep currentStep = request.getCurrentStep();
                if (currentStep != null && currentStep.getStepNumber() == 1) {
                    // Step 1 (Sales Manager) Approved -> Reserve Stock
                    if (note.getItems() != null) {
                        for (com.rasras.erp.sales.StockIssueNoteItem item : note.getItems()) {
                            inventoryService.reserveStock(item.getItem(), note.getWarehouse(), item.getIssuedQty());
                        }
                    }
                }
            });
        }
    }

    private void moveToNextStep(ApprovalRequest request, Integer userId, BigDecimal exchangeRate) {
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

        // سند الصرف: بعد اعتماد المدير العام (الخطوة 2) نكمل الاعتماد وننفّذ الصرف
        // تلقائياً دون خطوة "صرف الدفعة"
        String docType = request.getDocumentType();
        if (("PaymentVoucher".equalsIgnoreCase(docType) || "PV".equalsIgnoreCase(docType))
                && currentStep != null && currentStep.getStepNumber() != null && currentStep.getStepNumber() == 2) {
            request.setStatus("Approved");
            request.setCompletedDate(LocalDateTime.now());
            updateLinkedDocumentStatus(request, "Approved", userId, exchangeRate);
            return;
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
                    String roleCode = candidate.getApproverRole().getRoleCode();
                    boolean matches = limits.stream().anyMatch(limit -> {
                        if (limit.getRole() == null || roleCode == null || !roleCode.equalsIgnoreCase(limit.getRole().getRoleCode())) {
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
        updateLinkedDocumentStatus(request, "Approved", userId, exchangeRate);
    }

    private void updateLinkedDocumentStatus(ApprovalRequest request, String status, Integer userId,
            BigDecimal userExchangeRate) {
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

                    // Use the passed exchange rate, or fallback to system active rate
                    BigDecimal finalRate;
                    if (userExchangeRate != null && userExchangeRate.compareTo(BigDecimal.ZERO) > 0) {
                        finalRate = userExchangeRate;
                    } else {
                        finalRate = exchangeRateService.getCurrentRate();
                    }

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

                                // Automated Pricing Update based on frontend rate via approval
                                BigDecimal unitCostUsd;
                                boolean isUsd = "USD".equalsIgnoreCase(
                                        grn.getPurchaseOrder() != null ? grn.getPurchaseOrder().getCurrency() : "EGP");
                                if (isUsd) {
                                    unitCostUsd = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;
                                } else {
                                    BigDecimal egpCost = item.getUnitCost() != null ? item.getUnitCost()
                                            : BigDecimal.ZERO;
                                    unitCostUsd = egpCost.divide(finalRate, 4, java.math.RoundingMode.HALF_UP);
                                }

                                // Record purchase price using actual conversion rate
                                itemService.updatePricingFromPurchase(item.getItem().getId(), unitCostUsd, qtyToRecord,
                                        finalRate);
                            }
                        }
                        grn.setStatus("Completed");
                        grn.setUpdatedBy(userId);
                        grn.setUpdatedAt(LocalDateTime.now());
                    }

                    try {
                        supplierInvoiceService.createInvoiceFromGRN(grn.getId(), finalRate);
                    } catch (Exception e) {
                        System.err.println("Error creating automatic invoice from GRN: " + e.getMessage());
                        e.printStackTrace();
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

                    // ✅ ملاحظة: approvalrequest يبقى Rejected/Cancelled في قاعدة البيانات كسجل
                    // تاريخي
                    // CurrentStep يصبح null تلقائياً (من ApprovalService) - هذا طبيعي للطلبات
                    // المُغلقة
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
                    // NEW: Capture rejection comment
                    if (request.getActions() != null && !request.getActions().isEmpty()) {
                        // Get the latest rejection comment
                        request.getActions().stream()
                                .filter(a -> "Rejected".equals(a.getActionType()))
                                .reduce((first, second) -> second) // Get the last rejection action
                                .ifPresent(action -> sq.setRejectedReason(action.getComments()));
                    }
                }
                salesQuotationRepo.save(sq);
            });
        } else if ("DeliveryOrder".equalsIgnoreCase(type)) {
            deliveryOrderRepo.findById(id).ifPresent(order -> {
                order.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    order.setStatus("Completed"); // Mark as fully delivered

                    // Deduct stock upon final delivery approval
                    StockIssueNote note = order.getStockIssueNote();
                    if (note != null && note.getItems() != null) {
                        Warehouse warehouse = note.getWarehouse();
                        Integer approverId = note.getUpdatedBy() != null ? note.getUpdatedBy() : userId;

                        // Check if this delivery order is linked to specific schedules
                        List<CustomerRequestDeliverySchedule> schedules = scheduleRepo
                                .findByDeliveryOrderId(order.getId());
                        java.util.Map<Integer, BigDecimal> scheduleQuantities = new java.util.HashMap<>();
                        if (schedules != null && !schedules.isEmpty()) {
                            for (CustomerRequestDeliverySchedule s : schedules) {
                                if (s.getProductId() != null && s.getQuantity() != null) {
                                    scheduleQuantities.put(s.getProductId(),
                                            scheduleQuantities.getOrDefault(s.getProductId(), BigDecimal.ZERO)
                                                    .add(s.getQuantity()));
                                }
                            }
                        }

                        for (com.rasras.erp.sales.StockIssueNoteItem item : note.getItems()) {
                            BigDecimal qty = item.getIssuedQty();

                            // If we have specific schedules, use their quantities instead of the whole SIN
                            // item quantity
                            if (!scheduleQuantities.isEmpty()) {
                                BigDecimal scheduleQty = scheduleQuantities.get(item.getItem().getId());
                                if (scheduleQty == null || scheduleQty.compareTo(BigDecimal.ZERO) <= 0) {
                                    // This item is NOT in the selected schedules, skip deduction
                                    continue;
                                }
                                qty = scheduleQty;
                            }

                            BigDecimal unitCost = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;

                            // 1. Release reservation
                            inventoryService.releaseReservation(item.getItem(), warehouse, qty);

                            // 2. Actual stock reduction (Deduct from QuantityOnHand)
                            inventoryService.updateStock(
                                    item.getItem().getId(),
                                    warehouse.getId(),
                                    qty,
                                    "OUT",
                                    "ISSUE",
                                    "DeliveryOrder",
                                    order.getId(),
                                    order.getDeliveryOrderNumber(),
                                    unitCost,
                                    approverId);

                            // 3. Update Sales Order delivered quantity if applicable
                            SalesOrderItem soItem = item.getSalesOrderItem();
                            if (soItem != null) {
                                BigDecimal newDelivered = (soItem.getDeliveredQty() != null ? soItem.getDeliveredQty()
                                        : BigDecimal.ZERO).add(qty);
                                soItem.setDeliveredQty(newDelivered);
                            }
                        }

                        // NEW: Automatically create Sales Invoice upon delivery approval
                        try {
                            salesInvoiceService.createInvoiceFromDeliveryOrder(order.getId());
                        } catch (Exception e) {
                            System.err.println("Failed to auto-create Sales Invoice: " + e.getMessage());
                        }
                    }
                } else if ("Rejected".equals(status)) {
                    order.setStatus("Rejected");
                    // Release reservation if the delivery is cancelled
                    StockIssueNote note = order.getStockIssueNote();
                    if (note != null && note.getItems() != null) {
                        for (com.rasras.erp.sales.StockIssueNoteItem item : note.getItems()) {
                            inventoryService.releaseReservation(item.getItem(), note.getWarehouse(),
                                    item.getIssuedQty());
                        }
                    }
                }
                deliveryOrderRepo.save(order);
            });
        } else if ("SalesInvoice".equalsIgnoreCase(type)) {
            salesInvoiceRepo.findById(id).ifPresent(inv -> {
                String oldStatus = inv.getApprovalStatus();
                inv.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    inv.setStatus("Approved");

                    // Update customer balance upon invoice approval
                    if (!"Approved".equals(oldStatus)) {
                        com.rasras.erp.crm.Customer customer = inv.getCustomer();
                        if (customer != null) {
                            BigDecimal amount = inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO;
                            customer.setTotalInvoiced((customer.getTotalInvoiced() != null ? customer.getTotalInvoiced()
                                    : BigDecimal.ZERO).add(amount));
                            customer.setCurrentBalance(
                                    (customer.getCurrentBalance() != null ? customer.getCurrentBalance()
                                            : BigDecimal.ZERO).add(amount));
                            customerRepo.save(customer);
                        }
                    }
                } else if ("Rejected".equals(status)) {
                    inv.setStatus("Rejected");
                }
                salesInvoiceRepo.save(inv);
            });
        } else if ("PaymentReceipt".equalsIgnoreCase(type)) {
            paymentReceiptRepo.findById(id).ifPresent(pr -> {
                String oldStatus = pr.getApprovalStatus();
                pr.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    pr.setStatus("Approved");

                    // Update customer balance upon receipt approval
                    if (!"Approved".equals(oldStatus)) {
                        com.rasras.erp.crm.Customer customer = pr.getCustomer();
                        if (customer != null) {
                            BigDecimal amount = pr.getAmount() != null ? pr.getAmount() : BigDecimal.ZERO;
                            customer.setTotalPaid((customer.getTotalPaid() != null ? customer.getTotalPaid()
                                    : BigDecimal.ZERO).add(amount));
                            customer.setCurrentBalance(
                                    (customer.getCurrentBalance() != null ? customer.getCurrentBalance()
                                            : BigDecimal.ZERO).subtract(amount));
                            customerRepo.save(customer);
                        }
                    }
                } else if ("Rejected".equals(status)) {
                    pr.setStatus("Rejected");
                }
                paymentReceiptRepo.save(pr);
            });
        } else if ("CustomerRequest".equalsIgnoreCase(type)) {
            customerRequestRepo.findById(id).ifPresent(cr -> {
                cr.setStatus(status);
                if ("Approved".equals(status)) {
                    cr.setApprovedAt(LocalDateTime.now());
                }
                customerRequestRepo.save(cr);
            });
        } else if ("StockIssueNote".equalsIgnoreCase(type)) {
            stockIssueNoteRepo.findById(id).ifPresent(note -> {
                note.setStatus(status);
                if ("Approved".equals(status)) {
                    // Final approval of SIN only updates status.
                    // Stock is deducted later upon Delivery Order approval.
                    note.setApprovedDate(LocalDateTime.now());
                    note.setApprovedByUserId(userId);
                } else if ("Rejected".equals(status)) {
                    if (note.getItems() != null) {
                        for (StockIssueNoteItem item : note.getItems()) {
                            inventoryService.releaseReservation(item.getItem(), note.getWarehouse(),
                                    item.getIssuedQty());
                        }
                    }
                }
                stockIssueNoteRepo.save(note);
            });
        }
    }

    private void createGRNFromPO(PurchaseOrder po, Integer userId) {
        // Create GRN with status "Pending Inspection"
        GoodsReceiptNote grn = new GoodsReceiptNote();
        grn.setGrnNumber("GRN-" + (grnRepo.count() + 1));
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
                .map(Warehouse::getId)
                .orElseThrow(() -> new RuntimeException(
                        "لا يوجد مستودعات نشطة. الرجاء إنشاء مستودع أولاً من قسم المخزون → المستودعات."));
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
        savedPo.setStatus("Confirmed"); // معتمد مباشرة
        savedPo.setApprovalStatus("Approved"); // معتمد تلقائياً
        poRepo.save(savedPo);

        System.out.println("✅ PO " + savedPo.getPoNumber() + " created and auto-approved from comparison "
                + qc.getComparisonNumber());
    }

    private String generatePONumber() {
        long count = poRepo.count() + 1;
        return String.format("PO-%d", count);
    }
}