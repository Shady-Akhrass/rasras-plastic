package com.rasras.erp.procurement;

import com.rasras.erp.employee.DepartmentRepository;
import com.rasras.erp.user.UserRepository;
import com.rasras.erp.inventory.GoodsReceiptNoteRepository;
import com.rasras.erp.inventory.QualityInspectionRepository;
import com.rasras.erp.inventory.GoodsReceiptNote;
import com.rasras.erp.inventory.QualityInspection;
import com.rasras.erp.inventory.ItemRepository;
import com.rasras.erp.inventory.UnitRepository;
import com.rasras.erp.approval.ApprovalService;
import com.rasras.erp.approval.ApprovalRequest;
import com.rasras.erp.approval.ApprovalRequestRepository;
import com.rasras.erp.approval.ApprovalWorkflowStep;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseRequisitionService {

<<<<<<< HEAD
    private final PurchaseRequisitionRepository prRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final UnitRepository unitRepository;
    private final com.rasras.erp.approval.ApprovalService approvalService;
    private final com.rasras.erp.approval.ApprovalRequestRepository approvalRequestRepository;
    private final com.rasras.erp.approval.ApprovalActionRepository approvalActionRepository;
=======
        private final PurchaseRequisitionRepository prRepository;
        private final DepartmentRepository departmentRepository;
        private final UserRepository userRepository;
        private final ItemRepository itemRepository;
        private final UnitRepository unitRepository;
        private final com.rasras.erp.approval.ApprovalService approvalService;
        private final PurchaseOrderRepository purchaseOrderRepository;
        private final GoodsReceiptNoteRepository goodsReceiptNoteRepository;
        private final QualityInspectionRepository qualityInspectionRepository;
        private final RFQRepository rfqRepository;
        private final QuotationComparisonRepository quotationComparisonRepository;
        private final SupplierQuotationRepository supplierQuotationRepository;
        private final ApprovalRequestRepository approvalRequestRepository;
>>>>>>> 0ad6525 (Work on procurement and frontend updates)

        @Transactional(readOnly = true)
        public List<PurchaseRequisitionDto> getAllPurchaseRequisitions() {
                return prRepository.findAll().stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public PurchaseRequisitionDto getPurchaseRequisitionById(Integer id) {
                return prRepository.findById(id)
                                .map(this::mapToDto)
                                .orElseThrow(() -> new RuntimeException("Purchase Requisition not found"));
        }

        @Transactional
        public PurchaseRequisitionDto createPurchaseRequisition(PurchaseRequisitionDto dto) {
                PurchaseRequisition pr = new PurchaseRequisition();
                pr.setPrNumber(generatePrNumber());
                pr.setPrDate(LocalDateTime.now());
                pr.setRequestedByDept(departmentRepository.findById(dto.getRequestedByDeptId())
                                .orElseThrow(() -> new RuntimeException("Department not found")));
                pr.setRequestedByUser(userRepository.findById(dto.getRequestedByUserId())
                                .orElseThrow(() -> new RuntimeException("User not found")));

                updatePrFromDto(pr, dto);
                pr.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : 1); // Default to admin if null,
                                                                                      // should be
                                                                                      // from context
                pr.setStatus("Draft");

                PurchaseRequisition savedPr = prRepository.save(pr);

                // Handle Items
                if (dto.getItems() != null && !dto.getItems().isEmpty()) {
                        final PurchaseRequisition finalSavedPr = savedPr;
                        List<PurchaseRequisitionItem> items = dto.getItems().stream()
                                        .map(itemDto -> mapItemToEntity(itemDto, finalSavedPr))
                                        .collect(Collectors.toList());
                        savedPr.setItems(items);
                        savedPr = prRepository.save(savedPr);
                }

                return mapToDto(savedPr);
        }

        @Transactional
        public PurchaseRequisitionDto updatePurchaseRequisition(Integer id, PurchaseRequisitionDto dto) {
                PurchaseRequisition pr = prRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("PR not found"));

                if (!"Draft".equals(pr.getStatus())) {
                        throw new RuntimeException("Cannot edit PR that is not in Draft status");
                }

                updatePrFromDto(pr, dto);

                // Update Items relationship - clear and recreate for simplicity in this MVP
                if (pr.getItems() != null) {
                        pr.getItems().clear();
                } else {
                        pr.setItems(new ArrayList<>());
                }

                if (dto.getItems() != null) {
                        final PurchaseRequisition finalPr = pr;
                        List<PurchaseRequisitionItem> newItems = dto.getItems().stream()
                                        .map(itemDto -> mapItemToEntity(itemDto, finalPr))
                                        .collect(Collectors.toList());
                        pr.getItems().addAll(newItems);
                }

                return mapToDto(prRepository.save(pr));
        }

        @Transactional
        public PurchaseRequisitionDto submitForApproval(Integer id) {
                PurchaseRequisition pr = prRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("PR not found"));

                if (!"Draft".equals(pr.getStatus())) {
                        throw new RuntimeException("PR must be in Draft status to submit");
                }

                pr.setStatus("Pending");
                PurchaseRequisition saved = prRepository.save(pr);

                // Initiate approval workflow
                approvalService.initiateApproval("PR_APPROVAL", "PurchaseRequisition", saved.getId(),
                                saved.getPrNumber(), saved.getRequestedByUser().getUserId(),
                                saved.getTotalEstimatedAmount());

                return mapToDto(saved);
        }

