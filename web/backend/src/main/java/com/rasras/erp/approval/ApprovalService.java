package com.rasras.erp.approval;

import com.rasras.erp.inventory.GoodsReceiptNoteRepository;
import com.rasras.erp.inventory.GRNItem;
import com.rasras.erp.inventory.InventoryService;
import com.rasras.erp.procurement.PurchaseOrderRepository;
import com.rasras.erp.procurement.PurchaseRequisitionRepository;
import com.rasras.erp.supplier.SupplierRepository;
import com.rasras.erp.user.User;
import com.rasras.erp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    private final PurchaseOrderRepository poRepo;
    private final SupplierRepository supplierRepo;
    private final PurchaseRequisitionRepository prRepo;
    private final GoodsReceiptNoteRepository grnRepo;
    private final com.rasras.erp.supplier.SupplierInvoiceService supplierInvoiceService;
    private final InventoryService inventoryService;

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
                .currentStep(steps.get(0)) // Start at first step
                .build();

        return requestRepo.save(request);
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

    private ApprovalRequestDto mapToDto(ApprovalRequest req) {
        return ApprovalRequestDto.builder()
                .id(req.getId())
                .workflowName(req.getWorkflow().getWorkflowName())
                .documentType(req.getDocumentType())
                .documentId(req.getDocumentId())
                .documentNumber(req.getDocumentNumber())
                .requestedByName(req.getRequestedByUser().getUsername()) // or e.g. getEmployee().getFullName()
                .totalAmount(req.getTotalAmount())
                .status(req.getStatus())
                .currentStepName(req.getCurrentStep() != null ? req.getCurrentStep().getStepName() : "")
                .requestedDate(req.getRequestedDate())
                .completedDate(req.getCompletedDate())
                .priority("Normal") // Default, logic can be added later
                .build();
    }

    @Transactional
    public void processAction(Integer requestId, Integer actionByUserId, String actionType, String comments) {
        ApprovalRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User actor = userRepo.findById(actionByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
            moveToNextStep(request, actionByUserId);
        } else if ("Rejected".equalsIgnoreCase(actionType)) {
            request.setStatus("Rejected");
            request.setCompletedDate(LocalDateTime.now());
            updateLinkedDocumentStatus(request, "Rejected", actionByUserId);
        }

        requestRepo.save(request);
    }

    private void moveToNextStep(ApprovalRequest request, Integer userId) {
        List<ApprovalWorkflowStep> steps = stepRepo
                .findByWorkflowWorkflowIdOrderByStepNumberAsc(request.getWorkflow().getWorkflowId());

        int currentIdx = -1;
        for (int i = 0; i < steps.size(); i++) {
            if (steps.get(i).getStepId().equals(request.getCurrentStep().getStepId())) {
                currentIdx = i;
                break;
            }
        }

        if (currentIdx != -1 && currentIdx < steps.size() - 1) {
            // Move to next step
            request.setCurrentStep(steps.get(currentIdx + 1));
            request.setStatus("InProgress");
        } else {
            // No more steps, fully approved
            request.setStatus("Approved");
            request.setCompletedDate(LocalDateTime.now());
            updateLinkedDocumentStatus(request, "Approved", userId);
        }
    }

    private void updateLinkedDocumentStatus(ApprovalRequest request, String status, Integer userId) {
        String type = request.getDocumentType();
        Integer id = request.getDocumentId();

        if ("PurchaseOrder".equalsIgnoreCase(type)) {
            poRepo.findById(id).ifPresent(po -> {
                po.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    po.setStatus("Confirmed");
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
            grnRepo.findById(id).ifPresent(grn -> {
                grn.setApprovalStatus(status);
                if ("Approved".equals(status)) {
                    grn.setStatus("Completed");
                    supplierInvoiceService.createInvoiceFromGRN(grn.getId());

                    // Auto-update stock levels
                    if (grn.getItems() != null) {
                        for (GRNItem item : grn.getItems()) {
                            inventoryService.updateStock(
                                    item.getItem().getId(),
                                    grn.getWarehouseId(),
                                    item.getAcceptedQty() != null ? item.getAcceptedQty() : java.math.BigDecimal.ZERO,
                                    "IN",
                                    "GRN",
                                    "GoodsReceiptNote",
                                    grn.getId(),
                                    grn.getGrnNumber(),
                                    item.getUnitCost(),
                                    userId);
                        }
                    }
                }
                grnRepo.save(grn);
            });
        }
    }
}