<<<<<<< HEAD
        pr.setStatus("Pending");
        PurchaseRequisition saved = prRepository.save(pr);

        // Initiate approval workflow
        approvalService.initiateApproval("PR_APPROVAL", "PurchaseRequisition", saved.getId(),
                saved.getPrNumber(), saved.getRequestedByUser().getUserId(),
                saved.getTotalEstimatedAmount());

        return mapToDto(saved);
    }

    @Transactional
    public void deletePurchaseRequisition(Integer id) {
        PurchaseRequisition pr = prRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "عرض الشراء غير موجود"));
        if (!"Draft".equals(pr.getStatus()) && !"Pending".equals(pr.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "لا يمكن حذف طلب الشراء إلا إذا كان بحالة مسودة أو قيد الانتظار (قبل الاعتماد). الحالة الحالية: " + pr.getStatus());
        }
        // حذف طلب الاعتماد المرتبط ليختفي من صفحة الاعتمادات
        List<com.rasras.erp.approval.ApprovalRequest> approvalRequests = approvalRequestRepository
                .findByDocumentTypeAndDocumentId("PurchaseRequisition", pr.getId());
        for (var ar : approvalRequests) {
            approvalActionRepository.findByRequestIdOrderByActionDateDesc(ar.getId())
                    .forEach(approvalActionRepository::delete);
            approvalRequestRepository.delete(ar);
        }
        prRepository.delete(pr);
    }

    @Transactional(readOnly = true)
    public PRLifecycleDto getPRLifecycle(Integer prId) {
        PurchaseRequisition pr = prRepository.findById(prId)
                .orElseThrow(() -> new RuntimeException("PR not found"));

        PRLifecycleDto.PRLifecycleDtoBuilder builder = PRLifecycleDto.builder();

        // 1. Requisition Stage
        builder.requisition(PRLifecycleDto.RequisitionStage.builder()
                .status(pr.getStatus())
                .date(pr.getPrDate())
                .prNumber(pr.getPrNumber())
                .build());

        // 2. Approval Stage
        builder.approval(getApprovalStage(prId));

        // 3. Sourcing Stage (RFQs & Comparisons)
        builder.sourcing(getSourcingStage(prId));

        // 4. Ordering Stage (POs)
        List<PurchaseOrder> pos = purchaseOrderRepository.findByPrId(prId);
        builder.ordering(PRLifecycleDto.OrderingStage.builder()
                .status(pos.isEmpty() ? "None"
                        : pos.stream().anyMatch(po -> "Approved".equals(po.getApprovalStatus())) ? "Approved"
                                : "Pending")
                .poNumbers(pos.stream().map(PurchaseOrder::getPoNumber).collect(Collectors.toList()))
                .lastPoDate(pos.stream().map(PurchaseOrder::getPoDate).max(LocalDateTime::compareTo).orElse(null))
                .build());

        // 5. Receiving Stage (GRNs via POs)
        List<GoodsReceiptNote> grns = pos.stream()
                .flatMap(po -> goodsReceiptNoteRepository.findByPurchaseOrder_Id(po.getId()).stream())
                .collect(Collectors.toList());
        builder.receiving(PRLifecycleDto.ReceivingStage.builder()
                .status(grns.isEmpty() ? "None"
                        : grns.stream().anyMatch(g -> "Completed".equals(g.getStatus())) ? "Completed" : "In Progress")
                .grnNumbers(grns.stream().map(GoodsReceiptNote::getGrnNumber).collect(Collectors.toList()))
                .lastGrnDate(grns.stream().map(GoodsReceiptNote::getGrnDate).max(LocalDateTime::compareTo).orElse(null))
                .build());

        // 6. Quality Stage (Inspections via GRNs)
        List<QualityInspection> inspections = grns.stream()
                .flatMap(g -> qualityInspectionRepository.findByReferenceTypeAndReferenceId("GRN", g.getId()).stream())
                .collect(Collectors.toList());
        builder.quality(PRLifecycleDto.QualityStage.builder()
                .status(inspections.isEmpty() ? "None"
                        : inspections.stream().allMatch(i -> "Passed".equals(i.getOverallResult())) ? "Completed"
                                : "Partial")
                .result(inspections.isEmpty() ? "N/A"
                        : inspections.stream().anyMatch(i -> "Failed".equals(i.getOverallResult())) ? "Failed"
                                : "Passed")
                .inspectionDate(inspections.stream().map(QualityInspection::getInspectionDate)
                        .max(LocalDateTime::compareTo).orElse(null))
                .build());

        return builder.build();
    }

    private PRLifecycleDto.ApprovalStage getApprovalStage(Integer prId) {
        return approvalRequestRepository.findByDocumentTypeAndDocumentId("PurchaseRequisition", prId)
                .stream()
                .findFirst()
                .map(req -> PRLifecycleDto.ApprovalStage.builder()
                        .status(req.getStatus())
                        .currentStep(req.getCurrentStep() != null ? req.getCurrentStep().getStepName() : "N/A")
                        .lastActionDate(req.getCompletedDate()) // Using completedDate as a fallback for last action
                        .build())
                .orElse(PRLifecycleDto.ApprovalStage.builder().status("Draft").build());
    }

    private PRLifecycleDto.SourcingStage getSourcingStage(Integer prId) {
        List<RequestForQuotation> rfqs = rfqRepository.findByPurchaseRequisitionId(prId);
        List<QuotationComparison> comparisons = quotationComparisonRepository.findByPurchaseRequisitionId(prId);

        String status = "None";
        if (!comparisons.isEmpty()) {
            status = comparisons.stream().anyMatch(c -> "Approved".equals(c.getApprovalStatus())) ? "Completed"
                    : "In Progress";
        } else if (!rfqs.isEmpty()) {
            status = "In Progress";
=======
        @Transactional
        public void deletePurchaseRequisition(Integer id) {
                PurchaseRequisition pr = prRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "عرض الشراء غير موجود"));
                if (!"Draft".equals(pr.getStatus())) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "لا يمكن حذف عرض الشراء إلا إذا كان بحالة مسودة. الحالة الحالية: "
                                                        + pr.getStatus());
                }
                prRepository.delete(pr);
>>>>>>> 0ad6525 (Work on procurement and frontend updates)
        }

        @Transactional(readOnly = true)
        public PRLifecycleDto getPRLifecycle(Integer prId) {
                PurchaseRequisition pr = prRepository.findById(prId)
                                .orElseThrow(() -> new RuntimeException("PR not found"));

                PRLifecycleDto.PRLifecycleDtoBuilder builder = PRLifecycleDto.builder();

<<<<<<< HEAD
    private String generatePrNumber() {
        long n = prRepository.count() + 1;
        return "PR-" + n;
    }
=======
                // 1. Requisition Stage
                builder.requisition(PRLifecycleDto.RequisitionStage.builder()
                                .status(pr.getStatus())
                                .date(pr.getPrDate())
                                .prNumber(pr.getPrNumber())
                                .build());
>>>>>>> 0ad6525 (Work on procurement and frontend updates)

                // 2. Approval Stage
                builder.approval(getApprovalStage(prId));

                // 3. Sourcing Stage (RFQs & Comparisons)
                builder.sourcing(getSourcingStage(prId));

                // 4. Ordering Stage (POs)
                List<PurchaseOrder> pos = purchaseOrderRepository.findByPrId(prId);
                builder.ordering(PRLifecycleDto.OrderingStage.builder()
                                .status(pos.isEmpty() ? "None"
                                                : pos.stream().anyMatch(po -> "Approved".equals(po.getApprovalStatus()))
                                                                ? "Approved"
                                                                : "Pending")
                                .poNumbers(pos.stream().map(PurchaseOrder::getPoNumber).collect(Collectors.toList()))
                                .lastPoDate(pos.stream().map(PurchaseOrder::getPoDate).max(LocalDateTime::compareTo)
                                                .orElse(null))
                                .build());

                // 5. Receiving Stage (GRNs via POs)
                List<GoodsReceiptNote> grns = pos.stream()
                                .flatMap(po -> goodsReceiptNoteRepository.findByPurchaseOrder_Id(po.getId()).stream())
                                .collect(Collectors.toList());
                builder.receiving(PRLifecycleDto.ReceivingStage.builder()
                                .status(grns.isEmpty() ? "None"
                                                : grns.stream().anyMatch(g -> "Completed".equals(g.getStatus()))
                                                                ? "Completed"
                                                                : "In Progress")
                                .grnNumbers(grns.stream().map(GoodsReceiptNote::getGrnNumber)
                                                .collect(Collectors.toList()))
                                .lastGrnDate(grns.stream().map(GoodsReceiptNote::getGrnDate)
                                                .max(LocalDateTime::compareTo).orElse(null))
                                .build());

                // 6. Quality Stage (Inspections via GRNs)
                List<QualityInspection> inspections = grns.stream()
                                .flatMap(g -> qualityInspectionRepository
                                                .findByReferenceTypeAndReferenceId("GRN", g.getId()).stream())
                                .collect(Collectors.toList());
                builder.quality(PRLifecycleDto.QualityStage.builder()
                                .status(inspections.isEmpty() ? "None"
                                                : inspections.stream()
                                                                .allMatch(i -> "Passed".equals(i.getOverallResult()))
                                                                                ? "Completed"
                                                                                : "Partial")
                                .result(inspections.isEmpty() ? "N/A"
                                                : inspections.stream().anyMatch(
                                                                i -> "Failed".equals(i.getOverallResult())) ? "Failed"
                                                                                : "Passed")
                                .inspectionDate(inspections.stream().map(QualityInspection::getInspectionDate)
                                                .max(LocalDateTime::compareTo).orElse(null))
                                .build());

                return builder.build();
        }

        private PRLifecycleDto.ApprovalStage getApprovalStage(Integer prId) {
                return approvalRequestRepository.findByDocumentTypeAndDocumentId("PurchaseRequisition", prId)
                                .stream()
                                .findFirst()
                                .map(req -> PRLifecycleDto.ApprovalStage.builder()
                                                .status(req.getStatus())
                                                .currentStep(req.getCurrentStep() != null
                                                                ? req.getCurrentStep().getStepName()
                                                                : "N/A")
                                                .lastActionDate(req.getCompletedDate()) // Using completedDate as a
                                                                                        // fallback for last action
                                                .build())
                                .orElse(PRLifecycleDto.ApprovalStage.builder().status("Draft").build());
        }

        private PRLifecycleDto.SourcingStage getSourcingStage(Integer prId) {
                List<RequestForQuotation> rfqs = rfqRepository.findByPurchaseRequisitionId(prId);
                List<QuotationComparison> comparisons = quotationComparisonRepository.findByPurchaseRequisitionId(prId);

                String status = "None";
                if (!comparisons.isEmpty()) {
                        status = comparisons.stream().anyMatch(c -> "Approved".equals(c.getApprovalStatus()))
                                        ? "Completed"
                                        : "In Progress";
                } else if (!rfqs.isEmpty()) {
                        status = "In Progress";
                }

                return PRLifecycleDto.SourcingStage.builder()
                                .status(status)
                                .rfqCount(rfqs.size())
                                .quotationCount((int) rfqs.stream()
                                                .flatMap(r -> supplierQuotationRepository.findByRfqId(r.getId())
                                                                .stream())
                                                .count())
                                .comparisonStatus(
                                                comparisons.isEmpty() ? "None" : comparisons.get(0).getApprovalStatus())
                                .build();
        }

        private void updatePrFromDto(PurchaseRequisition pr, PurchaseRequisitionDto dto) {
                pr.setRequiredDate(dto.getRequiredDate());
                pr.setPriority(dto.getPriority());
                pr.setTotalEstimatedAmount(dto.getTotalEstimatedAmount());
                pr.setJustification(dto.getJustification());
                pr.setNotes(dto.getNotes());
        }

        private String generatePrNumber() {
                // Simple generation: PR-YYYYMMDD-XXXX
                return "PR-" + System.currentTimeMillis(); // Placeholder for better logic
        }

        private PurchaseRequisitionDto mapToDto(PurchaseRequisition pr) {
                return PurchaseRequisitionDto.builder()
                                .id(pr.getId())
                                .prNumber(pr.getPrNumber())
                                .prDate(pr.getPrDate())
                                .requestedByDeptId(pr.getRequestedByDept().getDepartmentId())
                                .requestedByDeptName(pr.getRequestedByDept().getDepartmentNameAr())
                                .requestedByUserId(pr.getRequestedByUser().getUserId())
                                .requestedByUserName(pr.getRequestedByUser().getUsername())
                                .requiredDate(pr.getRequiredDate())
                                .priority(pr.getPriority())
                                .status(pr.getStatus())
                                .totalEstimatedAmount(pr.getTotalEstimatedAmount())
                                .justification(pr.getJustification())
                                .notes(pr.getNotes())
                                .createdAt(pr.getCreatedAt())
                                .createdBy(pr.getCreatedBy())
                                .items(pr.getItems() != null
                                                ? pr.getItems().stream().map(this::mapItemToDto)
                                                                .collect(Collectors.toList())
                                                : new ArrayList<>())
                                .hasActiveOrders(!purchaseOrderRepository.findByPrId(pr.getId()).isEmpty())
                                .hasComparison(!quotationComparisonRepository.findByPurchaseRequisitionId(pr.getId())
                                                .isEmpty())
                                .build();
        }

        private PurchaseRequisitionItemDto mapItemToDto(PurchaseRequisitionItem item) {
                return PurchaseRequisitionItemDto.builder()
                                .id(item.getId())
                                .prId(item.getPurchaseRequisition().getId())
                                .itemId(item.getItem().getId())
                                .itemNameAr(item.getItem().getItemNameAr())
                                .itemNameEn(item.getItem().getItemNameEn())
                                .itemCode(item.getItem().getItemCode())
                                .requestedQty(item.getRequestedQty())
                                .unitId(item.getUnit().getId())
                                .unitName(item.getUnit().getUnitNameAr())
                                .estimatedUnitPrice(item.getEstimatedUnitPrice())
                                .estimatedTotalPrice(item.getEstimatedTotalPrice())
                                .requiredDate(item.getRequiredDate())
                                .specifications(item.getSpecifications())
                                .notes(item.getNotes())
                                .build();
        }

        private PurchaseRequisitionItem mapItemToEntity(PurchaseRequisitionItemDto dto, PurchaseRequisition pr) {
                return PurchaseRequisitionItem.builder()
                                .purchaseRequisition(pr)
                                .item(itemRepository.findById(dto.getItemId())
                                                .orElseThrow(() -> new RuntimeException("Item not found")))
                                .requestedQty(dto.getRequestedQty())
                                .unit(unitRepository.findById(dto.getUnitId())
                                                .orElseThrow(() -> new RuntimeException("Unit not found")))
                                .estimatedUnitPrice(dto.getEstimatedUnitPrice())
                                .estimatedTotalPrice(dto.getEstimatedTotalPrice())
                                .requiredDate(dto.getRequiredDate())
                                .specifications(dto.getSpecifications())
                                .notes(dto.getNotes())
                                .build();
        }
}
